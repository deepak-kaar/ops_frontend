import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { TableRowSelectEvent, Table } from 'primeng/table';
import { OrganizationAdministrationService } from '../../../organization-administration.service';
import { ManageGroupComponent } from '../../dialogs/manage-group/manage-group.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

/**
 * @component
 * @description
 * The `GroupsManagerComponent` is responsible for managing groups in the organization administration module.
 * It retrieves the list of applications, allows selection, creation, editing, and deletion of groups.
 */
@Component({
  selector: 'app-groups-manager',
  standalone: false,
  templateUrl: './groups-manager.component.html',
  styleUrl: './groups-manager.component.css',
  encapsulation:ViewEncapsulation.None
})
export class GroupsManagerComponent {
  /**
   * @Input {string} appId - Acts as components input prop to get the appId from the parent component.
   */
  @Input() appId!: string

  /**
   * @Input {string} orgId - Acts as components input prop to get the orgId from the parent component.
   */
  @Input() orgId!: string

  /**
    * @property {any[]} groups - Stores the list of applications fetched from the backend.
    */
  groups: any[] = [];

  /**
   * @property {any} selectedGroup - Stores the currently selected application.
   */
  selectedGroup: any;

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
    this.getGroups();
    this.isMobile$ = this.responsive.isMobile$()
  }

  ngOnChanges() {
    this.getGroups();
  }
  
  /**
   * Fetches the list of applications from the backend and assigns it to the `groups` array.
   * @returns {void} - returns nothing i.e(void)
   */
  getGroups(): void {
    this.spinner.show();
    this.orgAdminService.getGroups({ orgId: this.orgId }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.groups = res.Groups
      },
      error: (err) => {
        this.spinner.hide();
        if (err.error.token === '404' && err.error.response === 'groups not found')
          this.groups = []
      }
    })
  }

  /**
   * Opens the ManageApp Component with mode as create to create an application.
   * Subscribes the dialog close method and calls the getApp method to refresh the list of groups after creation.
   * @returns {void} - returns nothing (i.e) void
   */
  createGroup(): void {
    this.appRef = this.dialog.open(ManageGroupComponent, {
      header: 'Create Group',
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
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group created successfully', life: 3000 });
        this.getGroups();
      }
    });
  }

  /**
   * Handles application selection from a table.
   * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
   */
  onGroupSelect(app: TableRowSelectEvent) {
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
  copyGroup(_t59: any) {
    // TODO: Implement app copy logic
  }

  /**
   * Edits an existing application.
   * @param {any}group - The application data to be edited.
   */
  editGroup(group: any) {
    this.appRef = this.dialog.open(ManageGroupComponent, {
      header: 'Edit Group',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        appId: this.appId,
        orgId: this.orgId,
        groupData: group
      },
      // width: '800px',
      width:getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status)
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'App updated successfully', life: 3000 });
      this.getGroups();
    });
  }

  /**
   * Deletes an existing application.
   * Opens the toast by using primeng message sevice and shows the message
   * @param {string} groupId - The application data to be deleted.
   */
  deleteGroup(event: any, groupId: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this Group?',
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
        this.orgAdminService.deleteGroup(groupId).subscribe({
          next: (res: any) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group deleted successfully', life: 3000 });
            this.getGroups();
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
