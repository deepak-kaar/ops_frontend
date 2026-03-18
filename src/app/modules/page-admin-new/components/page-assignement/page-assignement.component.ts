import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { PageAdministratorService } from '../../page-administrator.service';
import { OrganizationAdministrationService } from 'src/app/modules/organization-administration/organization-administration.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin, Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { MessageService } from 'primeng/api';

interface PageMapping {
  _id: string;
  templateId: string;
  name?: string;
  description?: string;
  templateType?: string;
  appId?: string;
  orgId?: string;
  assignedRoles?: any[];
  [key: string]: any;
}

interface Role {
  roleId: string;
  roleName: string;
  roleDescription?: string;
  assignedPages?: any[];
}

@Component({
  selector: 'app-page-assignement',
  standalone: false,
  templateUrl: './page-assignement.component.html',
  styleUrl: './page-assignement.component.css'
})
export class PageAssignementComponent implements OnInit {
  @Input() app!: string;
  @Input() org!: string;
  @Input() reportType!: string;

  /** All available pages from the backend */
  allAvailablePages: PageMapping[] = [];
  /** Filtered available pages */
  availablePages: PageMapping[] = [];
  /** Selected pages from available list */
  selectedPages: PageMapping[] = [];

  /** Search values for filtering tables */
  availableSearchValue: string = '';

  /** Roles for the multi-select */
  roles: Role[] = [];
  /** Selected roles for assignment (multi-select) */
  selectedRoles: Role[] = [];

  /** Templates for filtering */
  templates: any[] = [];
  /** Selected template for filtering */
  selectedTemplate: any = null;

  /** Loading states */
  isLoadingPages: boolean = false;
  isLoadingRoles: boolean = false;
  isSaving: boolean = false;

  /** Observable for mobile view detection */
  isMobile$!: Observable<boolean>;

  /** Show role assignment dialog */
  showAssignDialog: boolean = false;

  constructor(
    private pageAdminService: PageAdministratorService,
    private orgAdminService: OrganizationAdministrationService,
    private spinner: NgxSpinnerService,
    private responsive: ResponsiveService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.getRoles();
    this.getTemplates();
    this.getAvailablePages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['app'] || changes['org']) {
      this.getRoles();
      this.getTemplates();
      this.getAvailablePages();
      // Reset selections when app/org changes
      this.selectedRoles = [];
      this.selectedTemplate = null;
      this.selectedPages = [];
    }
  }

  /**
   * Fetches roles for the selected application.
   */
  getRoles(): void {
    if (this.app) {
      this.isLoadingRoles = true;
      const payload = {
        roleLevelId: this.app,
        roleLevel: 'Application'
      };
      this.orgAdminService.getRoles(payload).subscribe({
        next: (res: any) => {
          this.isLoadingRoles = false;
          this.roles = (res.roles || []).map((role: any) => ({
            roleId: role.roleId,
            roleName: role.roleName,
            roleDescription: role.roleDescription,
            assignedPages: role.assignedPages || []
          }));
          // Update available pages with role assignments
          this.updatePagesWithRoleAssignments();
        },
        error: (err) => {
          this.isLoadingRoles = false;
          this.roles = [];
        }
      });
    }
  }

  /**
   * Fetches templates for filtering.
   */
  getTemplates(): void {
    if (this.app) {
      const payload = {
        appId: this.app,
        orgId: this.org || undefined
      };
      this.pageAdminService.getTemplates(payload).subscribe({
        next: (res: any) => {
          this.templates = res.templates || [];
        },
        error: (err) => {
          this.templates = [];
        }
      });
    }
  }

  /**
   * Fetches all available pages (template mappings) from the backend.
   */
  getAvailablePages(): void {
    if (this.app) {
      this.isLoadingPages = true;
      const payload: any = {
        appId: this.app
      };
      if (this.org) {
        payload.orgId = this.org;
      }
      if (this.selectedTemplate) {
        payload.templateId = this.selectedTemplate;
      }

      this.pageAdminService.getTemplateMappings(payload).subscribe({
        next: (res: any) => {
          this.isLoadingPages = false;
          this.allAvailablePages = (res.templateMappings || []).map((page: any) => ({
            _id: page._id,
            templateId: page.templateId,
            name: page.name || page.templateName || 'Unnamed Page',
            description: page.description || page.templateDescription || '',
            templateType: page.templateType || page.mappingType || '',
            appId: page.appId,
            orgId: page.orgId,
            assignedRoles: [],
            ...page
          }));
          this.updatePagesWithRoleAssignments();
        },
        error: (err) => {
          this.isLoadingPages = false;
          this.allAvailablePages = [];
          this.availablePages = [];
        }
      });
    }
  }

  /**
   * Updates pages with their role assignments.
   */
  updatePagesWithRoleAssignments(): void {
    // Create a map of page ID to assigned roles
    const pageRolesMap: Map<string, Role[]> = new Map();

    this.roles.forEach(role => {
      if (role.assignedPages && Array.isArray(role.assignedPages)) {
        role.assignedPages.forEach((page: any) => {
          const pageId = page._id;
          if (!pageRolesMap.has(pageId)) {
            pageRolesMap.set(pageId, []);
          }
          pageRolesMap.get(pageId)!.push(role);
        });
      }
    });

    // Update available pages with assigned roles
    this.availablePages = this.allAvailablePages.map(page => ({
      ...page,
      assignedRoles: pageRolesMap.get(page._id) || []
    }));
  }

  /**
   * Handles template filter change.
   */
  onTemplateFilterChange(): void {
    this.getAvailablePages();
  }

  /**
   * Opens the role assignment dialog.
   */
  openAssignDialog(): void {
    if (!this.selectedPages || this.selectedPages.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select pages to assign'
      });
      return;
    }
    this.selectedRoles = [];
    this.showAssignDialog = true;
  }

  /**
   * Closes the role assignment dialog.
   */
  closeAssignDialog(): void {
    this.showAssignDialog = false;
    this.selectedRoles = [];
  }

  /**
   * Assigns selected pages to selected roles.
   */
  assignPagesToRoles(): void {
    if (!this.selectedRoles || this.selectedRoles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one role'
      });
      return;
    }

    if (!this.selectedPages || this.selectedPages.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select pages to assign'
      });
      return;
    }

    this.isSaving = true;

    // Prepare pages data for assignment
    const pagesToAssign = this.selectedPages.map(page => ({
      _id: page._id,
      templateId: page.templateId,
      name: page.name,
      description: page.description,
      templateType: page.templateType
    }));

    // Create update requests for each selected role
    const updateRequests = this.selectedRoles.map(role => {
      // Get existing assigned pages for this role
      const existingPages = role.assignedPages || [];
      
      // Merge with new pages (avoid duplicates)
      const existingIds = existingPages.map((p: any) => p._id);
      const newPages = pagesToAssign.filter(p => !existingIds.includes(p._id));
      const mergedPages = [...existingPages, ...newPages];

      const payload = {
        roleId: role.roleId,
        assignedPages: mergedPages
      };

      return this.orgAdminService.updateRole(payload);
    });

    // Execute all updates
    forkJoin(updateRequests).subscribe({
      next: (results: any[]) => {
        this.isSaving = false;
        this.showAssignDialog = false;
        this.selectedPages = [];
        this.selectedRoles = [];
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Pages assigned to ${results.length} role(s) successfully`
        });

        // Refresh roles and pages
        this.getRoles();
      },
      error: (err) => {
        this.isSaving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to assign pages to roles'
        });
      }
    });
  }

  /**
   * Removes a role assignment from a page.
   */
  removeRoleFromPage(page: PageMapping, role: Role): void {
    // Get the role's current assigned pages
    const currentAssignedPages = role.assignedPages || [];
    
    // Remove this page from the role
    const updatedPages = currentAssignedPages.filter((p: any) => p._id !== page._id);

    const payload = {
      roleId: role.roleId,
      assignedPages: updatedPages
    };

    this.orgAdminService.updateRole(payload).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Role "${role.roleName}" removed from page`
        });
        // Refresh roles
        this.getRoles();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove role assignment'
        });
      }
    });
  }

  /**
   * Clears filters and search for a table.
   */
  clear(table: any): void {
    this.availableSearchValue = '';
    if (table && table.filterGlobal) {
      table.filterGlobal('', 'contains');
    }
  }

  /**
   * Clears the template filter.
   */
  clearTemplateFilter(): void {
    this.selectedTemplate = null;
    this.getAvailablePages();
  }

  /**
   * Checks if a role is selected.
   */
  isRoleSelected(role: Role): boolean {
    return this.selectedRoles.some(r => r.roleId === role.roleId);
  }

  /**
   * Toggles role selection.
   * Creates a new array reference to trigger Angular change detection.
   */
  toggleRoleSelection(role: Role): void {
    const index = this.selectedRoles.findIndex(r => r.roleId === role.roleId);
    if (index > -1) {
      // Remove role - create new array
      this.selectedRoles = this.selectedRoles.filter(r => r.roleId !== role.roleId);
    } else {
      // Add role - create new array
      this.selectedRoles = [...this.selectedRoles, role];
    }
  }

  /**
   * Handles checkbox click - stops propagation to prevent double toggle
   * and manually toggles the role.
   */
  onCheckboxClick(event: Event, role: Role): void {
    event.stopPropagation();
    this.toggleRoleSelection(role);
  }
}
