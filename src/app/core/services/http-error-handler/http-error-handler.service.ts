import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  private readonly messageService = inject(MessageService);
  constructor() { }

  /**
   * Handles HTTP errors consistently
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    // Log the error for debugging
    // console.error(errorMessage, error);

    // Skip showing toast for cycle errors (400 with cycles array) - let component handle it
    const isCycleError = error.status === 400 && 
                        error.error && 
                        error.error.token === "400" && 
                        error.error.cycles && 
                        Array.isArray(error.error.cycles);

    if (!isCycleError) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message })
    }

    // You can also send the error to an analytics service
    // this.logErrorToAnalytics(errorMessage, error);

    return throwError(() => error);
  }

  /**
   * Optional: Log errors to analytics service
   */
  private logErrorToAnalytics(message: string, error: any): void {
    // Implementation for logging to analytics
  }
}
