import { Component, OnInit } from '@angular/core';
import { RolePermissionService } from 'src/app/core/services/role-permission/role-permission.service';

@Component({
  selector: 'app-news',
  standalone: false,
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent implements OnInit {
  hasAdminAccess: boolean = true;

  constructor(private rolePermissionService: RolePermissionService) {}

  ngOnInit(): void {
    this.rolePermissionService.rolePermission$.subscribe(permission => {
      if (permission.role === 'Admin') {
        this.hasAdminAccess = permission.hasAccess;
      } else {
        this.hasAdminAccess = true;
      }
    });
  }
}
