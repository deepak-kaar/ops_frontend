import { Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from 'primeng/dynamicdialog';
import { Assignment } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { OrganizationAdministrationService } from '../../../organization-administration.service';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-roles-assigner',
  standalone: false,
  templateUrl: './roles-assigner.component.html',
  styleUrl: './roles-assigner.component.css'
})
export class RolesAssignerComponent {

  /**
   * @property {any[]} orgs - Stores the list of organizations fetched from the backend.
   */
  orgs: any[] = [];

  /**
   * @property {any[]} allRoles - Stores all roles fetched from the backend.
   */
  allRoles: any[] = [];

  /**
   * @property {any[]} roles - Stores the list of available roles (filtered to exclude assigned roles).
   */
  roles: any[] = [];
  
  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  @Input() appId!: string;

  availablePages: Assignment[] = [{
    id: '',
    name: 'Manifa Report',
    description: 'Report for manifa reporting app'
  }];
  selectedPages: any[] = [];

  assignedPages: any[] = [];
  unSelectedPages: any[] = [];
  searchValue: any;
  org: any;

  /**
   * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
   */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
   * Constructor injects necessary services.
   * @constructor
   * @param {OrganizationAdministrationService} orgAdminService - Service to interact with the backend for fetching and managing applications.
   * @param {DialogService} dialog - Primeng dialog Service to interact with dialog components.
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders.
   * @param {Router} router - Angular Router service to interact router
   * @param {FormBuilder} fb - Form builder service for handling reactive forms.
   */
  constructor(private orgAdminService: OrganizationAdministrationService,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private responsive: ResponsiveService) {
  }

  ngOnInit() {
    this.getOrgs();
    this.getRoles();
    this.isMobile$ = this.responsive.isMobile$();
  }

  /**
   * Fetches the list of organizations from the backend and assigns it to the `orgs` array.
   * @returns {void} - returns nothing i.e(void)
   */
  getOrgs(): void {
    this.spinner.show();
    this.orgAdminService.getOrgsByApp(this.appId).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.orgs = res.orgs || [];
      },
      error: (err) => {
        this.spinner.hide();
        this.orgs = [];
      }
    });
  }

  /**
   * Fetches the list of roles from the backend and assigns it to the `roles` array.
   * Uses the correct payload format with roleLevelId and roleLevel.
   * @returns {void} - returns nothing i.e(void)
   */
  getRoles(): void {
    this.spinner.show();
    const payload = {
      roleLevelId: this.appId,
      roleLevel: 'Application'
    };
    this.orgAdminService.getRoles(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.allRoles = (res.roles || []).map((role: any) => ({
          roleId: role.roleId,
          roleName: role.roleName,
          roleDescription: role.roleDescription
        }));
        this.filterAvailableRoles();
      },
      error: (err) => {
        this.spinner.hide();
        this.allRoles = [];
        this.roles = [];
      }
    });
  }

  /**
   * Filters the available roles to exclude already assigned roles.
   * @returns {void} - returns nothing i.e(void)
   */
  filterAvailableRoles(): void {
    if (this.assignedPages && this.assignedPages.length > 0) {
      const assignedRoleIds = this.assignedPages.map((role: any) => role.roleId);
      this.roles = this.allRoles.filter((role: any) => !assignedRoleIds.includes(role.roleId));
    } else {
      this.roles = [...this.allRoles];
    }
  }

  /**
   * Assigns selected roles to the organization.
   * Moves selected roles from available to assigned list.
   * @returns {void} - returns nothing i.e(void)
   */
  assignRoles(): void {
    if (!this.org) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please choose an organization", life: 3000 });
      return;
    }

    if (!this.selectedPages || this.selectedPages.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: "Please select roles to assign", life: 3000 });
      return;
    }

    // Add selected roles to assigned pages
    this.assignedPages = [...this.assignedPages, ...this.selectedPages];
    
    // Clear selected pages
    this.selectedPages = [];
    
    // Filter available roles to exclude newly assigned roles
    this.filterAvailableRoles();
  }

  /**
   * Handles organization change event.
   * Fetches organization details and assigned roles.
   * @param {any} value - The selected organization ID
   */
  onOrgChange(value: any): void {
    this.selectedPages = [];
    this.unSelectedPages = [];
    this.getOrgDetails(value);
  }

  /**
   * Clears the table filter/search.
   * @param {any} table - The table reference whose filter should be cleared.
   */
  clear(table: any): void {
    this.searchValue = '';
    if (table && table.filterGlobal) {
      table.filterGlobal('', 'contains');
    }
  }

  /**
   * Saves the assigned roles to the database.
   * Sends the orgId and array of roleId objects to the backend.
   * @returns {void} - returns nothing i.e(void)
   */
  saveAssigned(): void {
    if (!this.org) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please choose an organization", life: 3000 });
      return;
    }

    // Prepare payload with roleId as array of role objects
    const payload = {
      orgId: this.org,
      roleId: this.assignedPages.map((role: any) => ({
        roleId: role.roleId,
        roleName: role.roleName,
        roleDescription: role.roleDescription
      }))
    };

    this.spinner.show();
    this.orgAdminService.updateOrgRoles(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Roles assigned successfully", life: 3000 });
      },
      error: (err) => {
        this.spinner.hide();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error while updating the roles", life: 3000 });
      }
    });
  }

  /**
   * Fetches organization details including assigned roles.
   * @param {string} orgId - The organization ID
   */
  getOrgDetails(orgId: string): void {
    this.spinner.show();
    this.orgAdminService.getOrgDetails(orgId).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        const orgData = res?.orgJson?.[0];
        
        // Handle roleId - it could be an array of role objects or undefined
        if (orgData?.roleId && Array.isArray(orgData.roleId)) {
          this.assignedPages = orgData.roleId.map((role: any) => ({
            roleId: role.roleId,
            roleName: role.roleName,
            roleDescription: role.roleDescription
          }));
        } else {
          this.assignedPages = [];
        }
        
        // Filter available roles to exclude assigned roles
        this.filterAvailableRoles();
      },
      error: (err) => {
        this.spinner.hide();
        this.assignedPages = [];
        this.filterAvailableRoles();
      }
    });
  }

  /**
   * Deletes selected roles from the assigned list.
   * Moves them back to available roles.
   * @returns {void} - returns nothing i.e(void)
   */
  deleteAssigned(): void {
    if (!this.unSelectedPages || this.unSelectedPages.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: "Please select roles to remove", life: 3000 });
      return;
    }

    // Remove selected roles from assigned pages
    this.assignedPages = this.assignedPages.filter(
      (item1: any) => !this.unSelectedPages.some((item2: any) => item2.roleId === item1.roleId)
    );

    // Clear unselected pages
    this.unSelectedPages = [];

    // Filter available roles to add back removed roles
    this.filterAvailableRoles();
  }
}
