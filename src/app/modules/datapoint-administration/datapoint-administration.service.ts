import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, timeout, catchError } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';

@Injectable({
  providedIn: 'root'
})
export class DatapointAdministrationService extends BaseApiService {


  override http = inject(HttpClient)
  override baseUrl: string = environment.apiUrl; // base api_url
  get_entity_list: string = this.baseUrl + 'entity/getEntity'; // url to fetch the entity list
  get_instance_list: string = this.baseUrl + 'instance/getInstance'; // url to fetch the Instance list
  get_datapoint: string = this.baseUrl + 'datapoint/getDatapoint'; // url to fetch the datapoint list
  get_app_list: string = this.baseUrl + 'app/getApp'; // url to fetch the app list
  create_entity: string = this.baseUrl + 'entity/createEntity'; // url to create a entity 
  create_instance: string = this.baseUrl + 'instance/createInstance'; // url to create a Instance 
  get_attr_list: string = this.baseUrl + 'attribute/getEntityAttribute/'; // url to create a entity 
  get_org_list: string = this.baseUrl + 'organization/getOrg'; // url to get orgs
  get_attribute_list: string = this.baseUrl + 'entity/getAttributes'; // url to get attributes 
  get_template_list: string = this.baseUrl + 'template/getTemplate/'; // url to get templates
  update_entity: string = this.baseUrl + 'entity/updateEntity' // url to update a entity 
  get_entity_details: string = this.baseUrl + 'entity/getEntity/'; //url to fetch the entity details
  create_attribute: string = this.baseUrl + 'attribute/postAttr'; //url to create an attribute
  get_attribute_by_id: string = this.baseUrl + "attribute/getAttrById"; // url to get attribute id 
  update_attribute: string = this.baseUrl + 'attribute/updateAttr';
  get_idt_list: string = this.baseUrl + 'idt/getIdtList';
  get_data_entry_det: string = this.baseUrl + 'entity/getEntityDetails/';
  get_logs: string = this.baseUrl + 'entity/getLogs';
  add_entity_data: string = this.baseUrl + 'entityData/postEntityData';
  get_entity_datas: string = this.baseUrl + 'entityData/getEntityData/';
  get_entity_data: string = this.baseUrl + 'entityData/getDatabyId';
  update_entity_data: string = this.baseUrl + 'entityData/updateEntityData';
  create_notification: string = this.baseUrl + 'notification/createNotification';


  /**
 * Fetches the list of entity.
 *
 * @returns An Observable of the response containing entity data.
 * @param {any} payload - payload to specify the type of the feature
 * @throws {Error} Throws an error if the request fails or times out.
 */
  getEntityList(payload: any): Observable<any> {
    return this.http.post(this.get_entity_list, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
  * Fetches the list of instance.
  *
  * @returns An Observable of the response containing instance data.
  * @param {any} payload - payload to specify the type of the feature
  * @throws {Error} Throws an error if the request fails or times out.
  */
  getInstanceList(payload: any): Observable<any> {
    return this.http.post(this.get_instance_list, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
 * Fetches the list of datapoints.
 *
 * @returns An Observable of the response containing datapoints data.
 * @throws {Error} Throws an error if the request fails or times out.
 */
  getDataPoints(): Observable<any> {
    return this.http.get(this.get_datapoint).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
* Fetches the list of Apps.
*
* @returns An Observable of the response containing apps data.
* @param {any} payload - payload to specify the type of the feature
* @throws {Error} Throws an error if the request fails or times out.
*/
  getAppList(): Observable<any> {
    return this.http.get(this.get_app_list).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  /**
  * Sends a POST request to create a new entity.
  * @param {any} payload - The data to be sent in the POST request for creating the entity.
  * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
  * */
  createEntity(payload: any): Observable<any> {
    return this.http.post(this.create_entity, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
* Sends a POST request to create a new instance.
* @param {any} payload - The data to be sent in the POST request for creating the instance.
* @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
* */
  createInstance(payload: any): Observable<any> {
    return this.http.post(this.create_instance, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
   * Fetches the list of attribute.
   * @returns An Observable of the response containing Attributes data.
   * @param {any} entityId - payload to specify the entity Id
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getAttributeList(entityId: string): Observable<any> {
    return this.http.get(this.get_attr_list + entityId).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }


  /**
   * Fetches the list of organization.
   *
   * @returns An Observable of the response containing organization data.
   * @param {any} payload - payload to specify the type of the feature
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getOrgList(): Observable<any> {
    return this.http.get(this.get_org_list).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  /**
  * Fetches the list of attributes.
  *
  * @returns An Observable of the response containing attributes data.
  * @param {any} payload - payload to specify the type of the feature
  * @throws {Error} Throws an error if the request fails or times out.
  */
  getAttrList(payload?: any): Observable<any> {
    return this.http.post(this.get_attribute_list, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
 * Fetches the list of templates.
 *
 * @returns An Observable of the response containing all templates.
 * @throws {Error} Throws an error if the request fails or times out.
 */
  getTemplateList(payload?: any): Observable<any> {
    return this.http.post(this.get_template_list, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
* Sends a POST request to create a new entity or instance.
*
* @param {any} payload - The data to be sent in the POST request for creating the entity or instance.
* @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
*
* */
  updateEntityOrInstance(payload: any): Observable<any> {
    return this.http.post(this.update_entity, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }


  /**
   * Sends a GET request to fetch the details of particular entity.
   * @param {any} entityId - entity id to get the details of particular entity.
   * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
   */
  getEntityDetailsById(entityId: string): Observable<any> {
    return this.http.get(this.get_entity_details + entityId).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
 * Sends a POST request to create a new attribute .
 *
 * @param {any} payload - The data to be sent in the POST request for creating the attribute.
 * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
 *
 * */
  createAttribute(payload: any): Observable<any> {
    return this.http.post(this.create_attribute, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
* Fetches the data of attribute based on attribute Id.
*
* @returns An Observable of the response containing attribute data.
* @param {any} payload - payload to specify the type of the feature
* @throws {Error} Throws an error if the request fails or times out.
*/
  getAttributeData(payload: any): Observable<any> {
    return this.http.post(this.get_attribute_by_id, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
* Sends a POST request to update an attribute .
*
* @param {any} payload - The data to be sent in the POST request for updating the attribute.
* @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
*
* */
  updateAttribute(payload: any): Observable<any> {
    return this.http.post(this.update_attribute, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
 * Sends a POST request to fetch the list of reports or forms.
 * @param {any} payload - appId and templateType to get the details of IdtList.
 * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
 */
  getIdtList(payload: any): Observable<any> {
    return this.http.post(this.get_idt_list, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }


  /**
  * Sends a GET request to fetch the schema of particular entity.
  * @param {any} entityId - entity id to get the schema of particular entity.
  * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
  */
  getEntitySchemaById(entityId: string): Observable<any> {
    return this.http.get(this.get_data_entry_det + entityId).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
  * Fetches the list of entity.
  *
  * @returns An Observable of the response containing entity data.
  * @param {any} payload - payload to specify the type of the feature
  * @throws {Error} Throws an error if the request fails or times out.
  */
  getLogs(payload: any): Observable<any> {
    return this.http.post(this.get_logs, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }


  /**
 * Sends a POST request to add a new data entry to an entity.
 *
 * @param {any} payload - The data to be sent in the POST request for adding data for the entity or instance.
 * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
 *
 * */
  addEntityData(payload: any): Observable<any> {
    return this.http.post(this.add_entity_data, payload).pipe(
      map((res: any) => {

      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  /**
* Sends a GET request to fetch the datas of particular entity.
* @param {any} entityId - entity id to get the datas of particular entity.
* @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
*/
  getEntityDatasById(entityId: string): Observable<any> {
    return this.http.get(this.get_entity_datas + entityId).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
* Fetches the data of entity based on record Id.
*
* @returns An Observable of the response containing entity record data.
* @param {any} payload - payload to specify the type of the feature
* @throws {Error} Throws an error if the request fails or times out.
*/
  getEntityData(payload: any): Observable<any> {
    return this.http.post(this.get_entity_data, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  updateData(payload: any): Observable<any> {
    return this.http.post(this.update_entity_data, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  /**
  * Fetches the list of Flags.
  * Calls the http post method from base api service
  * @param {any} payload - contains the filter parameter for apps
  * @returns An Observable of the response containing all Flags.
  * @throws {Error} Throws an error if the request fails or times out.
  */
  getFlagList(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.DATAPOINT_ADMIN.FLAGS.GET_LIST, payload);
  }

  /**
   * Sends a GET request to fetch the details of particular instance by calling the get method from base api service.
   * @param {any} instanceId - instance id to get the details of particular instance.
   * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
   */
  getInstanceDetailsById(instanceId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.INSTANCE.GET_LIST + instanceId);
  }

  /**
  * Sends a POST request to update an instance.
  * Calls the http post method from base api service
  * @param {any} payload - The data to be sent in the POST request for updating the instance.
  * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
  */
  updateInstance(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.DATAPOINT_ADMIN.INSTANCE.UPDATE, payload)
  }

  /**
  * Sends a POST request to create a flag.
  * Calls the http post method from base api service
  * @param {any} payload - The data to be sent in the POST request for creating the flag.
  * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
  */
  postFlag(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.DATAPOINT_ADMIN.FLAGS.CREATE, payload)
  }

  /**
  * Sends a POST request to update a flag.
  * Calls the http post method from base api service
  * @param {any} payload - The data to be sent in the POST request for updating the flag.
  * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
  */
  updateFlag(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.DATAPOINT_ADMIN.FLAGS.UPDATE, payload)
  }

  /**
   * Fetches the details of a flag.
   * @param {string} flagId - the flagid to be sent as queryparams
   * @returns An Observable of the response containing Flag details by Id.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getFlagDetails(flagId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.FLAGS.GET_LIST + flagId);
  }

  /**
   * Sends a DELETE request to delete a flag.
   * @param {string} flagId - The flag ID to delete.
   * @returns {Observable<any>} - An Observable that emits the server's response.
   */
  deleteFlag(flagId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.FLAGS.DELETE + flagId);
  }

  /**
  * Fetches the list of events.
  * @param {any} payload - contains the filter parameter for apps
  * @returns An Observable of the response containing events data.
  * @throws {Error} Throws an error if the request fails or times out.
  */
  getEvents(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.DATAPOINT_ADMIN.EVENTS.GET_LIST, payload)
  }

  getEvent(eventId: any): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.EVENTS.GET_EVENT + eventId)
  }

  updateEvent(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.DATAPOINT_ADMIN.EVENTS.UPDATE_EVENT, payload)
  }

  deleteEvent(eventId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.EVENTS.DELETE_EVENT + eventId)
  }


  /**
   * Fetches the list of roles.
   * @param {any} payload - contains the filter parameter for apps
   * @returns An Observable of the response containing roles data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getRoles(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.ORG_ADMIN.ROLES.GET_LIST, payload)
  }

  /**
   * Fetches the list of roles.
   * @param {any} payload - contains the filter parameter for apps
   * @returns An Observable of the response containing roles data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getFilteredRoles(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.ORG_ADMIN.ROLES.GET_FILTERED_ROLES, payload)
  }

  /**
   * Sends a POST request to create a new event.
   * @param {any} payload - The data to be sent in the POST request for creating the event.
   * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
   *
   */
  postEvent(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.DATAPOINT_ADMIN.EVENTS.CREATE, payload)
  }

  /**
    * Sends a POST request to fetch the attributes based on the filter payload.
    * @param {any} payload - The filter data to be sent in the POST request for fetching the attributes.
    * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
    *
    */
  getFilteredAttributes(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.DATAPOINT_ADMIN.ATTRIBUTES.GET_FILTERED, payload)
  }

  /**
   * Sends a POST request to create a new notification.
   * @param {any} payload - The data to be sent in the POST request for creating the notification.
   * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
   *
   */
  postNotification(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.DATAPOINT_ADMIN.NOTIFICATIONS.CREATE, payload)
  }

  /**
   * Fetches the list of notifications.
   * @param {any} payload - contains the filter parameter for notifications
   * @returns An Observable of the response containing roles data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getNotications(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.DATAPOINT_ADMIN.NOTIFICATIONS.GET, payload)
  }

  /**
   * Sends a GET request to fetch the details of particular notification by calling the get method from base api service.
   * @param {any} notificationId - instance id to get the details of particular notification.
   * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
   */
  getNotification(notificationId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.NOTIFICATIONS.GET + notificationId);
  }

  /**
  * Sends a POST request to update a notification.
  * Calls the http post method from base api service
  * @param {any} payload - The data to be sent in the POST request for updating the notification.
  * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
  */
  updateNotification(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.DATAPOINT_ADMIN.NOTIFICATIONS.UPDATE, payload)
  }

  /**
  * Sends a POST request to delete a notification.
  * Calls the http post method from base api service
  * @param {any} notificationId - The data to be sent in the POST request for deleting the notification.
  * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
  */
  deleteNotification(notificationId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.NOTIFICATIONS.DELETE + notificationId)
  }

  /**
  * Sends a DELETE request to delete an entity.
  * @param {string} entityId - The entity ID to delete.
  * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
  */
  deleteEntity(entityId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.ENTITY.DELETE + entityId);
  }

  /**
  * Sends a DELETE request to delete an instance.
  * @param {string} instanceId - The instance ID to delete.
  * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
  */
  deleteInstance(instanceId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.INSTANCE.DELETE + instanceId);
  }
}
