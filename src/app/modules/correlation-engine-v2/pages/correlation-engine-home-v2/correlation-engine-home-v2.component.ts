import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';

@Component({
  selector: 'app-correlation-engine-home-v2',
  standalone: false,
  templateUrl: './correlation-engine-home-v2.component.html',
  styleUrl: './correlation-engine-home-v2.component.css'
})
export class CorrelationEngineHomeV2Component implements OnInit {
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;
  mobileSidebarVisible = false;
  labels: string[] = [];
  selectedLabel: string | null = null;

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  constructor(
    private breakpointObserver: BreakpointObserver,
    private responsive: ResponsiveService,
    private labelService: LabelService
  ) {
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();
    this.loadLabels();
    this.labelService.selectedLabel$.subscribe(label => {
      this.selectedLabel = label;
    });
  }

  loadLabels(): void {
    this.labelService.getAllLabels().subscribe({
      next: (labels) => {
        this.labels = labels;
      },
      error: (error) => {
        console.error('Error loading labels:', error);
      }
    });
  }

  onLabelChange(): void {
    this.labelService.setSelectedLabel(this.selectedLabel);
  }
}
