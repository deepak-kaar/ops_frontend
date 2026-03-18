import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ExportService } from 'src/app/core/services/export.service';
import { SchedulerjobAdministrationNewComponent } from '../../schedulerjob-administration-new.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, map, Observable, Subject, takeUntil, forkJoin, tap } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { ManageSchedulerjobNewComponent } from '../../components/manage-schedulerjob-new/manage-schedulerjob-new.component';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { ExcelImportResult } from 'src/app/core/services/export.service';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-schedulerjob-table-new',
  standalone: false,
  templateUrl: './schedulerjob-table-new.component.html',
  styleUrl: './schedulerjob-table-new.component.css'
})
export class SchedulerjobTableNewComponent extends SchedulerjobAdministrationNewComponent implements OnInit, OnDestroy {
  appRef!: DynamicDialogRef;
  searchJobValue: any;
  iSloading: unknown;
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;
  scheduling_data$!: Observable<any>;

  @ViewChild('dt') dt!: Table;

  selectedJobs: any[] = [];
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

  override ngOnInit() {
    super.ngOnInit();
  }

  getJobs(): void {
    this.spinner.show();
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
    this.appRef = this.dialog.open(ManageSchedulerjobNewComponent, {
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

  onJobSelect(event: TableRowSelectEvent) {
  }

  clearSchedulingTable(_t19: Table) {
    this.dt.reset();
    this.searchJobValue = '';
    this.selectedJobs = [];
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  editJob(data: any) {
    this.appRef = this.dialog.open(ManageSchedulerjobNewComponent, {
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

      const groupedChanges = {
        add: importResults.filter(x => x.action === 'Add New'),
        edit: importResults.filter(x => x.action === 'Edit'),
        delete: importResults.filter(x => x.action === 'Delete')
      };

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

  processImportData(groupedChanges: any): void {
    this.spinner.show();
    const requests: Observable<any>[] = [];
    const results = { success: 0, failed: 0, errors: [] as string[] };

    groupedChanges.addNew.forEach((item: ExcelImportResult) => {
      const payload = this.preparePayload(item.rowData);
      requests.push(
        this.schedulerjobAdministrationService.postJob(payload).pipe(
          tap(() => results.success++),
          finalize(() => { })
        )
      );
    });

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
