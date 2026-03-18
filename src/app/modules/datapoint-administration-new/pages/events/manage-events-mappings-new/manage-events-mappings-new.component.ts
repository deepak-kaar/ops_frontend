import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService, FilterService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { ManageEventMappingComponent } from 'src/app/modules/datapoint-administration/components/dialogs/manage-event-mapping/manage-event-mapping.component';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-manage-events-mappings-new',
  standalone: false,
  templateUrl: './manage-events-mappings-new.component.html',
  styleUrl: './manage-events-mappings-new.component.css'
})
export class ManageEventsMappingsNewComponent {
 @Input() app: any;
  @Input() org: any;
  @Input() eventData: any;
  ref: DynamicDialogRef | undefined;
  @ViewChild('dt') dt: Table | undefined;
  isAdmin = true;
  createAccess = true;
  searchValue: any;
  statuses = ['Red', 'Orange', 'Yellow', 'Green'];
  private subscriptions: Subscription[] = [];
  isshowUI: boolean = false;
  events: any; // Stores the list of entities fetched from the server.
  eventJson: any;
  manageEvent: boolean = false;
  isShowEventDetails: boolean = false;

  /**
 * @property {string[]} eventActions - Stores the options for Event Action selection Button.
 */
  eventActions: string[] = ["Event Details",
    "Event Mappings"];


  /**
   * @property {any} selectedEventAction - Stores the currently selected Event action.
   */
  selectedEventAction: any;

   /**
      * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
      */
    breakPointForToastComponent: { [key: string]: any; } =breakPointForToastComponent;



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
    this.getEventDetails();
  }


  /**
   * Lifecycle hook triggered after the component is initialized.
   * Fetches the list of entities from the server.
   */
  ngOnInit() {
    this.selectedEventAction = this.eventActions[0];
  }

  /**
 * Fetches the data of flag from the server and updates the `flags` property.
 * Displays a spinner while the API call is in progress.
 * Logs the response or error using the LoggerService.
 * @returns {void} - returns nothing
 */
  getEventDetails(): void {
    this.dataPointService.getEvent(this.eventData?.notificationId).subscribe({
      next: (res: any) => {
        this.eventJson = res.notificationJson[0];
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
  getEventList(): void {
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };

    this.dataPointService.getEvents(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.events = res.events;
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
  openEvent(event: string): void {
    this.isShowEventDetails = true
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
    this.getEventList();
  }

  createEvent() {
    this.ref = this.dialogService.open(ManageEventMappingComponent, {
      modal: true,
      closable: true,
      header: 'Event Mapping',
      data: {
        eventData: this.eventJson,
        appData: {
          appId: this.app,
          orgId: this.org
        }
      },
      width: '50rem'
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
