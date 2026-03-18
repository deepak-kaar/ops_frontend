import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

export interface ReportPublish {
  _id?: string;
  reportPublishId?: string;
  pageName: string;
  pageDescription?: string;
  publishPath: string;
  sendAfter: Date | string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'once';
  recipients: string;
  cc?: string;
  bcc?: string;
  emailSubject: string;
  emailBody?: string;
  isActive: boolean;
  createdBy?: string;
  createdDate?: Date | string;
  modifiedBy?: string;
  modifiedDate?: Date | string;
  lastPublishedStatus?: 'success' | 'failed' | null;
  lastPublishedTs?: Date | string | null;
  lastPublishedError?: string | null;
  publishCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportPublishAdministrationService extends BaseApiService {

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;

  private readonly apiEndpoints = {
    getAll: this.baseUrl + 'reportPublish/getAll',
    getById: this.baseUrl + 'reportPublish/get',
    create: this.baseUrl + 'reportPublish/create',
    update: this.baseUrl + 'reportPublish/update',
    delete: this.baseUrl + 'reportPublish/delete',
    toggleActive: this.baseUrl + 'reportPublish/toggleActive',
    trigger: this.baseUrl + 'reportPublish/trigger'
  };

  /**
   * Get all report publish entries
   */
  getAllReportPublish(params?: any): Observable<any> {
    return this.http.get(this.apiEndpoints.getAll, { params }).pipe(
      map((res: any) => res),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
   * Get report publish by ID
   */
  getReportPublishById(id: string): Observable<any> {
    return this.http.get(`${this.apiEndpoints.getById}/${id}`).pipe(
      map((res: any) => res),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
   * Create a new report publish entry
   */
  createReportPublish(data: Partial<ReportPublish>): Observable<any> {
    return this.http.post(this.apiEndpoints.create, data).pipe(
      map((res: any) => res),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
   * Update an existing report publish entry
   */
  updateReportPublish(id: string, data: Partial<ReportPublish>): Observable<any> {
    return this.http.post(`${this.apiEndpoints.update}/${id}`, data).pipe(
      map((res: any) => res),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
   * Delete a report publish entry
   */
  deleteReportPublish(id: string): Observable<any> {
    return this.http.delete(`${this.apiEndpoints.delete}/${id}`).pipe(
      map((res: any) => res),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
   * Toggle active status of a report publish entry
   */
  toggleActiveStatus(id: string, isActive: boolean, modifiedBy: string): Observable<any> {
    return this.http.post(`${this.apiEndpoints.toggleActive}/${id}`, { isActive, modifiedBy }).pipe(
      map((res: any) => res),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
   * Manually trigger sending a report
   */
  triggerReportSend(id: string): Observable<any> {
    return this.http.post(`${this.apiEndpoints.trigger}/${id}`, {}).pipe(
      map((res: any) => res),
      timeout(60000), // Longer timeout for sending
      catchError((err) => {
        throw err;
      })
    );
  }
}
