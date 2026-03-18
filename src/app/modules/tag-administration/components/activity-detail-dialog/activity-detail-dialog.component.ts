import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-activity-detail-dialog',
  standalone: false,
  templateUrl: './activity-detail-dialog.component.html',
  styleUrls: ['./activity-detail-dialog.component.css']
})
export class ActivityDetailDialogComponent implements OnInit {
  activityData: any;
  workflowSteps: any[] = [];
  isDataLoaded: boolean = false;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.activityData = this.config.data?.activity;

    if (this.activityData) {
      // Extract workflow steps
      if (this.activityData.workflowSteps && Array.isArray(this.activityData.workflowSteps)) {
        this.workflowSteps = this.activityData.workflowSteps;
      }
      this.isDataLoaded = true;
    }
  }

  // Helper method to get step IDs as array
  getStepIds(stepId: any): string[] {
    if (!stepId) return [];
    return Object.entries(stepId).map(([key, value]) => `${key}: ${value}`);
  }
}
