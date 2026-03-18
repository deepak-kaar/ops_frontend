import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatasourceAdministrationComponent } from '../../../datasource-administration.component';

@Component({
  selector: 'app-manage-datasource',
  standalone: false,
  templateUrl: './manage-datasource.component.html',
  styleUrl: './manage-datasource.component.css'
})
export class ManageDatasourceComponent extends DatasourceAdministrationComponent {
  /**
    * @property {FormGroup} datasourceForm - Form group that holds application form controls.
    */
  datasourceForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
   * @property {string} datasourceLevelId - stores the datasourceLevelId Id (app Id or orgId).
   */

  datasourceLevelId: string

  /**
   * @property {string} appId - stores the appId.
   */
  appId: any;

  /**
  * @property {string} orgId - stores the orgId.
  */
  orgId: any;


  systemTypes = ['Oracle DB', 'OSI PI', 'MongoDB', 'Sql Server'];


  editorOptions = {
    theme: 'vs-dark', language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false
  };



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
    this.datasourceLevelId = this.dialogConfig.data?.tagSendLevelId || null;
    this.appId = this.dialogConfig.data?.appId || null,
      this.orgId = this.dialogConfig.data?.orgId || null

    this.datasourceForm = this.fb.group({
      sysId: new FormControl<string>('', [Validators.required]),
      sysName: new FormControl<string>('', [Validators.required]),
      sysType: new FormControl<string>('', []),
      active: new FormControl<boolean>(true),
      description: new FormControl<string>('', []),
      userJson: new FormControl<any>(''),
      operatingFacility: new FormControl<string>('', []),
      lastConnectionDate: new FormControl<string>({ value: '', disabled: true }),
      lastRunDuration: new FormControl<number>({ value: 0, disabled: true }),
      lastConnectionSts: new FormControl<string>({ value: '', disabled: true }),
    });
  }

  /**
   * Validates the roleForm.
   * If its is valid calls the createApp method from org Admin service to create an app by passing the appForm Value.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  createDataSource(): void {
    if (this.datasourceForm.valid) {
      const formValue = this.datasourceForm.getRawValue();
      const userJson = formValue.userJson ? JSON.parse(formValue.userJson) : null
      const payload = {
        userJson: userJson,
        active: this.datasourceForm.get('active')?.value,
        description: this.datasourceForm.get('description')?.value,
        lastConnectionDate: this.datasourceForm.get('lastConnectionDate')?.value,
        lastConnectionSts: this.datasourceForm.get('lastConnectionSts')?.value,
        lastRunDuration: this.datasourceForm.get('lastRunDuration')?.value,
        operatingFacility: this.datasourceForm.get('operatingFacility')?.value,
        sysId: this.datasourceForm.get('sysId')?.value,
        sysName: this.datasourceForm.get('sysName')?.value,
        sysType: this.datasourceForm.get('sysType')?.value,
      }

      this.dataSourceAdministrationService.postDataSource(payload).subscribe({
        next: (res: any) => {
          this.ref.close({ status: true });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While create data source", life: 3000 });
        }
      });
    }
  }

  cancel() {
    this.ref.close({ status: false });
  }
}
