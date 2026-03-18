import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { TableRowSelectEvent, Table } from 'primeng/table';
import { OrganizationAdministrationService } from 'src/app/modules/organization-administration/organization-administration.service';
import { ManageRoleComponent } from 'src/app/modules/organization-administration/components/dialogs/manage-role/manage-role.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

/**
 * @component
 * @description
 * The `AppRolesManagerComponent` is responsible for managing Roles for an application in the organization administration module.
 * It retrieves the list of organzations, allows selection, creation, editing, and deletion of roles.
 */
@Component({
  selector: 'app-app-roles-manager',
  standalone: false,
  templateUrl: './app-roles-manager.component.html',
  styleUrl: './app-roles-manager.component.css',
  encapsulation : ViewEncapsulation.None
})
export class AppRolesManagerComponent implements OnInit {

  /**
  * @property {FormGroup} appForm - Form group that holds application form controls.
  */
  roleForm: FormGroup;

  /**
   * @Input {string} orgId - Acts as components input prop to get the list of orgId from the parent component.
   */
  @Input() orgId!: string;

  /**
   * @Input {string} appId - Acts as components input prop to get the list of appId from the parent component.
   */
  @Input() appId!: string

  /**
  * @property {any[]} ˇ - Stores the list of roles for the application fetched from the backend.
  */
  roles: any[] = [];

  /**
   * @property {any} selectedRole - Stores the currently selected role.
   */
  selectedRole: any;


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
   * @property {any} roleId - stores the role id.
   */
  roleId: any

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;

  appActions: string[] = [
    "Data Migration Import",
    "Data Migration Export",
    "Create New Role"
  ]
  selectedAction!: string;

 /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
   * Constructor injects necessary services.
   * @constructor
   * 
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
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,
    private responsive: ResponsiveService
  ) {
    this.roleForm = this.fb.group({
      createdOn: new FormControl<string>({ value: '', disabled: true }),
      roleName: new FormControl<string>('', [Validators.required]),
      roleDescription: new FormControl<string>('', [Validators.required]),
      defaultAccessLevel: new FormControl<string>('', [Validators.required]),
      roleLevel: new FormControl<string>(this.appId, [Validators.required]),
      adGroup: new FormControl<string>('', [Validators.required]),
      roleStatus: new FormControl<boolean>(true, [Validators.required]),
    });

  }

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * Fetches the list of roles for the corresponding app from the backend.
   * @returns {void} - returns nothing i.e(void)
   */
  ngOnInit(): void {
    this.getRoles()
    this.isMobile$ = this.responsive.isMobile$()
  }

  /**
   * Fetches the list of applications from the backend and assigns it to the `roles` array.
   * calls the show method from spinner service to show the loader before getRoles method and hides after fetching.
   * @returns {void} - returns nothing i.e(void)
   */
  getRoles(): void {
    let payload;
    this.spinner.show();
    if (this.orgId)
      payload = {
        roleLevelId: this.orgId,
        roleLevel: 'Organization'
      }
    else
      payload = {
        roleLevelId: this.appId,
        roleLevel: 'Application'
      }

    this.orgAdminService.getRoles(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.roles = res.roles
      },
      error: (err) => {
        this.roles = []
        this.spinner.hide();

      }
    })
  }

  ngOnChanges() {
    this.getRoles();
  }

  /**
   * Opens the ManageRole Component with mode as create to create a role.
   * Subscribes the dialog close method and calls the getApp method to refresh the list of roles after creation.
   * @returns {void} - returns nothing (i.e) void
   */
  createRole(): void {
    this.appRef = this.dialog.open(ManageRoleComponent, {
      header: 'Create Role',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        roleLevel: this.orgId ? 'Organization' : this.appId ? 'Application' : 'Opsinisght',
        roleLevelId: this.orgId ?? this.appId,
        appId: this.appId,
        orgId: this.orgId
      },
      // width: '800px',
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      this.selectedAction = '';
      if (res?.status)
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role created successfully for this application', life: 3000 });
      this.getRoles();
    });
  }

  /**
   * Handles application selection from a table.
   * @param {TableRowSelectEvent} role - The event object containing details of the selected row.
   */
  onRoleSelect(role: TableRowSelectEvent) {
    this.getRoleDetails(role.data.roleId);
    this.roleId = role.data.roleId
    this.isShowOrdDetails = true;
  }

  /**
     * Handles application unselection from a table.
     * @param {TableRowSelectEvent} app - The event object containing details of the unselected row.
     */
  onRoleUnSelect(app: any) {
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
   * Deletes an existing role.
   * @param {string} roleId - The role id to be deleted.
   */
  deleteRole(event: any, roleId: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this Role?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      // Set custom width and height

      // Optional: Add breakpoints for responsive sizing

      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        this.orgAdminService.deleteRole(roleId).subscribe({
          next: (res: any) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role deleted successfully', life: 3000 });
            this.getRoles();
          },
          error: (err) => {

          }
        })
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      },
    });
  }

  /**
   * Patches the application data to the roleForm
   * @param {any} role - application data
   * @returns {void} - returns nothing (i.e) void
   */
  patchValue(role: any): void {
    this.roleForm.patchValue({
      roleName: role.roleName,
      roleDescription: role.roleDescription,
      defaultAccessLevel: role.defaultAccessLevel,
      roleLevel: role.roleLevel,
      adGroup: role.adGroup,
      createdOn: this.datePipe.transform(new Date(role.createdOn), 'mediumDate'),
      roleStatus: role.roleStatus
    })
  }

  /**
   * calls the updateRole service by passing the roleForm data
   * creates a new payload object with role id and the role form data
   * shows the success or failure message in the toast bar with the help of prime ng message service
   * @returns {void} - returns nothing (i.e) void
   */
  updateRole(): void {
    const payload = {
      roleId: this.roleId,
      ...this.roleForm.getRawValue()
    }
    this.orgAdminService.updateRole(payload).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Role Updated Successfully", life: 3000 });
        this.isShowOrdDetails = false;
        this.getRoles()
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While updating role", life: 3000 });
      }
    })
  }

  /**
   * calls the getRoleDetails service by passing the roleId
   * calls the patchvalue method by passing the result if the request is success
   * shows error message in the toast bar with the help of prime ng message service
   * @param {string} roleId - roleId
   * @returns {void} - returns nothing (i.e) void
   */
  getRoleDetails(roleId: string): void {
    this.orgAdminService.getRoleDetails(roleId).subscribe({
      next: (res: any) => {
        this.patchValue(res.rolesJson[0]);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While fetching role details", life: 3000 });
      }
    })
  }

  getSeverity(status: boolean) {
    switch (status) {
      case true:
        return 'success';

      case false:
        return 'danger';
    }
  }

  getStatus(status: boolean) {
    switch (status) {
      case true:
        return 'Active';

      case false:
        return 'Inactive';
    }
  }

}
