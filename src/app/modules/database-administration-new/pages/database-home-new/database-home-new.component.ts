import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';

@Component({
  selector: 'app-database-home-new',
  standalone: false,
  templateUrl: './database-home-new.component.html',
  styleUrl: './database-home-new.component.css'
})
export class DatabaseHomeNewComponent implements OnInit {
  mobileSidebarVisible = false;
  labels: string[] = [];
  selectedLabel: string | null = null;

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  constructor(
    private labelService: LabelService
  ) { }

  ngOnInit(): void {
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
