import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay, catchError, of, timeout, Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MongodbServiceService } from './services/mongodb-service.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as ExcelJS from 'exceljs';
import * as monaco from 'monaco-editor';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { Orgs } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { ExportService } from 'src/app/core/services/export.service';

interface MongoApiResponse {
  items?: any[];
  total?: number;
  skip?: number;
  limit?: number;
  hasMore?: boolean;
  currentCount?: number;
  nextSkip?: number;
}

@Component({
  selector: 'app-mongodb-home',
  standalone: false,
  templateUrl: './mongodb-home.component.html',
  styleUrls: ['./mongodb-home.component.css'],
})
export class MongoDBHomeComponent implements OnInit, OnDestroy {

  private editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
  private lockedDecorations: string[] = [];
  private previousContent: string = '';
  private isRestoringContent: boolean = false;
  orgs!: Orgs[];

  showOrgDropdown = false;
  showAppDropdown = false;
  showAttachmentSection = false;
  lookupData: any = {};

  orgList = [
    { label: 'Organization A', value: 'orgA' },
    { label: 'Organization B', value: 'orgB' },
    { label: 'Organization C', value: 'orgC' }
  ];
  appList: string[] = [];

  selectedOrg: string | null = null;
  selectedApp: string | null = null;
  selectedFile: File | null = null;

  /** View Mode */
  viewMode: 'json' | 'table' = 'json';
  tableColumns: string[] = [];

  /** Sidebar & responsiveness */
  mobileSidebarVisible = false;
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;
  queryToolbarVisible = true;

  /** Mongo collection info */
  selectedCollection: string = '';
  mongoDocuments: any[] = [];

  /** UI states */
  isLoading = false;
  isLoadingMore = false;
  errorMessage = '';

  /** Pagination & Virtual Scroll */
  totalDocuments = 0;
  currentSkip = 0;
  pageSize = 10;
  initialLoadSize = 25;
  hasMoreData = true;

  /** PrimeNG Table Pagination */
  tableRows = 10;
  tableFirst = 0;
  rowsPerPageOptions = [5, 10, 25, 100];

  /** API base URL */
  private readonly baseUrl = environment.apiUrl;

  /** Unsubscribe subject */
  private destroy$ = new Subject<void>();
  private currentRequest$ = new Subject<void>();

  /** Edit Dialog */
  editDialogVisible = false;
  editJson = '';
  editingDoc: any = null;
  editedDocRef: any = null;

  /** Add/Create Dialog */
  createDialogVisible = false;
  createJson = '';
  isCreateMode = false;
  lastFetchedSchema: any = null;

  /** Export Menu */
  exportMenuOpen = false;

  /** Filtering data in options */
  activeSection: string | null = null;
  filterJson = '';
  projectionJson = '';
  sortJson = '';
  skip = 0;
  limit = 25;

  /** Clone Dialog */
  cloneDialogVisible = false;
  cloneJson = '';
  cloningDoc: any = null;

  /** Monaco Editor Configuration */
  editorOptions = {
    theme: 'vs-dark',
    language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.3,
    padding: { top: 15, bottom: 15 },
    scrollBeyondLastLine: false,
    formatOnPaste: true,
    formatOnType: true,
    wordWrap: 'on',
    smoothScrolling: true,
  };

  jsonEditorOptions = {
    theme: 'vs-dark',
    language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.3,
    padding: { top: 15, bottom: 15 },
    scrollBeyondLastLine: false,
    formatOnPaste: true,
    formatOnType: true,
    wordWrap: 'on',
    smoothScrolling: true,
  };

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dataservice: MongodbServiceService,
    private mongoService: MongodbServiceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private pageAdminService: PageAdministratorService,
    private responsive: ResponsiveService,
    private exportService: ExportService
  ) {
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  /**
   * Trigger file input for import from class top level for better visibility
   */
  triggerImport(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleImport(file);
      }
    };

    input.click();
  }

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();

    // Auto-hide query toolbar on mobile
    this.isMobile$.subscribe(isMobile => {
      if (isMobile) {
        this.queryToolbarVisible = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.currentRequest$.complete();
  }

  // ==================== VIEW MODE SWITCHER ====================

  switchView(mode: 'json' | 'table') {
    this.viewMode = mode;

    if (mode === 'table' && this.mongoDocuments.length > 0) {
      this.extractTableColumns();
    }
  }

  extractTableColumns() {
    if (this.mongoDocuments.length === 0) return;
    this.tableColumns = Object.keys(this.mongoDocuments[0]).filter(
      k => !['isDeleted', 'isEdit', 'edited_value', 'templateId', 'appId', 'configId', 'dataBaseId', 'orgId', 'dataId', 'dataSourceId', 'instanceId', 'piId'].includes(k)
    );
  }


  getNestedValue(obj: any, key: string): any {
    if (obj === null || obj === undefined) return '';

    const value = obj[key];

    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);

    return value;
  }

  // ==================== TABLE PAGINATION ====================

  onTablePageChange(event: any) {
    this.tableFirst = event.first;
    this.tableRows = event.rows;
  }

  // ==================== REFRESH TOTAL COUNT ====================

  refreshTotalCount() {
    if (!this.selectedCollection) return;

    const url = `${this.baseUrl}mongoAdmin/${this.selectedCollection}/count`;
    const body = {
      filter: this.filterJson ? JSON.parse(this.filterJson) : {}
    };

    this.http.post<any>(url, body).subscribe({
      next: (res) => {
        if (res && res.count !== undefined) {
          this.totalDocuments = res.count;
        }
      },
      error: (err) => {
        console.error('Error fetching total count:', err);
      }
    });
  }

  // ==================== MONACO EDITOR & FIELD LOCKING ====================

  onMonacoInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editorInstance = editor;
    setTimeout(() => {
      this.setupFieldLocking(editor);
    }, 200);
  }

  private setupFieldLocking(editor: monaco.editor.IStandaloneCodeEditor) {
    if (!this.lastFetchedSchema?.requiredFields?.length) {
      console.log('No required fields to lock');
      return;
    }

    const requiredFields: string[] = this.lastFetchedSchema.requiredFields;
    const model = editor.getModel();
    if (!model) return;

    console.log('Setting up field locking for:', requiredFields);

    this.previousContent = model.getValue();
    this.updateDecorations(editor, requiredFields);

    model.onDidChangeContent((e) => {
      if (this.isRestoringContent) return;

      const currentContent = model.getValue();

      if (this.isRequiredFieldModified(currentContent, requiredFields)) {
        this.isRestoringContent = true;
        model.setValue(this.previousContent);

        this.messageService.add({
          severity: 'warn',
          summary: 'Field Locked',
          detail: 'Required field names cannot be modified or deleted.',
          life: 3000
        });

        setTimeout(() => {
          this.updateDecorations(editor, requiredFields);
          this.isRestoringContent = false;
        }, 10);

        return;
      }

      this.previousContent = currentContent;
      this.updateDecorations(editor, requiredFields);
    });
  }

  private isRequiredFieldModified(content: string, requiredFields: string[]): boolean {
    for (const field of requiredFields) {
      const fieldPattern = `"${field}"\\s*:`;
      const regex = new RegExp(fieldPattern);

      if (!regex.test(content)) {
        console.log(`Required field "${field}" is missing or modified`);
        return true;
      }
    }
    return false;
  }

  private updateDecorations(
    editor: monaco.editor.IStandaloneCodeEditor,
    requiredFields: string[]
  ) {
    const model = editor.getModel();
    if (!model) return;

    const content = model.getValue();
    const decorations: any[] = [];

    requiredFields.forEach((field: string) => {
      const fieldPattern = `"${field}"\\s*:`;
      const regex = new RegExp(fieldPattern, 'g');
      let match;

      while ((match = regex.exec(content)) !== null) {
        const startPos = model.getPositionAt(match.index);
        const endPos = model.getPositionAt(match.index + match[0].length);

        decorations.push({
          range: new monaco.Range(
            startPos.lineNumber,
            startPos.column,
            endPos.lineNumber,
            endPos.column
          ),
          options: {
            inlineClassName: 'locked-field',
            glyphMarginClassName: 'locked-glyph',
            hoverMessage: {
              value: `🔒 "${field}" is a required field and cannot be modified`
            },
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          }
        });
      }
    });

    this.lockedDecorations = editor.deltaDecorations(this.lockedDecorations, decorations);
  }

  onDialogClose() {
    this.editorInstance = null;
    this.lockedDecorations = [];
    this.previousContent = '';
    this.isRestoringContent = false;
    this.createJson = '';
  }

  // ==================== EXPORT FUNCTIONALITY ====================

  toggleExportMenu() {
    this.exportMenuOpen = !this.exportMenuOpen;
  }

  async exportData(format: string) {
    const fileName = `mongo_data_${new Date().getTime()}`;
    const data = this.mongoDocuments;

    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    if (format === 'excel') {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('data');

      // Extract column headers from first document
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        worksheet.addRow(headers);

        // Add data rows
        data.forEach((doc: any) => {
          const row = headers.map(header => {
            const value = doc[header];
            // Convert objects/arrays to JSON strings for Excel
            return typeof value === 'object' && value !== null
              ? JSON.stringify(value)
              : value;
          });
          worksheet.addRow(row);
        });
      }

      // Generate Excel file and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${fileName}.xlsx`;
      link.click();
    }
    else if (format === 'csv') {
      // Create workbook and worksheet for CSV export
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('data');

      // Extract column headers from first document
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        worksheet.addRow(headers);

        // Add data rows
        data.forEach((doc: any) => {
          const row = headers.map(header => {
            const value = doc[header];
            // Convert objects/arrays to JSON strings for CSV
            return typeof value === 'object' && value !== null
              ? JSON.stringify(value)
              : value;
          });
          worksheet.addRow(row);
        });
      }

      // Generate CSV file and trigger download
      const buffer = await workbook.csv.writeBuffer();
      const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${fileName}.csv`;
      link.click();
    }
    else if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${fileName}.json`;
      link.click();
    }

    this.exportMenuOpen = false;
  }

  // ==================== IMPORT FUNCTIONALITY ====================


  /**
   * Handle Excel file import for MongoDB
   * Note: Import requires collection-specific validation
   */
  async handleImport(file: File): Promise<void> {
    try {
      if (!this.selectedCollection) {
        this.messageService.add({
          severity: 'warn',
          summary: 'No Collection Selected',
          detail: 'Please select a collection before importing'
        });
        return;
      }

      const importResults = await this.exportService.importExcel(file);

      if (importResults.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'No Data',
          detail: 'The imported file contains no data'
        });
        return;
      }

      // For MongoDB, we'll process the import directly
      // Filter out delete actions and process add/edit
      let successCount = 0;
      let errorCount = 0;

      for (const item of importResults) {
        if (item.action === 'Delete') {
          // Handle deletes
          if (item.rowData._id) {
            try {
              await this.dataservice.hardDeleteDocument(this.selectedCollection, item.rowData._id).toPromise();
              successCount++;
            } catch (error) {
              errorCount++;
              console.error('Delete error:', error);
            }
          }
        } else if (item.action === 'Add New') {
          // Handle new documents
          try {
            await this.dataservice.createDocument(this.selectedCollection, item.rowData, { isClone: false }).toPromise();
            successCount++;
          } catch (error) {
            errorCount++;
            console.error('Create error:', error);
          }
        } else if (item.action === 'Edit') {
          // Handle updates
          if (item.rowData._id) {
            try {
              await this.dataservice.updateDocument(this.selectedCollection, item.rowData._id, item.rowData).toPromise();
              successCount++;
            } catch (error) {
              errorCount++;
              console.error('Update error:', error);
            }
          }
        }
      }

      this.messageService.add({
        severity: successCount > 0 ? 'success' : 'error',
        summary: 'Import Complete',
        detail: `Successfully processed ${successCount} records${errorCount > 0 ? `, ${errorCount} failed` : ''}`
      });

      // Refresh the documents
      this.searchDocuments();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Import Error',
        detail: 'Failed to import Excel file. Please check the file format.'
      });
      console.error('Import error:', error);
    }
  }

  // ==================== CREATE NEW DOCUMENT ====================

  onAddNew() {
    if (!this.selectedCollection) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Collection Selected',
        detail: 'Please select a collection first!',
      });
      return;
    }

    this.getOrgsWithoutApp();
    console.log('Preparing to add new document to collection:', this.orgList);

    this.editorInstance = null;
    this.lockedDecorations = [];
    this.previousContent = '';
    this.isRestoringContent = false;

    this.getRequiredFields(this.selectedCollection);
  }

  getRequiredFields(collectionName: string) {
    this.dataservice.getSchema(collectionName).subscribe({
      next: (res) => {
        const schema = res.schema;
        this.lastFetchedSchema = schema;
        this.lookupData = res.lookupData || {};

        console.log('Fetched schema for collection:', collectionName, schema);

        this.showOrgDropdown = schema.isOrg === true;
        this.showAppDropdown = schema.isApp === true;
        this.showAttachmentSection = schema.media === true;

        this.selectedApp = '';
        this.selectedOrg = null;
        this.selectedFile = null;

        if (this.lookupData.appName && Array.isArray(this.lookupData.appName)) {
          this.appList = [...this.lookupData.appName];
        } else {
          this.appList = [];
        }

        const validateFields = schema.validate || {};
        const requiredFields = (schema.requiredFields || []).filter(
          (field: string) => field !== '_id' && field !== 'queryId' && field !== 'organization' && field !== 'appName' && field !== 'dataId' && field !== 'createdOn'
        );
        const defaultValues = schema.defaultValues || {};

        const template: any = {};

        Object.keys(validateFields).forEach((field: string) => {
          if (field !== '_id' && field !== 'queryId' && field !== 'organization' && field !== 'appName' && field !== 'entityOrInstanceId' && field !== 'createdOn') {
            template[field] = defaultValues[field] ?? "";
          }
        });

        this.createJson = JSON.stringify(template, null, 2);
        this.createDialogVisible = true;
        this.isCreateMode = true;
      },
      error: (err) => {
        console.error("❌ Error fetching required fields:", err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load required fields from backend.',
        });
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);
    }
  }

  confirmCreate() {
    try {
      const newDoc = JSON.parse(this.createJson);

      const requiredFields = this.lastFetchedSchema?.requiredFields || [];

      const missingFields = requiredFields.filter(
        (field: string) => !(field in newDoc)
      );
      if (missingFields.length > 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Missing Fields',
          detail: `These required fields are missing: ${missingFields.join(', ')}`,
        });
        return;
      }

      const emptyFields = requiredFields.filter(
        (field: string | number) =>
          newDoc[field] === '' ||
          newDoc[field] === null ||
          newDoc[field] === undefined
      );
      if (emptyFields.length > 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Empty Fields',
          detail: `Please fill values for: ${emptyFields.join(', ')}`,
        });
        return;
      }

      if (this.showOrgDropdown && this.selectedOrg) {
        newDoc.organization = this.selectedOrg;
      }

      if (this.showAppDropdown && this.selectedApp) {
        newDoc.appName = this.selectedApp;
      }

      if (this.showAttachmentSection && this.selectedFile) {
        newDoc.attachmentName = this.selectedFile.name;
      }

      this.dataservice.createDocument(this.selectedCollection, newDoc, { isClone: false }).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Created',
            detail: 'Document created successfully!',
          });
          this.createDialogVisible = false;
          this.createJson = '';
          this.isCreateMode = false;
          this.onDialogClose();
          this.searchDocuments();
          this.refreshTotalCount();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create document.',
          });
        },
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid JSON',
        detail: 'Please fix JSON syntax before creating!',
      });
    }
  }

  // ==================== SIDEBAR & NAVIGATION ====================

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  toggleQueryToolbar(): void {
    this.queryToolbarVisible = !this.queryToolbarVisible;
  }

  onCollectionChanged(collectionName: string): void {
    this.selectedCollection = collectionName;
    console.log('Selected collection changed to:', collectionName);
    this.resetPagination();
  }

  private resetPagination(): void {
    this.mongoDocuments = [];
    this.errorMessage = '';
    this.totalDocuments = 0;
    this.currentSkip = 0;
    this.hasMoreData = true;
    this.tableFirst = 0;
  }

  // ==================== SCROLLING & PAGINATION ====================

  onContainerScroll(event: any): void {
    const target = event.target;
    const scrollHeight = target.scrollHeight;
    const scrollTop = target.scrollTop;
    const clientHeight = target.clientHeight;

    const threshold = 100;
    const isBottom = scrollHeight - scrollTop - clientHeight <= threshold;

    if (isBottom && !this.isLoadingMore && this.hasMoreData && this.selectedCollection) {
      console.log('Reached bottom of container — loading more data...');
      this.loadMoreData();
    }
  }

  private async loadMoreData(): Promise<void> {
    if (this.isLoadingMore || !this.hasMoreData || !this.selectedCollection) {
      return;
    }

    this.isLoadingMore = true;
    const nextSkip = this.mongoDocuments.length;
    const url = `${this.baseUrl}mongoAdmin/${this.selectedCollection}/find`;

    const requestBody = {
      filter: this.filterJson ? JSON.parse(this.filterJson) : {},
      projection: this.projectionJson ? JSON.parse(this.projectionJson) : {},
      sort: this.sortJson ? JSON.parse(this.sortJson) : {},
      skip: nextSkip,
      limit: this.pageSize,
    };

    console.log(`Fetching next ${this.pageSize} items starting from ${nextSkip}`);

    const startTime = Date.now();

    this.http
      .post<MongoApiResponse>(url, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
        takeUntil(this.currentRequest$),
        timeout(30000),
        catchError((error) => {
          console.error('Error loading more data:', error);
          this.isLoadingMore = false;
          return of(null);
        })
      )
      .subscribe({
        next: async (res) => {
          const elapsed = Date.now() - startTime;
          const remaining = 1500 - elapsed;
          if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

          this.isLoadingMore = false;

          if (!res || !res.items) {
            this.hasMoreData = false;
            return;
          }

          if (res.items.length > 0) {
            this.mongoDocuments = [...this.mongoDocuments, ...res.items];
            console.log(`Appended ${res.items.length} items. Total now: ${this.mongoDocuments.length}`);
          }

          this.hasMoreData = res.items.length === this.pageSize;
        },
        error: (err) => {
          console.error('Subscription error in loadMore:', err);
          this.isLoadingMore = false;
        },
      });
  }

  loadMoreManual(): void {
    this.loadMoreData();
  }

  // ==================== QUERY SECTIONS ====================

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? null : section;
  }

  searchDocuments(): void {
    if (!this.selectedCollection) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a collection first!',
      });
      return;
    }

    try {
      this.isLoading = true;
      this.skip = 0;
      this.hasMoreData = true;

      const url = `${this.baseUrl}mongoAdmin/${this.selectedCollection}/find`;

      const body = {
        filter: this.filterJson ? JSON.parse(this.filterJson) : {},
        projection: this.projectionJson ? JSON.parse(this.projectionJson) : {},
        sort: this.sortJson ? JSON.parse(this.sortJson) : {},
        skip: this.skip,
        limit: this.pageSize,
      };

      console.log('Searching with body:', body);

      this.http.post<any>(url, body, { headers: { 'Content-Type': 'application/json' } })
        .pipe(timeout(30000), catchError(err => {
          console.error('Search error:', err);
          this.isLoading = false;
          return of(null);
        }))
        .subscribe((res) => {
          this.isLoading = false;
          if (!res || !res.items) {
            this.mongoDocuments = [];
            this.hasMoreData = false;
            return;
          }

          this.mongoDocuments = res.items;
          this.hasMoreData = res.items.length === this.pageSize;
          if (res.total !== undefined) {
            this.totalDocuments = res.total;
          }

          // Extract table columns when new data is loaded
          if (this.mongoDocuments.length > 0) {
            this.extractTableColumns();
          }

          console.log('Search result:', res);
        });

    } catch (e) {
      console.error('Invalid JSON format in one of the fields!');
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid JSON',
        detail: 'Please check your JSON syntax!',
      });
    }
  }

  performSearch() {
    if (!this.selectedCollection) return;

    this.isLoading = true;
    this.resetPagination();

    const url = `${this.baseUrl}mongoAdmin/${this.selectedCollection}/find`;
    const request = {
      filter: this.filterJson ? JSON.parse(this.filterJson) : {},
      projection: this.projectionJson ? JSON.parse(this.projectionJson) : {},
      sort: this.sortJson ? JSON.parse(this.sortJson) : {},
      skip: 0,
      limit: this.pageSize
    };

    this.http.post<MongoApiResponse>(url, request).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.mongoDocuments = res.items || [];
        this.totalDocuments = res.total || 0;
        this.hasMoreData = this.mongoDocuments.length === this.pageSize;

        // Extract table columns when new data is loaded
        if (this.mongoDocuments.length > 0) {
          this.extractTableColumns();
        }
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Search failed' });
      }
    });
  }


  // ==================== EDIT DOCUMENT ====================

  onEdit(doc: any) {
    this.editingDoc = doc;
    this.editJson = JSON.stringify(doc, null, 2);
    this.editDialogVisible = true;
  }

  cancelEdit() {
    this.editDialogVisible = false;
    this.editJson = '';
    this.editingDoc = null;
  }

  confirmEdit() {
    try {
      const updatedDoc = JSON.parse(this.editJson);
      this.mongoService
        .updateDocument(this.selectedCollection, this.editingDoc._id, updatedDoc)
        .subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Updated',
              detail: 'Document updated successfully!',
            });
            this.searchDocuments();
            this.refreshTotalCount();
            this.cancelEdit();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update document.',
            });
          },
        });
    } catch (e) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid JSON',
        detail: 'Please check JSON syntax and try again.',
      });
    }
  }

  // ==================== DELETE DOCUMENT ====================

  onDelete(doc: any) {
    if (!this.selectedCollection || !doc?._id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Invalid document or collection!',
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this document?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.mongoService
          .deleteDocument(this.selectedCollection, doc._id)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Document deleted successfully!',
              });
              this.searchDocuments();
              this.refreshTotalCount();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete document.',
              });
            },
          });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Delete action cancelled.',
        });
      },
    });
  }

  // ==================== COPY DOCUMENT ====================

  onCopy(doc: any) {
    navigator.clipboard
      .writeText(JSON.stringify(doc, null, 2))
      .then(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'Copied',
          detail: 'Document copied to clipboard!',
        });
      })
      .catch((err) => {
        console.error('Clipboard error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to copy document.',
        });
      });
  }

  // ==================== CLONE DOCUMENT ====================

  onClone(doc: any) {
    console.log(this.mongoDocuments);
    this.cloningDoc = { ...doc };
    this.cloneJson = JSON.stringify(this.cloningDoc, null, 2);
    this.cloneDialogVisible = true;
  }

  cancelClone() {
    this.cloneDialogVisible = false;
    this.cloneJson = '';
    this.cloningDoc = null;
  }

  confirmClone() {
    try {
      const newDoc = JSON.parse(this.cloneJson);

      this.mongoService.createDocument(this.selectedCollection, newDoc, { isClone: true })
        .subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Cloned',
              detail: 'Document cloned successfully!',
            });

            this.cloneDialogVisible = false;
            this.cloneJson = '';
            this.cloningDoc = null;
            this.searchDocuments();
            this.refreshTotalCount();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to clone document.',
            });
          }
        });

    } catch (e) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid JSON',
        detail: 'Fix JSON before cloning!',
      });
    }
  }

  // ==================== JSON FORMATTING ====================

  formatJSON(doc: any): SafeHtml {
    try {
      const displayDoc = { ...doc };

      delete displayDoc.isDeleted;
      delete displayDoc.isEdit;
      delete displayDoc.edited_value;
      delete displayDoc.isClone;
      delete displayDoc.clonedFrom;

      const json = JSON.stringify(displayDoc, null, 2);
      const highlighted = this.syntaxHighlight(json);

      return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    } catch {
      return this.sanitizer.bypassSecurityTrustHtml('{}');
    }
  }

  getOrgsWithoutApp(): void {
    this.pageAdminService.getOrgsWithoutByApp().subscribe({
      next: (res: any) => {
        this.orgs = res.Organization.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }));
      },
      error: (err) => {
        console.error('Failed to fetch organizations:', err);
      }
    });
  }

  syntaxHighlight(json: string): string {
    if (!json) return '';
    json = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let colorClass = 'text-[#b5cea8]';

        if (/^"/.test(match)) {
          if (/:$/.test(match)) colorClass = 'text-[#9cdcfe]';
          else colorClass = 'text-[#ce9178]';
        } else if (/true|false/.test(match)) colorClass = 'text-[#569cd6]';
        else if (/null/.test(match)) colorClass = 'text-[#569cd6]';

        return `<span class="${colorClass}">${match}</span>`;
      }
    );
  }

  // ==================== COMPUTED PROPERTIES ====================

  get showLoadMoreButton(): boolean {
    return this.hasMoreData && !this.isLoadingMore && this.mongoDocuments.length > 0;
  }

  get documentCountText(): string {
    if (this.totalDocuments > 0) {
      return `Showing ${this.mongoDocuments.length} of ${this.totalDocuments} documents`;
    } else if (this.mongoDocuments.length > 0) {
      return `Showing ${this.mongoDocuments.length} documents`;
    }
    return '';
  }

  editedViewVisible = false;
  editedJson = '';


  openEditedModal(doc: any) {
    if (!doc.edited_value) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'No edited data available.'
      });
      return;
    }

    this.editedDocRef = doc;  // ⭐ FIXED — now the reference is stored ⭐

    this.editedJson = JSON.stringify(doc.edited_value, null, 2);
    this.editedViewVisible = true;
  }


  jsonEditorOptionsReadOnly = {
    ...this.jsonEditorOptions,
    readOnly: true
  };

  editingRowId: string | null = null;
  editingRowData: any = {};
  originalRowData: any = {};

  startEditRow(doc: any) {
    this.editingRowId = doc._id;
    this.originalRowData = { ...doc };
    this.editingRowData = { ...doc };
  }

  cancelEditRow() {
    this.editingRowId = null;
    this.editingRowData = {};
    this.originalRowData = {};
  }

  saveEditRow(doc: any) {
    if (!this.editingRowId) return;

    this.mongoService
      .updateDocument(this.selectedCollection, this.editingRowId, this.editingRowData)
      .subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Document updated successfully!',
          });

          const index = this.mongoDocuments.findIndex(d => d._id === this.editingRowId);
          if (index !== -1) {
            this.mongoDocuments[index] = { ...this.editingRowData };
          }

          this.refreshTotalCount();
          this.cancelEditRow();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update document.',
          });
        },
      });
  }

  updateCellValue(column: string, event: any) {
    const value = event.target.value;
    try {
      if (value.startsWith('{') || value.startsWith('[')) {
        this.editingRowData[column] = JSON.parse(value);
      } else {
        this.editingRowData[column] = value;
      }
    } catch {
      this.editingRowData[column] = value;
    }
  }

  isEditing(doc: any): boolean {
    return this.editingRowId === doc._id;
  }

  deleteRowInline(doc: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this document?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      accept: () => {
        this.mongoService
          .deleteDocument(this.selectedCollection, doc._id)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Document deleted successfully!',
              });
              this.searchDocuments();
              this.refreshTotalCount();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete document.',
              });
            },
          });
      }
    });
  }

  getCellDisplayValue(doc: any, col: string): string {
    const value = this.getNestedValue(doc, col);
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value || '';
  }

  isCellEditable(col: string): boolean {
    return col !== '_id' && col !== 'createdAt' && col !== 'updatedAt';
  }


  // confirm edit


  confirmEditedChanges() {
    if (!this.editedDocRef || !this.editedDocRef._id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Document reference missing!'
      });
      return;
    }

    const updatedData = this.editedDocRef.edited_value;

    // remove unwanted fields
    delete updatedData.isEdit;
    delete updatedData.edited_value;
    delete updatedData.editedAt;
    delete updatedData.isDeleted;
    delete updatedData.deletedAt;

    this.mongoService.replaceDocument(
      this.selectedCollection,
      this.editedDocRef._id,
      updatedData
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Changes applied successfully!'
        });

        this.editedViewVisible = false;
        this.searchDocuments();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to apply changes!'
        });
      }
    });
  }


  // confirm delete

  deleteViewVisible = false;
  deleteJson = '';
  deletedDocRef: any = null;

  openDeleteModal(doc: any) {
    this.deletedDocRef = doc;
    this.deleteViewVisible = true;
    this.deleteJson = JSON.stringify(doc, null, 2);
  }

  confirmHardDelete() {
    if (!this.deletedDocRef?._id) return;

    this.mongoService.hardDeleteDocument(
      this.selectedCollection,
      this.deletedDocRef._id
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Document deleted permanently!'
        });
        this.deleteViewVisible = false;
        this.searchDocuments();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete document.'
        });
      }
    });
  }



}


