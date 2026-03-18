import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { BaseApiService } from '../base-api/base-api.service';

export interface UserRole {
  user: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserRoleService extends BaseApiService {
  private userRoleSubject = new BehaviorSubject<UserRole | null>(null);
  public userRole$ = this.userRoleSubject.asObservable();

  getUserRole(user: string): Observable<any> {
    return this.get(`accountEnabler/getUserRole`, { params: { user } });
  }

  setUserRole(userRole: UserRole): void {
    this.userRoleSubject.next(userRole);
  }

  getCurrentUserRole(): UserRole | null {
    return this.userRoleSubject.value;
  }

  clearUserRole(): void {
    this.userRoleSubject.next(null);
  }
}