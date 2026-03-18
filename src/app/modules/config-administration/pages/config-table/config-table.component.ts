import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ExportService } from 'src/app/core/services/export.service';
import { ConfigAdministrationComponent } from '../../config-administration.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, map, Observable, of, Subject, takeUntil, forkJoin, tap } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ManageConfigComponent } from '../../components/manage-config/manage-config.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ExcelImportResult } from 'src/app/core/services/export.service';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { TableColumn, TableAction, TableConfig, TableWrapperComponent } from 'src/app/core/components/table-wrapper/table-wrapper.component';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-config-table',
  standalone: false,
  templateUrl: './config-table.component.html',
  styleUrl: './config-table.component.css'
})
export class ConfigTableComponent extends ConfigAdministrationComponent implements OnInit, OnDestroy {

  @ViewChild('tableWrapper') tableWrapper!: TableWrapperComponent;

  appRef!: DynamicDialogRef;

  searchValue: string = '';

  /**
 * @property {boolean} iSConfigloading - Indicates the loading state.
 */
  iSConfigloading: boolean = false;

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
* @property {Observable<any>} config_data - Stores the list of config fetched from the backend.
*/
  config_data$!: Observable<any>;

  selectedConfigs: any[] = []; // store selected rows for export

  // Table configuration
  columns: TableColumn[] = [
    { field: 'configName', header: 'Config Name', sortable: true, filterable: false, minWidth: '12rem' },
    { field: 'configValue', header: 'Config Value', sortable: false, filterable: false, minWidth: '14rem', template: 'custom' },
    { field: 'appName', header: 'App Name', sortable: true, filterable: false, minWidth: '10rem' },
    { field: 'modifiedOn', header: 'Last Updated At', template: 'date', sortable: true },
    { field: 'modifiedBy', header: 'Last Updated By', sortable: true, filterable: false, minWidth: '10rem' }
  ];

  actions: TableAction[] = [
    { icon: 'pi pi-pencil', tooltip: 'Edit', severity: 'info', action: 'edit' },
    { icon: 'pi pi-trash', tooltip: 'Delete', severity: 'danger', action: 'delete' }
  ];

  tableConfig: TableConfig = {
    dataKey: '_id',
    rows: 20,
    rowsPerPageOptions: [20, 30, 50],
    paginator: true,
    globalFilterFields: ['configName', 'configValue', 'createdBy'],
    selectionMode: 'multiple',
    rowHover: true,
    emptyMessage: 'No Config found.',
    showCaption: false,
    showSearch: false,
    showClearFilter: false,
    showCreateButton: false,
    showMobileView: false
  };

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

  baseEditorOptions = {
    theme: 'vs-dark',
    language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false
  };

  configEditorOptions = { ...this.baseEditorOptions, readOnly: true };

  // Encrypt/Decrypt properties
  encryptDialogVisible = false;
  decryptDialogVisible = false;
  encryptInput = '';
  decryptInput = '';
  encryptedResult = '';
  decryptedResult = '';
  isEncrypting = false;
  isDecrypting = false;

  private subscribe$ = new Subject<void>();

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
    private responsive: ResponsiveService
  ) {
    super();
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      this.getConfig();
    })
    this.getConfig();
  }

  ngOnInit() {
    this.isMobile$ = this.responsive.isMobile$();
  }

  onTabClick() {

  }

  getConfig(): void {
    const payload = {
      appId: this.filterService.currentApp?.appId ?? ''
    };

    this.config_data$ = this.configAdministrationService.getConfig(payload).pipe(
      map((res: any) => {
        const rows = res?.Config || [];
        return rows.map((row: any) => ({
          ...row,
          // Last Updated At fallback from response
          modifiedOn: row?.modifiedOn || row?.createdOn || null
        }));
      }),
      finalize(() => this.spinner.hide())
    );
  }

  mobileTabButtonChange(): void {

  }


  createConfig(): void {
    // if (!(this.filterService.currentApp)) {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an application' });
    //   return;
    // }
    this.appRef = this.dialog.open(ManageConfigComponent, {
      header: 'Create Config',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Config created successfully', life: 3000 });
        this.getConfig();
      }
    });
  }

  private formatDateSafe(value: any): string | null {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : this.datePipe.transform(date, 'mediumDate');
  }


  /**
 * Handles application selection from a table.
 */
  onConfigSelect(event: any): void {
    this.selectedConfigs = event.data ? [event.data] : [];
  }

  /**
 * Clears the table filter/search.
 */
  clearConfigTable(): void {
    this.selectedConfigs = [];
    this.searchValue = '';
    this.tableWrapper?.clearFilters();
  }

  /**
   * Applies global search filter on the table.
   */
  onSearch(event: Event): void {
    this.tableWrapper?.applyFilterGlobal(event, 'contains');
  }

  onAction(event: { action: string; row: any }): void {
    const { action, row } = event;
    switch (action) {
      case 'edit':
        this.editConfig(row);
        break;
      case 'delete':
        this.deleteConfig(row);
        break;
    }
  }

  /**
 * Edits an existing Config.
 * @param {any} data - The config to be edited.
 */
  editConfig(data: any) {
    this.appRef = this.dialog.open(ManageConfigComponent, {
      header: 'Edit Config',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        configData: data
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Config edited successfully', life: 3000 });
        this.getConfig();
      }
    });

  }

  /**
   * Deletes an existing configuration.
   * Opens a confirmation dialog before deletion
   * @param {any} data - The configuration data to be deleted.
   */
  deleteConfig(data: any) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      showHeader: false,          // remove Prime header bar
      closable: false,            // remove Prime top-right close icon
      modal: true,
      dismissableMask: true,
      styleClass: 'delete-confirmation-modal',
      width: '460px',
      data: {
        entityLabel: 'Configuration',
        itemName: data?.configName ?? '',
        title: 'Delete Configuration',
        subtitle: 'This action cannot be undone',
        confirmText: 'Delete Configuration',
        cancelText: 'Cancel'
      }
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        this.configAdministrationService.deleteConfig(data._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Configuration deleted successfully'
            });
            this.getConfig();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete configuration'
            });
          }
        });
      }
    });
  }


  // Encrypt/Decrypt Methods
  openEncryptDialog(): void {
    this.encryptDialogVisible = true;
    this.clearEncrypt();
  }

  openDecryptDialog(): void {
    this.decryptDialogVisible = true;
    this.clearDecrypt();
  }

  performEncrypt(): void {
    if (!this.encryptInput.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter a value to encrypt'
      });
      return;
    }

    this.isEncrypting = true;
    this.configAdministrationService.encryptValue(this.encryptInput).subscribe({
      next: (response: any) => {
        this.encryptedResult = response.encryptedValue;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Value encrypted successfully'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to encrypt value'
        });
      },
      complete: () => {
        this.isEncrypting = false;
      }
    });
  }

  performDecrypt(): void {
    if (!this.decryptInput.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter an encrypted value to decrypt'
      });
      return;
    }

    this.isDecrypting = true;
    this.configAdministrationService.decryptValue(this.decryptInput).subscribe({
      next: (response: any) => {
        this.decryptedResult = response.decryptedValue;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Value decrypted successfully'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to decrypt value. Please check if the value is properly encrypted.'
        });
      },
      complete: () => {
        this.isDecrypting = false;
      }
    });
  }

  clearEncrypt(): void {
    this.encryptInput = '';
    this.encryptedResult = '';
  }

  clearDecrypt(): void {
    this.decryptInput = '';
    this.decryptedResult = '';
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Copied',
        detail: 'Value copied to clipboard'
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to copy to clipboard'
      });
    });
  }

  /**
  * Lifecycle hook triggered after the time of component destroy.
  * unsubscribes the filter subscriptions
  */
  ngOnDestroy() {
  }

  exportExcel() {
    this.config_data$.subscribe(data => {
      const exportData = this.selectedConfigs && this.selectedConfigs.length > 0 ? this.selectedConfigs : data || [];
      if (exportData.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'No Data',
          detail: 'There is no data to export'
        });
        return;
      }
      this.exportService.exportExcel(exportData, 'configurations');
    }).unsubscribe();
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
            { header: 'Config Name', field: 'configName' },
            { header: 'Config Value', field: 'configValue' },
            { header: 'App Name', field: 'appName' },
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
        this.configAdministrationService.postConfig(payload).pipe(
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
        this.configAdministrationService.putConfig(payload, id).pipe(
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
        this.configAdministrationService.deleteConfig(id).pipe(
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
        this.getConfig();
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
    const payload: any = {
      configName: rowData.configName,
      configValue: rowData.configValue,
      appId: rowData.appId || this.filterService.currentApp?.appId || '',
      appName: rowData.appName || this.filterService.currentApp?.appName || ''
    };

    // Add createdBy only if it exists (for edit operations)
    if (rowData.createdBy) {
      payload.createdBy = rowData.createdBy;
    }

    return payload;
  }
}
