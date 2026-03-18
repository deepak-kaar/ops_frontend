import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportPublishAdministrationComponent } from '../../reportpublish-administration.component';
import { ReportPublish } from '../../services/reportpublish-administration.service';
import { finalize, map, Observable, Subject } from 'rxjs';
import { DeleteConfirmationDialogComponent, DeleteConfirmationDialogResult } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { TableColumn, TableAction, TableConfig } from 'src/app/core/components/table-wrapper/table-wrapper.component';

@Component({
  selector: 'app-reportpublish-table',
  standalone: false,
  templateUrl: './reportpublish-table.component.html',
  styleUrl: './reportpublish-table.component.css'
})
export class ReportPublishTableComponent extends ReportPublishAdministrationComponent implements OnInit, OnDestroy {

  isShowDetails: boolean = false;
  private subscribe$ = new Subject<void>();
  isLoading: boolean = false;
  reportPublishData$!: Observable<ReportPublish[]>;
  selectedReportPublish: ReportPublish | null = null;
  editingReportPublish: ReportPublish | null = null;
  mode: 'create' | 'edit' = 'create';

  // Table configuration
  columns: TableColumn[] = [];
  actions: TableAction[] = [];
  tableConfig: TableConfig = {};

  frequencyOptions = [
    { label: 'Once', value: 'once' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(
    private router: Router
  ) {
    super();
    this.getReportPublishData();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // isMobile$ is already initialized in base class ngOnInit
    this.initializeTableConfig();
  }

  private initializeTableConfig(): void {
    this.columns = [
      { field: 'pageName', header: 'Page Name', sortable: true, filterable: true, filterType: 'text', minWidth: '150px' },
      { field: 'publishPath', header: 'Publish Path', sortable: true, filterable: true, filterType: 'text', minWidth: '180px', template: 'custom' },
      // { field: 'sendAfter', header: 'Send After', sortable: true, filterable: true, filterType: 'date', minWidth: '100px', template: 'custom' },
      { field: 'frequency', header: 'Frequency', sortable: true, filterable: true, filterType: 'text', minWidth: '100px', template: 'tag' },
      { field: 'isActive', header: 'Is Active', sortable: true, filterable: true, filterType: 'text', minWidth: '90px', template: 'custom' },
      { field: 'lastUpdatedBy', header: 'Last Updated By', sortable: true, filterable: true, filterType: 'text', minWidth: '140px', template: 'custom' },
      { field: 'lastUpdatedAt', header: 'Last Updated At', sortable: true, filterable: true, filterType: 'date', minWidth: '140px', template: 'custom' },
      { field: 'lastPublishedStatus', header: 'Last Published Status', sortable: true, filterable: true, filterType: 'text', minWidth: '140px', template: 'tag' },
      // { field: 'lastPublishedTs', header: 'Last Published TS', sortable: true, filterable: true, filterType: 'date', minWidth: '150px', template: 'date' }
    ];

    this.actions = [
      { icon: 'pi pi-pencil', tooltip: 'Edit', severity: 'info', action: 'edit' },
      { icon: 'pi pi-trash', tooltip: 'Delete', severity: 'danger', action: 'delete' }
    ];

    this.tableConfig = {
      dataKey: '_id',
      rows: 10,
      rowsPerPageOptions: [10, 20, 50],
      paginator: true,
      selectionMode: 'single',
      globalFilterFields: ['pageName', 'publishPath', 'recipients', 'frequency', 'createdBy'],
      rowHover: true,
      emptyMessage: 'No Report Publish entries found.',
      showCaption: true,
      showSearch: true,
      showClearFilter: true,
      searchPlaceholder: 'Search reports...',
      showCreateButton: true,
      createButtonLabel: 'Create',
      createButtonIcon: 'pi pi-plus',
      showMobileView: true,
      mobileCardFields: {
        title: 'pageName',
        subtitle: 'publishPath',
        stats: [
          { label: 'Frequency', field: 'frequency' },
          { label: 'Status', field: 'isActive' }
        ]
      }
    };
  }

  onAction(event: { action: string; row: any }): void {
    switch (event.action) {
      case 'edit':
        this.openEditDialog(event.row);
        break;
      case 'delete':
        this.deleteReportPublish(event.row);
        break;
    }
  }

  onRowSelect(event: any): void {
    this.selectedReportPublish = event.data;
  }

  /**
   * Fetch all report publish entries
   */
  getReportPublishData(): void {
    this.isLoading = true;
    this.reportPublishData$ = this.reportPublishService.getAllReportPublish().pipe(
      map((res: any) => res?.ReportPublish || []),
      finalize(() => {
        this.isLoading = false;
        this.spinner.hide();
      })
    );
  }

  /**
   * Called when a new report publish entry is created or updated
   */
  onReportPublishCreated(): void {
    this.getReportPublishData();
  }

  /**
   * Open create dialog
   */
  openCreateDialog(): void {
    this.router.navigate(['reportPublishAdmin', 'create']);
  }

  openEditDialog(data: ReportPublish): void {
    const id = data.reportPublishId || data._id;
    this.router.navigate(['reportPublishAdmin', 'edit', id], { state: { reportPublishData: data } });
  }

  /**
   * Legacy method - kept for compatibility
   */
  createReportPublish(): void {
    this.openCreateDialog();
  }

  /**
   * Legacy method - kept for compatibility
   */
  editReportPublish(data: ReportPublish): void {
    this.openEditDialog(data);
  }

  /**
   * Delete a report publish entry
   */
  deleteReportPublish(data: ReportPublish): void {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      showHeader: false,
      closable: false,
      modal: true,
      dismissableMask: true,
      styleClass: 'delete-confirmation-modal',
      width: '460px',
      data: {
        entityLabel: 'Report Publish',
        itemName: data.pageName ?? '',
        title: 'Delete Report Publish',
        subtitle: 'This action cannot be undone',
        confirmText: 'Delete Report Publish',
        cancelText: 'Cancel'
      }
    });

    deleteDialogRef.onClose.subscribe((result?: DeleteConfirmationDialogResult) => {
      if (!result?.confirmed) return;
      const id = data.reportPublishId || data._id;
      if (id) {
        this.reportPublishService.deleteReportPublish(id).subscribe({
          next: () => {
            this.showToast('success', 'Deleted', 'Report publish entry deleted successfully', 2000, false);
            this.isShowDetails = false;
            this.getReportPublishData();
          },
          error: () => {
            this.showToast('error', 'Error', 'Failed to delete report publish entry', 2000, false);
          }
        });
      }
    });
  }

  /**
   * Toggle active status
   */
  toggleActive(data: ReportPublish): void {
    const id = data.reportPublishId || data._id;
    if (id) {
      const newStatus = !data.isActive;
      this.reportPublishService.toggleActiveStatus(id, newStatus, 'currentUser').subscribe({
        next: () => {
          this.showToast('success', 'Updated', `Report publish ${newStatus ? 'activated' : 'deactivated'} successfully`, 2000, false);
          this.getReportPublishData();
        },
        error: () => {
          this.showToast('error', 'Error', 'Failed to update status', 2000, false);
        }
      });
    }
  }

  /**
   * Manually trigger sending a report
   */
  triggerSend(data: ReportPublish): void {
    const id = data.reportPublishId || data._id;
    if (id) {
      this.spinner.show();
      this.reportPublishService.triggerReportSend(id).subscribe({
        next: () => {
          this.spinner.hide();
          this.showToast('success', 'Sent', 'Report sent successfully', 3000, false);
          this.getReportPublishData();
        },
        error: (err) => {
          this.spinner.hide();
          this.showToast('error', 'Error', `Failed to send report: ${err?.error?.error || 'Unknown error'}`, 5000, false);
        }
      });
    }
  }

  /**
   * Clear table filters
   */
  clearTable(): void {
    this.selectedReportPublish = null;
    // Table-wrapper handles clearing filters internally
  }

  /**
   * Get severity for status badge
   */
  getSeverity(status: boolean | string): string {
    const isActive = status === true || status === 'true';
    return isActive ? 'success' : 'danger';
  }

  /**
   * Get status label
   */
  getStatusLabel(status: boolean | string): string {
    const isActive = status === true || status === 'true';
    return isActive ? 'Active' : 'Inactive';
  }

  /**
   * Get publish status severity
   */
  getPublishStatusSeverity(status: string | null): string {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Get publish status label
   */
  getPublishStatusLabel(status: string | null): string {
    switch (status) {
      case 'success':
        return 'Success';
      case 'failed':
        return 'Failed';
      default:
        return 'Never Sent';
    }
  }

  /**
   * Format frequency label
   */
  getFrequencyLabel(frequency: string): string {
    return frequency ? frequency.charAt(0).toUpperCase() + frequency.slice(1) : '-';
  }

  /**
   * Get frequency severity for tag color
   */
  getFrequencySeverity(frequency: string): string {
    switch (frequency?.toLowerCase()) {
      case 'daily':
        return 'info';
      case 'weekly':
        return 'success';
      case 'monthly':
        return 'warn';
      case 'once':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  ngOnDestroy(): void {
    this.subscribe$.next();
    this.subscribe$.complete();
    this.isShowDetails = false;
  }
}
