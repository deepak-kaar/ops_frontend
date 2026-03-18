import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ReportPublishAdministrationComponent } from '../../reportpublish-administration.component';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';

@Component({
  selector: 'app-reportpublish-home',
  standalone: false,
  templateUrl: './reportpublish-home.component.html',
  styleUrl: './reportpublish-home.component.css',
  providers: []
})
export class ReportPublishHomeComponent extends ReportPublishAdministrationComponent implements OnInit, OnDestroy {
  showRoutingCards: boolean = true;
  override mobileSidebarOpen: boolean = false;
  private routerSub!: Subscription;

  // Application and Organization filter
  apps: { appId: string; appName: string }[] = [];
  orgs: { orgId: string; orgName: string }[] = [];
  selectedApp: string | null = null;
  selectedOrg: string | null = null;

  constructor(private router: Router, private pageAdminService: PageAdministratorService) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadApps();
    this.checkRoute(this.router.url);
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects || event.url);
    });
  }

  private checkRoute(url: string): void {
    const lowercaseUrl = url.toLowerCase();
    this.showRoutingCards = !lowercaseUrl.includes('create') &&
      !lowercaseUrl.includes('edit') &&
      !lowercaseUrl.includes('manage');
  }

  override toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  /**
   * Load applications from server
   */
  loadApps(): void {
    this.pageAdminService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.apps?.map((app: any) => ({
          appId: app.appId,
          appName: app.appName
        })) || [];
      },
      error: (err) => {
        console.error('Failed to fetch applications:', err);
      }
    });
  }

  /**
   * Load organizations for selected application
   */
  loadOrgs(appId: string): void {
    if (!appId) {
      this.orgs = [];
      return;
    }
    this.pageAdminService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {
        this.orgs = res.orgs?.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        })) || [];
      },
      error: (err) => {
        console.error('Failed to fetch organizations:', err);
      }
    });
  }

  /**
   * Handle application change
   */
  onAppFilterChange(): void {
    this.selectedOrg = null;
    this.orgs = [];
    if (this.selectedApp) {
      this.loadOrgs(this.selectedApp);
    }
    // Update filter service if needed
    this.filterService.updateSelectedApp(this.selectedApp);
  }

  /**
   * Handle organization change
   */
  onOrgFilterChange(): void {
    // Update filter service if needed
    this.filterService.updateSelectedOrg(this.selectedOrg);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedApp = null;
    this.selectedOrg = null;
    this.orgs = [];
    this.filterService.clearFilters();
  }
}
