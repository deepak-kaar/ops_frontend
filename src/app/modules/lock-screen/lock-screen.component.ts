import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PrimeNgModules } from '../../core/modules/primeng.module';
import { LockScreenService, Category, App, Role } from './lock-screen.service';
import { LockScreenExportService } from './services/lock-screen-export.service';
import { SidebarNewComponent } from '../../core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from '../../core/components/topbar-new/topbar-new.component';
import { FilterNewComponent } from '../../core/components/filter-new/filter-new.component';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { AttributeMappingDialogComponent } from './components/attribute-mapping-dialog/attribute-mapping-dialog.component';
import { ConfirmationDailogExcelComponent } from '../pi-administration/components/confirmation-dailog-excel/confirmation-dailog-excel.component';
import { FilterService } from '../../core/services/filter/filter.service';
import { Subscription } from 'rxjs';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';
import { Table } from 'primeng/table';
import {
    DeleteConfirmationDialogComponent,
    DeleteConfirmationDialogResult
} from '../../core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
    selector: 'app-lock-screen',
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
    templateUrl: './lock-screen.component.html',
    styleUrls: ['./lock-screen.component.css']
})
export class LockScreenComponent implements OnInit, OnDestroy {
    @ViewChild('categoriesTable') categoriesTable?: Table;
    categories: Category[] = [];
    isLoading: boolean = false;
    error: string | null = null;
    mobileSidebarOpen: boolean = false;
    private filterSubscriptions: Subscription[] = [];
    labels: string[] = [];
    selectedLabel: string | null = null;

    // Inline edit properties
    activeCategory: Category | null = null;
    isShowCategoryDetails: boolean = false;
    categoryForm: FormGroup;
    allRoles: Role[] = [];
    availableRoles: Role[] = [];
    selectedRoles: Role[] = [];
    isLoadingRoles: boolean = false;
    mappedAttributesCount: number = 0;
    existingMappings: any[] = [];

    constructor(
        private lockScreenService: LockScreenService,
        private messageService: MessageService,
        private dialogService: DialogService,
        private filterService: FilterService,
        private labelService: LabelService,
        private fb: FormBuilder,
        private exportService: LockScreenExportService,
        private router: Router
    ) {
        this.categoryForm = this.fb.group({
            categoryName: ['', [Validators.required, Validators.maxLength(100)]],
            categoryDescription: ['', [Validators.maxLength(500)]],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        // Subscribe to filter changes
        this.filterSubscriptions.push(
            this.filterService.selectedApp$.subscribe(app => {
                this.fetchCategories();
            })
        );

        this.filterSubscriptions.push(
            this.filterService.selectedOrg$.subscribe(org => {
                this.fetchCategories();
            })
        );

        // Subscribe to rollout label changes
        this.filterSubscriptions.push(
            this.labelService.selectedLabel$.subscribe(label => {
                this.selectedLabel = label;
            })
        );

        // Load rollout labels
        this.loadLabels();

        // Initial load of categories
        this.fetchCategories();
    }

    ngOnDestroy(): void {
        this.filterSubscriptions.forEach(sub => sub.unsubscribe());
        this.isShowCategoryDetails = false;
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

    fetchCategories(): void {
        const selectedApp = this.filterService.currentApp;
        const selectedOrg = this.filterService.currentOrg;

        // If no app selected, clear categories
        if (!selectedApp) {
            this.categories = [];
            return;
        }

        this.isLoading = true;
        this.error = null;

        const appId = selectedApp?.appId || '';
        const orgId = selectedOrg?.orgId || '';

        this.lockScreenService.getCategories(orgId, appId).subscribe({
            next: (response) => {
                this.categories = response.categories || [];
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching categories:', err);
                this.error = 'Failed to load categories. Please try again later.';
                this.isLoading = false;
            }
        });
    }

    openAddCategoryDialog(): void {
        this.router.navigateByUrl('/lockScreen/category/create');
    }

    openEditCategoryDialog(category: Category): void {
        this.router.navigate(['/lockScreen/category/edit', category._id], { state: { category } });
    }

    onCategorySelectRow(category: Category): void {
        this.activeCategory = category;
        this.patchCategoryValue(category);
        this.loadRoles();
        this.loadCategoryDetails(category._id);
        this.isShowCategoryDetails = true;
    }

    patchCategoryValue(category: Category): void {
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
        this.filterAvailableRoles();
    }

    loadRoles(): void {
        const selectedApp = this.filterService.currentApp;
        if (!selectedApp) {
            this.allRoles = [];
            this.availableRoles = [];
            return;
        }

        this.isLoadingRoles = true;
        this.lockScreenService.getRolesByApp(selectedApp.appId).subscribe({
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

    editCategory(): void {
        if (!this.activeCategory) return;
        this.openEditCategoryDialog(this.activeCategory);
    }

    openAttributeMappingDialog(): void {
        if (!this.activeCategory) return;

        const selectedApp = this.filterService.currentApp;
        const selectedOrg = this.filterService.currentOrg;

        const attributeMappingRef = this.dialogService.open(AttributeMappingDialogComponent, {
            header: 'Map Attributes to Category',
            width: '90vw',
            height: '80vh',
            modal: true,
            closable: true,
            maximizable: true,
            data: {
                categoryId: this.activeCategory._id,
                appId: selectedApp?.appId || '',
                orgId: selectedOrg?.orgId || ''
            }
        });

        attributeMappingRef.onClose.subscribe((result: any) => {
            if (result?.success && result?.attributeMappings && this.activeCategory) {
                this.saveAttributeMappings(this.activeCategory._id, result.attributeMappings);
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
            },
            error: (err) => {
                console.error('Error mapping attributes:', err);
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err.error?.response || 'Failed to map attributes to category'
                });
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

    clearCategoryTable(): void {
        this.categoriesTable?.clear();
        this.activeCategory = null;
        this.isShowCategoryDetails = false;
    }

    onSearchCategories(event: Event): void {
        const value = (event.target as HTMLInputElement)?.value ?? '';
        this.categoriesTable?.filterGlobal(value, 'contains');
    }

    deleteCategory(category: Category, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }

        const deleteDialogRef = this.dialogService.open(DeleteConfirmationDialogComponent, {
            showHeader: false,
            closable: false,
            modal: true,
            dismissableMask: true,
            styleClass: 'delete-confirmation-modal',
            width: '460px',
            data: {
                entityLabel: 'Category',
                itemName: category.categoryName ?? '',
                title: 'Delete Category',
                subtitle: 'This action cannot be undone',
                confirmText: 'Delete Category',
                cancelText: 'Cancel'
            }
        });

        deleteDialogRef.onClose.subscribe((result?: DeleteConfirmationDialogResult) => {
            if (!result?.confirmed) return;

            this.isShowCategoryDetails = false;
            this.isLoading = true;
            this.lockScreenService.deleteCategory(category._id).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.fetchCategories();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Category deleted successfully'
                    });
                },
                error: (err) => {
                    console.error('Error deleting category:', err);
                    this.isLoading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete category'
                    });
                }
            });
        });
    }

    exportCategories(): void {
        if (this.categories.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No categories to export' });
            return;
        }
        this.isLoading = true;
        const categoryDetailsPromises = this.categories.map(cat => 
            this.lockScreenService.getCategoryById(cat._id).toPromise()
        );
        Promise.all(categoryDetailsPromises).then((responses: any[]) => {
            const fullCategories = responses.map(res =>
                res?.category ||
                res?.data?.category ||
                res?.response?.category ||
                res?.result?.category ||
                res
            );
            return this.exportService.exportToExcel(fullCategories);
        }).then(() => {
            this.isLoading = false;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Categories exported successfully' });
        }).catch((err) => {
            console.error('Export error:', err);
            this.isLoading = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to export categories' });
        });
    }

    importCategories(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.onchange = (event: any) => {
            const file = event.target.files[0];
            if (file) this.handleImport(file);
        };
        input.click();
    }

    async handleImport(file: File): Promise<void> {
        try {
            this.isLoading = true;
            const importedData = await this.exportService.parseExcelFile(file);
            if (importedData.length === 0) {
                this.messageService.add({ severity: 'warn', summary: 'No Data', detail: 'The imported file contains no data' });
                this.isLoading = false;
                return;
            }
            
            const formattedData = importedData.map((row: any, index: number) => ({
                rowIndex: index + 2,
                rowData: row,
                action: row['Action'] || 'No Change'
            }));

            this.isLoading = false;
            
            const confirmDialogRef = this.dialogService.open(ConfirmationDailogExcelComponent, {
                header: 'Confirm Import',
                modal: true,
                closable: true,
                width: '80vw',
                data: {
                    importData: formattedData,
                    displayColumns: [
                        { header: 'Category Name', field: 'Category Name' },
                        { header: 'Description', field: 'Category Description' },
                        { header: 'Is Active', field: 'Is Active' },
                        { header: 'Roles', field: 'Roles' }
                    ]
                }
            });

            confirmDialogRef.onClose.subscribe((result: any) => {
                if (result?.confirmed) {
                    this.processImport(result.data);
                }
            });
        } catch (error) {
            this.isLoading = false;
            this.messageService.add({ severity: 'error', summary: 'Import Error', detail: 'Failed to import Excel file' });
        }
    }

    processImport(groupedChanges: any): void {
        this.isLoading = true;
        const selectedApp = this.filterService.currentApp;
        const selectedOrg = this.filterService.currentOrg;
        let completed = 0;
        const total = groupedChanges.addNew.length + groupedChanges.edit.length + groupedChanges.delete.length;

        groupedChanges.addNew.forEach((item: any) => {
            const cat = item.rowData;
            const payload = {
                categoryName: cat['Category Name'],
                categoryDescription: cat['Category Description'] || '',
                isActive: cat['Is Active']?.toString().toLowerCase() === 'yes',
                appId: selectedApp?.appId,
                orgId: selectedOrg?.orgId,
                roles: this.parseRoles(cat['Roles'])
            };
            this.lockScreenService.createCategory(payload).subscribe({
                next: () => { completed++; if (completed === total) this.finishImport(); },
                error: () => { completed++; if (completed === total) this.finishImport(); }
            });
        });

        groupedChanges.edit.forEach((item: any) => {
            const cat = item.rowData;
            const payload = {
                categoryName: cat['Category Name'],
                categoryDescription: cat['Category Description'] || '',
                isActive: cat['Is Active']?.toString().toLowerCase() === 'yes',
                roles: this.parseRoles(cat['Roles'])
            };
            this.lockScreenService.updateCategory(cat['_id'], payload).subscribe({
                next: () => { completed++; if (completed === total) this.finishImport(); },
                error: () => { completed++; if (completed === total) this.finishImport(); }
            });
        });

        groupedChanges.delete.forEach((item: any) => {
            const cat = item.rowData;
            this.lockScreenService.deleteCategory(cat['_id']).subscribe({
                next: () => { completed++; if (completed === total) this.finishImport(); },
                error: () => { completed++; if (completed === total) this.finishImport(); }
            });
        });

        if (total === 0) this.finishImport();
    }

    parseRoles(rolesStr: string): Role[] {
        if (!rolesStr) return [];
        const roleNames = rolesStr.split(',').map(r => r.trim()).filter(r => r);
        return roleNames.map(name => {
            const role = this.allRoles.find(r => r.roleName === name);
            return role || { roleId: '', roleName: name, roleDescription: '' };
        });
    }

    finishImport(): void {
        this.isLoading = false;
        this.fetchCategories();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Import completed' });
    }
}
