import { Component, OnInit, inject } from '@angular/core';
import { Observable, filter, map, shareReplay } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { PageRendererService } from './services/page-renderer.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-page-renderer',
  templateUrl: './page-renderer.component.html',
  styleUrl: './page-renderer.component.css',
  standalone: false,
})
export class PageRendererComponent{

  mobileSidebarVisible = false;
  sidebarCollapsed = true; // MDE/Reports start with sidebar collapsed
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;
  toggleMobileSidebar() { this.mobileSidebarVisible = !this.mobileSidebarVisible; }
  protected readonly filterService = inject(FilterService);
  protected readonly pageRendererService = inject(PageRendererService);
  protected readonly responsive = inject(ResponsiveService);
  protected readonly BreakpointObserver = inject(BreakpointObserver);

  hideSidebar = false;

  constructor(private router: Router) {
    this.isMobile$ = this.BreakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches),
      shareReplay()
    );
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.hideSidebar = event.urlAfterRedirects.includes('report-pdf');
      });
  }

  onSidebarToggle(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

}

