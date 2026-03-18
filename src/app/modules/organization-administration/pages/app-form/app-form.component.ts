import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, forkJoin } from 'rxjs';
import { ConfigAdministrationService } from 'src/app/modules/config-administration/services/config-administration.service';
import { OrganizationAdministrationService } from 'src/app/modules/organization-administration/organization-administration.service';
import { NetworkStatusService } from 'src/app/core/utils/network-status.service';

@Component({
  selector: 'app-app-form-page',
  standalone: false,
  templateUrl: './app-form.component.html',
  styleUrl: './app-form.component.css'
})
export class AppFormComponent implements OnInit, OnDestroy {
  appForm: FormGroup;

  classifications: string[] = [];
  activeStatus: any[] = [
    { name: 'Active', value: 'active' },
    { name: 'Inactive', value: 'inactive' }
  ];
  adminRoles: any[] = [];

  imagePreviewUrl: string | null = null;
  selectedImageFile: File | null = null;
  selectedImageName: string | null = null;
  imageRemoved = false;

  readonly maxImageSizeBytes = 1 * 1024 * 1024;
  readonly allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];

  mode: 'create' | 'edit' = 'create';
  appId: string | null = null;

  isOnline: boolean = navigator.onLine;
  private networkSub?: Subscription;
  private routeSub?: Subscription;

  constructor(
    private orgAdminService: OrganizationAdministrationService,
    private configAdministrationService: ConfigAdministrationService,
    private networkService: NetworkStatusService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.appForm = this.fb.group({
      appName: new FormControl<string>('', [Validators.required]),
      appDescription: new FormControl<string>('', [Validators.required]),
      appAdminRole: new FormControl<string>(''),
      appClassification: new FormControl<string>(''),
      appOwner: new FormControl<string>(''),
      appContact: new FormControl<string>(''),
      appStatus: new FormControl<string>('active')
    });
  }

  ngOnInit(): void {
    this.getRoles();
    this.networkSub = this.networkService.getNetworkStatus().subscribe(status => {
      this.isOnline = status;
    });

    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.mode = 'edit';
        this.appId = id;
        this.loadAppData(id);
      } else {
        this.mode = 'create';
        this.appId = null;
        this.tryInitFromState();
      }
    });
  }

  ngOnDestroy(): void {
    this.networkSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  private tryInitFromState(): void {
    const stateApp = (this.router.getCurrentNavigation()?.extras?.state as any)?.app
      ?? (history.state as any)?.app;
    if (stateApp) {
      this.applyAppData(stateApp);
    }
  }

  private loadAppData(id: string): void {
    const stateApp = (this.router.getCurrentNavigation()?.extras?.state as any)?.app
      ?? (history.state as any)?.app;
    if (stateApp && String(stateApp.appId) === String(id)) {
      this.applyAppData(stateApp);
      return;
    }

    this.spinner.show();
    this.orgAdminService.getApps().subscribe({
      next: (res: any) => {
        const apps = Array.isArray(res?.apps) ? res.apps : [];
        const app = apps.find((item: any) => String(item?.appId) === String(id));
        if (app) {
          this.applyAppData(app);
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Not found',
            detail: 'Application not found.'
          });
          this.goBack();
        }
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load application details.'
        });
        this.goBack();
      }
    });
  }

  private applyAppData(app: any): void {
    this.appForm.patchValue({
      appName: app.appName,
      appDescription: app.appDescription,
      appAdminRole: app.adminRole,
      appClassification: app.appClassification,
      appOwner: app.appOwner,
      appContact: app.appContact,
      appStatus: app.appStatus
    });

    if (app?.appLogoDataUrl) {
      this.imagePreviewUrl = app.appLogoDataUrl;
      this.selectedImageName = app.appLogoName || 'Existing image';
      return;
    }

    if (app?.appLogo && app?.appLogoType) {
      this.imagePreviewUrl = `data:${app.appLogoType};base64,${app.appLogo}`;
      this.selectedImageName = app.appLogoName || 'Existing image';
    }
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

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

  saveApp(): void {
    if (this.mode === 'edit') {
      this.updateApp();
    } else {
      this.createApp();
    }
  }

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
        this.goBack();
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

  updateApp(): void {
    if (this.appForm.invalid || !this.appId) {
      this.appForm.markAllAsTouched();
      return;
    }

    const payload = this.buildAppFormData(true);
    this.orgAdminService.updateApp(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Application updated successfully.'
        });
        this.goBack();
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

  private buildAppFormData(isEdit: boolean): FormData {
    const formData = new FormData();

    if (isEdit) {
      formData.append('appId', this.appId ?? '');
      formData.append('appStatus', this.appForm.get('appStatus')?.value ?? '');
      formData.append('modifiedBy', this.getCurrentUserName());
      formData.append('modifiedOn', new Date().toISOString());
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

  goBack(): void {
    const base = this.router.url.includes('/opsAdmin/')
      ? '/orgAdmin/opsAdmin/home'
      : '/orgAdmin/appAdmin/home';
    this.router.navigateByUrl(`${base}/appsManager`);
  }

  private getCurrentUserName(): string {
    return localStorage.getItem('userName')
      || localStorage.getItem('username')
      || sessionStorage.getItem('userName')
      || 'system';
  }
}
