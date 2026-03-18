import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PrimeNgModules } from '../../../../core/modules/primeng.module';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { LockScreenService, Role } from '../../lock-screen.service';
import { MessageService } from 'primeng/api';
import { AttributeMappingDialogComponent } from '../attribute-mapping-dialog/attribute-mapping-dialog.component';

@Component({
    selector: 'app-category-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PrimeNgModules
    ],
    providers: [MessageService, DialogService],
    templateUrl: './category-dialog.component.html',
    styleUrls: ['./category-dialog.component.css']
})
export class CategoryDialogComponent implements OnInit {
    categoryForm: FormGroup;
    mode: 'create' | 'edit' = 'create';
    isLoading: boolean = false;
    mappedAttributesCount: number = 0;
    existingMappings: any[] = [];
    
    /** List of all available roles */
    allRoles: Role[] = [];
    /** List of available roles (filtered to exclude selected) */
    availableRoles: Role[] = [];
    /** List of selected roles */
    selectedRoles: Role[] = [];
    /** Flag to indicate if roles are being loaded */
    isLoadingRoles: boolean = false;

    constructor(
        private fb: FormBuilder,
        private lockScreenService: LockScreenService,
        private messageService: MessageService,
        private dialogService: DialogService,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.categoryForm = this.fb.group({
            categoryName: ['', [Validators.required, Validators.maxLength(100)]],
            categoryDescription: ['', [Validators.maxLength(500)]],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.mode = this.config.data?.mode || 'create';
        
        // Load roles for the selection
        this.loadRoles();
        
        if (this.mode === 'edit' && this.config.data?.category) {
            const category = this.config.data.category;
            this.categoryForm.patchValue({
                categoryName: category.categoryName,
                categoryDescription: category.categoryDescription || '',
                isActive: category.isActive !== undefined ? category.isActive : true
            });
            
            // Load selected roles from category
            if (category.roles && Array.isArray(category.roles)) {
                this.selectedRoles = category.roles.map((role: any) => ({
                    roleId: role.roleId,
                    roleName: role.roleName,
                    roleDescription: role.roleDescription || ''
                }));
            } else if (category.roleId) {
                // Backward compatibility: handle single role
                this.selectedRoles = [{
                    roleId: category.roleId,
                    roleName: category.roleName || '',
                    roleDescription: ''
                }];
            }
            
            // Load full category details to get attribute mappings
            if (category._id) {
                this.loadCategoryDetails(category._id);
            }
        }
    }

    /**
     * Loads the list of roles based on the selected application.
     */
    loadRoles(): void {
        const appId = this.config.data?.appId;
        
        if (!appId) {
            this.allRoles = [];
            this.availableRoles = [];
            return;
        }

        this.isLoadingRoles = true;
        this.lockScreenService.getRolesByApp(appId).subscribe({
            next: (response) => {
                this.allRoles = (response.roles || []).map((role: any) => ({
                    roleId: role.roleId,
                    roleName: role.roleName,
                    roleDescription: role.roleDescription
                }));
                this.filterAvailableRoles();
                this.isLoadingRoles = false;
            },
            error: (err) => {
                console.error('Error loading roles:', err);
                this.allRoles = [];
                this.availableRoles = [];
                this.isLoadingRoles = false;
            }
        });
    }

    /**
     * Filters available roles to exclude already selected roles.
     */
    filterAvailableRoles(): void {
        const selectedRoleIds = this.selectedRoles.map(r => r.roleId);
        this.availableRoles = this.allRoles.filter(role => !selectedRoleIds.includes(role.roleId));
    }

    /**
     * Adds a role to the selected roles list.
     * @param role - The role to add
     */
    addRole(role: Role): void {
        if (!this.selectedRoles.some(r => r.roleId === role.roleId)) {
            this.selectedRoles = [...this.selectedRoles, role];
            this.filterAvailableRoles();
        }
    }

    /**
     * Removes a role from the selected roles list.
     * @param role - The role to remove
     */
    removeRole(role: Role): void {
        this.selectedRoles = this.selectedRoles.filter(r => r.roleId !== role.roleId);
        this.filterAvailableRoles();
    }

    loadCategoryDetails(categoryId: string): void {
        this.lockScreenService.getCategoryById(categoryId).subscribe({
            next: (response: any) => {
                this.existingMappings = response.category?.attributeMappings || [];
                this.mappedAttributesCount = this.existingMappings.length;
            },
            error: (err) => {
                console.error('Error loading category details:', err);
            }
        });
    }

    saveCategory(): void {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        const formValue = this.categoryForm.value;

        if (this.mode === 'create') {
            const payload: any = {
                categoryName: formValue.categoryName,
                categoryDescription: formValue.categoryDescription,
                isActive: formValue.isActive,
                appId: this.config.data?.appId,
                orgId: this.config.data?.orgId
            };
            
            // Add roles array if any roles are selected
            if (this.selectedRoles.length > 0) {
                payload.roles = this.selectedRoles.map(role => ({
                    roleId: role.roleId,
                    roleName: role.roleName,
                    roleDescription: role.roleDescription || ''
                }));
            } else {
                payload.roles = [];
            }

            this.lockScreenService.createCategory(payload).subscribe({
                next: (response) => {
                    // If attribute mappings were selected, save them
                    const categoryId = response.category?._id || response._id || response.data?._id;
                    if (categoryId && this.config.data?.attributeMappings?.length > 0) {
                        this.saveAttributeMappings(categoryId, this.config.data.attributeMappings);
                    } else {
                        this.isLoading = false;
                        this.ref.close(true);
                    }
                },
                error: (err) => {
                    console.error('Error creating category:', err);
                    this.isLoading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error?.response || 'Failed to create category'
                    });
                }
            });
        } else {
            const category = this.config.data.category;
            const payload: any = {
                categoryName: formValue.categoryName,
                categoryDescription: formValue.categoryDescription,
                isActive: formValue.isActive
            };
            
            // Add roles array
            payload.roles = this.selectedRoles.map(role => ({
                roleId: role.roleId,
                roleName: role.roleName,
                roleDescription: role.roleDescription || ''
            }));

            this.lockScreenService.updateCategory(category._id, payload).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.ref.close(true);
                },
                error: (err) => {
                    console.error('Error updating category:', err);
                    this.isLoading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error?.response || 'Failed to update category'
                    });
                }
            });
        }
    }

    cancel(): void {
        this.ref.close(false);
    }

    openAttributeMappingDialog(): void {
        const categoryId = this.mode === 'edit' ? this.config.data?.category?._id : null;
        const appId = this.config.data?.appId || '';
        const orgId = this.config.data?.orgId || '';

        const attributeMappingRef = this.dialogService.open(AttributeMappingDialogComponent, {
            header: 'Map Attributes to Category',
            width: '90vw',
            height: '80vh',
            modal: true,
            closable: true,
            maximizable: true,
            data: {
                categoryId: categoryId,
                appId: appId,
                orgId: orgId
            }
        });

        attributeMappingRef.onClose.subscribe((result: any) => {
            if (result?.success && result?.attributeMappings) {
                // If editing, save the mappings immediately
                if (this.mode === 'edit' && categoryId) {
                    this.saveAttributeMappings(categoryId, result.attributeMappings);
                } else {
                    // If creating, store mappings to be saved with category
                    this.config.data.attributeMappings = result.attributeMappings;
                    this.mappedAttributesCount = result.attributeMappings.length;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `${result.attributeMappings.length} attribute(s) selected. They will be saved when you create the category.`
                    });
                }
            }
        });
    }

    saveAttributeMappings(categoryId: string, attributeMappings: any[]): void {
        this.isLoading = true;
        this.lockScreenService.mapAttributesToCategory(categoryId, attributeMappings).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.mappedAttributesCount = attributeMappings.length;
                this.existingMappings = attributeMappings;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Attributes mapped to category successfully'
                });
                // Close dialog after mapping is saved (for create mode)
                if (this.mode === 'create') {
                    this.ref.close(true);
                }
            },
            error: (err) => {
                console.error('Error mapping attributes:', err);
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.response || 'Failed to map attributes to category'
                });
                // Still close dialog even if mapping fails (for create mode)
                if (this.mode === 'create') {
                    this.ref.close(true);
                }
            }
        });
    }

    getMappedAttributesByPage(): any[] {
        if (!this.existingMappings || this.existingMappings.length === 0) {
            return [];
        }

        // Group attributes by page
        const pageMap = new Map<string, any[]>();
        
        this.existingMappings.forEach((mapping: any) => {
            const pageName = mapping.pageName || 'Unknown Page';
            if (!pageMap.has(pageName)) {
                pageMap.set(pageName, []);
            }
            pageMap.get(pageName)!.push(mapping);
        });

        // Convert map to array
        return Array.from(pageMap.entries()).map(([pageName, attributes]) => ({
            pageName: pageName,
            attributes: attributes
        }));
    }
}
