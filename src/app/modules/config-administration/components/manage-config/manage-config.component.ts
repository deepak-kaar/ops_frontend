import { Component } from '@angular/core';
import { ConfigAdministrationComponent } from '../../config-administration.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-manage-config',
  standalone: false,
  templateUrl: './manage-config.component.html',
  styleUrl: './manage-config.component.css'
})
export class ManageConfigComponent extends ConfigAdministrationComponent {

  /**
    * @property {FormGroup} configForm - Form group that holds application form controls.
    */
  configForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
  * @property {string} appId - stores the appId.
  */
  appId: any;

  baseEditorOptions = {
    theme: 'vs-dark',
    language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false
  };

  configEditorOptions = { ...this.baseEditorOptions };

  // Encrypt/Decrypt properties
  encryptDialogVisible = false;
  decryptDialogVisible = false;
  encryptInput = '';
  decryptInput = '';
  encryptedResult = '';
  decryptedResult = '';
  isEncrypting = false;
  isDecrypting = false;

  /**
   * @constructor
   * @param {DynamicDialogConfig} dialogConfig - Configuration for the dynamic dialog.
   * @param {DynamicDialogRef} ref - Reference to the dynamic dialog instance.
   * @param {FormBuilder} fb - Form builder service for handling reactive forms.
   * @param {DatePipe} datePipe - Datepipe to handle date field.
   */
  constructor(public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    super();
    this.appId = this.dialogConfig.data?.appId || null,
      this.configForm = this.fb.group({
        configId: new FormControl<string>(''),
        configName: new FormControl<string>('', [Validators.required]),
        configValue: new FormControl<string>('', [Validators.required]),
        configData: new FormControl<string>(''),
        createdBy: new FormControl<string>({ value: 'User1', disabled: this.dialogConfig.data.mode === 'edit' }),
        createdOn: new FormControl<Date>({ value: new Date(), disabled: this.dialogConfig.data.mode === 'edit' }),
        modifiedBy: new FormControl<string>('User1'),
        modifiedOn: new FormControl<Date>(new Date()),
        appId: new FormControl<string>(''),
        appName: new FormControl<string>(''),
      });

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.patchValue(this.dialogConfig.data?.configData)
    }
  }

  /**
   * Validates the roleForm.
   * If its is valid calls the createApp method from org Admin service to create an app by passing the appForm Value.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  createConfig(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();

      const missingFields = this.getMissingRequiredFields();
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Required Fields',
        detail: missingFields.length
          ? `Please fill: ${missingFields.join(', ')}`
          : 'Please fill all required fields.',
        life: 3000
      });
      return;
    }

    let payload = this.configForm.value;

    if (this.mode === 'create') {
      const currentApp = this.filterService.currentApp;

      payload = {
        ...payload,
        ...(currentApp?.appId ? { appId: currentApp.appId } : {}),
        ...(currentApp?.appName ? { appName: currentApp.appName } : {})
      };

      this.configAdministrationService.postConfig(payload).subscribe({
        next: () => {
          this.ref.close({ status: true });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error While creating config',
            life: 3000
          });
        }
      });
    } else {
      this.configAdministrationService.putConfig(payload, payload.configId).subscribe({
        next: () => {
          this.ref.close({ status: true });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error While editing config',
            life: 3000
          });
        }
      });
    }
  }

  private getMissingRequiredFields(): string[] {
    const missing: string[] = [];

    Object.keys(this.configForm.controls).forEach((key) => {
      const control = this.configForm.get(key);
      if (control?.errors?.['required']) {
        missing.push(this.fieldLabels[key] || key);
      }
    });

    return missing;
  }

  /**
* Patches the config data to the appForm
* @param {any} configurationData - config data
* @returns {void} - returns nothing (i.e) void
*/
  patchValue(configurationData: any): void {
    this.configForm.patchValue({
      configId: configurationData.configId,
      configName: configurationData.configName,
      configValue: configurationData.configValue,
      configData: configurationData.configData,
      createdBy: configurationData.createdBy,
      createdOn: this.datePipe.transform(configurationData.createdOn, 'mediumDate'),
      modifiedBy: configurationData.modifiedBy,
      modifiedOn: this.datePipe.transform(configurationData.modifiedOn, 'mediumDate')
    });
  }

  cancel() {
    this.ref.close({ status: false });
  }

  // Encrypt/Decrypt Methods
  openEncryptDialog(): void {
    this.encryptDialogVisible = true;
    this.clearEncrypt();
  }

  openDecryptDialog(): void {
    this.decryptDialogVisible = true;
    this.clearDecrypt();
  }

  performEncrypt(): void {
    if (!this.encryptInput.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter a value to encrypt'
      });
      return;
    }

    this.isEncrypting = true;
    this.configAdministrationService.encryptValue(this.encryptInput).subscribe({
      next: (response: any) => {
        this.encryptedResult = response.encryptedValue;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Value encrypted successfully'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to encrypt value'
        });
      },
      complete: () => {
        this.isEncrypting = false;
      }
    });
  }

  performDecrypt(): void {
    if (!this.decryptInput.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter an encrypted value to decrypt'
      });
      return;
    }

    this.isDecrypting = true;
    this.configAdministrationService.decryptValue(this.decryptInput).subscribe({
      next: (response: any) => {
        this.decryptedResult = response.decryptedValue;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Value decrypted successfully'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to decrypt value. Please check if the value is properly encrypted.'
        });
      },
      complete: () => {
        this.isDecrypting = false;
      }
    });
  }

  clearEncrypt(): void {
    this.encryptInput = '';
    this.encryptedResult = '';
  }

  clearDecrypt(): void {
    this.decryptInput = '';
    this.decryptedResult = '';
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Copied',
        detail: 'Value copied to clipboard'
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to copy to clipboard'
      });
    });
  }

  useEncryptedValue(): void {
    this.configForm.patchValue({
      configValue: this.encryptedResult
    });
    this.encryptDialogVisible = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Encrypted value added to config'
    });
  }

  private readonly fieldLabels: Record<string, string> = {
    configName: 'Config Name',
    configValue: 'Config Value'
  };

}
