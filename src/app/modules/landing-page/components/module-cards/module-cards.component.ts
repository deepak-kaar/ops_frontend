import { OrganizationAdministration } from './../../../organization-administration/interfaces/organization-administration';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { OrganizationAdministrationService } from 'src/app/modules/organization-administration/organization-administration.service';
// import the same service used in organization-administration component
// import { OrganizationAdministrationService } from '...';

@Component({
  selector: 'app-module-cards',
  standalone: false,
  templateUrl: './module-cards.component.html',
  styleUrl: './module-cards.component.css'
})

export class ModuleCardsComponent implements OnInit {

  /**
     * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
     */
  isMobile$!: Observable<boolean>;

  constructor(
    private responsive: ResponsiveService,
  private organizationAdministrationService: OrganizationAdministrationService) { }

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.loadApps();
  }

  private loadApps(): void {
    // IMPORTANT: call the exact same endpoint method you used in organization-administration component
    this.organizationAdministrationService.getApps().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res?.apps) ? res.apps : (Array.isArray(res) ? res : []);
        this.apps = list;
        this.activeApps = this.apps.filter((app: any) =>
          String(app?.appStatus ?? '').trim().toLowerCase() === 'active'
        );
      },
      error: () => {
        this.apps = [];
        this.activeApps = [];
      }
    });
  }

  apps: any[] = [];
  activeApps: any[] = [];

  trackByAppId(_: number, app: any): string | number {
    return app?.appId ?? app?.id ?? _;
  }

  getAppImage(app: any): string | null {
    if (app?.appLogoDataUrl) return app.appLogoDataUrl;
    if (app?.appLogo && app?.appLogoType) {
      return `data:${app.appLogoType};base64,${app.appLogo}`;
    }
    return null;
  }

  isPoisApp(app: any): boolean {
    const key = String(app?.appName ?? '').trim().toLowerCase();
    return key === 'pois';
  }

  getCardRoute(app: any): string[] {
    return this.isPoisApp(app) ? ['/home/inbox'] : ['/orgAdmin/appAdmin'];
  }

  getCardQueryParams(app: any): any {
    if (this.isPoisApp(app)) {
      return { app: '1' };
    }
    return { appId: app?.appId, appName: app?.appName, app: '1' };
  }

}
