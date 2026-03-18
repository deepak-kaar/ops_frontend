import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrganizationAdministrationService } from '../../../organization-administration.service';

@Component({
  selector: 'app-manage-shift',
  standalone: false,
  templateUrl: './manage-shift.component.html',
  styleUrl: './manage-shift.component.css'
})
export class ManageShiftComponent {
  /**
     * @property {FormGroup} appForm - Form group that holds application form controls.
     */
  shiftForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
   * @property {string} shiftId - stores the shiftId when the mode is edit.
   */
  shiftId: string = '';

  /**
  * @property {string} appId - stores the appId.
  */
  appId: string = '';

  /**
   * @property {string} orgId - stores the orgId.
   */
  orgId: string = '';

  /**
   * @property {any[]} hours - stores the hoursFormat.
   */
  hours: any[] = ['8h', '12h'];

  startTimeArray: string[] = [];
  endTimeArray: string[] = [];



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
    this.shiftForm = this.fb.group({
      appId: new FormControl<string>(this.appId), // optional
      orgId: new FormControl<string>(this.orgId), // optional
      shiftName: new FormControl<string>('', [Validators.required]),
      shiftDescription: new FormControl<string>('', [Validators.required]),
      startTime: new FormControl<string>('', [Validators.required]),
      endTime: new FormControl<string>('', [Validators.required]),
      hourFormat: new FormControl<string>('', [Validators.required])
    });

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.shiftId = this.dialogConfig.data?.shiftData?.shiftId
      this.patchValue(this.dialogConfig.data?.shiftData)
    }
  }

  /**
   * Validates the shiftForm.
   * If its is valid calls the createShift method from org Admin service to create a shift by passing the shiftForm Value.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  createShift(): void {
    if (this.shiftForm.invalid) {
      this.shiftForm.markAllAsTouched();
      const missingFields = this.getMissingFields();

      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Required Fields',
        detail: missingFields.length
          ? `Please fill: ${missingFields.join(', ')}`
          : 'Please fill all required fields.',
        life: 4000
      });
      return;
    }

    if (this.mode === 'create') {
      this.startTimeArray = this.parseTime(this.shiftForm.get('startTime')?.value).split(' ');
      this.endTimeArray = this.parseTime(this.shiftForm.get('endTime')?.value).split(' ');
      const payload = {
        shiftName: this.shiftForm.get('shiftName')?.value,
        shiftDescription: this.shiftForm.get('shiftDescription')?.value,
        startTime: this.startTimeArray,
        endTime: this.endTimeArray,
        appId: this.shiftForm.get('appId')?.value,
        orgId: this.shiftForm.get('orgId')?.value,
        hourFormat: this.shiftForm.get('hourFormat')?.value
      };
      this.orgAdminService.postShift(payload).subscribe({
        next: (res: any) => {
          console.log(res);
          this.ref.close({ status: true });
        },
        error: (err) => {}
      });
    } else {
      const payload = {
        shiftId: this.shiftId,
        ...this.shiftForm.getRawValue()
      };
      this.orgAdminService.updateShift(payload).subscribe({
        next: (res: any) => {
          this.ref.close({ status: true });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error While updating shift', life: 3000 });
        }
      });
    }
  }

  /**
   * Patches the application data to the shiftForm
   * @param {any} shift - shift data
   * @returns {void} - returns nothing (i.e) void
   */
  patchValue(shift: any): void {
    this.shiftForm.patchValue({
      shiftName: shift.shiftName,
      shiftDescription: shift.shiftDescription,
      startTime: shift.startTime[0] + ' ' + shift.startTime[1],
      endTime: shift.endTime[0] + ' ' + shift.endTime[1],
      hourFormat: shift?.hourFormat
    })
  }

  private fieldLabels: Record<string, string> = {
    shiftName: 'Shift Name',
    shiftDescription: 'Shift Description',
    startTime: 'Start Time',
    endTime: 'End Time',
    hourFormat: 'Hour Format',
    appId: 'Application',
    orgId: 'Organization'
  };

  private getMissingFields(): string[] {
    return Object.keys(this.shiftForm.controls)
      .filter((key) => {
        const control = this.shiftForm.get(key);
        return !!control && control.invalid;
      })
      .map((key) => this.fieldLabels[key] ?? key);
  }

  parseTime(Date: any) {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(Date);
  }

  parse(date: any) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(parsedDate);
    } else {
      return date;
    }
  }
}
