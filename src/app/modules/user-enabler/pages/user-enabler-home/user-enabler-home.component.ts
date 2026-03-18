import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { UserEnablerService } from '../../service/user-enabler.service';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { Apps, Orgs } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { map, Observable, shareReplay } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';

@Component({
  selector: 'app-user-enabler-home',
  standalone: false,
  templateUrl: './user-enabler-home.component.html',
  styleUrls: ['./user-enabler-home.component.css'],
})
export class UserEnablerHomeComponent implements OnInit, OnDestroy {
  applications = [
    { label: 'OpsInsight', value: 'ops' },
    { label: 'SmartTrack', value: 'smart' },
  ];

  organizations = [
    { label: 'Aramco', value: 'aramco' },
    { label: 'Reliance', value: 'reliance' },
  ];

  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'Operator', value: 'operator' },
  ];

  durationOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1} Hour${i + 1 > 1 ? 's' : ''}`,
    value: `${i + 1}`,
  }));

  selectedApp: any = null;
  selectedOrg: any = null;
  createDialogVisible = false;

  userEnablerData: any[] = [];
  newEntry: any = {
    role: '',
    duration: '',
    incident: '',
    justification: '',
  };

  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;
  mobileSidebarVisible = false;

  /** List of organizations corresponding to the selected application. */
  orgs!: Orgs[];

  /** List of available applications fetched from the server. */
  apps!: Apps[];

  /** Rollout label properties */
  private labelSub!: Subscription;
  labels: string[] = [];
  selectedLabel: string | null = null;

  constructor(
    private messageService: MessageService,
    private pageAdminService: PageAdministratorService,
    private userService: UserEnablerService,
    private breakpointObserver: BreakpointObserver,
    private responsive: ResponsiveService,
    private labelService: LabelService
  ) {
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  ngOnInit(): void {
    this.fetchData();
    this.getApps();
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();

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

  // ==================== SIDEBAR & NAVIGATION ====================

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
    if (this.mobileSidebarVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // ==================== ROLLOUT LABELS ====================

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

  // ==================== DATA FETCHING ====================

  fetchData() {
    this.userService.getEnablersService().subscribe({
      next: (res) => {
        this.userEnablerData = res.data || [];
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch user enablers from backend.',
        });
      },
    });
  }

  getOrgs(appId: string): void {
    this.pageAdminService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {
        this.orgs = res.orgs.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }));
      },
      error: (err) => {
        console.error('Failed to fetch organizations:', err);
      }
    });
  }

  getApps(): void {
    this.pageAdminService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.apps.map((app: any) => ({
          label: app.appName,
          value: app.appId,
        }));
      },
      error: (err) => {
        console.error('Failed to fetch applications:', err);
      }
    });
  }

  // ==================== DIALOG ACTIONS ====================

  openCreateDialog() {
    if (!this.selectedApp) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Application Required',
        detail: 'Please select an Application before creating an entry.',
      });
      return;
    }

    this.newEntry = { role: '', duration: '', incident: '', justification: '' };
    this.createDialogVisible = true;
  }

  onApplicationSelect(event: any) {
    const appId = event.value;
    console.log('Selected Application ID:', appId);
    this.getOrgs(appId);
    this.selectedOrg = null;
  }

  saveEntry() {
    if (!this.newEntry.role || !this.newEntry.duration) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Fields',
        detail: 'Please fill all required fields before saving.',
      });
      return;
    }

    const payload = {
      role: this.newEntry.role?.value || this.newEntry.role,
      duration: this.newEntry.duration,
      incident: this.newEntry.incident,
      justification: this.newEntry.justification,
      application: this.selectedApp?.value || this.selectedApp,
      organization: this.selectedOrg?.value || this.selectedOrg,
    };

    this.userService.postEnablerService(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Created Successfully',
          detail: 'Data stored in MongoDB successfully.',
        });
        this.createDialogVisible = false;
        this.fetchData();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save entry in backend.',
        });
      },
    });
  }

  editRow(row: any) {
    this.newEntry = { ...row };
    this.createDialogVisible = true;
  }

  deleteRow(row: any) {
    this.userEnablerData = this.userEnablerData.filter((r) => r !== row);
    this.messageService.add({
      severity: 'error',
      summary: 'Deleted',
      detail: 'The selected record has been deleted (not yet synced to DB).',
    });
  }
}







