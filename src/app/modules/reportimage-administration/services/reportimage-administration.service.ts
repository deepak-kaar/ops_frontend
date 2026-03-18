import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportimageAdministrationService extends BaseApiService{

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url

  get_reportImages: string = this.baseUrl + 'report_image/reportImage';
  post_reportImage: string = this.baseUrl + 'report_image/reportImage';
  put_reportImage: string = this.baseUrl + 'report_image/reportImage';
  delete_reportImage: string = this.baseUrl + 'report_image/reportImage';
  get_attachment: string = this.baseUrl + 'report_image/file';

  getReportImages(params?: any): Observable<any> {
    return this.http.get(this.get_reportImages, { params }).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  getReportImagesById(id: any): Observable<any> {
    return this.http.get(this.get_reportImages + id).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  postReportImage(data: any): Observable<any> {
    return this.http.post(this.post_reportImage, data).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  putReportImage(updated_data: any, id: any): Observable<any> {
    return this.http.post(`${this.put_reportImage}/${id}`, updated_data).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  deleteReportImage(id: any): Observable<any> {
    return this.http.delete(`${this.delete_reportImage}/${id}`).pipe(
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

  updateReportImage(data: any): Observable<any> {
    const { reportImageId, formData } = data;
    const payload = formData || data;
    
    return this.http.put(`${this.put_reportImage}/${reportImageId}`, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  getAttachmentByFileName(filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}report_image/file/by-name/${filename}`, {
      responseType: 'blob'
    });
  }
}

