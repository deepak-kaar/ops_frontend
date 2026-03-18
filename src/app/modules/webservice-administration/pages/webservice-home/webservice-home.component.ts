import { Component, OnInit } from '@angular/core';
import { WebserviceAdministrationComponent } from '../../webservice-administration.component';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';

@Component({
  selector: 'app-webservice-home',
  standalone: false,
  templateUrl: './webservice-home.component.html',
  styleUrl: './webservice-home.component.css'
})
export class WebserviceHomeComponent extends WebserviceAdministrationComponent implements OnInit {
  mobileSidebarVisible = false;
  labels: string[] = [];
  selectedLabel: string | null = null;

  constructor(
    private labelService: LabelService
  ) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadLabels();
    
    // Subscribe to label changes
    this.labelService.selectedLabel$.subscribe(label => {
      this.selectedLabel = label;
    });
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
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
