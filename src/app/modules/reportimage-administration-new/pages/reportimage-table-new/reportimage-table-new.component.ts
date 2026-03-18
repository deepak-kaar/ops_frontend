import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReportimageAdministrationNewComponent } from '../../reportimage-administration-new.component';
import { ExportService } from 'src/app/core/services/export.service';
import { finalize, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ManageReportimageNewComponent } from '../../components/manage-reportimage-new/manage-reportimage-new.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ExcelImportResult } from 'src/app/core/services/export.service';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { forkJoin, tap } from 'rxjs';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-reportimage-table-new',
  standalone: false,
  templateUrl: './reportimage-table-new.component.html',
  styleUrl: './reportimage-table-new.component.css'
})
export class ReportimageTableNewComponent extends ReportimageAdministrationNewComponent implements OnInit, OnDestroy {

  searchValue: any;
  iSloading: unknown;
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;
  file_data$!: Observable<any>;
  selectedFiles: any[] = [];

  @ViewChild('dt') dt!: Table;

  countCard: any = {
    name: 'Count',
    svg: `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none"><path fill="url(#SVGHkhX2cMq)" d="M6 12.25A6.25 6.25 0 0 1 12.25 6h23.5A6.25 6.25 0 0 1 42 12.25v23.5A6.25 6.25 0 0 1 35.75 42h-23.5A6.25 6.25 0 0 1 6 35.75z"/><path fill="url(#SVGewp9tcnR)" d="m40.835 39.385l-14.36-14.36a3.5 3.5 0 0 0-4.95 0l-14.36 14.36A6.24 6.24 0 0 0 12.25 42h23.5a6.24 6.24 0 0 0 5.085-2.615"/><path fill="url(#SVGsVI5Ic1r)" d="M27 17a4 4 0 1 1 8 0a4 4 0 0 1-8 0"/><defs><linearGradient id="SVGewp9tcnR" x1="19.19" x2="23.289" y1="24" y2="42.935" gradientUnits="userSpaceOnUse"><stop stop-color="#B3E0FF"/><stop offset="1" stop-color="#8CD0FF"/></linearGradient><linearGradient id="SVGsVI5Ic1r" x1="29.4" x2="32.323" y1="12.111" y2="22.633" gradientUnits="userSpaceOnUse"><stop stop-color="#FDFDFD"/><stop offset="1" stop-color="#B3E0FF"/></linearGradient><radialGradient id="SVGHkhX2cMq" cx="0" cy="0" r="1" gradientTransform="matrix(61.71419 78.10727 -71.04382 56.1332 -8.142 -14.25)" gradientUnits="userSpaceOnUse"><stop offset=".338" stop-color="#0FAFFF"/><stop offset=".529" stop-color="#367AF2"/></radialGradient></defs></g></svg>`
  };

  appRef!: DynamicDialogRef;
  private subscribe$ = new Subject<void>();
  previewVisible: boolean = false;
  previewImage: string | null = null;

  constructor(private datePipe: DatePipe, public sanitizer: DomSanitizer, private exportService: ExportService) {
    super();
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      this.getFiles();
    });
    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      this.getFiles();
    })
    this.getFiles();
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  getFiles(): void {
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }

    this.file_data$ = this.reportimageAdministrationService.getReportImages(payload).pipe(
      map((res: any) => res?.ReportImage || []),
      finalize(() => this.spinner.hide())
    );
  }

  upload(): void {
    if (!(this.filterService.currentApp)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an application' });
      return;
    }

    this.selectedFiles = [];
    if (this.dt) {
      this.dt.selection = null;
    }

    this.appRef = this.dialog.open(ManageReportimageNewComponent, {
      header: 'Upload Attachment',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.showToast('success', 'Success', 'Successfully created', 2000, false);
        this.getFiles();
      }
    });
  }

  private formatDateSafe(value: any): string | null {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : this.datePipe.transform(date, 'mediumDate');
  }

  onSelect(event: TableRowSelectEvent) {
  }

  clearTable(dt: Table) {
    this.dt.reset();
    this.searchValue = '';
    this.selectedFiles = [];
  }

  clear(dt: Table): void {
    this.searchValue = '';
    dt?.clear();
  }

  exportExcel() {
    const exportData = this.selectedFiles && this.selectedFiles.length > 0 ? this.selectedFiles : this.dt?.value || [];
    if (exportData.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'There is no data to export'
      });
      return;
    }
    this.exportService.exportExcel(exportData, 'report_images');
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
            { header: 'Name', field: 'name' },
            { header: 'Created By', field: 'createdBy' },
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
        this.reportimageAdministrationService.postReportImage(payload).pipe(
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
        this.reportimageAdministrationService.putReportImage(payload, id).pipe(
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
        this.reportimageAdministrationService.deleteReportImage(id).pipe(
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
        this.getFiles();
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
      name: rowData.name,
      createdBy: rowData.createdBy,
      appId: rowData.appId || this.filterService.currentApp?.appId || '',
      orgId: rowData.orgId || this.filterService.currentOrg?.orgId || ''
    };
  }

  applyFilterGlobal(event: Event, matchMode: string): void {
    const value = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(value, matchMode);
  }

  deleteFile(data: any) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      header: 'Confirm Delete',
      modal: true,
      closable: true,
      data: {
        message: 'Are you sure you want to delete this attachment?',
        itemName: data.name
      },
      width: '550px'
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        this.reportimageAdministrationService.deleteReportImage(data.reportImageId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Attachment deleted successfully'
            });
            this.getFiles();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete attachment'
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

  downloadFile(file: any) {
    this.reportimageAdministrationService.downloadAttachment(file.fileName.fileId).subscribe({
      next: (blob: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = file.fileName.filename || 'attachment';
        link.click();
        window.URL.revokeObjectURL(link.href);
        this.showToast('info', 'Download', `${file.fileName.filename} downloaded`, 2000, false);
      },
      error: (err) => {
        console.log(err);
        this.showToast('error', 'Error', 'Failed to download file', 2000, false);
      }
    });
  }

  openPreview(file: any): void {
    this.reportimageAdministrationService.downloadAttachment(file.fileName.fileId).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.previewImage = objectUrl;
        this.previewVisible = true;
      },
      error: (err) => {
        console.error(err);
        this.showToast('error', 'Error', 'Failed to load preview', 2000, false);
      }
    });
  }

  editFile(file: any): void {
    this.selectedFiles = [];
    if (this.dt) {
      this.dt.selection = null;
    }

    this.appRef = this.dialog.open(ManageReportimageNewComponent, {
      header: 'Edit Report Image',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        reportImage: file
      },
      width: getResponsiveDialogWidth(),
    });

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.showToast('success', 'Success', 'Successfully updated', 2000, false);
        this.getFiles();
      }
    });
  }

  ngOnDestroy() {
    this.subscribe$.next();
    this.subscribe$.complete();
  }
}
