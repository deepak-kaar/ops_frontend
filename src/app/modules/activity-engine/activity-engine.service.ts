import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';

/**
 * @service ActivityEngineService
 * This service manages the http backend calls for the activity engine module.
 */
@Injectable({
  providedIn: 'root'
})
export class ActivityEngineService extends BaseApiService {

  /**
   * Fetches the list of function models.
   * @param {any} filters - The filters to apply to the request.
   * @returns {Observable<any>} An Observable of the response containing all the function models.
   */
  getFunctionModels(filters: any): Observable<any> {
    return this.post(API_ENDPOINTS.ACTIVITY_ENGINE.FUNCTION_MODELS.GET_LIST, filters).pipe(
      map((res: any) => {
        return res.activityFMs;
      }),
    );
  }

  /**
  * Fetches a function model by its ID.
  * @param {string} fmId - The ID of the function model to fetch.
  * @returns {Observable<any>} An Observable of the response containing the function model.
  */
  getActivityFM(fmId: string): Observable<any> {
    return this.get(API_ENDPOINTS.ACTIVITY_ENGINE.FUNCTION_MODELS.GET_FM + fmId)
  }

  /**
   * Creates a function model.
   * @param {any} payload - The payload to send to the server.
   * @returns {Observable<any>} An Observable of the response containing the created function model.
   */
  createFunctionModel(payload: any): Observable<any> {
    return this.post(API_ENDPOINTS.ACTIVITY_ENGINE.FUNCTION_MODELS.CREATE_FM, payload);
  }


  /**
   * Fetches the list of activity steps.
   * @param {any} filters - The filters to apply to the request.
   * @returns {Observable<any>} An Observable of the response containing all the activity steps.
   */
  getSteps(filters: any): Observable<any> {
    return this.post(API_ENDPOINTS.ACTIVITY_ENGINE.STEPS.GET_LIST, filters).pipe(
      map((res: any) => {
        return res.activitySteps;
      }),
    );
  }

  /**
   * Creates an activity step.
   * @param {any} payload - The payload to send to the server.
   * @returns {Observable<any>} An Observable of the response containing the created activity step.
   */
  createStep(payload: any): Observable<any> {
    return this.post(API_ENDPOINTS.ACTIVITY_ENGINE.STEPS.CREATE_STEP, payload);
  }

  /**
   * Fetches the list of activity templates.
   * @param {any} filters - The filters to apply to the request.
   * @returns {Observable<any>} An Observable of the response containing all the activity templates.
   */
  getTemplates(filters: any): Observable<any> {
    return this.post(API_ENDPOINTS.ACTIVITY_ENGINE.TEMPLATE.GET_LIST, filters).pipe(
      map((res: any) => {
        return res.activityTemplates;
      }),
    );
  }

  /**
   * Creates an activity template.
   * @param {any} payload - The payload to send to the server.
   * @returns {Observable<any>} An Observable of the response containing the created activity template.
   */
  createTemplate(payload: any): Observable<any> {
    return this.post(API_ENDPOINTS.ACTIVITY_ENGINE.TEMPLATE.CREATE, payload);
  }

  /**
   * Fetches an activity template by its ID.
   * @param {string} templateId - The ID of the activity template to fetch.
   * @returns {Observable<any>} An Observable of the response containing the activity template.
   */
  // getTemplate(templateId: string): Observable<any> {
  //   return this.get(API_ENDPOINTS.ACTIVITY_ENGINE.TEMPLATE.GET_TEMPLATE + templateId);
  // }

  /**
   * Updates an activity template.
   * @param {any} payload - The payload to send to the server.
   * @returns {Observable<any>} An Observable of the response containing the updated activity template.
   */
  // updateTemplate(payload: any): Observable<any> {
  //   return this.put(API_ENDPOINTS.ACTIVITY_ENGINE.TEMPLATE.UPDATE, payload);
  // }

  /**
   * Fetches the list of activity instances.
   * @param {any} filters - The filters to apply to the request.
   * @returns {Observable<any>} An Observable of the response containing all the activity instances.
   */
  getInstances(filters: any): Observable<any> {
    return this.post(API_ENDPOINTS.ACTIVITY_ENGINE.INSTANCES.GET_LIST, filters).pipe(
      map((res: any) => {
        return res.activityInstances;
      }),
    );
  }

  /**
  * Create an activity instances.
  * @param {any} payload - The payload to be passed in order to create an instance.
  * @returns {Observable<any>} An Observable of the response for the creation of activity instance.
  */
  createInstance(payload: any): Observable<any> {
    return this.post(API_ENDPOINTS.ACTIVITY_ENGINE.INSTANCES.CREATE, payload);
  }


  getInstanceStatus(instanceId: string): Observable<any> {
    return this.connectSSE(API_ENDPOINTS.ACTIVITY_ENGINE.INSTANCES.GET_QUEUE + instanceId);
  }
}
