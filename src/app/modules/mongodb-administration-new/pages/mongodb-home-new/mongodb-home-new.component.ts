import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of, timeout, catchError, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MongodbServiceNewService } from './services/mongodb-service-new.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as monaco from 'monaco-editor';
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
  selector: 'app-mongodb-home-new',
  standalone: false,
  templateUrl: './mongodb-home-new.component.html',
  styleUrls: ['./mongodb-home-new.component.css']
})
export class MongodbHomeNewComponent implements OnInit, OnDestroy {
  private editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
  private lockedDecorations: string[] = [];
  private previousContent: string = '';
  private isRestoringContent: boolean = false;
  private destroy$ = new Subject<void>();
  private currentRequest$ = new Subject<void>();
  private readonly baseUrl = environment.apiUrl;

  // UI States
  viewMode: 'json' | 'table' = 'json';
  mobileSidebarVisible = false;
  queryToolbarVisible = true;
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  // Collection & Documents
  selectedCollection: string = '';
  mongoDocuments: any[] = [];
  tableColumns: string[] = [];

  // Loading States
  isLoading = false;
  isLoadingMore = false;
  errorMessage = '';

  // Pagination
  totalDocuments = 0;
  currentSkip = 0;
  pageSize = 10;
  hasMoreData = true;
  tableRows = 10;
  tableFirst = 0;
  rowsPerPageOptions = [5, 10, 25, 100];

  // Dialogs
  editDialogVisible = false;
  editJson = '';
  editingDoc: any = null;
  createDialogVisible = false;
  createJson = '';
  cloneDialogVisible = false;
  cloneJson = '';
  cloningDoc: any = null;

  // Query Options
  activeSection: string | null = null;
  filterJson = '';
  projectionJson = '';
  sortJson = '';
  skip = 0;
  limit = 25;

  // Schema & Validation
  lastFetchedSchema: any = null;
  lookupData: any = {};
  showOrgDropdown = false;
  showAppDropdown = false;
  showAttachmentSection = false;
  orgList: any[] = [];
  appList: string[] = [];
  selectedOrg: string | null = null;
  selectedApp: string | null = null;
  selectedFile: File | null = null;

  // Monaco Editor Options
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

  constructor(
    private mongoService: MongodbServiceNewService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private responsive: ResponsiveService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();

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

  // View Mode Switcher
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

  // Sidebar & Navigation
  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  toggleQueryToolbar(): void {
    this.queryToolbarVisible = !this.queryToolbarVisible;
  }

  onCollectionChanged(collectionName: string): void {
    this.selectedCollection = collectionName;
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

  // Search & Query
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

          if (this.mongoDocuments.length > 0) {
            this.extractTableColumns();
          }
        });
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid JSON',
        detail: 'Please check your JSON syntax!',
      });
    }
  }

  // CRUD Operations
  onEdit(doc: any) {
    this.editingDoc = doc;
    this.editJson = JSON.stringify(doc, null, 2);
    this.editDialogVisible = true;
  }

  confirmEdit() {
    try {
      const updatedDoc = JSON.parse(this.editJson);
      this.mongoService.updateDocument(this.selectedCollection, this.editingDoc._id, updatedDoc)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Updated',
              detail: 'Document updated successfully!',
            });
            this.searchDocuments();
            this.editDialogVisible = false;
            this.editJson = '';
            this.editingDoc = null;
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
        this.mongoService.deleteDocument(this.selectedCollection, doc._id)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Document deleted successfully!',
              });
              this.searchDocuments();
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

  onCopy(doc: any) {
    navigator.clipboard.writeText(JSON.stringify(doc, null, 2))
      .then(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'Copied',
          detail: 'Document copied to clipboard!',
        });
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to copy document.',
        });
      });
  }

  onClone(doc: any) {
    this.cloningDoc = { ...doc };
    this.cloneJson = JSON.stringify(this.cloningDoc, null, 2);
    this.cloneDialogVisible = true;
  }

  confirmClone() {
    try {
      const newDoc = JSON.parse(this.cloneJson);
      this.mongoService.createDocument(this.selectedCollection, newDoc, { isClone: true })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Cloned',
              detail: 'Document cloned successfully!',
            });
            this.cloneDialogVisible = false;
            this.cloneJson = '';
            this.cloningDoc = null;
            this.searchDocuments();
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

  // Export & Import
  async exportData(format: string) {
    const fileName = `mongo_data_${new Date().getTime()}`;
    const data = this.mongoDocuments;

    if (!data || data.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'No data available to export.'
      });
      return;
    }

    if (format === 'excel') {
      await this.exportService.exportExcel(data, fileName);
    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${fileName}.json`;
      link.click();
    }
  }

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

      let successCount = 0;
      let errorCount = 0;

      for (const item of importResults) {
        if (item.action === 'Delete' && item.rowData._id) {
          try {
            await this.mongoService.hardDeleteDocument(this.selectedCollection, item.rowData._id).toPromise();
            successCount++;
          } catch (error) {
            errorCount++;
          }
        } else if (item.action === 'Add New') {
          try {
            await this.mongoService.createDocument(this.selectedCollection, item.rowData, { isClone: false }).toPromise();
            successCount++;
          } catch (error) {
            errorCount++;
          }
        } else if (item.action === 'Edit' && item.rowData._id) {
          try {
            await this.mongoService.updateDocument(this.selectedCollection, item.rowData._id, item.rowData).toPromise();
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
      }

      this.messageService.add({
        severity: successCount > 0 ? 'success' : 'error',
        summary: 'Import Complete',
        detail: `Successfully processed ${successCount} records${errorCount > 0 ? `, ${errorCount} failed` : ''}`
      });

      this.searchDocuments();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Import Error',
        detail: 'Failed to import Excel file. Please check the file format.'
      });
    }
  }

  // JSON Formatting
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

  syntaxHighlight(json: string): string {
    if (!json) return '';
    json = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return json.replace(
      /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let colorClass = 'text-[#b5cea8]';
        if (/^\"/.test(match)) {
          if (/:$/.test(match)) colorClass = 'text-[#9cdcfe]';
          else colorClass = 'text-[#ce9178]';
        } else if (/true|false/.test(match)) colorClass = 'text-[#569cd6]';
        else if (/null/.test(match)) colorClass = 'text-[#569cd6]';
        return `<span class="${colorClass}">${match}</span>`;
      }
    );
  }

  get documentCountText(): string {
    if (this.totalDocuments > 0) {
      return `Showing ${this.mongoDocuments.length} of ${this.totalDocuments} documents`;
    } else if (this.mongoDocuments.length > 0) {
      return `Showing ${this.mongoDocuments.length} documents`;
    }
    return '';
  }
}
