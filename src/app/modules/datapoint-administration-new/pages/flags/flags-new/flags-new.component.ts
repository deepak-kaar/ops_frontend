import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { DeleteConfirmationDialogComponent, DeleteConfirmationDialogResult } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { combineLatest, debounceTime, Subscription, tap } from 'rxjs';
import { FilterService } from 'src/app/modules/datapoint-administration/services/filter/filter.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { TableColumn, TableConfig, TableAction } from 'src/app/core/components/table-wrapper/table-wrapper.component';

@Component({
  selector: 'app-flags-new',
  standalone: false,
  templateUrl: './flags-new.component.html',
  styleUrl: './flags-new.component.css'
})
export class FlagsNewComponent {
  @Input() appId: any;
  items: MenuItem[];
  ref: DynamicDialogRef | undefined;
  isAdmin = true;
  createAccess = true;
  statuses = ['Red', 'Orange', 'Yellow', 'Green'];
  private subscriptions: Subscription[] = [];
  isshowUI: boolean = false;
  flags: any; // Stores the list of entities fetched from the server.
  manageFlag: boolean = false; // Indicates whether the "Manage Flag" sidebar is visible.
  app: any;
  org: any;
  isShowFlagDetails: boolean = false;
  selectedFlag: any;
  @ViewChild('editPane') editPane!: ElementRef;
  
  // Table configuration
  columns: TableColumn[] = [
    { field: 'flagName', header: 'Name', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'flagDesc', header: 'Description', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' }
  ];
  
  actions: TableAction[] = [
    { icon: 'pi pi-trash', tooltip: 'Delete', severity: 'danger', action: 'delete' }
  ];
  
  tableConfig: TableConfig = {
    dataKey: 'flagId',
    rows: 20,
    rowsPerPageOptions: [20, 30, 50],
    paginator: true,
    globalFilterFields: ['flagName', 'flagDesc', 'flagSeverity'],
    selectionMode: 'single',
    rowHover: true,
    emptyMessage: 'No flags found.',
    showCaption: true,
    showSearch: true,
    showClearFilter: true,
    searchPlaceholder: 'Search...',
    createButtonLabel: 'Create Flag',
    createButtonIcon: 'pi pi-plus',
    showCreateButton: true,
    showMobileView: false
  };

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


  onFilterApply(filterParam: { appId: any, orgId: any }) {
    this.app = filterParam.appId || null
    this.org = filterParam.orgId || null
    this.getFlagList();
  }

  createFlag() {
    this.router.navigateByUrl('/datapointAdminV2/home/createFlagsNew', { state: { appId: this.app, orgId: this.org } })
  }

  onRowSelect(event: any): void {
    this.selectedFlag = event.data;
    this.isShowFlagDetails = true;
    setTimeout(() => {
      if (this.editPane) {
        this.editPane.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  }

  onRowUnselect(event: any): void {
    this.isShowFlagDetails = false;
    this.selectedFlag = null;
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

  onAction(event: { action: string; row: any }) {
    if (event.action === 'delete') {
      this.deleteFlag(event.row);
    }
  }

  deleteFlag(flag: any): void {
    const ref = this.dialogService.open(DeleteConfirmationDialogComponent, {
      showHeader: false,
      closable: false,
      modal: true,
      dismissableMask: true,
      styleClass: 'delete-confirmation-modal',
      width: '460px',
      data: {
        entityLabel: 'Flag',
        itemName: flag.flagName ?? '',
        title: 'Delete Flag',
        subtitle: 'This action cannot be undone',
        confirmText: 'Delete Flag',
        cancelText: 'Cancel'
      }
    });

    ref.onClose.subscribe((result?: DeleteConfirmationDialogResult) => {
      if (!result?.confirmed) return;
      this.spinner.show();
      this.dataPointService.deleteFlag(flag.flagId).subscribe({
        next: () => {
          this.spinner.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Flag deleted successfully', life: 3000 });
          this.getFlagList();
          this.isShowFlagDetails = false;
        },
        error: () => {
          this.spinner.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete flag', life: 3000 });
        }
      });
    });
  }
}
