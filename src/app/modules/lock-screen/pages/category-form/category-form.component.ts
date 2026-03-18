import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PrimeNgModules } from '../../../../core/modules/primeng.module';
import { LockScreenService, Role } from '../../lock-screen.service';
import { SidebarNewComponent } from '../../../../core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from '../../../../core/components/topbar-new/topbar-new.component';
import { FilterNewComponent } from '../../../../core/components/filter-new/filter-new.component';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { AttributeMappingDialogComponent } from '../../components/attribute-mapping-dialog/attribute-mapping-dialog.component';
import { FilterService } from '../../../../core/services/filter/filter.service';
import { Subscription } from 'rxjs';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';

@Component({
    selector: 'app-category-form',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        PrimeNgModules,
        SidebarNewComponent,
        TopbarNewComponent,
        FilterNewComponent
    ],
    providers: [MessageService, DialogService],
    templateUrl: './category-form.component.html',
    styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, OnDestroy {
    categoryForm: FormGroup;
    mode: 'create' | 'edit' = 'create';
    isLoading: boolean = false;
    mappedAttributesCount: number = 0;
    existingMappings: any[] = [];
    pendingMappings: any[] = [];

    allRoles: Role[] = [];
    availableRoles: Role[] = [];
    selectedRoles: Role[] = [];
    isLoadingRoles: boolean = false;

    labels: string[] = [];
    selectedLabel: string | null = null;
    mobileSidebarOpen: boolean = false;
    private filterSubscriptions: Subscription[] = [];

    private categoryId: string | null = null;

    constructor(
        private fb: FormBuilder,
        private lockScreenService: LockScreenService,
        private messageService: MessageService,
        private dialogService: DialogService,
        private filterService: FilterService,
        private labelService: LabelService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.categoryForm = this.fb.group({
            categoryName: ['', [Validators.required, Validators.maxLength(100)]],
            categoryDescription: ['', [Validators.maxLength(500)]],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.filterSubscriptions.push(
            this.labelService.selectedLabel$.subscribe(label => {
                this.selectedLabel = label;
            })
        );
        this.loadLabels();

        this.filterSubscriptions.push(
            this.filterService.selectedApp$.subscribe(() => {
                this.loadRoles();
            })
        );

        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.mode = 'edit';
                this.categoryId = id;
                this.loadCategoryForEdit(id);
            } else {
                this.mode = 'create';
                this.categoryId = null;
                this.loadRoles();
            }
        });
    }

    ngOnDestroy(): void {
        this.filterSubscriptions.forEach(sub => sub.unsubscribe());
    }

    toggleSidebar(): void {
        this.mobileSidebarOpen = !this.mobileSidebarOpen;
    }

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

    private loadCategoryForEdit(categoryId: string): void {
        this.isLoading = true;
        this.lockScreenService.getCategoryById(categoryId).subscribe({
            next: (response: any) => {
                const category = response.category || response?.data?.category || response;
                this.categoryForm.patchValue({
                    categoryName: category.categoryName,
                    categoryDescription: category.categoryDescription || '',
                    isActive: category.isActive !== undefined ? category.isActive : true
                });

                if (category.roles && Array.isArray(category.roles)) {
                    this.selectedRoles = category.roles.map((role: any) => ({
                        roleId: role.roleId,
                        roleName: role.roleName,
                        roleDescription: role.roleDescription || ''
                    }));
                } else {
                    this.selectedRoles = [];
                }

                this.existingMappings = category.attributeMappings || [];
                this.mappedAttributesCount = this.existingMappings.length;
                this.loadRoles();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load category details.'
                });
                this.goBack();
            }
        });
    }

    loadRoles(): void {
        const appId = this.filterService.currentApp?.appId;
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

    filterAvailableRoles(): void {
        const selectedRoleIds = this.selectedRoles.map(r => r.roleId);
        this.availableRoles = this.allRoles.filter(role => !selectedRoleIds.includes(role.roleId));
    }

    addRole(role: Role): void {
        if (!this.selectedRoles.some(r => r.roleId === role.roleId)) {
            this.selectedRoles = [...this.selectedRoles, role];
            this.filterAvailableRoles();
        }
    }

    removeRole(role: Role): void {
        this.selectedRoles = this.selectedRoles.filter(r => r.roleId !== role.roleId);
        this.filterAvailableRoles();
    }

    openAttributeMappingDialog(): void {
        const categoryId = this.mode === 'edit' ? this.categoryId : null;
        const appId = this.filterService.currentApp?.appId || '';
        const orgId = this.filterService.currentOrg?.orgId || '';

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
                if (this.mode === 'edit' && categoryId) {
                    this.saveAttributeMappings(categoryId, result.attributeMappings);
                } else {
                    this.pendingMappings = result.attributeMappings;
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

    saveCategory(): void {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        const selectedApp = this.filterService.currentApp;
        const selectedOrg = this.filterService.currentOrg;
        if (!selectedApp) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Select App',
                detail: 'Please select an application first.'
            });
            return;
        }

        this.isLoading = true;
        const formValue = this.categoryForm.value;

        if (this.mode === 'create') {
            const payload: any = {
                categoryName: formValue.categoryName,
                categoryDescription: formValue.categoryDescription,
                isActive: formValue.isActive,
                appId: selectedApp?.appId,
                orgId: selectedOrg?.orgId,
                roles: this.selectedRoles.map(role => ({
                    roleId: role.roleId,
                    roleName: role.roleName,
                    roleDescription: role.roleDescription || ''
                }))
            };

            this.lockScreenService.createCategory(payload).subscribe({
                next: (response) => {
                    const createdId = response.category?._id || response._id || response.data?._id;
                    if (createdId && this.pendingMappings.length > 0) {
                        this.saveAttributeMappings(createdId, this.pendingMappings, true);
                    } else {
                        this.isLoading = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Category created successfully'
                        });
                        this.goBack();
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
            if (!this.categoryId) return;
            const payload: any = {
                categoryName: formValue.categoryName,
                categoryDescription: formValue.categoryDescription,
                isActive: formValue.isActive,
                roles: this.selectedRoles.map(role => ({
                    roleId: role.roleId,
                    roleName: role.roleName,
                    roleDescription: role.roleDescription || ''
                }))
            };

            this.lockScreenService.updateCategory(this.categoryId, payload).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Category updated successfully'
                    });
                    this.goBack();
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

    saveAttributeMappings(categoryId: string, attributeMappings: any[], navigateAfter: boolean = false): void {
        this.isLoading = true;
        this.lockScreenService.mapAttributesToCategory(categoryId, attributeMappings).subscribe({
            next: () => {
                this.isLoading = false;
                this.mappedAttributesCount = attributeMappings.length;
                this.existingMappings = attributeMappings;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Attributes mapped to category successfully'
                });
                if (navigateAfter) {
                    this.goBack();
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
                if (navigateAfter) {
                    this.goBack();
                }
            }
        });
    }

    getMappedAttributesByPage(): any[] {
        if (!this.existingMappings || this.existingMappings.length === 0) {
            return [];
        }

        const pageMap = new Map<string, any[]>();
        this.existingMappings.forEach((mapping: any) => {
            const pageName = mapping.pageName || 'Unknown Page';
            if (!pageMap.has(pageName)) {
                pageMap.set(pageName, []);
            }
            pageMap.get(pageName)!.push(mapping);
        });

        return Array.from(pageMap.entries()).map(([pageName, attributes]) => ({
            pageName: pageName,
            attributes: attributes
        }));
    }

    goBack(): void {
        this.router.navigateByUrl('/lockScreen');
    }
}
