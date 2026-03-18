import { Component } from '@angular/core';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { DeleteConfirmationDialogComponent, DeleteConfirmationDialogResult } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { combineLatest, debounceTime, Observable, Subscription, tap } from 'rxjs';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { TableColumn, TableAction, TableConfig } from 'src/app/core/components/table-wrapper/table-wrapper.component';

@Component({
  selector: 'app-instance-new',
  standalone: false,
  templateUrl: './instance-new.component.html',
  styleUrl: './instance-new.component.css'
})
export class InstanceNewComponent {

  appId: any;
  ref: DynamicDialogRef | undefined;
  isshowUi: boolean = false;
  instances: any; // Stores the list of instances fetched from the server.
  manageEntity: boolean = false; // Indicates whether the "Manage Entity" sidebar is visible.
  app: any;
  org: any;
  isAdmin = true;
  createAccess = true;
  private subscriptions: Subscription[] = [];
  isMobile$!: Observable<boolean>;
  
  // Table configuration
  columns: TableColumn[] = [
    { field: 'entityName', header: 'Entity Name', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'instanceName', header: 'Instance Name', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'instanceDesc', header: 'Description', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'instanceLocation', header: 'Location', sortable: true, filterable: true, filterType: 'text', minWidth: '10rem' },
    { field: 'appName', header: 'App/Org', sortable: true, filterable: true, filterType: 'text', minWidth: '10rem', template: 'tag' }
  ];
  
  actions: TableAction[] = [
    { icon: 'pi pi-pencil', tooltip: 'Edit', severity: 'secondary', action: 'edit' },
    { icon: 'pi pi-trash', tooltip: 'Delete', severity: 'danger', action: 'delete' }
  ];
  
  tableConfig: TableConfig = {
    dataKey: 'id',
    rows: 20,
    rowsPerPageOptions: [20, 30, 50],
    paginator: true,
    globalFilterFields: ['instanceName', 'instanceDesc', 'representative.name', 'entityName'],
    rowHover: true,
    emptyMessage: 'No Instances found.',
    showCaption: true,
    showSearch: true,
    showClearFilter: true,
    searchPlaceholder: 'Search...',
    createButtonLabel: 'Create Instance',
    createButtonIcon: 'pi pi-plus',
    showCreateButton: true,
    showMobileView: true,
    mobileCardFields: {
      title: 'instanceName',
      subtitle: 'instanceDesc',
      stats: [
        { label: 'Entity', field: 'entityName' },
        { label: 'Level', field: 'appName' }
      ]
    }
  };

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * Constructor to inject required services.
   * @param {AdminService} datapointAdminService - Service for admin-related API calls.
   * @param {MessageService} messageService - Service for displaying messages or notifications.
   * @param {NgxSpinnerService} spinner - Service for displaying a loading spinner.
   * @param {FilterService} filter - Service for subscribing the appId and OrgId from filter comp
   */
  constructor(private datapointAdminService: DatapointAdministrationService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private router: Router,
    public dialogService: DialogService,
    private activateRoute: ActivatedRoute,
    private filter: FilterService,
    private responsive: ResponsiveService
  ) {
    this.activateRoute.paramMap.subscribe((params: any) => {
      this.appId = params.params.id;
    })
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
      this.getInstanceList();
    });

    this.subscriptions.push(combinedSubscription);
    this.isMobile$ = this.responsive.isMobile$();
  }

  /**
   * Fetches the list of entities from the server and updates the `instances` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   */
  getInstanceList() {
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };
    this.datapointAdminService.getInstanceList(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.instances = res.Instances;
        this.isshowUi = true;
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  openInstance(event: string) {
    //this.router.navigate(['/datapointAdmin/home/manageInstance/', event], { state: { appId: this.app, orgId: this.org } });
  }

  createInstance() {
    this.router.navigateByUrl('/datapointAdminV2/home/createInstanceNew', { state: { appId: this.app, orgId: this.org } })
  }

  onRowClick(instance: any): void {
    this.openInstance(instance.instanceId);
  }

  onAction(event: { action: string; row: any }): void {
    const { action, row } = event;
    switch (action) {
      case 'edit':
        this.editInstance(new Event('click'), row);
        break;
      case 'delete':
        this.deleteInstance(new Event('click'), row);
        break;
    }
  }

  editInstance(event: Event, instance: any) {
    event.stopPropagation();
    this.router.navigateByUrl('/datapointAdminV2/home/createInstanceNew', {
      state: {
        appId: this.app,
        orgId: this.org,
        instanceId: instance.instanceId,
        isEdit: true,
        instanceData: instance
      }
    });
  }

  deleteInstance(event: Event, instance: any): void {
    event.stopPropagation();
    const ref = this.dialogService.open(DeleteConfirmationDialogComponent, {
      showHeader: false,
      closable: false,
      modal: true,
      dismissableMask: true,
      styleClass: 'delete-confirmation-modal',
      width: '460px',
      data: {
        entityLabel: 'Instance',
        itemName: instance.instanceName ?? '',
        title: 'Delete Instance',
        subtitle: 'This action cannot be undone',
        confirmText: 'Delete Instance',
        cancelText: 'Cancel'
      }
    });

    ref.onClose.subscribe((result?: DeleteConfirmationDialogResult) => {
      if (!result?.confirmed) return;
      this.spinner.show();
      this.datapointAdminService.deleteInstance(instance.instanceId).subscribe({
        next: () => {
          this.spinner.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Instance deleted successfully' });
          this.getInstanceList();
        },
        error: () => {
          this.spinner.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete instance' });
        }
      });
    });
  }
}
