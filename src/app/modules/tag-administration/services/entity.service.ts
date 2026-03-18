import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, timeout, catchError } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

/**
 * EntityService handles all API calls related to entity operations.
 * This service extends BaseApiService to leverage common HTTP operations and error handling.
 */
@Injectable({
  providedIn: 'root'
})
export class EntityService extends BaseApiService {

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;

  // API endpoint URLs
  private entityListUrl: string = this.baseUrl + 'entity/getEntity';
  private searchEntityUrl: string = this.baseUrl + 'entity/searchEntity';
  private entityDetailsUrl: string = this.baseUrl + 'entity/getEntity/';
  private createEntityUrl: string = this.baseUrl + 'entity/createEntity';
  private updateEntityUrl: string = this.baseUrl + 'entity/updateEntity';

  /**
   * Fetches the list of entities based on filter parameters.
   *
   * @param {any} payload - payload to specify the filter parameters (appId, orgId)
   * @returns {Observable<any>} - An Observable of the response containing entity data.
   * @throws {Error} Throws an error if the request fails or times out.
   *
   * @example
   * const payload = { appId: 'app123', orgId: 'org456' };
   * this.entityService.getEntityList(payload).subscribe({
   *   next: (res) => {
   *     const entities = res.Entity_Attributes;
   *     // Process entities
   *   },
   *   error: (err) => console.error('Failed to fetch entities:', err)
   * });
   */
  getEntityList(payload: any): Observable<any> {
    return this.http.post(this.entityListUrl, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error fetching entity list:', err);
        throw err;
      })
    );
  }


  searchEntity(payload: any): Observable<any> {
    return this.http.post(this.searchEntityUrl, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error fetching entity list:', err);
        throw err;
      })
    );
  }


  /**
   * Fetches details of a specific entity by its ID, including all its attributes.
   *
   * @param {string} entityId - The ID of the entity to fetch details for.
   * @returns {Observable<any>} - An Observable that emits the entity details including its attributes.
   * @throws {Error} Throws an error if the request fails or times out.
   *
   * @example
   * this.entityService.getEntityDetailsById('entity123').subscribe({
   *   next: (res) => {
   *     const attributes = res.attributes;
   *     // Process entity attributes
   *   },
   *   error: (err) => console.error('Failed to fetch entity details:', err)
   * });
   */
  getEntityDetailsById(entityId: string): Observable<any> {
    return this.http.get(`${this.entityDetailsUrl}${entityId}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error fetching entity details:', err);
        throw err;
      })
    );
  }

  /**
   * Fetches only the attributes of a specific entity.
   *
   * @param {string} entityId - The ID of the entity.
   * @returns {Observable<any>} - An Observable containing the entity's attributes.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getEntityAttributes(entityId: string): Observable<any> {
    return this.getEntityDetailsById(entityId).pipe(
      map((res: any) => {
        return res.attributes || [];
      })
    );
  }

  /**
   * Creates a new entity.
   *
   * @param {any} payload - The entity data to be created.
   * @returns {Observable<any>} - An Observable that emits the server's response.
   * @throws {Error} Throws an error if the request fails or times out.
   *
   * @example
   * const entityData = {
   *   entityName: 'New Entity',
   *   entityDesc: 'Description',
   *   appId: 'app123',
   *   orgId: 'org456'
   * };
   * this.entityService.createEntity(entityData).subscribe({
   *   next: (res) => console.log('Entity created successfully'),
   *   error: (err) => console.error('Failed to create entity:', err)
   * });
   */
  createEntity(payload: any): Observable<any> {
    return this.http.post(this.createEntityUrl, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error creating entity:', err);
        throw err;
      })
    );
  }

  /**
   * Updates an existing entity.
   *
   * @param {any} payload - The entity data to be updated (must include entityId).
   * @returns {Observable<any>} - An Observable that emits the server's response.
   * @throws {Error} Throws an error if the request fails or times out.
   *
   * @example
   * const updateData = {
   *   entityId: 'entity123',
   *   entityName: 'Updated Entity Name',
   *   entityDesc: 'Updated Description'
   * };
   * this.entityService.updateEntity(updateData).subscribe({
   *   next: (res) => console.log('Entity updated successfully'),
   *   error: (err) => console.error('Failed to update entity:', err)
   * });
   */
  updateEntity(payload: any): Observable<any> {
    return this.http.post(this.updateEntityUrl, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        console.error('Error updating entity:', err);
        throw err;
      })
    );
  }
}
