import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoggingService } from '../../services/logging.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-metrics-config',
  standalone: false,
  templateUrl: './metrics-config.component.html',
  styleUrls: ['./metrics-config.component.css']
})
export class MetricsConfigComponent implements OnInit {
  metricsConfig: any = {};
  originalConfig: any = {};

  metricsList = [
    { key: 'errorRate', label: 'Error Rate', unit: '%' },
    { key: 'recentErrors', label: 'Recent Errors (24h)', unit: 'count' },
    { key: 'securityEvents', label: 'Security Events (24h)', unit: 'count' },
    { key: 'databaseHealth', label: 'Database Health', unit: '%' },
    { key: 'connectionPool', label: 'Connection Pool Usage', unit: '%' },
    { key: 'cpuUsage', label: 'CPU Usage', unit: '%' },
    { key: 'memoryUsage', label: 'Memory Usage', unit: '%' },
    { key: 'queryPerformance', label: 'Query Performance', unit: 's' }
  ];

  constructor(
    private loggingService: LoggingService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMetricsConfig();
  }

  loadMetricsConfig(): void {
    this.spinner.show();
    this.loggingService.getMetricsConfig().subscribe({
      next: (res: any) => {
        this.metricsConfig = res.data;
        // Convert queryPerformance from ms to seconds
        if (this.metricsConfig.queryPerformance) {
          ['healthy', 'warning', 'critical'].forEach(level => {
            if (this.metricsConfig.queryPerformance[level]) {
              if (this.metricsConfig.queryPerformance[level].min !== undefined) {
                this.metricsConfig.queryPerformance[level].min /= 1000;
              }
              if (this.metricsConfig.queryPerformance[level].max !== undefined) {
                this.metricsConfig.queryPerformance[level].max /= 1000;
              }
            }
          });
        }
        this.originalConfig = JSON.parse(JSON.stringify(res.data));
        this.spinner.hide();
      },
      error: (err: any) => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load metrics configuration'
        });
      }
    });
  }

  saveMetricsConfig(): void {
    this.spinner.show();
    // Convert queryPerformance from seconds back to ms before saving
    const configToSave = JSON.parse(JSON.stringify(this.metricsConfig));
    if (configToSave.queryPerformance) {
      ['healthy', 'warning', 'critical'].forEach(level => {
        if (configToSave.queryPerformance[level]) {
          if (configToSave.queryPerformance[level].min !== undefined) {
            configToSave.queryPerformance[level].min *= 1000;
          }
          if (configToSave.queryPerformance[level].max !== undefined) {
            configToSave.queryPerformance[level].max *= 1000;
          }
        }
      });
    }
    this.loggingService.updateMetricsConfig(configToSave).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Metrics configuration updated successfully'
        });
        this.originalConfig = JSON.parse(JSON.stringify(configToSave));
      },
      error: (err: any) => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update metrics configuration'
        });
      }
    });
  }

  resetToDefaults(): void {
    this.spinner.show();
    this.loggingService.resetMetricsConfig().subscribe({
      next: (res: any) => {
        this.metricsConfig = res.data;
        // Convert queryPerformance from ms to seconds
        if (this.metricsConfig.queryPerformance) {
          ['healthy', 'warning', 'critical'].forEach(level => {
            if (this.metricsConfig.queryPerformance[level]) {
              if (this.metricsConfig.queryPerformance[level].min !== undefined) {
                this.metricsConfig.queryPerformance[level].min /= 1000;
              }
              if (this.metricsConfig.queryPerformance[level].max !== undefined) {
                this.metricsConfig.queryPerformance[level].max /= 1000;
              }
            }
          });
        }
        this.originalConfig = JSON.parse(JSON.stringify(res.data));
        this.spinner.hide();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Metrics reset to default values'
        });
      },
      error: (err: any) => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reset metrics'
        });
      }
    });
  }

  cancelChanges(): void {
    this.metricsConfig = JSON.parse(JSON.stringify(this.originalConfig));
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelled',
      detail: 'Changes discarded'
    });
  }

  hasChanges(): boolean {
    return JSON.stringify(this.metricsConfig) !== JSON.stringify(this.originalConfig);
  }

  goBack(): void {
    this.router.navigate(['/logging']);
  }
}
