import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';

@Component({
  selector: 'app-datasource-home-new',
  standalone: false,
  templateUrl: './datasource-home-new.component.html',
  styleUrl: './datasource-home-new.component.css'
})
export class DatasourceHomeNewComponent implements OnInit {
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;
  mobileSidebarVisible = false;
  labels: string[] = [];
  selectedLabel: string | null = null;

  // ==================== SIDEBAR & NAVIGATION ====================

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

    // Subscribe to label changes
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
