import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-app-details',
  standalone: false,
  templateUrl: './app-details.component.html',
  styleUrl: './app-details.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppDetailsComponent {
  appId: any
  appActions: string[] = [
    "Operating Organization",
    "Role",
    "Role Assignment",
    "Frequency",
    // "Tag Data Source",
    "Shift"
  ]
  appName: any;
  selectedAction: string;
  appActionCards = [
    { value: 'Operating Organization', label: 'Operating Org', subtitle: 'Manage Operating Org', icon: 'pi pi-sitemap', bgClass: 'bg-operating-org' },
    { value: 'Role', label: 'Role', subtitle: 'Manage Role', icon: 'pi pi-user', bgClass: 'bg-role' },
    { value: 'Role Assignment', label: 'Role Assignment', subtitle: 'Manage Role Assign', icon: 'pi pi-users', bgClass: 'bg-role-assignment' },
    { value: 'Frequency', label: 'Frequency', subtitle: 'Manage Frequency', icon: 'pi pi-bolt', bgClass: 'bg-frequency' },
    { value: 'Shift', label: 'Shift', subtitle: 'Manage Shift', icon: 'pi pi-clock', bgClass: 'bg-shift' }
  ]
  constructor(private activateRoute: ActivatedRoute, private router: Router, private responsive :ResponsiveService, private location: Location) {

    // combineLatest([
    //   this.activateRoute.paramMap,
    //   this.activateRoute.queryParams,
    // ]).subscribe(([paramMap, queryParams]) => {
    //   this.appId = paramMap.get('id');
    // });

    const app: any = this.router.getCurrentNavigation()?.extras.state;
    this.appName = app?.appName

    this.appId = this.activateRoute.snapshot.params['id'];
    this.selectedAction = this.appActions[0];
  }
  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;
  ngOnInit(){
    this.isMobile$  = this.responsive.isMobile$();
    // this.isMobile$.subscribe(value => console.log('Is mobile?', value));
  }
  goBack(): void {
    this.location.back();
  }
  onActionCardClick(action: string): void {
    this.selectedAction = action;
  }
  getCardThemeClass(action: string): string {
    switch (action) {
      case 'Operating Organization':
        return 'theme-operating-org';
      case 'Role':
        return 'theme-role';
      case 'Role Assignment':
        return 'theme-role-assignment';
      case 'Frequency':
        return 'theme-frequency';
      case 'Shift':
        return 'theme-shift';
      default:
        return '';
    }
  }
}
