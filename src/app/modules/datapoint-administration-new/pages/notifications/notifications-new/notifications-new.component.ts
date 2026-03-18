import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DeleteConfirmationDialogComponent, DeleteConfirmationDialogResult } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { PrimeNG } from 'primeng/config';
import { Subscription, combineLatest, tap, debounceTime } from 'rxjs';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { FilterService } from 'src/app/modules/datapoint-administration/services/filter/filter.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { TableColumn, TableAction, TableConfig } from 'src/app/core/components/table-wrapper/table-wrapper.component';

@Component({
  selector: 'app-notifications-new',
  standalone: false,
  templateUrl: './notifications-new.component.html',
  styleUrl: './notifications-new.component.css'
})
export class NotificationsNewComponent {
  app: string | undefined | null;
  org: string | undefined | null;
  private subscriptions: Subscription[] = [];
  selectedNotif: any;
  isShowDetails: boolean = false;
  notifActions = ['Notification Details'];
  selectedNotifAction: any;
  
  // Table configuration
  columns: TableColumn[] = [
    { field: 'notificationName', header: 'Notification Name', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'notificationDescription', header: 'Notification Description', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'notificationType', header: 'Notification Type', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' }
  ];
  
  actions: TableAction[] = [
    { icon: 'pi pi-trash', tooltip: 'Delete', severity: 'danger', action: 'delete' }
  ];
  
  tableConfig: TableConfig = {
    dataKey: 'notificationId',
    rows: 20,
    rowsPerPageOptions: [20, 30, 50],
    paginator: true,
    globalFilterFields: ['notificationName', 'notificationDesc', 'notificationLevel', 'status'],
    selectionMode: 'single',
    rowHover: true,
    emptyMessage: 'No Notifications found.',
    showCaption: true,
    showSearch: true,
    showClearFilter: true,
    searchPlaceholder: 'Search...',
    createButtonLabel: 'Create Notification',
    createButtonIcon: 'pi pi-plus',
    showCreateButton: true,
    showMobileView: false
  };

  mapCard(templateId: any) {
    this.router.navigate(['/globalRenderer/mapping', templateId]);
  }
  mapPage(templateId: any) {
    this.router.navigate(['/globalRenderer/mapping', templateId]);
  }

  isshowUi: boolean = false;
  notifications: any; // Stores the list of instances fetched from the server.
  manageEntity: boolean = false; // Indicates whether the "Manage Entity" sidebar is visible.

  /**
   * Constructor to inject required services.
   * @param {AdminService} adminService - Service for admin-related API calls.
   * @param {LoggerService} logger - Service for logging.
   * @param {MessageService} messageService - Service for displaying messages or notifications.
   * @param {PrimeNGConfig} config - PrimeNG configuration service.
   * @param {NgxSpinnerService} spinner - Service for displaying a loading spinner.
   * @param {Router} router - Service for routing
   */

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  constructor(private datapointAdminService: DatapointAdministrationService,
    private messageService: MessageService, private config: PrimeNG,
    private spinner: NgxSpinnerService, private router: Router,
    private filter: FilterService,
    private dialogService: DialogService
  ) { }

  /**
   * Lifecycle hook triggered after the component is initialized.
   * Fetches the list of entities from the server.
   */
  ngOnInit() {

    this.selectedNotifAction = this.notifActions[0];
    const combinedSubscription = combineLatest([
      this.filter.selectedApp$,
      this.filter.selectedOrg$
    ]).pipe(

      // // Prevent duplicate API calls when values haven't changed
      // distinctUntilChanged((prev, curr) => 
      //   JSON.stringify(prev) === JSON.stringify(curr)
      // ),
      // Add small debounce to handle rapid changes

      tap(() => this.spinner.show()),
      debounceTime(300)
    ).subscribe(([app, org]) => {
      this.app = app;
      this.org = org;
      this.getNotifications();
    });

    this.subscriptions.push(combinedSubscription);
  }

  /**
   * Fetches the list of entities from the server and updates the `events` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   */
  getNotifications() {
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };
    this.spinner.show();
    this.isShowDetails = false;
    this.datapointAdminService.getNotications(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.notifications = res.Notifications;
        this.isshowUi = true;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  /**
   * Handles the sidebar close event.
   * If the result indicates success, it refreshes the entity list and displays a success message.
   * Closes the "Manage Entity" sidebar.
   * @param {any} res - The result passed when the sidebar is closed.
   */
  handleSidebarClose(res: any) {
    if (res) {
      this.getNotifications();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Entity or Instance created succesfully', life: 3000 });
    }
    this.manageEntity = false;
  }



  openNotification(notification: string) {
    //this.router.navigate(['/datapointAdmin/home/ManageNotification', notification], { state: { appId: this.app, orgId: this.org } });
  }

  onFilterApply(filterParam: { appId: any, orgId: any }) {
    this.app = filterParam.appId || null
    this.org = filterParam.orgId || null
    this.getNotifications();
  }

  createNotification() {
    this.router.navigateByUrl('/datapointAdminV2/home/createNotificationNew', { state: { appId: this.app, orgId: this.org } })
  }

  /**
  * Lifecycle hook triggered after the time of component destroy.
  * unsubscribes the filter subscriptions
  */
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onNotifSelect(event: any): void {
    this.selectedNotif = event.data;
    this.isShowDetails = true;
  }
  
  onNotifUnSelect(event: any): void {
    this.selectedNotif = null;
    this.isShowDetails = false;
  }

  onAction(event: { action: string; row: any }): void {
    const { action, row } = event;
    if (action === 'delete') {
      this.deleteNotification(row.notificationId);
    }
  }

  deleteNotification(notificationId: string): void {
    this.onNotifUnSelect({});
    const ref = this.dialogService.open(DeleteConfirmationDialogComponent, {
      showHeader: false,
      closable: false,
      modal: true,
      dismissableMask: true,
      styleClass: 'delete-confirmation-modal',
      width: '460px',
      data: {
        entityLabel: 'Notification',
        itemName: '',
        title: 'Delete Notification',
        subtitle: 'This action cannot be undone',
        confirmText: 'Delete Notification',
        cancelText: 'Cancel'
      }
    });

    ref.onClose.subscribe((result?: DeleteConfirmationDialogResult) => {
      if (!result?.confirmed) return;
      this.spinner.show();
      this.datapointAdminService.deleteNotification(notificationId).subscribe({
        next: () => {
          this.spinner.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Notification deleted successfully' });
          this.getNotifications();
        },
        error: () => {
          this.spinner.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete entity' });
        }
      });
    });
  }

}
