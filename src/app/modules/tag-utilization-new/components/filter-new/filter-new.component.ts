import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { FilterService } from 'src/app/modules/tag-utilization/services/filter/filter.service';
import { Apps, Orgs } from 'src/app/modules/page-administrator/interfaces/page-administrator';

@Component({
  selector: 'app-filter-new',
  standalone: false,
  templateUrl: './filter-new.component.html',
  styleUrl: './filter-new.component.css'
})
export class FilterNewComponent implements OnInit {
  apps!: Apps[];
  orgs!: Orgs[];

  selectedApp: any = null;
  selectedOrg: any = null;

  fromDate: Date | null = null;
  toDate: Date | null = null;

  @Input() isHideOrg: boolean = false;
  @Input() isHideApp: boolean = false;

  @Output() dateRangeSelected = new EventEmitter<{ fromDate: Date | null; toDate: Date | null }>();
  @Output() filtersChanged = new EventEmitter<any>();

  constructor(
    private pageAdminService: PageAdministratorService,
    private filter: FilterService
  ) {}

  ngOnInit(): void {
    this.getApps();
    this.selectedApp = this.filter.currentApp;

    if (this.selectedApp && !this.isHideApp) {
      this.getOrgs(this.selectedApp.appId);
      setTimeout(() => (this.selectedOrg = this.filter.currentOrg));
    } else if (this.isHideApp && !this.isHideOrg) {
      this.getOrgsWithoutApp();
      setTimeout(() => (this.selectedOrg = this.filter.currentOrg));
    }
  }

  getApps(): void {
    this.pageAdminService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.apps.map((app: any) => ({
          appId: app.appId,
          appName: app.appName,
        }));
      },
      error: (err) => console.error('Failed to fetch applications:', err),
    });
  }

  getOrgs(appId: string): void {
    this.pageAdminService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {
        this.orgs = res.orgs.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName,
        }));
      },
      error: (err) => console.error('Failed to fetch organizations:', err),
    });
  }

  getOrgsWithoutApp(): void {
    this.pageAdminService.getOrgsWithoutByApp().subscribe({
      next: (res: any) => {
        this.orgs = res.Organization.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName,
        }));
      },
      error: (err) => console.error('Failed to fetch organizations:', err),
    });
  }

  onAppChange(event: any): void {
    this.orgs = [];
    if (this.selectedApp === null) {
      this.selectedOrg = null;
      this.filter.updateSelectedOrg(this.selectedOrg);
    }
    if (!this.isHideOrg && this.selectedApp?.appId) {
      this.getOrgs(this.selectedApp.appId);
    }
    this.filter.updateSelectedApp(this.selectedApp);
    this.emitFilters();
  }

  onOrgChange(event: any): void {
    this.filter.updateSelectedOrg(event.value);
    this.emitFilters();
  }

  onDateChange(): void {
    this.filter.updateDateRange(this.fromDate, this.toDate);
    this.dateRangeSelected.emit({
      fromDate: this.fromDate,
      toDate: this.toDate,
    });
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChanged.emit({
      app: this.selectedApp,
      org: this.selectedOrg,
      fromDate: this.fromDate,
      toDate: this.toDate,
    });
  }
}
