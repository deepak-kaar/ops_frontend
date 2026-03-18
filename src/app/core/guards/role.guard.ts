import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { UserRoleService } from '../services/user-role/user-role.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private userRoleService: UserRoleService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.userRoleService.userRole$.pipe(
      take(1),
      map(userRole => {
        if (userRole && userRole.role) {
          return true;
        }
        // Redirect to unauthorized page or login
        this.router.navigate(['/unauthorized']);
        return false;
      })
    );
  }
}