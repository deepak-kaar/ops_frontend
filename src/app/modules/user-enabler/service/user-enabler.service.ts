import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, timeout } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class UserEnablerService extends BaseApiService {
  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;

  // API endpoint URLs
  private getEnablers: string = this.baseUrl + 'accountEnabler/getEnabler';
  private getEnablerById: string = this.baseUrl + 'accountEnabler/getEnablerById';
  private postEnabler: string = this.baseUrl + 'accountEnabler/postEnabler';
  private putEnabler: string = this.baseUrl + 'accountEnabler/putEnabler';
  private deleteEnabler: string = this.baseUrl + 'accountEnabler/deleteEnabler';
  private getRoles: string = this.baseUrl + 'accountEnabler/getRoles';
  private getRolesList: string = this.baseUrl + 'accountEnabler/getAllRoles';
  private updateRoleHierarchyUrl: string = this.baseUrl + 'accountEnabler/updateRoleHierarchy';

  getEnablersService(): Observable<any> {
    return this.http.get(this.getEnablers).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getRolesDropdown(params: any): Observable<any> {
    return this.http.get(this.getRoles, {params}).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getRolesHierarchy(): Observable<any> {
    return this.http.get(this.getRolesList).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  updateRoleHierarchy(roleId: string, hierarchyLevel: number | null): Observable<any> {
    return this.http.put(`${this.updateRoleHierarchyUrl}/${roleId}`, { hierarchyLevel }).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }


  getEnabkerByIdService(id: string): Observable<any> {
    return this.http.get(`${this.getEnablerById}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }


  postEnablerService(payload: any): Observable<any> {
    return this.http.post(this.postEnabler, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  putEnablerService(payload: any, id: string): Observable<any> {
    return this.http.put(`${this.putEnabler}/${id}`, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  deleteEnablerService(id: string): Observable<any> {
    return this.http.delete(`${this.deleteEnabler}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getOrganizations(payload: any) {
    return this.http.post<any>('http://localhost:8080/calc/getNewCalculation', payload);
  }

}
