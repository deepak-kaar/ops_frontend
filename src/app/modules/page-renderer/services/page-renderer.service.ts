import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, timeout, catchError } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PageRendererService extends BaseApiService {

  /**
   * Fetches mapping data using a POST request
   * @param payload - The request payload to send
   * @returns Observable with the mapping response
   */
  getmapping(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.GLOBAL_RENDERER.GET_MAPPING, payload);
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
   * Generates a PDF from HTML content
   * @param payload - HTML content as string
   * @returns Observable with Blob response (PDF file)
   */
  generateReport(payload: string): Observable<Blob> {
    const endpoint = API_ENDPOINTS.REPORT_RENDERER.generateReport;
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    return this.http.post(url, payload, {
      headers: new HttpHeaders({
        'Content-Type': 'text/html',
      }),
      responseType: 'blob',
    }).pipe(
      timeout(20000),
      catchError((err) => {
        console.error('Error fetching PDF:', err);
        throw err;
      })
    );
  }

    /**
   * Posts the last generated pdf as mail
   * @param payload - JSON payload for mail metadata
   * @returns Status Message
   */
  postMail(payload: any): Observable<any> {
    const endpoint = API_ENDPOINTS.REPORT_RENDERER.mailReport;
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    return this.http.post(url, payload, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    }).pipe(
      timeout(20000),
      catchError((err) => {
        console.error('Error sending PDF in mail:', err);
        throw err;
      })
    );
  }

  storeReport(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.REPORT_RENDERER.storeReport, payload);
  }
}
