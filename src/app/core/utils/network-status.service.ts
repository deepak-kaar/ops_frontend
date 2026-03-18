import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, map, merge, startWith, Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {

  private destroy$ = new Subject<void>();
  
  // BehaviorSubject so late subscribers get the latest status immediately
  private onlineStatus$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    this.monitorNetworkStatus();
  }

  private monitorNetworkStatus(): void {
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));

    merge(online$, offline$)
      .pipe(
        startWith(navigator.onLine),
        takeUntil(this.destroy$)
      )
      .subscribe((isOnline: boolean) => {
        console.log(`Network status changed: ${isOnline ? 'Online' : 'Offline'}`);
        this.onlineStatus$.next(isOnline);
      });
  }

  // Expose as observable
  getNetworkStatus() {
    return this.onlineStatus$.asObservable();
  }

  
  isOnlineNow(): boolean {
    return this.onlineStatus$.value;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
