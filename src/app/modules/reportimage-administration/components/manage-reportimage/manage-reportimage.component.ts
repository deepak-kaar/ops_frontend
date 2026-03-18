import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReportimageAdministrationComponent } from '../../reportimage-administration.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FileUpload } from 'primeng/fileupload';
import { Subscription } from 'rxjs';
import { NetworkStatusService } from 'src/app/core/utils/network-status.service';
import { PrimeNG } from 'primeng/config';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-manage-reportimage',
  standalone: false,
  templateUrl: './manage-reportimage.component.html',
  styleUrl: './manage-reportimage.component.css'
})
export class ManageReportimageComponent extends ReportimageAdministrationComponent implements OnInit, OnDestroy {

  /**
  * @property {FormGroup} reportForm - Form group that holds report form controls.
  */
  reportForm: FormGroup;

  uploadedFile: any = null;
  filePreviewUrl: string | null = null;
  fileIcon: string = '';
  
  isEditMode: boolean = false;
  currentReportImage: any = null;
  existingFileInfo: any = null;
  existingImagePreview: string | null = null;

  @ViewChild('fileUpload') fileUpload!: FileUpload;


  constructor(
    private fb: FormBuilder, 
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    super();
    this.reportForm = this.fb.group({
      name: new FormControl<string>('', [Validators.required]),
      createdBy: new FormControl<string>('User1')
    });
  }


  override ngOnInit(): void {
    super.ngOnInit();
    
    // Check if in edit mode
    if (this.config.data?.mode === 'edit' && this.config.data?.reportImage) {
      this.isEditMode = true;
      this.currentReportImage = this.config.data.reportImage;
      this.populateForm();
    }
  }

  populateForm(): void {
    if (this.currentReportImage) {
      this.reportForm.patchValue({
        name: this.currentReportImage.name || '',
        createdBy: this.currentReportImage.createdBy || 'User1'
      });
      
      // Store existing file info and load preview
      if (this.currentReportImage.fileName) {
        this.existingFileInfo = this.currentReportImage.fileName;
        this.loadExistingImagePreview();
      }
    }
  }

  loadExistingImagePreview(): void {
    if (this.existingFileInfo?.fileId) {
      this.reportimageAdministrationService.downloadAttachment(this.existingFileInfo.fileId).subscribe({
        next: (blob: Blob) => {
          this.existingImagePreview = URL.createObjectURL(blob);
        },
        error: (err) => {
          console.error('Error loading image preview:', err);
        }
      });
    }
  }

  ngOnDestroy(): void {
  }
  onSelectFile(event: any) {
    this.uploadedFile = event.files[0];
  }

  onRemove() {
    this.uploadedFile = null;
  }

  removeFile(file: any) {
    const index = this.fileUpload.files.indexOf(file);
    if (index !== -1) {
      this.fileUpload.files.splice(index, 1); // remove from array
    }
  }

  onSave() {
    if (this.isEditMode) {
      this.updateReportImage();
    } else {
      this.createReportImage();
    }
  }

  createReportImage() {
    if (this.uploadedFile) {
      const formData = new FormData();
      const payload = this.reportForm.value;

      formData.append('appId', this.filterService.currentApp?.appId);
      formData.append('appName', this.filterService.currentApp?.appName);
      formData.append('orgId', this.filterService.currentOrg?.orgId);
      formData.append('orgName', this.filterService.currentOrg?.orgName);

      Object.keys(payload).forEach(key => {
        if (key !== 'attachments') {
          const value = payload[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        }
      });

      const fileObj = this.uploadedFile.rawFile || this.uploadedFile.file || this.uploadedFile;
      if (fileObj instanceof File) {
        formData.append('fileName', fileObj);
      }

      this.reportimageAdministrationService.postReportImage(formData).subscribe({
        next: (res: any) => {
          this.ref.close({ status: true });
        },
        error: (err) => {
          this.showToast('error', 'Error', 'Error when creating', 2000, false);
        }
      });
    } else {
      this.ref.close({ status: false });
    }
  }

  updateReportImage() {
    const formData = new FormData();
    const payload = this.reportForm.value;

    // Add basic fields
    Object.keys(payload).forEach(key => {
      const value = payload[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    formData.append('modifiedBy', payload.createdBy || 'User1');

    // Add new file if uploaded
    if (this.uploadedFile) {
      const fileObj = this.uploadedFile.rawFile || this.uploadedFile.file || this.uploadedFile;
      if (fileObj instanceof File) {
        formData.append('fileName', fileObj);
      }
    }

    this.reportimageAdministrationService.updateReportImage({
      reportImageId: this.currentReportImage.reportImageId,
      formData
    }).subscribe({
      next: (res: any) => {
        this.ref.close({ status: true });
      },
      error: (err) => {
        this.showToast('error', 'Error', 'Error when updating', 2000, false);
      }
    });
  }

  onCancel() {
    this.ref.close({ status: false });
  }

  hasExistingFile(): boolean {
    return this.existingFileInfo && this.existingFileInfo.fileId;
  }

  getExistingFileName(): string {
    return this.existingFileInfo?.filename || 'Existing file';
  }

  hasImagePreview(): boolean {
    return !!this.existingImagePreview;
  }

  // Map file type to icon
  getFileIcon(file: any): string {
    const type = file.type;
    if (type.startsWith('image/')) return 'pi pi-image';
    if (type === 'application/pdf') return 'pi pi-file-pdf';
    if (
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type === 'application/msword'
    )
      return 'pi pi-file-word';
    if (
      type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      type === 'application/vnd.ms-excel'
    )
      return 'pi pi-file-excel';
    if (
      type ===
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      type === 'application/vnd.ms-powerpoint'
    )
      return 'pi pi-file-powerpoint';
    return 'pi pi-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

}
