import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { WidgetService } from 'src/app/modules/widgets/widget.service';

/**
 * @component
 * @description
 * FileUploadComponent handles file uploads, stores uploaded files, and updates the form data.
 * It extends the BaseWidget class and integrates with a common service to store uploaded file details.
 */
@Component({
  selector: 'app-file-upload',
  standalone: false,
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent extends BaseWidget {

  /** Unique identifier for the component instance. */
  @Input() id: any;
  @Input() pageId: string = '';   
  /** Attribute ID associated with the file upload field. */
  @Input() attrId: any;
  
  /** File input received as a prop. */
  @Input() file: any;
  
  /** Style object for custom styling. */
  @Input() style: any;
  
  /** Base64 URL or path of the uploaded file. */
  fileUrl: any;
  
  /** List of uploaded files. */
  uploadedFiles: any[] = [];

  /**
   * Constructor initializes dependencies.
   * @param messageService - Service for displaying messages.
   * @param commonService - Widget service for updating form data.
   * @param config - PrimeNG configuration object.
   */
  constructor(
    private messageService: MessageService,
    private commonService: WidgetService,
    private config: PrimeNG
  ) { 
    super();
  }

  /**
   * Lifecycle hook: Initializes component state.
   * If a file is provided as input, it is added to the uploaded files list.
   */
  ngOnInit() {
    if (this.file) {
      this.uploadedFiles.push(this.file);
      this.fileUrl = this.file.data;
    }
  }

  /**
   * Handles file upload event.
   * @param event - File upload event containing the uploaded files.
   */
  onUpload(event: any) {
    if (event.files && this.uploadedFiles.length === 0) {
      const file = event.files[0];
      this.uploadedFiles.push(file);
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const base64File = e.target.result;
        this.fileUrl = base64File;
        
        const image = {
          name: file.name,
          size: file.size,
          data: base64File
        };
        
        const value = {
          value: image,
          id: this.attrId
        };
        
        this.commonService.updateFormData(this.id, value);
      };
      
      reader.readAsDataURL(file);
      this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
    }
  }

  /**
   * Formats file size into human-readable format.
   * @param bytes - File size in bytes.
   * @returns Formatted file size as a string.
   */
  formatSize(bytes: number): string {
    const k = 1024;
    const dm = 3;
    const sizes: any = this.config.translation.fileSizeTypes;
    
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
    
    return `${formattedSize} ${sizes[i]}`;
  }

  /**
   * Clears the uploaded file list.
   */
  clearFile() {
    this.uploadedFiles = [];
  }
}

