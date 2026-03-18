import { Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Assignment } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { OrganizationAdministrationService } from '../../../organization-administration.service';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-data-access',
  standalone: false,
  templateUrl: './data-access.component.html',
  styleUrl: './data-access.component.css'
})
export class DataAccessComponent {
  /**
    * @property {any[]} orgs - accepts the list of orgs fetched from the parent component.
    */
  @Input() orgs: any;

  /**
   * @property {any} orgId - accept the orgId fetched from the parent component.
   */
  @Input() orgId: any;

  /**
 * @property {any} assignedOrgs - accept the orgId fetched from the parent component.
 */
  @Input() assignedOrgs: any | [];

  /**
    * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
    */
  isMobile$!: Observable<boolean>;

 /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  availablePages: Assignment[] = [{
    id: '',
    name: 'Manifa Report',
    description: 'Report for manifa reporting app'
  }];
  selectedOrgs: any;

  unSelectedOrgs: any
  searchValue: any;



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
    private responsive: ResponsiveService,
    private router: Router) {
  }

  ngOnInit() {
    // this.assignedOrgs = this.dataAccess
    this.isMobile$ = this.responsive.isMobile$()
  }

  // ngOnChanges() {
  //   console.log("test")
  //   this.assignedOrgs = this.dataAccess
  // }

  assignRoles() {
    if (this.orgId)
      this.assignedOrgs.push(...this.selectedOrgs);
    else
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please choose an organization", life: 3000 });
  }

  onOrgChange(value: any) {
    this.getOrgDetails(value)
  }
  clear(arg0: any) {
    throw new Error('Method not implemented.');
  }

  saveAssigned() {
    if (this.orgId) {
      const payload = {
        orgId: this.orgId,
        dataAccess: this.assignedOrgs
      }
      this.orgAdminService.updateOrgRoles(payload).subscribe({
        next: (res: any) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: "Roles Assigned successfully ", life: 3000 });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While updating the roles", life: 3000 });
        }
      })
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please choose an organization", life: 3000 });
    }
  }

  getOrgDetails(orgId: string) {
    this.orgAdminService.getOrgDetails(orgId).subscribe({
      next: (res: any) => {
        this.assignedOrgs = res?.orgJson[0]?.dataAccess
      },
      error: (err) => {
        this.assignedOrgs = []
      }
    })
  }

  deleteAssigned() {
    this.assignedOrgs = this.assignedOrgs.filter(
      (item1: any) => !this.unSelectedOrgs.some((item2: any) => item2.orgId === item1.orgId)
    );
  }
}
