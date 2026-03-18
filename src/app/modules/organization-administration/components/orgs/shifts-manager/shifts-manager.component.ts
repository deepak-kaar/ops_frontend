import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { TableRowSelectEvent, Table } from 'primeng/table';
import { OrganizationAdministrationService } from '../../../organization-administration.service';
import { ManageShiftComponent } from '../../dialogs/manage-shift/manage-shift.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

/**
 * @component
 * @description
 * The `ShiftsManagerComponent` is responsible for managing shifts in the organization administration module.
 * It retrieves the list of applications, allows selection, creation, editing, and deletion of shifts.
 */
@Component({
  selector: 'app-shifts-manager',
  standalone: false,
  templateUrl: './shifts-manager.component.html',
  styleUrl: './shifts-manager.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ShiftsManagerComponent {

  /**
   * @Input {string} appId - Acts as components input prop to get the appId from the parent component.
   */
  @Input() appId!: string

  /**
   * @Input {string} orgId - Acts as components input prop to get the orgId from the parent component.
   */
  @Input() orgId!: string

  /**
    * @property {any[]} shifts - Stores the list of applications fetched from the backend.
    */
  shifts: any[] = [];

  /**
   * @property {any} selectedShift - Stores the currently selected application.
   */
  selectedShift: any;

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
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
   isMobile$!: Observable<boolean>;

    /**
       * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
       */
     breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;



  /**
   * Constructor injects necessary services.
   * @constructor
   * @param {OrganizationAdministrationService} orgAdminService - Service to interact with the backend for fetching and managing applications.
   * @param {DialogService} dialog - Primeng dialog Service to interact with dialog components.
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders.
   * @param {Router} router - Angular Router service to interact router,
   * @param {MessageService}  messageService - Primeng Message service to intearct with toast
   */
  constructor(private orgAdminService: OrganizationAdministrationService,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private responsive: ResponsiveService
  ) {

  }

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * Fetches the list of applications from the backend.
   * @returns {void} - returns nothing i.e(void)
   */
  ngOnInit(): void {
    this.getShifts();
    this.isMobile$ = this.responsive.isMobile$();
  }

  ngOnChanges() {
    this.getShifts();
  }

  onGlobalFilter(table: Table, event: Event): void {
  const value = (event.target as HTMLInputElement)?.value ?? '';
  table.filterGlobal(value, 'contains');
}



  /**
   * Fetches the list of applications from the backend and assigns it to the `shifts` array.
   * @returns {void} - returns nothing i.e(void)
   */
  getShifts(): void {
    this.spinner.show();
    this.orgAdminService.getShifts({ orgId: this.orgId }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.shifts = res.Shifts
      },
      error: (err) => {
        this.spinner.hide();
        if (err.error.token === '404' && err.error.response === 'shifts not found')
          this.shifts = []
      }
    })
  }

  /**
   * Opens the ManageApp Component with mode as create to create an application.
   * Subscribes the dialog close method and calls the getApp method to refresh the list of shifts after creation.
   * @returns {void} - returns nothing (i.e) void
   */
  createShift(): void {
    this.appRef = this.dialog.open(ManageShiftComponent, {
      header: 'Create Shift',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        appId: this.appId,
        orgId: this.orgId
      },
      // width: '800px',
      width:getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Shift created successfully', life: 3000 });
        this.getShifts();
      }
    });
  }

  /**
   * Handles application selection from a table.
   * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
   */
  onShiftSelect(app: TableRowSelectEvent) {
  }


  /**
   * Clears the table filter/search.
   * @param {Table} _t19 - The table reference whose filter should be cleared.
   */
  clear(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  /**
   * Copies an existing application.
   * @param {any} _t59 - The application data to be copied.
   */
  copyShift(_t59: any) {
    // TODO: Implement app copy logic
  }

  /**
   * Edits an existing application.
   * @param {any}shift - The application data to be edited.
   */
  editShift(shift: any) {
    this.appRef = this.dialog.open(ManageShiftComponent, {
      header: 'Edit Shift',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        appId: this.appId,
        orgId: this.orgId,
        shiftData: shift
      },
      // width: '800px',
      width:getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status)
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'App updated successfully', life: 3000 });
      this.getShifts();
    });
  }

  /**
   * Deletes an existing application.
   * opens the confirm dialog using primeng confirmation service
   * Opens the toast by using primeng message sevice and shows the message
   * @param {string} shiftId - The application data to be deleted.
   */
  deleteShift(event: any, shiftId: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },

      accept: () => {
        this.orgAdminService.deleteShift(shiftId).subscribe({
          next: (res: any) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Shift deleted successfully', life: 3000 });
            this.getShifts();
          },
          error: (err) => {

          }
        })
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      },
    });
  }
}
