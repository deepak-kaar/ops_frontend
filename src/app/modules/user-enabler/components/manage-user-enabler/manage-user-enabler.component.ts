import { Component } from '@angular/core';
import { UserEnablerComponent } from '../../user-enabler.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FilterService } from 'src/app/core/services/filter/filter.service';
@Component({
  selector: 'app-manage-user-enabler',
  standalone: false,
  templateUrl: './manage-user-enabler.component.html',
  styleUrl: './manage-user-enabler.component.css'
})
export class ManageUserEnablerComponent extends UserEnablerComponent {

  /**
     * @property {FormGroup} enablerForm - Form group that holds application form controls.
     */
  enablerForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  roles: any[] = [];

  durationOptions = [
    { label: '1 hr', value: '1' },
    { label: '2 hr', value: '2' },
    { label: '4 hr', value: '4' },
    { label: '8 hr', value: '8' },
    { label: '24 hr', value: '24' }
  ];

  activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder,
    private filterService: FilterService
  ) {
    super();

    this.enablerForm = this.fb.group({
      _id: new FormControl<any>(''),
      incident: new FormControl<string>('', [Validators.required]),
      role: new FormControl<string>('', [Validators.required]),
      duration: new FormControl<string>('', [Validators.required]),
      justification: new FormControl<string>(''),
      appId: new FormControl<string>(''),
      appName: new FormControl<string>(''),
      orgId: new FormControl<string>(''),
      orgName: new FormControl<string>(''),
      isActive: [true],
      user: new FormControl<string>('SHAKAX0A') //inFuture need to store NetworkID from login
    });

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.patchValue(this.dialogConfig.data?.data)
    }
  }

  ngOnInit() {
    let params = {
      appId: this.filterService.currentApp?.appId,
      orgId: this.filterService.currentOrg?.orgId
    }

    this.userEnablerService.getRolesDropdown(params).subscribe({
      next: (response) => {
        this.roles = response.data || [];
      },
      error: (error) => {
        this.showToast('error', 'Error', 'Error when fetching Roles', 2000, false);
        this.roles = [];
      }
    });
  }

  save(): void {
    if (this.enablerForm.valid) {
      const payload = {
        appId: this.filterService.currentApp?.appId ?? '',
        appName: this.filterService.currentApp?.appName ?? '',
        orgId: this.filterService.currentOrg?.orgId ?? '',
        orgName: this.filterService.currentOrg?.orgName ?? '',
        incident: this.enablerForm.get('incident')?.value,
        role: this.enablerForm.get('role')?.value,
        duration: this.enablerForm.get('duration')?.value,
        justification: this.enablerForm.get('justification')?.value,
        isActive: this.enablerForm.get('isActive')?.value
      }

      console.log(payload);

      if (this.mode == 'create') {
        this.userEnablerService.postEnablerService(payload).subscribe({
          next: (res: any) => {
            this.showToast('success', 'Success', 'Successfully created', 2000, false);
            this.ref.close({ status: true, data: payload });
          },
          error: (err) => {
            this.showToast('error', 'Error', 'Error when creating', 2000, false);
          }
        });
      } else {
        const id = this.enablerForm.get('_id')?.value;
        this.userEnablerService.putEnablerService(payload, id).subscribe({
          next: (res: any) => {
            this.showToast('success', 'Success', 'Successfully edited', 2000, false);
            this.ref.close({ status: true, data: payload });
          },
          error: (err) => {
            this.showToast('error', 'Error', 'Error when editing', 2000, false);
          }
        });
      }
    }
  }


  patchValue(data: any): void {
    this.enablerForm.patchValue({
      _id: data._id,
      incident: data.incident,
      role: data.role,
      duration: data.duration,
      justification: data.justification,
      appId: data.appId,
      appName: data.appName,
      orgId: data.orgId,
      orgName: data.orgName,
      isActive: data.isActive,
      user: data.user
    });
  }

  cancel() {
    this.ref.close({ status: false });
  }


}
