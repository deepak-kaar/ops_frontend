import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';

/**
 * ActiveDirectoryService handles all Active Directory related operations.
 * This service manages API calls for searching and managing Active Directory data.
 */
@Injectable({
  providedIn: 'root'
})
export class ActiveDirectoryService extends BaseApiService {

  /**
   * Fetches Active Directory search results for a specific attribute ID.
   *
   * @param {string} attributeId - The ID of the attribute to search for.
   * @returns {Observable<any>} - An Observable that emits the server's response containing AD data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getActiveDirectorySearchResults(attributeId: string): Observable<any> {
    return this.get(`/active-directory/search/${attributeId}`);
  }

  /**
   * Fetches the list of users from Active Directory based on search criteria.
   *
   * @param {any} payload - payload to specify the filter parameters (appId, orgId, search)
   * @returns {Observable<any>} - An Observable of the response containing user data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  searchUsers(payload: any): Observable<any> {
    return this.post('/active-directory/search-users', payload);
  }

  /**
   * Fetches the list of groups from Active Directory based on search criteria.
   *
   * @param {any} payload - payload to specify the filter parameters (appId, orgId, search)
   * @returns {Observable<any>} - An Observable of the response containing group data.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  searchGroups(payload: any): Observable<any> {
    return this.post('/active-directory/search-groups', payload);
  }

  /**
   * Fetches details of a specific user by their ID.
   *
   * @param {string} userId - The ID of the user to fetch details for.
   * @returns {Observable<any>} - An Observable that emits the user details.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getUserDetailsById(userId: string): Observable<any> {
    return this.get(`/active-directory/user/${userId}`);
  }

  /**
   * Fetches details of a specific group by their ID.
   *
   * @param {string} groupId - The ID of the group to fetch details for.
   * @returns {Observable<any>} - An Observable that emits the group details.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getGroupDetailsById(groupId: string): Observable<any> {
    return this.get(`/active-directory/group/${groupId}`);
  }

  /**
   * Fetches the list of attributes for a specific user or group.
   *
   * @param {string} id - The ID of the user or group.
   * @param {string} type - The type ('user' or 'group').
   * @returns {Observable<any>} - An Observable that emits the attributes.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getAttributes(id: string, type: string): Observable<any> {
    return this.get(`/active-directory/${type}/${id}/attributes`);
  }

  /**
   * Fetches users in a specific LDAP group (recursive).
   *
   * @param {string} groupName - The name of the LDAP group to fetch users from.
   * @returns {Observable<any>} - An Observable that emits the response containing group details and users.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  getLdapUsersInGroup(groupName: string, configId: string): Observable<any> {
    return this.post('auth/getLdapUsersInGroup', { groupName, configId });
  }

  /**
   * Adds a user to an LDAP group.
   *
   * @param {string} configId - The configuration ID to use for LDAP connection.
   * @param {string} groupName - The name of the LDAP group.
   * @param {string} username - The username to add to the group.
   * @returns {Observable<any>} - An Observable that emits the response.
   * @throws {Error} Throws an error if the request fails or times out.
   */
  addUserToGroup(configId: string, groupName: string, username: string): Observable<any> {
    return this.post('auth/addUserToGroup', { configId, groupName, username });
  }

  /**
   * Removes a user from an LDAP group.
   *
   * @param {string} configId - The configuration ID to use for LDAP connection.
   * @param {string} groupName - The name of the LDAP group.
   * @param {string} username - The username to remove from the group.
   * @returns {Observable<any>} - An Observable that emits the response.
   * @throws {Error} Throws an error if the request fails or times out.
   */
 removeUserFromGroup(
  configId: string,
  groupName: string,
  user: string
): Observable<any> {

  return this.post('auth/deleteUserFromGroup', {
    configId,
    groupName,
    username: {
      user: user
    }
  });
}

}
