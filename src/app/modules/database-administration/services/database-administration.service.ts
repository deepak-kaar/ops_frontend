import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout, tap } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';
import { LoggingService } from '../../logging/services/logging.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseAdministrationService extends BaseApiService {

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url
  private loggingService = inject(LoggingService);

  //query strings
  get_query: string = this.baseUrl + 'database/getDatabase';
  post_query: string = this.baseUrl + 'database/postDatabase';
  put_query: string = this.baseUrl + 'database/updateDatabase';
  delete_query: string = this.baseUrl + 'database/deleteDatabase';

  //Get Attribute by org string
  get_attribute_by_orgs: string = this.baseUrl + 'attribute/getAttributeByOrgs';

  getDatabase(params?: any): Observable<any> {
    const startTime = Date.now();
    return this.http.get(this.get_query, { params }).pipe(
      tap((res: any) => {
       // this.logFrontendActivity('GET_DATA_BASE', 'SUCCESS', startTime, params, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('GET_DATA_BASE', 'ERROR', startTime, params, null, err);
        throw err;
      })
    )
  }

  getDatabaseById(id: any): Observable<any> {
    const startTime = Date.now();
    return this.http.get(this.get_query + id).pipe(
      tap((res: any) => {
        this.logFrontendActivity('GET_DATA_BASE_BY_ID', 'SUCCESS', startTime, { id }, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('GET_DATA_BASE_BY_ID', 'ERROR', startTime, { id }, null, err);
        throw err;
      })
    )
  }

  postDatabase(database: any): Observable<any> {
    const startTime = Date.now();
    return this.http.post(this.post_query, database).pipe(
      tap((res: any) => {
        this.logFrontendActivity('POST_DATA_BASE', 'SUCCESS', startTime, database, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('POST_DATA_BASE', 'ERROR', startTime, database, null, err);
        throw err;
      })
    )
  }


  putDatabase(updated_database: any, id: any): Observable<any> {
    const startTime = Date.now();
    return this.http.post(`${this.put_query}/${id}`, updated_database).pipe(
      tap((res: any) => {
        this.logFrontendActivity('PUT_DATA_BASE', 'SUCCESS', startTime, { id, ...updated_database }, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('PUT_DATA_BASE', 'ERROR', startTime, { id, ...updated_database }, null, err);
        throw err;
      })
    )
  }


  deleteDatabase(id: any): Observable<any> {
    const startTime = Date.now();
    return this.http.delete(`${this.delete_query}/${id}`).pipe(
      tap((res: any) => {
        this.logFrontendActivity('DELETE_DATA_BASE', 'SUCCESS', startTime, { id }, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('DELETE_DATA_BASE', 'ERROR', startTime, { id }, null, err);
        throw err;
      })
    )
  }


  private logFrontendActivity(action: string, status: 'SUCCESS' | 'ERROR', startTime: number, requestData?: any, responseData?: any, error?: any) {
    const responseTime = Date.now() - startTime;
    console.log(`[DATABASE_ADMIN_FRONTEND] ${action} - ${status}`, {
      action,
      status,
      responseTime: `${responseTime}ms`,
      module: this.loggingService.MODULES.DATABASE_ADMIN,
      requestData: requestData ? JSON.stringify(requestData).substring(0, 200) : null,
      responseData: responseData ? `Status: ${responseData.token || 'N/A'}` : null,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    });
  }
}
