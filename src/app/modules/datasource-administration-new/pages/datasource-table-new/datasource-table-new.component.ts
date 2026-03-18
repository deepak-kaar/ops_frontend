import { DatePipe } from '@angular/common';
import { ExportService } from 'src/app/core/services/export.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ManageDatasourceNewComponent } from '../../components/manage-datasource-new/manage-datasource-new.component';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { finalize, map, Observable, Subject, takeUntil } from 'rxjs';
import { ExcelImportResult } from 'src/app/core/services/export.service';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { DatasourceAdministrationNewComponent } from '../../datasource-administration-new.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-datasource-table-new',
  standalone: false,
  templateUrl: './datasource-table-new.component.html',
  styleUrl: './datasource-table-new.component.css'
})
export class DatasourceTableNewComponent extends DatasourceAdministrationNewComponent implements OnInit, OnDestroy {

  isShowDetails: boolean = false;

  appRef!: DynamicDialogRef;

  private subscribe$ = new Subject<void>();

  /**
   * @property {any} searchDatasourceValue - Stores the search input value for filtering datasources.
   */
  searchDatasourceValue: any;

  /**
   * @property {unknown} iSDatasourceloading - Indicates the loading state.
   */
  iSDatasourceloading: unknown;

  /**
   * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint for toast notifications.
   */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * @property {Observable<any>} datasource_data$ - Stores the list of datasources fetched from the backend.
   */
  datasource_data$!: Observable<any>;

  @ViewChild('dt') dt!: Table;

  /**
   * @property {FormGroup} updateDataSourceForm - Form group that holds datasource form controls.
   */
  updateDataSourceForm: FormGroup;

  editingDatasource: any;
  selectedDatasources: any[] = [];

  /**
   * @property {any[]} activeStatus - Stores a list of active status options.
   */
  activeStatus: any[] = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false }
  ];

  systemTypes = ['Oracle DB', 'OSI PI', 'MongoDB', 'Sql Server'];

  editorOptions = {
    theme: 'vs-dark',
    language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false
  };

  /**
   * Constructor injects necessary services.
   * @constructor
   * @param {FormBuilder} fb - Form builder service for handling reactive forms.
   * @param {DatePipe} datePipe - DatePipe for date formatting.
   * @param {ExportService} exportService - Service for Excel export/import.
   */
  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private exportService: ExportService
  ) {
    super();

    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getDatasource();
      }
    });

    this.updateDataSourceForm = this.fb.group({
      sysId: new FormControl<string>('', [Validators.required]),
      sysName: new FormControl<string>('', [Validators.required]),
      sysType: new FormControl<string>('', []),
      active: new FormControl<boolean>(true),
      description: new FormControl<string>('', []),
      userJson: new FormControl<string>('', []),
      operatingFacility: new FormControl<string>('', []),
      lastConnectionDate: new FormControl<string>({ value: '', disabled: true }),
      lastRunDuration: new FormControl<number>({ value: 0, disabled: true }),
      lastConnectionSts: new FormControl<string>({ value: '', disabled: true }),
    });

    this.getDatasource();
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  getDatasource(): void {
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    };

    this.datasource_data$ = this.dataSourceAdministrationService.getDataSource().pipe(
      map((res: any) => res?.dataSourceData || []),
      finalize(() => this.spinner.hide())
    );
  }

  createDatasource(): void {
    this.appRef = this.dialog.open(ManageDatasourceNewComponent, {
      header: 'Create Datasource',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    });

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Datasource created successfully', life: 3000 });
        this.getDatasource();
      }
    });
  }

  private formatDateSafe(value: any): string | null {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : this.datePipe.transform(date, 'mediumDate');
  }

  /**
   * Patches the Datasource data to the updateDataSourceForm
   * @param {any} data - datasource data
   */
  patchDataSourceValue(data: any): void {
    this.updateDataSourceForm.patchValue({
      sysId: data.sysId,
      sysName: data.sysName,
      sysType: data.sysType,
      active: data.active,
      userId: data.userId,
      url: data.url,
      description: data.description,
      userJson: JSON.stringify(data.userJson),
      operatingFacility: data.operatingFacility,
      lastConnectionDate: this.formatDateSafe(data.lastConnectionDate),
      lastRunDuration: data.lastRunDuration,
      lastConnectionSts: data.lastConnectionSts,
    });
  }

  /**
   * Handles datasource selection from a table.
   * @param {TableRowSelectEvent} event - The event object containing details of the selected row.
   */
  onDataSourceSelect(event: TableRowSelectEvent) {
    this.editingDatasource = event.data;
    this.patchDataSourceValue(event.data);
    this.isShowDetails = true;
  }

  /**
   * Handles row click selection for desktop table.
   * @param {any} data - The selected datasource data.
   */
  onDataSourceSelectRow(data: any) {
    this.editingDatasource = data;
    this.patchDataSourceValue(data);
    this.isShowDetails = true;
  }

  /**
   * Handles card selection for mobile view.
   * @param {any} data - The selected datasource data.
   */
  onDataSourceSelectMobile(data: any) {
    this.editingDatasource = data;
    this.patchDataSourceValue(data);
    this.isShowDetails = true;
  }

  /**
   * Clears the table filter/search.
   * @param {Table} dt - The table reference whose filter should be cleared.
   */
  clearDatasourceTable(dt: Table) {
    this.dt.reset();
    this.searchDatasourceValue = '';
    this.selectedDatasources = [];
  }

  clear(dt: Table): void {
    this.searchDatasourceValue = '';
    dt?.clear();
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  applyFilterGlobal(event: Event, matchMode: string): void {
    const value = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(value, matchMode);
  }

  /**
   * Edits an existing DataSource.
   * @param {any} data - The datasource to be edited.
   */
  editDatasource(data: any) {
    if (this.updateDataSourceForm.valid) {
      const payload = {
        ...this.updateDataSourceForm.getRawValue()
      };
      this.dataSourceAdministrationService.putDataSource(payload, data._id).subscribe({
        next: () => {
          this.isShowDetails = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Updated successfully'
          });
          this.getDatasource();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update'
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Fields validation failed'
      });
    }
  }

  /**
   * Deletes an existing datasource.
   * Opens a confirmation dialog before deletion.
   * @param {any} data - The datasource data to be deleted.
   */
  deleteDatasource(data: any) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      header: 'Confirm Delete',
      modal: true,
      closable: true,
      data: {
        message: 'Are you sure you want to delete this datasource?',
        itemName: data.sysName
      },
      width: '550px'
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        this.dataSourceAdministrationService.deleteDataSource(data._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Datasource deleted successfully'
            });
            this.getDatasource();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete datasource'
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

  getSeverity(status: boolean) {
    switch (status) {
      case true:
        return 'success';
      case false:
        return 'danger';
      default:
        return 'success';
    }
  }

  getStatus(status: boolean) {
    switch (status) {
      case true:
        return 'Active';
      case false:
        return 'Inactive';
      default:
        return 'Active';
    }
  }

  ngOnDestroy() {
    this.subscribe$.next();
    this.subscribe$.complete();
    this.isShowDetails = false;
  }

  exportExcel() {
    const exportData = this.selectedDatasources && this.selectedDatasources.length > 0 ? this.selectedDatasources : this.dt?.value || [];
    if (exportData.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'There is no data to export'
      });
      return;
    }
    this.exportService.exportExcel(exportData, 'datasources');
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
      this.spinner.hide();

      if (importResults.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'No Data',
          detail: 'The imported file contains no data'
        });
        return;
      }

      this.appRef = this.dialog.open(ConfirmationDailogExcelComponent, {
        header: 'Confirm Import Changes',
        modal: true,
        closable: true,
        data: {
          importData: importResults,
          displayColumns: [
            { header: 'System Name', field: 'sysName' },
            { header: 'System Id', field: 'sysId' },
            { header: 'System Type', field: 'sysType' }
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

        this.getDatasource();
      }
    };

    // Process Add New
    groupedChanges.addNew.forEach((item: ExcelImportResult) => {
      try {
        const payload = this.prepareAddNewPayload(item.rowData);

        this.dataSourceAdministrationService.postDataSource(payload).subscribe({
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

        this.dataSourceAdministrationService.putDataSource(payload, id).subscribe({
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

      this.dataSourceAdministrationService.deleteDataSource(id).subscribe({
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
   * Prepare payload for Add New operations
   */
  prepareAddNewPayload(rowData: any): any {
    const { _id, createdOn, createdBy, modifiedDate, modifiedBy, ...cleanData } = rowData;

    return {
      sysId: cleanData.sysId,
      sysName: cleanData.sysName,
      sysType: cleanData.sysType,
      active: this.convertToBoolean(cleanData.active),
      description: cleanData.description || '',
      userJson: this.parseUserJson(cleanData.userJson),
      operatingFacility: cleanData.operatingFacility || '',
      appId: cleanData.appId || this.filterService.currentApp?.appId || '',
      orgId: cleanData.orgId || this.filterService.currentOrg?.orgId || ''
    };
  }

  /**
   * Prepare payload for Edit operations
   */
  prepareEditPayload(rowData: any): any {
    const { createdOn, createdBy, ...cleanData } = rowData;

    return {
      _id: cleanData._id,
      sysId: cleanData.sysId,
      sysName: cleanData.sysName,
      sysType: cleanData.sysType,
      active: this.convertToBoolean(cleanData.active),
      description: cleanData.description || '',
      userJson: this.parseUserJson(cleanData.userJson),
      operatingFacility: cleanData.operatingFacility || '',
      appId: cleanData.appId || this.filterService.currentApp?.appId || '',
      orgId: cleanData.orgId || this.filterService.currentOrg?.orgId || ''
    };
  }

  /**
   * Convert various active field formats to boolean
   */
  private convertToBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      return lowerValue === 'true' || lowerValue === 'active' || lowerValue === '1';
    }
    return Boolean(value);
  }

  /**
   * Parse userJson field safely
   */
  private parseUserJson(userJson: any): any {
    if (!userJson) {
      return {};
    }

    if (typeof userJson === 'string') {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.warn('Failed to parse userJson:', userJson);
        return {};
      }
    }

    return userJson;
  }
}
