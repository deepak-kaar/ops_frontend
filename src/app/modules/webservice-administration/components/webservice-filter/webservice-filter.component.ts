import { Component, OnInit } from '@angular/core';
import { WebService } from '../../services/webservice/web.service';
import { WebserviceAdministrationService } from '../../services/webservice-administration.service';

@Component({
  selector: 'app-webservice-filter',
  standalone: false,
  templateUrl: './webservice-filter.component.html',
  styleUrl: './webservice-filter.component.css'
})
export class WebserviceFilterComponent implements OnInit {
 /** List of web services corresponding*/
  webServices!: any[];

  /** ID of the currently selected web service. */
  selectedWS: any;

  /**
   * Initializes the component with necessary services.
   * 
   * @param webserviceAdminService - Service for fetching system.
   * @param filter - Shared filter service used to persist and retrieve selected filters.
   */
  constructor(
    private webserviceAdminService: WebserviceAdministrationService,
    private filter: WebService
  ) { }

  /**
   * Angular lifecycle hook.
   * 
   * Initializes the component by:
   * - Fetching the list of web service.
   * - Reading the current web service from the shared `Webservice`.
   */
  ngOnInit(): void {
    this.getWSDropdown();
    this.selectedWS = this.filter.currentWS;
  }

  /**
   * Fetches the list of system from the server
   * using `DatabaseAdministrationService` and updates the `systems` property.
   * 
   */
  getWSDropdown(): void {
    // this.webserviceAdminService.getWebServices({ fields: 'wsName' }).subscribe({
    //   next: (res: any) => {
    //     this.webServices = res?.dataSourceData || [];
    //   },
    //   error: (err) => {
    //     console.error('Failed to fetch ws:', err);
    //   }
    // });
    this.webServices = [
      {
        wsID: 'WS-001',
        wsName: 'Webservice 1'
      }
    ]
  }

  onWSChange(event: any): void {
    this.filter.updateSelectedWS(this.selectedWS);
  }
}
