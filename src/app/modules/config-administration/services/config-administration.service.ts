import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigAdministrationService extends BaseApiService {
  override http = inject(HttpClient);
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url

  get_config: string = this.baseUrl + 'config/getConfig';
  post_config: string = this.baseUrl + 'config/postConfig';
  put_config: string = this.baseUrl + 'config/updateConfig';
  delete_config: string = this.baseUrl + 'config/deleteConfig';
  get_config_dropdown: string = this.baseUrl + 'config/getConfigDropdown';
  encrypt_value: string = this.baseUrl + 'config/encrypt';
  decrypt_value: string = this.baseUrl + 'config/decrypt';

  getConfig(params?: any): Observable<any> {
    return this.http.get(this.get_config, { params }).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  getConfigDropdown(params?: any): Observable<any> {
    return this.http.get(this.get_config_dropdown, { params }).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  getConfigById(id: any): Observable<any> {
    return this.http.get(this.get_config + id).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  postConfig(config: any): Observable<any> {
    return this.http.post(this.post_config, config).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  putConfig(updated_config: any, id: any): Observable<any> {
    return this.http.post(`${this.put_config}/${id}`, updated_config).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }


  deleteConfig(id: any): Observable<any> {
    return this.http.get(`${this.delete_config}/${id}`).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  encryptValue(value: string): Observable<any> {
    return this.http.post(this.encrypt_value, { value }).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

  decryptValue(encryptedValue: string): Observable<any> {
    return this.http.post(this.decrypt_value, { encryptedValue }).pipe(
      map((res: any) => {
        return res;
      }),
      timeout(20000),
      catchError((err) => {
        throw err;
      })
    )
  }

}
