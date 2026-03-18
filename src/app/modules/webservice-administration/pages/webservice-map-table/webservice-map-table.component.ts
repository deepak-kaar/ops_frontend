import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ExportService } from 'src/app/core/services/export.service';
import { WebserviceAdministrationComponent } from '../../webservice-administration.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Table, TableRowSelectEvent } from 'primeng/table';

@Component({
  selector: 'app-webservice-map-table',
  standalone: false,
  templateUrl: './webservice-map-table.component.html',
  styleUrl: './webservice-map-table.component.css'
})
export class WebserviceMapTableComponent extends WebserviceAdministrationComponent implements OnInit {

  private _wsData: any;

  @Input()
  set wsData(value: any) {
    this._wsData = value;
    this.getWSMap();
  }

  get wsData(): any {
    return this._wsData;
  }

  appRef!: DynamicDialogRef;
  @ViewChild('dt') dt: Table | undefined;

  private subscribe$ = new Subject<void>();

  /**
 * @property {any} searchWSMapValue - Stores the search input value for filtering applications.
 */
  searchWSMapValue: any;


  /**
 * @property {unknown} iSWSMaploading - Indicates the loading state (can be replaced with a boolean for better clarity).
 */
  iSWSMaploading: unknown;



  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
* @property {Observable<any>} ws_map_data - Stores the list of data source fetched from the backend.
*/
  ws_map_data$!: Observable<any>;

  selectedWSMaps: any[] = []; // store selected rows for export

  /**
 * Constructor injects necessary services.
 * @constructor
 */
  constructor(private exportService: ExportService) {
    super();
    this.filterService.selectedWS$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        console.log("event occured:", event);
        this.getWSMap();
      }
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  getWSMap() {
    this.spinner.show();

    console.log(this.wsData);
    this.ws_map_data$ = this.webserviceAdministrationService.getWSById(this.wsData.webserviceId).pipe(
      map((res: any) => {
        const wsData = res?.dataSourceData || res?.webServiceData || res?.data || res;
        
        if (!wsData) {
          return [];
        }

        // Transform mappedField object into array of mapping records
        const mappedField = wsData.mappedField || {};
        const mappings: any[] = [];

        // Process each mapping
        Object.keys(mappedField).forEach((sourceField) => {
          const attributeDetails = mappedField[sourceField];
          
          if (attributeDetails) {
            mappings.push({
              _id: `${wsData._id}_${sourceField}`, // Unique ID for table
              sourceField: sourceField,
              targetField: attributeDetails.attributeName || 'N/A',
              attributeId: attributeDetails.attributeId || null,
              attributeType: attributeDetails.type || 'N/A',
              entityId: attributeDetails.id || null,
              isUnmapped: false
            });
          }
        });

        // If no mappings found but externalField and internalField exist, show unmapped fields
        if (mappings.length === 0 && wsData.externalField && wsData.internalField) {
          // Show available source fields (unmapped)
          (wsData.externalField || []).forEach((sourceField: string) => {
            mappings.push({
              _id: `${wsData._id}_${sourceField}_unmapped`,
              sourceField: sourceField,
              targetField: 'Not Mapped',
              attributeId: null,
              attributeType: 'N/A',
              entityId: null,
              isUnmapped: true
            });
          });
        }

        return mappings;
      }),
      finalize(() => this.spinner.hide())
    );
  }

  mobileTabButtonChange(): void {

  }


  createWSMap(): void {
    // if (!(this.filterService.currentOrg)) {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an organization' });
    //   return;
    // }
  }


  onWSMapSelect(event: TableRowSelectEvent) {
  }

  /**
 * Clears the table filter/search.
 * @param {Table} _t19 - The table reference whose filter should be cleared.
 */
  clearWSMapTable(dt: Table) {
    if (this.dt) { // Added null check for this.dt
      this.dt.reset();
    }
    this.searchWSMapValue = '';
    this.selectedWSMaps = [];
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }

  /**
 * Edits an existing Web service.
 * @param {any} data - The web service to be edited.
 */
  editWSMap(data: any) {
  }

  /**
   * run an existing webservice.
   * Opens the toast by using primeng message sevice and shows the message
   * @param {any} data - The web servue data to be runned.
   */
  runWSMap(data: any) {
  }

  /**
   * Deletes an existing application.
   * opens an confirmation popup using primeng Confirmation service
   * Opens the toast by using primeng message sevice and shows the message
   * @param {any} data - The application data to be deleted.
   */
  deleteWSMap(data: any) {
  }

  /**
  * Lifecycle hook triggered after the time of component destroy.
  * unsubscribes the filter subscriptions
  */
  ngOnDestroy() {
  }

  /**
   * Format source field path for better readability
   * Removes common prefixes and formats array notation
   */
  formatSourceField(field: string): string {
    if (!field) return '';
    
    // Remove common SOAP prefixes
    let formatted = field
      .replace(/^soap:Body\.?/i, '')
      .replace(/^soap:Envelope\.?/i, '')
      .replace(/^root\.?/i, '');
    
    // Format array notation for better readability
    formatted = formatted.replace(/\[(\d+)\]/g, '[$1]');
    formatted = formatted.replace(/\[\]/g, '[]');
    
    // Replace dots with arrows for hierarchy
    formatted = formatted.replace(/\./g, ' → ');
    
    return formatted || field;
  }

  /**
   * Get a shorter version of source field for display
   */
  getShortSourceField(field: string, maxLength: number = 50): string {
    if (!field) return '';
    if (field.length <= maxLength) return field;
    
    // Try to get the last part of the path
    const parts = field.split('.');
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      if (lastPart.length <= maxLength) {
        return `...${lastPart}`;
      }
    }
    
    return field.substring(0, maxLength - 3) + '...';
  }

  exportExcel() {
  let exportData: any[] = [];

  if (this.selectedWSMaps && this.selectedWSMaps.length > 0) {
    exportData = this.selectedWSMaps;
  } else if (this.dt?.value?.length) {
    exportData = this.dt.value;
  }

  if (exportData.length === 0) {
    this.showToast('warn', 'No Data', 'There is no data to export', 3000, false);
    return;
  }

  this.exportService.exportExcel(exportData, 'webservice_mappings');
}


}
