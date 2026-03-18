import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-schedulerjob-home-new',
  standalone: false,
  templateUrl: './schedulerjob-home-new.component.html',
  styleUrl: './schedulerjob-home-new.component.css'
})
export class SchedulerjobHomeNewComponent implements OnInit, OnDestroy {
  showRoutingCards: boolean = true;
  mobileSidebarOpen: boolean = false;
  private routerSub!: Subscription;
  mobileSidebarVisible = false;
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  constructor(private router: Router, private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.checkRoute(this.router.url);

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects || event.url);
    });

    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.XSmall])
      .pipe(map(result => result.matches));

    this.isTablet$ = this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Medium])
      .pipe(map(result => result.matches));
  }

  private checkRoute(url: string): void {
    const lowercaseUrl = url.toLowerCase();
    this.showRoutingCards = !lowercaseUrl.includes('create') &&
      !lowercaseUrl.includes('edit') &&
      !lowercaseUrl.includes('manage');
  }

  toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
    if (this.mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
    document.body.style.overflow = '';
  }

  get isMobile(): Observable<boolean> {
    return this.isMobile$;
  }

  get isTablet(): Observable<boolean> {
    return this.isTablet$;
  }
}
