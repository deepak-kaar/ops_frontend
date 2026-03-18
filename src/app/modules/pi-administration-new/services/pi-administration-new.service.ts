import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout, tap } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';
import { LoggingService } from '../../logging/services/logging.service';

@Injectable({
  providedIn: 'root'
})
export class PiAdministrationNewService extends BaseApiService {

  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url
  private loggingService = inject(LoggingService);

  //PI send strings
  get_pi_send: string = this.baseUrl + 'pi/getPiSend';
  post_pi_send: string = this.baseUrl + 'pi/postPiSend';
  put_pi_send: string = this.baseUrl + 'pi/updatePiSend';
  delete_pi_send: string = this.baseUrl + 'pi/deletePiSend';
  get_entity_list: string = this.baseUrl + 'entity/getEntity'; // url to fetch the entity list
  get_instance_list: string = this.baseUrl + 'instance/getInstance'; // url to fetch the instance list
  get_entity_details: string = this.baseUrl + 'entity/getEntity/'; //url to fetch the entity details

  //PI receive strings
  get_pi_receive: string = this.baseUrl + 'pi/getPiReceive';
  post_pi_receive: string = this.baseUrl + 'pi/postPiReceive';
  put_pi_receive: string = this.baseUrl + 'pi/updatePiReceive';
  delete_pi_receive: string = this.baseUrl + 'pi/deletePiReceive';

  //Get Attribute by org string
  get_attribute_by_orgs: string = this.baseUrl + 'attribute/getAttributeByOrgs';


  getAttributesByOrg(payload: any): Observable<any> {
    const startTime = Date.now();
    return this.http.post(this.get_attribute_by_orgs, payload).pipe(
      tap((res: any) => {
        this.logFrontendActivity('GET_ATTRIBUTES_BY_ORG', 'SUCCESS', startTime, payload, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('GET_ATTRIBUTES_BY_ORG', 'ERROR', startTime, payload, null, err);
        throw err;
      })
    )
  }



  getPISend(payload: any): Observable<any> {
    const startTime = Date.now();
    return this.http.post(this.get_pi_send, payload).pipe(
      tap((res: any) => {
        this.logFrontendActivity('GET_PI_SEND', 'SUCCESS', startTime, payload, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('GET_PI_SEND', 'ERROR', startTime, payload, null, err);
        throw err;
      })
    )
  }

  postPISend(pi_send: any): Observable<any> {
    const startTime = Date.now();
    return this.http.post(this.post_pi_send, pi_send).pipe(
      tap((res: any) => {
        this.logFrontendActivity('POST_PI_SEND', 'SUCCESS', startTime, pi_send, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('POST_PI_SEND', 'ERROR', startTime, pi_send, null, err);
        throw err;
      })
    )
  }


  putPISend(updated_pi_send: any, id: any): Observable<any> {
    const startTime = Date.now();
    return this.http.post(`${this.put_pi_send}/${id}`, updated_pi_send).pipe(
      tap((res: any) => {
        this.logFrontendActivity('PUT_PI_SEND', 'SUCCESS', startTime, { id, ...updated_pi_send }, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('PUT_PI_SEND', 'ERROR', startTime, { id, ...updated_pi_send }, null, err);
        throw err;
      })
    )
  }

  deletePISend(id: any): Observable<any> {
    const startTime = Date.now();
    return this.http.delete(`${this.delete_pi_send}/${id}`).pipe(
      tap((res: any) => {
        this.logFrontendActivity('DELETE_PI_SEND', 'SUCCESS', startTime, { id }, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('DELETE_PI_SEND', 'ERROR', startTime, { id }, null, err);
        throw err;
      })
    )
  }


  getPIReceive(payload: any): Observable<any> {
    const startTime = Date.now();
    return this.http.post(this.get_pi_receive, payload).pipe(
      tap((res: any) => {
        this.logFrontendActivity('GET_PI_RECEIVE', 'SUCCESS', startTime, payload, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('GET_PI_RECEIVE', 'ERROR', startTime, payload, null, err);
        throw err;
      })
    )
  }

  postPIReceive(pi_receive: any): Observable<any> {
    const startTime = Date.now();
    return this.http.post(this.post_pi_receive, pi_receive).pipe(
      tap((res: any) => {
        this.logFrontendActivity('POST_PI_RECEIVE', 'SUCCESS', startTime, pi_receive, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('POST_PI_RECEIVE', 'ERROR', startTime, pi_receive, null, err);
        throw err;
      })
    )
  }

  putPIReceive(updated_pi_receive: any, id: any): Observable<any> {
    const startTime = Date.now();
    return this.http.post(`${this.put_pi_receive}/${id}`, updated_pi_receive).pipe(
      tap((res: any) => {
        this.logFrontendActivity('PUT_PI_RECEIVE', 'SUCCESS', startTime, { id, ...updated_pi_receive }, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('PUT_PI_RECEIVE', 'ERROR', startTime, { id, ...updated_pi_receive }, null, err);
        throw err;
      })
    )
  }

  /**
   * Fetches the list of entity.
   *
   * @returns An Observable of the response containing entity data.
   * @param {any} payload - payload to specify the type of the feature
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getEntityList(payload: any): Observable<any> {
    const startTime = Date.now();
    return this.http.post(this.get_entity_list, payload).pipe(
      tap((res: any) => {
        this.logFrontendActivity('GET_ENTITY_LIST', 'SUCCESS', startTime, payload, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('GET_ENTITY_LIST', 'ERROR', startTime, payload, null, err);
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
    const startTime = Date.now();
    return this.http.post(this.get_instance_list, payload).pipe(
      tap((res: any) => {
        this.logFrontendActivity('GET_INSTANCE_LIST', 'SUCCESS', startTime, payload, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('GET_INSTANCE_LIST', 'ERROR', startTime, payload, null, err);
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
    const startTime = Date.now();
    return this.http.get(this.get_entity_details + entityId).pipe(
      tap((res: any) => {
        this.logFrontendActivity('GET_ENTITY_DETAILS_BY_ID', 'SUCCESS', startTime, { entityId }, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('GET_ENTITY_DETAILS_BY_ID', 'ERROR', startTime, { entityId }, null, err);
        throw err;
      })
    );
  }

  /**
 * Sends a GET request to fetch the details of particular instance by calling the get method from base api service.
 * @param {any} instanceId - instance id to get the details of particular instance.
 * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
 */
  getInstanceDetailsById(instanceId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.INSTANCE.GET_LIST + instanceId);
  }


  deletePIReceive(id: any): Observable<any> {
    const startTime = Date.now();
    return this.http.delete(`${this.delete_pi_receive}/${id}`).pipe(
      tap((res: any) => {
        this.logFrontendActivity('DELETE_PI_RECEIVE', 'SUCCESS', startTime, { id }, res);
      }),
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        this.logFrontendActivity('DELETE_PI_RECEIVE', 'ERROR', startTime, { id }, null, err);
        throw err;
      })
    )
  }

  private logFrontendActivity(action: string, status: 'SUCCESS' | 'ERROR', startTime: number, requestData?: any, responseData?: any, error?: any) {
    const responseTime = Date.now() - startTime;
    console.log(`[PI_ADMIN_FRONTEND] ${action} - ${status}`, {
      action,
      status,
      responseTime: `${responseTime}ms`,
      module: this.loggingService.MODULES.PI_ADMIN,
      requestData: requestData ? JSON.stringify(requestData).substring(0, 200) : null,
      responseData: responseData ? `Status: ${responseData.token || 'N/A'}` : null,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    });
  }

}
