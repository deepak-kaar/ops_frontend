import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatabaseAdministrationComponent } from '../../database-administration.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { ManageQueryComponent } from '../../components/manage-query/manage-query.component';
import { ExcelImportResult } from 'src/app/core/services/export.service';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { forkJoin, tap } from 'rxjs';
import { ExportService } from 'src/app/core/services/export.service';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-database-query-table',
  standalone: false,
  templateUrl: './database-query-table.component.html',
  styleUrl: './database-query-table.component.css'
})
export class DatabaseQueryTableComponent extends DatabaseAdministrationComponent implements OnInit, OnDestroy {

  isShowMappingTable: boolean = false;

  appRef!: DynamicDialogRef;

  private subscribe$ = new Subject<void>();

  /**
 * @property {any} searchDBQueryValue - Stores the search input value for filtering applications.
 */
  searchDBQueryValue: any;


  /**
 * @property {unknown} iSDBQueryloading - Indicates the loading state (can be replaced with a boolean for better clarity).
 */
  iSDBQueryloading: unknown;



  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
* @property {Observable<any>} db_query_data - Stores the list of data source fetched from the backend.
*/
  db_query_data$!: Observable<any>;

  @ViewChild('dt') dt!: Table;

  selectedDBQueries: any[] = []; // store selected rows for export
  activeDBQuery: any; // store active row for mapping view

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

  /**
 * Constructor injects necessary services.
 * @constructor
 */
  constructor(private exportService: ExportService) {
    super();
    this.filterService.selectedSystem$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        console.log("event occured:", event);
        this.getDBQuery();
      }
    });
    this.getDBQuery();
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  prepareTableData(data: any[]) {
    return data.map(row => ({
      ...row,
      editorOptions: this.getEditorBaseOptions(row.queryLanguage)
    }));
  }

  getEditorBaseOptions(lang: string) {
    return {
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      readOnly: true,
      language: lang || 'plaintext'
    };
  }



  getDBQuery(): void {
    this.spinner.show();
    this.db_query_data$ = this.databaseAdministrationService.getDatabase().pipe(
      map((res: any) => this.prepareTableData(res?.dataBaseData) || []),
      finalize(() => this.spinner.hide())
    );
  }

  mobileTabButtonChange(): void {

  }


  createDBQuery(): void {
    if (!(this.filterService.currentSystem)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an system' });
      return;
    }

    this.appRef = this.dialog.open(ManageQueryComponent, {
      header: 'Create Query',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        systemData: this.filterService.currentSystem
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Query created successfully', life: 3000 });
        this.getDBQuery();
      }
    });
  }


  onDBQuerySelect(event: TableRowSelectEvent) {
    this.activeDBQuery = event.data;
    this.isShowMappingTable = true;
  }

  /**
 * Clears the table filter/search.
 * @param {Table} _t19 - The table reference whose filter should be cleared.
 */
  clearDBQueryTable(_t19: Table) {
    this.dt.reset();
    this.searchDBQueryValue = '';
    this.selectedDBQueries = [];
    this.activeDBQuery = null;
    this.isShowMappingTable = false;
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  /**
 * Edits an existing Database query.
 * @param {any} data - The database query to be edited.
 */
  editDBQuery(data: any) {
    this.appRef = this.dialog.open(ManageQueryComponent, {
      header: 'Edit Query',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        queryData: data,
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Query edited successfully', life: 3000 });
        this.getDBQuery();
      }
    });
  }

  /**
   * Deletes an existing database query.
   * Opens a confirmation dialog before deletion
   * @param {any} data - The database query data to be deleted.
   */
  deleteDBQuery(data: any) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      header: 'Confirm Delete',
      modal: true,
      closable: true,
      data: {
        message: 'Are you sure you want to delete this database query?',
        itemName: data.queryId
      },
      width: '550px'
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        this.databaseAdministrationService.deleteDatabase(data._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Database query deleted successfully'
            });
            this.getDBQuery();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete database query'
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
    this.isShowMappingTable = false;
  }

  exportExcel() {
    const exportData = this.selectedDBQueries && this.selectedDBQueries.length > 0 ? this.selectedDBQueries : this.dt?.value || [];
    if (exportData.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'There is no data to export'
      });
      return;
    }
    this.exportService.exportExcel(exportData, 'database_queries');
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

      // Open confirmation dialog
      this.appRef = this.dialog.open(ConfirmationDailogExcelComponent, {
        header: 'Confirm Import Changes',
        modal: true,
        closable: true,
        data: {
          importData: importResults,
          displayColumns: [
            { header: 'Query ID', field: 'queryId' },
            { header: 'Description', field: 'description' },
            { header: 'System Name', field: 'sysName' }
          ]
        },
        width: getResponsiveDialogWidth(),
        style: { maxHeight: '80vh' }
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

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    const totalOperations =
      groupedChanges.addNew.length +
      groupedChanges.edit.length +
      groupedChanges.delete.length;

    if (totalOperations === 0) {
      this.spinner.hide();
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes',
        detail: 'No changes to process'
      });
      return;
    }

    let completedOperations = 0;

    const checkCompletion = () => {
      completedOperations++;
      if (completedOperations === totalOperations) {
        this.spinner.hide();

        if (results.success > 0 || results.failed > 0) {
          const severity = results.failed === 0 ? 'success' : (results.success > 0 ? 'warn' : 'error');
          let detail = `Successfully processed ${results.success} record(s)`;

          if (results.failed > 0) {
            detail += `, ${results.failed} failed`;
          }

          this.messageService.add({
            severity: severity,
            summary: 'Import Complete',
            detail: detail,
            life: 5000
          });
        }

        this.getDBQuery();
      }
    };

    // Process Add New
    groupedChanges.addNew.forEach((item: ExcelImportResult) => {
      try {
        const payload = this.prepareAddNewPayload(item.rowData);
        this.databaseAdministrationService.postDatabase(payload).subscribe({
          next: () => {
            results.success++;
            checkCompletion();
          },
          error: (error) => {
            results.failed++;
            const errorMessage = error?.error?.message || error?.error?.response || error?.message || 'Unknown error';
            results.errors.push(`Row ${item.rowIndex} (Add New): ${errorMessage}`);
            checkCompletion();
          }
        });
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${item.rowIndex} (Add New): ${error.message || 'Payload preparation failed'}`);
        checkCompletion();
      }
    });

    // Process Edit
    groupedChanges.edit.forEach((item: ExcelImportResult) => {
      try {
        const id = item.rowData._id;
        if (!id) {
          results.failed++;
          results.errors.push(`Row ${item.rowIndex} (Edit): Missing _id field`);
          checkCompletion();
          return;
        }

        const payload = this.prepareEditPayload(item.rowData);

        this.databaseAdministrationService.putDatabase(payload, id).subscribe({
          next: () => {
            results.success++;
            checkCompletion();
          },
          error: (error) => {
            results.failed++;
            const errorMessage = error?.error?.message || error?.error?.response || error?.message || 'Unknown error';
            results.errors.push(`Row ${item.rowIndex} (Edit): ${errorMessage}`);
            checkCompletion();
          }
        });
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${item.rowIndex} (Edit): ${error.message || 'Payload preparation failed'}`);
        checkCompletion();
      }
    });

    // Process Delete
    groupedChanges.delete.forEach((item: ExcelImportResult) => {
      const id = item.rowData._id;

      if (!id) {
        results.failed++;
        results.errors.push(`Row ${item.rowIndex} (Delete): Missing _id field`);
        checkCompletion();
        return;
      }

      this.databaseAdministrationService.deleteDatabase(id).subscribe({
        next: () => {
          results.success++;
          checkCompletion();
        },
        error: (error) => {
          results.failed++;
          const errorMessage = error?.error?.message || error?.error?.response || error?.message || 'Unknown error';
          results.errors.push(`Row ${item.rowIndex} (Delete): ${errorMessage}`);
          checkCompletion();
        }
      });
    });
  }

  /**
   * Prepare payload for Add New operations - excludes all system-generated fields
   */
  prepareAddNewPayload(rowData: any): any {
    const { _id, createdOn, createdBy, modifiedDate, modifiedBy, ...cleanData } = rowData;

    return {
      queryId: cleanData.queryId,
      description: cleanData.description,
      query: cleanData.query,
      sysId: cleanData.sysId || this.filterService.currentSystem?.sysId || '',
      sysName: cleanData.sysName || this.filterService.currentSystem?.sysName || '',
      queryLanguage: cleanData.queryLanguage || 'sql',
    };
  }

  /**
   * Prepare payload for Edit operations - includes _id but excludes creation metadata
   */
  prepareEditPayload(rowData: any): any {
    const { createdOn, createdBy, ...cleanData } = rowData;

    return {
      _id: cleanData._id,
      queryId: cleanData.queryId,
      description: cleanData.description,
      query: cleanData.query,
      sysId: cleanData.sysId || this.filterService.currentSystem?.sysId || '',
      sysName: cleanData.sysName || this.filterService.currentSystem?.sysName || '',
      queryLanguage: cleanData.queryLanguage || 'sql',
    };
  }
}
