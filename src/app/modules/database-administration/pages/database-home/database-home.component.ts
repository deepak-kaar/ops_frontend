import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-database-home',
  standalone: false,
  templateUrl: './database-home.component.html',
  styleUrl: './database-home.component.css'
})
export class DatabaseHomeComponent implements OnInit {

  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;
  mobileSidebarVisible = false;


  // ==================== SIDEBAR & NAVIGATION ====================

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }


  constructor(
    private breakpointObserver: BreakpointObserver,
    private responsive: ResponsiveService
  ) {
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();
  }

}
