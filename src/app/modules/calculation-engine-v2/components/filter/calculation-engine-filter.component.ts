import { Component, OnInit } from '@angular/core';
import { Apps, Orgs } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { FilterEngineService } from 'src/app/modules/calculation-engine/services/filter-engine.service';

@Component({
  selector: 'app-calculation-engine-filter',
  standalone: false,
  templateUrl: './calculation-engine-filter.component.html',
  styleUrl: './calculation-engine-filter.component.css'
})
export class CalculationEngineFilterComponent implements OnInit {

  apps!: Apps[];
  orgs!: Orgs[];
  selectedApp!: any;
  selectedOrg: any;

  constructor(
    private pageAdminService: PageAdministratorService,
    private filter: FilterEngineService
  ) { }

  ngOnInit(): void {
    this.getApps();
    this.selectedApp = this.filter.currentApp;

    if (this.selectedApp) {
      this.getOrgs(this.selectedApp);
      setTimeout(() => {
        this.selectedOrg = this.filter.currentOrg;
      });
    }
  }

  getOrgs(appId: string): void {
    this.pageAdminService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {
        this.orgs = res.orgs.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }));
      },
      error: (err) => {
        console.error('Failed to fetch organizations:', err);
      }
    });
  }

  onAppChange(event: any): void {
    this.orgs = [];
    if (!this.selectedApp.appId) {
      this.selectedOrg = null;
      this.filter.updateSelectedOrg(this.selectedOrg);
    }
    this.getOrgs(this.selectedApp.appId);
    this.filter.updateSelectedApp(this.selectedApp);
  }

  onOrgChange(event: any): void {
    this.filter.updateSelectedOrg(this.selectedOrg);
  }

  getApps(): void {
    this.pageAdminService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.apps.map((app: any) => ({
          appId: app.appId,
          appName: app.appName
        }));
      },
      error: (err) => {
        console.error('Failed to fetch applications:', err);
      }
    });
  }
}
