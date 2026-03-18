import { Component, ViewEncapsulation } from '@angular/core';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { Apps, Orgs, ReportTypes } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-page-manager',
  standalone: false,
  templateUrl: './page-manager.component.html',
  styleUrl: './page-manager.component.css',
  encapsulation: ViewEncapsulation.None
})
export class PageManagerComponent {
  activityValues: any;
  showDetails: boolean = false;
  loading: unknown;
  apps!: Apps[];
  orgs!: Orgs[];

  reportTypes: ReportTypes[] = [
    {
      name: 'Report',
      type: 'Report Design'
    },
    {
      name: 'Form',
      type: 'Form Design'
    },
    {
      name: 'Dashboard',
      type: 'Dashboard Design'
    },
    {
      name: 'Card',
      type: 'Card Design'
    },
    {
      name: 'Display Component',
      type: 'Display Component'
    }
  ];

  selectedApp!: string;
  selectedOrg!: string
  SelectedReport!: string;

  tabActions = ['Page Manager', 'Role Page Assignment', 'Page Assignment','Page Mapping']
  selectedTab: any;

  selectedPage: any;
  searchValue: any;
  statuses: any[] = [];
  values: any

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  /**
   * @property {boolean} isSidebarOpen - Indicates whether the sidebar menu is currently open or closed.
   */
  isSidebarOpen: boolean = false;

  /**
   * @property {boolean} mobileSidebarVisible - Determines whether the sidebar is visible on mobile devices.
    */
  mobileSidebarVisible = false;



  constructor(private pageAdminService: PageAdministratorService, private router: Router, private responsive: ResponsiveService) { }
  ngOnInit() {
    this.getApps();
    this.selectedTab = this.tabActions[0];
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();
  }


  /**
   * Fetches the list of Apps from the server with the help of page administrator service and updates the `app` property.
   * Displays a spinner while the API call is in progress.
   * Logs the error in the console if any.
   * @returns {void}
   */
  getApps(): void {
    this.pageAdminService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.apps.map((app: any) => ({
          appId: app.appId,
          appName: app.appName
        }))
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  /**
  * Fetches the list of orgs for an application from the server with the help of page administrator service and updates the `app` property.
  * Displays a spinner while the API call is in progress.
  * Logs the error in the console if any.
  * @param {string} appId - Application Id
  * @returns {void}
  */
  getOrgs(appId: string): void {
    this.pageAdminService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {
        this.orgs = res.orgs.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }))
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  onAppChange(appId: string) {
    this.getOrgs(appId)
  }

  openPageBuilder() {
    if (this.selectedApp) {
      this.router.navigateByUrl('/pageAdmin/pageBuilder', { state: { appId: this.selectedApp, orgId: this.selectedOrg, reportType: this.SelectedReport } })
    }
  }

  toggleMobileSidebar() {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

}
