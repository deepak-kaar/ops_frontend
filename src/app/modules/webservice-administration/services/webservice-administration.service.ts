import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebserviceAdministrationService extends BaseApiService {
  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url
  get_entity_list: string = this.baseUrl + 'entity/getEntity'; // url to fetch the entity list
  get_instance_list: string = this.baseUrl + 'instance/getInstance'; // url to fetch the instance list
  get_entity_details: string = this.baseUrl + 'entity/getEntity/'; //url to fetch the entity details

  get_webservice_list: string = this.baseUrl + 'webService/ws';
  get_webserviceById: string = this.baseUrl + 'webService/ws';
  get_webserviceMap: string = this.baseUrl + 'webService/ws/getMap';
  post_webservice: string = this.baseUrl + 'webService/ws';
  put_webservice: string = this.baseUrl + 'webService/ws';
  delete_webservice: string = this.baseUrl + 'webService/ws';

  getMapDataByUrl(data: any): Observable<any> {
    console.log(data);
    let headers = new HttpHeaders();
    let creds: any = {};
    const apiType = data?.apiType?.toLowerCase() || 'rest';
    console.log(apiType, data.authType);

    // ---------- AUTH ----------
    try {
      // Parse wsAuth - handle both JSON and XML strings
      if (typeof data.wsAuth === 'string') {
        if (data.wsAuth.trim().startsWith('<')) {
          // If XML, parse it to extract credentials
          const xmlString = data.wsAuth.trim();
          // Extract username/password from XML
          const usernameMatch = xmlString.match(/<username[^>]*>([^<]+)<\/username>/i);
          const passwordMatch = xmlString.match(/<password[^>]*>([^<]+)<\/password>/i);
          const tokenMatch = xmlString.match(/<token[^>]*>([^<]+)<\/token>/i);
          const keyMatch = xmlString.match(/<key[^>]*>([^<]+)<\/key>/i);
          const valueMatch = xmlString.match(/<value[^>]*>([^<]+)<\/value>/i);
          
          if (usernameMatch && passwordMatch) {
            creds = { username: usernameMatch[1].trim(), password: passwordMatch[1].trim() };
          } else if (tokenMatch) {
            creds = { token: tokenMatch[1].trim() };
          } else if (keyMatch && valueMatch) {
            creds = { key: keyMatch[1].trim(), password: valueMatch[1].trim(), value: valueMatch[1].trim() };
          } else {
            creds = {};
          }
        } else if (data.wsAuth.trim().startsWith('{')) {
          // JSON string
          creds = JSON.parse(data.wsAuth || '{}');
        } else {
          creds = {};
        }
      } else if (typeof data.wsAuth === 'object') {
        creds = data.wsAuth || {};
      } else {
        creds = {};
      }
      console.log('Creds:', creds);

      // Apply auth to headers (same for both REST and SOAP)
      switch (data.authType) {

        case 'Basic Auth':
        case 'Service Account':
          if (creds?.username && creds?.password) {
            const basic = btoa(`${creds.username}:${creds.password}`);
            headers = headers.set('Authorization', `Basic ${basic}`);
          }
          break;

        case 'API Key':
          // For API Key, check password, value, or extract from XML
          const apiKeyValue = creds?.password || creds?.value || '';
          if (apiKeyValue) {
            headers = headers.set('x-api-key', apiKeyValue);
          }
          break;

        case 'Bearer Token':
          if (creds?.token) {
            headers = headers.set('Authorization', `Bearer ${creds.token}`);
          }
          break;

        default:
          break;
      }

    } catch (e) {
      console.warn('Invalid auth:', e);
    }

    // ---------- REST CALL ----------
    if (apiType === 'rest') {
      console.log(headers);
      // add extra headers from object if provided
      if (data.wsHeaders && typeof data.wsHeaders === 'object') {
        Object.entries(data.wsHeaders).forEach(([key, value]) => {
          if (key && value !== undefined && value !== null) {
            headers = headers.set(key, String(value));
          }
        });
      }

      console.log(data.method, data.wsURL, headers, data.wsBody);

      return this.http.request(data.method || 'GET', data.wsURL, {
        headers,
        body: data.wsBody ? JSON.parse(data.wsBody) : undefined
      }).pipe(
        timeout(20000),
        map((response: any) => {
          // Normalize REST response - return the actual data
          // Handle various response structures
          if (response && typeof response === 'object') {
            // If response has 'success', 'data', 'result', or 'body' property, extract it
            if (response.success !== undefined) return response.success;
            if (response.data !== undefined) return response.data;
            if (response.result !== undefined) return response.result;
            if (response.body !== undefined) return response.body;
            // Otherwise return the whole response
            return response;
          }
          return response;
        }),
        catchError((err) => {
          console.error('REST call error:', err);
          throw err;
        })
      );
    }

    // ---------- SOAP CALL ----------
    if (apiType === 'soap') {

      // 1. SOAP Content-Type
      headers = headers.set('Content-Type', 'text/xml;charset=UTF-8');

      // 2. Add extra headers from wsHeaders object (including SOAPAction)
      if (data.wsHeaders && typeof data.wsHeaders === 'object') {
        Object.entries(data.wsHeaders).forEach(([key, value]) => {
          if (key && value !== undefined && value !== null) {
            headers = headers.set(key, String(value));
          }
        });
      }

      console.log('SOAP Headers:', headers);

      // 3. Body is raw SOAP XML (no auth insertion - auth is in headers)
      const soapBody: string = data.wsBody || '';

      console.log('SOAP Body:', soapBody);

      return this.http.post(
        data.wsURL,
        soapBody,
        { headers, responseType: 'text' }
      ).pipe(
        timeout(20000),
        map((response: any) => {
          // For SOAP, response is already a string (XML)
          // Return it as-is for further processing
          return response;
        }),
        catchError((err) => {
          console.error('SOAP call error:', err);
          throw err;
        })
      );
    }

    throw new Error('Unsupported apiType');
  }

  /**
     * Fetches the list of entity.
     *
     * @returns An Observable of the response containing entity data.
     * @param {any} payload - payload to specify the type of the feature
     * @throws {Error} Throws an error if the request fails or times out.
     */
  getEntityList(payload?: any): Observable<any> {
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
  getInstanceList(payload?: any): Observable<any> {
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
 * Sends a GET request to fetch the details of particular instance by calling the get method from base api service.
 * @param {any} instanceId - instance id to get the details of particular instance.
 * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
 */
  getInstanceDetailsById(instanceId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.DATAPOINT_ADMIN.INSTANCE.GET_LIST + instanceId);
  }

  getWS(): Observable<any> {
    return this.http.get(this.get_webservice_list).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getWSById(id: string): Observable<any> {
    return this.http.get(`${this.get_webserviceById}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }


  postWS(payload: any): Observable<any> {
    return this.http.post(this.post_webservice, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  putWS(payload: any, id: string): Observable<any> {
    return this.http.put(`${this.put_webservice}/${id}`, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  deleteWS(id: string): Observable<any> {
    return this.http.delete(`${this.delete_webservice}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

  getWSMap(id: string): Observable<any> {
    return this.http.get(`${this.get_webserviceMap}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    );
  }

}
