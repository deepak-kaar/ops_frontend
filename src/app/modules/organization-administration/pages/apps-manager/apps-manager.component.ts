import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { take } from 'rxjs';
import {
  DeleteConfirmationDialogComponent,
  DeleteConfirmationDialogResult
} from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { TableRowSelectEvent } from 'primeng/table';
import { Table } from 'primeng/table';
import { OrganizationAdministrationService } from 'src/app/modules/organization-administration/organization-administration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { PostLogsComponent } from '../../components/dialogs/post-logs/post-logs.component';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * @component
 * @description
 * The `AppsManagerComponent` is responsible for managing applications in the organization administration module.
 * It retrieves the list of applications, allows selection, creation, editing, and deletion of applications.
 */
@Component({
  selector: 'app-app-manager',
  standalone: false,
  templateUrl: './apps-manager.component.html',
  styleUrl: './apps-manager.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppsManagerComponent implements OnInit {
  loading: boolean = false;

  private getCurrentUserName(): string {
    const user = localStorage.getItem('userName')
      || localStorage.getItem('username')
      || sessionStorage.getItem('userName');
    return user || 'system';
  }

  /**
  * @property {any[]} apps - Stores the list of applications fetched from the backend.
  */
  apps: any[] = [];

  /**
   * @property {any} selectedApp - Stores the currently selected application.
   */
  selectedApp: any;

  /**
   * @property {any} searchValue - Stores the search input value for filtering applications.
   */
  searchValue = '';

  /**
   * @property {DynamicDialogRef} logRef - Reference to the dynamic dialog used for displaying application-related dialogs.
   * It helps in opening, closing, and managing the dialog state dynamically.
   */
  logRef!: DynamicDialogRef;

  /**
   * @property {boolean} isOpsAdmin - stores the boolean value.
   * It helps to hide the create App and roles segment for appAdmins.
   */
  isOpsAdmin: boolean = false;

  /**
   * @property {string} url - stores the url path.
   * It helps to hide the create App and roles segment for appAdmins.
   */
  url: string = '';

  /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;
    activeCardIndex: number = 0;


  /**
   * Constructor injects necessary services.
   * @constructor
   * @param {OrganizationAdministrationService} orgAdminService - Service to interact with the backend for fetching and managing applications.
   * @param {DialogService} dialog - Primeng dialog Service to interact with dialog components.
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders.
   * @param {Router} router - Angular Router service to interact router,
   * @param {MessageService}  messageService - Primeng Message service to intearct with toast
   */
  constructor(
    private orgAdminService: OrganizationAdministrationService,
    public sanitizer: DomSanitizer,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private responsive: ResponsiveService,
    private readonly dialogService: DialogService
  ) {
    this.url = this.router.url.split('/')[2];
    if (this.url === 'opsAdmin') {
      this.isOpsAdmin = true;
    }
  }



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
    },
        // {
        //     name: 'Users',
        //     svg: `<svg width="42" height="41" viewBox="0 0 42 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        //                     <ellipse opacity="0.07" cx="21" cy="20.5" rx="21" ry="20" fill="var(--p-surface-300)" />
        //                     <path
        //                         d="M25.5 27C25.5 27 26.5 27 26.5 26C26.5 25 25.5 22 21.5 22C17.5 22 16.5 25 16.5 26C16.5 27 17.5 27 17.5 27H25.5ZM17.5223 26C17.5189 25.9996 17.514 25.999 17.5081 25.998C17.5054 25.9975 17.5027 25.997 17.5 25.9965C17.5015 25.7325 17.6669 24.9669 18.2593 24.2758C18.8133 23.6294 19.7827 23 21.5 23C23.2173 23 24.1867 23.6294 24.7407 24.2758C25.3331 24.9669 25.4985 25.7325 25.5 25.9965C25.4973 25.997 25.4946 25.9975 25.4919 25.998C25.486 25.999 25.4811 25.9996 25.4777 26H17.5223Z"
        //                         fill="var(--p-primary-color)" />
        //                     <path
        //                         d="M21.5 20C22.6046 20 23.5 19.1046 23.5 18C23.5 16.8954 22.6046 16 21.5 16C20.3954 16 19.5 16.8954 19.5 18C19.5 19.1046 20.3954 20 21.5 20ZM24.5 18C24.5 19.6569 23.1569 21 21.5 21C19.8431 21 18.5 19.6569 18.5 18C18.5 16.3431 19.8431 15 21.5 15C23.1569 15 24.5 16.3431 24.5 18Z"
        //                         fill="var(--p-primary-color)" />
        //                 </svg>`
        // }
    ]

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * Fetches the list of applications from the backend.
   * @returns {void} - returns nothing i.e(void)
   */


   change(id: number) {
        if (id === 0) {
            this.router.navigateByUrl('/orgAdmin/appAdmin/home/appsManager');
        }
        else if (id === 1) {
            this.router.navigateByUrl('/orgAdmin/appAdmin/home/rolesManager');
        }
        this.activeCardIndex = id;
    }
  ngOnInit(): void {
    this.getApps()
    this.isMobile$ = this.responsive.isMobile$()
  }

  /**
   * Fetches the list of applications from the backend and assigns it to the `apps` array.
   * @returns {void} - returns nothing i.e(void)
   */
  getApps(): void {
    this.spinner.show();
    this.orgAdminService.getApps().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.apps = res.apps
      },
      error: (err) => {
        this.spinner.hide();
        if (err.error.token === '404' && err.error.response === 'Apps not found')
          this.apps = []
      }
    })
  }


  postLogs() {
    this.logRef = this.dialog.open(PostLogsComponent, {
      modal: true,
      header: 'Post Logs',
      closable: true
    });
  }

  /**
   * Opens the ManageApp Component with mode as create to create an application.
   * Subscribes the dialog close method and calls the getApp method to refresh the list of apps after creation.
   * @returns {void} - returns nothing (i.e) void
   */
  createApp(): void {
    this.router.navigate(['../apps/create'], { relativeTo: this.route });
  }

  /**
   * Handles application selection from a table.
   * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
   */
  onAppSelect(app: TableRowSelectEvent) {

    this.router.navigate(['orgAdmin/appAdmin/home/appDetail', app?.data?.appId], { state: { appName: app?.data?.appName } })
    // const url = this.router.serializeUrl(
    //   this.router.createUrlTree(['orgAdmin/appDetail', app?.data?.appId], {
    //     queryParams: { appName: app?.data?.appName }
    //   })
    // );

    // window.open(url, '_self');
  }

  /**
   * Clears the table filter/search.
   * @param {Table} _t19 - The table reference whose filter should be cleared.
   */
  clear(table: Table): void {
    this.searchValue = '';
    table.clear();
  }

  /**
   * Copies an existing application.
   * @param {any} _t59 - The application data to be copied.
   */
  copyApp(_t59: any) {
    // TODO: Implement app copy logic
  }

  /**
   * Edits an existing application.
   * @param {any}app - The application data to be edited.
   */
  editApp(app: any, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['../apps/edit', app?.appId], {
      relativeTo: this.route,
      state: { app }
    });
  }

  /**
   * Deletes an existing application.
   * opens an confirmation popup using primeng Confirmation service
   * Opens the toast by using primeng message sevice and shows the message
   * @param {string} appId - The application data to be deleted.
   *
   *
   *
   *
   */

   confirmDelete(app: any): void {
    const ref = this.dialogService.open(DeleteConfirmationDialogComponent, {
      showHeader: false,
      closable: false,
      modal: true,
      dismissableMask: true,
      width: '460px',
      styleClass: 'delete-confirmation-modal',
      data: {
        entityLabel: 'Application',
        itemName: app?.appName ?? '',
        title: 'Delete Application',
        subtitle: 'This action cannot be undone',
        confirmText: 'Delete Application',
        cancelText: 'Cancel'
      }
    });

    ref.onClose.pipe(take(1)).subscribe((result?: DeleteConfirmationDialogResult) => {
      if (result?.confirmed) {
        // keep your existing delete execution here
        // Example: this.deleteApp(app);
        this.deleteApp(app); // use your current delete method name/signature
      }
      // cancel/close => do nothing
    });
  }

  deleteApp(app: any): void {
    const id = String(app.appId);
    const payload = {
      deletedBy: this.getCurrentUserName(),
      deletedOn: new Date().toISOString(),
      appStatus: 'deleted'
    };

    this.orgAdminService.deleteApp(id, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `App deleted: ${app.appName}`,
          life: 3000
        });
        this.getApps();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.response || 'Delete failed'
        });
      }
    });
  }

  getSeverity(status: string) {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'deleted': return 'contrast';
      default: return 'secondary';
    }
  }

  getStatus(status: string) {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'deleted': return 'Deleted';
      default: return 'Unknown';
    }
  }

  onGlobalFilter(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    table.filterGlobal(value, 'contains');
  }
}
