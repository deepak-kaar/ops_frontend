import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { ActiveDirectoryService } from '../../services/active-directory.service';
import {  DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfigAdministrationService } from 'src/app/modules/config-administration/services/config-administration.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-active-directory',
  standalone: false,
  templateUrl: './active-directory.component.html',
  styleUrl: './active-directory.component.css'
})
export class ActiveDirectoryComponent implements OnInit {
  mobileSidebarVisible = false;
  isMobile$!: Observable<boolean>;

  groupName: string = '';
  groupDN: string = '';
  userCount: number = 0;
  nestedGroupsCount: number = 0;
users: { username: string }[] = [];

  nestedGroups: string[] = [];

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  dialogRef!: DynamicDialogRef;

  inputGroupName: string = '';

  configOptions: { id: any, name: any }[] = [];
  selectedConfig: string = '';

  // Modal properties
  showAddUserModal: boolean = false;
  modalSelectedConfig: string = '';
  modalGroupName: string = '';
  modalUsername: string = '';
  modalLoading: boolean = false;

  // Filter properties
  searchUsersValue: string = '';
  searchNestedGroupsValue: string = '';

  constructor(
    private breakpointObserver: BreakpointObserver,
    private activeDirectoryService: ActiveDirectoryService,
    private configAdminService: ConfigAdministrationService,
    private messageService: MessageService,
  ) {
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  ngOnInit(): void {
    this.isLoading = true;

    this.configAdminService.getConfigDropdown().subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response?.config) {
          this.configOptions = response.config;
        } else {
          this.errorMessage = 'No config found.';
          this.resetData();
        }
      },
      error: (error) => {
        console.error('Error fetching Config:', error);
        this.errorMessage = error?.error?.message || 'Failed to load config data.';
        this.isLoading = false;
        this.resetData();
      }
    });
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  onSearchUsers(): void {
    if (!this.selectedConfig) {
      this.errorMessage = 'Please select config.';
      this.successMessage = '';
      return;
    }

    if (!this.inputGroupName || this.inputGroupName.trim() === '') {
      this.errorMessage = 'Please enter a group name.';
      this.successMessage = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.activeDirectoryService.getLdapUsersInGroup(this.inputGroupName, this.selectedConfig).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response) {
          this.successMessage = response.message || 'Successfully fetched users from LDAP group';
          this.groupName = response.groupName || '';
          this.groupDN = response.groupDN || '';
          this.userCount = response.userCount || 0;
          this.nestedGroupsCount = response.nestedGroupsCount || 0;
         this.users = (response.users || []).map((u: string) => ({
  username: u
}));

this.userCount = this.users.length;

          this.nestedGroups = response.nestedGroups || [];
        } else {
          this.errorMessage = 'No data available.';
          this.resetData();
        }
      },
      error: (error) => {
        console.error('Error fetching LDAP users in group:', error);
        this.errorMessage = error?.error?.message || 'Failed to load data.';
        this.isLoading = false;
        this.resetData();
      }
    });
  }

  resetData(): void {
    this.selectedConfig = '';
    this.groupName = '';
    this.groupDN = '';
    this.userCount = 0;
    this.nestedGroupsCount = 0;
    this.users = [];
    this.nestedGroups = [];
  }

  openAddUserModal(): void {
    this.showAddUserModal = true;
    // Pre-fill config and group name from search values
    this.modalSelectedConfig = this.selectedConfig;
    this.modalGroupName = this.inputGroupName;
    this.modalUsername = ''; // Only ask for username
  }

  getConfigName(configId: string): string {
    const config = this.configOptions.find(c => c.id === configId);
    return config ? config.name : configId;
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
  }

  submitAddUser(): void {
  if (!this.modalUsername || this.modalUsername.trim() === '') {
    return;
  }

  this.modalLoading = true;

  this.activeDirectoryService
    .addUserToGroup(
      this.modalSelectedConfig,
      this.modalGroupName,
      this.modalUsername
    )
    .subscribe({
      next: () => {
        this.modalLoading = false;
        this.closeAddUserModal();

        //  MANUAL UI UPDATE (no API recall, no setTimeout)
        const userExists = this.users.some(
          u => u.username === this.modalUsername
        );

        if (!userExists) {
          this.users = [
            ...this.users,
            { username: this.modalUsername }
          ];
          this.userCount = this.users.length;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `User "${this.modalUsername}" added successfully`,
          life: 4000
        });
      },
      error: (error) => {
        this.modalLoading = false;
        console.error('Error adding user:', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.message || 'Failed to add user',
          life: 5000
        });
      }
    });
}


 deleteUser(username: string): void {
  if (!this.selectedConfig || !this.inputGroupName) {
    return;
  }

  this.activeDirectoryService
    .removeUserFromGroup(
      this.selectedConfig,
      this.inputGroupName,
      username
    )
    .subscribe({
      next: () => {

        // MANUAL UI UPDATE
        this.users = this.users.filter(
          u => u.username !== username
        );
        this.userCount = this.users.length;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `User "${username}" removed successfully`,
          life: 4000
        });
      },
      error: (error) => {
        console.error('Error removing user:', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            error?.error?.message ||
            `Failed to remove user "${username}"`,
          life: 6000
        });
      }
    });
}


  // Filter methods for tables
  onUsersGlobalFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    // The filtering will be handled by PrimeNG's global filter
  }

  onNestedGroupsGlobalFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    // The filtering will be handled by PrimeNG's global filter
  }

  clearUsersTable(table: any): void {
    table.clear();
    this.searchUsersValue = '';
  }

  clearNestedGroupsTable(table: any): void {
    table.clear();
    this.searchNestedGroupsValue = '';
  }
}
