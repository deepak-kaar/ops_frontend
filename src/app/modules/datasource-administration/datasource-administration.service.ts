import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout, tap } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';
import { LoggingService } from '../logging/services/logging.service';

@Injectable({
  providedIn: 'root'
})
export class DatasourceAdministrationService extends BaseApiService {


  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url
  private loggingService = inject(LoggingService);

  get_data_source: string = this.baseUrl + 'datasource/getDataSource';
  post_data_source: string = this.baseUrl + 'datasource/postDataSource';
  put_data_source: string = this.baseUrl + 'datasource/updateDataSource';
  delete_data_source: string = this.baseUrl + 'datasource/deleteDataSource';

  getDataSource(params?: any): Observable<any> {
    const startTime = Date.now();
    return this.http.get(this.get_data_source, { params }).pipe(
      tap((res: any) => {
        this.logFrontendActivity('GET_DATA_SOURCE', 'SUCCESS', startTime, params, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('GET_DATA_SOURCE', 'ERROR', startTime, params, null, err);
        throw err;
      })
    )
  }

  getDataSourceById(id: any): Observable<any> {
    const startTime = Date.now();
    return this.http.get(this.get_data_source + id).pipe(
      tap((res: any) => {
        this.logFrontendActivity('GET_DATA_SOURCE_BY_ID', 'SUCCESS', startTime, { id }, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('GET_DATA_SOURCE_BY_ID', 'ERROR', startTime, { id }, null, err);
        throw err;
      })
    )
  }

  postDataSource(datasource: any): Observable<any> {
    const startTime = Date.now();
    return this.http.post(this.post_data_source, datasource).pipe(
      tap((res: any) => {
        this.logFrontendActivity('POST_DATA_SOURCE', 'SUCCESS', startTime, datasource, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('POST_DATA_SOURCE', 'ERROR', startTime, datasource, null, err);
        throw err;
      })
    )
  }


  putDataSource(updated_datasource: any, id: any): Observable<any> {
    const startTime = Date.now();
    return this.http.put(`${this.put_data_source}/${id}`, updated_datasource).pipe(
      tap((res: any) => {
        this.logFrontendActivity('PUT_DATA_SOURCE', 'SUCCESS', startTime, { id, ...updated_datasource }, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('PUT_DATA_SOURCE', 'ERROR', startTime, { id, ...updated_datasource }, null, err);
        throw err;
      })
    )
  }


  deleteDataSource(id: any): Observable<any> {
    const startTime = Date.now();
    return this.http.delete(`${this.delete_data_source}/${id}`).pipe(
      tap((res: any) => {
        this.logFrontendActivity('DELETE_DATA_SOURCE', 'SUCCESS', startTime, { id }, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('DELETE_DATA_SOURCE', 'ERROR', startTime, { id }, null, err);
        throw err;
      })
    )
  }

  private logFrontendActivity(action: string, status: 'SUCCESS' | 'ERROR', startTime: number, requestData?: any, responseData?: any, error?: any) {
    const responseTime = Date.now() - startTime;
    console.log(`[DATASOURCE_ADMIN_FRONTEND] ${action} - ${status}`, {
      action,
      status,
      responseTime: `${responseTime}ms`,
      module: this.loggingService.MODULES.DATASOURCE_ADMIN,
      requestData: requestData ? JSON.stringify(requestData).substring(0, 200) : null,
      responseData: responseData ? `Status: ${responseData.token || 'N/A'}` : null,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    });
  }

}
