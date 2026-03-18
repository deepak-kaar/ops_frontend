import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ExportService } from 'src/app/core/services/export.service';
import { SchedulerjobAdministrationComponent } from '../../schedulerjob-administration.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, map, Observable, of, Subject, takeUntil, forkJoin, tap } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ManageSchedulerjobComponent } from '../../components/manage-schedulerjob/manage-schedulerjob.component';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { ExcelImportResult } from 'src/app/core/services/export.service';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-schedulerjob-table',
  standalone: false,
  templateUrl: './schedulerjob-table.component.html',
  styleUrl: './schedulerjob-table.component.css'
})
export class SchedulerjobTableComponent extends SchedulerjobAdministrationComponent implements OnInit, OnDestroy {
  appRef!: DynamicDialogRef;

  /**
 * @property {any} searchJobValue - Stores the search input value for filtering applications.
 */
  searchJobValue: any;


  /**
 * @property {unknown} iSloading - Indicates the loading state (can be replaced with a boolean for better clarity).
 */
  iSloading: unknown;

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
* @property {Observable<any>} scheduling_data$ - Stores the list of jobs fetched from the backend.
*/
  scheduling_data$!: Observable<any>;

  @ViewChild('dt') dt!: Table;

  selectedJobs: any[] = []; // store selected rows for export

  statuses = ['OpsInsight', 'Application', 'Organization'];
  private subscribe$ = new Subject<void>();

  constructor(private exportService: ExportService) {
    super();
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      this.getJobs();
    });
    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      this.getJobs();
    });
  }

  ngOnInit() {
  }

  getJobs(): void {
    this.spinner.show();

    // this.scheduling_data$ = of([
    //   {
    //     schedulerJobName: 'Daily Data Sync',
    //     schedulerJob: 'DataSyncJob',
    //     jobDescription: 'Synchronizes data from external APIs every morning.',
    //     cronExpression: '06***', // Runs daily at 6 AM
    //     triggerName: 'DailyTrigger',
    //     inScheduled: true
    //   },
    //   {
    //     schedulerJobName: 'Weekly Report Generator',
    //     schedulerJob: 'ReportGeneratorJob',
    //     jobDescription: 'Generates and emails weekly reports to admins.',
    //     cronExpression: '08**1', // Every Monday at 8 AM
    //     triggerName: 'WeeklyTrigger',
    //     inScheduled: false
    //   },
    //   {
    //     schedulerJobName: 'Monthly Cleanup',
    //     schedulerJob: 'CleanupJob',
    //     jobDescription: 'Deletes old logs and temporary files monthly.',
    //     cronExpression: '031**', // On the 1st of every month at 3 AM
    //     triggerName: 'MonthlyTrigger',
    //     inScheduled: true
    //   }
    // ]);
    this.scheduling_data$ = this.schedulerjobAdministrationService.getJobs().pipe(
      map((res: any) =>
        (res?.Jobs || []).map((job: any) => ({
          ...job,
          schedulerLevel:
            job.appId && job.orgId
              ? 'Organization'
              : job.appId
                ? 'Application'
                : 'OpsInsight'
        }))
      ),
      finalize(() => this.spinner.hide())
    );

  }

  private getResponsiveDialogWidthJS(): string {
    const screenWidth = window.innerWidth;
    if (screenWidth > 1200) return '1200px';
    if (screenWidth > 992) return '700px';
    if (screenWidth > 768) return '600px';
    return '90vw';
  }

  createJob(): void {
    this.appRef = this.dialog.open(ManageSchedulerjobComponent, {
      header: 'Create Job',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: this.getResponsiveDialogWidthJS(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Job created successfully', life: 3000 });
        this.getJobs();
      }
    });
  }

  /**
 * Handles application selection from a table.
 * @param {TableRowSelectEvent} event - The event object containing details of the selected row.
 */
  onJobSelect(event: TableRowSelectEvent) {
  }


  /**
 * Clears the table filter/search.
 * @param {Table} _t19 - The table reference whose filter should be cleared.
 */
  clearSchedulingTable(_t19: Table) {
    this.dt.reset();
    this.searchJobValue = '';
    this.selectedJobs = [];
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  /**
 * Edits an existing Job.
 * @param {any} data - The job to be edited.
 */
  editJob(data: any) {
    this.appRef = this.dialog.open(ManageSchedulerjobComponent, {
      header: 'Edit Job',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        jobData: data
      },
      width: this.getResponsiveDialogWidthJS(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Job edited successfully', life: 3000 });
        this.getJobs();
      }
    });

  }

  /**
   * Deletes an existing job.
   * Opens a confirmation dialog before deletion
   * @param {any} data - The job data to be deleted.
   */
  deleteJob(data: any) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      header: 'Confirm Delete',
      modal: true,
      closable: true,
      data: {
        message: 'Are you sure you want to delete this job?',
      },
      width: '550px'
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        this.schedulerjobAdministrationService.deleteJob(data._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Job deleted successfully'
            });
            this.getJobs();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete job'
            });
          }
        });
      } else {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Delete operation cancelled'
        });
      }
    });
  }


  /**
  * Lifecycle hook triggered after the time of component destroy.
  * unsubscribes the filter subscriptions
  */
  ngOnDestroy() {
    this.subscribe$.next();
    this.subscribe$.complete();
  }

  exportExcel() {
    const exportData = this.selectedJobs && this.selectedJobs.length > 0 ? this.selectedJobs : this.dt?.value || [];
    if (exportData.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'There is no data to export'
      });
      return;
    }
    this.exportService.exportExcel(exportData, 'scheduler_jobs');
  }

  // ==================== IMPORT FUNCTIONALITY ====================

  /**
   * Trigger file input for import
   */
  triggerImport(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleImport(file);
      }
    };

    input.click();
  }

  /**
   * Handle Excel file import
   */
  async handleImport(file: File): Promise<void> {
    try {
      this.spinner.show();
      const importResults = await this.exportService.importExcel(file);
      this.spinner.hide();

      if (importResults.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'No Data',
          detail: 'The imported file contains no data'
        });
        return;
      }

      // Group changes
      const groupedChanges = {
        add: importResults.filter(x => x.action === 'Add New'),
        edit: importResults.filter(x => x.action === 'Edit'),
        delete: importResults.filter(x => x.action === 'Delete')
      };

      // Open confirmation dialog
      this.appRef = this.dialog.open(ConfirmationDailogExcelComponent, {
        header: 'Confirm Changes',
        data: {
          importData: importResults,
          displayColumns: [
            { header: 'Job Name', field: 'schedulerJobName' },
            { header: 'Description', field: 'jobDescription' },
            { header: 'Cron Expression', field: 'cronExpression' },
            { header: 'Trigger Name', field: 'triggerName' },
            { header: 'Scheduled', field: 'inScheduled' },
            { header: 'App ID', field: 'appId' },
            { header: 'App Name', field: 'appName' },
            { header: 'Org ID', field: 'orgId' },
            { header: 'Org Name', field: 'orgName' },
            { header: 'Action', field: 'action' }
          ]
        },
        width: getResponsiveDialogWidth()
      });

      this.appRef.onClose.subscribe((result: any) => {
        if (result?.confirmed) {
          this.processImportData(result.data);
        }
      });

    } catch (error) {
      this.spinner.hide();
      this.messageService.add({
        severity: 'error',
        summary: 'Import Error',
        detail: 'Failed to parse Excel file'
      });
      console.error('Import error:', error);
    }
  }

  /**
   * Process imported data changes
   */
  processImportData(groupedChanges: any): void {
    this.spinner.show();
    const requests: Observable<any>[] = [];
    const results = { success: 0, failed: 0, errors: [] as string[] };

    // Process Add
    groupedChanges.addNew.forEach((item: ExcelImportResult) => {
      const payload = this.preparePayload(item.rowData);
      requests.push(
        this.schedulerjobAdministrationService.postJob(payload).pipe(
          tap(() => results.success++),
          finalize(() => { })
        )
      );
    });

    // Process Edit
    groupedChanges.edit.forEach((item: ExcelImportResult) => {
      const payload = this.preparePayload(item.rowData);
      const id = item.rowData._id;

      if (!id) {
        results.failed++;
        results.errors.push(`Row ${item.rowIndex}: Missing ID for edit operation`);
        return;
      }

      requests.push(
        this.schedulerjobAdministrationService.putJob(payload, id).pipe(
          tap(() => results.success++),
          finalize(() => { })
        )
      );
    });

    // Process Delete
    groupedChanges.delete.forEach((item: ExcelImportResult) => {
      const id = item.rowData._id;

      if (!id) {
        results.failed++;
        results.errors.push(`Row ${item.rowIndex}: Missing ID for delete operation`);
        return;
      }

      requests.push(
        this.schedulerjobAdministrationService.deleteJob(id).pipe(
          tap(() => results.success++),
          finalize(() => { })
        )
      );
    });

    if (requests.length === 0) {
      this.spinner.hide();
      this.messageService.add({ severity: 'info', summary: 'No Changes', detail: 'No changes to process' });
      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'success',
          summary: 'Import Complete',
          detail: `Successfully processed ${results.success} records${results.failed > 0 ? `, ${results.failed} failed` : ''}`
        });
        this.getJobs();
      },
      error: (error) => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Import Failed',
          detail: 'Some operations failed during import'
        });
      }
    });
  }

  /**
   * Prepare payload for API calls
   */
  preparePayload(rowData: any): any {
    return {
      schedulerJobName: rowData.schedulerJobName,
      jobDescription: rowData.jobDescription,
      cronExpression: rowData.cronExpression,
      triggerName: rowData.triggerName,
      inScheduled: rowData.inScheduled === true || rowData.inScheduled === 'Yes' || rowData.inScheduled === 'true',
      appId: rowData.appId || this.filterService.currentApp?.appId || '',
      appName: rowData.appName || this.filterService.currentApp?.appName || '',
      orgId: rowData.orgId || this.filterService.currentOrg?.orgId || '',
      orgName: rowData.orgName || this.filterService.currentOrg?.orgName || '',
    };
  }
}
