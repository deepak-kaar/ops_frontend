import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { TagUtilizationSearchService } from './services/tag-utilization-search.service';
import { environment } from 'src/environments/environment';

/**
 * TagUtilizationService acts as a facade for all tag utilization operations.
 * This service delegates calls to specialized services (TagUtilizationSearchService)
 * to maintain separation of concerns and better code organization.
 *
 * This follows the facade pattern similar to calculation-engine and tag-administration modules.
 */
@Injectable({
  providedIn: 'root'
})
export class TagUtilizationService extends BaseApiService {
  getApps(): Observable<any> {
    return this.http.get(environment.apiUrl + "app/getApp");
  }

  getOrgsByAppId(appId: string): Observable<any> {
    return this.http.get(environment.apiUrl + "organization/getOrgByAppId/" + appId);
  }




  // Inject specialized services
  private tagUtilSearchService = inject(TagUtilizationSearchService);

  // ==================== Tag Utilization Search Operations ====================

  /**
   * Fetches tag utilization data based on date range and optional filters.
   * Delegates to TagUtilizationSearchService.
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
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getTagSearchValues(params: { fromDate: string; toDate: string; appId?: string; orgId?: string }): Observable<any> {
    return this.tagUtilSearchService.getTagSearchValues(params);
  }

  /**
   * Fetches calculation utilization data for a specific date range.
   * Delegates to TagUtilizationSearchService.
   */
  getCalculationUtilization(params: { fromDate: string; toDate: string; appId?: string; orgId?: string }): Observable<any> {
    return this.tagUtilSearchService.getCalculationUtilization(params);
  }

  /**
   * Fetches correlation utilization data for a specific date range.
   * Delegates to TagUtilizationSearchService.
   */
  getCorrelationUtilization(params: { fromDate: string; toDate: string; appId?: string; orgId?: string }): Observable<any> {
    return this.tagUtilSearchService.getCorrelationUtilization(params);
  }

  /**
   * Fetches activity/template utilization data for a specific date range.
   * Delegates to TagUtilizationSearchService.
   */
  getActivityUtilization(params: { fromDate: string; toDate: string; appId?: string; orgId?: string }): Observable<any> {
    return this.tagUtilSearchService.getActivityUtilization(params);
  }

  /**
   * Fetches IDT template utilization data for a specific date range.
   * Delegates to TagUtilizationSearchService.
   */
  getIdtUtilization(params: { fromDate: string; toDate: string; appId?: string; orgId?: string }): Observable<any> {
    return this.tagUtilSearchService.getIdtUtilization(params);
  }

  /**
   * Helper method to format Date object to yyyy-MM-dd string.
   * Delegates to TagUtilizationSearchService.
   *
   * @param {Date} date - The date to format
   * @returns {string} - Formatted date string in yyyy-MM-dd format
   */
  formatDate(date: Date): string {
    return this.tagUtilSearchService.formatDate(date);
  }
}
