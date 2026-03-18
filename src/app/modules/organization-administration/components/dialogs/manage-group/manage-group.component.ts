import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrganizationAdministrationService } from '../../../organization-administration.service';

@Component({
  selector: 'app-manage-group',
  standalone: false,
  templateUrl: './manage-group.component.html',
  styleUrl: './manage-group.component.css'
})
export class ManageGroupComponent {
  /**
     * @property {FormGroup} groupForm - Form group that holds Group form controls.
     */
  groupForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
  * @property {string} appId - stores the appId.
  */
  appId: string = '';

  /**
   * @property {string} orgId - stores the orgId.
   */
  orgId: string = '';


  /**
   * @property {string} groupId - stores the groupId when the mode is edit.
   */
  groupId: string = '';


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
    this.appId = this.dialogConfig.data?.appId;
    this.orgId = this.dialogConfig.data?.orgId;

    this.groupForm = this.fb.group({
      appId: new FormControl<string>(this.appId, [Validators.required]),
      orgId: new FormControl<string>(this.orgId, [Validators.required]),
      groupName: new FormControl<string>('', [
        Validators.required,
        Validators.maxLength(7)
      ]),

      groupDescription: new FormControl<string>(''),
    });

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.groupId = this.dialogConfig.data?.groupData?.groupId
      this.patchValue(this.dialogConfig.data?.groupData)
    }
  }

  /**
   * Validates the groupForm.
   * If its is valid calls the createApp method from org Admin service to create an app by passing the appForm Value.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  createRole(): void {
    if (this.groupForm.valid) {
      if (this.mode === 'create') {
        this.orgAdminService.postGroup(this.groupForm.getRawValue()).subscribe({
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
          groupId: this.groupId,
          ...this.groupForm.getRawValue()
        }
        this.orgAdminService.updateGroup(payload).subscribe({
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
   * Patches the group data to the groupForm
   * @param {any} group - group data
   * @returns {void} - returns nothing (i.e) void
   */
  patchValue(group: any): void {
    this.groupForm.patchValue({
      groupName: group.groupName,
      groupDescription: group.groupDescription
    })
  }
}
