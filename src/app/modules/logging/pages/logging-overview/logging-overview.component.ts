import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LoggingService } from '../../services/logging.service';
import { Subject, takeUntil, map, Observable, shareReplay } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import Chart from 'chart.js/auto';


@Component({
  selector: 'app-logging-overview',
  templateUrl: './logging-overview.component.html',
  styleUrls: ['./logging-overview.component.css'],
  standalone: false
})
export class LoggingOverviewComponent implements OnInit, OnDestroy {

  mobileSidebarVisible = false;
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  toggleMobileSidebar() { this.mobileSidebarVisible = !this.mobileSidebarVisible; }

  private destroy$ = new Subject<void>();

  systemHealth: any = {};
  logDistribution: any = {};
  moduleBreakdown: any = {};
  timeline: any = {};
  criticalEvents: any[] = [];
  securityAlerts: any[] = [];
  insights: any = {};
  modules: any[] = [];
  metricsEvaluation: any = null;

  // Audit for overview
  auditRows: any[] = [];

  selectedCollection = 'ApplicationLogs';
  collectionLogs: any[] = [];

  collections = [
    { label: 'Application Logs', value: 'ApplicationLogs' },
    { label: 'Audit Trail', value: 'AuditTrail' },
    { label: 'Security Events', value: 'SecurityEvents' },
    { label: 'Error Logs', value: 'ErrorLogs' },
    { label: 'Performance Metrics', value: 'PerformanceMetrics' }
  ];

  // Database metrics
  dbHealth: any = {
    status: 'UNKNOWN',
    latencyMs: 0,
    lastPing: null,
    errorRate1m: 0,
    processUptimeSec: 0
  };

  poolMetrics: any = {
    total: 0,
    active: 0,
    idle: 0,
    waitQueueSize: 0,
    utilizationRate: 0,
    maxPoolSize: 20,
    minPoolSize: 5,
    totalCreated: 0,
    totalClosed: 0,
    errorRate1m: 0
  };

  cpuMetrics: any = {
    current: 0,
    average5m: 0,
    peak: 0,
    cores: 0,
    loadAverage: [],
    memoryUsagePercent: 0
  };

  dbAnalysis: any = {
    slowQueries: [],
    totalSlowQueries: 0,
    currentOperations: 0,
    collectionStats: [],
    averageExecutionTime: 0,
    thresholds: { warning: 2000, critical: 5000 }
  };

  private autoRefreshInterval: any;

  private moduleChart!: Chart;
  private timelineChart!: Chart;
  private distributionChart!: Chart;

  constructor(
    private loggingService: LoggingService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private responsive: ResponsiveService
  ) {
    this.isTablet$ = this.responsive.isTablet$();
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  ngOnInit() {
    this.isMobile$ = this.responsive.isMobile$();
    this.loadOverview();
    this.loadModules();
    this.loadCollectionLogs();
    this.loadAudit();
    this.loadDatabaseMetrics();
    this.loadMetricsEvaluation();

    // Auto-refresh metrics every 30 seconds
    this.autoRefreshInterval = setInterval(() => {
      this.loadDatabaseMetrics();
      this.loadMetricsEvaluation();
    }, 30000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.moduleChart) this.moduleChart.destroy();
    if (this.timelineChart) this.timelineChart.destroy();
    if (this.distributionChart) this.distributionChart.destroy();

    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  loadOverview() {
    this.loggingService.getOverview()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.systemHealth = data.systemHealth;
        this.logDistribution = data.logDistribution;
        this.moduleBreakdown = data.moduleBreakdown;
        this.timeline = data.timeline;
        this.criticalEvents = data.criticalEvents;
        this.securityAlerts = data.securityAlerts;
        this.insights = data.insights;
        this.renderCharts();
      });
  }

  loadModules() {
    this.loggingService.getModules()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.modules = data.modules;
      });
  }

  loadCollectionLogs() {
    this.loggingService.getCollectionLogs(this.selectedCollection)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.collectionLogs = data.data;
      });
  }

  onCollectionChange() {
    this.loadCollectionLogs();
  }

  navigateToModule(module: any) {
    const sourceMapping: { [key: string]: string } = {
      'MongoDB Administration': 'mongoAdmin',
      'Tag Utilization': 'tagUtilization',
      'Attribute Search': 'attributeSearch',
      'Datapoint Administration': 'dataPoint',
      'SchedulerJob Administration': 'schedulerJob',
      'Email Administration': 'email',
      'ReportImage Administration': 'reportImage',
      'Config Administration': 'config',
      'PI Administration': 'piAdmin',
      'Database Administration': 'databaseAdmin',
      'DataSource Administration': 'datasourceAdmin'
    };

    const sourceValue = sourceMapping[module.label] || module.value || module.route || 'mongoAdmin';

    this.router.navigate(['/logging/dashboard'], {
      queryParams: { source: sourceValue }
    });
  }

  getHealthStatusClass(): string {
    switch (this.systemHealth.status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getHealthStatusIcon(): string {
    switch (this.systemHealth.status) {
      case 'healthy': return 'pi-check-circle';
      case 'warning': return 'pi-exclamation-triangle';
      case 'critical': return 'pi-times-circle';
      default: return 'pi-info-circle';
    }
  }

  renderCharts() {
    setTimeout(() => {
      this.renderModuleChart();
      this.renderTimelineChart();
      this.renderDistributionChart();
    }, 100);
  }

  renderModuleChart() {
    if (this.moduleChart) this.moduleChart.destroy();

    const ctx = document.getElementById('moduleChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.moduleChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.moduleBreakdown.labels,
        datasets: [{
          label: 'Log Count',
          data: this.moduleBreakdown.values,
          backgroundColor: '#3B82F6',
          borderColor: '#1D4ED8',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  renderTimelineChart() {
    if (this.timelineChart) this.timelineChart.destroy();

    const ctx = document.getElementById('timelineChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.timelineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.timeline.labels,
        datasets: [{
          label: 'Daily Activity',
          data: this.timeline.values,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  renderDistributionChart() {
    if (this.distributionChart) this.distributionChart.destroy();

    const ctx = document.getElementById('distributionChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.distributionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Application Logs', 'Audit Trail', 'Error Logs', 'Security Events', 'Performance Metrics'],
        datasets: [{
          data: [
            this.logDistribution.applicationLogs,
            this.logDistribution.auditTrail,
            this.logDistribution.errorLogs,
            this.logDistribution.securityEvents,
            this.logDistribution.performanceMetrics
          ],
          backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }

  private loadAudit() {
    this.loggingService.getAudit({ limit: 50 }).subscribe(r => this.auditRows = r.data || []);
  }

  loadDatabaseMetrics() {
    // Load all database metrics concurrently
    this.loggingService.getDbHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => this.dbHealth = data,
        error => console.error('Error loading DB health:', error)
      );

    this.loggingService.getDbPool()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => this.poolMetrics = data,
        error => console.error('Error loading pool metrics:', error)
      );

    this.loggingService.getCpuMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => this.cpuMetrics = data,
        error => console.error('Error loading CPU metrics:', error)
      );

    this.loggingService.getDbAnalysis()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => this.dbAnalysis = data,
        error => console.error('Error loading DB analysis:', error)
      );
  }

  getDbStatusClass(): string {
    switch (this.dbHealth.status) {
      case 'UP': return 'text-green-600';
      case 'DEGRADED': return 'text-yellow-600';
      case 'DOWN': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getDbStatusIcon(): string {
    switch (this.dbHealth.status) {
      case 'UP': return 'pi-check-circle';
      case 'DEGRADED': return 'pi-exclamation-triangle';
      case 'DOWN': return 'pi-times-circle';
      default: return 'pi-info-circle';
    }
  }

  getPoolUtilizationClass(): string {
    if (this.poolMetrics.utilizationRate >= 90) return 'bg-red-500';
    if (this.poolMetrics.utilizationRate >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getCpuUsageClass(): string {
    if (this.cpuMetrics.current >= 90) return 'text-red-600';
    if (this.cpuMetrics.current >= 70) return 'text-yellow-600';
    return 'text-green-600';
  }

  getCpuProgressClass(): string {
    if (this.cpuMetrics.current >= 90) return 'bg-red-500';
    if (this.cpuMetrics.current >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  formatUptime(seconds: number): string {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  loadMetricsEvaluation() {
    this.loggingService.evaluateMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => this.metricsEvaluation = data,
        error => console.error('Error loading metrics evaluation:', error)
      );
  }

  navigateToMetricsConfig() {
    this.router.navigate(['/logging/metrics-config']);
  }
}