import { Component, OnInit } from '@angular/core';
import { SystemFilterService } from 'src/app/modules/database-administration/services/system/system-filter.service';
import { DatabaseAdministrationService } from 'src/app/modules/database-administration/services/database-administration.service';
import { DatasourceAdministrationService } from 'src/app/modules/datasource-administration/datasource-administration.service';

@Component({
  selector: 'app-system-filter',
  standalone: false,
  templateUrl: './system-filter-new.component.html',
  styleUrl: './system-filter-new.component.css'
})
export class SystemFilterNewComponent implements OnInit {

  systems!: any[];
  selectedSystem: any;

  constructor(
    private databaseAdminService: DatabaseAdministrationService,
    private datasourceAdminService: DatasourceAdministrationService,
    private filter: SystemFilterService
  ) { }

  ngOnInit(): void {
    this.getSystemDropdown();
    this.selectedSystem = this.filter.currentSystem;
  }

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
