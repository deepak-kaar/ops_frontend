import { Component, OnInit, ViewChild } from '@angular/core';
import { ExportService } from 'src/app/core/services/export.service';
import { WebserviceAdministrationComponent } from '../../webservice-administration.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, finalize, forkJoin, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { ManageWebserviceComponent } from '../../components/manage-webservice/manage-webservice.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { ManageWebresponseComponent } from '../../components/manage-webresponse/manage-webresponse.component';
import { ExcelImportResult } from 'src/app/core/services/export.service';
import { ConfirmationDailogExcelComponent } from 'src/app/modules/pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { tap } from 'rxjs';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-webservice-table',
  standalone: false,
  templateUrl: './webservice-table.component.html',
  styleUrl: './webservice-table.component.css'
})
export class WebserviceTableComponent extends WebserviceAdministrationComponent implements OnInit {
  isShowMappingTable: boolean = false;
  @ViewChild('dt') dt: Table | undefined;
  appRef!: DynamicDialogRef;
  app_res_Ref!: DynamicDialogRef;

  private subscribe$ = new Subject<void>();
  searchWSValue: any;

  iSWSloading: unknown;

  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  ws_data$!: Observable<any>;

  selectedWebService: any[] = []; // store selected rows for export
  activeWS: any; // active row for mapping view

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

  constructor(private exportService: ExportService) {
    super();
    this.filterService.selectedWS$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        console.log("event occured:", event);
        this.getWS();
      }
    });
    this.getWS();
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  getWS(): void {
    this.spinner.show();

    //     this.ws_data$ = of([
    //       {
    //         webserviceId: 'WS-001',
    //         wsName: 'web service 1',
    //         wsURL: 'https://ed28f20e-ed85-4a30-b2cf-e915255d8e9b.mock.pstmn.io/webservice1',
    //         wsHeaders: ``,
    //         wsBody: ``,
    //         wsAuth: `{
    //     "username":"abc",
    //     "password":"1234"
    // }`,
    //         authType: 'Service Account',
    //         description: 'WS Description 1',
    //         active: true,
    //         method: 'GET',
    //         apiType: 'REST'
    //       },
    //       {
    //         webserviceId: 'WS-002',
    //         wsName: 'web service 2',
    //         wsURL: 'https://ed28f20e-ed85-4a30-b2cf-e915255d8e9b.mock.pstmn.io/webservice2',
    //         wsHeaders: ``,
    //         wsBody: ``,
    //         wsAuth: `{
    //     "key":"x-api-key",
    //     "password":"1234"
    // }`,
    //         authType: 'API Key',
    //         description: 'WS Description 2',
    //         active: false,
    //         method: 'GET',
    //         apiType: 'REST'
    //       },
    //       {
    //         webserviceId: 'WS-003',
    //         wsName: 'web service 3',
    //         wsURL: 'https://ed28f20e-ed85-4a30-b2cf-e915255d8e9b.mock.pstmn.io/webservice3',
    //         wsHeaders: ``,
    //         wsBody: ``,
    //         wsAuth: ``,
    //         authType: 'No Auth',
    //         description: 'WS Description 3',
    //         active: true,
    //         method: 'GET',
    //         apiType: 'REST'
    //       }
    //     ]);


    this.ws_data$ = this.webserviceAdministrationService.getWS().pipe(
      map((res: any) => res?.result || []),
      finalize(() => this.spinner.hide())
    );
  }

  mobileTabButtonChange(): void {

  }


  createWS(): void {
    // if (!(this.filterService.currentOrg)) {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an organization' });
    //   return;
    // }

    this.appRef = this.dialog.open(ManageWebserviceComponent, {
      header: 'Create Web Service',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      this.getWS();
      this.handleWebserviceDialogClose(res);

    }
    );
  }


  onWSSelect(event: TableRowSelectEvent) {
    this.activeWS = event.data;
    this.isShowMappingTable = true;
  }

  clearWSTable(dt: Table) {
    dt.reset();
    this.searchWSValue = '';
    this.selectedWebService = [];
    this.activeWS = null;
    this.isShowMappingTable = false;
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }

  editWS(data: any) {
    this.appRef = this.dialog.open(ManageWebserviceComponent, {
      header: 'Edit Web Service',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        wsData: data
      },
      width: getResponsiveDialogWidth(),
    });

    this.appRef.onClose.subscribe((res: any) => {
      this.getWS();
      this.handleWebserviceDialogClose(res)
    }
    );
  }


  private handleWebserviceDialogClose(res: any): void {
    if (res?.status) {
      this.spinner.show();

      // Get external data by calling the web service URL
      const mapData$ = this.webserviceAdministrationService.getMapDataByUrl(res?.data)
        .pipe(
          map((response: any) => {
            // Handle any response structure robustly
            // Response could be:
            // - Direct data (object, array, string)
            // - Wrapped in success/data/result/body
            // - XML string for SOAP
            // - JSON string
            // - Error response
            
            if (!response) {
              return null;
            }

            // If it's already a string (XML or JSON string), return as-is
            if (typeof response === 'string') {
              return response;
            }

            // If it's an array, return it
            if (Array.isArray(response)) {
              return response;
            }

            // If it's an object, check for common wrapper properties
            if (typeof response === 'object') {
              // Check various possible response structures
              if (response.success !== undefined) {
                return response.success;
              }
              if (response.data !== undefined) {
                return response.data;
              }
              if (response.result !== undefined) {
                return response.result;
              }
              if (response.body !== undefined) {
                return response.body;
              }
              if (response.response !== undefined) {
                return response.response;
              }
              // If no wrapper found, return the object itself
              return response;
            }

            // Fallback: return as-is
            return response;
          }),
          catchError((err) => {
            console.error('Error in getMapDataByUrl:', err);
            // Return null on error so the dialog can still open (with empty data)
            return of(null);
          }),
          finalize(() => {})
        );

      const wsMapData$ = this.webserviceAdministrationService.getWSMap(res?.data._id)
        .pipe(
          map((response: any) => {
            // Handle various response structures for map data
            if (!response) return null;
            
            if (response.mapData !== undefined) {
              return response.mapData;
            }
            if (response.data?.mapData !== undefined) {
              return response.data.mapData;
            }
            if (response.result?.mapData !== undefined) {
              return response.result.mapData;
            }
            
            // Return the whole response if no mapData found
            return response;
          }),
          catchError((err) => {
            console.error('Error in getWSMap:', err);
            // Return empty object on error
            return of({});
          }),
          finalize(() => {})
        );

      forkJoin([mapData$, wsMapData$])
        .pipe(finalize(() => this.spinner.hide()))
        .subscribe({
          next: ([mapDataResponse, wsMapResponse]) => {
            // Ensure we have valid data (even if null/empty)
            const wsResData = mapDataResponse !== null && mapDataResponse !== undefined 
              ? mapDataResponse 
              : null;
            
            const wsMapData = wsMapResponse || {};

            this.app_res_Ref = this.dialog.open(ManageWebresponseComponent, {
              header: 'Response - Mapping',
              modal: true,
              closable: true,
              data: {
                _id: res.data._id,
                wsResData: wsResData,
                wsMapData: wsMapData
              },
              width: '90vw',
            });

            // disable scroll
            document.body.style.overflow = 'hidden';

            this.app_res_Ref.onClose.subscribe((responseDialogRes: any) => {
              // restore scroll
              document.body.style.overflow = 'auto';
              this.getWS();
            });
          },
          error: (err) => {
            console.error('Error fetching webservice data', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to fetch web service response',
              life: 3000
            });
            // Still open dialog with empty data so user can see the error
            this.app_res_Ref = this.dialog.open(ManageWebresponseComponent, {
              header: 'Response - Mapping',
              modal: true,
              closable: true,
              data: {
                _id: res.data._id,
                wsResData: null,
                wsMapData: {}
              },
              width: '90vw',
            });
            document.body.style.overflow = 'hidden';
            this.app_res_Ref.onClose.subscribe(() => {
              document.body.style.overflow = 'auto';
              this.getWS();
            });
          }
        });
    }
  }

  runWS(data: any) {
    this.handleWebserviceDialogClose({ status: true, data });
    // this.isShowMappingTable = true;
    // this.selectedWS = data;
  }

  deleteWS(data: any) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      header: 'Confirm Delete',
      modal: true,
      closable: true,
      data: {
        message: 'Are you sure you want to delete this web service?',
        itemName: data.wsName
      },
      width: '550px'
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        this.webserviceAdministrationService.deleteWS(data._id).subscribe({
          next: () => {
            this.showToast('success', 'Deleted', 'Web service deleted successfully', 2000, false);
            this.getWS();
          },
          error: () => {
            this.showToast('error', 'Error', 'Failed to delete web service', 2000, false);
          }
        });
      } else {
        this.showToast('info', 'Cancelled', 'Delete operation cancelled', 2000, false);
      }
    });
  }

  ngOnDestroy() {
    this.isShowMappingTable = false;
  }

  exportExcel() {
    const exportData = this.selectedWebService && this.selectedWebService.length > 0 ? this.selectedWebService : this.dt?.value || [];
    if (exportData.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'There is no data to export'
      });
      return;
    }
    this.exportService.exportExcel(exportData, 'webservices');
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
        this.webserviceAdministrationService.postWS(payload).pipe(
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
        this.webserviceAdministrationService.putWS(payload, id).pipe(
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
        this.webserviceAdministrationService.deleteWS(id).pipe(
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
        this.getWS();
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
      wsName: rowData.wsName,
      wsURL: rowData.wsURL,
      wsHeaders: rowData.wsHeaders,
      wsBody: rowData.wsBody,
      wsAuth: typeof rowData.wsAuth === 'string' ? rowData.wsAuth : JSON.stringify(rowData.wsAuth || {}),
      authType: rowData.authType,
      description: rowData.description,
      active: rowData.active === true || rowData.active === 'Active' || rowData.active === 'true',
      method: rowData.method,
      apiType: rowData.apiType,
      appId: rowData.appId || '',
      orgId: rowData.orgId || ''
    };
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

}
