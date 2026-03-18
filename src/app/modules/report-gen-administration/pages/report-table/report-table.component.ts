import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReportGenAdministrationComponent } from '../../report-gen-administration.component';
import { finalize, forkJoin, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Table } from 'primeng/table';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ExcelImportResult, ExportService } from 'src/app/core/services/export.service';
import { ConfirmationService } from 'primeng/api';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ManageSchedulerjobNewComponent } from 'src/app/modules/schedulerjob-administration-new/components/manage-schedulerjob-new/manage-schedulerjob-new.component';

@Component({
  selector: 'app-report-table',
  standalone: false,
  templateUrl: './report-table.component.html',
  styleUrl: './report-table.component.css'
})
export class ReportTableComponent extends ReportGenAdministrationComponent implements OnInit, OnDestroy {
  isShowDetails: boolean = false;


  private subscribe$ = new Subject<void>();

  /**
 * @property {any} searchEmailValue - Stores the search input value for filtering applications.
 */
  searchEmailValue: any;


  /**
 * @property {unknown} iSEmailloading - Indicates the loading state (can be replaced with a boolean for better clarity).
 */
  iSEmailloading: unknown;



  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
* @property {Observable<any>} email_data$ - Stores the list of email fetched from the backend.
*/
  email_data$!: Observable<any>;


  /**
  * @property {Observable<any>} jobs_data$ - Stores the list of email fetched from the backend.
  */
  jobs_data$!: Observable<any>;
  scheduling_data$!: Observable<any>;
  editingEmail: any; // store data for editing
  editingJob: any;
  selectedEmails: any[] = []; // store selected rows for export

  /**
* @property {any[]} activeStatus - Stores a list of active status (potentially for dropdown selection).
*/
  activeStatus: any[] = [
    {
      name: 'Active',
      value: true
    },
    {
      name: 'Inactive',
      value: false
    }
  ];

  mode: 'create' | 'edit' = "create";
  statuses = ['OpsInsight', 'Application', 'Organization'];
  searchJobValue: any;
  selectedJobs: any[] = [];

  @ViewChild('dt') dt!: Table;

  appRef!: DynamicDialogRef;

  /**
 * Constructor injects necessary services.
 * @constructor
 * @param {Router} router - Angular Router service to interact router,
 * @param {FormBuilder} fb - Form builder service for handling reactive forms.
 */
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private exportService: ExportService,
    private confirmationService: ConfirmationService
  ) {
    super();
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      this.getJobs();
    });
    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      this.getJobs();
    });
    this.getEmails();
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  // This will be called when child emits `emailCreated`
  onEmailCreated() {
    this.getEmails();
  }


  getEmails(): void {
    // this.spinner.show();

    // this.email_data$ = of([
    //   {
    //     "emailId":"1",
    //     "from": "admin@company.com",
    //     "to": "team@company.com",
    //     "cc": "manager@company.com",
    //     "bcc": "audit@company.com",
    //     "subject": "Weekly Performance Report - October Week 3",
    //     "body": "Dear Team,\n\nPlease find attached the performance report for the week ending October 19, 2025.\nKindly review and share your feedback by Tuesday EOD.\n\nBest regards,\nAdmin Team",
    //     "comments": "Report sent to all department heads for review.",
    //     "createdBy": "system_admin",
    //     "createdOn": "2025-10-19T09:30:00Z",
    //     "modifiedBy": "system_admin",
    //     "modifiedOn": "2025-10-19T09:45:00Z",
    //     "active": true,
    //     "group": true,
    //     "corprepo": true,
    //     "lastsent": "2025-10-19T09:31:00Z",
    //     "sendafter": "2025-10-20T08:00:00Z",
    //     "attached_reports": "weekly_performance_report_oct_week3.pdf"
    //   },
    //   {
    //     "emailID":"2",
    //     "from": "noreply@company.com",
    //     "to": "allstaff@company.com",
    //     "cc": "",
    //     "bcc": "audit@company.com",
    //     "subject": "Scheduled Maintenance Notification",
    //     "body": "Dear Employees,\n\nPlease note that the corporate mail system will undergo scheduled maintenance on October 22 from 1 AM to 3 AM.\nDuring this period, email access will be temporarily unavailable.\n\nThank you for your understanding,\nIT Support",
    //     "comments": "Maintenance window announced company-wide.",
    //     "createdBy": "it_admin",
    //     "createdOn": "2025-10-18T12:00:00Z",
    //     "modifiedBy": "it_admin",
    //     "modifiedOn": "2025-10-18T12:30:00Z",
    //     "active": true,
    //     "group": true,
    //     "corprepo": false,
    //     "lastsent": "2025-10-18T12:05:00Z",
    //     "sendafter": "2025-10-21T23:00:00Z",
    //     "attached_reports": ""
    //   },
    //   {
    //     "emailID":"3",
    //     "from": "hr@company.com",
    //     "to": "employees@company.com",
    //     "cc": "managers@company.com",
    //     "bcc": "",
    //     "subject": "Reminder: Submit Q4 Leave Plans",
    //     "body": "Hello Everyone,\n\nThis is a gentle reminder to submit your Q4 leave plans by October 25, 2025, to help us plan project schedules accordingly.\n\nThank you,\nHR Department",
    //     "comments": "Annual HR reminder email.",
    //     "createdBy": "hr_admin",
    //     "createdOn": "2025-10-17T08:15:00Z",
    //     "modifiedBy": "hr_admin",
    //     "modifiedOn": "2025-10-17T08:45:00Z",
    //     "active": true,
    //     "group": false,
    //     "corprepo": true,
    //     "lastsent": "2025-10-17T09:00:00Z",
    //     "sendafter": "2025-10-17T09:05:00Z",
    //     "attached_reports": ""
    //   }
    // ]
    // );

    // this.email_data$ = this.emailAdministrationService.getEmails().pipe(
    //   map((res: any) => res?.Email || []),
    //   finalize(() => this.spinner.hide())
    // );

    const appId = this.filterService.currentApp?.appId ?? '';
    const orgId = this.filterService.currentOrg?.orgId ?? '';
    const filter = orgId ? { schedulerType: 'Re-generate Reports', appId: appId, orgId: orgId } : { schedulerType: 'Re-generate Reports', appId: appId }
    this.jobs_data$ = this.ReportGenAdministrationService.getJobs(filter).pipe(
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


  createJobMapping(): void {
    this.mode = "create";
    this.isShowDetails = true;
    this.editingEmail = null;
    if (this.dt) {
      this.dt.selection = null;
    }
  }


  private getResponsiveDialogWidthJS(): string {
    const screenWidth = window.innerWidth;
    if (screenWidth > 1200) return '1200px';
    if (screenWidth > 992) return '700px';
    if (screenWidth > 768) return '600px';
    return '90vw';
  }


  private formatDateSafe(value: any): string | null {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : this.datePipe.transform(date, 'mediumDate');
  }


  editJob(jobData: any) {
    this.mode = "edit";
    this.editingJob = jobData;
    this.isShowDetails = true;
  }


  /**
 * Clears the table filter/search.
 * @param {Table} _t19 - The table reference whose filter should be cleared.
 */
  clearEmailTable(_t19: Table) {
    this.dt.reset();
    this.searchEmailValue = '';
    this.selectedEmails = [];
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  /**
   * Deletes an existing email.
   * Opens a confirmation dialog before deletion
   * @param {any} data - The email data to be deleted.
   */
  deleteEmail(data: any) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      header: 'Confirm Delete',
      modal: true,
      closable: true,
      data: {
        message: 'Are you sure you want to delete this email?',
        itemName: data.emailSubject
      },
      width: '550px'
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        // this.ReportGenAdministrationService.deleteEmail(data.emailId).subscribe({
        //   next: () => {
        //     this.showToast('success', 'Deleted', 'Email deleted successfully', 2000, false);
        //     this.isShowDetails = false;
        //     this.getEmails();
        //   },
        //   error: () => {
        //     this.showToast('error', 'Error', 'Failed to delete email', 2000, false);
        //   }
        // });
      } else {
        this.showToast('info', 'Cancelled', 'Delete operation cancelled', 2000, false);
      }
    });
  }



  getSeverity(status: string) {
    switch (status) {
      case "true":
        return 'success';

      case "false":
        return 'danger';
      default:
        return 'success'
    }
  }

  getStatus(status: string) {
    switch (status) {
      case "true":
        return 'Active';

      case "false":
        return 'Inactive';
      default:
        return 'success'
    }
  }


  /**
  * Lifecycle hook triggered after the time of component destroy.
  * unsubscribes the filter subscriptions
  */
  ngOnDestroy() {
    this.isShowDetails = false;
  }

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

      if (importResults.length === 0) {
        this.showToast('warn', 'No Data', 'The imported file contains no data', 3000, false);
        this.spinner.hide();
        return;
      }

      // Open confirmation dialog
      this.appRef = this.dialog.open(ConfirmationDailogExcelComponent, {
        header: 'Confirm Import Changes',
        modal: true,
        closable: true,
        data: {
          importData: importResults
        },
        width: getResponsiveDialogWidth(),
        style: { maxHeight: '80vh' }
      });

      this.appRef.onClose.subscribe((result: any) => {
        if (result?.confirmed) {
          this.processImportData(result.data);
        }
      });

      this.spinner.hide();
    } catch (error) {
      this.spinner.hide();
      this.showToast('error', 'Import Error', 'Failed to import Excel file. Please check the file format.', 3000, false);
      console.error('Import error:', error);
    }
  }

  /**
   * Process imported data and call respective APIs
   */
  processImportData(groupedChanges: any): void {
    this.spinner.show();

    const requests: Observable<any>[] = [];
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process Add New
    groupedChanges.addNew.forEach((item: ExcelImportResult) => {
      const payload = this.preparePayload(item.rowData);
      requests.push(
        // this.emailAdministrationService.postEmail(payload).pipe(
        //   tap(() => results.success++),
        //   finalize(() => { })
        // )
      );
    });

    // Process Edit
    groupedChanges.edit.forEach((item: ExcelImportResult) => {
      const payload = this.preparePayload(item.rowData);
      const id = item.rowData.emailId || item.rowData._id;

      if (!id) {
        results.failed++;
        results.errors.push(`Row ${item.rowIndex}: Missing ID for edit operation`);
        return;
      }

      requests.push(
        // this.emailAdministrationService.putEmail(payload, id).pipe(
        //   tap(() => results.success++),
        //   finalize(() => { })
        // )
      );
    });

    // Process Delete
    groupedChanges.delete.forEach((item: ExcelImportResult) => {
      const id = item.rowData.emailId || item.rowData._id;

      if (!id) {
        results.failed++;
        results.errors.push(`Row ${item.rowIndex}: Missing ID for delete operation`);
        return;
      }

      requests.push(
        // this.emailAdministrationService.deleteEmail(id).pipe(
        //   tap(() => results.success++),
        //   finalize(() => { })
        // )
      );
    });

    // Execute all requests
    if (requests.length === 0) {
      this.spinner.hide();
      this.showToast('info', 'No Changes', 'No changes to process', 3000, false);
      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.spinner.hide();
        this.showToast(
          'success',
          'Import Complete',
          `Successfully processed ${results.success} records${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
          3000,
          false
        );
        this.getEmails();
      },
      error: (error) => {
        this.spinner.hide();
        this.showToast('error', 'Import Failed', 'Some operations failed during import', 3000, false);
        console.error('Import processing error:', error);
      }
    });
  }

  /**
   * Prepare payload for API calls
   */
  preparePayload(rowData: any): any {
    return {
      from: rowData.from,
      to: rowData.to,
      cc: rowData.cc || '',
      bcc: rowData.bcc || '',
      emailSubject: rowData.emailSubject || rowData.subject,
      emailBody: rowData.emailBody || rowData.body,
      comments: rowData.comments || '',
      isActive: rowData.isActive !== undefined ? rowData.isActive : true,
      group: rowData.group || false,
      corprepo: rowData.corprepo || false,
      lastsent: rowData.lastsent || null,
      sendafter: rowData.sendafter || null,
      attached_reports: rowData.attached_reports || ''
    };
  }

  async exportExcel() {
    try {
      const exportData = this.selectedEmails && this.selectedEmails.length > 0 ? this.selectedEmails : this.dt.value;
      await this.exportService.exportExcel(exportData, 'emails');
      this.showToast('success', 'Export Successful', 'Excel file with dropdown actions exported successfully', 3000, false);
    } catch (error) {
      this.showToast('error', 'Export Failed', 'Failed to export Excel file', 3000, false);
      console.error('Export error:', error);
    }
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
        this.ReportGenAdministrationService.updateJobMapping({_id: data._id}).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Job mapping Deleted successfully'
            });
            this.isShowDetails = false;
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

  getJobs(): void {
    this.spinner.show();
    const appId = this.filterService.currentApp?.appId ?? '';
    const orgId = this.filterService.currentOrg?.orgId ?? '';
    this.scheduling_data$ = this.ReportGenAdministrationService.getJobs().pipe(
      map((res: any) =>
        (res?.Jobs || [])
          .filter((job: any) => job.schedulerType === 'Re-generate Reports' && job.inScheduled === true)
          .filter((job: any) => {
            if (appId && orgId) return job.appId === appId && job.orgId === orgId;
            if (appId) return job.appId === appId;
            return true;
          })
          .map((job: any) => ({
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


  clearSchedulingTable(_t19: Table) {
    this.dt.reset();
    this.searchJobValue = '';
    this.selectedJobs = [];
  }

  handleClose(): void {
    this.isShowDetails = false;
    this.getJobs();
  }
}
