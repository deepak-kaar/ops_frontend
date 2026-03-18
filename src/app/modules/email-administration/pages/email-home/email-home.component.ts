import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';
import { EmailAdministrationComponent } from '../../email-administration.component';

@Component({
  selector: 'app-email-home',
  standalone: false,
  templateUrl: './email-home.component.html',
  styleUrls: ['./email-home.component.css']
})
export class EmailHomeComponent implements OnInit, OnDestroy {
  mobileSidebarVisible = false;

  /** Rollout label properties */
  private labelSub!: Subscription;
  labels: string[] = [];
  selectedLabel: string | null = null;

  constructor(
    private labelService: LabelService
  ) {}

  ngOnInit(): void {
    // Rollout label subscription
    this.labelSub = this.labelService.selectedLabel$.subscribe(label => {
      this.selectedLabel = label;
    });
    this.loadLabels();
  }

  ngOnDestroy(): void {
    if (this.labelSub) {
      this.labelSub.unsubscribe();
    }
    document.body.style.overflow = '';
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
    if (this.mobileSidebarVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
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
