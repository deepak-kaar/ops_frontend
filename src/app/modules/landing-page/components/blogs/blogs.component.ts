import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { RolePermissionService } from 'src/app/core/services/role-permission/role-permission.service';

@Component({
  selector: 'app-blogs',
  standalone: false,
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent implements OnInit {
    /**
       * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
       */
    isMobile$!: Observable<boolean>;
    hasAdminAccess: boolean = true;
  
    constructor(
      private responsive: ResponsiveService,
      private rolePermissionService: RolePermissionService
    ) { }
  
    ngOnInit(): void {
      this.isMobile$ = this.responsive.isMobile$();
      this.rolePermissionService.rolePermission$.subscribe(permission => {
        if (permission.role === 'Admin') {
          this.hasAdminAccess = permission.hasAccess;
        } else {
          this.hasAdminAccess = true;
        }
      });
    }

}
