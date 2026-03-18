import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { Subject, forkJoin, Observable, tap, finalize } from 'rxjs';
import { ExportService, ExcelImportResult } from 'src/app/core/services/export.service';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { TagAdministrationService } from '../../tag-administration.service';

@Component({
  selector: 'app-engine-table',
  standalone: false,
  templateUrl: './engine-table.component.html',
  styleUrl: './engine-table.component.css'
})
export class EngineTableComponent implements OnInit, OnDestroy {

  @ViewChild('dt') dt!: Table;

  tableData: any[] = [];
  selectedItem: any;
  selectedItems: any[] = [];
  private _normalizedItem: any = null;  // Cache for normalized item
  tableType: string = '';
  loading: boolean = false;
  searchValue: string = '';
  showSelections: boolean = false;
  selectionOptions: string[] = [];
  selectedOption: string = '';

  appRef!: DynamicDialogRef;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private exportService: ExportService,
    private dialog: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private spinner: NgxSpinnerService,
    private tagAdminService: TagAdministrationService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.tableType = navigation.extras.state['type'];
      this.tableData = navigation.extras.state['data'] || [];
    }
  }

  ngOnInit(): void {
    this.setSelectionOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setSelectionOptions(): void {
    switch (this.tableType) {
      case 'calculation':
        this.selectionOptions = ["Calculation Details", "Calculation Mapping", "Calculation Test Run"];
        break;
      case 'correlation':
        this.selectionOptions = ["Correlation Details", "Correlation Mapping", "Correlation Test Run"];
        break;
      case 'activity':
        this.selectionOptions = ["Activity Details", "Activity Mapping", "Activity Test Run"];
        break;
      case 'idt':
        this.selectionOptions = ["IDT Details", "IDT Mapping", "IDT Test Run"];
        break;
      default:
        this.selectionOptions = ["Details", "Mapping", "Test Run"];
    }
    this.selectedOption = this.selectionOptions[0];
  }

  getTableTitle(): string {
    switch (this.tableType) {
      case 'calculation': return 'Calculation Templates';
      case 'correlation': return 'Correlation Templates';
      case 'activity': return 'Activity Templates';
      case 'idt': return 'IDT Templates';
      default: return 'Templates';
    }
  }

  getNameColumnHeader(): string {
    switch (this.tableType) {
      case 'calculation': return 'Calculation Template Name';
      case 'correlation': return 'Correlation Template Name';
      case 'activity': return 'Activity Template Name';
      case 'idt': return 'IDT Template Name';
      default: return 'Template Name';
    }
  }

  getDataKey(): string {
    switch (this.tableType) {
      case 'calculation': return 'calculationId';
      case 'correlation': return 'correlationId';
      case 'activity': return 'templateId';
      case 'idt': return 'templateId';
      default: return 'id';
    }
  }

  getNameField(): string {
    switch (this.tableType) {
      case 'calculation': return 'calculationName';
      case 'correlation': return 'correlationName';
      case 'activity': return 'templateName';
      case 'idt': return 'templateName';
      default: return 'name';
    }
  }

  getDescriptionField(): string {
    switch (this.tableType) {
      case 'calculation': return 'calculationDesc';
      case 'correlation': return 'correlationDesc';
      case 'activity': return 'templateDesc';
      case 'idt': return 'templateDesc';
      default: return 'description';
    }
  }

  getItemName(item: any): string {
    switch (this.tableType) {
      case 'calculation': return item.calculationName;
      case 'correlation': return item.correlationName;
      case 'activity': return item.templateName;
      case 'idt': return item.templateName;
      default: return item.name || '';
    }
  }

  getItemDescription(item: any): string {
    switch (this.tableType) {
      case 'calculation': return item.calculationDesc;
      case 'correlation': return item.correlationDesc;
      case 'activity': return item.templateDesc;
      case 'idt': return item.templateDesc;
      default: return item.description || '';
    }
  }

  getItemId(item: any): string {
    switch (this.tableType) {
      case 'calculation': return item.calculationId;
      case 'correlation': return item.correlationId;
      case 'activity': return item.templateId;
      case 'idt': return item.templateId;
      default: return item.id || '';
    }
  }

  getFilterFields(): string[] {
    switch (this.tableType) {
      case 'calculation': return ['calculationName', 'calculationDesc', 'createdOn'];
      case 'correlation': return ['correlationName', 'correlationDesc', 'createdOn'];
      case 'activity': return ['templateName', 'templateDesc', 'createdOn'];
      case 'idt': return ['templateName', 'templateDesc', 'createdOn'];
      default: return ['name', 'description', 'createdOn'];
    }
  }

  getDetailOption(): string {
    return this.selectionOptions[0];
  }

  getMappingOption(): string {
    return this.selectionOptions[1];
  }

  getTestRunOption(): string {
    return this.selectionOptions[2];
  }

  onItemSelect(event: TableRowSelectEvent): void {
    this.showSelections = true;
    // Normalize data once when item is selected to avoid infinite loop
    this._normalizedItem = this.normalizeItemData(this.selectedItem);
  }

  onItemUnselect(event: TableRowSelectEvent): void {
    this.showSelections = false;
  }

  clear(table: Table): void {
    table.clear();
    this.searchValue = '';
  }

  deleteItem(event: Event, item: any): void {
    event.stopPropagation();
  }

  onUpdateEmit(event: any): void {
  }

  /**
   * Normalizes data from different engine types to match calculation engine format
   * Converts correlationName -> calculationName, jsLogic -> calculationLogic, etc.
   * Preserves all other fields including schemas
   */
  normalizeItemData(item: any): any {
    if (!item) return null;

    // Start with a copy of all original data
    const normalized: any = { ...item };

    // Add calculation-specific field names based on engine type
    if (this.tableType === 'correlation') {
      normalized.calculationName = item.correlationName || item.calculationName;
      normalized.calculationDesc = item.correlationDesc || item.calculationDesc;
      normalized.calculationLogic = item.jsLogic || item.correlationLogic || item.calculationLogic;
    } else if (this.tableType === 'activity') {
      normalized.calculationName = item.activityName || item.calculationName;
      normalized.calculationDesc = item.activityDesc || item.calculationDesc;
      normalized.calculationLogic = item.jsLogic || item.activityLogic || item.calculationLogic;
    } else if (this.tableType === 'idt') {
      normalized.calculationName = item.idtName || item.calculationName;
      normalized.calculationDesc = item.idtDesc || item.calculationDesc;
      normalized.calculationLogic = item.jsLogic || item.idtLogic || item.calculationLogic;
    }

    // Ensure schemas exist (they should already be in the item)
    // If not, initialize empty structures to prevent errors
    if (!normalized.inputJsonSchema) {
      normalized.inputJsonSchema = { properties: [] };
    }
    if (!normalized.outputJsonSchema) {
      normalized.outputJsonSchema = { properties: [] };
    }

    return normalized;
  }

  /**
   * Returns cached normalized item for use in template
   * Using cached value prevents infinite loop during change detection
   */
  get normalizedItem(): any {
    return this._normalizedItem;
  }

  goBack(): void {
    this.router.navigate(['/tagAdmin'], { queryParams: { restore: 'true' } });
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
        this.messageService.add({
          severity: 'warn',
          summary: 'No Data',
          detail: 'The imported file contains no data'
        });
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
      this.messageService.add({
        severity: 'error',
        summary: 'Import Error',
        detail: 'Failed to import Excel file. Please check the file format.'
      });
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
      const apiCall = this.getCreateApiCall(payload);

      if (apiCall) {
        requests.push(
          apiCall.pipe(
            tap(() => results.success++),
            finalize(() => { })
          )
        );
      }
    });

    // Process Edit
    groupedChanges.edit.forEach((item: ExcelImportResult) => {
      const payload = this.preparePayload(item.rowData);
      const id = this.getItemId(item.rowData);

      if (!id) {
        results.failed++;
        results.errors.push(`Row ${item.rowIndex}: Missing ID for edit operation`);
        return;
      }

      const apiCall = this.getUpdateApiCall(payload, id);
      if (apiCall) {
        requests.push(
          apiCall.pipe(
            tap(() => results.success++),
            finalize(() => { })
          )
        );
      }
    });

    // Process Delete
    groupedChanges.delete.forEach((item: ExcelImportResult) => {
      const id = this.getItemId(item.rowData);

      if (!id) {
        results.failed++;
        results.errors.push(`Row ${item.rowIndex}: Missing ID for delete operation`);
        return;
      }

      const apiCall = this.getDeleteApiCall(id);
      if (apiCall) {
        requests.push(
          apiCall.pipe(
            tap(() => results.success++),
            finalize(() => { })
          )
        );
      }
    });

    // Execute all requests
    if (requests.length === 0) {
      this.spinner.hide();
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes',
        detail: 'No changes to process'
      });
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
        // Refresh table data - would need to reload from parent component
      },
      error: (error) => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Import Failed',
          detail: 'Some operations failed during import'
        });
        console.error('Import processing error:', error);
      }
    });
  }

  /**
   * Get appropriate API call for creating items based on table type
   */
  getCreateApiCall(payload: any): Observable<any> | null {
    switch (this.tableType) {
      case 'calculation':
        return this.tagAdminService.postCalculation(payload);
      case 'correlation':
        return this.tagAdminService.postCorrelation(payload);
      case 'activity':
        return this.tagAdminService.postActivity(payload);
      case 'idt':
        return this.tagAdminService.postIDT(payload);
      default:
        return null;
    }
  }

  /**
   * Get appropriate API call for updating items based on table type
   */
  getUpdateApiCall(payload: any, id: string): Observable<any> | null {
    switch (this.tableType) {
      case 'calculation':
        return this.tagAdminService.putCalculation(payload, id);
      case 'correlation':
        return this.tagAdminService.putCorrelation(payload, id);
      case 'activity':
        return this.tagAdminService.putActivity(payload, id);
      case 'idt':
        return this.tagAdminService.putIDT(payload, id);
      default:
        return null;
    }
  }

  /**
   * Get appropriate API call for deleting items based on table type
   */
  getDeleteApiCall(id: string): Observable<any> | null {
    switch (this.tableType) {
      case 'calculation':
        return this.tagAdminService.deleteCalculation(id);
      case 'correlation':
        return this.tagAdminService.deleteCorrelation(id);
      case 'activity':
        return this.tagAdminService.deleteActivity(id);
      case 'idt':
        return this.tagAdminService.deleteIDT(id);
      default:
        return null;
    }
  }

  /**
   * Prepare payload for API calls
   */
  preparePayload(rowData: any): any {
    // Return the row data as-is since it should already match the API structure
    return rowData;
  }

  /**
   * Export table data to Excel
   */
  async exportExcel(): Promise<void> {
    try {
      const exportData = this.selectedItems && this.selectedItems.length > 0
        ? this.selectedItems
        : this.tableData;

      const filename = `${this.tableType}_templates`;
      await this.exportService.exportExcel(exportData, filename);

      this.messageService.add({
        severity: 'success',
        summary: 'Export Successful',
        detail: 'Excel file with dropdown actions exported successfully'
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Export Failed',
        detail: 'Failed to export Excel file'
      });
      console.error('Export error:', error);
    }
  }
}
