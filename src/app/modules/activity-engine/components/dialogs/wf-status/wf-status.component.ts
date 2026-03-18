import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivityEngineComponent } from '../../../activity-engine.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-wf-status',
  standalone: false,
  templateUrl: './wf-status.component.html',
  styleUrl: './wf-status.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class WfStatusComponent extends ActivityEngineComponent implements OnInit {
  workflowSteps: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    console.log(this.dialogConfig.data?.instanceId);
    this.getWorkflowStatus(this.dialogConfig.data?.instanceId);
  }

  getWorkflowStatus(instanceId: string) {
    this.activityService.getInstanceStatus(instanceId).subscribe((res: any) => {
      try {
        const parsed = Array.isArray(res?.data) ? res.data : JSON.parse(res?.data ?? '[]');
        this.workflowSteps = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        this.workflowSteps = [];
      }
      this.cdr.markForCheck();
    })
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
      case 'success':
      case 'completed':
      case 'done':
        return 'success';
      case 'executing':
      case 'running':
      case 'processing':
        return 'info';
      case 'pending':
      case 'queued':
      case 'initializing':
        return 'warn';
      case 'failed':
      case 'error':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
