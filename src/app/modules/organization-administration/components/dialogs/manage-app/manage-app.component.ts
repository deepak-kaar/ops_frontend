import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OrganizationAdministrationService } from 'src/app/modules/organization-administration/organization-administration.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { FileUpload } from 'primeng/fileupload';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, forkJoin } from 'rxjs';
import { NetworkStatusService } from 'src/app/core/utils/network-status.service';
import { OfflineQueueService } from 'src/app/core/utils/offline-queue.service';
import { ConfigAdministrationService } from 'src/app/modules/config-administration/services/config-administration.service';

/**
 * @component
 * @description
 * The `ManageAppComponent` is responsible for managing application in the organization administration module.
 * This is a dialog component invoked from AppsManager Component , at the time of invocation the data for this component and mode is supplied
 * It works based on the mode.
 * If the mode is create it used to create an app by accepting the values entered by the user with the help of app form.
 * If the mode is edit it used to edit an existing app by patching the existing app value to the app form from the value passed while invocation.
 */
@Component({
  selector: 'app-manage-app',
  standalone: false,
  templateUrl: './manage-app.component.html',
  styleUrl: './manage-app.component.css'
})
export class ManageAppComponent implements OnInit, OnDestroy {
  /**
   * @property {FormGroup} appForm - Form group that holds application form controls.
   */
  appForm: FormGroup;

  /**
   * @property {any[]} classifications - Stores a list of classifications (potentially for dropdown selection).
   */
  classifications: string[] = [];

  /**
 * @property {any[]} activeStatus - Stores a list of active status (potentially for dropdown selection).
 */
  activeStatus: any[] = [
    {
      name: 'Active',
      value: 'active'
    },
    {
      name: 'Inactive',
      value: 'inactive'
    }
  ];

  /**
 * @property {any[]} adminRoles - Stores a list of adminRoles (potentially for dropdown selection).
 */
  adminRoles: any[] = [];

  /**
   * @property {any} index - Stores an index value used for file operations or list selections.
   */
  index: any;

  /**
   * @property {any[]} files - Stores the list of uploaded files.
   */
  files: any[] = [];

  /**
   * @property {number} totalSize - The total size of uploaded files.
   */
  totalSize: number = 0;

  /**
   * @property {number} totalSizePercent - Percentage representation of the uploaded file size.
   */
  totalSizePercent: number = 0;

  /**
   * @property {any} uploadedFile - Stores the last uploaded file reference.
   */
  uploadedFile: any;

  /**
   * @property {string | ArrayBuffer | null} imageUrl - Stores the preview URL of the uploaded image.
   */
  imageUrl: string | ArrayBuffer | null = null;

  /**
   * @property {boolean} isExistingImage - Indicates whether an existing image is already set.
   */
  isExistingImage: boolean = false;

  /**
   * @property {FileUpload} fileUpload - Reference to the PrimeNG FileUpload component.
   */
  @ViewChild('fileUpload')
  fileUpload?: FileUpload;

  @ViewChild('appLogoUploader') appLogoUploader?: FileUpload;

  imagePreviewUrl: string | null = null;
  selectedImageFile: File | null = null;
  selectedImageName: string | null = null;
  imageRemoved = false;

  readonly maxImageSizeBytes = 1 * 1024 * 1024;
  readonly allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];

  /**
   * @property {FormData} appData - stores the app information as formdata.
   */
  // appData = new FormData()

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
 * @property {string} mode - stores the appId when the mode is edit.
 */
  appId: string = '';

  /**
 * @property {boolean} isOnline - Indicates current network status (true = online, false = offline).
 */
  isOnline: boolean = navigator.onLine;

  /**
   * @property {Subscription} sub - Holds the subscription to the network status observable.
   */
  private sub!: Subscription;

  constructor(
    public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private orgAdminService: OrganizationAdministrationService,
    private config: PrimeNG,
    private messageService: MessageService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private networkService: NetworkStatusService,
    private offlineQueueService: OfflineQueueService,
    private configAdministrationService: ConfigAdministrationService,
  ) {
    this.appForm = this.fb.group({
      appName: new FormControl<string>('', [Validators.required]),
      appDescription: new FormControl<string>('', [Validators.required]),
      appAdminRole: new FormControl<string>(''),
      appClassification: new FormControl<string>(''),
      appOwner: new FormControl<string>(''),
      appContact: new FormControl<string>(''),
      appStatus: new FormControl<string>('')
    });

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.appId = this.dialogConfig.data?.appData?.appId;
      this.patchValue(this.dialogConfig.data?.appData);
    }
  }

  ngOnInit(): void {
    this.getRoles();
    this.sub = this.networkService.getNetworkStatus().subscribe(status => {
      this.isOnline = status;
    });

    this.initExistingImagePreview();
  }

  private initExistingImagePreview(): void {
    const app = this.dialogConfig?.data?.appData;
    if (!app) return;

    if (app.appLogoDataUrl) {
      this.imagePreviewUrl = app.appLogoDataUrl;
      this.selectedImageName = app.appLogoName || 'Existing image';
      return;
    }

    if (app.appLogo && app.appLogoType) {
      this.imagePreviewUrl = `data:${app.appLogoType};base64,${app.appLogo}`;
      this.selectedImageName = app.appLogoName || 'Existing image';
    }
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!this.validateImage(file)) {
      input.value = '';
      return;
    }

    this.selectedImageFile = file;
    this.selectedImageName = file.name;
    this.imageRemoved = false;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreviewUrl = null;
    this.selectedImageFile = null;
    this.selectedImageName = null;
    this.imageRemoved = true;

    if (this.appLogoUploader) {
      this.appLogoUploader.clear();
    }
  }

  private validateImage(file: File): boolean {
    if (!this.allowedImageTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid image',
        detail: 'Only PNG, JPG and WEBP files are allowed.'
      });
      return false;
    }

    if (file.size > this.maxImageSizeBytes) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Image too large',
        detail: 'Maximum allowed size is 1 MB.'
      });
      return false;
    }

    return true;
  }

  /**
   * Lifecycle hook that is called just before the component is destroyed.
   * Unsubscribes from the network status subscription to prevent memory leaks.
   * @returns {void} - returns nothing i.e. (void)
   */
  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  /**
   * Handles file selection and executes a callback function.
   * @param {any} event - The file selection event.
   * @param {() => void} callback - A callback function to execute after file selection.
   * @returns {void} - returns nothing (i.e) void
   */
  choose(event: any, callback: () => void): void {
    callback();
  }

  /**
  * Clears the selected image and resets file-related properties.
  * @returns {void} - returns nothing (i.e) void
  */
  clearImage(): void {
    if (this.fileUpload) {
      this.fileUpload.files = [];
      this.fileUpload.clear();
    }
    this.files = [];
    this.totalSizePercent = 0;
  }




  /**
   * Handles file removal for templating.
   * @param {any} event - The file removal event.
   * @param {any} file - The file to be removed.
   * @param {Function} removeFileCallback - Callback function for file removal.
   * @returns {void} - returns nothing (i.e) void
   * @param {any} index - Index of the file to be removed.
   */
  onRemoveTemplatingFile(event: any, file: any, removeFileCallback: any, index: any): void {
    removeFileCallback(event, index);
    this.files = []
    this.totalSizePercent = 0;
  }

  /**
   * Clears the file upload template.
   * @param {() => void} clear - Callback function to clear the file upload component.
   */
  onClearTemplatingUpload(clear: () => void) {
    clear();
    this.totalSize = 0;
    this.totalSizePercent = 0;
  }

  /**
 * Handles file upload for a templated file upload component.
 * @param {any} fileUpload - The file upload component reference.
 * @returns {void} - returns nothing (i.e) void
 */
  onTemplatedUpload(fileUpload: any): void {
    // this.spinner.show();
    this.totalSizePercent = 100;
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
    // this.spinner.show();
    const reader = new FileReader();
    const file = this.files[0];
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
      this.files = [];
      this.totalSize = 0;
      this.totalSizePercent = 0;
      fileUpload?.clear();
    };
    reader.readAsDataURL(file);
    fileUpload?.clear();
  }

  /**
  * Handles file selection and validates the number of selected files.
  * @param {any} event - The file selection event containing the list of selected files.
  * @returns {void} - returns nothing (i.e) void
  */
  onSelectedFiles(event: any): void {
    if (this.files.length > 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "You can't select more than one image", life: 3000 });
    }
    else if (this.isExistingImage) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please clear the existing Image", life: 3000 });
    }
    else {
      this.files = event.currentFiles;
      this.files.forEach((file: any) => {
        this.totalSize += parseInt(this.formatSize(file.size));
      });
      this.totalSizePercent = 100;
    }

  }

  /**
  * Triggers the file upload process using a callback function.
  * @param {() => void} callback - Callback function to execute after initiating the upload.
  * @returns {void} - returns nothing (i.e) void
  */
  uploadEvent(callback: () => void): void {
    callback();
  }


  /**
  * Formats the size of the uploaded image using primeng Config and Math functions
  * Takes the bytes as input and convert it into string
  * @param {number} bytes - File size in bytes
  * @returns {string} - return the formatted file size in readable format
  */
  formatSize(bytes: number): string {
    const k = 1024;
    const dm = 1;
    const sizes: any = this.config.translation.fileSizeTypes;
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
  }


  /**
   * Changes the existing Image flag to false from true
   * @returns {void} - returns nothing (i.e) void
   */
  clearExisting(): void {
    this.isExistingImage = false;
  }

  /**
  * Fetches the list of applications from the backend and assigns it to the `roles` array.
  * calls the show method from spinner service to show the loader before getRoles method and hides after fetching.
  * @returns {void} - returns nothing i.e(void)
  */
  getRoles(): void {
    this.spinner.show();

    forkJoin({
      rolesRes: this.orgAdminService.getRoles({ roleLevel: 'OpsInsight', roleLevelId: null }),
      configRes: this.configAdministrationService.getConfig()
    }).subscribe({
      next: ({ rolesRes, configRes }: any) => {
        this.adminRoles = Array.isArray(rolesRes?.roles) ? rolesRes.roles : [];

        const configList = this.extractConfigList(configRes);
        this.classifications = this.extractClassificationOptions(configList);

        this.spinner.hide();
      },
      error: () => {
        this.adminRoles = [];
        this.classifications = [];
        this.spinner.hide();
      }
    });
  }

  private extractClassificationOptions(configList: any[]): string[] {
    const classificationConfigs = configList.filter((cfg: any) =>
      String(cfg?.configName ?? cfg?.ConfigName ?? '').trim().toUpperCase() === 'DATA_CLASSIFICATION'
    );

    const values = classificationConfigs.flatMap((cfg: any) =>
      this.parseClassificationConfigValue(cfg?.configValue ?? cfg?.ConfigValue)
    );

    return [...new Set(values)];
  }

  private parseClassificationConfigValue(raw: unknown): string[] {
    if (!raw) return [];

    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

      if (Array.isArray(parsed)) {
        return parsed.map(v => String(v).trim()).filter(Boolean);
      }

      if (parsed && typeof parsed === 'object') {
        return Object.values(parsed as Record<string, unknown>)
          .map(v => String(v).trim())
          .filter(Boolean);
      }

      return [];
    } catch {
      return [];
    }
  }

  private extractConfigList(res: any): any[] {
    if (Array.isArray(res?.Config)) return res.Config;
    if (Array.isArray(res?.config)) return res.config;
    if (Array.isArray(res?.configs)) return res.configs;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.result)) return res.result;
    if (Array.isArray(res)) return res;
    return [];
  }

  /**
 * Validates the appForm.
 * If its valid and the mode is create, calls the createApp method from org Admin service to create an app by passing the appForm Value.
 * If its valid and the mode is edit, calls the editApp method from org Admin service to edit an app by passing the appForm Value.
 * It its not valid shows a toast message with error
 * @returns {void} - returns nothing (i.e) void
 */
  createApp(): void {
    if (this.appForm.invalid) {
      this.appForm.markAllAsTouched();
      return;
    }

    const payload = this.buildAppFormData(false);

    this.orgAdminService.createApp(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Application created successfully.'
        });
        this.ref.close(true);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create application.'
        });
      }
    });
  }

  /**
   * Patches the application data to the appForm
   * @param {any} app - application data
   * @returns {void} - returns nothing (i.e) void
   */
  patchValue(app: any): void {
    this.appForm.patchValue({
      appName: app.appName,
      appDescription: app.appDescription,
      appAdminRole: app.adminRole,
      appClassification: app.appClassification,
      appOwner: app.appOwner,
      appContact: app.appContact,
      appStatus: app.appStatus
    });

    this.isExistingImage = !!(app?.appLogo || app?.appLogoDataUrl);
  }

  /**
   * Builds form data for create/update.
   */
  private buildAppFormData(isEdit: boolean): FormData {
    const formData = new FormData();

    if (isEdit) {
      formData.append('appId', this.appId);
      formData.append('appStatus', this.appForm.get('appStatus')?.value ?? '');

      // audit fields
      formData.append('modifiedBy', this.getCurrentUserName());
      formData.append('modifiedOn', new Date().toISOString()); // use modifiedAt if backend expects that key
    }

    formData.append('appName', this.appForm.get('appName')?.value ?? '');
    formData.append('appDescription', this.appForm.get('appDescription')?.value ?? '');
    formData.append('appClassification', this.appForm.get('appClassification')?.value ?? '');
    formData.append('adminRole', this.appForm.get('appAdminRole')?.value ?? '');
    formData.append('appOwner', this.appForm.get('appOwner')?.value ?? '');
    formData.append('appContact', this.appForm.get('appContact')?.value ?? '');

    if (this.selectedImageFile) {
      formData.append('appLogo', this.selectedImageFile, this.selectedImageFile.name);
    } else if (isEdit && this.imageRemoved) {
      formData.append('removeLogo', 'true');
    }

    return formData;
  }

  /**
   * Closes dialog on cancel.
   */
  onDialogCancel(): void {
    this.ref.close({ status: false, cancelled: true });
  }

  updateApp(): void {
    if (this.appForm.invalid) {
      this.appForm.markAllAsTouched();
      return;
    }

    const payload = this.buildAppFormData(true);

    // updateApp expects ONE arg
    this.orgAdminService.updateApp(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Application updated successfully.'
        });
        this.ref.close(true);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update application.'
        });
      }
    });
  }

  private getCurrentUserName(): string {
    return localStorage.getItem('userName')
      || localStorage.getItem('username')
      || sessionStorage.getItem('userName')
      || 'system';
}

saveApp(): void {
  if (this.mode === 'edit') {
    this.updateApp();
  } else {
    this.createApp();
  }
}

}