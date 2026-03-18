import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportGenAdministrationService extends BaseApiService{
 override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url
  get_org_list_by_app: string = this.baseUrl + 'organization/getOrgByAppId/' // string to store the get orgs list by app id url

  get_schedulerJob: string = this.baseUrl + 'schedulerjob/getJobs';
  post_schedulerJob: string = this.baseUrl + 'schedulerjob/postJob';
  put_schedulerJob: string = this.baseUrl + 'schedulerjob/updateJob';
  delete_schedulerJob: string = this.baseUrl + 'schedulerjob/deleteJob';
  delete_schedulerJobMapping: string = this.baseUrl + 'schedulerjob/deleteJobMapping'

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

  updateJobMapping(payload: any): Observable<any> {
  return this.http.post(`${this.delete_schedulerJobMapping}`, payload).pipe(
    map((res: any) => {
      return res;
    }),
    timeout(20000),
    catchError((err) => {
      throw err;
    })
  );
}
  /**
   * Fetches templates using a POST request (for Reports page)
   * @param payload - The request payload to send
   * @returns Observable with the templates response
   */
  getTemplates(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.GLOBAL_RENDERER.GET_TEMPLATES, payload);
  }

   /**
   * Fetches the list of orgs by application id.
   *
   * @param {string} appId - Application Id.
   * @returns An Observable of the response containing all the orgs for the application id provided.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getOrgsByApp(appId: string): Observable<any> {
    return this.http.get(this.get_org_list_by_app + appId).pipe(
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
