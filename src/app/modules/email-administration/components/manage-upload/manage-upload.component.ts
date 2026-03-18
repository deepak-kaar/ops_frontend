import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PrimeNG } from 'primeng/config';
import { FileUpload } from 'primeng/fileupload';
import { EmailAdministrationComponent } from '../../email-administration.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-manage-upload',
  standalone: false,
  templateUrl: './manage-upload.component.html',
  styleUrl: './manage-upload.component.css'
})
export class ManageUploadComponent extends EmailAdministrationComponent implements OnInit, OnDestroy {

  /**
  * @property {FormGroup} emailAttachmentForm - Form group that holds report form controls.
  */
  emailAttachmentForm: FormGroup;

  uploadedFile: any = null;
  filePreviewUrl: string | null = null;
  fileIcon: string = '';

  @ViewChild('fileUpload') fileUpload!: FileUpload;


  constructor(private fb: FormBuilder, private ref: DynamicDialogRef) {
    super();
    this.emailAttachmentForm = this.fb.group({
      pageId: new FormControl<string>('', [Validators.required]),
      pageName: new FormControl<string>('', [Validators.required]),
      description: new FormControl<string>('', [Validators.required]),
    });
  }


  override ngOnInit(): void {
    super.ngOnInit();
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
    if (this.uploadedFile) {
      this.ref.close({
        status: true,
        attachments: [this.uploadedFile]
      });
    } else {
      this.ref.close({ status: false });
    }
  }

  onCancel() {
    this.ref.close({ status: false });
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
