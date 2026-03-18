import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { Table, TableRowSelectEvent, TableRowUnSelectEvent } from 'primeng/table';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { combineLatest, debounceTime, Subscription, tap } from 'rxjs';
import { FilterService } from 'src/app/modules/datapoint-administration/services/filter/filter.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

/**
 * @component FlagComponent
 * This component manages the display and interaction with FlagComponent. It retrieves the list of FlagComponent 
 * from the server, manages Flag creation, deletion, and displays notifications for user actions.
 */
@Component({
  selector: 'app-flags',
  standalone: false,
  templateUrl: './flags.component.html',
  styleUrl: './flags.component.css',
  encapsulation:ViewEncapsulation.None
})
export class FlagsComponent implements OnInit {

  @Input() appId: any;
  items: MenuItem[];
  ref: DynamicDialogRef | undefined;
  @ViewChild('dt') dt: Table | undefined;
  isAdmin = true;
  createAccess = true;
  searchValue: any;
  statuses = ['Red', 'Orange', 'Yellow', 'Green'];
  private subscriptions: Subscription[] = [];
  isshowUI: boolean = false;
  flags: any; // Stores the list of entities fetched from the server.
  manageFlag: boolean = false; // Indicates whether the "Manage Flag" sidebar is visible.
  app: any;
  org: any;
  isShowFlagDetails: boolean = false;
  selectedFlag: any

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
    private activateRoute: ActivatedRoute
  ) {
    this.activateRoute.paramMap.subscribe((params: any) => {
      this.appId = params.params.id;
    })
    this.items = [
      {
        label: 'Mapping',
      },
      { separator: true },
      {
        label: 'Data Entry',
      },
    ];
  }


  /**
   * Lifecycle hook triggered after the component is initialized.
   * Fetches the list of entities from the server.
   */
  ngOnInit() {
    this.selectedFlagAction = this.flagActions[0];
    const combinedSubscription = combineLatest([
      this.filter.selectedApp$,
      this.filter.selectedOrg$
    ]).pipe(

      // // Prevent duplicate API calls when values haven't changed
      // distinctUntilChanged((prev, curr) => 
      //   JSON.stringify(prev) === JSON.stringify(curr)
      // ),

      // Add small debounce to handle rapid changes
      // debounceTime(300)
      tap(() => this.spinner.show()),
      debounceTime(300)
    ).subscribe(([app, org]) => {
      this.app = app;
      this.org = org;
      this.getFlagList();
    });

    this.subscriptions.push(combinedSubscription);
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
    this.router.navigateByUrl('/datapointAdmin/home/createFlag', { state: { appId: this.app, orgId: this.org } })
  }

  applyFilterGlobal($event: Event, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Low':
        return 'success';
      case 'Critical':
        return 'danger';
      case 'High':
        return 'warn'
      default:
        return 'warn'
    }
  }

  /**
   * Lifecycle hook triggered after the time of component destroy.
   * unsubscribes the filter subscriptions
   */
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onFlagSelect($event: any) {
    this.isShowFlagDetails = true;
  }
  onFlagUnSelect($event: any) {

  }
}
