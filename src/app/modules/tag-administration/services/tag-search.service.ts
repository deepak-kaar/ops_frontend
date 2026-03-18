import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, timeout, catchError } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

/**
 * TagSearchService handles all API calls related to tag search operations.
 * This service extends BaseApiService to leverage common HTTP operations and error handling.
 */
@Injectable({
  providedIn: 'root'
})
export class TagSearchService extends BaseApiService {

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;

  // API endpoint URLs
  private tagSearchUrl: string = this.baseUrl + 'tagSearch/getTags';

  /**
   * Fetches tag search results for a specific attribute ID.
   *
   * @param {string} attributeId - The ID of the attribute to search tags for.
   * @returns {Observable<any>} - An Observable that emits the server's response containing:
   *   - calculationData: Array of calculation records
   *   - correlationData: Array of correlation records
   *   - activityData: Array of activity/template records
   *   - idtData: Array of IDT template records
   * @throws {Error} Throws an error if the request fails or times out after 20 seconds.
   *
   * @example
   * this.tagSearchService.getTagSearchResults('attr123').subscribe({
   *   next: (response) => {
   *     if (response?.isData && response?.searchResults) {
   *       const { calculationData, correlationData, activityData, idtData } = response.searchResults;
   *       // Process the data
   *     }
   *   },
   *   error: (err) => console.error('Failed to fetch tag search results:', err)
   * });
   */
  getTagSearchResults(attributeId: string): Observable<any> {
    return this.http.get<any>(`${this.tagSearchUrl}/${attributeId}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error fetching tag search results:', err);
        throw err;
      })
    );
  }

  /**
   * Fetches calculation data for a specific attribute.
   *
   * @param {string} attributeId - The ID of the attribute.
   * @returns {Observable<any>} - An Observable containing calculation data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getCalculationData(attributeId: string): Observable<any> {
    return this.getTagSearchResults(attributeId).pipe(
      map((res: any) => {
        return res?.searchResults?.calculationData || [];
      })
    );
  }

  /**
   * Fetches correlation data for a specific attribute.
   *
   * @param {string} attributeId - The ID of the attribute.
   * @returns {Observable<any>} - An Observable containing correlation data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getCorrelationData(attributeId: string): Observable<any> {
    return this.getTagSearchResults(attributeId).pipe(
      map((res: any) => {
        return res?.searchResults?.correlationData || [];
      })
    );
  }

  /**
   * Fetches activity/template data for a specific attribute.
   *
   * @param {string} attributeId - The ID of the attribute.
   * @returns {Observable<any>} - An Observable containing activity data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getActivityData(attributeId: string): Observable<any> {
    return this.getTagSearchResults(attributeId).pipe(
      map((res: any) => {
        return res?.searchResults?.activityData || [];
      })
    );
  }

  /**
   * Fetches IDT template data for a specific attribute.
   *
   * @param {string} attributeId - The ID of the attribute.
   * @returns {Observable<any>} - An Observable containing IDT data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getIdtData(attributeId: string): Observable<any> {
    return this.getTagSearchResults(attributeId).pipe(
      map((res: any) => {
        return res?.searchResults?.idtData || [];
      })
    );
  }
}
