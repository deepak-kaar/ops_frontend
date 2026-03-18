import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, switchMap, catchError, map } from 'rxjs/operators';
import { RolloutService } from '../../../modules/rollout-management/services/rollout.service';
import { ChangeTrackerService } from '../../../modules/rollout-management/services/change-tracker.service';
import { LabelService } from '../../../modules/rollout-management/services/label.service';
import { MessageService } from 'primeng/api';

@Injectable()
export class RolloutInterceptor implements HttpInterceptor {
  private moduleMap: { [key: string]: string } = {
    'datapoint': 'Datapoint Administration',
    'config': 'Config Administration',
    'email': 'Email Administration',
    'reportimage': 'Report Image Administration',
    'schedulerjob': 'SchedulerJob Administration',
    'pi': 'PI Administration',
    'datasource': 'Datasource Administration',
    'database': 'Database Administration',
    'webservice': 'Webservice Administration',
    'calculation': 'Calculation Engine',
    'correlation': 'Correlation Engine',
    'activity': 'Activity Engine',
    'page': 'Page Administration',
    'organization': 'Organization Administration',
    'org': 'Organization Administration',
    'mongodb': 'MongoDB Administration',
    'tag': 'Tag Administration',
    'directory': 'Active Directory',
    'user': 'User Enabler',
    'accountenabler': 'User Enabler',

    // normalized keys
    'role': 'Role Hierarchy',
    'lockscreen': 'Lock Screen Administration',
    'lock-screen': 'Lock Screen Administration',
    'lock_screen': 'Lock Screen Administration',

    // Add App Admin tracking
    'app': 'App Administration',
    'appadmin': 'App Administration',
    'application': 'App Administration',


        // Report Publish Administration
    'reportpublish': 'Report Publish Administration',
    'report-publish': 'Report Publish Administration',
    'report_publish': 'Report Publish Administration',
  };

  constructor(
    private rolloutService: RolloutService,
    private changeTrackerService: ChangeTrackerService,
    private http: HttpClient,
    private labelService: LabelService,
    private messageService: MessageService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const method = req.method.toUpperCase();
    const url = (req.urlWithParams || req.url).toLowerCase();

    // Skip rollout endpoints and internal read-only infra endpoints only for GET
    const isInfraReadUrl =
      method === 'GET' &&
      (url.includes('/idt') || url.includes('/entity') || url.includes('/instance'));

    if (url.includes('/rollout') || req.headers.has('x-rollout-skip') || isInfraReadUrl) {
      return next.handle(req);
    }

    // Track CUD + legacy GET delete endpoints
    const isDeleteByGet =
      method === 'GET' &&
      (url.includes('/delete') || url.includes('delete') || url.includes('/remove') || url.includes('/unmap'));

    const shouldTrack =
      method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE' || isDeleteByGet;

    if (!shouldTrack) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
          this.trackChangeInBackground(method, url, req, event);
        }
      })
    );
  }

  /**
   * Track changes in the background without blocking the main request
   */
  private trackChangeInBackground(method: string, url: string, req: HttpRequest<any>, event: HttpResponse<any>): void {
    // Check if label is selected - show toast if not
    const rolloutLabel = this.labelService.getSelectedLabel();
    if (!rolloutLabel) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Rollout Tracking',
        detail: 'Change not tracked: No rollout label selected',
        life: 3000
      });
      return;
    }

    const module = this.extractModule(url);
    const action = this.getAction(method, req.url, req.body);
    const label = this.extractLabel(req.body, event.body);

    if (!module || !action) {
      return; // Nothing to track
    }

    // Handle tracking based on action type
    if (action === 'edit') {
      const newData = req.body || {};
      this.fetchOldData(req).subscribe({
        next: (oldData) => {
          const finalOldData = oldData || this.extractOldDataFromResponse(event.body);
          let changedFields: string[] | undefined;
          let fieldDiff: { [key: string]: { old: any; new: any } } | undefined;

          if (finalOldData) {
            const diff = this.changeTrackerService.compareData(finalOldData, newData);
            if (diff.changedFields.length > 0) {
              changedFields = diff.changedFields;
              fieldDiff = diff.fieldDiff;
            }
          }

          this.rolloutService.trackChange(module, action, label, newData, finalOldData, changedFields, fieldDiff, rolloutLabel).subscribe({
            next: () => console.log('[RolloutInterceptor] Edit change tracked successfully'),
            error: (err) => console.error('[RolloutInterceptor] Error tracking edit change:', err)
          });
        },
        error: () => {
          // If fetching old data fails, track without it
          this.rolloutService.trackChange(module, action, label, newData, null, undefined, undefined, rolloutLabel).subscribe({
            next: () => console.log('[RolloutInterceptor] Edit change tracked without old data'),
            error: (err) => console.error('[RolloutInterceptor] Error tracking edit change:', err)
          });
        }
      });
    } else if (action === 'create') {
      const newData = req.body || {};
      // For create, oldData is null
      this.rolloutService.trackChange(module, action, label, newData, null, undefined, undefined, rolloutLabel).subscribe({
        next: () => console.log('[RolloutInterceptor] Create change tracked successfully'),
        error: (err) => console.error('[RolloutInterceptor] Error tracking create change:', err)
      });
    } else if (action === 'delete') {
      // For delete, newData is null. The oldData is the item being deleted.
      // It might be in the response body (for our custom GET delete) or request body (for standard DELETE).
      const oldData = this.extractDataFromResponse(event.body) || req.body || this.extractOldDataFromResponse(event.body) || event.body || null;
      const finalLabel = this.extractLabel(oldData, {}); // Re-extract label from the actual old data

      this.rolloutService.trackChange(module, action, finalLabel, null, oldData, undefined, undefined, rolloutLabel).subscribe({
        next: () => console.log('[RolloutInterceptor] Delete change tracked successfully'),
        error: (err) => console.error('[RolloutInterceptor] Error tracking delete change:', err)
      });
    }
  }

  /**
   * Extracts the primary data object from a potentially wrapped API response.
   */
  private extractDataFromResponse(responseBody: any): any {
    if (!responseBody) return null;
    if (responseBody.data) return responseBody.data;
    if (responseBody.result) return responseBody.result;
    if (responseBody.dataSourceData) return responseBody.dataSourceData;
    // Add other common wrappers if needed
    return null;
  }

  /**
   * Fetch old data before an edit operation
   */
  private fetchOldData(req: HttpRequest<any>): Observable<any> {
    // Add header to skip tracking for this fetch request
    const skipHeaders = new HttpHeaders().set('x-rollout-skip', '1');

    // Extract ID from URL or request body
    const urlParts = req.url.split('/');
    const urlId = urlParts[urlParts.length - 1];
    const requestBody = req.body || {};

    // For webservice, GET uses webserviceId, PUT uses _id
    // Try to get webserviceId from request body first
    const getId = requestBody.webserviceId || requestBody._id || urlId;

    // Construct GET URL - try with webserviceId first (for webservice endpoints)
    let getUrl = req.url;
    if (req.url.includes('/webService/ws/') && requestBody.webserviceId) {
      // Replace the _id in URL with webserviceId for GET request
      getUrl = req.url.replace(`/${urlId}`, `/${requestBody.webserviceId}`);
    }

    console.log('[RolloutInterceptor] Fetching old data from:', getUrl, 'using ID:', getId);

    // For PUT/PATCH, try to fetch using GET to the same URL (or modified URL)
    return this.http.get(getUrl, { headers: skipHeaders }).pipe(
      map((response: any) => {
        console.log('[RolloutInterceptor] GET response received:', response);
        // Handle different response structures
        // Some APIs return { data: {...} }, { result: {...} }, { dataSourceData: {...} }, or direct object
        if (response && typeof response === 'object') {
          // Check for common wrapper keys
          if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            console.log('[RolloutInterceptor] Extracted oldData from response.data');
            return response.data;
          }
          if (response.dataSourceData && typeof response.dataSourceData === 'object' && !Array.isArray(response.dataSourceData)) {
            console.log('[RolloutInterceptor] Extracted oldData from response.dataSourceData');
            return response.dataSourceData;
          }
          if (response.result && typeof response.result === 'object' && !Array.isArray(response.result)) {
            console.log('[RolloutInterceptor] Extracted oldData from response.result');
            return response.result;
          }
          if (response.updatedWebService) {
            // Backend might return the updated object, but we want the old one
            console.warn('[RolloutInterceptor] Response contains updatedWebService, not old data');
            return null;
          }
          // If response is already the data object, return it
          // But exclude metadata fields
          const { token, response: respMsg, ...data } = response;
          if (Object.keys(data).length > 0 && !data.token) {
            console.log('[RolloutInterceptor] Using response as oldData (excluding metadata)');
            return data;
          }
        }
        console.log('[RolloutInterceptor] Returning response as-is');
        return response;
      }),
      catchError((error) => {
        console.error('[RolloutInterceptor] Failed to fetch old data from', getUrl, ':', error);
        // Try alternative: use _id from request body if webserviceId failed
        if (req.url.includes('/webService/ws/') && requestBody._id && !requestBody.webserviceId) {
          console.log('[RolloutInterceptor] Retrying with _id from request body');
          const altUrl = req.url.replace(`/${urlId}`, `/${requestBody._id}`);
          return this.http.get(altUrl, { headers: skipHeaders }).pipe(
            map((response: any) => {
              if (response?.dataSourceData) return response.dataSourceData;
              if (response?.data) return response.data;
              return response;
            }),
            catchError(() => of(null))
          );
        }
        return of(null); // Return null if fetch fails
      })
    );
  }

  /**
   * Extract old data from response body (fallback)
   */
  private extractOldDataFromResponse(responseBody: any): any {
    if (!responseBody) return null;

    // Check common response patterns
    const candidates = [
      'original',
      'oldData',
      'previous',
      'previousData',
      'before',
      'beforeUpdate',
      'dataBefore',
      'existing',
      'existingData',
      'old',
      'prior'
    ];

    for (const key of candidates) {
      if (responseBody[key] !== undefined) {
        return responseBody[key];
      }
    }

    // Check nested data
    if (responseBody.data) {
      for (const key of candidates) {
        if (responseBody.data[key] !== undefined) {
          return responseBody.data[key];
        }
      }
    }

    return null;
  }

  private extractModule(url: string): string | null {
    const normalizedUrl = (url || '').toLowerCase();
    for (const key in this.moduleMap) {
      if (normalizedUrl.includes(key.toLowerCase())) {
        return this.moduleMap[key];
      }
    }
    return null;
  }

  private getAction(method: string, url?: string, body?: any): 'create' | 'edit' | 'delete' | null {
    const normalizedMethod = (method || '').toUpperCase();
    const normalizedUrl = (url || '').toLowerCase();
    const payload = body || {};

    // Standard delete
    if (normalizedMethod === 'DELETE') return 'delete';

    // Legacy GET delete APIs
    if (
      normalizedMethod === 'GET' &&
      (normalizedUrl.includes('/delete') ||
        normalizedUrl.includes('delete') ||
        normalizedUrl.includes('/remove') ||
        normalizedUrl.includes('/unmap'))
    ) {
      return 'delete';
    }

    if (normalizedMethod === 'PUT' || normalizedMethod === 'PATCH') {
      if (payload.isDeleted === true || payload.deleted === true) return 'delete';
      return 'edit';
    }

    // Explicit URL patterns
    if (normalizedUrl) {
      if (normalizedUrl.includes('/email/deleteemail')) return 'delete';
      if (normalizedUrl.includes('/email/updateemail')) return 'edit';

      // config explicit delete patterns
      if (
        normalizedUrl.includes('/config/delete') ||
        normalizedUrl.includes('/deleteconfig') ||
        normalizedUrl.includes('/deleteconfiguration')
      ) {
        return 'delete';
      }

      // lock-screen explicit edit patterns
      if (
        normalizedUrl.includes('/lockscreen/updatecategory') ||
        normalizedUrl.includes('/lockscreen/mapattributestocategory') ||
        normalizedUrl.includes('/lockscreen/updatefreezeforrole')
      ) {
        return 'edit';
      }

      // lock-screen explicit delete patterns
      if (
        normalizedUrl.includes('/lockscreen/delete') ||
        normalizedUrl.includes('/lockscreen/remove') ||
        normalizedUrl.includes('/lockscreen/unmap')
      ) {
        return 'delete';
      }

      // Report Publish explicit patterns
      if (normalizedUrl.includes('/reportpublish/delete')) return 'delete';
      if (normalizedUrl.includes('/reportpublish/create')) return 'create';
      if (
        normalizedUrl.includes('/reportpublish/update') ||
        normalizedUrl.includes('/reportpublish/toggleactive')
      ) return 'edit';
    }

    if (normalizedMethod === 'POST') {
      if (
        normalizedUrl.includes('/delete') ||
        normalizedUrl.includes('delete') ||
        normalizedUrl.includes('remove') ||
        normalizedUrl.includes('unmap')
      ) {
        return 'delete';
      }

      if (normalizedUrl.includes('update') || normalizedUrl.includes('/edit')) {
        return 'edit';
      }

      const urlParts = normalizedUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(lastPart);
      const isNumericId = /^\d+$/.test(lastPart);
      if (isObjectId || isNumericId) return 'edit';

      if (payload && (payload._id || payload.id)) {
        const bodyKeys = Object.keys(payload).filter(k => k !== '_id' && k !== 'id');
        if (bodyKeys.length > 0) return 'edit';
      }

      return 'create';
    }

    return null;
  }

  private extractLabel(requestBody: any, responseBody: any): string {
    const body = requestBody || responseBody || {};
    return body.name || body.label || body.title || body.id || body.jobName || body.configName || 'Item';
  }
}
