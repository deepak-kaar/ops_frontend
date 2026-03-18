import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MongodbServiceNewService {
  private baseUrl = `${environment.apiUrl}mongoAdmin`;

  constructor(private http: HttpClient) {}

  updateDocument(collection: string, id: string, updatedDoc: any): Observable<any> {
    const url = `${this.baseUrl}/${collection}/update/${id}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(url, updatedDoc, { headers }).pipe(
      catchError((err) => {
        console.error('Error updating document:', err);
        return throwError(() => err);
      })
    );
  }

  createDocument(collection: string, newDoc: any, extra?: any): Observable<any> {
    const url = `${this.baseUrl}/${collection}/create`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const payload = extra ? { ...newDoc, ...extra } : newDoc;
    return this.http.post(url, payload, { headers }).pipe(
      catchError((err) => {
        console.error('Error creating document:', err);
        return throwError(() => err);
      })
    );
  }

  deleteDocument(collection: string, id: string): Observable<any> {
    const url = `${this.baseUrl}/${collection}/delete/${id}`;
    return this.http.delete(url).pipe(
      catchError((err) => {
        console.error('Error deleting document:', err);
        return throwError(() => err);
      })
    );
  }

  getSchema(collectionName: string): Observable<any> {
    const url = `${this.baseUrl}/${collectionName}/getSchema`;
    return this.http.get<any>(url);
  }

  replaceDocument(collection: string, id: string, payload: any): Observable<any> {
    const url = `${this.baseUrl}/${collection}/replace/${id}`;
    return this.http.put(url, payload);
  }

  hardDeleteDocument(collection: string, id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${collection}/hardDelete/${id}`);
  }
}
