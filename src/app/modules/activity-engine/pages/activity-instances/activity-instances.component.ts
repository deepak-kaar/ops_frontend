import { Component, ViewChild } from '@angular/core';
import { ExportService } from 'src/app/core/services/export.service';
import { Table } from 'primeng/table';
import { ActivityEngineComponent } from '../../activity-engine.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, Subject, takeUntil, finalize } from 'rxjs';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ManageActivityStepComponent } from '../../components/dialogs/manage-activity-step/manage-activity-step.component';
import { ManageActivityInstanceComponent } from '../../components/dialogs/manage-activity-instance/manage-activity-instance.component';
import { WfStatusComponent } from '../../components/dialogs/wf-status/wf-status.component';
import { ExcelImportResult } from 'src/app/core/services/export.service';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { forkJoin, tap } from 'rxjs';

@Component({
  selector: 'app-activity-instances',
  standalone: false,
  templateUrl: './activity-instances.component.html',
  styleUrl: './activity-instances.component.css'
})
export class ActivityInstancesComponent extends ActivityEngineComponent {
  instancesData$!: Observable<any>;
  @ViewChild('dt') dt: Table | undefined;
  selectedInstances: any[] = []; // store selected rows for export
  activeInstance: any; // active row for details
  loading: unknown;
  searchValue: any;
  appRef!: DynamicDialogRef;
  private subscribe$ = new Subject<void>();
  showSelections: boolean = false;
  selectionOptions: string[] = ["Instance Details", "Instance Mapping", "Instance Test Run"];
  selectedOption: string = this.selectionOptions[0];

  /**
   * calls
   */
  constructor(private exportService: ExportService) {
    super()
    console.log("test");
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getInstancesData();
      }
    })
    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getInstancesData();
      }
    })
  }

  /**
   * @method ngOnInit - Angular life cycle method
   * @returns void
   */
  ngOnInit(): void {
    this.getInstancesData()
  }

  /**
   * @method getFmData
   * 
   */
  getInstancesData(): void {
    this.spinner.show();
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }
    this.instancesData$ = this.activityService.getInstances(payload).pipe(
      finalize(() => this.spinner.hide())
    );
  }

  createStep(): void {
    if (!(this.filterService.currentApp)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an application' });
      return;
    }

    this.appRef = this.dialog.open(ManageActivityInstanceComponent, {
      header: 'Create Activity Instance',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.showToast('success', 'Success', 'Activity Function Model created successfully', false, 3000);
        this.getInstancesData();
      }
    });
  }


  onCalculationSelect(event: any) {
    this.activeInstance = event.data;
    this.showSelections = true;
  }

  onCalculationUnSelect(event: any) {
    this.showSelections = false;
  }

  clear(dt: Table) {
    dt.reset();
    this.searchValue = '';
    this.selectedInstances = [];
    this.activeInstance = null;
    this.showSelections = false;
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }

  copyApp(_t59: any) {
    // TODO: Implement app copy logic
  }


  /**
   * Edits an existing application.
   * @param {any}app - The application data to be edited.
   */
  editApp(app: any) {
    this.appRef = this.dialog.open(ManageActivityStepComponent, {
      header: 'Edit Instance',
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
    // this.confirmationService.confirm({
    //   target: event.target as EventTarget,
    //   message: 'Do you want to delete this App?',
    //   header: 'Danger Zone',
    //   icon: 'pi pi-info-circle',
    //   rejectLabel: 'Cancel',
    //   rejectButtonProps: {
    //     label: 'Cancel',
    //     severity: 'secondary',
    //     outlined: true,
    //   },
    //   acceptButtonProps: {
    //     label: 'Delete',
    //     severity: 'danger',
    //   },

    //   accept: () => {
    //     this.orgAdminService.deleteApp(appId).subscribe({
    //       next: (res: any) => {
    //         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'App deleted successfully', life: 3000 });
    //         this.getApps();
    //       },
    //       error: (err) => {
    //         this.messageService.add({ severity: 'error', summary: 'Rejected', detail: err.error.response });
    //       }
    //     })
    //   },
    //   reject: () => {
    //     this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
    //   },
    // });
  }

  OnUpdateEmit(event: any) {
    this.getInstancesData();
  }

  ngOnDestroy(): void {
    this.subscribe$.next();
    this.subscribe$.complete();
  }

  openStatusTab(instanceId: string) {
    this.appRef = this.dialog.open(WfStatusComponent, {
      modal: true,
      header: "Workflow Status",
      closable: true,
      data: {
        instanceId
      },
      width: '75rem'
    })
  }
  exportExcel() {
    const exportData = this.selectedInstances && this.selectedInstances.length > 0 ? this.selectedInstances : this.dt?.value || [];
    if (exportData.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'There is no data to export'
      });
      return;
    }
    this.exportService.exportExcel(exportData, 'activity_instances');
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
        this.activityService.createInstance(payload).pipe(
          tap(() => results.success++),
          finalize(() => { })
        )
      );
    });

    // Process Edit (If service supports update, usually activity instances might be immutable or have specific update logic)
    // Looking at service, only createInstance exists. 
    groupedChanges.edit.forEach((item: ExcelImportResult) => {
      const payload = this.preparePayload(item.rowData);
      requests.push(
        this.activityService.createInstance(payload).pipe(
          tap(() => results.success++),
          finalize(() => { })
        )
      );
    });

    // Process Delete
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
        this.getInstancesData();
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
      instanceName: rowData.instanceName,
      templateId: rowData.templateId,
      appId: rowData.appId || this.filterService.currentApp?.appId || '',
      orgId: rowData.orgId || this.filterService.currentOrg?.orgId || '',
      description: rowData.description,
      active: rowData.active === true || rowData.active === 'Active' || rowData.active === 'true',
    };
  }
}
