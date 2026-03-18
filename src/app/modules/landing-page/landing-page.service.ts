import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/config/api-endpoint.config';
import { BaseApiService } from 'src/app/core/services/base-api/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class LandingPageService extends BaseApiService {

  /**
    * Fetches the list of ongoing events cards.
    * @returns An Observable of the response containing ongoing flags cards.
    * @throws {Error} Throws an error if the request fails or times out.
    */
  getOnGoingFlags(): Observable<any> {
    return this.get(API_ENDPOINTS.LANDING_PAGE.GET_ONGOING_CARDS)
  }

  /**
   * Example 1: Simple SSE connection with basic parsing
   */
  getWellCount(attributeId: string): Observable<any> {
    return this.connectSSE<string>(API_ENDPOINTS.DATAPOINT_ADMIN.ATTRIBUTES.SSE + attributeId).pipe(
      map((event: MessageEvent) => {
        // Parse the incoming data
        const data = JSON.parse(event.data);
        return data;
      }),
      catchError(error => {
        console.error('SSE Error:', error);
        throw error;
      })
    );
  }



}
