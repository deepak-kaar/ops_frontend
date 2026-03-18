import { Component, OnInit, ViewChild } from '@angular/core';
import { finalize, map, Observable, Subject, takeUntil, tap, forkJoin } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { PiAdministrationNewComponent } from '../../pi-administration-new.component';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { Router } from '@angular/router';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ManagePiNewComponent } from '../../components/manage-pi-new/manage-pi-new.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SelectButtonOptionClickEvent } from 'primeng/selectbutton';
import { DatasourceAdministrationService } from 'src/app/modules/datasource-administration/datasource-administration.service';
import { ConfirmationService } from 'primeng/api';
import { ExportService, ExcelImportResult } from 'src/app/core/services/export.service';

import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-pi-table-new',
  standalone: false,
  templateUrl: './pi-table-new.component.html',
  styleUrl: './pi-table-new.component.css'
})
export class PiTableNewComponent extends PiAdministrationNewComponent implements OnInit {
  readonly PI_TABS = {
    RECEIVE: 'PI Tag Receive',
    SEND: 'PI Tag Send'
  } as const;

  tabActions: string[] = [this.PI_TABS.RECEIVE, this.PI_TABS.SEND];
  selectedTab: string = this.PI_TABS.RECEIVE;
  selectedTabIndex = 0;

  @ViewChild('dt') dt: Table | undefined;

  tabButtonActions: string[] = [
    "Import",
    "Export",
    "Create"
  ]

  selectedButtonAction!: string;

  isShowSendTagDetails: boolean = false;

  isShowReceiveTagDetails: boolean = false;

  appRef!: DynamicDialogRef;

  PIData$!: Observable<any>;
  private subscribe$ = new Subject<void>();

  /**
 * @property {any} searchPISendValue - Stores the search input value for filtering applications.
 */
  searchPISendValue: any;

  /**
* @property {any} searchPIReceiveValue - Stores the search input value for filtering applications.
*/
  searchPIReceiveValue: any;


  /**
 * @property {unknown} iSPISendloading - Indicates the loading state (can be replaced with a boolean for better clarity).
 */
  iSPISendloading: unknown;



  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
* @property {Observable<any>} pi_send_data - Stores the list of PI TAG SEND fetched from the backend.
*/
  pi_send_data$!: Observable<any>;

  /**
* @property {Observable<any>} pi_receive_data$ - Stores the list of PI TAG RECEIVE fetched from the backend.
*/
  pi_receive_data$!: Observable<any>;


  /**
  * @property {FormGroup} updateSendForm - Form group that holds application form controls.
  */
  updateSendForm: FormGroup;

  /**
* @property {FormGroup} updateReceiveForm - Form group that holds application form controls.
*/
  updateReceiveForm: FormGroup;

  selectedSends: any[] = []; // store selected Send rows for export
  activeSend: any; // active send row for details

  selectedReceives: any[] = []; // store selected Receive rows for export
  activeReceive: any; // active receive row for details

  /**
* @property {any[]} activeStatus - Stores a list of active status (potentially for dropdown selection).
*/
  activeStatus: any[] = [
    {
      name: 'Active',
      value: 'active'
    },
    {
      name: 'Inactive',
      value: 'inactive'
    }
  ];

  extTypes = ['ABSTOTAL', 'AC', 'APV', 'ATMAX', 'C', 'MAX', 'MAXTIME', 'MEAN', 'MIN', 'PCTON', 'PV', 'RANGE', 'STD', 'SUMTANKS', 'TOTAL', '1:30AM', '2AM', '4AM', '5AM',];
  freqTypes = ['D', 'H'];
  sysNames = ['RTR'];

  /**
* @property {Observable<any>} sysNameDropDown$ - Observable to retrieve system name from backend.
*/
  sysNameDropDown$!: Observable<any>;

  /**
* @property {Observable<any>} attrDropDown$ - Observable to retrieve attribute name from backend.
*/
  attrDropDown$!: Observable<any>;

  globalAttributes: [] = [];


  /**
 * Constructor injects necessary services.
 * @constructor
 * @param {Router} router - Angular Router service to interact router,
 * @param {FormBuilder} fb - Form builder service for handling reactive forms.
 * @param {DatasourceAdministrationService} datasourceAdministrationService - Service to fetch dropdown value.
 */
  constructor(private router: Router, private fb: FormBuilder, private datePipe: DatePipe, private datasourceAdministrationService: DatasourceAdministrationService, private confirmationService: ConfirmationService, private exportService: ExportService) {
    super();
    this.selectedTab = this.PI_TABS.RECEIVE;
    // this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
    //   if (event) {
    //     this.getPIData();
    //   }
    // })
    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {

      this.isShowSendTagDetails = false;
      this.isShowReceiveTagDetails = false;
      this.attrDropDown$ = this.piAdministrationService.getAttributesByOrg({ orgId: this.filterService.currentOrg?.orgId ?? null }).pipe(
        map((res: any) => res?.attributes || []),
        finalize(() => this.spinner.hide())
      );
      if (this.selectedTab === this.PI_TABS.RECEIVE) {
        this.getPIReceiveData();
      } else {
        this.getPISendData();
      }

    });

    this.updateSendForm = this.fb.group({
      attributeId: new FormControl<string>('', [Validators.required]),
      attributeName: new FormControl<string>('', [Validators.required]),
      tagNumber: new FormControl<string>(''),
      piTagNumber: new FormControl<string>(''),
      piDesc: new FormControl<string>('',),
      piSendStatus: new FormControl<string>('active'),
      systemName: new FormControl<string>('',),
      createdOn: new FormControl<string>({ value: '', disabled: true }),
      createdBy: new FormControl<string>({ value: '', disabled: true }),
      modifiedDate: new FormControl<string>({ value: '', disabled: true }),
      modifiedBy: new FormControl<string>({ value: '', disabled: true }),
      orgId: new FormControl<string>('',),
      orgName: new FormControl<string>('',),
    });


    this.updateReceiveForm = this.fb.group({
      attributeId: new FormControl<string>('', [Validators.required]),
      attributeName: new FormControl<string>('', [Validators.required]),
      tagNumber: new FormControl<string>('', [Validators.required]),
      piTagNumber: new FormControl<string>(''),
      piDesc: new FormControl<string>('',),
      piReceiveStatus: new FormControl<string>('active'),
      extType: new FormControl<string>('',),
      freqType: new FormControl<string>('',),
      systemName: new FormControl<string>('',),
      createdOn: new FormControl<string>({ value: '', disabled: true }),
      createdBy: new FormControl<string>({ value: '', disabled: true }),
      modifiedDate: new FormControl<string>({ value: '', disabled: true }),
      modifiedBy: new FormControl<string>({ value: '', disabled: true }),
      value_status: new FormControl<string>({ value: '', disabled: true }),
      orgId: new FormControl<string>('',),
      orgName: new FormControl<string>('',),
      last_updated_date: new FormControl<string>({ value: '', disabled: true }),
      record_ts: new FormControl<string>({ value: '', disabled: true }),
    });
  }

  override ngOnInit() {
    super.ngOnInit();
    this.sysNameDropDown$ = this.datasourceAdministrationService.getDataSource({ fields: 'sysName' }).pipe(
      map((res: any) => res?.dataSourceData || []),
      finalize(() => this.spinner.hide())
    );

    this.attrDropDown$ = this.piAdministrationService.getAttributesByOrg({ orgId: this.filterService.currentOrg?.orgId ?? null }).pipe(
      map((res: any) => res?.attributes || []),
      tap(attrs => {
        this.globalAttributes = attrs;
      }),
      finalize(() => this.spinner.hide())
    );
  }

  onTabClick(event: SelectButtonOptionClickEvent) {
    this.isShowSendTagDetails = false;
    this.isShowReceiveTagDetails = false;

    this.selectedTabIndex = event.index ?? 0;

    switch (this.selectedTabIndex) {
      case 0:
        this.getPIReceiveData();
        break;
      case 1:
        this.getPISendData();
        break;
      default:
        this.getPIReceiveData();
        break;
    }
  }

  getPISendData(): void {
    this.spinner.show();
    let payload = {
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }

    this.pi_send_data$ = this.piAdministrationService.getPISend(payload).pipe(
      map((res: any) => res?.piData || []),
      finalize(() => this.spinner.hide())
    );
  }

  getPIReceiveData(): void {
    this.spinner.show();
    let payload = {
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }

    this.pi_receive_data$ = this.piAdministrationService.getPIReceive(payload).pipe(
      map((res: any) => res?.piData || []),
      finalize(() => this.spinner.hide())
    );
  }

  mobileTabButtonChange(): void {
    switch (this.selectedButtonAction) {
      case 'Import':
        this.triggerImport();
        break;
      case 'Export':
        if (this.selectedTab === this.PI_TABS.SEND) {
          this.exportExcel(this.dt!, this.selectedSends, 'pi_sends');
        } else {
          this.exportExcel(this.dt!, this.selectedReceives, 'pi_receives');
        }
        break;
      case 'Create':
        if (this.selectedTab === this.PI_TABS.SEND) {
          this.createSendTag();
        } else {
          this.createReceiveTag();
        }
        break;
    }
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
      this.appRef = this.dialog.open(DeleteConfirmationDialogComponent, {
        header: 'Confirm Import Changes',
        modal: true,
        closable: true,
        data: {
          importData: importResults,
          displayColumns: this.selectedTab === this.PI_TABS.SEND ? [
            { header: 'Attribute Name', field: 'attributeName' },
            { header: 'PI Tag Number', field: 'tagNumber' },
            { header: 'Status', field: 'piSendStatus' }
          ] : [
            { header: 'Attribute Name', field: 'attributeName' },
            { header: 'PI Tag Number', field: 'tagNumber' },
            { header: 'System', field: 'systemName' },
            { header: 'Status', field: 'piReceiveStatus' }
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
  /**
  * Process imported data and call respective APIs
  * Each operation is processed independently - failures don't affect other operations
  */
  processImportData(groupedChanges: any): void {
    this.spinner.show();

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    const isSendTab = this.selectedTab === this.PI_TABS.SEND;
    const totalOperations =
      groupedChanges.addNew.length +
      groupedChanges.edit.length +
      groupedChanges.delete.length;

    let completedOperations = 0;

    // Helper to check if all operations are complete
    const checkCompletion = () => {
      completedOperations++;
      if (completedOperations === totalOperations) {
        this.spinner.hide();

        // Show summary message
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

          // Show errors if any
          if (results.errors.length > 0) {
            console.error('Import errors:', results.errors);
          }
        }

        // Refresh data regardless of success/failure
        if (isSendTab) {
          this.getPISendData();
        } else {
          this.getPIReceiveData();
        }
      }
    };

    // Process Add New - Remove _id to prevent conflicts
    groupedChanges.addNew.forEach((item: ExcelImportResult) => {
      // Remove _id and any auto-generated fields to ensure new record creation
      const { _id, piId, createdOn, createdBy, modifiedDate, modifiedBy, ...cleanData } = item.rowData;

      const payload = this.preparePayload(cleanData, isSendTab);
      const apiCall = isSendTab
        ? this.piAdministrationService.postPISend(payload)
        : this.piAdministrationService.postPIReceive(payload);

      apiCall.subscribe({
        next: () => {
          results.success++;
          checkCompletion();
        },
        error: (error) => {
          results.failed++;
          results.errors.push(`Row ${item.rowIndex} (Add): ${error?.error?.response || error?.message || 'Unknown error'}`);
          checkCompletion();
        }
      });
    });

    // Process Edit - Keep _id for identification
    groupedChanges.edit.forEach((item: ExcelImportResult) => {
      const id = item.rowData._id;

      if (!id) {
        results.failed++;
        results.errors.push(`Row ${item.rowIndex} (Edit): Missing _id for edit operation`);
        checkCompletion();
        return;
      }

      // Remove auto-generated fields but keep _id for the API
      const { piId, createdOn, createdBy, modifiedDate, modifiedBy, ...cleanData } = item.rowData;
      const payload = this.preparePayload(cleanData, isSendTab);

      const apiCall = isSendTab
        ? this.piAdministrationService.putPISend(payload, id)
        : this.piAdministrationService.putPIReceive(payload, id);

      apiCall.subscribe({
        next: () => {
          results.success++;
          checkCompletion();
        },
        error: (error) => {
          results.failed++;
          results.errors.push(`Row ${item.rowIndex} (Edit): ${error?.error?.response || error?.message || 'Unknown error'}`);
          checkCompletion();
        }
      });
    });

    // Process Delete
    groupedChanges.delete.forEach((item: ExcelImportResult) => {
      const id = item.rowData._id;

      if (!id) {
        results.failed++;
        results.errors.push(`Row ${item.rowIndex} (Delete): Missing _id for delete operation`);
        checkCompletion();
        return;
      }

      const apiCall = isSendTab
        ? this.piAdministrationService.deletePISend(id)
        : this.piAdministrationService.deletePIReceive(id);

      apiCall.subscribe({
        next: () => {
          results.success++;
          checkCompletion();
        },
        error: (error) => {
          results.failed++;
          results.errors.push(`Row ${item.rowIndex} (Delete): ${error?.error?.response || error?.message || 'Unknown error'}`);
          checkCompletion();
        }
      });
    });

    // Handle case when no operations to process
    if (totalOperations === 0) {
      this.spinner.hide();
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes',
        detail: 'No changes to process'
      });
    }
  }

  /**
   * Prepare payload for API calls
   */
  preparePayload(rowData: any, isSend: boolean): any {
    const basePayload = {
      attributeId: rowData.attributeId || '',
      attributeName: rowData.attributeName || '',
      tagNumber: rowData.tagNumber || '',
      piDesc: rowData.piDesc || '',
      systemName: rowData.systemName || '',
      orgId: this.filterService.currentOrg?.orgId || '',
      orgName: this.filterService.currentOrg?.orgName || ''
    };

    if (isSend) {
      return {
        ...basePayload,
        piTagNumber: rowData.piTagNumber || '',
        piTagDesc: rowData.piTagDesc || '',
        tagStatus: rowData.piSendStatus || 'active',
        appId: this.filterService.currentApp?.appId || '',
        appName: this.filterService.currentApp?.appName || ''
      };
    } else {
      return {
        ...basePayload,
        piTagNumber: rowData.piTagNumber || '',
        piReceiveStatus: rowData.piReceiveStatus || 'active',
        extType: rowData.extType || '',
        freqType: rowData.freqType || '',
        appId: this.filterService.currentApp?.appId || '',
        appName: this.filterService.currentApp?.appName || ''
      };
    }
  }







  validateSendTag(send: any): void {


  }

  onAttributeSendChange(event: any) {
    const selectedId = event.value;
    const obj: any = this.globalAttributes.find((x: any) => x.attributeId === selectedId);
    this.updateSendForm.patchValue({
      attributeName: obj.attributeName
    });
  }

  createSendTag(): void {
    this.appRef = this.dialog.open(ManagePiNewComponent, {
      header: 'Create PI Tag Send',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        tagType: 'send',
        orgId: this.filterService.currentOrg?.orgId ?? ''
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'PI Tag Send created successfully', life: 3000 });
        this.getPISendData();
      }
    });
  }


  /**
 * Patches the TagSend data to the updateSendForm
 * @param {any} send - application data
 * @returns {void} - returns nothing (i.e) void
 */
  patchSendValue(send: any): void {
    this.updateSendForm.patchValue({
      attributeId: send.attributeId,
      attributeName: send.attributeName,
      tagNumber: send.tagNumber ?? '',
      piDesc: send.piDesc,
      tagSendLevelId: send.tagSendLevelId,
      piSendStatus: send.piSendStatus,
      systemName: send.systemName,
      createdOn: this.datePipe.transform(new Date(send.createdOn), 'mediumDate'),
      createdBy: send.createdBy,
      modifiedDate: this.datePipe.transform(new Date(send.createdOn), 'mediumDate'),
      modifiedBy: send.modifiedBy,
      orgId: send.orgId,
      orgName: send.orgName
    })
  }


  /**
   * Handles application selection from a table.
   * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
   */
  onPISendSelect(event: TableRowSelectEvent) {
    this.activeSend = event.data;
    this.patchSendValue(event.data);
    this.isShowSendTagDetails = true;
  }

  /**
   * Handles row click selection for desktop table.
   * @param {any} send - The selected send data.
   */
  onPISendSelectRow(send: any) {
    this.activeSend = send;
    this.patchSendValue(send);
    this.isShowSendTagDetails = true;
  }

  /**
   * Handles card selection for mobile view.
   * @param {any} send - The selected send data.
   */
  onPISendSelectMobile(send: any) {
    this.activeSend = send;
    this.patchSendValue(send);
    this.isShowSendTagDetails = true;
  }


  /**
   * Clears the table filter/search.
   * @param {Table} _t19 - The table reference whose filter should be cleared.
   */
  clearSendTable(dt: Table) {
    dt.reset();
    this.searchPISendValue = '';
    this.selectedSends = [];
    this.activeSend = null;
    this.isShowSendTagDetails = false;
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }

  /**
   * Edits an existing PI SEnd.
   * @param {any} data - The PI Send data to be edited.
   */
  editPISend(data: any) {
    if (this.updateSendForm.valid) {
      const payload = {
        ...this.updateSendForm.getRawValue()
      }
      this.piAdministrationService.putPISend(payload, data._id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Updated successfully'
          });      
          this.isShowSendTagDetails = false;
          this.getPISendData();
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
   * Deletes an existing PI Send tag.
   * Opens a confirmation dialog before deletion
   * @param {any} data - The PI Send data to be deleted.
   */
  deletePISend(data: any) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      header: 'Confirm Delete',
      modal: true,
      closable: true,
      data: {
        message: 'Are you sure you want to delete this PI Send tag?',
        itemName: data.attributeName
      },
      width: '400px'
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        this.isShowSendTagDetails = false;
        this.piAdministrationService.deletePISend(data._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'PI Send tag deleted successfully'
            });
            this.getPISendData();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete PI Send tag'
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







  validateReceiveTag(receive: any): void {

  }

  onAttributeReceiveChange(event: any) {
    const selectedId = event.value;
    const obj: any = this.globalAttributes.find((x: any) => x.attributeId === selectedId);
    this.updateReceiveForm.patchValue({
      attributeName: obj.attributeName
    });
  }

  createReceiveTag(): void {
    this.appRef = this.dialog.open(ManagePiNewComponent, {
      header: 'Create PI Tag Receive',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        tagType: 'receive',
        orgId: this.filterService.currentOrg?.orgId ?? ''
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'PI Tag Receive created successfully', life: 3000 });
        this.getPIReceiveData();
      }
    });
  }


  /**
* Patches the TagSend data to the updateSendForm
* @param {any} receive - application data
* @returns {void} - returns nothing (i.e) void
*/
  patchReceiveValue(receive: any): void {
    this.updateReceiveForm.patchValue({
      attributeId: receive.attributeId,
      attributeName: receive.attributeName,
      piTagNumber: receive.piTagNumber,
      tagNumber: receive.tagNumber,
      piDesc: receive.piDesc,
      tagReceiveLevelId: receive.tagReceiveLevelId,
      piReceiveStatus: receive.piReceiveStatus,
      extType: receive.extType,
      freqType: receive.freqType,
      systemName: receive.systemName,
      createdOn: this.datePipe.transform(new Date(receive.createdOn), 'mediumDate'),
      createdBy: receive.createdBy,
      modifiedDate: this.datePipe.transform(new Date(receive.createdOn), 'mediumDate'),
      modifiedBy: receive.modifiedBy,
      value_status: receive.value_status,
      last_updated_date: receive.last_updated_date,
      record_ts: receive.record_ts,
      orgId: receive.orgId,
      orgName: receive.orgName
    })
  }


  /**
 * Handles application selection from a table.
 * @param {TableRowSelectEvent} $event - The event object containing details of the selected row.
 */
  onPIReceiveSelect(event: TableRowSelectEvent) {
    this.activeReceive = event.data;
    this.patchReceiveValue(event.data);
    this.isShowReceiveTagDetails = true;
  }

  /**
   * Handles row click selection for desktop table.
   * @param {any} receive - The selected receive data.
   */
  onPIReceiveSelectRow(receive: any) {
    this.activeReceive = receive;
    this.patchReceiveValue(receive);
    this.isShowReceiveTagDetails = true;
  }

  /**
   * Handles card selection for mobile view.
   * @param {any} receive - The selected receive data.
   */
  onPIReceiveSelectMobile(receive: any) {
    this.activeReceive = receive;
    this.patchReceiveValue(receive);
    this.isShowReceiveTagDetails = true;
  }


  /**
 * Clears the table filter/search.
 * @param {Table} _t19 - The table reference whose filter should be cleared.
 */
  clearReceiveTable(dt: Table) {
    dt.reset();
    this.searchPIReceiveValue = '';
    this.selectedReceives = [];
    this.activeReceive = null;
    this.isShowReceiveTagDetails = false;
  }

  /**
 * Edits an existing PI Receive.
 * @param {any} data - The PI Receive data to be edited.
 */
  editPIReceive(data: any) {
    if (this.updateReceiveForm.valid) {
      const payload = {
        ...this.updateReceiveForm.getRawValue()
      }
      this.piAdministrationService.putPIReceive(payload, data._id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Updated successfully'
          });
          this.isShowReceiveTagDetails = false;
          this.getPIReceiveData();
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
        detail: 'Failed to validate fields'
      });
    }

  }

  /**
   * Deletes an existing PI Receive tag.
   * Opens a confirmation dialog before deletion
   * @param {any} data - The PI Receive data to be deleted.
   */
  deletePIReceive(data: any) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      header: 'Confirm Delete',
      modal: true,
      closable: true,
      data: {
        message: 'Are you sure you want to delete this PI Receive tag?',
        itemName: data.attributeName
      },
      width: '550px'
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        this.isShowReceiveTagDetails = false;
        this.piAdministrationService.deletePIReceive(data._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'PI Receive tag deleted successfully'
            });
            this.getPIReceiveData();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete PI Receive tag'
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



  getSeverity(status: any) {
    switch (status) {
      case 'active':
        return 'success';

      case 'inactive':
        return 'danger';
      default:
        return 'success'
    }
  }

  getStatus(status: any) {
    switch (status) {
      case 'active':
        return 'Active';

      case 'inactive':
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
    this.isShowSendTagDetails = false;
    this.isShowReceiveTagDetails = false;
  }

  async exportExcel(dt: Table, selection: any[], filename: string) {
    try {
      const exportData = selection && selection.length > 0 ? selection : dt.value;
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
