import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OpsinsightDataService extends BaseApiService {
  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;

  get_customer_list: string = this.baseUrl + 'opsinsightData/customer';
  get_customerById: string = this.baseUrl + 'opsinsightData/customer';
  get_customerByName: string = this.baseUrl + 'opsinsightData/customer/byName';
  post_customer: string = this.baseUrl + 'opsinsightData/customer';
  put_customer: string = this.baseUrl + 'opsinsightData/customer';
  delete_customer: string = this.baseUrl + 'opsinsightData/customer';
  get_attributes: string = this.baseUrl + 'attribute/getAttributesForMapping';
  get_customer_attributes: string = this.baseUrl + 'opsinsightData/customer/attributes';
  post_customer_attributes: string = this.baseUrl + 'opsinsightData/customer/attributes';

  /**
   * Fetches the list of customers.
   * @returns An Observable of the response containing customer data.
   */
  getCustomers(): Observable<any> {
    return this.http.get(this.get_customer_list).pipe(
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
   * Fetches a customer by ID.
   * @param id - Customer ID
   * @returns An Observable of the response containing customer data.
   */
  getCustomerById(id: string): Observable<any> {
    return this.http.get(`${this.get_customerById}/${id}`).pipe(
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
   * Fetches a customer by consumer name.
   * @param name - Consumer name
   * @returns An Observable of the response containing customer data.
   */
  getCustomerByName(name: string): Observable<any> {
    const encoded = encodeURIComponent(name);
    return this.http.get(`${this.get_customerByName}/${encoded}`).pipe(
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
   * Creates a new customer.
   * @param payload - Customer data
   * @returns An Observable of the response.
   */
  postCustomer(payload: any): Observable<any> {
    return this.http.post(this.post_customer, payload).pipe(
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
   * Updates an existing customer.
   * @param payload - Customer data
   * @param id - Customer ID
   * @returns An Observable of the response.
   */
  putCustomer(payload: any, id: string): Observable<any> {
    return this.http.put(`${this.put_customer}/${id}`, payload).pipe(
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
   * Deletes a customer.
   * @param id - Customer ID
   * @returns An Observable of the response.
   */
  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.delete_customer}/${id}`).pipe(
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
   * Fetches attributes for mapping.
   * @param appId - Optional application ID filter
   * @param orgId - Optional organization ID filter
   * @returns An Observable of the response containing attributes.
   */
  getAttributes(appId?: string, orgId?: string): Observable<any> {
    let url = this.get_attributes;
    const params: string[] = [];
    
    if (appId) {
      params.push(`appId=${appId}`);
    }
    if (orgId) {
      params.push(`orgId=${orgId}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get(url).pipe(
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
   * Fetches mapped attributes for a customer.
   * @param customerId - Customer ID
   * @returns An Observable of the response containing mapped attributes.
   */
  getCustomerAttributes(customerId: string): Observable<any> {
    return this.http.get(`${this.get_customer_attributes}/${customerId}`).pipe(
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
   * Maps attributes to a customer.
   * @param customerId - Customer ID
   * @param payload - Attribute mapping data
   * @returns An Observable of the response.
   */
  postCustomerAttributes(customerId: string, payload: any): Observable<any> {
    return this.http.post(`${this.post_customer_attributes}/${customerId}`, payload).pipe(
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
