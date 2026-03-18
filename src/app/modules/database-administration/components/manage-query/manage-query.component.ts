import { Component } from '@angular/core';
import { DatabaseAdministrationComponent } from '../../database-administration.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-manage-query',
  standalone: false,
  templateUrl: './manage-query.component.html',
  styleUrl: './manage-query.component.css'
})
export class ManageQueryComponent extends DatabaseAdministrationComponent {
  /**
      * @property {FormGroup} dbQueryForm - Form group that holds application form controls.
      */
  dbQueryForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
   * @property {string} dbQueryLevelId - stores the dbQueryLevelId Id (app Id or orgId).
   */

  dbQueryLevelId: string

  /**
   * @property {string} appId - stores the appId.
   */
  appId: any;

  /**
  * @property {string} orgId - stores the orgId.
  */
  orgId: any;


  languageOptions = ['sql', 'json', 'javascript'];

  editorOptions!: any;


  /**
   * @constructor
   * @param {DynamicDialogConfig} dialogConfig - Configuration for the dynamic dialog.
   * @param {DynamicDialogRef} ref - Reference to the dynamic dialog instance.
   * @param {FormBuilder} fb - Form builder service for handling reactive forms.
   */
  constructor(public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder
  ) {
    super();
    this.dbQueryLevelId = this.dialogConfig.data?.tagSendLevelId || null;
    this.appId = this.dialogConfig.data?.appId || null,
      this.orgId = this.dialogConfig.data?.orgId || null

    this.dbQueryForm = this.fb.group({
      queryId: new FormControl<string>('', [Validators.required]),
      sysId: new FormControl<string>('', [Validators.required]),
      sysName: new FormControl<string>('', [Validators.required]),
      query: new FormControl<string>('', [Validators.required]),
      queryLanguage: new FormControl<string>('sql', [Validators.required]),
      active: new FormControl<boolean>(true),
      description: new FormControl<string>('', []),
    });
    if (this.dialogConfig?.data.mode === 'create') {
      this.dbQueryForm.patchValue({
        sysId: this.dialogConfig.data?.systemData._id,
        sysName: this.dialogConfig.data?.systemData.sysName
      });
    }

    this.editorOptions = {
      theme: 'vs-dark', language: this.dbQueryForm.get('queryLanguage')?.value,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false
    };

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.appId = this.dialogConfig.data?.appData?.appId;
      this.patchValue(this.dialogConfig.data?.queryData)
    }
  }

  /**
   * Validates the roleForm.
   * If its is valid calls the createApp method from org Admin service to create an app by passing the appForm Value.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  saveDBQuery(): void {
    if (!this.dbQueryForm.valid) return;

    const formValue = this.dbQueryForm.getRawValue();
    let queryValue = formValue.query;

    if (formValue.queryLanguage === 'json') {
      try {
        queryValue = JSON.parse(formValue.query);
      } catch {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid JSON',
          detail: 'Query is not valid JSON format.',
          life: 3000
        });
        return;
      }
    }

    const payload = {
      query: queryValue,
      queryId: formValue.queryId,
      sysId: formValue.sysId,
      sysName: formValue.sysName,
      description: formValue.description,
      queryLanguage: formValue.queryLanguage,
      active: formValue.active
    };

    if (this.mode === 'create') {
      this.databaseAdministrationService.postDatabase(payload).subscribe({
        next: () => this.ref.close({ status: true }),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error while creating query',
            life: 3000
          });
        }
      });
    }
    else {
      const databaseId = this.dialogConfig.data?.queryData?.databaseId;

      this.databaseAdministrationService.putDatabase(databaseId, payload).subscribe({
        next: () => this.ref.close({ status: true }),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error while updating query',
            life: 3000
          });
        }
      });
    }
  }


  /**
 * Patches the query data to the appForm
 * @param {any} queryData - query data
 * @returns {void} - returns nothing (i.e) void
 */
  patchValue(queryData: any): void {
    this.dbQueryForm.patchValue({
      databaseId: queryData.databaseId,
      query: queryData.query,
      queryId: queryData.queryId,
      sysId: queryData.sysId,
      sysName: queryData.sysName,
      description: queryData.description,
      queryLanguage: queryData.queryLanguage,
    });

    this.onLanguageChange();
  }

  onLanguageChange() {
    this.editorOptions = {
      ...this.editorOptions,
      language: this.dbQueryForm.get('queryLanguage')?.value
    }
  }

  cancel() {
    this.ref.close({ status: false });
  }
}
