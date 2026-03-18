import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrganizationAdministrationService } from '../../../organization-administration.service';

@Component({
  selector: 'app-manage-frequency',
  standalone: false,
  templateUrl: './manage-frequency.component.html',
  styleUrl: './manage-frequency.component.css'
})
export class ManageFrequencyComponent {
  /**
     * @property {FormGroup} appForm - Form group that holds frequency form controls.
     */
  freqForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
   * @property {string} appId - stores the app Id.
   */
  appId: string


  /**
   * @property {string} freqId - stores the freqId when the mode is edit.
   */
  freqId: string = '';

  superType = [
    {
      name: 'Hour',
      type: 'H'
    },
    {
      name: 'Day',
      type: 'D'
    },
    {
      name: 'Week',
      type: 'W'
    },
    {
      name: 'Month',
      type: 'M'
    },
    {
      name: 'Quarterly',
      type: 'Q'
    },
    {
      name: 'Semi Annual',
      type: 'S'
    },
    {
      name: 'Year',
      type: 'Y'
    }
  ]

  daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

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
    protected ref: DynamicDialogRef,
    private orgAdminService: OrganizationAdministrationService,
    private config: PrimeNG,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.appId = this.dialogConfig.data?.appId || null;
    this.freqForm = this.fb.group({
      frequencyName: new FormControl<string>('', [Validators.required]),
      frequencyType: new FormControl<string>(''),
      frequencyDescription: new FormControl<string>('', [Validators.required]),
      appId: new FormControl<string>(this.appId, [Validators.required]),
      superType: new FormControl<string>(''),
      duration: new FormControl<string>(''),
      startTime: new FormControl<string>(''),
    });

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.freqId = this.dialogConfig.data?.appData?.freqId
      this.patchValue(this.dialogConfig.data?.appData)
    }
  }

  /**
   * Validates the freqForm.
   * If its is valid calls the createApp method from org Admin service to create an app by passing the appForm Value.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */


   onCancel(): void {
    this.ref.close();
  }
  createFrequency(): void {
    if (this.freqForm.valid) {
      if (this.mode === 'create') {
        this.orgAdminService.createFrequency(this.freqForm.getRawValue()).subscribe({
          next: (res: any) => {
            this.ref.close({ status: true });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While creating freq", life: 3000 });
          }
        })
      }
      else {
        const payload = {
          freqId: this.freqId,
          ...this.freqForm.getRawValue()
        }
        this.orgAdminService.updateRole(payload).subscribe({
          next: (res: any) => {
            this.ref.close({ status: true });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While updating freq", life: 3000 });
          }
        })
      }
    }
  }

  /**
   * Patches the frequency data to the freqForm
   * @param {any} freq - frequency data
   * @returns {void} - returns nothing (i.e) void
   */
  patchValue(freq: any): void {
    console.log(freq)
    this.freqForm.patchValue({
      frequencyName: freq.frequencyName,
      frequencyDescription: freq.frequencyDescription,
      appId: freq.appId,
      frequencyType: freq.frequency
    })
  }
}
