import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailAdministrationService extends BaseApiService {

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url

  get_emails: string = this.baseUrl + 'email/getEmail';
  post_email: string = this.baseUrl + 'email/postEmail';
  put_email: string = this.baseUrl + 'email/updateEmail';
  delete_email: string = this.baseUrl + 'email/deleteEmail';
  get_attachment: string = this.baseUrl + 'email/attachment';

  getEmails(params?: any): Observable<any> {
    return this.http.get(this.get_emails, { params }).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  getEmailsById(id: any): Observable<any> {
    return this.http.get(`${this.get_emails}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  postEmail(data: any): Observable<any> {
    return this.http.post(this.post_email, data).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  putEmail(updated_data: any, id: any): Observable<any> {
    return this.http.post(`${this.put_email}/${id}`, updated_data).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  deleteEmail(id: any): Observable<any> {
    return this.http.get(`${this.delete_email}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  downloadAttachment(fileId:any): Observable<Blob>{
    return this.http.get(`${this.get_attachment}/${fileId}`, { responseType: 'blob' });
  }
}
