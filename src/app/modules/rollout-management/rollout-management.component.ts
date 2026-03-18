import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RolloutService, StagedChange, Commit } from './services/rollout.service';
import { LabelService } from './services/label.service';
import { ImportService, ImportAction, ImportResult, ImportSummary } from './services/import.service';
import { CommonModule } from '@angular/common';
import { PrimeNgModules } from '../../core/modules/primeng.module';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Observable } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { SidebarNewComponent } from "../../core/components/sidebar-new/sidebar-new.component";
import { TopbarNewComponent } from "../../core/components/topbar-new/topbar-new.component";
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { FilterByPipe } from './pipes/filter-by.pipe';
import { PageAdministratorService } from '../page-administrator/page-administrator.service';

type BadgeSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

@Component({
  selector: 'app-rollout-management',
  standalone: true,
  imports: [CommonModule, PrimeNgModules, FormsModule, ToastModule, ConfirmDialogModule, SidebarNewComponent, TopbarNewComponent, MonacoEditorModule, FilterByPipe],
  templateUrl: './rollout-management.component.html',
  styleUrls: ['./rollout-management.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class RolloutManagementComponent implements OnInit {
  stagedChanges: StagedChange[] = [];
  commits: Commit[] = [];
  committedChanges: StagedChange[] = [];
  selectedChanges: StagedChange[] = [];
  commitMessage: string = '';
  showCommitDialog: boolean = false;
  showDiffDialog: boolean = false;
  selectedChangeForDiff: StagedChange | null = null;
  modules: string[] = [];
  mobileSidebarVisible = false;
  isCommitting: boolean = false; // Prevent multiple simultaneous commits
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  // Tab configuration
  tabOptions = [
    { label: 'Staged Changes', value: 0 },
    { label: 'Commit History', value: 1 }
  ];
  selectedTab: number = 0;

  // Label management
  labels: string[] = [];
  selectedLabel: string | null = null;
  showAddLabelDialog: boolean = false;
  newLabelName: string = '';
  isCreatingLabel: boolean = false;

  // Grouped changes by label
  groupedChangesByLabel: { [label: string]: StagedChange[] } = {};
  // Grouped changes by label and module: { label: { module: changes[] } }
  groupedChangesByLabelAndModule: { [label: string]: { [module: string]: StagedChange[] } } = {};
  activeAccordionIndices: number[] = [];
  // Track active module accordion indices per label
  activeModuleAccordionIndices: { [label: string]: number[] } = {};

  // Import Excel functionality
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  showImportPreviewDialog: boolean = false;
  showImportResultDialog: boolean = false;
  isImporting: boolean = false;
  isParsingFile: boolean = false;
  importActions: ImportAction[] = [];
  importCreateActions: ImportAction[] = [];
  importEditActions: ImportAction[] = [];
  importDeleteActions: ImportAction[] = [];
  importValidActions: ImportAction[] = [];
  importInvalidActions: ImportAction[] = [];
  importIgnoredCount: number = 0;
  importSummary: ImportSummary | null = null;

  // Monaco Editor options for diff view
  diffEditorOptions = {
    theme: 'vs',
    readOnly: true,
    renderSideBySide: true,
    enableSplitViewResizing: true,
    automaticLayout: true
  };

  oldDataString: string = '';
  newDataString: string = '';

  // Application and Organization filter
  apps: { appId: string; appName: string }[] = [];
  orgs: { orgId: string; orgName: string }[] = [];
  selectedApp: string | null = null;
  selectedOrg: string | null = null;

  constructor(
    private rolloutService: RolloutService,
    private labelService: LabelService,
    private importService: ImportService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private responsive: ResponsiveService,
    private pageAdminService: PageAdministratorService
  ) {}

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();
    this.loadLabels();
    this.loadChanges();
    this.loadApps();

    // Subscribe to label changes
    this.labelService.selectedLabel$.subscribe(label => {
      this.selectedLabel = label;
      this.loadChanges();
    });

    // Initialize accordion - expand first panel by default
    this.activeAccordionIndices = [0];
  }

  /**
   * Load applications from server
   */
  loadApps(): void {
    this.pageAdminService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.apps?.map((app: any) => ({
          appId: app.appId,
          appName: app.appName
        })) || [];
      },
      error: (err) => {
        console.error('Failed to fetch applications:', err);
      }
    });
  }

  /**
   * Load organizations for selected application
   */
  loadOrgs(appId: string): void {
    if (!appId) {
      this.orgs = [];
      return;
    }
    this.pageAdminService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {
        this.orgs = res.orgs?.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        })) || [];
      },
      error: (err) => {
        console.error('Failed to fetch organizations:', err);
      }
    });
  }

  /**
   * Handle application change
   */
  onAppFilterChange(): void {
    this.selectedOrg = null;
    this.orgs = [];
    if (this.selectedApp) {
      this.loadOrgs(this.selectedApp);
    }
  }

  /**
   * Handle organization change
   */
  onOrgFilterChange(): void {
    // Could trigger data reload if needed
  }

  toggleMobileSidebar() {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  onTabChange(event: any): void {
    this.selectedTab = event?.option?.value ?? event?.value ?? 0;
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

  loadChanges(): void {
    // Load staged changes (load all, not filtered by label, so we can group them)
    this.rolloutService.getStagedChanges(1, 1000).subscribe({
      next: (changes) => {
        this.stagedChanges = changes;
        this.groupChangesByLabel();
        this.updateModules();

        // Expand first accordion panel if there are changes
        if (this.stagedChanges.length > 0 && this.activeAccordionIndices.length === 0) {
          this.activeAccordionIndices = [0];
        }
      },
      error: (error) => {
        console.error('Error loading staged changes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load staged changes'
        });
      }
    });

    // Load commits
    this.rolloutService.getCommits().subscribe({
      next: (commits) => {
        this.commits = commits;
        this.updateModules();
      },
      error: (error) => {
        console.error('Error loading commits:', error);
      }
    });

    // Load committed changes
    this.rolloutService.getCommittedChanges().subscribe({
      next: (changes) => {
        this.committedChanges = changes;
      },
      error: (error) => {
        console.error('Error loading committed changes:', error);
      }
    });
  }

  updateModules(): void {
    const moduleSet = new Set<string>();
    this.stagedChanges.forEach(c => moduleSet.add(c.module));
    this.commits.forEach(commit => {
      commit.changes.forEach(c => moduleSet.add(c.module));
    });
    this.modules = Array.from(moduleSet).sort();
  }

  unstageChange(change: StagedChange, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to remove "${change.label}" from staged changes?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Remove',
        severity: 'danger'
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      accept: () => {
        this.rolloutService.unstageChange(change.id).subscribe({
          next: (response) => {
            // Remove from selected changes if it was selected
            this.selectedChanges = this.selectedChanges.filter(c => c.id !== change.id);
            this.loadChanges();
            this.messageService.add({
              severity: 'success',
              summary: 'Removed',
              detail: `Change "${change.label}" has been removed from staged changes`
            });
          },
          error: (error) => {
            console.error('Error unstaging change:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Failed to remove change: ${error.error?.response || error.message || 'Unknown error'}`
            });
          }
        });
      },
      reject: () => {
        // User cancelled
      }
    });
  }

  openCommitDialog(): void {
    if (this.selectedChanges.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Selection',
        detail: 'Please select at least one change to commit'
      });
      return;
    }
    this.showCommitDialog = true;
  }

  commitChanges(): void {
    // Prevent multiple simultaneous commit calls
    if (this.isCommitting) {
      return;
    }

    if (this.selectedChanges.length > 0 && this.commitMessage.trim()) {
      this.isCommitting = true;
      const changeCount = this.selectedChanges.length;

      this.rolloutService.commitChanges(this.selectedChanges, this.commitMessage.trim()).subscribe({
        next: () => {
          this.isCommitting = false;
          this.showCommitDialog = false;
          this.commitMessage = '';
          this.selectedChanges = [];
          this.loadChanges();
          this.messageService.add({
            severity: 'success',
            summary: 'Committed',
            detail: `Successfully committed ${changeCount} change(s)`
          });
        },
        error: (error) => {
          this.isCommitting = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to commit changes: ${error.error?.response || error.message || 'Unknown error'}`
          });
        }
      });
    }
  }

  rollbackChange(change: StagedChange): void {
    this.rolloutService.rollbackChange(change).subscribe({
      next: () => {
        this.loadChanges();
        this.messageService.add({
          severity: 'success',
          summary: 'Rolled Back',
          detail: `Change "${change.label}" has been rolled back`
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to rollback change: ${error.message || 'Unknown error'}`
        });
      }
    });
  }


  getActionIcon(action: string): string {
    switch(action) {
      case 'create': return 'pi pi-plus';
      case 'edit': return 'pi pi-pencil';
      case 'delete': return 'pi pi-trash';
      default: return 'pi pi-circle';
    }
  }

  getActionColor(action: string): string {
    switch(action) {
      case 'create': return '#22c55e';
      case 'edit': return '#3b82f6';
      case 'delete': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getActionBadgeSeverity(action: string): BadgeSeverity {
    switch(action) {
      case 'create': return 'success';
      case 'edit': return 'info';
      case 'delete': return 'danger';
      default: return 'secondary';
    }
  }

  /**
   * Get display name for action (Add, Edit, Delete)
   */
  getActionDisplayName(action: string): string {
    switch(action) {
      case 'create': return 'Add';
      case 'edit': return 'Edit';
      case 'delete': return 'Delete';
      default: return action;
    }
  }

  /**
   * Open diff view for a change
   */
  showDiff(change: StagedChange, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedChangeForDiff = change;

    // Format data based on action type for user-friendly view
    if (change.action === 'create') {
      // CREATE: Old = empty, New = added data
      this.oldDataString = '';
      this.newDataString = this.formatUserFriendlyData(change.data);
    } else if (change.action === 'edit') {
      // EDIT: Show only modified fields
      const diff = this.getModifiedFields(change.oldData, change.data);
      this.oldDataString = this.formatUserFriendlyData(diff.old);
      this.newDataString = this.formatUserFriendlyData(diff.new);
    } else if (change.action === 'delete') {
      // DELETE: Old = deleted data, New = empty
      this.oldDataString = this.formatUserFriendlyData(change.oldData || change.data);
      this.newDataString = '';
    } else {
      this.oldDataString = '';
      this.newDataString = this.formatUserFriendlyData(change.data);
    }

    this.showDiffDialog = true;
  }

  /**
   * Get only modified fields between old and new data
   */
  private getModifiedFields(oldData: any, newData: any): { old: any, new: any } {
    if (!oldData || !newData) {
      return { old: oldData || {}, new: newData || {} };
    }

    const oldDiff: any = {};
    const newDiff: any = {};

    // Get all keys from both objects
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    allKeys.forEach(key => {
      const oldValue = oldData[key];
      const newValue = newData[key];

      // Only include if values are different
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        oldDiff[key] = oldValue;
        newDiff[key] = newValue;
      }
    });

    return { old: oldDiff, new: newDiff };
  }

  /**
   * Format data as user-friendly JSON string (removes technical fields)
   */
  private formatUserFriendlyData(data: any): string {
    if (!data) return '';

    try {
      // Remove technical/internal fields that users don't need to see
      const cleanedData = this.removeTechnicalFields(data);

      if (Object.keys(cleanedData).length === 0) {
        return '';
      }

      return JSON.stringify(cleanedData, null, 2);
    } catch (e) {
      return String(data);
    }
  }

  /**
   * Remove technical/internal fields from data
   */
  private removeTechnicalFields(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.removeTechnicalFields(item));
    }

    const cleaned: any = {};
    const technicalFields = [
      '_id', 'id', '__v', 'createdAt', 'updatedAt', 'createdOn', 'updatedOn',
      'modifiedOn', 'createdBy', 'updatedBy', 'modifiedBy', 'version',
      'isDeleted', 'deletedAt', 'deletedBy', 'queryId', 'correlationId'
    ];

    for (const key in data) {
      // Skip technical fields
      if (technicalFields.includes(key)) {
        continue;
      }

      // Recursively clean nested objects
      if (data[key] && typeof data[key] === 'object') {
        const cleanedValue = this.removeTechnicalFields(data[key]);
        if (Object.keys(cleanedValue).length > 0 || Array.isArray(cleanedValue)) {
          cleaned[key] = cleanedValue;
        }
      } else {
        cleaned[key] = data[key];
      }
    }

    return cleaned;
  }

  /**
   * Handle row click to show diff
   */
  onRowClick(change: StagedChange): void {
    this.showDiff(change);
  }

  /**
   * Group changes by rollout label and then by module
   */
  groupChangesByLabel(): void {
    this.groupedChangesByLabel = {};
    this.groupedChangesByLabelAndModule = {};

    this.stagedChanges.forEach(change => {
      const label = change.rolloutLabel || 'Unlabeled';
      const module = change.module || 'Unknown';

      // Group by label
      if (!this.groupedChangesByLabel[label]) {
        this.groupedChangesByLabel[label] = [];
      }
      this.groupedChangesByLabel[label].push(change);

      // Group by label and module
      if (!this.groupedChangesByLabelAndModule[label]) {
        this.groupedChangesByLabelAndModule[label] = {};
      }
      if (!this.groupedChangesByLabelAndModule[label][module]) {
        this.groupedChangesByLabelAndModule[label][module] = [];
      }
      this.groupedChangesByLabelAndModule[label][module].push(change);
    });

    // Initialize module accordion indices for each label
    this.labels.forEach(label => {
      if (!this.activeModuleAccordionIndices[label]) {
        this.activeModuleAccordionIndices[label] = [];
      }
    });
  }

  /**
   * Get all labels (including those without changes)
   */
  getAllDisplayLabels(): string[] {
    // Combine labels from both sources and deduplicate
    const allLabels = new Set<string>([
      ...this.labels,
      ...Object.keys(this.groupedChangesByLabel)
    ]);
    return Array.from(allLabels).sort();
  }

  /**
   * Get labels that have staged changes
   */
  getLabelsWithChanges(): string[] {
    return Object.keys(this.groupedChangesByLabel).sort();
  }

  /**
   * Check if a label has any changes
   */
  labelHasChanges(label: string): boolean {
    return (this.groupedChangesByLabel[label]?.length || 0) > 0;
  }

  /**
   * Get modules for a specific label
   */
  getModulesForLabel(label: string): string[] {
    if (!this.groupedChangesByLabelAndModule[label]) {
      return [];
    }
    return Object.keys(this.groupedChangesByLabelAndModule[label]).sort();
  }

  /**
   * Get changes for a specific label and module
   */
  getChangesForLabelAndModule(label: string, module: string): StagedChange[] {
    return this.groupedChangesByLabelAndModule[label]?.[module] || [];
  }

  /**
   * Get changes count for a label
   */
  getChangesCountForLabel(label: string): number {
    return this.groupedChangesByLabel[label]?.length || 0;
  }

  /**
   * Get changes count for a specific module within a label
   */
  getChangesCountForModule(label: string, module: string): number {
    return this.groupedChangesByLabelAndModule[label]?.[module]?.length || 0;
  }

  /**
   * Expand all label accordions
   */
  expandAll(): void {
    const labels = this.getAllDisplayLabels();
    this.activeAccordionIndices = labels.map((_, index) => index);
  }

  /**
   * Collapse all label accordions
   */
  collapseAll(): void {
    this.activeAccordionIndices = [];
  }

  /**
   * Expand all module accordions for a label
   */
  expandAllModules(label: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const modules = this.getModulesForLabel(label);
    this.activeModuleAccordionIndices[label] = modules.map((_, index) => index);
  }

  /**
   * Collapse all module accordions for a label
   */
  collapseAllModules(label: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.activeModuleAccordionIndices[label] = [];
  }

  /**
   * Export changes for a specific label to Excel, grouped by module
   * Action column is editable with dropdown: ignore, create, edit, delete (default: ignore)
   */
  async exportLabelToExcel(label: string, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }

    const changes = this.groupedChangesByLabel[label];
    if (!changes || changes.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'No changes available to export for this label'
      });
      return;
    }

    try {
      // Group changes by module
      const changesByModule: { [module: string]: StagedChange[] } = {};
      changes.forEach(change => {
        const module = change.module || 'Unknown';
        if (!changesByModule[module]) {
          changesByModule[module] = [];
        }
        changesByModule[module].push(change);
      });

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const modules = Object.keys(changesByModule);

      // Create a worksheet for each module
      modules.forEach(module => {
        const worksheet = workbook.addWorksheet(this.sanitizeSheetName(module));
        const moduleChanges = changesByModule[module];

        // Define columns - Action column at the end (editable dropdown)
        const columns = [
          { header: 'ID', key: 'id', width: 30 },
          { header: 'Module', key: 'module', width: 25 },
          { header: 'Label', key: 'label', width: 30 },
          { header: 'Timestamp', key: 'timestamp', width: 20 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Data (JSON)', key: 'data', width: 50 },
          { header: 'Old Data (JSON)', key: 'oldData', width: 50 },
          { header: 'Action', key: 'action', width: 15 }
        ];

        worksheet.columns = columns;

        // Add data rows with default action as 'ignore'
        moduleChanges.forEach(change => {
          worksheet.addRow({
            id: change.id,
            module: change.module,
            label: change.label,
            timestamp: change.timestamp ? new Date(change.timestamp).toLocaleString() : '',
            status: change.status,
            data: JSON.stringify(change.data || {}, null, 2),
            oldData: change.oldData ? JSON.stringify(change.oldData, null, 2) : '',
            action: 'ignore' // Default value is 'ignore' - user must explicitly choose action
          });
        });

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2E7D32' }
          };
          cell.font = {
            color: { argb: 'FFFFFFFF' },
            bold: true
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        headerRow.height = 25;

        // Style data rows and add dropdown validation to Action column
        const dataRowCount = moduleChanges.length;
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            row.eachCell((cell, colNumber) => {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
              // Wrap text for JSON columns (columns 6 and 7: Data and Old Data)
              if (colNumber === 6 || colNumber === 7) {
                cell.alignment = { wrapText: true, vertical: 'top' };
              }
              // Style Action column (column 8) - highlight it as editable
              if (colNumber === 8) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFF9C4' } // Light yellow background to indicate editable
                };
                cell.font = {
                  bold: true,
                  color: { argb: 'FF333333' }
                };
                cell.alignment = {
                  vertical: 'middle',
                  horizontal: 'center'
                };
              }
            });
          }
        });

        // Add data validation dropdown for Action column (column H, starting from row 2)
        if (dataRowCount > 0) {
          for (let rowNum = 2; rowNum <= dataRowCount + 1; rowNum++) {
            const cell = worksheet.getCell(`H${rowNum}`);
            cell.dataValidation = {
              type: 'list',
              allowBlank: false,
              formulae: ['"ignore,create,edit,delete"'],
              showErrorMessage: true,
              errorStyle: 'error',
              errorTitle: 'Invalid Action',
              error: 'Please select a valid action: ignore, create, edit, or delete'
            };
          }
        }

        // Freeze header row
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
      });

      // Generate Excel file and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const fileName = `rollout_${this.sanitizeFileName(label)}_${new Date().getTime()}.xlsx`;
      FileSaver.saveAs(blob, fileName);

      this.messageService.add({
        severity: 'success',
        summary: 'Export Successful',
        detail: `Excel file exported successfully with ${modules.length} module(s). Action column defaults to "ignore" - change it to create/edit/delete as needed.`
      });
    } catch (error) {
      console.error('Export error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Export Failed',
        detail: 'Failed to export Excel file'
      });
    }
  }

  /**
   * Sanitize sheet name (Excel has restrictions on sheet names)
   */
  private sanitizeSheetName(name: string): string {
    // Excel sheet name restrictions: max 31 chars, no: \ / ? * [ ]
    let sanitized = name
      .replace(/[\\\/\?\*\[\]]/g, '_')
      .substring(0, 31);
    return sanitized || 'Sheet1';
  }

  /**
   * Sanitize file name
   */
  private sanitizeFileName(name: string): string {
    return name.replace(/[\\\/\?\*\[\]:]/g, '_');
  }

  /**
   * Handle label selection change
   */
  onLabelChange(): void {
    this.labelService.setSelectedLabel(this.selectedLabel);
    this.loadChanges();
  }

  /**
   * Open add label dialog
   */
  openAddLabelDialog(): void {
    this.newLabelName = '';
    this.showAddLabelDialog = true;
  }

  /**
   * Create a new label
   */
  createLabel(): void {
    if (!this.newLabelName || this.newLabelName.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Label name is required'
      });
      return;
    }

    this.isCreatingLabel = true;
    this.labelService.createLabel(this.newLabelName.trim()).subscribe({
      next: () => {
        this.isCreatingLabel = false;
        this.showAddLabelDialog = false;
        this.loadLabels();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Label created successfully'
        });
      },
      error: (error) => {
        this.isCreatingLabel = false;
        const errorMsg = error?.error?.response || error?.message || 'Failed to create label';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMsg
        });
      }
    });
  }

  // ==================== Import Excel Functionality ====================

  /**
   * Trigger file input click for import
   */
  triggerImportFileInput(): void {
    this.fileInput?.nativeElement?.click();
  }

  /**
   * Handle file selection for import
   */
  async onImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File',
        detail: 'Please select a valid Excel file (.xlsx or .xls)'
      });
      input.value = ''; // Reset file input
      return;
    }

    this.isParsingFile = true;
    this.importActions = [];
    this.importCreateActions = [];
    this.importEditActions = [];
    this.importDeleteActions = [];
    this.importValidActions = [];
    this.importInvalidActions = [];
    this.importIgnoredCount = 0;

    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      let totalRowsWithIgnore = 0;

      // Parse each worksheet (each represents a module)
      workbook.eachSheet((worksheet, sheetId) => {
        const moduleName = worksheet.name;
        const rows: any[][] = [];
        let rowCount = 0;

        worksheet.eachRow((row, rowNumber) => {
          const rowData: any[] = [];
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            rowData[colNumber - 1] = cell.value;
          });
          rows.push(rowData);
          
          // Count rows with 'ignore' action (excluding header)
          if (rowNumber > 1) {
            const actionValue = rowData[7]?.toString()?.toLowerCase()?.trim();
            if (actionValue === 'ignore' || !actionValue) {
              this.importIgnoredCount++;
            }
          }
        });

        // Parse actions from this worksheet (this skips 'ignore' rows)
        const actions = this.importService.parseExcelData(rows, moduleName);
        this.importActions.push(...actions);
      });

      // Categorize actions by type
      this.importCreateActions = this.importActions.filter(a => a.action === 'create');
      this.importEditActions = this.importActions.filter(a => a.action === 'edit');
      this.importDeleteActions = this.importActions.filter(a => a.action === 'delete');

      // Separate valid and invalid actions
      const validationResult = this.importService.getValidationSummary(this.importActions);
      this.importValidActions = validationResult.valid;
      this.importInvalidActions = validationResult.invalid;

      this.isParsingFile = false;

      if (this.importActions.length === 0) {
        let message = 'No valid actions found in the Excel file.';
        if (this.importIgnoredCount > 0) {
          message += ` ${this.importIgnoredCount} row(s) with "ignore" action were skipped.`;
        }
        message += ' Make sure the Action column has valid values (create, edit, delete).';
        
        this.messageService.add({
          severity: 'warn',
          summary: 'No Actions Found',
          detail: message
        });
      } else {
        // Show preview dialog
        this.showImportPreviewDialog = true;
      }
    } catch (error) {
      this.isParsingFile = false;
      console.error('Error parsing Excel file:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Parse Error',
        detail: 'Failed to parse the Excel file. Please ensure it is a valid rollout export file.'
      });
    }

    // Reset file input for next selection
    input.value = '';
  }

  /**
   * Cancel import and close preview dialog - clears all import data
   */
  cancelImport(): void {
    this.showImportPreviewDialog = false;
    this.showImportResultDialog = false;
    this.clearAllImportData();
  }

  /**
   * Handle preview dialog hide event - only clear if explicitly cancelled
   */
  onPreviewDialogHide(): void {
    // Don't clear data on hide - only clear when explicitly cancelled
    // This allows going back from results to preview without losing data
  }

  /**
   * Execute all import actions asynchronously
   */
  executeImport(): void {
    if (this.importValidActions.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Valid Actions',
        detail: 'No valid actions to execute. Please fix validation errors first.'
      });
      return;
    }

    const validCreate = this.importValidActions.filter(a => a.action === 'create').length;
    const validEdit = this.importValidActions.filter(a => a.action === 'edit').length;
    const validDelete = this.importValidActions.filter(a => a.action === 'delete').length;

    let message = `Are you sure you want to execute ${this.importValidActions.length} action(s)?\n\n`;
    message += `• Create: ${validCreate}\n`;
    message += `• Edit: ${validEdit}\n`;
    message += `• Delete: ${validDelete}\n`;
    
    if (this.importInvalidActions.length > 0) {
      message += `\n⚠️ ${this.importInvalidActions.length} action(s) with validation errors will be skipped.`;
    }
    if (this.importIgnoredCount > 0) {
      message += `\nℹ️ ${this.importIgnoredCount} row(s) with "ignore" action were already skipped.`;
    }
    
    message += '\n\nThis operation cannot be undone.';

    this.confirmationService.confirm({
      message: message,
      header: 'Confirm Import Execution',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Execute',
        severity: 'success'
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      accept: () => {
        this.performImport();
      }
    });
  }

  /**
   * Perform the actual import (async execution) - only valid actions are executed
   */
  private performImport(): void {
    this.isImporting = true;
    this.showImportPreviewDialog = false;

    // Build import context with selected app and org
    const importContext = {
      appId: this.selectedApp,
      orgId: this.selectedOrg
    };

    // Only execute valid actions with context
    this.importService.executeImportActions(this.importValidActions, importContext).subscribe({
      next: (summary: ImportSummary) => {
        this.isImporting = false;
        
        // Add info about skipped actions to the summary
        const extendedSummary = {
          ...summary,
          skippedValidation: this.importInvalidActions.length,
          skippedIgnore: this.importIgnoredCount
        };
        
        this.importSummary = summary;
        this.showImportResultDialog = true;

        // Show summary toast
        let summaryDetail = '';
        if (summary.failed === 0) {
          summaryDetail = `All ${summary.successful} action(s) completed successfully`;
          this.messageService.add({
            severity: 'success',
            summary: 'Import Successful',
            detail: summaryDetail,
            life: 5000
          });
        } else if (summary.successful === 0) {
          summaryDetail = `All ${summary.failed} action(s) failed`;
          this.messageService.add({
            severity: 'error',
            summary: 'Import Failed',
            detail: summaryDetail,
            life: 5000
          });
        } else {
          summaryDetail = `${summary.successful} succeeded, ${summary.failed} failed`;
          this.messageService.add({
            severity: 'warn',
            summary: 'Import Partially Successful',
            detail: summaryDetail,
            life: 5000
          });
        }

        // Reload changes to reflect any updates
        this.loadChanges();
      },
      error: (error) => {
        this.isImporting = false;
        console.error('Import execution error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Import Error',
          detail: 'An unexpected error occurred during import'
        });
      }
    });
  }

  /**
   * Handle result dialog hide event - don't clear data automatically
   * This allows the Back button to work correctly
   */
  onResultDialogHide(): void {
    // Don't clear data on hide - preserves data for back navigation
  }

  /**
   * Close import result dialog and clear all data (called by Close button)
   */
  closeImportResultDialog(): void {
    this.showImportResultDialog = false;
    this.showImportPreviewDialog = false;
    this.clearAllImportData();
  }

  /**
   * Clear all import-related data (used when fully closing import workflow)
   */
  private clearAllImportData(): void {
    this.importSummary = null;
    this.importActions = [];
    this.importCreateActions = [];
    this.importEditActions = [];
    this.importDeleteActions = [];
    this.importValidActions = [];
    this.importInvalidActions = [];
    this.importIgnoredCount = 0;
  }

  /**
   * Get severity badge for import result
   */
  getImportResultSeverity(success: boolean): BadgeSeverity {
    return success ? 'success' : 'danger';
  }

  /**
   * Get truncated label for display
   */
  getTruncatedLabel(label: string, maxLength: number = 30): string {
    if (!label) return 'N/A';
    return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
  }

  /**
   * Format JSON for preview display
   */
  formatJsonPreview(data: any): string {
    if (!data) return '{}';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  // ==================== Edit Import Action Data ====================

  /**
   * Selected action for editing
   */
  selectedActionForEdit: ImportAction | null = null;
  showEditActionDialog: boolean = false;
  editActionDataString: string = '';

  /**
   * Open dialog to edit import action data
   */
  openEditActionDialog(action: ImportAction): void {
    this.selectedActionForEdit = action;
    this.editActionDataString = JSON.stringify(action.data, null, 2);
    this.showEditActionDialog = true;
  }

  /**
   * Save edited action data
   */
  saveEditedActionData(): void {
    if (!this.selectedActionForEdit) return;

    try {
      const parsedData = JSON.parse(this.editActionDataString);
      this.selectedActionForEdit.data = parsedData;
      
      // Re-validate the action
      const validationError = this.validateEditedAction(this.selectedActionForEdit);
      this.selectedActionForEdit.validationError = validationError;

      // Update categorized lists
      this.recategorizeImportActions();

      this.showEditActionDialog = false;
      this.selectedActionForEdit = null;
      this.editActionDataString = '';

      this.messageService.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Action data updated successfully'
      });
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid JSON',
        detail: 'The JSON data is invalid. Please fix the syntax errors.'
      });
    }
  }

  /**
   * Cancel editing action data
   */
  cancelEditActionDialog(): void {
    this.showEditActionDialog = false;
    this.selectedActionForEdit = null;
    this.editActionDataString = '';
  }

  /**
   * Validate edited action
   */
  private validateEditedAction(action: ImportAction): string | undefined {
    const id = action.data?._id || action.data?.id || action.oldData?._id || action.oldData?.id;

    switch (action.action) {
      case 'create':
        if (!action.data || Object.keys(action.data).length === 0) {
          return 'Create action requires data';
        }
        const meaningfulKeys = Object.keys(action.data).filter(k => !['_id', 'id', '__v', 'createdAt', 'updatedAt'].includes(k));
        if (meaningfulKeys.length === 0) {
          return 'Create action requires meaningful data (not just ID fields)';
        }
        return undefined;

      case 'edit':
        if (!id) {
          return 'Edit action requires an ID (_id or id field in data or oldData)';
        }
        if (!action.data || Object.keys(action.data).length === 0) {
          return 'Edit action requires data to update';
        }
        return undefined;

      case 'delete':
        if (!id) {
          return 'Delete action requires an ID (_id or id field in data or oldData)';
        }
        return undefined;

      default:
        return `Unknown action: ${action.action}`;
    }
  }

  /**
   * Re-categorize import actions after edit
   */
  private recategorizeImportActions(): void {
    this.importCreateActions = this.importActions.filter(a => a.action === 'create');
    this.importEditActions = this.importActions.filter(a => a.action === 'edit');
    this.importDeleteActions = this.importActions.filter(a => a.action === 'delete');
    
    const validationResult = this.importService.getValidationSummary(this.importActions);
    this.importValidActions = validationResult.valid;
    this.importInvalidActions = validationResult.invalid;
  }

  // ==================== Export Import Results to Excel ====================

  /**
   * Export import results to Excel - grouped by module with re-import capability
   */
  async exportImportResultsToExcel(): Promise<void> {
    if (!this.importSummary || this.importSummary.results.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Results',
        detail: 'No import results to export'
      });
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();

      // Group results by module
      const resultsByModule: { [module: string]: ImportResult[] } = {};
      this.importSummary.results.forEach(result => {
        const module = result.action.module || 'Unknown';
        if (!resultsByModule[module]) {
          resultsByModule[module] = [];
        }
        resultsByModule[module].push(result);
      });

      const modules = Object.keys(resultsByModule);

      // Create a worksheet for each module
      modules.forEach(module => {
        const worksheet = workbook.addWorksheet(this.sanitizeSheetName(module));
        const moduleResults = resultsByModule[module];

        // Define columns - compatible with import format for re-import
        // Columns: ID, Module, Label, Timestamp, Status, Data (JSON), Old Data (JSON), Action (dropdown)
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 30 },
          { header: 'Module', key: 'module', width: 25 },
          { header: 'Label', key: 'label', width: 30 },
          { header: 'Original Action', key: 'originalAction', width: 15 },
          { header: 'Import Status', key: 'status', width: 15 },
          { header: 'Response', key: 'response', width: 40 },
          { header: 'Data (JSON)', key: 'data', width: 50 },
          { header: 'Old Data (JSON)', key: 'oldData', width: 50 },
          { header: 'Action', key: 'action', width: 15 }
        ];

        // Add data rows
        moduleResults.forEach(result => {
          worksheet.addRow({
            id: result.action.id || result.action.data?._id || result.action.data?.id || '',
            module: result.action.module,
            label: result.action.label,
            originalAction: this.getActionDisplayName(result.action.action),
            status: result.success ? 'Success' : 'Failed',
            response: result.success ? result.message : `${result.message}${result.error ? ' - ' + result.error : ''}`,
            data: JSON.stringify(result.action.data || {}, null, 2),
            oldData: result.action.oldData ? JSON.stringify(result.action.oldData, null, 2) : '',
            action: 'ignore' // Default action for re-import
          });
        });

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1976D2' }
          };
          cell.font = {
            color: { argb: 'FFFFFFFF' },
            bold: true
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        headerRow.height = 25;

        // Style data rows
        const dataRowCount = moduleResults.length;
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const statusCell = row.getCell(5); // Import Status column
            const isSuccess = statusCell.value === 'Success';

            row.eachCell((cell, colNumber) => {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };

              // Color row based on success/failure
              if (isSuccess) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFE8F5E9' } // Light green
                };
              } else {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFEBEE' } // Light red
                };
              }

              // Bold status cell
              if (colNumber === 5) {
                cell.font = {
                  bold: true,
                  color: { argb: isSuccess ? 'FF2E7D32' : 'FFC62828' }
                };
              }

              // Wrap text for JSON and response columns
              if (colNumber === 6 || colNumber === 7 || colNumber === 8) {
                cell.alignment = { wrapText: true, vertical: 'top' };
              }

              // Style Action column (column 9) - highlight as editable
              if (colNumber === 9) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFF9C4' } // Light yellow
                };
                cell.font = {
                  bold: true,
                  color: { argb: 'FF333333' }
                };
                cell.alignment = {
                  vertical: 'middle',
                  horizontal: 'center'
                };
              }
            });
          }
        });

        // Add data validation dropdown for Action column (column I)
        if (dataRowCount > 0) {
          for (let rowNum = 2; rowNum <= dataRowCount + 1; rowNum++) {
            const cell = worksheet.getCell(`I${rowNum}`);
            cell.dataValidation = {
              type: 'list',
              allowBlank: false,
              formulae: ['"ignore,create,edit,delete"'],
              showErrorMessage: true,
              errorStyle: 'error',
              errorTitle: 'Invalid Action',
              error: 'Please select: ignore, create, edit, or delete'
            };
          }
        }

        // Freeze header row
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const fileName = `import_results_${new Date().getTime()}.xlsx`;
      FileSaver.saveAs(blob, fileName);

      this.messageService.add({
        severity: 'success',
        summary: 'Export Successful',
        detail: `Import results exported with ${modules.length} module tab(s). Change Action column and re-import to retry failed actions.`
      });
    } catch (error) {
      console.error('Export error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Export Failed',
        detail: 'Failed to export import results'
      });
    }
  }

  /**
   * Go back to import preview from result dialog
   * Preserves all data including summary for later export
   */
  goBackToImportPreview(): void {
    this.showImportResultDialog = false;
    this.showImportPreviewDialog = true;
    // Keep importSummary so user can still export results if needed
    // Keep all action arrays so preview shows the data
  }
}
