import { DatePipe } from '@angular/common';
import { ExportService } from 'src/app/core/services/export.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ManageDatasourceComponent } from '../../components/dialogs/manage-datasource/manage-datasource.component';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { forkJoin, tap, finalize, map, Observable, Subject, takeUntil } from 'rxjs';
import { ExcelImportResult } from 'src/app/core/services/export.service';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { DatasourceAdministrationComponent } from '../../datasource-administration.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-datasource-table',
  standalone: false,
  templateUrl: './datasource-table.component.html',
  styleUrl: './datasource-table.component.css'
})
export class DatasourceTableComponent extends DatasourceAdministrationComponent implements OnInit, OnDestroy {

  buttonActions: string[] = [
    "Create"
  ]

  selectedButtonAction!: string;

  isShowDetails: boolean = false;

  appRef!: DynamicDialogRef;

  private subscribe$ = new Subject<void>();

  /**
 * @property {any} searchDatasourceValue - Stores the search input value for filtering applications.
 */
  searchDatasourceValue: any;


  /**
 * @property {unknown} iSDatasourceloading - Indicates the loading state (can be replaced with a boolean for better clarity).
 */
  iSDatasourceloading: unknown;

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
* @property {Observable<any>} datasource_data - Stores the list of data source fetched from the backend.
*/
  datasource_data$!: Observable<any>;

  @ViewChild('dt') dt!: Table;


  /**
* @property {FormGroup} updateDataSourceForm - Form group that holds application form controls.
*/
  updateDataSourceForm: FormGroup;


  editingDatasource: any; // store selected row data for editing
  selectedDatasources: any[] = []; // store selected rows for export

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

  // oracle DB
  // osi pi
  // mongoDB
  // sql server

  systemTypes = ['Oracle DB', 'OSI PI', 'MongoDB', 'Sql Server'];

  editorOptions = {
    theme: 'vs-dark', language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false
  };


  /**
 * Constructor injects necessary services.
 * @constructor
 * @param {Router} router - Angular Router service to interact router,
 * @param {FormBuilder} fb - Form builder service for handling reactive forms.
 */
  constructor(private router: Router, private fb: FormBuilder, private datePipe: DatePipe, private exportService: ExportService) {
    super();
    // this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
    //   if (event) {
    //     this.getPIData();
    //   }
    // })
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

  ngOnInit() {
  }

  onTabClick() {

  }

  getDatasource(): void {
    // this.spinner.show();
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }

    // this.datasource_data = [
    //   {
    //     sysId: 'SYS-001',
    //     sysName: 'Process Monitoring System',
    //     sysType: 'Type 1',
    //     active: true,
    //     userId: 'user123',
    //     url: 'http://pms.example.com',
    //     operatingFacility: 'Riyadh Plant',
    //     lastConnectionDate: new Date('2025-09-10'),
    //     lastRunDuration: 125, // seconds
    //     lastConnectionSts: 'Success'
    //   },
    //   {
    //     sysId: 'SYS-002',
    //     sysName: 'Maintenance Tracking System',
    //     sysType: 'Type 2',
    //     active: false,
    //     userId: 'user456',
    //     url: 'http://mts.example.com',
    //     operatingFacility: 'Dhahran Refinery',
    //     lastConnectionDate: new Date('2025-09-05'),
    //     lastRunDuration: 300,
    //     lastConnectionSts: 'Failed'
    //   },
    //   {
    //     sysId: 'SYS-003',
    //     sysName: 'Energy Dashboard',
    //     sysType: 'Type 3',
    //     active: true,
    //     userId: 'user789',
    //     url: 'http://energy.example.com',
    //     operatingFacility: 'Jubail Facility',
    //     lastConnectionDate: new Date('2025-09-14'),
    //     lastRunDuration: 210,
    //     lastConnectionSts: 'Pending'
    //   }
    // ];

    this.datasource_data$ = this.dataSourceAdministrationService.getDataSource().pipe(
      map((res: any) => res?.dataSourceData || []),
      finalize(() => this.spinner.hide())
    );
  }

  mobileTabButtonChange(): void {

  }


  createDatasource(): void {
    // if (!(this.filterService.currentOrg)) {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an organization' });
    //   return;
    // }

    this.appRef = this.dialog.open(ManageDatasourceComponent, {
      header: 'Create Datasource',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

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
* Patches the TagSend data to the updateSendForm
* @param {any} data - application data
* @returns {void} - returns nothing (i.e) void
*/
  patchDataSourceValue(data: any): void {
    console.log(data);
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
    })
  }


  /**
 * Handles application selection from a table.
 * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
 */
  onDataSourceSelect(event: TableRowSelectEvent) {
    this.editingDatasource = event.data;
    this.patchDataSourceValue(event.data);
    this.isShowDetails = true;
  }


  /**
 * Clears the table filter/search.
 * @param {Table} _t19 - The table reference whose filter should be cleared.
 */
  clearDatasourceTable(dt: Table) {
    this.dt.reset();
    this.searchDatasourceValue = '';
    this.selectedDatasources = [];
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  /**
  * Edits an existing DataSource.
  * @param {any} data - The datasource to be edited.
  */
  editDatasource(data: any) {
    if (this.updateDataSourceForm.valid) {
      const payload = {
        ...this.updateDataSourceForm.getRawValue()
      }
      this.dataSourceAdministrationService.putDataSource(payload, data._id).subscribe({
        next: () => {
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
   * Opens a confirmation dialog before deletion
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
        return 'success'
    }
  }

  getStatus(status: boolean) {
    switch (status) {
      case true:
        return 'Active';

      case false:
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

        // Always refresh data regardless of operation outcomes
        this.getDatasource();
      }
    };

    // Process Add New - Create new records
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

    // Process Edit - Update existing records
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

    // Process Delete - Remove records
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
   * Prepare payload for Add New operations - excludes all system-generated fields
   */
  prepareAddNewPayload(rowData: any): any {
    // Exclude all system-generated fields for new records
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
   * Prepare payload for Edit operations - includes _id but excludes creation metadata
   */
  prepareEditPayload(rowData: any): any {
    // Exclude creation metadata but keep _id for updates
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

  /**
   * Prepare payload for API calls (legacy method - kept for backward compatibility)
   * @deprecated Use prepareAddNewPayload or prepareEditPayload instead
   */
  preparePayload(rowData: any): any {
    return {
      sysId: rowData.sysId,
      sysName: rowData.sysName,
      sysType: rowData.sysType,
      active: this.convertToBoolean(rowData.active),
      description: rowData.description,
      userJson: this.parseUserJson(rowData.userJson),
      operatingFacility: rowData.operatingFacility,
      appId: rowData.appId || this.filterService.currentApp?.appId || '',
      orgId: rowData.orgId || this.filterService.currentOrg?.orgId || ''
    };
  }
}
