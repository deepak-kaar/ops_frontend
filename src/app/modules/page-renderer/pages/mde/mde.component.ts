import { Component, OnInit, OnDestroy, ViewEncapsulation, inject, ChangeDetectorRef } from '@angular/core';
import { PageRendererService } from '../../services/page-renderer.service';
import { Subject, forkJoin, takeUntil, of } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { PageRendererComponent } from '../../page-renderer.component';
import { Router } from '@angular/router';
import { LockScreenService, Category } from 'src/app/modules/lock-screen/lock-screen.service';

@Component({
  selector: 'app-mde',
  standalone: false,
  templateUrl: './mde.component.html',
  styleUrl: './mde.component.css',
  encapsulation: ViewEncapsulation.None
})
export class MdeComponent extends PageRendererComponent implements OnInit, OnDestroy {

  loading: boolean = false;
  mappings: any[] = [];
  orderedMappings: any[] = [];
  displayMappings: any[] = [];
  selectedMapping: any = null;
  searchValue: string = '';
  date1: Date = new Date(new Date().setDate(new Date().getDate() - 1));

  // Approval screen (Lock Screen categories for current role)
  showApprovalPanel: boolean = false;
  approvalLoading: boolean = false;
  approvalCategories: Category[] = [];
  savingApproval: boolean = false;
  approvalSearchValue: string = '';
  approvalRoleColumns: Array<{ key: string; label: string; roleId?: string; hierarchyLevel?: number }> = [];
  private currentUserHierarchyLevel: number = 0;
  private dirtyRoleKeys = new Set<string>();

  // approval matrix state
  private userRoles: string[] = [];
  private frozenCategoryIdsByRole: { [roleKey: string]: Set<string> } = {};

  /** Attribute IDs that are frozen for current user role on the current page (for preview disable) */
  frozenAttributeIds: string[] = [];
  /** Schema/property keys frozen for current role (for unmapped page fields like age.input-text.value) */
  frozenFieldKeys: string[] = [];

  private subscribe$ = new Subject<void>();
  private lockScreenService = inject(LockScreenService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();

    this.loadMappings();

    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.loadMappings();
      }
    });

    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.loadMappings();
      }
    });
  }

  ngOnDestroy() {
    this.subscribe$.next();
    this.subscribe$.complete();
  }

  /**
   * Get user's role from localStorage
   */
  private getUserRoleFromLocalStorage(): string[] {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('User from localStorage:', user);

        // Return roles array
        if (user.roles && Array.isArray(user.roles)) {
          return user.roles;
        }
        // Fallback to single 'role' field
        if (user.role) {
          return [user.role];
        }
      }
    } catch (e) {
      console.error('Error reading user from localStorage:', e);
    }
    return [];
  }

  private getUserIdFromLocalStorage(): string | null {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user?._id || user?.id || null;
      }
    } catch (e) {
      console.error('Error reading user from localStorage:', e);
    }
    return null;
  }

  /**
   * Normalize role name for comparison (case-insensitive, ignore spaces/hyphens)
   */
  private normalizeRole(role: string): string {
    if (!role) return '';
    return role.toLowerCase().replace(/[\s\-_]/g, '');
  }

  private normalizeFrequency(freq: any): string {
    return String(freq || '').trim().toUpperCase();
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  private isSameMinute(a: Date, b: Date): boolean {
    return this.isSameDay(a, b) &&
      a.getHours() === b.getHours() &&
      a.getMinutes() === b.getMinutes();
  }

  private getWeekEnd(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const daysToSunday = (7 - day) % 7;
    d.setDate(d.getDate() + daysToSunday);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private isDateWithinTimeseriesWindow(lockDate: Date, selectedDate: Date, frequency: any): boolean {
    const freq = this.normalizeFrequency(frequency);
    if (!freq) return true;

    if (freq === 'D' || freq === 'DAILY') {
      return this.isSameDay(lockDate, selectedDate);
    }

    if (freq === 'W' || freq === 'WEEK' || freq === 'WEEKLY') {
      const weekEnd = this.getWeekEnd(lockDate);
      return selectedDate >= lockDate && selectedDate <= weekEnd;
    }

    if (freq === 'M' || freq === 'MIN' || freq === 'MINUTE' || freq === 'MINUTELY') {
      return this.isSameMinute(lockDate, selectedDate);
    }

    return this.isSameDay(lockDate, selectedDate);
  }

  private isOperatorRole(role: string): boolean {
    const normalized = this.normalizeRole(role);
    return normalized.includes('operator');
  }

  private isShiftCoordinatorRole(role: string): boolean {
    const normalized = this.normalizeRole(role);
    return normalized.includes('shiftcoordinator') || normalized.includes('shiftcordinator');
  }

  private normalizeAndSortRoles(roles: Array<{ roleName: string; roleId?: string; hierarchyLevel?: number }>): Array<{ key: string; label: string; roleId?: string; hierarchyLevel?: number }> {
    const roleMap = new Map<string, { label: string; roleId?: string; hierarchyLevel?: number }>();
    for (const role of roles || []) {
      const roleName = role?.roleName || '';
      const key = this.normalizeRole(roleName);
      if (!key) continue;
      if (!roleMap.has(key)) {
        roleMap.set(key, {
          label: roleName,
          roleId: role?.roleId,
          hierarchyLevel: role?.hierarchyLevel
        });
      }
    }

    const normalized = Array.from(roleMap.entries()).map(([key, value]) => ({ key, ...value }));
    normalized.sort((a, b) => {
      const aIsOperator = this.isOperatorRole(a.label || '');
      const bIsOperator = this.isOperatorRole(b.label || '');
      if (aIsOperator && !bIsOperator) return -1;
      if (!aIsOperator && bIsOperator) return 1;

      const aIsShift = this.isShiftCoordinatorRole(a.label || '');
      const bIsShift = this.isShiftCoordinatorRole(b.label || '');
      if (aIsShift && !bIsShift) return -1;
      if (!aIsShift && bIsShift) return 1;

      return (a.label || '').localeCompare(b.label || '');
    });

    return normalized;
  }

  hasShiftCoordinatorAccess(): boolean {
    return (this.userRoles || []).some((role) => this.isShiftCoordinatorRole(role));
  }

  hasOperatorAccess(): boolean {
    return this.hasShiftCoordinatorAccess() || (this.userRoles || []).some((role) => this.isOperatorRole(role));
  }

  /**
   * Loads mapping data and filters based on user role from localStorage.
   * Uses the roles already attached to each page (`assignedRoles` / `assigned_roles`)
   * by the backend (see idt/getTemplateMappings).
   */
  loadMappings() {
    this.loading = true;

    const appId = this.filterService.currentApp?.appId ?? '';
    const orgId = this.filterService.currentOrg?.orgId ?? '';

    // Get user's roles from localStorage
    const userRoles = this.getUserRoleFromLocalStorage();
    console.log('User roles from localStorage:', userRoles);

    if (!userRoles || userRoles.length === 0) {
      console.log('No user role in localStorage - showing NO pages');
      this.mappings = [];
      this.orderedMappings = [];
      this.displayMappings = [];
      this.loading = false;
      return;
    }

    const mappingsPayload = {
      appId: appId,
      orgId: orgId,
      templateType: 'Form Design',
      // Pass user roles to backend so it can filter pages
      userRoles: userRoles
    };

    this.pageRendererService.getmapping(mappingsPayload).subscribe({
      next: (res: any) => {
        // Backend already filtered pages by userRoles.
        const allMappings =
          res?.templateMappings ||
          res?.mappings?.templateMappings ||
          res?.data ||
          res?.mappings?.data ||
          [];

        console.log(
          'All mappings from API (with roles):',
          allMappings.map((m: any) => ({
            id: m._id,
            name: m.mappingName || m.name,
            roles: m.assignedRoles || m.assigned_roles || []
          }))
        );

        // No additional filtering on frontend – backend already returned only allowed pages
        this.mappings = allMappings;
        this.orderedMappings = [...this.mappings];
        this.applyListFilter();

        // Auto-select first item
        if (!this.selectedMapping && this.displayMappings.length > 0) {
          this.selectMapping(this.displayMappings[0]);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading mappings:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Toggle and load the approval panel (Lock Screen categories for this role)
   */
  toggleApprovalPanel() {
    this.showApprovalPanel = !this.showApprovalPanel;
    if (this.showApprovalPanel) {
      this.loadApprovalCategories();
    } else {
      this.loadFrozenAttributesForPreview();
    }
  }

  /**
   * Load Lock Screen categories filtered by the user's roles from localStorage.
   * Backend filters categories where `roles` array contains any of these roles.
   */
  private loadApprovalCategories() {
    this.approvalLoading = true;

    const appId = this.filterService.currentApp?.appId ?? '';
    const orgId = this.filterService.currentOrg?.orgId ?? '';
    const userRoles = this.getUserRoleFromLocalStorage();
    this.userRoles = userRoles || [];
    const userId = this.getUserIdFromLocalStorage();

    const payload = {
      appId,
      orgId,
      userRoles,
      userId: userId || undefined
    };

    console.log('Loading approval categories with payload:', payload);

    const categories$ = this.lockScreenService.getCategoriesByRole(payload);
    const rolesObservable = appId ? this.lockScreenService.getRolesByApp(appId) : of({ roles: [] });

    forkJoin({
      cats: categories$,
      roles: rolesObservable
    }).subscribe({
      next: (res) => {
        this.approvalCategories = res.cats?.categories || [];
        const backendAccessLevel = Number(res.cats?.userAccessLevel);
        if (Number.isFinite(backendAccessLevel)) {
          this.currentUserHierarchyLevel = backendAccessLevel;
        }
        const roleList = res.roles?.roles || [];

        const roleInfoByKey = new Map<string, { roleId?: string; hierarchyLevel?: number }>();
        for (const role of roleList) {
          const key = this.normalizeRole(role?.roleName || '');
          if (!key) continue;
          const level = Number(role?.hierarchyLevel ?? (role as any)?.defaultAccessLevel);
          roleInfoByKey.set(key, {
            roleId: role?._id || role?.roleId,
            hierarchyLevel: Number.isFinite(level) ? level : undefined
          });
        }

        if (!Number.isFinite(this.currentUserHierarchyLevel) || this.currentUserHierarchyLevel === 0) {
        this.currentUserHierarchyLevel = 0;
        if (userId) {
          const roleById = roleList.find((r: any) => r?._id === userId || r?.roleId === userId);
          const levelFromId = Number(roleById?.hierarchyLevel ?? roleById?.defaultAccessLevel);
          if (Number.isFinite(levelFromId)) {
            this.currentUserHierarchyLevel = levelFromId;
          }
        }
        if (!Number.isFinite(this.currentUserHierarchyLevel) || this.currentUserHierarchyLevel === 0) {
          for (const roleName of this.userRoles || []) {
            const key = this.normalizeRole(roleName);
            const level = roleInfoByKey.get(key)?.hierarchyLevel;
            if (typeof level === 'number' && Number.isFinite(level) && level > this.currentUserHierarchyLevel) {
              this.currentUserHierarchyLevel = level;
            }
          }
        }
        }

        console.log('User hierarchyLevel:', this.currentUserHierarchyLevel);
        console.log(
          'Category access levels:',
          (this.approvalCategories || []).map((cat: any) => ({
            category: cat.categoryName,
            accessLevel: cat.accessLevel
          }))
        );

        const allRoles: Array<{ roleName: string; roleId?: string; hierarchyLevel?: number }> = [];
        for (const cat of this.approvalCategories) {
          for (const role of cat.roles || []) {
            const roleName = role?.roleName || '';
            if (!roleName) continue;
            const key = this.normalizeRole(roleName);
            const roleInfo = roleInfoByKey.get(key);
            allRoles.push({
              roleName,
              roleId: role?.roleId || roleInfo?.roleId,
              hierarchyLevel: role?.hierarchyLevel ?? roleInfo?.hierarchyLevel
            });
          }
        }
        this.approvalRoleColumns = this.normalizeAndSortRoles(allRoles);

        const frozenByRole: { [roleKey: string]: Set<string> } = {};
        for (const role of this.approvalRoleColumns) {
          frozenByRole[role.key] = new Set<string>();
        }

        for (const cat of this.approvalCategories) {
          for (const role of cat.roles || []) {
            if (!(role as any)?.ischeck) continue;
            const key = this.normalizeRole(role?.roleName || '');
            if (!key || !frozenByRole[key]) continue;
            frozenByRole[key].add(cat._id);
          }
        }

        this.frozenCategoryIdsByRole = frozenByRole;
        this.approvalLoading = false;
      },
      error: (err) => {
        console.error('Error loading approval categories:', err);
        this.approvalCategories = [];
        this.approvalRoleColumns = [];
        this.frozenCategoryIdsByRole = {};
        this.approvalLoading = false;
      }
    });
  }

  // Note: No frontend-side role filtering needed anymore.
  // Backend already filters template mappings based on userRoles.

  /**
   * Check if a category is frozen (checkbox state) for the active role
   */
  isRoleCategoryFrozen(cat: Category, roleKey: string): boolean {
    const roleSet = this.frozenCategoryIdsByRole[roleKey];
    if (!roleSet) return false;
    return roleSet.has(cat._id);
  }

  /**
   * Check if a role column exists for a given category
   */
  hasRoleInCategory(cat: Category, roleKey: string): boolean {
    const roles = Array.isArray(cat.roles) ? cat.roles : [];
    return roles.some((r) => this.normalizeRole(r?.roleName || '') === roleKey);
  }

  /**
   * Toggle freeze state for a category in the UI (not yet saved)
   */
  toggleRoleCategoryFreeze(cat: Category, role: { key: string; label: string; roleId?: string; hierarchyLevel?: number }) {
    if (!this.canEditRoleColumn(role) || !this.canEditCategory(cat)) return;
    const roleKey = role.key;
    if (!this.frozenCategoryIdsByRole[roleKey]) {
      this.frozenCategoryIdsByRole[roleKey] = new Set<string>();
    }
    const set = this.frozenCategoryIdsByRole[roleKey];
    if (set.has(cat._id)) {
      set.delete(cat._id);
    } else {
      set.add(cat._id);
    }
    this.dirtyRoleKeys.add(roleKey);
  }

  canEditRoleColumn(role: { key: string; label: string; roleId?: string; hierarchyLevel?: number }): boolean {
    if (!role?.key) return false;
    const roleLevel = Number(role.hierarchyLevel);
    if (!Number.isFinite(roleLevel)) return true;
    return this.currentUserHierarchyLevel >= roleLevel;
  }

  canEditCategory(cat: Category): boolean {
    const accessLevel = Number((cat as any)?.accessLevel);
    if (!Number.isFinite(accessLevel)) return true;
    return this.currentUserHierarchyLevel >= accessLevel;
  }

  get filteredApprovalCategories(): Category[] {
    const q = (this.approvalSearchValue || '').trim().toLowerCase();
    if (!q) return this.approvalCategories || [];
    return (this.approvalCategories || []).filter((cat) =>
      (cat.categoryName || '').toLowerCase().includes(q)
    );
  }

  /**
   * Save freeze/unfreeze selection to backend for current role
   */
  saveApprovalSettings() {
    const saveRequests: { [key: string]: any } = {};

    for (const role of this.approvalRoleColumns) {
      if (!this.canEditRoleColumn(role)) continue;
      if (!this.dirtyRoleKeys.has(role.key)) continue;
      saveRequests[role.key] = this.lockScreenService.updateFreezeForRole({
        appId: this.filterService.currentApp?.appId ?? '',
        orgId: this.filterService.currentOrg?.orgId ?? '',
        roleName: role.label,
        roleId: role.roleId,
        userId: this.getUserIdFromLocalStorage() || undefined,
        categoryIds: Array.from(this.frozenCategoryIdsByRole[role.key] || [])
      });
    }

    if (Object.keys(saveRequests).length === 0) {
      console.warn('No eligible role found to save approval settings');
      return;
    }

    console.log('Saving approval settings for dynamic roles:', this.approvalRoleColumns.map((r) => r.label));
    this.savingApproval = true;

    forkJoin(saveRequests).subscribe({
      next: () => {
        this.dirtyRoleKeys.clear();
        if (this.showApprovalPanel) {
          this.loadApprovalCategories();
        } else {
          this.loadFrozenAttributesForPreview();
        }
        this.savingApproval = false;
      },
      error: (err) => {
        console.error('Error saving approval settings:', err);
        this.savingApproval = false;
      }
    });
  }

  /**
   * Select a mapping and show its preview
   */
  selectMapping(mapping: any) {
    this.selectedMapping = mapping;
    this.loadFrozenAttributesForPreview();
  }

  /**
   * Load which attributes are frozen for the current role on the selected mapping,
   * so the preview can disable those fields.
   */
  private loadFrozenAttributesForPreview() {
    const mappingId = this.selectedMapping?.mappingId ?? this.selectedMapping?._id;
    if (!mappingId || this.showApprovalPanel) {
      this.frozenAttributeIds = [];
      this.frozenFieldKeys = [];
      return;
    }
    const appId = this.filterService.currentApp?.appId ?? '';
    const orgId = this.filterService.currentOrg?.orgId ?? '';
    const userRoles = this.getUserRoleFromLocalStorage();
    if (!userRoles?.length) {
      this.frozenAttributeIds = [];
      this.frozenFieldKeys = [];
      return;
    }
    const normalizedUserRoles = (userRoles || []).map((role) => this.normalizeRole(role));
    const mappingIdStr = String(mappingId);
    const mappingName = (this.selectedMapping?.mappingName || this.selectedMapping?.name || '').toString().trim().toLowerCase();
    const selectedIds = new Set(
      [
        mappingIdStr,
        this.selectedMapping?.mappingId,
        this.selectedMapping?._id,
        this.selectedMapping?.templateId
      ]
        .filter((v) => v != null && v !== '')
        .map((v) => String(v))
    );
    this.lockScreenService.getCategoriesByRole({ appId, orgId, userRoles, userId: this.getUserIdFromLocalStorage() || undefined }).subscribe({
      next: (res) => {
        const categories = res.categories || [];
        const ids: string[] = [];
        const fieldKeys: string[] = [];
        const selectedDate = new Date(this.date1);
        for (const cat of categories as (Category & { isFrozenForRole?: boolean })[]) {
          const isFrozen =
            cat.isFrozenForRole === true ||
            (Array.isArray(cat.roles) &&
              cat.roles.some((r) => {
                const roleKey = this.normalizeRole(r?.roleName || '');
                return normalizedUserRoles.includes(roleKey) && (r as any)?.ischeck === true;
              }));
          if (!isFrozen) continue;
          const lockDate = cat.updatedOn ? new Date(cat.updatedOn as any) : null;
          const mappings = cat.attributeMappings || [];
          for (const attr of mappings) {
            const pageId = attr.pageMappingId ?? attr.pageMapping_id;
            const templateId = attr.templateId ?? attr.template_id;
            const pageName = (attr.pageName || '').toString().trim().toLowerCase();
            const matchesSelected =
              (pageId != null && selectedIds.has(String(pageId))) ||
              (templateId != null && selectedIds.has(String(templateId))) ||
              (mappingName && pageName && pageName === mappingName);
            if (matchesSelected) {
              if (attr.frequency && lockDate) {
                if (!this.isDateWithinTimeseriesWindow(lockDate, selectedDate, attr.frequency)) {
                  continue;
                }
              }
              if (attr.attributeId) {
                ids.push(String(attr.attributeId));
              }
              if (attr.propertyKey) {
                fieldKeys.push(String(attr.propertyKey));
              }
              if (attr.schemaKey) {
                fieldKeys.push(String(attr.schemaKey));
              }
            }
          }
        }
        this.frozenAttributeIds = [...new Set(ids)];
        this.frozenFieldKeys = [...new Set(fieldKeys)];
      },
      error: () => {
        this.frozenAttributeIds = [];
        this.frozenFieldKeys = [];
      }
    });
  }

  /**
   * Check if an item is selected
   */
  isSelected(item: any): boolean {
    if (!item || !this.selectedMapping) return false;
    return (item.mappingId && item.mappingId === this.selectedMapping.mappingId) ||
           (item._id && item._id === this.selectedMapping._id);
  }

  /**
   * Handle date change
   */
  onDateChange() {
    if (!this.showApprovalPanel) {
      this.loadFrozenAttributesForPreview();
    }
  }

  /**
   * Filter the list by search term
   */
  applyListFilter() {
    const q = (this.searchValue || '').trim().toLowerCase();
    if (!q) {
      this.displayMappings = [...this.orderedMappings];
      return;
    }

    this.displayMappings = this.orderedMappings.filter(m => {
      const name = (m.mappingName || m.name || '').toString().toLowerCase();
      const desc = (m.mappingDescription || m.description || '').toString().toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }
}
