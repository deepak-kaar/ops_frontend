import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpErrorHandlerService } from '../http-error-handler/http-error-handler.service';
import { Observable, timeout, catchError, Subject } from 'rxjs';


/**
* WebSocket connection state
*/
export type WebSocketState = 'connecting' | 'connected' | 'closing' | 'closed' | 'error';

/**
* WebSocket connection interface
*/
export interface WebSocketConnection<T> {
  /** Observable stream of incoming messages */
  messages$: Observable<T>;

  /** Observable stream of connection state changes */
  connectionState$: Observable<WebSocketState>;

  /** Send a message through the WebSocket */
  send: (data: T | string) => void;

  /** Close the WebSocket connection */
  close: (code?: number, reason?: string) => void;

  /** Reconnect the WebSocket */
  reconnect: () => void;

  /** Get current connection state */
  getState: () => WebSocketState;
}

/**
 * @description
 * BaseApiService provides generic HTTP methods (`GET`, `POST`, `PUT`, `DELETE`)
 * that wrap Angular's HttpClient with default timeout and centralized error handling.
 *
 * This service is designed to be extended by other services in the application
 * that communicate with RESTful APIs.
 *
 * @example
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class UserService extends BaseApiService {
 *   getUsers(): Observable<User[]> {
 *     return this.get<User[]>('/users');
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  /**
   * Base URL for all API requests. Taken from the environment configuration.
   */
  protected readonly baseUrl: string = environment.apiUrl;

  /**
   * Base URL for all Web sockets requests. Taken from the environment configuration.
   */
  protected readonly wsUrl: string = environment.wsUrl;

  /**
   * Default timeout duration for all HTTP requests (in milliseconds).
   * Defaults to 20 seconds.
   */
  protected readonly defaultTimeout = 20000;

  protected http = inject(HttpClient)
  private errorService = inject(HttpErrorHandlerService);

  /**
   * @description
   * Sends a GET request to the specified endpoint.
   *
   * @param endpoint - Relative or absolute URL of the API endpoint.
   * @param options - Optional configuration including headers, params, and timeout.
   * @returns An `Observable<T>` with the HTTP response.
   */
  protected get<T>(endpoint: string, options: {
    params?: HttpParams | Record<string, string | string[]>,
    headers?: HttpHeaders | Record<string, string | string[]>,
    responseType?: any,
    timeoutMs?: number
  } = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const timeoutValue = options.timeoutMs || this.defaultTimeout;

    return this.http.get<T>(url, options).pipe(
      timeout(timeoutValue),
      catchError(error => this.errorService.handleError(error))
    );
  }

  /**
   * @description
   * Sends a POST request to the specified endpoint with a request body.
   *
   * @param endpoint - Relative or absolute URL of the API endpoint.
   * @param body - Payload to send in the request body.
   * @param options - Optional configuration including headers, params, and timeout.
   * @returns An `Observable<T>` with the HTTP response.
   */
  protected post<T>(endpoint: string, body: any, options: {
    params?: HttpParams | Record<string, string | string[]>,
    headers?: HttpHeaders | Record<string, string | string[]>,
    responseType?: any,
    timeoutMs?: number
  } = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const timeoutValue = options.timeoutMs || this.defaultTimeout;

    return this.http.post<T>(url, body, options).pipe(
      timeout(timeoutValue),
      catchError(error => this.errorService.handleError(error))
    );
  }

  /**
   * @description
   * Sends a PUT request to the specified endpoint with a request body.
   * @param endpoint - Relative or absolute URL of the API endpoint.
   * @param body - Payload to send in the request body.
   * @param options - Optional configuration including headers, params, and timeout.
   * @returns An `Observable<T>` with the HTTP response.
   */
  protected put<T>(endpoint: string, body: any, options: {
    params?: HttpParams | Record<string, string | string[]>,
    headers?: HttpHeaders | Record<string, string | string[]>,
    responseType?: any,
    timeoutMs?: number
  } = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const timeoutValue = options.timeoutMs || this.defaultTimeout;

    return this.http.put<T>(url, body, options).pipe(
      timeout(timeoutValue),
      catchError(error => this.errorService.handleError(error))
    );
  }

  /**
   * @description
   * Sends a DELETE request to the specified endpoint.
   * @param endpoint - Relative or absolute URL of the API endpoint.
   * @param options - Optional configuration including headers, params, and timeout.
   * @returns An `Observable<T>` with the HTTP response.
   */
  protected delete<T>(endpoint: string, options: {
    params?: HttpParams | Record<string, string | string[]>,
    headers?: HttpHeaders | Record<string, string | string[]>,
    responseType?: any,
    timeoutMs?: number
  } = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const timeoutValue = options.timeoutMs || this.defaultTimeout;

    return this.http.delete<T>(url, options).pipe(
      timeout(timeoutValue),
      catchError(error => this.errorService.handleError(error))
    );
  }


  /**
  * @description
  * Establishes a Server-Sent Events (SSE) connection to the specified endpoint.
  *
  * @param endpoint - Relative or absolute URL of the SSE endpoint.
  * @param options - Optional configuration for the EventSource connection.
  * @returns An `Observable<MessageEvent>` that emits SSE messages.
  *
  * @example
  * ```ts
  * this.connectSSE<NotificationData>('/notifications')
  *   .subscribe({
  *     next: (event) => console.log('Received:', event.data),
  *     error: (error) => console.error('SSE Error:', error),
  *     complete: () => console.log('SSE Connection closed')
  *   });
  * ```
  */
  protected connectSSE<T = any>(
    endpoint: string,
    options: {
      withCredentials?: boolean;
      eventTypes?: string[];
    } = {}
  ): Observable<MessageEvent<T>> {
    const url = this.buildUrl(endpoint);

    return new Observable(observer => {
      const eventSource = new EventSource(url, {
        withCredentials: options.withCredentials ?? false
      });

      eventSource.onmessage = (event: MessageEvent) => {
        observer.next(event);
      };

      if (options.eventTypes && options.eventTypes.length > 0) {
        options.eventTypes.forEach(eventType => {
          eventSource.addEventListener(eventType, (event: MessageEvent) => {
            observer.next(event);
          });
        });
      }

      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    });
  }


  /**
   * @description
   * Establishes a WebSocket connection to the specified endpoint.
   *
   * @param endpoint - Relative or absolute URL of the WebSocket endpoint.
   * @param protocols - Optional WebSocket sub-protocols.
   * @returns An object containing observables for incoming messages and methods to send/close.
   *
   * @example
   * ```ts
   * const ws = this.connectWebSocket<ChatMessage>('/chat');
   *
   * ws.messages$.subscribe(msg => console.log('Received:', msg));
   * ws.connectionState$.subscribe(state => console.log('State:', state));
   *
   * ws.send({ type: 'chat', content: 'Hello!' });
   * ws.close();
   * ```
   */
  protected connectWebSocket<T = any>(
    endpoint: string,
    protocols?: string | string[]
  ): WebSocketConnection<T> {
    const url = this.buildWsUrl(endpoint);
    const messagesSubject = new Subject<T>();
    const connectionStateSubject = new Subject<WebSocketState>();
    let websocket: WebSocket | null = null;

    const connect = () => {
      websocket = new WebSocket(url, protocols);

      websocket.onopen = () => {
        connectionStateSubject.next('connected');
      };

      websocket.onmessage = (event: MessageEvent) => {
        try {
          const data = typeof event.data === 'string'
            ? JSON.parse(event.data)
            : event.data;
          messagesSubject.next(data);
        } catch (error) {
          messagesSubject.error(error);
        }
      };

      websocket.onerror = (error) => {
        connectionStateSubject.next('error');
        messagesSubject.error(error);
      };

      websocket.onclose = () => {
        connectionStateSubject.next('closed');
        messagesSubject.complete();
      };
    };

    connect();

    return {
      messages$: messagesSubject.asObservable(),
      connectionState$: connectionStateSubject.asObservable(),
      send: (data: T | string) => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          const message = typeof data === 'string' ? data : JSON.stringify(data);
          websocket.send(message);
        } else {
          throw new Error('WebSocket is not connected');
        }
      },
      close: (code?: number, reason?: string) => {
        if (websocket) {
          websocket.close(code, reason);
        }
      },
      reconnect: () => {
        if (websocket) {
          websocket.close();
        }
        connect();
      },
      getState: () => {
        if (!websocket) return 'closed';
        switch (websocket.readyState) {
          case WebSocket.CONNECTING: return 'connecting';
          case WebSocket.OPEN: return 'connected';
          case WebSocket.CLOSING: return 'closing';
          case WebSocket.CLOSED: return 'closed';
          default: return 'closed';
        }
      }
    };
  }



  /**
   * @description
   * Builds a full URL for an API call by prepending the base URL if the endpoint is relative.
   * @param endpoint - API endpoint to call. Can be a relative path (`/users`) or full URL.
   * @returns A fully qualified URL string.
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }
  /**
     * @description
     * Builds a full WebSocket URL by prepending the WebSocket base URL if the endpoint is relative.
     * @param endpoint - WebSocket endpoint to connect to.
     * @returns A fully qualified WebSocket URL string.
     */
  private buildWsUrl(endpoint: string): string {
    if (endpoint.startsWith('ws://') || endpoint.startsWith('wss://')) {
      return endpoint;
    }
    return `${this.wsUrl}${endpoint}`;
  }
}


