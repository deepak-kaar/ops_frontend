import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { UserEnablerComponent } from '../../user-enabler.component';

@Component({
  selector: 'app-role-hierarchy',
  standalone: false,
  templateUrl: './role-hierarchy.component.html',
  styleUrl: './role-hierarchy.component.css'
})
export class RoleHierarchyComponent extends UserEnablerComponent implements OnInit {

  roles: any[] = [];
  loading = false;
  savingId: string | null = null;

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.spinner.show();
    this.userEnablerService.getRolesHierarchy().pipe(
      finalize(() => {
        this.loading = false;
        this.spinner.hide();
      })
    ).subscribe({
      next: (res: any) => {
        this.roles = res?.data || [];
      },
      error: () => {
        this.roles = [];
        this.showToast('error', 'Error', 'Failed to load roles', 3000, false);
      }
    });
  }

  updateRole(role: any): void {
    const roleId = role?._id;
    if (!roleId) {
      this.showToast('error', 'Error', 'Role ID not found', 3000, false);
      return;
    }

    let value: number | null = role?.hierarchyLevel ?? null;
    if (role?.hierarchyLevel === '' || role?.hierarchyLevel === undefined) {
      value = null;
    }
    if (value !== null) {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        this.showToast('error', 'Error', 'Hierarchy must be a number', 3000, false);
        return;
      }
      value = parsed;
    }

    this.savingId = roleId;
    this.userEnablerService.updateRoleHierarchy(roleId, value).pipe(
      finalize(() => {
        this.savingId = null;
      })
    ).subscribe({
      next: () => {
        this.showToast('success', 'Updated', 'Role hierarchy updated', 2000, false);
        this.loadRoles();
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to update role hierarchy', 3000, false);
      }
    });
  }
}
