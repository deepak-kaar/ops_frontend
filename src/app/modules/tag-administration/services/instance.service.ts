import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, timeout, catchError } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

/**
 * InstanceService handles all API calls related to instance operations.
 * This service extends BaseApiService to leverage common HTTP operations and error handling.
 */
@Injectable({
  providedIn: 'root'
})
export class InstanceService extends BaseApiService {

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;

  // API endpoint URLs
  private instanceListUrl: string = this.baseUrl + 'instance/getInstance';
  private searchInstanceListUrl: string = this.baseUrl + 'instance/searchInstance';
  private instanceDetailsUrl: string = this.baseUrl + 'instance/getInstance/';
  private createInstanceUrl: string = this.baseUrl + 'instance/createInstance';
  private updateInstanceUrl: string = this.baseUrl + 'instance/updateInstance';

  /**
   * Fetches the list of instances based on filter parameters.
   *
   * @param {any} payload - payload to specify the filter parameters (appId, orgId)
   * @returns {Observable<any>} - An Observable of the response containing instance data.
   * @throws {Error} Throws an error if the request fails or times out.
   *
   * @example
   * const payload = { appId: 'app123', orgId: 'org456' };
   * this.instanceService.getInstanceList(payload).subscribe({
   *   next: (res) => {
   *     const instances = res.Instances;
   *     // Process instances
   *   },
   *   error: (err) => console.error('Failed to fetch instances:', err)
   * });
   */
  getInstanceList(payload: any): Observable<any> {
    return this.http.post(this.instanceListUrl, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error fetching instance list:', err);
        throw err;
      })
    );
  }

  searchInstance(payload: any): Observable<any> {
    return this.http.post(this.searchInstanceListUrl, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error fetching instance list:', err);
        throw err;
      })
    );
  }

  /**
   * Fetches details of a specific instance by its ID, including all its attributes.
   *
   * @param {string} instanceId - The ID of the instance to fetch details for.
   * @returns {Observable<any>} - An Observable that emits the instance details including its attributes.
   * @throws {Error} Throws an error if the request fails or times out.
   *
   * @example
   * this.instanceService.getInstanceDetailsById('instance123').subscribe({
   *   next: (res) => {
   *     const attributes = res.attributes;
   *     // Process instance attributes
   *   },
   *   error: (err) => console.error('Failed to fetch instance details:', err)
   * });
   */
  getInstanceDetailsById(instanceId: string): Observable<any> {
    return this.http.get(`${this.instanceDetailsUrl}${instanceId}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error fetching instance details:', err);
        throw err;
      })
    );
  }

  /**
   * Fetches only the attributes of a specific instance.
   *
   * @param {string} instanceId - The ID of the instance.
   * @returns {Observable<any>} - An Observable containing the instance's attributes.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getInstanceAttributes(instanceId: string): Observable<any> {
    return this.getInstanceDetailsById(instanceId).pipe(
      map((res: any) => {
        return res.attributes || [];
      })
    );
  }

  /**
   * Creates a new instance.
   *
   * @param {any} payload - The instance data to be created.
   * @returns {Observable<any>} - An Observable that emits the server's response.
   * @throws {Error} Throws an error if the request fails or times out.
   *
   * @example
   * const instanceData = {
   *   instanceName: 'New Instance',
   *   instanceDesc: 'Description',
   *   appId: 'app123',
   *   orgId: 'org456'
   * };
   * this.instanceService.createInstance(instanceData).subscribe({
   *   next: (res) => console.log('Instance created successfully'),
   *   error: (err) => console.error('Failed to create instance:', err)
   * });
   */
  createInstance(payload: any): Observable<any> {
    return this.http.post(this.createInstanceUrl, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error creating instance:', err);
        throw err;
      })
    );
  }

  /**
   * Updates an existing instance.
   *
   * @param {any} payload - The instance data to be updated (must include instanceId).
   * @returns {Observable<any>} - An Observable that emits the server's response.
   * @throws {Error} Throws an error if the request fails or times out.
   *
   * @example
   * const updateData = {
   *   instanceId: 'instance123',
   *   instanceName: 'Updated Instance Name',
   *   instanceDesc: 'Updated Description'
   * };
   * this.instanceService.updateInstance(updateData).subscribe({
   *   next: (res) => console.log('Instance updated successfully'),
   *   error: (err) => console.error('Failed to update instance:', err)
   * });
   */
  updateInstance(payload: any): Observable<any> {
    return this.http.post(this.updateInstanceUrl, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error updating instance:', err);
        throw err;
      })
    );
  }
}
