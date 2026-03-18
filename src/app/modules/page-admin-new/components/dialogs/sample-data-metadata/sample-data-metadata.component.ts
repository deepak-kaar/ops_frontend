import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sample-data-metadata',
  standalone: false,
  templateUrl: './sample-data-metadata.component.html',
  styleUrl: './sample-data-metadata.component.css'
})
export class SampleDataMetadataComponent {
  metadataForm: FormGroup;

  constructor(
    public config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.metadataForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    // If editing existing metadata, populate the form
    if (this.config?.data?.metadata) {
      this.metadataForm.patchValue({
        name: this.config.data.metadata.name || '',
        description: this.config.data.metadata.description || ''
      });
    }
  }

  onSave(): void {
    if (this.metadataForm.valid) {
      const metadata = {
        name: this.metadataForm.value.name,
        description: this.metadataForm.value.description || ''
      };
      this.ref.close(metadata);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please enter a name for the sample data',
        life: 3000
      });
    }
  }

  onCancel(): void {
    this.ref.close();
  }
}
