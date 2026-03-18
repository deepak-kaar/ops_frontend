import { Component, inject, OnInit } from '@angular/core';
import { ReportPublishAdministrationService } from './services/reportpublish-administration.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Observable } from 'rxjs';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';

@Component({
  selector: 'app-reportpublish-administration',
  standalone: false,
  templateUrl: './reportpublish-administration.component.html',
  styleUrl: './reportpublish-administration.component.css'
})
export class ReportPublishAdministrationComponent implements OnInit {

  protected readonly reportPublishService = inject(ReportPublishAdministrationService);
  protected readonly messageService = inject(MessageService);
  protected readonly spinner = inject(NgxSpinnerService);
  protected readonly filterService = inject(FilterService);
  protected readonly dialog = inject(DialogService);
  private readonly responsive = inject(ResponsiveService);
  private readonly labelService = inject(LabelService);

  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;
  mobileSidebarOpen: boolean = false;
  labels: string[] = [];
  selectedLabel: string | null = null;

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();
    this.loadLabels();
    this.labelService.selectedLabel$.subscribe(label => {
      this.selectedLabel = label;
    });
  }

  toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  loadLabels(): void {
    this.labelService.getAllLabels().subscribe({
      next: (labels) => { this.labels = labels; },
      error: (error) => { console.error('Error loading labels:', error); }
    });
  }

  onLabelChange(): void {
    this.labelService.setSelectedLabel(this.selectedLabel);
  }

  /**
   * Shows a toast notification
   */
  protected showToast(severity: string, summary: string, detail: string, life: number, sticky: boolean) {
    this.messageService.add({ severity, summary, detail, life, sticky });
  }
}
