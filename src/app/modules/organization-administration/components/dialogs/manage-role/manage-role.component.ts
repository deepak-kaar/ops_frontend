import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrganizationAdministrationService } from 'src/app/modules/organization-administration/organization-administration.service';

@Component({
  selector: 'app-manage-role',
  standalone: false,
  templateUrl: './manage-role.component.html',
  styleUrl: './manage-role.component.css'
})
export class ManageRoleComponent {
  /**
    * @property {FormGroup} appForm - Form group that holds application form controls.
    */
  roleForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
   * @property {string} roleLevel - stores the roleLevel.
   */

  roleLevel: string

  /**
   * @property {string} roleLevelId - stores the roleLevel Id (app Id or orgId).
   */

  roleLevelId: string


  /**
   * @property {string} roleId - stores the roleId when the mode is edit.
   */
  roleId: string = '';

  /**
   * @property {string} appId - stores the appId.
   */
  appId: any;

  /**
  * @property {string} orgId - stores the orgId.
  */
  orgId: any;


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
    private fb: FormBuilder
  ) {
    this.roleLevel = this.dialogConfig.data?.roleLevel ?? 'OpsInsight';
    this.roleLevelId = this.dialogConfig.data?.roleLevelId || null;
    this.appId = this.dialogConfig.data?.appId || null,
    this.orgId = this.dialogConfig.data?.orgId || null

    this.roleForm = this.fb.group({
      roleName: new FormControl<string>('', [Validators.required]),
      roleDescription: new FormControl<string>('',),
      defaultAccessLevel: new FormControl<string>('', [Validators.required]),
      roleLevel: new FormControl<string>(this.roleLevel, [Validators.required]),
      roleLevelId: new FormControl<any>(this.roleLevelId),
      adGroup: new FormControl<string>('', [Validators.required]),
      roleStatus: new FormControl<boolean>(true),
    });

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.roleId = this.dialogConfig.data?.appData?.roleId
      this.patchValue(this.dialogConfig.data?.appData)
    }
  }

  /**
   * Validates the roleForm.
   * If its is valid calls the createApp method from org Admin service to create an app by passing the appForm Value.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  createRole(): void {
    if (this.roleForm.valid) {
      if (this.mode === 'create') {
        const payload = {
          appId: this.appId,
          orgId: this.orgId,
          ...this.roleForm.getRawValue()
        }
        this.orgAdminService.createRole(payload).subscribe({
          next: (res: any) => {
            this.ref.close({ status: true });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While creating role", life: 3000 });
          }
        })
      }
      else {
        const payload = {
          roleId: this.roleId,
          ...this.roleForm.getRawValue()
        }
        this.orgAdminService.updateRole(payload).subscribe({
          next: (res: any) => {
            this.ref.close({ status: true });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While updating role", life: 3000 });
          }
        })
      }
    }
  }

  /**
   * Patches the application data to the roleForm
   * @param {any} role - application data
   * @returns {void} - returns nothing (i.e) void
   */
  patchValue(role: any): void {
    console.log(role)
    this.roleForm.patchValue({
      roleName: role.roleName,
      roleDescription: role.roleDescription,
      defaultAccessLevel: role.defaultAccessLevel,
      roleLevel: role.roleLevel,
      adGroup: role.adGroup
    })
  }
}
