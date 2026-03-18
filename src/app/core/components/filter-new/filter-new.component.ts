import { Component, Input, OnInit } from '@angular/core';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { Apps, Orgs } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { CommonModule } from '@angular/common';
import { PrimeNgModules } from '../../modules/primeng.module';

@Component({
  selector: 'app-filter-new',
  standalone: true,
  templateUrl: './filter-new.component.html',
  styleUrl: './filter-new.component.css',
  imports: [CommonModule, PrimeNgModules]
})
export class FilterNewComponent {
 /** List of available applications fetched from the server. */
  apps!: Apps[];

  /** List of organizations corresponding to the selected application. */
  orgs!: Orgs[];

  /** ID of the currently selected application. */
  selectedApp!: any;

  /** ID of the currently selected organization. */
  selectedOrg: any;

  /** Hiding Organization */
  @Input() isHideOrg: boolean = false;

  /** Hiding Organization */
  @Input() isHideApp: boolean = false;


  /**
   * Initializes the component with necessary services.
   *
   * @param pageAdminService - Service for fetching application and organization data.
   * @param filter - Shared filter service used to persist and retrieve selected filters.
   */
  constructor(
    private pageAdminService: PageAdministratorService,
    private filter: FilterService
  ) { }

  /**
   * Angular lifecycle hook.
   *
   * Initializes the component by:
   * - Fetching the list of applications.
   * - Reading the currently selected app/org from the shared `FilterService`.
   * - Optionally fetching organizations if a selected app is already present.
   */
  ngOnInit(): void {
    this.getApps();
    this.selectedApp = this.filter.currentApp;

    // Optionally load orgs and prefill selected org if necessary.
    // Uncomment and customize as needed.
    if (this.selectedApp && !this.isHideApp) {
      //when there is both dropdown
      this.getOrgs(this.selectedApp);
      setTimeout(() => {
        this.selectedOrg = this.filter.currentOrg;
      });
    } else if (this.isHideApp && !this.isHideOrg) {
      //when there is no application dropdown
      this.getOrgsWithoutApp();
      setTimeout(() => {
        this.selectedOrg = this.filter.currentOrg;
      });
    } else {
      //when there is only application dropdown, do nothing

    }
  }

  /**
   * Fetches the list of organizations for a given application from the server
   * using `PageAdministratorService` and updates the `orgs` property.
   *
   * @param appId - The ID of the selected application.
   */
  getOrgs(appId: string): void {
    // Don't make API call if appId is undefined, null, or empty
    if (!appId) {
      this.orgs = [];
      return;
    }

    this.pageAdminService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {
        this.orgs = res.orgs.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }));
      },
      error: (err) => {
        console.error('Failed to fetch organizations:', err);
        this.orgs = [];
      }
    });
  }


  /**
   * Fetches the list of organizations for a given application from the server
   * using `PageAdministratorService` and updates the `orgs` property.
   *
   */
  getOrgsWithoutApp(): void {
    this.pageAdminService.getOrgsWithoutByApp().subscribe({
      next: (res: any) => {
        this.orgs = res.Organization.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }));
      },
      error: (err) => {
        console.error('Failed to fetch organizations:', err);
      }
    });
  }

  /**
   * Triggered when the selected application changes.
   *
   * - Clears the `orgs` list to avoid stale data.
   * - Fetches the corresponding organizations.
   * - Updates the shared `FilterService` with the new selection.
   * - Emits the updated filter parameters.
   *
   * @param appId - The newly selected application ID.
   */
  onAppChange(event: any): void {
    this.orgs = [];
    if (this.selectedApp === null || this.selectedApp === undefined) {
      this.selectedOrg = null;
      this.filter.updateSelectedOrg(this.selectedOrg);
      this.filter.updateSelectedApp(null);
      return;
    }

    if (!this.isHideOrg) {
      const appId = this.selectedApp?.appId;
      if (appId) {
        this.getOrgs(appId);
      }
    }

    this.filter.updateSelectedApp(this.selectedApp);
  }

  /**
   * Triggered when the selected organization changes.
   *
   * - Updates the shared `FilterService` with the new organization.
   * - Emits the updated filter parameters.
   */
  onOrgChange(event: any): void {
    this.filter.updateSelectedOrg(event.value);
  }

  /**
   * Fetches the list of available applications from the server
   * using `PageAdministratorService` and updates the `apps` property.
   * @returns {void} - returns nothing
   */
  getApps(): void {
    this.pageAdminService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.apps.map((app: any) => ({
          appId: app.appId,
          appName: app.appName,
          appStatus: app.appStatus
        }));
      },
      error: (err) => {
        console.error('Failed to fetch applications:', err);
      }
    });
  }

  get activeApps(): any[] {
    return (this.apps ?? []).filter(
      (app: any) => String(app?.appStatus ?? '').toLowerCase() === 'active'
    );
  }
}
