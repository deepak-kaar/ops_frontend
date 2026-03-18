import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { combineLatest, debounceTime, Subscription, tap } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { TableColumn, TableConfig } from 'src/app/core/components/table-wrapper/table-wrapper.component';

@Component({
  selector: 'app-tags-new',
  standalone: false,
  templateUrl: './tags-new.component.html',
  styleUrl: './tags-new.component.css'
})
export class TagsNewComponent {
 appId: any;
  ref: DynamicDialogRef | undefined;
  statuses = ['Application', 'OpsInsight'] as const;
  
  // Table configuration
  columns: TableColumn[] = [
    { field: 'alias', header: 'Alias', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'attributeName', header: 'Tag', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'dataPointID.dataType', header: 'Datatype', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'decimalPlaces', header: 'Decimal', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'createdOn', header: 'Created On', sortable: true, filterable: true, filterType: 'date', minWidth: '10rem', template: 'date' }
  ];
  
  tableConfig: TableConfig = {
    dataKey: 'id',
    rows: 20,
    rowsPerPageOptions: [20, 30, 50],
    paginator: true,
    globalFilterFields: ['attributeName','alias', 'entityOrInstanceName', 'createdOn', 'comments','dataPointID.dataType'],
    rowHover: true,
    emptyMessage: 'No Tags found.',
    showCaption: true,
    showSearch: true,
    showClearFilter: true,
    searchPlaceholder: 'Search...',
    createButtonLabel: 'Create Tag',
    createButtonIcon: 'pi pi-plus',
    showCreateButton: true,
    showMobileView: false
  };

  isshowUI: boolean = false;
  attrList: any; // Stores the list of entities fetched from the server.
  manageEntity: boolean = false; // Indicates whether the "Manage Entity" sidebar is visible.
  app: string | undefined | null;
  org: string | undefined | null;
  isAdmin = true;
  createAccess = true;
  private subscriptions: Subscription[] = [];
  /**
   * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
   */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
   * Constructor to inject required services.
   * @param {AdminService} adminService - Service for admin-related API calls.
   * @param {MessageService} messageService - Service for displaying messages or notifications.
   * @param {NgxSpinnerService} spinner - Service for displaying a loading spinner.
   * @param {Router} router - Service for routing
   */
  constructor(private datapointAdminService: DatapointAdministrationService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService, private router: Router,
    public dialogService: DialogService,
    private filter: FilterService,

    private activateRoute: ActivatedRoute
  ) {
    // this.activateRoute.paramMap.subscribe((params: any) => {
    //   this.appId = params.params.id;
    // })
  }

  /**
   * Lifecycle hook triggered after the component is initialized.
   * Fetches the list of entities from the server.
   */
  ngOnInit() {
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
      this.getAttributeList();
    });

    this.subscriptions.push(combinedSubscription);
  }

  /**
   * Fetches the list of entities from the server and updates the `attrList` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   */
  getAttributeList() {
    this.spinner.show();
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };

    this.datapointAdminService.getAttrList(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.attrList = res[0].attributes;
        this.isshowUI = true;
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  onRowClick(attr: any): void {
    this.openAttr(attr.attributeId);
  }

  getNestedValue(row: any, field: string): any {
    const keys = field.split('.');
    let value = row;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }

  openAttr(event: string) {
    this.router.navigate(['/datapointAdmin/home/manageAttribute/', event], { state: { appId: this.app, orgId: this.org } });
  }

  createAttribute() {
    this.router.navigateByUrl('/datapointAdmin/home/createAttribute', { state: { appId: this.app, orgId: this.org } })
  }

  /**
    * Lifecycle hook triggered after the time of component destroy.
    * unsubscribes the filter subscriptions
    */
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
