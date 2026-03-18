import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DeleteConfirmationDialogComponent, DeleteConfirmationDialogResult } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { TableRowSelectEvent } from 'primeng/table';
import { Table } from 'primeng/table';
import { OrganizationAdministrationService } from 'src/app/modules/organization-administration/organization-administration.service';
import { ManageOrgComponent } from 'src/app/modules/organization-administration/components/dialogs/manage-org/manage-org.component';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Observable } from 'rxjs';
import { ButtonModule } from 'primeng/button';

/**
 * @component
 * @description
 * The `OrgsManagerComponent` is responsible for managing organizations for an application in the organization administration module.
 * It retrieves the list of organzations, allows selection, creation, editing, and deletion of organizations.
 */
@Component({
  selector: 'app-orgs-manager',
  standalone: false,
  templateUrl: './orgs-manager.component.html',
  styleUrl: './orgs-manager.component.css',
  encapsulation:ViewEncapsulation.None
})
export class OrgsManagerComponent implements OnInit {

  /**
  * @property {FormGroup} appForm - Form group that holds application form controls.
  */
  orgForm: FormGroup;

  /**
   * @Input {any[]} orgs - Acts as components input prop to get the list of appId from the parent component.
   */
  @Input() appId!: string

  /**
  * @property {any[]} orgs - Stores the list of applications fetched from the backend.
  */
  orgs: any[] = [];

  /**
   * @property {any} selectedOrg - Stores the currently selected application.
   */
  selectedOrg: any;

  /**
  * @property {any} selectedOrgs - Stores the currently selected organizations.
  */
  selectedOrgs: any;

  /**
   * @property {unknown} loading - Indicates the loading state (can be replaced with a boolean for better clarity).
   */
  loading: unknown;

  /**
   * @property {any} searchValue - Stores the search input value for filtering applications.
   */
  searchValue: any;

  /**
   * @property {DynamicDialogRef} appRef - Reference to the dynamic dialog used for displaying application-related dialogs.
   * It helps in opening, closing, and managing the dialog state dynamically.
   */
  appRef!: DynamicDialogRef;

  /**
   * @property {boolean} isShowOrdDetails - Indicates whether to show the organiation details .
   */
  isShowOrdDetails: boolean = false

  /**
   * @property {string[]} orgActions - Stores the options for organization Action selection Button.
   */
  orgActions: string[] = ["Operating Organization Details", "Roles", "Data Access", "Groups",
    "Shifts",];


  /**
   * @property {any} selectedOrgAction - Stores the currently selected Organization action.
   */
  selectedOrgAction: any;

  /**
   * @property {any} orgId - Stores the currently selected Organization Id.
   */
  orgId: any;

  /**
 * @property {any} dataAccess - Stores the currently selected Organization data Access.
 */
  dataAccess: any;

  /**
* @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
*/
  isMobile$!: Observable<boolean>;

    /**
* @property {Observable<boolean>} isTablet$ - Stores the application view mode status indicating whether it's accessed on a tablet or web.
*/
isTablet$!: Observable<boolean>;

  appActions: string[] = [
    "Data Migration Import",
    "Data Migration Export",
    "Create New Organization"
  ]

  selectedAction!: string;

  /**
   * Constructor injects necessary services.
   * @constructor
   * @param {OrganizationAdministrationService} orgAdminService - Service to interact with the backend for fetching and managing applications.
   * @param {DialogService} dialog - Primeng dialog Service to interact with dialog components.
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders.
   * @param {Router} router - Angular Router service to interact router
   * @param {FormBuilder} fb - Form builder service for handling reactive forms.
   * @param {MessageService}  messageService - Primeng Message service to intearct with toast 
   */
  constructor(private orgAdminService: OrganizationAdministrationService,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private datePipe: DatePipe,
    private responsive: ResponsiveService
  ) {
    this.orgForm = this.fb.group({
      orgName: new FormControl<string>('', [Validators.required]),
      orgDescription: new FormControl<string>('', [Validators.required]),
      appId: new FormControl<string>(this.appId, [Validators.required]),
      orgCode: new FormControl<string>('', [Validators.required]),
      orgOwner: new FormControl<string>('', [Validators.required]),
      orgContact: new FormControl<string>('', [Validators.required]),
      createdOn: new FormControl<string>({ value: '', disabled: true }),
      createdBy: new FormControl<string>({ value: '', disabled: true }),
      modifiedOn: new FormControl<string>({ value: '', disabled: true }),
      modifiedBy: new FormControl<string>({ value: '', disabled: true }),
      allowPast: new FormControl<string>(''),
      allowFuture: new FormControl<string>(''),
      archieveDate: new FormControl<string>(''),
      lastArchieveDate: new FormControl<string>('')
    });

  }


  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * sets the selectedOrgActions as Operating Organization Details by using the orgActions array index
   * Fetches the list of applications from the backend.
   * @returns {void} - returns nothing i.e(void)
   */
  ngOnInit(): void {
    this.selectedOrgAction = this.orgActions[0]
    this.getOrgs()
    this.isMobile$ = this.responsive.isMobile$()
    this.isTablet$ = this.responsive.isTablet$()

  }

  /**
   * Fetches the list of applications from the backend and assigns it to the `orgs` array.
   * @returns {void} - returns nothing i.e(void)
   */
  getOrgs(): void {
    this.spinner.show();
    this.orgAdminService.getOrgsByApp(this.appId).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.orgs = res.orgs
      },
      error: (err) => {
        this.spinner.hide();
        this.orgs = []
      }
    })
  }

  /**
   * Opens the ManageOrg Component with mode as create to create an application.
   * Subscribes the dialog close method and calls the getOrg method to refresh the list of orgs after creation.
   * @returns {void} - returns nothing (i.e) void
   */
  createOrg(): void {
    
    this.appRef = this.dialog.open(ManageOrgComponent, {
      header: 'Create Org',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        appId: this.appId
      },
      // width: '800px',
      width: getResponsiveDialogWidth(),
    })
    

    this.appRef.onClose.subscribe((res: any) => {
      this.selectedAction = '';
      if (res.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Organization created successfully', life: 20000 });
        
      }
      this.getOrgs();
      
    });
  }


  getFilteredOrgs() {
    return this.orgs.filter(item => item.orgId !== this.selectedOrg?.orgId)
  }

  /**
   * Handles application selection from a table.
   * @param {TableRowSelectEvent} app - The event object containing details of the selected row.
   */
  onOrgSelect(org: TableRowSelectEvent) {
    this.getOrgDetails(org.data?.orgId);
    this.orgId = org.data?.orgId;
    this.isShowOrdDetails = true;
  }

  /**
     * Handles application unselection from a table.
     * @param {TableRowSelectEvent} app - The event object containing details of the unselected row.
     */
  onOrgUnSelect(app: any) {
    this.isShowOrdDetails = false;
  }

  /**
   * Clears the table filter/search.
   * @param {Table} _t19 - The table reference whose filter should be cleared.
   */
  clear(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  /**
   * Copies an existing application.
   * @param {any} _t59 - The application data to be copied.
   */
  copyOrg(_t59: any) {
    // TODO: Implement app copy logic
  }


  /**
   * Deletes an existing Organization.
   * @param {string} orgId - The orgId to be deleted.
   */
  deleteOrg(org: any): void {
    const ref = this.dialog.open(DeleteConfirmationDialogComponent, {
      showHeader: false,
      closable: false,
      modal: true,
      dismissableMask: true,
      styleClass: 'delete-confirmation-modal',
      width: '460px',
      data: {
        entityLabel: 'Organization',
        itemName: org.orgName ?? '',
        title: 'Delete Organization',
        subtitle: 'This action cannot be undone',
        confirmText: 'Delete Organization',
        cancelText: 'Cancel'
      }
    });

    ref.onClose.subscribe((result?: DeleteConfirmationDialogResult) => {
      if (!result?.confirmed) return;
      this.orgAdminService.deleteOrg(org.orgId).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Org deleted successfully', life: 20000 });
          this.getOrgs();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete organization', life: 3000 });
        }
      });
    });
  }

  /**
   * Patches the application data to the orgForm
   * @param {any} org - application data
   * @returns {void} - returns nothing (i.e) void
   */
  patchValue(org: any): void {
    this.orgForm.patchValue({
      orgName: org.orgName,
      orgDescription: org.orgDescription,
      orgCode: org.orgCode,
      orgOwner: org.orgOwner,
      orgContact: org.orgContact,
      createdOn: this.datePipe.transform(new Date(org.createdOn), 'mediumDate'),
      createdBy: org.orgContact || '',
      // modifiedOn: org.orgContact,
      // modifiedBy: org.orgContact,
      allowPast: org.allowPast || '',
      allowFuture: org.allowFuture || '',
      archieveDate: org.archieveDate || '',
      lastArchieveDate: this.datePipe.transform(new Date(org.lastArchieveDate), 'mediumDate') || ''
    })
  }

  /**
   * calls the updateOrg service by passing the orgForm data
   * creates a new payload object with org id and the org form data
   * shows the success or failure message in the toast bar with the help of prime ng message service
   * @returns {void} - returns nothing (i.e) void
   */
  updateOrg(): void {
    const payload = {
      orgId: this.orgId,
      ...this.orgForm.getRawValue()
    }
    this.orgAdminService.updateOrg(payload).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Org Updated Successfully", life: 3000 });
        this.isShowOrdDetails = false;
        this.getOrgs();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While updating role", life: 3000 });
      }
    })
  }

  /**
   * calls the getOrgDetails service by passing the orgId
   * calls the patchvalue method by passing the result if the request is success
   * shows error message in the toast bar with the help of prime ng message service
   * @param {string} orgId - roleId
   * @returns {void} - returns nothing (i.e) void
   */
  getOrgDetails(orgId: string): void {
    this.orgAdminService.getOrgDetails(orgId).subscribe({
      next: (res: any) => {
        this.patchValue(res.orgJson[0]);
        this.dataAccess = res.orgJson[0]?.dataAccess || []
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While fetching org details", life: 3000 });
      }
    })
  }

}

