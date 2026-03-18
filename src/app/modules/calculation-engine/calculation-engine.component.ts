import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { map, shareReplay } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-calculation-engine',
  standalone: false,
  templateUrl: './calculation-engine.component.html',
  styleUrl: './calculation-engine.component.css'
})
export class CalculationEngineComponent implements OnInit {
  mobileSidebarVisible = false;
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  constructor( private BreakpointObserver: BreakpointObserver, private responsive: ResponsiveService)
  {
       this.isMobile$ = this.BreakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }
  ngOnInit(): void {
      this.isMobile$ = this.responsive.isMobile$();
      this.isTablet$ = this.responsive.isTablet$();
  }

    toggleMobileSidebar() { this.mobileSidebarVisible = !this.mobileSidebarVisible; }
}
