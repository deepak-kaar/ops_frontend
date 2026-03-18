import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ReportGenAdministrationComponent } from '../../report-gen-administration.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs/operators';
import { combineLatest, Subject } from 'rxjs';
import { ReportGenAdministrationService } from '../../services/report-gen-administration.service';
import { Orgs, Reports } from 'src/app/modules/page-administrator/interfaces/page-administrator';

@Component({
  selector: 'app-manage-report',
  standalone: false,
  templateUrl: './manage-report.component.html',
  styleUrl: './manage-report.component.css'
})
export class ManageReportComponent
  extends ReportGenAdministrationComponent
  implements OnInit, OnDestroy {


  @Input() mode: 'create' | 'edit' = 'create';
  @Input() jobEditingData: any;
  @Output() close = new EventEmitter<void>();

  // Declarations for Jobs 
  jobForm!: FormGroup;
  jobs: any[] = [];
  selectedJob: any = null;

  //Declarations for Dialog
  reportDialogVisible = false;
  selectedReports: any[] = [];
  dialogSelectedReports: any[] = [];

  // Declarations for Report/Template 
  loading = false;
  mappings: any[] = [];
  orderedMappings: any[] = [];
  reports: Reports[] = [];

  // Declarations for Organization 
  organizations: Orgs[] = [];
  filteredOrganizations: Orgs[] = [];
  selectedOrgForDialog: Orgs | null = null;
  isAllSelected = true;
  orgLookup: Record<string, string> = {};

  // Declarations for Reports 
  filteredReportsForDialog: any[] = [];
  orgSearchTerm = '';
  reportSearchTerm = '';

  private destroy$ = new Subject<void>();

  constructor(
    protected fb: FormBuilder,
    private reportService: ReportGenAdministrationService
  ) {
    super();
  }

  override ngOnInit(): void {

    this.jobForm = this.fb.group({
      jobId: [''],
      selectedReports: [[]]
    });
    if (this.mode === "edit") {
      this.selectedReports = this.jobEditingData?.selectedReport;
      this.selectedJob = this.jobEditingData;
      this.jobForm = this.fb.group({
        jobId: this.jobEditingData.schedulerJobId,
        selectedReports: this.jobEditingData?.selectedReport
      });
    }
    combineLatest([
      this.filterService.selectedApp$,
      this.filterService.selectedOrg$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([app, org]) => {

        this.loadJobs(app?.appId ?? '', org?.orgId);

        if (!app) return;
        this.loadMappings(app.appId, org?.orgId);

      });

    this.filterService.selectedApp$
      .pipe(takeUntil(this.destroy$))
      .subscribe(app => {

        if (!app) {
          this.organizations = [];
          this.filteredOrganizations = [];
          return;
        }

        this.getOrgs(app.appId);

      });

    /* Job selection */
    this.jobForm.get('jobId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(jobId => {
        this.selectedJob =
          this.jobs.find(j => j.schedulerJobId === jobId) || null;
      });
  }
  loadJobs(appId: string, orgId?: string): void {
    this.spinner?.show();

    this.reportService.getJobs()
      .pipe(finalize(() => this.spinner?.hide()))
      .subscribe((res: any) => {
        this.jobs = (res?.Jobs || [])
          .filter((job: any) => job.schedulerType === 'Re-generate Reports' && job.inScheduled === true);
        // Re-sync selectedJob after jobs are loaded (fixes edit mode race condition)
        const currentJobId = this.jobForm.get('jobId')?.value;
        if (currentJobId) {
          this.selectedJob = this.jobs.find(j => j.schedulerJobId === currentJobId) || this.selectedJob;
        }
      });
  }

  getOrgs(appId: string): void {
    this.reportService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {

        this.organizations = res.orgs.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }));

        this.filteredOrganizations = [...this.organizations];

        // rebuild lookup
        this.orgLookup = {};
        this.organizations.forEach(o => {
          this.orgLookup[o.orgId] = o.orgName;
        });

        // reset to All mode when app changes
        this.selectAllOrganizations();
      },
      error: (err) => {
        console.error('Failed to fetch organizations:', err);
        this.organizations = [];
        this.filteredOrganizations = [];
      }
    });
  }

  loadMappings(appId: string, orgId?: string): void {

    this.loading = true;

    const payload = {
      appId,
      orgId,
      templateType: 'Report Design'
    };

    this.reportService.getTemplates(payload).subscribe({
      next: (res: any) => {

        this.mappings = res.templates || res.templateMappings || res.data || [];
        this.orderedMappings = [...this.mappings];
        /* Build reports */
        this.reports = this.orderedMappings.map(item => ({
          reportId: item?.templateId,
          reportName: item?.templateName,
          description: '',
          orgId: item?.orgId,
          appId: item?.appId,
          orgName: this.orgLookup[item?.orgId] || 'Unknown Org',
          isActive: false
        }));

        this.filterReports();
        this.loading = false;
      },
      error: err => {
        console.error('Error loading templates:', err);
        this.loading = false;
      }
    });
  }

  filterOrganizations(): void {
    this.filteredOrganizations = this.organizations.filter(org =>
      org.orgName.toLowerCase().includes(this.orgSearchTerm.toLowerCase())
    );
  }

  selectAllOrganizations(): void {
    this.isAllSelected = true;
    this.selectedOrgForDialog = null;
    this.filterReports();
  }

  selectOrganization(org: Orgs): void {
    this.isAllSelected = false;
    this.selectedOrgForDialog = org;
    this.filterReports();
  }

  filterReports(): void {

    const search = this.reportSearchTerm.toLowerCase();

    if (this.isAllSelected) {
      this.filteredReportsForDialog =
        this.reports.filter(r =>
          r.reportName.toLowerCase().includes(search)
        );
      return;
    }

    if (!this.selectedOrgForDialog) {
      this.filteredReportsForDialog = [];
      return;
    }

    this.filteredReportsForDialog =
      this.reports.filter(r =>
        r.orgId === this.selectedOrgForDialog?.orgId &&
        r.reportName.toLowerCase().includes(search)
      );
  }

  getOrgName(orgId: string): string {
    return this.orgLookup[orgId] || '';
  }

  getSelectedCountByOrg(orgId: string): number {
    return this.dialogSelectedReports.filter(r => r.orgId === orgId).length;
  }

  openReportDialog(): void {
    this.reportDialogVisible = true;
    this.dialogSelectedReports = [...this.selectedReports];
  }

  confirmReportSelection(): void {
    this.selectedReports = [...this.dialogSelectedReports];

    this.jobForm.patchValue({
      selectedReports: this.selectedReports.map(r => r.reportId)
    });

    this.reportDialogVisible = false;
  }

  removeSelectedReport(report: any): void {
    this.selectedReports =
      this.selectedReports.filter(r => r.reportId !== report.reportId);

    this.dialogSelectedReports =
      this.dialogSelectedReports.filter(r => r.reportId !== report.reportId);
  }

  saveJob(): void {
    const missing: string[] = [];
    if (!this.selectedJob) missing.push('Job');
    if (!this.selectedReports || this.selectedReports.length === 0) missing.push('Reports');

    if (missing.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: `Please fill mandatory fields: ${missing.join(', ')}`,
        life: 3000
      });
      return;
    }

    const payload = this.selectedJob;
    payload.selectedReport = this.selectedReports;
    payload.shouldReportRegenerate = true;
    if (this.mode == 'create') {
      this.ReportGenAdministrationService.postJob(payload).subscribe({
        next: (res: any) => {
          this.showToast('success', 'Success', 'Successfully created', 2000, false);
          this.close.emit();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While creating job", life: 3000 });
        }
      });
    } else {
      this.ReportGenAdministrationService.putJob(payload, payload.schedulerJobId).subscribe({
        next: (res: any) => {
          this.showToast('success', 'Success', 'Successfully edited', 2000, false);
          this.close.emit();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While editing job", life: 3000 });
        }
      });
    }
    console.log("saveForm triggered", this.jobForm.value, this.selectedJob);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}