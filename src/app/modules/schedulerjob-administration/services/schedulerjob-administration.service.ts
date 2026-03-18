import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SchedulerjobAdministrationService extends BaseApiService {

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url

  get_schedulerJob: string = this.baseUrl + 'schedulerjob/getJobs';
  post_schedulerJob: string = this.baseUrl + 'schedulerjob/postJob';
  put_schedulerJob: string = this.baseUrl + 'schedulerjob/updateJob';
  delete_schedulerJob: string = this.baseUrl + 'schedulerjob/deleteJob';

  getJobs(params?: any): Observable<any> {
    return this.http.get(this.get_schedulerJob, { params }).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  getJobById(id: any): Observable<any> {
    return this.http.get(this.get_schedulerJob + id).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  postJob(schedulerData: any): Observable<any> {
    return this.http.post(this.post_schedulerJob, schedulerData).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  putJob(updated_scheduler_data: any, id: any): Observable<any> {
    return this.http.post(`${this.put_schedulerJob}/${id}`, updated_scheduler_data).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  deleteJob(id: any): Observable<any> {
    return this.http.get(`${this.delete_schedulerJob}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }
}
