import { Component, Input } from '@angular/core';
import { ThemeConfigComponent } from "../theme-config/theme-config.component";
import { PrimeNgModules } from '../../modules/primeng.module';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { ResponsiveService } from '../../utils/responsive.service';
import { RolePermissionService } from '../../services/role-permission/role-permission.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  imports: [ThemeConfigComponent, PrimeNgModules, RouterModule]
})
export class SidebarComponent {
  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  @Input() set option(value: string) {
    if (value === 'collapse') {
      this.collapsed = true;
    } else {
      this.collapsed = false;
    }
  }

  collapsed = false;
  hasManagerAccess: boolean = true;

  constructor(
    private responsive: ResponsiveService,
    private rolePermissionService: RolePermissionService
  ) { }

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.rolePermissionService.rolePermission$.subscribe(permission => {
      if (permission.role === 'Manager') {
        this.hasManagerAccess = permission.hasAccess;
      } else {
        this.hasManagerAccess = true;
      }
    });
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }
}
