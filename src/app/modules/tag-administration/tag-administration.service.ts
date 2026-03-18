import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { TagSearchService } from './services/tag-search.service';
import { EntityService } from './services/entity.service';
import { InstanceService } from './services/instance.service';

/**
 * TagAdministrationService acts as a facade for all tag administration operations.
 * This service delegates calls to specialized services (TagSearchService, EntityService, InstanceService)
 * to maintain separation of concerns and better code organization.
 *
 * This follows the facade pattern similar to calculation-engine module.
 */
@Injectable({
  providedIn: 'root'
})
export class TagAdministrationService extends BaseApiService {

  // Inject specialized services
  private tagSearchService = inject(TagSearchService);
  private entityService = inject(EntityService);
  private instanceService = inject(InstanceService);

  // ==================== Tag Search Operations ====================

  /**
   * Fetches tag search results for a specific attribute ID.
   * Delegates to TagSearchService.
   *
   * @param {string} attributeId - The ID of the attribute to search tags for.
   * @returns {Observable<any>} - An Observable that emits the server's response containing:
   *   - calculationData: Array of calculation records
   *   - correlationData: Array of correlation records
   *   - activityData: Array of activity/template records
   *   - idtData: Array of IDT template records
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getTagSearchResults(attributeId: string): Observable<any> {
    return this.tagSearchService.getTagSearchResults(attributeId);
  }

  /**
   * Fetches calculation data for a specific attribute.
   * Delegates to TagSearchService.
   */
  getCalculationData(attributeId: string): Observable<any> {
    return this.tagSearchService.getCalculationData(attributeId);
  }

  /**
   * Fetches correlation data for a specific attribute.
   * Delegates to TagSearchService.
   */
  getCorrelationData(attributeId: string): Observable<any> {
    return this.tagSearchService.getCorrelationData(attributeId);
  }

  /**
   * Fetches activity/template data for a specific attribute.
   * Delegates to TagSearchService.
   */
  getActivityData(attributeId: string): Observable<any> {
    return this.tagSearchService.getActivityData(attributeId);
  }

  /**
   * Fetches IDT template data for a specific attribute.
   * Delegates to TagSearchService.
   */
  getIdtData(attributeId: string): Observable<any> {
    return this.tagSearchService.getIdtData(attributeId);
  }

  // ==================== Entity Operations ====================

  /**
   * Fetches the list of entities based on filter parameters.
   * Delegates to EntityService.
   *
   * @param {any} payload - payload to specify the filter parameters (appId, orgId)
   * @returns {Observable<any>} - An Observable of the response containing entity data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getEntityList(payload: any): Observable<any> {
    return this.entityService.getEntityList(payload);
  }

  /**
   * Fetches details of a specific entity by its ID.
   * Delegates to EntityService.
   *
   * @param {string} entityId - The ID of the entity to fetch details for.
   * @returns {Observable<any>} - An Observable that emits the entity details including its attributes.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getEntityDetailsById(entityId: string): Observable<any> {
    return this.entityService.getEntityDetailsById(entityId);
  }

  /**
   * Fetches only the attributes of a specific entity.
   * Delegates to EntityService.
   */
  getEntityAttributes(entityId: string): Observable<any> {
    return this.entityService.getEntityAttributes(entityId);
  }

  /**
   * Creates a new entity.
   * Delegates to EntityService.
   *
   * @param {any} payload - The entity data to be created.
   * @returns {Observable<any>} - An Observable that emits the server's response.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  createEntity(payload: any): Observable<any> {
    return this.entityService.createEntity(payload);
  }

  /**
   * Updates an existing entity.
   * Delegates to EntityService.
   *
   * @param {any} payload - The entity data to be updated (must include entityId).
   * @returns {Observable<any>} - An Observable that emits the server's response.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  updateEntity(payload: any): Observable<any> {
    return this.entityService.updateEntity(payload);
  }

  searchEntityList(payload: any): Observable<any> {
    return this.entityService.searchEntity(payload);
  }

  // ==================== Instance Operations ====================

  /**
   * Fetches the list of instances based on filter parameters.
   * Delegates to InstanceService.
   *
   * @param {any} payload - payload to specify the filter parameters (appId, orgId)
   * @returns {Observable<any>} - An Observable of the response containing instance data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getInstanceList(payload: any): Observable<any> {
    return this.instanceService.getInstanceList(payload);
  }

  /**
   * Fetches details of a specific instance by its ID.
   * Delegates to InstanceService.
   *
   * @param {string} instanceId - The ID of the instance to fetch details for.
   * @returns {Observable<any>} - An Observable that emits the instance details including its attributes.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getInstanceDetailsById(instanceId: string): Observable<any> {
    return this.instanceService.getInstanceDetailsById(instanceId);
  }

  /**
   * Fetches only the attributes of a specific instance.
   * Delegates to InstanceService.
   */
  getInstanceAttributes(instanceId: string): Observable<any> {
    return this.instanceService.getInstanceAttributes(instanceId);
  }

  /**
   * Creates a new instance.
   * Delegates to InstanceService.
   *
   * @param {any} payload - The instance data to be created.
   * @returns {Observable<any>} - An Observable that emits the server's response.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  createInstance(payload: any): Observable<any> {
    return this.instanceService.createInstance(payload);
  }

  /**
   * Updates an existing instance.
   * Delegates to InstanceService.
   *
   * @param {any} payload - The instance data to be updated (must include instanceId).
   * @returns {Observable<any>} - An Observable that emits the server's response.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  updateInstance(payload: any): Observable<any> {
    return this.instanceService.updateInstance(payload);
  }

  searchInstanceList(payload: any): Observable<any> {
    return this.instanceService.searchInstance(payload);
  }

  // ==================== Calculation Operations ====================

  getCalculation(payload: any): Observable<any> {
    return this.http.post(this.baseUrl + 'calculation/getCalculation', payload || {});
  }

  postCalculation(payload: any): Observable<any> {
    return this.http.post(this.baseUrl + 'calculation/postCaclculation', payload);
  }

  putCalculation(payload: any, id: string): Observable<any> {
    return this.http.post(this.baseUrl + 'calculation/postNewCalcEngine', { ...payload, id });
  }

  deleteCalculation(id: string): Observable<any> {
    return this.http.get(this.baseUrl + 'calculation/deleteCalculation/' + id);
  }

  // ==================== Correlation Operations ====================

  getCorrelation(payload: any): Observable<any> {
    return this.http.post(this.baseUrl + 'correlation/getCorrelationList', payload || {});
  }

  postCorrelation(payload: any): Observable<any> {
    return this.http.post(this.baseUrl + 'correlation/postCorrelation', payload);
  }

  putCorrelation(payload: any, id: string): Observable<any> {
    return this.http.post(this.baseUrl + 'correlation/postCorrelation', { ...payload, id });
  }

  deleteCorrelation(id: string): Observable<any> {
    return this.http.get(this.baseUrl + 'correlation/deleteCorrelation/' + id);
  }

  // ==================== Activity Operations ====================

  getActivity(payload: any): Observable<any> {
    return this.http.post(this.baseUrl + 'activity/getActivityTemplate', payload || {});
  }

  postActivity(payload: any): Observable<any> {
    return this.http.post(this.baseUrl + 'activity/postActivityTemplate', payload);
  }

  putActivity(payload: any, id: string): Observable<any> {
    return this.http.post(this.baseUrl + 'activity/postActivityTemplate', { ...payload, id });
  }

  deleteActivity(id: string): Observable<any> {
    return this.http.get(this.baseUrl + 'activity/deleteActivity/' + id);
  }

  // ==================== IDT Operations ====================

  getIdt(payload: any): Observable<any> {
    return this.http.post(this.baseUrl + 'idt/getIdtList', payload || {});
  }

  postIDT(payload: any): Observable<any> {
    return this.http.post(this.baseUrl + 'idt/postIdt', payload);
  }

  putIDT(payload: any, id: string): Observable<any> {
    return this.http.post(this.baseUrl + 'idt/updateIdt', { ...payload, id });
  }

  deleteIDT(id: string): Observable<any> {
    return this.http.get(this.baseUrl + 'idt/deleteIdt/' + id);
  }
}
