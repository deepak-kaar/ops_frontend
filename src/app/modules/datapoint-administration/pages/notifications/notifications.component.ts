import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { Table, TableRowSelectEvent, TableRowUnSelectEvent } from 'primeng/table';
import { Subscription, combineLatest, tap, debounceTime } from 'rxjs';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { FilterService } from 'src/app/modules/datapoint-administration/services/filter/filter.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

/**
 * @component EventsComponent
 * This component manages the display and interaction with events. It retrieves the list of events
 * from the server, manages a button for events creation, and displays notifications for user actions.
 */
@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
  encapsulation:ViewEncapsulation.None
})
export class NotificationsComponent {

  searchValue: any;
  app: string | undefined | null;
  org: string | undefined | null;
  @ViewChild('dt') dt: Table | undefined;
  private subscriptions: Subscription[] = [];
  selectedNotif: any;
  isShowDetails: boolean = false;
  notifActions = ['Notification Details', 'Notification Mapping'];
  selectedNotifAction: any;

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
    breakPointForToastComponent: { [key: string]: any; } =breakPointForToastComponent;
    
  constructor(private datapointAdminService: DatapointAdministrationService,
    private messageService: MessageService, private config: PrimeNG,
    private spinner: NgxSpinnerService, private router: Router,
    private filter: FilterService
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
      this.getEvents();
    });

    this.subscriptions.push(combinedSubscription);
  }

  /**
   * Fetches the list of entities from the server and updates the `events` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   */
  getEvents() {
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };
    this.spinner.show();
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
      this.getEvents();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Entity or Instance created succesfully', life: 3000 });
    }
    this.manageEntity = false;
  }



  openNotification(notification: string) {
    this.router.navigate(['/datapointAdmin/home/ManageNotification', notification], { state: { appId: this.app, orgId: this.org } });
  }

  onFilterApply(filterParam: { appId: any, orgId: any }) {
    this.app = filterParam.appId || null
    this.org = filterParam.orgId || null
    this.getEvents();
  }

  createNotification() {
    this.router.navigateByUrl('/datapointAdmin/home/createNotification', { state: { appId: this.app, orgId: this.org } })
  }

  clear(_t19:any) {
    this.dt?.clear();
  }

  applyFilterGlobal($event: Event, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  /**
  * Lifecycle hook triggered after the time of component destroy.
  * unsubscribes the filter subscriptions
  */
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  deleteNotification(notificationId: string) {
    this.spinner.show()
    this.datapointAdminService.deleteNotification(notificationId).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.ngOnInit();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Notification Deleted Successfully', life: 3000 })
      },
      error: (err) => {
        this.spinner.hide();
      },
    })
  }

  onNotifSelect($event: any) {
    this.isShowDetails = true;
  }
  onNotifUnSelect($event: any) {
    this.isShowDetails = false;
  }
}
