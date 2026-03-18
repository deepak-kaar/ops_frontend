import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getNotificationTemplates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notification/templates`);
  }

  getUserRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`);
  }

  getWorkflows(): Observable<any> {
    return this.http.get(`${this.apiUrl}/workflows`);
  }

  getActiveEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/event/active`);
  }

  getEventLogs(eventId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/event/logs/${eventId}`);
  }
}
