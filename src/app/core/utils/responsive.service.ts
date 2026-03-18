import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {

  constructor(
    private breakpointObserver : BreakpointObserver
  ) { }
  
  isMobile$():Observable<boolean>{
    return this.breakpointObserver.observe([Breakpoints.XSmall])
      .pipe(
        map((result:any) => result.matches),
        shareReplay(1)
      );
  }
  
  isTablet$():Observable<boolean>{
    return this.breakpointObserver.observe([Breakpoints.Small])
      .pipe(
        map((result:any) => result.matches),
        shareReplay(1)
      );
  }
  
  isDesktop$():Observable<boolean>{
    return this.breakpointObserver.observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(
        map((result:any) => result.matches),
        shareReplay(1)
      );
  }
  
  isHandset$():Observable<boolean>{
    return this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(
        map((result:any) => result.matches),
        shareReplay(1)
      );
  }
}
