import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import Chart from 'chart.js/auto';
import * as monaco from 'monaco-editor';
import { LoggingService } from '../../services/logging.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { map, Observable, shareReplay, Subject, takeUntil } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-logging-dashboard',
  templateUrl: './logging-dashboard.component.html',
  styleUrls: ['./logging-dashboard.component.css'],
  standalone: false
})
export class LoggingDashboardComponent implements OnInit, OnDestroy {

  mobileSidebarVisible = false;
  isMobile$!: Observable<boolean>;

  toggleMobileSidebar() { this.mobileSidebarVisible = !this.mobileSidebarVisible; }

  private destroy$ = new Subject<void>();

  categories = [
    { label: 'Application Logs', value: 'ApplicationLogs' },
    { label: 'Audit Trail', value: 'AuditTrail' },
    { label: 'Security Events', value: 'SecurityEvents' },
    { label: 'Error Logs', value: 'ErrorLogs' },
    { label: 'Performance Metrics', value: 'PerformanceMetrics' }
  ];

  sources = [
    { label: 'MongoDB Administration', value: 'mongoAdmin' },
    { label: 'Tag Utilization', value: 'tagUtilization' },
    { label: 'Attribute Search', value: 'attributeSearch' },
    { label: 'Datapoint Administration', value: 'dataPoint' },
    { label: 'SchedulerJob Administration', value: 'schedulerJob' },
    { label: 'Email Administration', value: 'email' },
    { label: 'ReportImage Administration', value: 'reportImage' },
    { label: 'Config Administration', value: 'config' },
    { label: 'PI Administration', value: 'piAdmin' },
    { label: 'Database Administration', value: 'databaseAdmin' },
    { label: 'DataSource Administration', value: 'datasourceAdmin' }
  ];

  selectedSource = 'mongoAdmin';
  selectedCategory = 'ApplicationLogs';
  logs: any[] = [];
  filteredLogs: any[] = [];

  searchText = '';
  dateFilter = '';

  modalVisible = false;
  selectedLogJson = '';

  summary = { total: 0, errors: 0, security: 0, audit: 0 };
  avgResponseTime = 0;

  private editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

  jsonEditorOptions = {
    theme: 'vs-dark',
    language: 'json',
    automaticLayout: false,
    minimap: { enabled: false },
    fontSize: 15,
    lineHeight: 22,
    padding: { top: 15, bottom: 15 },
    scrollBeyondLastLine: false,
    formatOnPaste: true,
    wordWrap: 'on'
  };

  private pieChart!: Chart;
  private responseTimeChart!: Chart;
  private donutChart!: Chart;
  // Add this property
isTablet$!: Observable<boolean>;


  constructor(
    private logService: LoggingService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
    private BreakpointObserver: BreakpointObserver,
    private responsive: ResponsiveService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isTablet$ = this.responsive.isTablet$();

    this.isMobile$ = this.BreakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  ngOnInit() {
    this.isMobile$ = this.responsive.isMobile$()
    
    // Check for source query parameter
    this.route.queryParams.subscribe(params => {
      if (params['source']) {
        this.selectedSource = params['source'];
      }
    });
    
    this.loadSummary();
    this.loadLogsByCategory();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();


    if (this.pieChart) this.pieChart.destroy();
    if (this.responseTimeChart) this.responseTimeChart.destroy();
    if (this.donutChart) this.donutChart.destroy();


    if (this.editorInstance) this.editorInstance.dispose();
  }

  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editorInstance = editor;
  }

  loadSummary() {
    this.logService.getAllSummaries(this.selectedSource)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.summary = res;
        this.avgResponseTime = Math.round(Math.random() * 200 + 50);
        this.renderCharts(res.chartData);
      });
  }

  changeCategory(category: string) {
    this.selectedCategory = category;
    this.loadLogsByCategory();
  }

  changeSource(source: string) {
    this.selectedSource = source;
    this.loadSummary();
    this.loadLogsByCategory();
  }

  loadLogsByCategory() {
    this.logService.getLogs(this.selectedCategory, this.selectedSource)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.logs = res.data || [];
        this.filteredLogs = [...this.logs];
      });
  }

  applyFilter() {
    const search = this.searchText.toLowerCase();

    this.filteredLogs = this.logs.filter(log => {
      const textMatch = JSON.stringify(log).toLowerCase().includes(search);
      const dateMatch = this.dateFilter
        ? log.timestamp?.substring(0, 10) === this.dateFilter
        : true;
      return textMatch && dateMatch;
    });
  }

  openModal(log: any) {
    this.selectedLogJson = JSON.stringify(log, null, 2);
    this.modalVisible = true;

    setTimeout(() => {
      this.editorInstance?.layout();
    }, 400);
  }

  renderCharts(data: any) {

    if (this.pieChart) this.pieChart.destroy();
    if (this.responseTimeChart) this.responseTimeChart.destroy();
    if (this.donutChart) this.donutChart.destroy();

    this.pieChart = new Chart("pieChart", {
      type: "pie",
      data: {
        labels: ["Application", "Audit", "Errors", "Security"],
        datasets: [{
          data: data.pie,
          backgroundColor: ["#0096FF", "#34A853", "#EA4335", "#FBBC04"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,      // <<< IMPORTANT FOR BIGGER CHART
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 5,
              font: {
                size: 12,
                weight: 500
              }
            }
          }
        }
      }
    });


    this.responseTimeChart = new Chart("responseTimeChart", {
      type: "line",
      data: {
        labels: ['Last 7 Days', 'Last 6 Days', 'Last 5 Days', 'Last 4 Days', 'Last 3 Days', 'Yesterday', 'Today'],
        datasets: [{
          label: "Avg Response Time (ms)",
          data: this.generateResponseTimeData(),
          borderColor: "#36A2EB",
          backgroundColor: "rgba(54, 162, 235, 0.1)",
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Response Time (ms)'
            }
          }
        }
      }
    });

    this.donutChart = new Chart("donutChart", {
      type: "doughnut",
      data: {
        labels: ['GET Requests', 'POST Requests', 'PUT Requests', 'DELETE Requests'],
        datasets: [{
          label: "Activity Patterns",
          data: this.generateActivityData(),
          backgroundColor: ["#4BC0C0", "#36A2EB", "#FFCE56", "#FF6384"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 5,
              font: {
                size: 12,
                weight: 500
              }
            }
          }
        }
      }
    });

  }

  getSuccessRate(): number {
    const total = this.summary.total;
    const errors = this.summary.errors;
    return total > 0 ? Math.round(((total - errors) / total) * 100) : 100;
  }

  getAvgResponseTime(): number {
    return this.avgResponseTime;
  }

  getErrorRateInsight(): string {
    const errorRate = (this.summary.errors / this.summary.total) * 100;
    if (errorRate < 1) return 'Excellent: Error rate below 1%';
    if (errorRate < 5) return 'Good: Error rate within acceptable range';
    return 'Attention: High error rate detected';
  }

  getPerformanceInsight(): string {
    const avgTime = this.getAvgResponseTime();
    if (avgTime < 100) return 'Excellent: Fast response times';
    if (avgTime < 200) return 'Good: Normal response times';
    return 'Attention: Slow response times detected';
  }

  getSecurityInsight(): string {
    const securityEvents = this.summary.security;
    if (securityEvents === 0) return 'Secure: No security alerts';
    if (securityEvents < 5) return 'Monitor: Few security events detected';
    return 'Alert: Multiple security events require attention';
  }

  generateResponseTimeData(): number[] {
    return Array.from({length: 7}, () => Math.round(Math.random() * 150 + 50));
  }

  generateActivityData(): number[] {
    const total = this.summary.total;
    return [
      Math.round(total * 0.6),
      Math.round(total * 0.2),
      Math.round(total * 0.15),
      Math.round(total * 0.05)
    ];
  }

  goBackToOverview(): void {
    this.router.navigate(['/logging']);
  }

}
