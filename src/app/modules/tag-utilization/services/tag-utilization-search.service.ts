import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, timeout, catchError } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

/**
 * TagUtilizationSearchService handles all API calls related to tag utilization search operations.
 * This service extends BaseApiService to leverage common HTTP operations and error handling.
 */
@Injectable({
  providedIn: 'root'
})
export class TagUtilizationSearchService extends BaseApiService {

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;

  // API endpoint URLs
  private tagSearchValuesUrl: string = this.baseUrl + 'tagSearch/getTagsValues';

  /**
   * Fetches tag utilization data based on date range and optional filters.
   *
   * @param {any} params - Query parameters containing:
   *   - fromDate: Start date (required, format: yyyy-MM-dd)
   *   - toDate: End date (required, format: yyyy-MM-dd)
   *   - appId: Application ID (optional)
   *   - orgId: Organization ID (optional)
   * @returns {Observable<any>} - An Observable that emits the server's response containing:
   *   - calculationData: Array of calculation usage records
   *   - correlationData: Array of correlation usage records
   *   - activityData: Array of activity/template usage records
   *   - idtData: Array of IDT template usage records
   * @throws {Error} Throws an error if the request fails or times out after 20 seconds.
   *
   * @example
   * const params = {
   *   fromDate: '2024-01-01',
   *   toDate: '2024-01-31',
   *   appId: 'app123',
   *   orgId: 'org456'
   * };
   * this.tagUtilSearchService.getTagSearchValues(params).subscribe({
   *   next: (response) => {
   *     if (response?.isData && response?.searchResults) {
   *       const { calculationData, correlationData, activityData, idtData } = response.searchResults;
   *       // Process the data
   *     }
   *   },
   *   error: (err) => console.error('Failed to fetch tag utilization data:', err)
   * });
   */
  getTagSearchValues(params: { fromDate: string; toDate: string; appId?: string; orgId?: string }): Observable<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('fromDate', params.fromDate);
    queryParams.append('toDate', params.toDate);

    if (params.appId) {
      queryParams.append('appId', params.appId);
    }
    if (params.orgId) {
      queryParams.append('orgId', params.orgId);
    }

    const url = `${this.tagSearchValuesUrl}?${queryParams.toString()}`;

    return this.http.get<any>(url).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error fetching tag search values:', err);
        throw err;
      })
    );
  }

  /**
   * Fetches calculation utilization data for a specific date range.
   *
   * @param {any} params - Query parameters (fromDate, toDate, appId, orgId)
   * @returns {Observable<any>} - An Observable containing calculation utilization data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getCalculationUtilization(params: { fromDate: string; toDate: string; appId?: string; orgId?: string }): Observable<any> {
    return this.getTagSearchValues(params).pipe(
      map((res: any) => {
        return res?.searchResults?.calculationData || [];
      })
    );
  }

  /**
   * Fetches correlation utilization data for a specific date range.
   *
   * @param {any} params - Query parameters (fromDate, toDate, appId, orgId)
   * @returns {Observable<any>} - An Observable containing correlation utilization data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getCorrelationUtilization(params: { fromDate: string; toDate: string; appId?: string; orgId?: string }): Observable<any> {
    return this.getTagSearchValues(params).pipe(
      map((res: any) => {
        return res?.searchResults?.correlationData || [];
      })
    );
  }

  /**
   * Fetches activity/template utilization data for a specific date range.
   *
   * @param {any} params - Query parameters (fromDate, toDate, appId, orgId)
   * @returns {Observable<any>} - An Observable containing activity utilization data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getActivityUtilization(params: { fromDate: string; toDate: string; appId?: string; orgId?: string }): Observable<any> {
    return this.getTagSearchValues(params).pipe(
      map((res: any) => {
        return res?.searchResults?.activityData || [];
      })
    );
  }

  /**
   * Fetches IDT template utilization data for a specific date range.
   *
   * @param {any} params - Query parameters (fromDate, toDate, appId, orgId)
   * @returns {Observable<any>} - An Observable containing IDT utilization data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getIdtUtilization(params: { fromDate: string; toDate: string; appId?: string; orgId?: string }): Observable<any> {
    return this.getTagSearchValues(params).pipe(
      map((res: any) => {
        return res?.searchResults?.idtData || [];
      })
    );
  }

  /**
   * Helper method to format Date object to yyyy-MM-dd string.
   *
   * @param {Date} date - The date to format
   * @returns {string} - Formatted date string in yyyy-MM-dd format
   */
  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  private auditTrailUrl = this.baseUrl + 'tagSearch/getAuditTrail';



}
