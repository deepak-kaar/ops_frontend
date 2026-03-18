import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService, FilterService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { ManageNotifMappingComponent } from '../dialogs/manage-notif-mapping/manage-notif-mapping.component';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-notif-mapping',
  standalone: false,
  templateUrl: './notif-mapping.component.html',
  styleUrl: './notif-mapping.component.css'
})
export class NotifMappingComponent {
  @Input() app: any;
  @Input() org: any;
  @Input() flagData: any;
  ref: DynamicDialogRef | undefined;
  @ViewChild('dt') dt: Table | undefined;
  isAdmin = true;
  createAccess = true;
  searchValue: any;
  statuses = ['Red', 'Orange', 'Yellow', 'Green'];
  private subscriptions: Subscription[] = [];
  isshowUI: boolean = false;
  flags: any; // Stores the list of entities fetched from the server.
  flagJson: any;
  manageFlag: boolean = false; // Indicates whether the "Manage Flag" sidebar is visible.
  isShowFlagDetails: boolean = false;

  /**
 * @property {string[]} flagActions - Stores the options for Flag Action selection Button.
 */
  flagActions: string[] = ["Flag Details",
    "Flag Mappings"];


  /**
   * @property {any} selectedFlagAction - Stores the currently selected Flag action.
   */
  selectedFlagAction: any;

  /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;



  /**
   * Constructor to inject required services.
   * @param {AdminService} dataPointService - Service for admin-related API calls.
   * @param {MessageService} messageService - Service for displaying messages or notifications.
   * @param {PrimeNGConfig} config - PrimeNG configuration service.
   * @param {NgxSpinnerService} spinner - Service for displaying a loading spinner.
   * @param {Router} router - Service for routing
   */
  constructor(private dataPointService: DatapointAdministrationService, private messageService: MessageService,
    private spinner: NgxSpinnerService, private router: Router,
    public dialogService: DialogService,
    private filter: FilterService,
    private activateRoute: ActivatedRoute,
  ) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.flagData)
    this.getFlagDetails();
  }


  /**
   * Lifecycle hook triggered after the component is initialized.
   * Fetches the list of entities from the server.
   */
  ngOnInit() {
    this.selectedFlagAction = this.flagActions[0];
  }

  /**
 * Fetches the data of flag from the server and updates the `flags` property.
 * Displays a spinner while the API call is in progress.
 * Logs the response or error using the LoggerService.
 * @returns {void} - returns nothing
 */
  getFlagDetails(): void {
    this.dataPointService.getNotification(this.flagData?.notificationId).subscribe({
      next: (res: any) => {
        this.flagJson = res.Notification;
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }


  /**
   * Fetches the list of entities from the server and updates the `flags` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   * @returns {void} - returns nothing
   */
  getFlagList(): void {
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };

    this.dataPointService.getFlagList(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.flags = res.flag;
        this.isshowUI = true;
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  /**
   * Opens the manage flag page by passin the id as flag id as parameter
   * calls the navigateByUrl method from router and passes the flag id as well as the appId and orgId as state
   * @returns {void} - returns nothing
   */
  openFlag(event: string): void {
    this.isShowFlagDetails = true
    // this.router.navigate(['/datapointAdmin/home/manageFlag/', event], { state: { appId: this.app, orgId: this.org } });
  }

  clear(dt: any) {
    const searchinput: any = document.getElementById('searchinput');
    searchinput.value = null;
    this.dt?.clear();
  }


  onFilterApply(filterParam: { appId: any, orgId: any }) {
    this.app = filterParam.appId || null
    this.org = filterParam.orgId || null
    this.getFlagList();
  }

  createFlag() {
    this.ref = this.dialogService.open(ManageNotifMappingComponent, {
      modal: true,
      closable: true,
      header: 'Variable Mapping',
      data: {
        flagData: this.flagJson,
        appData: {
          appId: this.app,
          orgId: this.org
        }
      },
      width: '85rem'
    })
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
}
