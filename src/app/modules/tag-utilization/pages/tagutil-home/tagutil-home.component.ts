import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { TagUtilizationService } from '../../tag-utilization.service';
import { MessageService } from 'primeng/api';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { ExportService } from 'src/app/core/services/export.service';

@Component({
  selector: 'app-tag-home',
  standalone: false,
  templateUrl: './tagutil-home.component.html',
  styleUrls: ['./tagutil-home.component.css'],
  providers: [MessageService]
})
export class TagUtilHomeComponent implements OnInit {
  mobileSidebarVisible = false;
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  // Table Data
  entityData: any[] = [];
  attributeData: any[] = [];
  instanceData: any[] = [];
  calculationData: any[] = [];
  correlationData: any[] = [];
  activityData: any[] = [];
  idtData: any[] = [];

  //bussiness transaction
  auditTrailData: any[] = [];


  activeDeptData: any[] = [];

  // Filter Variables
  selectedApp: any = null;
  selectedOrg: any = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  isLoading = false;
  errorMessage = '';

  // Accordion state
  activeAccordionIndices: number[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private tagUtilService: TagUtilizationService,
    private messageService: MessageService,
    private pageAdminService: PageAdministratorService,
    private exportService: ExportService
  ) {
    this.isMobile$ = this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(map(result => result.matches), shareReplay());
    this.isTablet$ = this.breakpointObserver
      .observe([Breakpoints.Tablet])
      .pipe(map(result => result.matches), shareReplay());
  }

  ngOnInit(): void {
    this.loadAppsAndOrgs();
  }

  loadAppsAndOrgs(): void {
    this.pageAdminService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.apps.map((app: any) => ({
          appId: app.appId,
          appName: app.appName
        }));
      }
    });
    this.pageAdminService.getOrgsWithoutByApp().subscribe({
      next: (res: any) => {
        this.orgs = res.Organization.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }));
      }
    });
  }






  // ---------------- MOBILE SIDEBAR ----------------

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  // ---------------- FILTERS ----------------

  onFiltersChanged(filters: any): void {
    this.selectedApp = filters.app;
    this.selectedOrg = filters.org;
    this.fromDate = filters.fromDate;
    this.toDate = filters.toDate;
    this.errorMessage = '';
  }

  // ---------------- SEARCH ----------------

  onSearch(): void {
    if (!this.fromDate || !this.toDate) {
      this.errorMessage = 'Please select both From Date and To Date.';
      this.showToast('error', 'Validation Error', this.errorMessage);
      return;
    }

    if (this.toDate < this.fromDate) {
      this.errorMessage = 'To Date cannot be less than From Date.';
      this.showToast('error', 'Validation Error', this.errorMessage);
      return;
    }

    const today = new Date();
    if (this.fromDate > today || this.toDate > today) {
      this.errorMessage = 'Dates cannot be in the future.';
      this.showToast('error', 'Validation Error', this.errorMessage);
      return;
    }

    this.errorMessage = '';
    this.performSearch();
  }

  performSearch(): void {
    const params: any = {
      fromDate: this.tagUtilService.formatDate(this.fromDate!),
      toDate: this.tagUtilService.formatDate(this.toDate!),
    };

    if (this.selectedApp?.appId) params.appId = this.selectedApp.appId;
    if (this.selectedOrg?.orgId) params.orgId = this.selectedOrg.orgId;

    this.getTagSearchValues(params);
  }


  summary: any = {};
  summaryTable: any[] = [];
  reportGenLogData: any[] = [];
  screenAccessLogData: any[] = [];
  activePagesData: any[] = [];
  reportAccessLogData: any[] = [];

  // Filters
  reportGenFilterBy: string = '';
  reportGenFilterAt: Date | null = null;
  reportGenFilterApp: string = '';
  reportGenFilterOrg: string = '';
  reportAccessFilterBy: string = '';
  reportAccessFilterAt: Date | null = null;
  reportAccessFilterApp: string = '';
  reportAccessFilterOrg: string = '';
  screenAccessFilterBy: string = '';
  screenAccessFilterAt: Date | null = null;
  screenAccessFilterApp: string = '';
  screenAccessFilterOrg: string = '';
  screenUpdateFilterBy: string = '';
  screenUpdateFilterAt: Date | null = null;
  screenUpdateFilterApp: string = '';
  screenUpdateFilterOrg: string = '';
  activePagesFilterType: string = '';
  activePagesFilterBy: string = '';
  activePagesFilterAt: Date | null = null;
  activePagesFilterApp: string = '';
  activePagesFilterOrg: string = '';
  activeDeptFilterApp: string = '';
  activeDeptFilterOrg: string = '';
  businessTransFilterApp: string = '';
  businessTransFilterOrg: string = '';
  screenUpdateLogData: any[] = [];
  apps: any[] = [];
  orgs: any[] = [];


  getTagSearchValues(params: any): void {
    this.isLoading = true;

    this.tagUtilService.getTagSearchValues(params).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response?.isData && response?.searchResults) {


          // business transaction
          this.summary = response.summary || {};
          this.summaryTable = [
            {
              name: 'Entity',
              count: this.summary.entity?.count || 0,
              first: this.summary.entity?.firstCreatedOn || '-',
              last: this.summary.entity?.lastCreatedOn || '-'
            },
            {
              name: 'Attribute',
              count: this.summary.attribute?.count || 0,
              first: this.summary.attribute?.firstCreatedOn || '-',
              last: this.summary.attribute?.lastCreatedOn || '-'
            },
            {
              name: 'Instance',
              count: this.summary.instance?.count || 0,
              first: this.summary.instance?.firstCreatedOn || '-',
              last: this.summary.instance?.lastCreatedOn || '-'
            },
            {
              name: 'Calculation Engine',
              count: this.summary.calculation?.count || 0,
              first: this.summary.calculation?.firstCreatedOn || '-',
              last: this.summary.calculation?.lastCreatedOn || '-'
            },
            {
              name: 'Correlation Engine',
              count: this.summary.correlation?.count || 0,
              first: this.summary.correlation?.firstCreatedOn || '-',
              last: this.summary.correlation?.lastCreatedOn || '-'
            },
            {
              name: 'Activity Engine',
              count: this.summary.activity?.count || 0,
              first: this.summary.activity?.firstCreatedOn || '-',
              last: this.summary.activity?.lastCreatedOn || '-'
            },
            {
              name: 'IDT',
              count: this.summary.idt?.count || 0,
              first: this.summary.idt?.firstCreatedOn || '-',
              last: this.summary.idt?.lastCreatedOn || '-'
            },
          ];





          const results = response.searchResults;
          this.entityData = results.entityData || [];
          this.attributeData = results.attributeData || [];
          this.instanceData = results.instanceData || [];
          this.calculationData = results.calculationData || [];
          this.correlationData = results.correlationData || [];
          this.activityData = results.activityData || [];
          this.idtData = results.idtData || [];

          // Map data for new tables
          this.reportGenLogData = this.mapReportGenLog(results);
          this.screenAccessLogData = this.mapScreenAccessLog(results);
          this.activePagesData = this.mapActivePages(results);
          this.reportAccessLogData = this.mapReportAccessLog(results);
          this.screenUpdateLogData = this.mapScreenUpdateLog(results);
          this.activeDeptData = results.orgArr || [];

          if (this.hasData()) {
            this.showToast('success', 'Success', 'Data loaded successfully');
          } else {
            this.showToast('info', 'No Data', 'No records found.');
          }
        } else {
          this.clearAllData();
          this.errorMessage = 'No data available.';
          this.showToast('warn', 'No Data', this.errorMessage);
        }
      },
      error: (error) => {
        console.error('Error fetching values:', error);
        this.errorMessage = 'Failed to load data.';
        this.showToast('error', 'Error', this.errorMessage);
        this.isLoading = false;
        this.clearAllData();
      }
    });
  }

  private hasData(): boolean {
    return (
      this.entityData.length > 0 ||
      this.attributeData.length > 0 ||
      this.instanceData.length > 0 ||
      this.calculationData.length > 0 ||
      this.correlationData.length > 0 ||
      this.activityData.length > 0 ||
      this.idtData.length > 0
    );
  }

  private clearAllData(): void {
    this.entityData = [];
    this.attributeData = [];
    this.instanceData = [];
    this.calculationData = [];
    this.correlationData = [];
    this.activityData = [];
    this.idtData = [];
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 5000 });
  }

  expandAll(): void {
    this.activeAccordionIndices = [0, 1, 2, 3, 4, 5, 6, 7];
  }

  collapseAll(): void {
    this.activeAccordionIndices = [];
  }

  refreshData(panelType: string): void {
    if (!this.fromDate || !this.toDate) {
      this.showToast('warn', 'No Search Criteria', 'Search first.');
      return;
    }

    this.showToast('info', 'Refreshing', `${panelType}...`);
    this.performSearch();
  }

  editCalculation(): void {
    console.log('Edit clicked');
  }

  private mapActiveDept(results: any): any[] {
    const allData = [...(results.calculationData || []), ...(results.correlationData || [])];
    return allData.map(item => {
      const firstDate = new Date(item.createdOn);
      const lastDate = item.updatedOn ? new Date(item.updatedOn) : firstDate;
      const totalDays = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        appName: item.appName || 'PIOS',
        orgName: item.orgName || 'Manifa Org 1',
        generatedOn: item.createdOn,
        firstUsed: item.createdOn,
        lastUsed: item.updatedOn || item.createdOn,
        totalDays: totalDays
      };
    });
  }

  private mapReportGenLog(results: any): any[] {
    const allData = [
      ...(results.calculationData || []),
      ...(results.correlationData || []),
      ...(results.activityData || []),
      ...(results.idtData || [])
    ];
    return allData.map(item => ({
      appName: item.appName || 'PIOS',
      orgName: item.orgName || 'Manifa Org 1',
      generatedBy: item.createdBy || 'User1',
      generatedAt: item.createdOn
    }));
  }

  private mapScreenAccessLog(results: any): any[] {
    const allData = [
      ...(results.entityData || []),
      ...(results.instanceData || [])
    ];
    return allData.map(item => ({
      appName: item.appName || item.instanceLevelName || 'PIOS',
      orgName: item.orgName || item.instanceOrgLevel || 'Manifa Org 1',
      screenName: item.entityName || item.instanceName || 'N/A',
      accessedBy: item.createdBy || 'User1',
      accessedAt: item.createdOn
    }));
  }

  private mapActivePages(results: any): any[] {
    const allData = [
      ...(results.idtData || []),
      ...(results.calculationData || [])
    ];
    return allData.map(item => ({
      appName: item.appName || 'PIOs',
      orgName: item.orgName || 'Manifa Org 1',
      pageType: item.templateType || item.type || 'N/A',
      pageName: item.templateName || item.calculationName || item.correlationName || 'N/A',
      accessedBy: item.createdBy || 'User1',
      accessedAt: item.createdOn
    }));
  }

  private mapReportAccessLog(results: any): any[] {
    const allData = [
      ...(results.correlationData || []),
      ...(results.activityData || [])
    ];
    return allData.map(item => ({
      appName: item.appName || 'PIOS',
      orgName: item.orgName || 'Manifa Org 1',
      reportName: item.correlationName || item.templateName || 'N/A',
      accessedBy: item.createdBy || 'User1',
      accessedAt: item.createdOn
    }));
  }

  get filteredReportGenLog(): any[] {
    return this.reportGenLogData.filter(item => {
      const byMatch = !this.reportGenFilterBy || item.generatedBy.toLowerCase().includes(this.reportGenFilterBy.toLowerCase());
      const atMatch = !this.reportGenFilterAt || new Date(item.generatedAt).toDateString() === this.reportGenFilterAt.toDateString();
      const appMatch = !this.reportGenFilterApp || item.appName.toLowerCase().includes(this.reportGenFilterApp.toLowerCase());
      const orgMatch = !this.reportGenFilterOrg || item.orgName.toLowerCase().includes(this.reportGenFilterOrg.toLowerCase());
      return byMatch && atMatch && appMatch && orgMatch;
    });
  }

  get filteredReportAccessLog(): any[] {
    return this.reportAccessLogData.filter(item => {
      const byMatch = !this.reportAccessFilterBy || item.accessedBy.toLowerCase().includes(this.reportAccessFilterBy.toLowerCase());
      const atMatch = !this.reportAccessFilterAt || new Date(item.accessedAt).toDateString() === this.reportAccessFilterAt.toDateString();
      const appMatch = !this.reportAccessFilterApp || item.appName.toLowerCase().includes(this.reportAccessFilterApp.toLowerCase());
      const orgMatch = !this.reportAccessFilterOrg || item.orgName.toLowerCase().includes(this.reportAccessFilterOrg.toLowerCase());
      return byMatch && atMatch && appMatch && orgMatch;
    });
  }

  get filteredScreenAccessLog(): any[] {
    return this.screenAccessLogData.filter(item => {
      const byMatch = !this.screenAccessFilterBy || item.accessedBy.toLowerCase().includes(this.screenAccessFilterBy.toLowerCase());
      const atMatch = !this.screenAccessFilterAt || new Date(item.accessedAt).toDateString() === this.screenAccessFilterAt.toDateString();
      const appMatch = !this.screenAccessFilterApp || item.appName.toLowerCase().includes(this.screenAccessFilterApp.toLowerCase());
      const orgMatch = !this.screenAccessFilterOrg || item.orgName.toLowerCase().includes(this.screenAccessFilterOrg.toLowerCase());
      return byMatch && atMatch && appMatch && orgMatch;
    });
  }

  get filteredActivePages(): any[] {
    return this.activePagesData.filter(item => {
      const typeMatch = !this.activePagesFilterType || item.pageType.toLowerCase().includes(this.activePagesFilterType.toLowerCase());
      const byMatch = !this.activePagesFilterBy || item.accessedBy.toLowerCase().includes(this.activePagesFilterBy.toLowerCase());
      const atMatch = !this.activePagesFilterAt || new Date(item.accessedAt).toDateString() === this.activePagesFilterAt.toDateString();
      const appMatch = !this.activePagesFilterApp || item.appName.toLowerCase().includes(this.activePagesFilterApp.toLowerCase());
      const orgMatch = !this.activePagesFilterOrg || item.orgName.toLowerCase().includes(this.activePagesFilterOrg.toLowerCase());
      return typeMatch && byMatch && atMatch && appMatch && orgMatch;
    });
  }

  private mapScreenUpdateLog(results: any): any[] {
    const allData = [
      ...(results.entityData || []),
      ...(results.attributeData || [])
    ];
    return allData.map(item => ({
      appName: item.appName || item.attributeLevelName || 'PIOS',
      orgName: item.orgName || item.attributeOrgLevel || 'Manifa Org 1',
      screenName: item.entityName || item.attributeName || 'N/A',
      updatedBy: item.createdBy || 'User1',
      updatedAt: item.updatedOn || item.createdOn,
      changesMade: 'Modified'
    }));
  }

  get filteredScreenUpdateLog(): any[] {
    return this.screenUpdateLogData.filter(item => {
      const byMatch = !this.screenUpdateFilterBy || item.updatedBy.toLowerCase().includes(this.screenUpdateFilterBy.toLowerCase());
      const atMatch = !this.screenUpdateFilterAt || new Date(item.updatedAt).toDateString() === this.screenUpdateFilterAt.toDateString();
      const appMatch = !this.screenUpdateFilterApp || item.appName.toLowerCase().includes(this.screenUpdateFilterApp.toLowerCase());
      const orgMatch = !this.screenUpdateFilterOrg || item.orgName.toLowerCase().includes(this.screenUpdateFilterOrg.toLowerCase());
      return byMatch && atMatch && appMatch && orgMatch;
    });
  }

  get filteredActiveDept(): any[] {
    return this.activeDeptData.filter(item => {
      const appMatch = !this.activeDeptFilterApp || item.appName.toLowerCase().includes(this.activeDeptFilterApp.toLowerCase());
      const orgMatch = !this.activeDeptFilterOrg || item.orgName.toLowerCase().includes(this.activeDeptFilterOrg.toLowerCase());
      return appMatch && orgMatch;
    });
  }

  get filteredBusinessTrans(): any[] {
    return this.summaryTable.filter(item => {
      const appMatch = !this.businessTransFilterApp || (this.selectedApp?.appName || 'N/A').toLowerCase().includes(this.businessTransFilterApp.toLowerCase());
      const orgMatch = !this.businessTransFilterOrg || (this.selectedOrg?.orgName || 'N/A').toLowerCase().includes(this.businessTransFilterOrg.toLowerCase());
      return appMatch && orgMatch;
    });
  }

  getActualTotal(): number {
    if (!this.summaryTable?.length) return 0;
    return this.summaryTable.reduce((sum: number, row: any) => {
      return sum + (row.count || 0);
    }, 0);
  }

  getExpectedTotal(): number {
    if (!this.summaryTable?.length) return 0;

    return this.summaryTable.reduce((sum: number, row: any) => {
      const expected = (row.count || 0) * 1.2;
      return sum + Math.round(expected);
    }, 0);
  }

  // ==================== EXPORT FUNCTIONALITY ====================

  /**
   * Export a specific table to Excel
   * @param tableName Name of the table for filename
   * @param data Data to export
   */
  exportTableExcel(tableName: string, data: any[]): void {
    if (!data || data.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: `No data available to export for ${tableName}`
      });
      return;
    }
    this.exportService.exportExcel(data, `tag_utilization_${tableName.toLowerCase().replace(/ /g, '_')}`);
  }

  /**
   * Export all data from all tables
   */
  exportAllToExcel(): void {
    const allExportData: any[] = [
      ...this.filteredBusinessTrans.map(item => ({ ...item, section: 'Business Transactions' })),
      ...this.filteredActiveDept.map(item => ({ ...item, section: 'Active Department' })),
      ...this.filteredReportGenLog.map(item => ({ ...item, section: 'Report Generation Log' })),
      ...this.filteredReportAccessLog.map(item => ({ ...item, section: 'Report Access Log' })),
      ...this.filteredScreenAccessLog.map(item => ({ ...item, section: 'Screen Access Log' })),
      ...this.filteredScreenUpdateLog.map(item => ({ ...item, section: 'Screen Update Log' })),
      ...this.filteredActivePages.map(item => ({ ...item, section: 'Active Pages' }))
    ];

    if (allExportData.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'No data available to export'
      });
      return;
    }

    this.exportService.exportExcel(allExportData, 'tag_utilization_full_report');
  }

  /**
   * Trigger import (Mock implementation for consistency, as this is a reporting module)
   */
  triggerImport(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Maintenance',
      detail: 'Import functionality is not applicable for the reporting module.'
    });
  }
}
