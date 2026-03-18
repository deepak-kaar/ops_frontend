import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { BaseApiService } from '../base-api/base-api.service';
import { UserRoleService } from '../user-role/user-role.service';

export interface RolePermission {
  role: string;
  isActive: boolean;
  hasAccess: boolean;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService extends BaseApiService {
  private rolePermissionSubject = new BehaviorSubject<RolePermission>({
    role: '',
    isActive: false,
    hasAccess: false
  });
  
  public rolePermission$ = this.rolePermissionSubject.asObservable();

  constructor(private userRoleService: UserRoleService) {
    super();
    this.startPermissionCheck();
  }

  private startPermissionCheck(): void {
    // Check permissions every 30 seconds
    interval(30000).subscribe(() => {
      this.checkRolePermissions();
    });
    
    // Initial check
    this.checkRolePermissions();
  }

  private checkRolePermissions(): void {
    const currentUser = this.userRoleService.getCurrentUserRole();
    if (!currentUser) return;

    this.get('accountEnabler/getEnabler').subscribe({
      next: (response: any) => {
        if (response.token === '200' && response.data) {
          const userEnabler = response.data.find((item: any) => 
            item.role === currentUser.role
          );

          const permission: RolePermission = {
            role: currentUser.role,
            isActive: !!userEnabler,
            hasAccess: this.isWithinTimeLimit(userEnabler),
            expiresAt: userEnabler?.expiresAt
          };

          this.rolePermissionSubject.next(permission);
        }
      },
      error: () => {
        this.rolePermissionSubject.next({
          role: currentUser.role,
          isActive: false,
          hasAccess: false
        });
      }
    });
  }

  private isWithinTimeLimit(enabler: any): boolean {
    if (!enabler || !enabler.expiresAt) return false;
    
    const now = new Date();
    const expiresAt = new Date(enabler.expiresAt);
    return now < expiresAt;
  }

  getCurrentPermission(): RolePermission {
    return this.rolePermissionSubject.value;
  }

  hasAdminAccess(): boolean {
    const permission = this.getCurrentPermission();
    return permission.role === 'Admin' && permission.hasAccess;
  }

  hasManagerAccess(): boolean {
    const permission = this.getCurrentPermission();
    return permission.role === 'Manager' && permission.hasAccess;
  }
}