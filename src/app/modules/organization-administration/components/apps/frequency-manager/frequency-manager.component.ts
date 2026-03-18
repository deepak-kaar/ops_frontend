import { DatePipe } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { TableRowSelectEvent, Table } from 'primeng/table';
import { OrganizationAdministrationService } from '../../../organization-administration.service';
import { ManageOrgComponent } from '../../dialogs/manage-org/manage-org.component';
import { ManageFrequencyComponent } from '../../dialogs/manage-frequency/manage-frequency.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { ConfirmationService } from 'primeng/api';

/**
 * @component
 * @description
 * The `FrequencyManagerComponent` is responsible for managing frequency for an application in the organization administration module.
 * It retrieves the list of organzations, allows selection, creation, editing, and deletion of frequency.
 */
@Component({
  selector: 'app-frequency-manager',
  standalone: false,
  templateUrl: './frequency-manager.component.html',
  styleUrl: './frequency-manager.component.css',
  encapsulation: ViewEncapsulation.None
})
export class FrequencyManagerComponent {

  /**
    * @property {FormGroup} appForm - Form group that holds application form controls.
    */
  freqForm: FormGroup;

  /**
   * @Input {any[]} freqs - Acts as components input prop to get the list of appId from the parent component.
   */
  @Input() appId!: string

  /**
  * @property {any[]} freqs - Stores the list of applications fetched from the backend.
  */
  freqs: any[] = [];

  /**
   * @property {boolean} isShowUi - boolean to render the Ui.
   */
  isShowUi: boolean = false

  /**
   * @property {any} selectedFreq - Stores the currently selected `Frequency.
   */
  selectedFreq: any;

  /**
  * @property {any} selectedOrgs - Stores the currently selected organizations.
  */
  selectedOrgs: any;

  /**
   * @property {unknown} loading - Indicates the loading state (can be replaced with a boolean for better clarity).
   */
  loading: unknown;

  /**
   * @property {any} searchValue - Stores the search input value for filtering applications.
   */
  searchValue: any;

  /**
   * @property {DynamicDialogRef} appRef - Reference to the dynamic dialog used for displaying application-related dialogs.
   * It helps in opening, closing, and managing the dialog state dynamically.
   */
  appRef!: DynamicDialogRef;

  /**
   * @property {boolean} isShowOrdDetails - Indicates whether to show the organiation details .
   */
  isShowOrdDetails: boolean = false

  /**
   * @property {string[]} orgActions - Stores the options for organization Action selection Button.
   */
  orgActions: string[] = ["Operating Organization Details", "Role Administration", "Data Access", "Group Administration",
    "Shift Administration",];


  /**
   * @property {any} selectedOrgAction - Stores the currently selected Organization action.
   */
  selectedOrgAction: any;

  /**
   * @property {any} orgId - Stores the currently selected Organization Id.
   */
  freqId: any;

  /**
  * @property {any} dataAccess - Stores the currently selected Organization data Access.
  */
  dataAccess: any;


   /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
   isMobile$!: Observable<boolean>;

 /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } =breakPointForToastComponent;

   appActions: string[] = [
    "Data Migration Import",
    "Data Migration Export",
    "Create New Frequency"
  ]
  selectedAction!: string;


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
   * Constructor injects necessary services.
   * @constructor
   * @param {OrganizationAdministrationService} orgAdminService - Service to interact with the backend for fetching and managing applications.
   * @param {DialogService} dialog - Primeng dialog Service to interact with dialog components.
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders.
   * @param {Router} router - Angular Router service to interact router
   * @param {FormBuilder} fb - Form builder service for handling reactive forms.
   * @param {MessageService}  messageService - Primeng Message service to intearct with toast
   * @param {ConfirmationService} confirmationService - Primeng Confirmation Service to handle confirmation dialogs.
   */
  constructor(private orgAdminService: OrganizationAdministrationService,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private datePipe: DatePipe,
    private responsive: ResponsiveService,
    private confirmationService: ConfirmationService
  ) {
    this.freqForm = this.fb.group({
      frequencyName: new FormControl<string>('', [Validators.required]),
      frequencyType: new FormControl<string>('', [Validators.required]),
      frequencyDescription: new FormControl<string>('', [Validators.required]),
      appId: new FormControl<string>(this.appId, [Validators.required]),
      createdOn: new FormControl<string>({ value: '', disabled: true }),
      createdBy: new FormControl<string>({ value: '', disabled: true }),
      modifiedOn: new FormControl<string>({ value: '', disabled: true }),
      modifiedBy: new FormControl<string>({ value: '', disabled: true }),
      superType: new FormControl<string>(''),
      duration: new FormControl<string>(''),
      startTime: new FormControl<string>(''),
    });

  }

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * sets the selectedOrgActions as Operating Organization Details by using the orgActions array index
   * Fetches the list of applications from the backend.
   * @returns {void} - returns nothing i.e(void)
   */
  ngOnInit(): void {
    this.selectedOrgAction = this.orgActions[0]
    this.getFreqs()
    this.isMobile$ = this.responsive.isMobile$()
  }

  /**
   * Fetches the list of applications from the backend and assigns it to the `freqs` array.
   * @returns {void} - returns nothing i.e(void)
   */
  getFreqs(): void {
    this.spinner.show();
    this.orgAdminService.getFrequencyList({ appId: this.appId }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.freqs = res.freqs
        this.isShowUi = true;
      },
      error: (err) => {
        console.log(err);
        this.spinner.hide();
        this.isShowUi = true;
        this.freqs = []
      }
    })
  }




  /**
   * Opens the ManageOrg Component with mode as create to create an application.
   * Subscribes the dialog close method and calls the getOrg method to refresh the list of freqs after creation.
   * @returns {void} - returns nothing (i.e) void
   */
  createFreq(): void {
    this.appRef = this.dialog.open(ManageFrequencyComponent, {
      header: 'Create Frequency',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        appId: this.appId
      },
      // width: '800px',
      width:getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      this.selectedAction = '';
      if (res.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Frequency created successfully', life: 20000 });
      }
      this.getFreqs();
    });
  }


  /**
   * Handles application selection from a table.
   * @param {TableRowSelectEvent} freq - The event object containing details of the selected row.
   */
  onFreqSelect(freq: TableRowSelectEvent) {
    this.getFreqDetails(freq.data?.frequencyId);
    this.freqId = freq.data?.frequencyId;
    this.isShowOrdDetails = true;
  }

  /**
     * Handles application unselection from a table.
     * @param {TableRowSelectEvent} app - The event object containing details of the unselected row.
     */
  onFreqUnSelect(app: any) {
    this.isShowOrdDetails = false;
  }

  /**
   * Clears the table filter/search.
   * @param {Table} _t19 - The table reference whose filter should be cleared.
   */
  onGlobalFilter(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    table.filterGlobal(value, 'contains');
  }

  clear(table: Table): void {
    this.searchValue = '';
    table.clear();
  }

  /**
   * Deletes an existing Organization.
   * @param {string} freqId - The orgId to be deleted.
   */
// ...existing code...

confirmDelete(event: Event, frequencyId: number | string): void {
  event?.stopPropagation?.();
  this.confirmationService.confirm({
    header: 'Delete Confirmation',
    message: 'Are you sure you want to delete this frequency?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
    accept: () => this.deleteFreq(String(frequencyId))
  });
}

deleteFreq(freqId: string): void {
  this.orgAdminService.deleteFrequency(freqId).subscribe({
    next: (res: any) => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Frequency deleted successfully', life: 20000 });
      this.getFreqs();
      this.isShowOrdDetails = false;
    },
    error: (err) => {}
  });
}

// ...existing code...

  /**
   * Patches the application data to the freqForm
   * @param {any} freq - frequency data
   * @returns {void} - returns nothing (i.e) void
   */
  patchValue(freq: any): void {
    this.freqForm.patchValue({
      appId: freq.appId,
      frequencyName: freq.frequencyName,
      frequencyDescription: freq.frequencyDescription,
      frequencyType: freq.frequencyType,
      createdOn: this.datePipe.transform(new Date(freq.createdOn), 'medium'),
      createdBy: freq.createdBy || '',
      modifiedOn: this.datePipe.transform(new Date(freq.modifiedOn), 'medium') || '',
      modifiedBy: freq.modifiedBy,
      superType: freq.superType,
      duration: freq.duration,
      startTime: freq.startTime,
    })
  }

  /**
   * calls the updateOrg service by passing the freqForm data
   * creates a new payload object with org id and the org form data
   * shows the success or failure message in the toast bar with the help of prime ng message service
   * @returns {void} - returns nothing (i.e) void
   */
  updateFreq(): void {
    const payload = {
      freqId: this.freqId,
      ...this.freqForm.getRawValue()
    }
    this.orgAdminService.updateFrequency(payload).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Frequency Updated Successfully", life: 3000 });
        this.isShowOrdDetails = false;
        this.getFreqs();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While updating role", life: 3000 });
      }
    })
  }

  /**
   * calls the getFrequencyDetails service by passing the freqId
   * calls the patchvalue method by passing the result if the request is success
   * shows error message in the toast bar with the help of prime ng message service
   * @param {string} freqId - freqId
   * @returns {void} - returns nothing (i.e) void
   */
  getFreqDetails(freq: string): void {
    this.orgAdminService.getFrequencyDetails(freq).subscribe({
      next: (res: any) => {
        this.patchValue(res.frequency);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While fetching Freq details", life: 3000 });
      }
    })
  }

}
