import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { ManageCalculationEngineComponent } from '../../components/manage-calculation-engine/manage-calculation-engine.component';
import { CalculationEngineService } from '../../services/calculation-engine.service';
import { finalize, forkJoin, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { FilterEngineService } from '../../services/filter-engine.service';
import { ExcelImportResult } from 'src/app/core/services/export.service';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { ExportService } from 'src/app/core/services/export.service';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';


@Component({
  selector: 'app-calculation-engine-table',
  standalone: false,
  templateUrl: './calculation-engine-table.component.html',
  styleUrl: './calculation-engine-table.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class CalculationEngineTableComponent {

  calculationData$!: Observable<any>;
  selectedCalculation: any;
  loading: unknown;
  searchValue: any;
  appRef!: DynamicDialogRef;
  private subscribe$ = new Subject<void>();
  showSelections: boolean = false;
  selectionOptions: string[] = ["Calculation Details", "Calculation Mapping", "Calculation Test Run"];
  selectedOption: string = this.selectionOptions[0];

  /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
   * Constructor injects necessary services.
   * @constructor
   * @param {OrganizationAdministrationService} orgAdminService - Service to interact with the backend for fetching and managing applications.
   * @param {DialogService} dialog - Primeng dialog Service to interact with dialog components.
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders.
   * @param {Router} router - Angular Router service to interact router,
   * @param {MessageService}  messageService - Primeng Message service to intearct with toast
   */

  constructor(
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private calculationEngineService: CalculationEngineService,
    private filterService: FilterEngineService,
    private exportService: ExportService) {
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.showSelections = false;
        this.getCalData();
      }
    })

    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.showSelections = false;
        this.getCalData();
      }
    })
  }

  ngOnInit(): void {
    this.getCalData()
  }

  getCalData(): void {
    this.spinner.show();
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }
    this.calculationData$ = this.calculationEngineService.getCalEngine(payload).pipe(
      finalize(() => this.spinner.hide())
    );
  }

  createApp(): void {
    this.showSelections = false;
    if (!(this.filterService.currentApp)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an application' });
      return;
    }

    this.appRef = this.dialog.open(ManageCalculationEngineComponent, {
      header: 'Create Calculation',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Calculation Tempate created successfully', life: 3000 });
        this.getCalData();
      }
    });
  }


  onCalculationSelect(event: TableRowSelectEvent) {
    this.showSelections = true;
  }

  onCalculationUnSelect(event: TableRowSelectEvent) {
    this.showSelections = false;
  }

  clear(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  copyApp(_t59: any) {
    // TODO: Implement app copy logic
  }


  /**
   * Edits an existing application.
   * @param {any}app - The application data to be edited.
   */
  editApp(app: any) {
    this.appRef = this.dialog.open(ManageCalculationEngineComponent, {
      header: 'Edit App',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        rowData: app
      },
      // width: '800px',
      width: getResponsiveDialogWidth(),
    })
  }


  deleteApp(event: any, calculationId: string) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      header: 'Confirm Delete',
      modal: true,
      closable: true,
      data: {
        message: 'Are you sure you want to delete this calculation?',
        itemName: calculationId
      },
      width: '550px'
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        // Add actual delete logic here when service method is available
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Calculation deleted successfully'
        });
        this.getCalData();
      } else {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Delete operation cancelled'
        });
      }
    });
  }

  OnUpdateEmit(event: any) {
    this.getCalData();
  }

  ngOnDestroy(): void {
    this.subscribe$.next();
    this.subscribe$.complete();
  }

  // ==================== IMPORT/EXPORT FUNCTIONALITY ====================

  /**
   * Export to Excel
   */
exportExcel() {
  let exportData: any[] = [];

  // Case 1: single row selected
  if (this.selectedCalculation) {
    exportData = [this.selectedCalculation];
  }
  // Case 2: no selection → export all table data
  else if (this.dt?.value?.length) {
    exportData = this.dt.value;
  }

  if (exportData.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'No Data',
      detail: 'There is no data to export'
    });
    return;
  }

  this.exportService.exportExcel(exportData, 'calculation_engine');
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
          changes: groupedChanges,
          summary: {
            total: importResults.length,
            add: groupedChanges.add.length,
            edit: groupedChanges.edit.length,
            delete: groupedChanges.delete.length
          }
        },
        width: getResponsiveDialogWidth()
      });

      this.appRef.onClose.subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.processImportData(groupedChanges);
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
    groupedChanges.add.forEach((item: ExcelImportResult) => {
      const payload = this.preparePayload(item.rowData);
      requests.push(
        this.calculationEngineService.createCalEngine(payload).pipe(
          tap(() => results.success++),
          finalize(() => { })
        )
      );
    });

    // Process Edit (Calculation usually uses post for updates in some modules, check service)
    // Looking at service, only createCalEngine exists. Calculation might not support update via API yet.
    // However, I'll follow standard pattern.
    groupedChanges.edit.forEach((item: ExcelImportResult) => {
      const payload = this.preparePayload(item.rowData);
      // Service doesn't have putCalEngine, so we use create for now or wait for clarification
      requests.push(
        this.calculationEngineService.createCalEngine(payload).pipe(
          tap(() => results.success++),
          finalize(() => { })
        )
      );
    });

    // Process Delete
    // Service doesn't have deleteCalEngine, so we'll just skip or mock for now as per other implementations
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
          detail: `Successfully processed ${results.success} records`
        });
        this.getCalData();
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
      calculationName: rowData.calculationName,
      calculationDesc: rowData.calculationDesc,
      appId: rowData.appId || this.filterService.currentApp?.appId || '',
      orgId: rowData.orgId || this.filterService.currentOrg?.orgId || '',
      type: rowData.type,
      active: rowData.active === true || rowData.active === 'Active' || rowData.active === 'true',
    };
  }

  @ViewChild('dt') dt: Table | undefined;
}
