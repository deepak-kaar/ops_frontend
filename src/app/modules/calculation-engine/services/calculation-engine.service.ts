import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalculationEngineService extends BaseApiService {
  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url
  get_cal_engine: string = this.baseUrl + 'calc/getNewCalculation'; // string to store the get app list url
  create_cal_engine: string = this.baseUrl + 'calc/postNewCalcEngine'; // string to store the create app url
  create_cal_engine_testrun: string = this.baseUrl + 'calc/newCalculateEngine'; // string to get test run cal eng app url
  create_cal_engine_mapping: string = this.baseUrl + 'calc/postNewCalcMapping'; // string to get mapping cal eng app url
  get_list_tags: string = this.baseUrl + 'entity/getAttributes';
  get_list_instance: string = this.baseUrl + 'instance/getInstance';
  get_list_attributes: string = this.baseUrl + 'instance/getInstance/'


  /**
   * Fetches the list of apps.
   *
   * @returns An Observable of the response containing all the apps.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getCalEngine(filters: any): Observable<any> {
    return this.http.post(this.get_cal_engine, filters).pipe(
      map((res: any) => {
        return res.calculation;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  /**
  * Sends a post request to backend to create a new app.
  *
  * @param {string} cal - Object containing app details.
  * @returns An Observable of the response after the creation of app.
  * @throws {Error} Throws an error if the request fails or times out.
  */
  createCalEngine(cal: any): Observable<any> {
    return this.http.post(this.create_cal_engine, cal).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  createCalEngineTestRun(cal: any): Observable<any> {
    return this.http.post(this.create_cal_engine_testrun, cal).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  createCalEngineMapping(cal: any): Observable<any> {
    return this.http.post(this.create_cal_engine_mapping, cal).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  getCalEngineTags(payload: any): Observable<any> {
    return this.http.post(this.get_list_tags, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  getCalEngineInstance(payload: any): Observable<any> {
    return this.http.post(this.get_list_instance, payload).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  getCalEngineAttributes(id: any): Observable<any> {
    return this.http.get(this.get_list_attributes + id).pipe(
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
    * Sends a GET request to fetch the list of mapping for a particular calculation template by calling the get method from base api service.
    * @param {any} payload - template id to get the list of mapping for a particular calculation template.
    * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
    */
  getCalcMappings(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.CALCULATION_ENGINE.MAPPING.GET_LIST, payload);
  }

  /**
    * Sends a POST request to execute the calculation.
    * @param {any} payload - payload to excute the calculation.
    * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
    */
  runCalc(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.CALCULATION_ENGINE.EXCUETION.RUN, payload, { timeoutMs: 40000 })
  }

}
