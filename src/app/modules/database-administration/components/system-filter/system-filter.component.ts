import { Component, OnInit } from '@angular/core';
import { SystemFilterService } from '../../services/system/system-filter.service';
import { DatabaseAdministrationService } from '../../services/database-administration.service';
import { DatasourceAdministrationService } from 'src/app/modules/datasource-administration/datasource-administration.service';

@Component({
  selector: 'app-system-filter',
  standalone: false,
  templateUrl: './system-filter.component.html',
  styleUrl: './system-filter.component.css'
})
export class SystemFilterComponent implements OnInit {

  /** List of system corresponding*/
  systems!: any[];

  /** ID of the currently selected system. */
  selectedSystem: any;

  /**
   * Initializes the component with necessary services.
   * 
   * @param databaseAdminService - Service for fetching system.
   * @param filter - Shared filter service used to persist and retrieve selected filters.
   */
  constructor(
    private databaseAdminService: DatabaseAdministrationService,
    private datasourceAdminService: DatasourceAdministrationService,
    private filter: SystemFilterService
  ) { }

  /**
   * Angular lifecycle hook.
   * 
   * Initializes the component by:
   * - Fetching the list of systems.
   * - Reading the currently system from the shared `SystemService`.
   */
  ngOnInit(): void {
    this.getSystemDropdown();
    this.selectedSystem = this.filter.currentSystem;
  }

  /**
   * Fetches the list of system from the server
   * using `DatabaseAdministrationService` and updates the `systems` property.
   * 
   */
  getSystemDropdown(): void {
    this.datasourceAdminService.getDataSource({ fields: 'sysName' }).subscribe({
      next: (res: any) => {
        this.systems = res?.dataSourceData || [];
      },
      error: (err) => {
        console.error('Failed to fetch systems:', err);
      }
    });
  }

  onSystemChange(event: any): void {
    this.filter.updateSelectedSystem(this.selectedSystem);
  }
}
