import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { TableRowSelectEvent, Table } from 'primeng/table';
import { OrganizationAdministrationService } from '../../organization-administration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageRoleComponent } from '../../components/dialogs/manage-role/manage-role.component';
import { MessageService } from 'primeng/api';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-roles',
  standalone: false,
  templateUrl: './roles-manager.component.html',
  styleUrl: './roles-manager.component.css',
  encapsulation: ViewEncapsulation.None
})
export class RolesManagerComponent implements OnInit {
  /**
   * @property {any[]} roles - Stores the list of roles fetched from the backend.
   */
  roles: any[] = [];

  /**
   * @property {any} selectedApp - Stores the currently selected application.
   */
  selectedRole: any;

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
      * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
      */
    breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  activeCardIndex: number = 1;

  cardList = [{
    name: 'Application',
    svg: `<svg width="42" height="41" viewBox="0 0 42 41" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse opacity="0.07" cx="21" cy="20.5" rx="21" ry="20" fill="var(--p-surface-300)" />
                        <g clip-path="url(#clip0_1002_7972)">
                            <path
                                d="M27.3 13.5654H14.7001C14.1826 13.5654 13.7631 13.8761 13.7631 14.2594V27.741C13.7631 28.1243 14.1826 28.435 14.7001 28.435H27.3C27.8174 28.435 28.2369 28.1243 28.2369 27.741V14.2594C28.2369 13.8761 27.8174 13.5654 27.3 13.5654Z"
                                stroke="var(--p-primary-color)" stroke-miterlimit="10" />
                            <path
                                d="M20.9517 17.0348C20.3987 16.7701 19.7387 16.6561 19.0847 16.7122C18.4307 16.7683 17.8234 16.991 17.3666 17.3422C16.9099 17.6934 16.6322 18.1513 16.581 18.6374C16.5298 19.1236 16.7084 19.6078 17.0861 20.0072"
                                stroke="var(--p-primary-color)" stroke-linecap="round" stroke-linejoin="round" />
                            <path
                                d="M24.8164 20.0071C25.1949 19.6078 25.3741 19.1235 25.3233 18.6371C25.2725 18.1507 24.9949 17.6926 24.538 17.3412C24.0811 16.9898 23.4734 16.767 22.8191 16.7111C22.1648 16.6552 21.5046 16.7696 20.9517 17.0347"
                                stroke="var(--p-primary-color)" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20.9567 22.6916C20.9567 22.6916 17.9373 20.9928 17.0911 20.0068"
                                stroke="var(--p-primary-color)" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20.9559 22.691C20.9559 22.691 23.9736 20.9922 24.8215 20.0068"
                                stroke="var(--p-primary-color)" stroke-linecap="round" stroke-linejoin="round" />
                            <path
                                d="M16.7969 19.4664H18.6784L19.4967 17.9717L20.3293 20.8292L21.4138 18.4515L22.2422 20.387L22.8798 19.4664H25.0886"
                                stroke="var(--p-primary-color)" stroke-width="0.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M16.6205 25.2607H25.3048" stroke="var(--p-primary-color)" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </g>
                        <defs>
                            <clipPath id="clip0_1002_7972">
                                <rect width="16" height="16" fill="white" transform="translate(13 13)" />
                            </clipPath>
                        </defs>
                    </svg>`
  },
  {
    name: 'Roles',
    svg: `<svg width="42" height="41" viewBox="0 0 42 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse opacity="0.07" cx="21" cy="20.5" rx="21" ry="20" fill="var(--p-surface-300)" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M15 15.5C14.7239 15.5 14.5 15.7239 14.5 16V17C14.5 17.2761 14.7239 17.5 15 17.5H16C16.2761 17.5 16.5 17.2761 16.5 17V16C16.5 15.7239 16.2761 15.5 16 15.5H15ZM16 16H15V17H16V16Z"
                            fill="var(--p-primary-color)" />
                        <path
                            d="M18 16.5C18 16.2239 18.2239 16 18.5 16H27.5C27.7761 16 28 16.2239 28 16.5C28 16.7761 27.7761 17 27.5 17H18.5C18.2239 17 18 16.7761 18 16.5Z"
                            fill="var(--p-primary-color)" />
                        <path
                            d="M18.5 20C18.2239 20 18 20.2239 18 20.5C18 20.7761 18.2239 21 18.5 21H27.5C27.7761 21 28 20.7761 28 20.5C28 20.2239 27.7761 20 27.5 20H18.5Z"
                            fill="var(--p-primary-color)" />
                        <path
                            d="M18.5 24C18.2239 24 18 24.2239 18 24.5C18 24.7761 18.2239 25 18.5 25H27.5C27.7761 25 28 24.7761 28 24.5C28 24.2239 27.7761 24 27.5 24H18.5Z"
                            fill="var(--p-primary-color)" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M14.5 20C14.5 19.7239 14.7239 19.5 15 19.5H16C16.2761 19.5 16.5 19.7239 16.5 20V21C16.5 21.2761 16.2761 21.5 16 21.5H15C14.7239 21.5 14.5 21.2761 14.5 21V20ZM15 20H16V21H15V20Z"
                            fill="var(--p-primary-color)" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M15 23.5C14.7239 23.5 14.5 23.7239 14.5 24V25C14.5 25.2761 14.7239 25.5 15 25.5H16C16.2761 25.5 16.5 25.2761 16.5 25V24C16.5 23.7239 16.2761 23.5 16 23.5H15ZM16 24H15V25H16V24Z"
                            fill="var(--p-primary-color)" />
                    </svg>`
  }];


  /**
   * Constructor injects necessary services.
   * @constructor
   * @param {OrganizationAdministrationService} orgAdminService - Service to interact with the backend for fetching and managing applications.
   * @param {DialogService} dialog - Primeng dialog Service to interact with dialog components.
   * @param {MessageService}  messageService - Primeng Message service to intearct with toast
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders
   */
  constructor(
    private orgAdminService: OrganizationAdministrationService,
    public sanitizer: DomSanitizer,
    private router: Router,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private responsive: ResponsiveService
  ) {

  }

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * Fetches the list of applications from the backend.
   * @returns {void} - returns nothing i.e(void)
   */
  ngOnInit(): void {
    this.getRoles()
    this.isMobile$ = this.responsive.isMobile$()
  }

  change(id: number) {
    if (id === 0) {
      this.router.navigateByUrl('/orgAdmin/appAdmin/home/appsManager');
    }
    else if (id === 1) {
      this.router.navigateByUrl('/orgAdmin/appAdmin/home/rolesManager');
    }
    this.activeCardIndex = id;
  }

  /**
   * Fetches the list of applications from the backend and assigns it to the `roles` array.
   * calls the show method from spinner service to show the loader before getRoles method and hides after fetching.
   * @returns {void} - returns nothing i.e(void)
   */
  getRoles(): void {
    this.spinner.show();
    this.orgAdminService.getRoles({ roleLevel: 'OpsInsight', roleLevelId: null }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.roles = res.roles
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  /**
   * Opens the ManageRole Component with mode as create to create a role.
   * Subscribes the dialog close method and calls the getApp method to refresh the list of roles after creation.
   * @returns {void} - returns nothing (i.e) void
   */
  createRole(): void {
    this.appRef = this.dialog.open(ManageRoleComponent, {
      header: 'Create Role',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        roleLevel: 'OpsInsight'
      },
      // width: '800px',
      width:getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res.status)
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role created successfully', life: 3000 });
      this.getRoles();
    });
  }

  /**
   * Handles application selection from a table.
   * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
   */
  onRoleSelect($event: TableRowSelectEvent) {
    // TODO: Implement role selection logic
  }

  /**
   * Handles application deselection.
   */
  onRoleUnSelect() {
    // TODO: Implement role deselection logic
  }

  /**
   * Clears the table filter/search.
   * @param {Table} _t19 - The table reference whose filter should be cleared.
   */
  clear(_t19: Table) {
    this.searchValue = '';
    _t19.clear();
  }

  /**
   * Copies an existing application.
   * @param {any} _t59 - The application data to be copied.
   */
  copyRole(_t59: any) {
    // TODO: Implement role copy logic
  }

  /**
   * Edits an existing role.
   * @param {any}role - The role data to be edited.
   */
  editRole(role: any) {
    this.appRef = this.dialog.open(ManageRoleComponent, {
      header: 'Edit App',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        appData: role,
        roleLevel: 'OpsInsight'
      },
      // width: '800px',
      width:getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res.status)
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role updated successfully', life: 3000 });
      this.getRoles();
    });
  }

  /**
   * Deletes an existing role.
   * @param {string} roleId - The role id to be deleted.
   */
  deleteRole(roleId: string) {
    this.orgAdminService.deleteRole(roleId).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role deleted successfully', life: 3000 });
        this.getRoles();
      },
      error: (err) => {

      }
    })
  }

  onGlobalFilter(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    table.filterGlobal(value, 'contains');
  }
}
