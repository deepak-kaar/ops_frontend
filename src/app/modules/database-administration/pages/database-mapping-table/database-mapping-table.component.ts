import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ExportService } from 'src/app/core/services/export.service';
import { DatabaseAdministrationComponent } from '../../database-administration.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ManageMappingComponent } from '../../components/manage-mapping/manage-mapping.component';
import { Table, TableRowSelectEvent } from 'primeng/table';

@Component({
  selector: 'app-database-mapping-table',
  standalone: false,
  templateUrl: './database-mapping-table.component.html',
  styleUrl: './database-mapping-table.component.css'
})
export class DatabaseMappingTableComponent extends DatabaseAdministrationComponent implements OnInit {

  private _queryData: any;

  @Input()
  set queryData(value: any) {
    this._queryData = value;
    this.getDBMapping();
  }

  get queryData(): any {
    return this._queryData;
  }

  appRef!: DynamicDialogRef;

  private subscribe$ = new Subject<void>();

  /**
* @property {any} searchDBMappingValue - Stores the search input value for filtering applications.
*/
  searchDBMappingValue: any;

  /**
 * @property {unknown} iSDBMappingloading - Indicates the loading state (can be replaced with a boolean for better clarity).
 */
  iSDBMappingloading: unknown;



  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
* @property {Observable<any>} db_query_data - Stores the list of data source fetched from the backend.
*/
  db_mapping_data$!: Observable<any>;

  @ViewChild('dt') dt!: Table;

  selectedDBMappings: any[] = []; // store selected rows for export

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


  constructor(private exportService: ExportService) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  getDBMapping(): void {
    // this.spinner.show();

    console.log('queryData changed:', this.queryData);

    this.db_mapping_data$ = of([{
      externalMappingId: 99,
      queryId: 1,
      queryParameters: "date=date;tankcd=[V25-T11,V25-T28,V25-T29]",
      queryLang: 'javascript',
      tagNumber: "YRD_DMATB_UKERO_SPIPE",
      attributeName: "YRD_DMATB_UKERO_SPIPE",
      attributeId: "YRD_DMATB_UKERO_SPIPE",
      description: "Daily",
      active: true,
      lastUpdateOn: "",
      freqType: "D",
      sysId: "68d4fd05b41e7e4b072babce",
      systemName: "Test",
      type: 'Entity'
    },
    {
      externalMappingId: 87,
      queryId: 1,
      queryParameters: "date=date;tankcd=[V25-T55,V25-T56,V25-T57,V33-T01,V33-T02,V29-T105]",
      queryLang: 'javascript',
      tagNumber: "YRD_DMATB_SLOP_SPIPE",
      attributeName: "YRD_DMATB_SLOP_SPIPE",
      attributeId: "YRD_DMATB_SLOP_SPIPE",
      description: "Hourly",
      active: true,
      lastUpdateOn: "",
      freqType: "H",
      sysId: "68d4fd05b41e7e4b072babce",
      systemName: "Test",
      type: 'Instance'
    },
    {
      externalMappingId: 75,
      queryId: 1,
      queryParameters: "date=date;tankcd=[V19-T15,V19-T16]",
      queryLang: 'javascript',
      tagNumber: "YRD_DMATB_REDD_SPIPE",
      attributeName: "YRD_DMATB_REDD_SPIPE",
      attributeId: "YRD_DMATB_REDD_SPIPE",
      description: "Daily",
      active: true,
      lastUpdateOn: "",
      freqType: "D",
      sysId: "68d4fd05b41e7e4b072babce",
      systemName: "Test",
      type: 'Entity'
    }
    ]);


    // this.database_data$ = this.databaseAdministrationService.getDatabase().pipe(
    //   map((res: any) => res?.dataBaseData || []),
    //   finalize(() => this.spinner.hide())
    // );
  }

  mobileTabButtonChange(): void {

  }

  createDBMapping(): void {
    // if (!(this.filterService.currentOrg)) {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an organization' });
    //   return;
    // }

    this.appRef = this.dialog.open(ManageMappingComponent, {
      header: 'Create Mapping',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Mapping created successfully', life: 3000 });
        this.getDBMapping();
      }
    });
  }


  onDBMappingSelect(event: TableRowSelectEvent) {
  }

  /**
 * Clears the table filter/search.
 * @param {Table} _t19 - The table reference whose filter should be cleared.
 */
  clearDBMappingTable(_t19: Table) {
    this.dt.reset();
    this.searchDBMappingValue = '';
    this.selectedDBMappings = [];
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  /**
 * Edits an existing Database query.
 * @param {any} data - The database query to be edited.
 */
  editDBMapping(data: any) {
    this.appRef = this.dialog.open(ManageMappingComponent, {
      header: 'Edit Mapping',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        mapData: data
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Mapping edited successfully', life: 3000 });
        this.getDBMapping();
      }
    });
  }

  /**
   * Deletes an existing application.
   * opens an confirmation popup using primeng Confirmation service
   * Opens the toast by using primeng message sevice and shows the message
   * @param {any} data - The application data to be deleted.
   */
  deleteDBMapping(data: any) {
    // this.databaseAdministrationService.deleteDBQuery(data._id).subscribe({
    //   next: () => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Deleted',
    //       detail: 'Deleted successfully'
    //     });
    //     this.getDBQuery();
    //   },
    //   error: () => {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Error',
    //       detail: 'Failed to delete'
    //     });
    //   }
    // });
  }

 exportExcel() {
  let exportData: any[] = [];

  if (this.selectedDBMappings && this.selectedDBMappings.length > 0) {
    exportData = this.selectedDBMappings;
  } else if (this.dt?.value?.length) {
    exportData = this.dt.value;
  }

  if (exportData.length === 0) {
    this.showToast('warn', 'No Data', 'There is no data to export', false);
    return;
  }

  this.exportService.exportExcel(exportData, 'database_mappings');
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
