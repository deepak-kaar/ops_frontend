import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-image-upload',
  standalone: false,
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css'
})
export class ImageUploadComponent {
  @Input() displayDialog = false;
  @Output() dialogClose = new EventEmitter<any>();
  files = [];

  totalSize: number = 0;

  totalSizePercent: number = 0;
  index: any;
  isFileSelected = false;
  uploadedFile: any;
  imageUrl: string | ArrayBuffer | null = null;
  isExistingImage: boolean = false;
  @ViewChild('fileUpload')
  fileUpload!: FileUpload;

  constructor(private config: PrimeNG, private messageService: MessageService, public dialogConfig: DynamicDialogConfig, private ref: DynamicDialogRef, private spinner: NgxSpinnerService) {

  }

  ngOnInit() {
    if (this.dialogConfig.data) {
      this.uploadedFile = this.dialogConfig.data;
      this.isExistingImage = true;
    }
  }

  choose(event: any, callback: () => void) {
    callback();
  }

  clearImage() {
    if (this.fileUpload) {
      this.fileUpload.files = [];
      this.fileUpload.clear();
    }
    this.files = [];
    this.totalSizePercent = 0;
  }

  onRemoveTemplatingFile(event: any, file: any, removeFileCallback: any, index: any) {
    removeFileCallback(event, index);
    this.files = []
    this.totalSizePercent = 0;
  }

  onClearTemplatingUpload(clear: () => void) {
    clear();
    this.totalSize = 0;
    this.totalSizePercent = 0;
  }

  onTemplatedUpload(fileUpload: any) {
    this.spinner.show();
    this.totalSizePercent = 100;
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
    const reader = new FileReader();
    const file = this.files[0];
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
      this.files = [];
      this.totalSize = 0;
      this.totalSizePercent = 0;
      fileUpload?.clear();
      this.spinner.hide();
      this.ref.close(this.imageUrl);
    };
    reader.onerror = () => {
      this.spinner.hide();
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to read image file', life: 3000 });
    };
    reader.readAsDataURL(file);
    fileUpload?.clear();
  }

  onSelectedFiles(event: any) {
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
      this.totalSizePercent = 50;
    }

  }

  uploadEvent(callback: () => void) {
    callback();
  }

  formatSize(bytes: number) {
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
  
  clearExisting() {
    this.isExistingImage = false;
  }
}
