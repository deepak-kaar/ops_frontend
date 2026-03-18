import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-template-confirmation',
  standalone: false,
  templateUrl: './template-confirmation.component.html',
  styleUrl: './template-confirmation.component.css'
})
export class TemplateConfirmationComponent {

  pageForm = new FormGroup({
    pageName: new FormControl<string>('', [Validators.required]),
    pageDescription: new FormControl<any>(''),
    saveType: new FormControl<string>('', [Validators.required])
  })
  constructor(protected ref: DynamicDialogRef, public dialogConfig: DynamicDialogConfig) {
    this.pageForm.patchValue({
      saveType: this.dialogConfig?.data,
    })
  }

  save() {
    if (this.pageForm.valid) {
      this.ref.close(this.pageForm.getRawValue());
    }
  }
}
