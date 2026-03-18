import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map, timeout, catchError } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';
import { environment } from 'src/environments/environment';

/**
 * @service OrganizationAdministrationService
 * This service manages the http backend calls for the org administrator module.
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationAdministrationService extends BaseApiService {

  override http = inject(HttpClient)
  override baseUrl: string = environment.apiUrl;  // string to store Backend base api url
  get_app_list: string = this.baseUrl + 'app/getApp'; // string to store the get app list url
  get_org_list_by_app: string = this.baseUrl + 'organization/getOrgByAppId/' // string to store the get orgs list by app id url
  create_app: string = this.baseUrl + 'app/postApp'; // string to store the create app url
  update_app: string = this.baseUrl + 'app/updateApp'; // string to store the create app url
  create_role: string = this.baseUrl + 'roles/postRoles'; // string to store the create role url
  get_roles_list: string = this.baseUrl + 'roles/getRoles'; // string to store the get roles list url.
  create_org: string = this.baseUrl + 'organization/postOrg'; // string to store the create org url.
  delete_app: string = this.baseUrl + 'app/deleteApp/'; // string to store the delete app url.
  post_org: string = this.baseUrl + 'organization/postOrg'; // string to store the create org url.
  get_org_details: string = this.baseUrl + 'organization/getOrg/' // string to store the url to fetch the org details
  update_org_roles: string = this.baseUrl + 'organization/updateOrgByRole' // string to store the url to update roles to the org
  update_org = this.baseUrl + 'organization/updateOrg'; // string to strore the url to update the org
  update_role = this.baseUrl + 'roles/updateRoles'; // string to strore the url to update the role
  delete_org: string = this.baseUrl + 'organization/deleteOrg/'; // string to store the delete org url.
  delete_role: string = this.baseUrl + 'roles/deleteRoles/' // string to store the delete role url.
  get_shift_list = this.baseUrl + 'shift/getShift'; // string to store the get shift list role url.
  post_shift = this.baseUrl + 'shift/postShift'; // string to store the create shift url.
  update_shift = this.baseUrl + 'shift/updateshift'; // string to store the update shift url.
  delete_shift = this.baseUrl + 'shift/deleteShift/'; // string to store the delete shift url.
  delete_grouup = this.baseUrl + 'group/deleteGroup/'; // string to store the delete group url.
  get_group_list = this.baseUrl + 'group/getGroup'; // string to store the get group list url.
  post_group = this.baseUrl + 'group/postGroup'; // string to store the create group url.
  update_group = this.baseUrl + 'group/updateGroup'; // string to store the update group url.
  get_orgs = this.baseUrl + 'organization/getOrg/'; // string to store the get Org url.


  /**
   * Fetches the list of apps.
   *
   * @returns An Observable of the response containing all the apps.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getApps(): Observable<any> {
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
   * Fetches the list of orgs by application id.
   *
   * @param {string} appId - Application Id.
   * @returns An Observable of the response containing all the orgs for the application id provided.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getOrgsByApp(appId: string): Observable<any> {
    return this.http.get(this.get_org_list_by_app + appId).pipe(
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
    * Sends a post request to backend to create a new app.
    *
    * @param {string} app - Object containing app details.
    * @returns An Observable of the response after the creation of app.
    * @throws {Error} Throws an error if the request fails or times out.
    */
  createApp(payload: FormData): Observable<any> {
    return this.http.post(`${this.create_app}`, payload);
  }


  /**
    * Sends a post request to backend to update an app.
    *
    * @param {string} app - Object containing app details.
    * @returns An Observable of the response after the creation of app.
    * @throws {Error} Throws an error if the request fails or times out.
    */
  updateApp(payload: FormData): Observable<any> {
    return this.http.put(`${this.update_app}`, payload);
  }

  /**
    * Fetches the list of roles.
    * @param {any} payload - Payload contains the role Leval and appId if the role level is application
    * @returns An Observable of the response containing all the roles based on the payload passed.
    * @throws {Error} Throws an error if the request fails or times out.
    */
  getRoles(payload: any): Observable<any> {
    return this.http.post(this.get_roles_list, payload).pipe(
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
   * Fetches roles filtered by appId and/or orgId.
   * Unlike getRoles, this returns 200 with empty array instead of 404 when no roles found.
   * @param {any} payload - Contains appId and/or orgId filters
   * @returns An Observable of the response containing roles data.
   */
  getFilteredRoles(payload: any): Observable<any> {
    return this.http.post(this.baseUrl + 'roles/getFilteredRoles', payload).pipe(
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
    * Fetches the role details.
    * @param {any} roleId - Payload contains roleId
    * @returns An Observable of the response containing all the role details based on the payload passed.
    * @throws {Error} Throws an error if the request fails or times out.
    */
  getRoleDetails(roleId: any): Observable<any> {
    return this.http.get(this.get_roles_list + "/"+roleId).pipe(
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
  * Fetches the list of org details.
  * @param {string} orgId - org Id to get the corresponding org
  * @returns An Observable of the response containing the org details based on the orgId passed.
  * @throws {Error} Throws an error if the request fails or times out.
  */
  getOrgDetails(orgId: any): Observable<any> {
    return this.http.get(this.get_org_details + orgId).pipe(
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
   * Sends a post request to backend to create a new role.
   *
   * @param {string} role - Object containing app details.
   * @returns An Observable of the response after the creation of role.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  createRole(role: any): Observable<any> {
    return this.http.post(this.create_role, role).pipe(
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
   * deletes the application by application id.
   * @param {string} appId - Application Id.
   * @returns An Observable of the response after application delete.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  // deleteApp(appId: string): Observable<any> {
  //   return this.http.get(this.delete_app + appId).pipe(
  //     map((res: any) => {
  //       return res;
  //     }),
  //     timeout(20000),
  //     catchError((err) => {
  //       throw err;
  //     })
  //   )
  // }

  /**
   * deletes the application by application id.
   * @param {string} appId - Application Id.
   * @returns An Observable of the response after application delete.
   * @throws {Error} Throws an error if the request fails or times out.
   */
// ...existing code...
deleteApp(appId: string, payload?: any) {
  return this.http.request('delete', `${this.baseUrl}/apps/${appId}`, { body: payload });
}
// ...existing code...

  /**
   * deletes the organization by organization id.
   * @param {string} orgId - organization Id.
   * @returns An Observable of the response after organization delete.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  deleteOrg(orgId: string): Observable<any> {
    return this.http.get(this.delete_org + orgId).pipe(
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
   * deletes the role by role id.
   * @param {string} roleId - role Id.
   * @returns An Observable of the response after role delete.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  deleteRole(roleId: string): Observable<any> {
    return this.http.get(this.delete_role + roleId).pipe(
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
   * Sends a POST request to create an organization.
   *
   * @param {any} payload - The data to be sent in the POST request for creating the organization .
   * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
   */
  createOrg(payload: any): Observable<any> {
    return this.http.post(this.post_org, payload).pipe(
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
    * Sends a post request to backend to update the roles to an org.
    *
    * @param {string} roles - Object containing roles and orgId.
    * @returns An Observable of the response after the creation of app.
    * @throws {Error} Throws an error if the request fails or times out.
    */
  updateOrgRoles(roles: any): Observable<any> {
    return this.http.post(this.update_org_roles, roles).pipe(
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
* Sends a POST request to update an organization.
*
* @param {any} payload - The data to be sent in the POST request for updating the organization .
* @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
*
* */
  updateOrg(payload: any): Observable<any> {
    return this.http.post(this.update_org, payload).pipe(
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
  * Sends a POST request to update a Role.
  *
  * @param {any} payload - The data to be sent in the POST request for updating the Role.
  * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
  *
  * */
  updateRole(payload: any): Observable<any> {
    return this.http.post(this.update_role, payload).pipe(
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
    * Sends a POST request to create a Shift.
    * @param {any} payload - The data to be sent in the POST request for creating the Shift.
    * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
    *
    * */
  postShift(payload: any): Observable<any> {
    return this.http.post(this.post_shift, payload).pipe(
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
    * Sends a POST request to create a Group.
    * @param {any} payload - The data to be sent in the POST request for creating the Group.
    * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
    *
    * */
  postGroup(payload: any): Observable<any> {
    return this.http.post(this.post_group, payload).pipe(
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
  * Fetches the list of Shifts.
  * @returns An Observable of the response containing shift data.
  * @param {any} payload - payload to specify the type of the feature
  * @throws {Error} Throws an error if the request fails or times out.
  */
  getShifts(payload: any): Observable<any> {
    return this.http.post(this.get_shift_list, payload).pipe(
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
    * Fetches the list of Groups.
    * @returns An Observable of the response containing group data.
    * @param {any} payload - payload to specify the type of the feature
    * @throws {Error} Throws an error if the request fails or times out.
    */
  getGroups(paylaod: any): Observable<any> {
    return this.http.post(this.get_group_list, paylaod).pipe(
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
    * Sends a POST request to update a Shift.
    * @param {any} payload - The data to be sent in the POST request for updating the Shift.
    * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
    */
  updateShift(payload: any): Observable<any> {
    return this.http.post(this.update_shift, payload).pipe(
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
    * Sends a POST request to update a Group.
    * @param {any} payload - The data to be sent in the POST request for updating the Group.
    * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
    */
  updateGroup(payload: any): Observable<any> {
    return this.http.post(this.update_group, payload).pipe(
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
 * deletes the shift by shift id.
 * @param {string} shiftId - shift Id.
 * @returns An Observable of the response after shift delete.
 * @throws {Error} Throws an error if the request fails or times out.
 */
  deleteShift(shiftId: string): Observable<any> {
    return this.http.get(this.delete_shift + shiftId).pipe(
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
   * deletes the group by group id.
   * @param {string} groupId - group Id.
   * @returns An Observable of the response after group delete.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  deleteGroup(groupId: string): Observable<any> {
    return this.http.get(this.delete_grouup + groupId).pipe(
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
   * Fetches the list of Frequencies.
   * Calls the http post method from base api service
   * @param {any} payload - contains the filter parameter for apps
   * @returns An Observable of the response containing all Frequencies.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getFrequencyList(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.ORG_ADMIN.APPS.FREQS.GET_LIST, payload);
  }


  /**
  * Sends a POST request to create a frequency.
  * Calls the http post method from base api service
  * @param {any} payload - The data to be sent in the POST request for creating the frequency.
  * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
  */
  createFrequency(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.ORG_ADMIN.APPS.FREQS.CREATE, payload)
  }

  /**
    * Sends a POST request to update a frequency.
    * Calls the http post method from base api service
    * @param {any} payload - The data to be sent in the POST request for updating the frequency.
    * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
    */
  updateFrequency(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.ORG_ADMIN.APPS.FREQS.UPDATE, payload)
  }

  /**
     * Fetches the details of a frequency.
     * @param {string} frequencyId - the frequencyid to be sent as queryparams
     * @returns An Observable of the response containing Frequency details by Id.
     * @throws {Error} Throws an error if the request fails or times out.
     */
  getFrequencyDetails(frequencyId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.ORG_ADMIN.APPS.FREQS.GET_LIST + frequencyId);
  }

  /**
    * Sends a POST request to delete a frequency.
    * Calls the http post method from base api service
    * @param {any} payload - The data to be sent in the POST request for deleting the frequency.
    * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
    */
  deleteFrequency(frequencyId: string): Observable<any> {
    return this.get<any>(API_ENDPOINTS.ORG_ADMIN.APPS.FREQS.DELETE + frequencyId)
  }

  /**
    * Sends a POST request to post a log.
    * Calls the http post method from base api service
    * @param {any} payload - The data to be sent in the POST request for posting a log.
    * @returns {Observable<any>} - An Observable that emits the server's response or throws an error in case of a failure.
    */
  postLogs(payload: any): Observable<any> {
    return this.post<any>(API_ENDPOINTS.ORG_ADMIN.LOGS.CREATE, payload)
  }

}
