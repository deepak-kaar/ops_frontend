import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';
import { OrganizationAdministrationService } from '../../../organization-administration.service';
import { ActivatedRoute } from '@angular/router';



/**
 * @component
 * @description
 * The `ManageOrgComponent` is responsible for managing Organization for an application in the organization administration module.
 * This is a dialog component invoked from OrgsManager Component , at the time of invocation the data for this component and mode is supplied
 * It works based on the mode.
 * If the mode is create it used to create an app by accepting the values entered by the user with the help of org form.
 * If the mode is edit it used to edit an existing org by patching the existing app value to the org form from the value passed while invocation.
 */
@Component({
  selector: 'app-manage-org',
  standalone: false,
  templateUrl: './manage-org.component.html',
  styleUrl: './manage-org.component.css'
})
export class ManageOrgComponent {
  /**
    * @property {FormGroup} appForm - Form group that holds application form controls.
    */
  orgForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
   * @property {string} appId - stores the application Id.
   */
  appId: string;



  /**
   * @constructor
   * @param {DynamicDialogConfig} dialogConfig - Configuration for the dynamic dialog.
   * @param {DynamicDialogRef} ref - Reference to the dynamic dialog instance.
   * @param {OrganizationAdministrationService} orgAdminService - Service for handling organization-related operations.
   * @param {PrimeNG} config - PrimeNG configuration settings.
   * @param {MessageService} messageService - Service for displaying messages to the user.
   * @param {FormBuilder} fb - Form builder service for handling reactive forms.
   */
  constructor(public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private orgAdminService: OrganizationAdministrationService,
    private config: PrimeNG,
    private messageService: MessageService,
    private fb: FormBuilder,
  ) {
    this.appId = this.dialogConfig.data.appId;
    console.log(this.appId);
    this.orgForm = this.fb.group({
      orgName: new FormControl<string>('', [Validators.required]),
      orgDescription: new FormControl<string>('', [Validators.required]),
      appId: new FormControl<string>(this.appId, [Validators.required]),
      orgCode: new FormControl<string>('', [Validators.required]),
      orgOwner: new FormControl<string>(''),
      orgContact: new FormControl<string>(''),
    });
    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.patchValue(this.dialogConfig.data?.appData)
    }
  }


  /**
   * Validates the roleForm.
   * If its is valid calls the createOrg method from org Admin service to create an app by passing the orgForm Value.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  createOrg(): void {
    if (this.orgForm.valid) {
      this.orgAdminService.createOrg(this.orgForm.getRawValue()).subscribe({
        next: (res: any) => {
          this.ref.close({ status: true });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While creating Organization", life: 3000 });
        }
      })
    }
  }

  /**
 * Patches the application data to the orgForm
 * @param {any} app - application data
 * @returns {void} - returns nothing (i.e) void
 */
  patchValue(org: any): void {
    this.orgForm.patchValue({
      orgName: org.orgName,
      orgDescription: org.orgDescription,
      orgCode: org.orgCode,
      orgOwner: org.orgOwner,
      orgContact: org.orgContact
    })
  }
}

