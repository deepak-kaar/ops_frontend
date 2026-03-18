import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OpsinsightDataComponent } from '../../opsinsight-data.component';

@Component({
  selector: 'app-customer-access-dialog',
  standalone: false,
  templateUrl: './customer-access-dialog.component.html',
  styleUrl: './customer-access-dialog.component.css'
})
export class CustomerAccessDialogComponent extends OpsinsightDataComponent {
  authForm: FormGroup;
  customerName: string = '';
  expectedServiceName: string = '';
  attributes: any[] = [];
  isAuthorized: boolean = false;

  constructor(
    public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder
  ) {
    super();

    this.customerName = this.dialogConfig.data?.customerName || '';
    this.expectedServiceName = this.dialogConfig.data?.serviceName || '';
    this.attributes = this.dialogConfig.data?.attributes || [];

    this.authForm = this.fb.group({
      serviceName: ['', Validators.required],
      password: ['']
    });
  }

  verifyAccess(): void {
    if (this.authForm.invalid) {
      this.showToast('warn', 'Validation', 'Please enter service name', 2000, false);
      return;
    }

    const enteredServiceName = (this.authForm.get('serviceName')?.value || '').trim();

    if (!this.expectedServiceName) {
      this.showToast('error', 'Access Denied', 'Service name not configured for this customer', 3000, false);
      return;
    }

    if (enteredServiceName !== this.expectedServiceName) {
      this.showToast('error', 'Access Denied', 'Invalid service name', 3000, false);
      return;
    }

    // Password is not validated as per requirement
    this.isAuthorized = true;
  }

  close(): void {
    this.ref.close({ status: this.isAuthorized });
  }

  copyToClipboard(): void {
    const jsonString = JSON.stringify(this.attributes, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      // Show success message - if you have a message service
      // this.messageService.add({ severity: 'success', summary: 'Copied', detail: 'JSON copied to clipboard' });
      console.log('JSON copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  downloadJson(): void {
    const jsonString = JSON.stringify(this.attributes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.customerName}_attributes.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getFormattedJson(): string {
    const jsonString = JSON.stringify(this.attributes, null, 2);
    // Add syntax highlighting
    return jsonString
      .replace(/(".*?"):/g, '<span class="text-purple-400">$1</span>:')  // keys
      .replace(/: (".*?")/g, ': <span class="text-green-400">$1</span>') // string values
      .replace(/: (\d+)/g, ': <span class="text-yellow-400">$1</span>')  // numbers
      .replace(/: (true|false)/g, ': <span class="text-blue-400">$1</span>') // booleans
      .replace(/: (null)/g, ': <span class="text-red-400">$1</span>');   // null
  }
}

