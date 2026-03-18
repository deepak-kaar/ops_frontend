import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { EmailAdministrationComponent } from '../../email-administration.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, debounceTime } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ManageUploadComponent } from '../manage-upload/manage-upload.component';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfigAdministrationService } from 'src/app/modules/config-administration/services/config-administration.service';
import { ActiveDirectoryService } from 'src/app/modules/active-directory/services/active-directory.service';
import { ReportGenAdministrationService } from 'src/app/modules/report-gen-administration/services/report-gen-administration.service';
import { Orgs, Reports } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import Quill from 'quill';
import { ReportimageAdministrationService } from 'src/app/modules/reportimage-administration/services/reportimage-administration.service';

// Extend font list
const Font: any = Quill.import('formats/font');
Font.whitelist = ['manifapro', 'manifapro-italic', 'ghawar', 'segoe', 'trebuchet'];
Quill.register(Font, true);

// Add this interface if not already defined
interface SelectedReport {
  reportId: string;
  reportName: string;
  orgName: string;
  orgId?: string;  // Add this property
}

@Component({
  selector: 'app-manage-email',
  standalone: false,
  templateUrl: './manage-email.component.html',
  styleUrl: './manage-email.component.css'
})
export class ManageEmailComponent extends EmailAdministrationComponent implements OnInit, OnDestroy {

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() emailData: any;

  emailForm!: FormGroup;

  /**
* @property {any[]} status - Stores a list of active status (potentially for dropdown selection).
*/
  status: any[] = [
    {
      name: 'Yes',
      value: "true"
    },
    {
      name: 'No',
      value: "false"
    }
  ];




  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
* @property {Observable<any>} file_data$ - Stores the list of attachments fetched from the backend.
*/
  file_data$!: Observable<any>;

  selectedFile: any; // store selected row data

  appRef!: DynamicDialogRef;

  /**
 * @property {unknown} iSloading - Indicates the loading state (can be replaced with a boolean for better clarity).
 */
  iSloading: unknown;

  @ViewChild('dt') dt!: Table;

  files: any[] = []; // store uploaded files

  @Output() emailCreated = new EventEmitter<void>(); // event to notify parent

  removeAttachments: any[] = []; // will store backend files to delete

  // LDAP Group Search properties
  configOptions: any[] = [];
  selectedConfig: string = '';
  inputGroupName: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  ldapGroupResponse: any = null;

  previewVisible = false;
  previewUrl: SafeResourceUrl | null = null;

  fileType: 'pdf' | 'docx' | 'xlsx' | 'pptx' | null = null;
  // File type flags for conditional rendering
  isPdf = false;
  isDocx = false;
  isExcel = false;
  isPpt = false;
  isImage = false;

  // Select Reports dialog (not sent in payload - UI only for now)
  reportDialogVisible = false;
  selectedReports: SelectedReport[] = [];
  dialogSelectedReports: SelectedReport[] = [];
  reports: Reports[] = [];
  organizations: Orgs[] = [];
  filteredOrganizations: Orgs[] = [];
  selectedOrgForDialog: Orgs | null = null;
  isAllSelected = true;
  orgLookup: Record<string, string> = {};
  filteredReportsForDialog: any[] = [];
  orgSearchTerm = '';
  reportSearchTerm = '';
  private destroy$ = new Subject<void>();

  // toolbarOptions = [
  //   ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  //   [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  //   [{ indent: '-1' }, { indent: '+1' }],
  //   [{ direction: 'rtl' }],
  //   [{ size: ['small', false, 'large', 'huge'] }],
  //   [{ header: [1, 2, 3, 4, 5, 6, false] }],
  //   [{ color: [] }, { background: [] }],
  //   //[{ font: [] }],
  //   [{ align: [] }],
  //   ['clean'] // remove formatting
  // ];

  // quillModules = {
  //   toolbar: this.toolbarOptions
  // };

  editorOptions = {
    theme: 'vs-light', language: 'html',
    automaticLayout: true
  };

  previewHTML: any = '';
  private blobUrlCache = new Map<string, string>();


  constructor(private fb: FormBuilder,
    public sanitizer: DomSanitizer,
    private configAdminService: ConfigAdministrationService,
    private activeDirectoryService: ActiveDirectoryService,
    private reportimageAdministrationService: ReportimageAdministrationService,
    private reportGenService: ReportGenAdministrationService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] && !changes['mode'].firstChange) {
      if (this.mode === 'create') {
        this.emailForm.reset({
          isActive: "true",
          isGroup: "false",
          isCorpRepo: "false"
        });
        this.files = [];
        this.file_data$ = of([]);
        this.selectedReports = [];
      } else if (this.mode === 'edit' && this.emailData) {
        this.files = [];
        this.getFiles(this.emailData.attachments);
        this.emailForm.patchValue(this.normalizeEmailDates(this.emailData) || {});
        // Resolve selected_reports IDs to full objects
        this.resolveSelectedReports(this.emailData.selected_reports);
      }
    }

    if (changes['emailData'] && this.mode === 'edit') {
      console.log('on init here')
      this.initForm();
      this.files = [];
      this.getFiles(this.emailData.attachments);
      this.emailForm.patchValue(this.normalizeEmailDates(this.emailData) || {});
      // Resolve selected_reports IDs to full objects
      this.resolveSelectedReports(this.emailData.selected_reports);
    }
  }

  getFiles(file: any): void {
    if (!file) {
      // If file is null, undefined, or falsy, don't modify anything
      return;
    }

    // Normalize to an array safely
    const incomingFiles = Array.isArray(file) ? file : [file];
    if (incomingFiles.length === 0) return;

    // Create a Set of existing identifiers
    const existingIds = new Set(
      this.files.map(f => f.fileId || (f.name + '_' + f.size))
    );

    // Filter out duplicates
    const uniqueFiles = incomingFiles.filter(f => {
      const id = f?.fileId || (f?.name + '_' + f?.size);
      if (!id) return false; // skip invalid entries
      if (existingIds.has(id)) return false;
      existingIds.add(id);
      return true;
    });

    // Append only unique ones
    if (uniqueFiles.length > 0) {
      this.files.push(...uniqueFiles);
    }

    // Update observable & form
    this.file_data$ = of(this.files);
    this.emailForm.patchValue({ attachments: this.files });
  }


  override ngOnInit(): void {
    super.ngOnInit();
    this.initForm();
    this.loadConfigOptions();

    // Subscribe to application changes to update from field
    this.filterService.selectedApp$.subscribe(app => {
      if (this.emailForm && this.mode === 'create') {
        const newFrom = app?.appName
          ? `${app.appName.toLowerCase()}@aramco.com.sa`
          : 'opsinsight@aramco.com.sa';
        this.emailForm.patchValue({ from: newFrom });
      }
    });

    // Load orgs and reports for Select Reports dialog (same as manage-report)
    this.filterService.selectedApp$
      .pipe(takeUntil(this.destroy$))
      .subscribe(app => {
        if (!app) {
          this.organizations = [];
          this.filteredOrganizations = [];
          return;
        }
        this.getOrgs(app.appId);
      });

    combineLatest([
      this.filterService.selectedApp$,
      this.filterService.selectedOrg$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([app, org]) => {
        if (!app) return;
        this.loadReports(app.appId, org?.orgId);
      });

    if (this.mode === 'edit' && this.emailData) {
      console.log('on init here')
      this.files = []
      this.emailForm.patchValue(this.normalizeEmailDates(this.emailData));
      this.getFiles(this.emailData.attachments);
      // Resolve selected_reports IDs to full objects
      this.resolveSelectedReports(this.emailData.selected_reports);
    }
  }

  initForm(): void {
    // Set default from email based on selected application
    const selectedApp = this.filterService.currentApp;
    const defaultFrom = selectedApp?.appName
      ? `${selectedApp.appName.toLowerCase()}@aramco.com.sa`
      : 'opsinsight@aramco.com.sa';

    this.emailForm = this.fb.group({
      emailId: [''],
      from: [defaultFrom, Validators.required],
      to: ['', Validators.required],
      cc: [''],
      bcc: [''],
      emailSubject: ['', Validators.required],
      emailBody: [''],
      comments: [''],
      createdBy: [''],
      createdAt: [''],
      modifiedBy: [''],
      modifiedAt: [''],
      isActive: ["true"],
      isGroup: ["false"],
      isCorpRepo: ["false"],
      lastSent: [''],
      sendAfter: [''],
      attachments: [[]],
      ldapConfig: [''],
      ldapGroupName: [''],
    });

    // Subscribe to isGroup changes to update validators
    this.emailForm.get('isGroup')?.valueChanges.subscribe(value => {
      this.updateValidators(value === 'true');
    });

    this.emailForm.get('emailBody')?.valueChanges
      .pipe(
        debounceTime(400)
      )
      .subscribe(async (body: any) => {
        this.previewHTML = await this.processEmailBodyForPreview(body);
      });

    this.file_data$ = of([]);
  }

  updateValidators(isGroup: boolean): void {
    const toControl = this.emailForm.get('to');
    const ldapConfigControl = this.emailForm.get('ldapConfig');
    const ldapGroupNameControl = this.emailForm.get('ldapGroupName');

    if (isGroup) {
      // When isGroup is true, to field is not required, but ldap fields are
      toControl?.clearValidators();
      ldapConfigControl?.setValidators([Validators.required]);
      ldapGroupNameControl?.setValidators([Validators.required]);
    } else {
      // When isGroup is false, to field is required, ldap fields are not
      toControl?.setValidators([Validators.required]);
      ldapConfigControl?.clearValidators();
      ldapGroupNameControl?.clearValidators();
    }

    toControl?.updateValueAndValidity();
    ldapConfigControl?.updateValueAndValidity();
    ldapGroupNameControl?.updateValueAndValidity();
  }

  normalizeEmailDates(email: any) {
    return {
      ...email,
      sendAfter: email.sendAfter ? new Date(email.sendAfter) : null
    };
  }

  save(): void {
    if (this.emailForm.valid) {
      const formData = new FormData();
      const payload = this.emailForm.value;

      // Handle LDAP group response if isGroup is true
      if (payload.isGroup === 'true' && this.ldapGroupResponse) {
        // Pass the LDAP response as the payload
        Object.keys(this.ldapGroupResponse).forEach(key => {
          if (key !== 'attachments') {
            const value = this.ldapGroupResponse[key];
            if (value !== null && value !== undefined) {
              formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
            }
          }
        });

        // Also append form fields that are not in LDAP response
        ['from', 'cc', 'bcc', 'emailSubject', 'emailBody', 'comments', 'isActive', 'isGroup', 'isCorpRepo', 'sendAfter', 'lastSent'].forEach(key => {
          const value = payload[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });

        // Add configId for LDAP group processing
        if (payload.ldapConfig) {
          formData.append('configId', payload.ldapConfig);
        }
      } else {
        // Normal flow for non-group emails
        Object.keys(payload).forEach(key => {
          if (key !== 'attachments') {
            const value = payload[key];
            if (value !== null && value !== undefined) {
              formData.append(key, value);
            }
          }
        });
      }

      // Add selected reports as PDF attachments
      if (this.selectedReports && this.selectedReports.length > 0) {
        const reportIds = this.selectedReports.map(r => r.reportId);
        formData.append('selectedReports', JSON.stringify(reportIds));
      }

      // Append attachments
      if (this.files && this.files.length > 0) {
        this.files.forEach(f => {
          const fileObj = f.rawFile || f.file || f;
          if (fileObj instanceof File) {
            formData.append('attachments', fileObj);
          }
        });
      }

      if (this.mode === 'create') {
        this.emailAdministrationService.postEmail(formData).subscribe({
          next: (res: any) => {
            this.showToast('success', 'Success', 'Successfully created', 2000, false);
            this.initForm();
            this.files = [];
            this.ldapGroupResponse = null;
            this.emailCreated.emit();
          },
          error: (err) => {
            this.showToast('error', 'Error', 'Error when creating', 2000, false);
          }
        });
      } else {
        if (this.removeAttachments.length > 0) {
          formData.append('removeAttachments', JSON.stringify(this.removeAttachments));
        }
        this.emailAdministrationService.putEmail(formData, payload.emailId).subscribe({
          next: (res: any) => {
            this.showToast('success', 'Success', 'Successfully edited', 2000, false);
            this.emailCreated.emit();
          },
          error: (err) => {
            this.showToast('error', 'Error', 'Error when editing', 2000, false);
          }
        });
      }
    }
  }

  upload(): void {
    this.selectedFile = null;
    if (this.dt) {
      this.dt.selection = null;
    }

    this.appRef = this.dialog.open(ManageUploadComponent, {
      header: 'Upload Attachment',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.getFiles(res.attachments);
      }
    });
  }

  /**
 * Handles application selection from a table.
 * @param {TableRowSelectEvent} event - The event object containing details of the selected row.
 */
  onSelect(event: TableRowSelectEvent) {

  }

  deleteFile(file: any) {
    // Remove from files array
    this.files = this.files.filter(f => f !== file);

    // If it's a backend file, track it for deletion
    if (file.fileId) {
      this.removeAttachments.push(file.fileId);
    }
    this.emailForm.patchValue({ attachments: this.files });
    this.file_data$ = of(this.files);
    this.showToast('success', 'Deleted', 'Attachment removed successfully', 2000, false);
  }

  downloadFile(file: any) {
    if (!file) return;

    // Case 1: actual File object (from upload)
    if (file instanceof File) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href);
      this.showToast('info', 'Download', `${file.name} downloaded`, 2000, false);

    }
    // Case 2: backend file metadata
    else if (file.fileId || file.url) {
      this.emailAdministrationService.downloadAttachment(file.fileId).subscribe({
        next: (blob: Blob) => {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = file.filename || 'attachment';
          link.click();
          window.URL.revokeObjectURL(link.href);
          this.showToast('info', 'Download', `${file.filename} downloaded`, 2000, false);
        },
        error: (err) => {
          console.log(err);
          this.showToast('error', 'Error', 'Failed to download file', 2000, false);
        }
      });
    }
  }

  previewFile(file: any) {
    if (!file) return;

    // Local file from upload
    if (file instanceof File) {
      const fileUrl = URL.createObjectURL(file);
      this.openFilePreview(fileUrl, file.name, file.type);
    }
    // File fetched from server
    else if (file.fileId || file.url) {
      this.emailAdministrationService.downloadAttachment(file.fileId).subscribe({
        next: (blob: Blob) => {
          // Infer filename and type
          const fileName = file.fileName || 'document';
          const extension = fileName.split('.').pop()?.toLowerCase();
          const contentType =
            blob.type ||
            this.getMimeTypeByExtension(extension || 'application/octet-stream');

          // Convert to File for uniform handling
          const fileObj = new File([blob], fileName, { type: contentType });
          const fileUrl = URL.createObjectURL(fileObj);

          this.openFilePreview(fileUrl, fileName, contentType);
        },
        error: () => {
          this.previewUrl = null;
          this.previewVisible = true;
        }
      });
    }
  }

  // Utility to determine how to open a file
  openFilePreview(fileUrl: string, fileName: string, mimeType?: string) {
    const extension = fileName.split('.').pop()?.toLowerCase();

    // Reset all viewer flags
    this.isDocx = false;
    this.isExcel = false;
    this.isPpt = false;
    this.isImage = false;
    this.isPdf = false;

    switch (extension) {
      case 'pdf':
        this.isPdf = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
        break;

      case 'docx':
      case 'doc':
        this.isDocx = true;
        this.previewUrl = fileUrl;
        break;

      case 'xlsx':
      case 'xls':
        this.isExcel = true;
        this.previewUrl = fileUrl;
        break;

      case 'pptx':
      case 'ppt':
        this.isPpt = true;
        this.previewUrl = fileUrl;
        break;

      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        this.isImage = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
        break;

      default:
        // Fallback: open in new tab
        window.open(fileUrl, '_blank');
        return;
    }

    this.previewVisible = true;
  }

  // Helper to guess MIME type
  getMimeTypeByExtension(ext: string): string {
    const mimeMap: { [key: string]: string } = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ppt: 'application/vnd.ms-powerpoint',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif'
    };
    return mimeMap[ext] || 'application/octet-stream';
  }

  resetPreview() {
    this.previewUrl = null;
    this.isDocx = this.isExcel = this.isPpt = this.isPdf = this.isImage = false;
  }



  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
 * Clears the table filter/search.
 * @param {Table} _t19 - The table reference whose filter should be cleared.
 */
  clearTable(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  // LDAP Group Search methods
  loadConfigOptions(): void {
    this.configAdminService.getConfigDropdown().subscribe({
      next: (response) => {
        if (response?.config) {
          this.configOptions = response.config;
        }
      },
      error: (error) => {
        console.error('Error fetching Config:', error);
        this.errorMessage = 'Failed to load config data.';
      }
    });
  }

  onSearchUsers(): void {
    const ldapConfig = this.emailForm.get('ldapConfig')?.value;
    const ldapGroupName = this.emailForm.get('ldapGroupName')?.value;

    if (!ldapConfig) {
      this.errorMessage = 'Please select config.';
      this.successMessage = '';
      return;
    }

    if (!ldapGroupName || ldapGroupName.trim() === '') {
      this.errorMessage = 'Please enter a group name.';
      this.successMessage = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Use the same service method as active-directory component
    this.activeDirectoryService.getLdapUsersInGroup(ldapGroupName, ldapConfig).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response) {
          this.successMessage = response.message || 'Successfully fetched users from LDAP group';
          // Store the response for later use in save method
          this.ldapGroupResponse = response;
        } else {
          this.errorMessage = 'No data available.';
        }
      },
      error: (error) => {
        console.error('Error fetching LDAP users in group:', error);
        this.errorMessage = error?.error?.message || 'Failed to load data.';
        this.isLoading = false;
      }
    });
  }

  async processEmailBodyForPreview(body: string): Promise<string> {
    const regex = /{{REP@([^}]+)}}/g;
    const matches = [...body.matchAll(regex)];

    const replacements = await Promise.all(
      matches.map(async (match) => {
        const filename = match[1];

        // STEP 1: check cache first
        if (this.blobUrlCache.has(filename)) {
          return `<img src="${this.blobUrlCache.get(filename)}" style="max-width:250px;" />`;
        }

        try {
          // STEP 2: download blob once
          const blob = await this.reportimageAdministrationService
            .getAttachmentByFileName(filename)
            .toPromise();

          if (!blob) return match[0];

          // STEP 3: create blob URL
          const url = URL.createObjectURL(blob);

          // STEP 4: store in cache
          this.blobUrlCache.set(filename, url);

          return `<img src="${url}"/>`;

        } catch (err) {
          console.warn(`Failed to load file: ${filename}`);
          return match[0];
        }
      })
    );

    // Replace placeholders
    let finalHtml = body;
    matches.forEach((match, index) => {
      finalHtml = finalHtml.replace(match[0], replacements[index]);
    });

    return finalHtml;
  }

  // --- Select Reports dialog (data not sent in payload) ---
  getOrgs(appId: string): void {
    this.reportGenService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {
        this.organizations = res.orgs.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }));
        this.filteredOrganizations = [...this.organizations];
        this.orgLookup = {};
        this.organizations.forEach(o => {
          this.orgLookup[o.orgId] = o.orgName;
        });
        this.selectAllOrganizations();
      },
      error: (err) => {
        console.error('Failed to fetch organizations:', err);
        this.organizations = [];
        this.filteredOrganizations = [];
      }
    });
  }

  loadReports(appId: string, orgId?: string): void {
    const payload = {
      appId,
      orgId,
      templateType: 'Report Design'
    };
    this.reportGenService.getTemplates(payload).subscribe({
      next: (res: any) => {
        const mappings = res.templates || res.templateMappings || res.data || [];
        this.reports = mappings.map((item: any) => ({
          reportId: item?.templateId,
          reportName: item?.templateName,
          description: '',
          orgId: item?.orgId,
          appId: item?.appId,
          orgName: this.orgLookup[item?.orgId] || 'Unknown Org',
          isActive: false
        }));
        this.filterReports();

        // Re-resolve selected reports after reports are loaded (for edit mode)
        if (this.mode === 'edit' && this.emailData?.selected_reports) {
          this.resolveSelectedReports(this.emailData.selected_reports);
        }
      },
      error: (err) => {
        console.error('Error loading reports for dialog:', err);
      }
    });
  }

  filterOrganizations(): void {
    this.filteredOrganizations = this.organizations.filter(org =>
      org.orgName.toLowerCase().includes(this.orgSearchTerm.toLowerCase())
    );
  }

  selectAllOrganizations(): void {
    this.isAllSelected = true;
    this.selectedOrgForDialog = null;
    this.filterReports();
  }

  selectOrganization(org: Orgs): void {
    this.isAllSelected = false;
    this.selectedOrgForDialog = org;
    this.filterReports();
  }

  filterReports(): void {
    const search = this.reportSearchTerm.toLowerCase();
    if (this.isAllSelected) {
      this.filteredReportsForDialog = this.reports.filter(r =>
        r.reportName.toLowerCase().includes(search)
      );
      return;
    }
    if (!this.selectedOrgForDialog) {
      this.filteredReportsForDialog = [];
      return;
    }
    this.filteredReportsForDialog = this.reports.filter(r =>
      r.orgId === this.selectedOrgForDialog?.orgId &&
      r.reportName.toLowerCase().includes(search)
    );
  }

  getSelectedCountByOrg(orgId: string): number {
    return this.dialogSelectedReports.filter(r => r.orgId === orgId).length;
  }

  openReportDialog(): void {
    this.reportDialogVisible = true;
    this.dialogSelectedReports = [...this.selectedReports];
  }

  confirmReportSelection(): void {
    this.selectedReports = [...this.dialogSelectedReports];
    this.reportDialogVisible = false;
  }

  removeSelectedReport(report: SelectedReport): void {
    this.selectedReports = this.selectedReports.filter(r => r.reportId !== report.reportId);
    // Also remove from dialog selections
    this.dialogSelectedReports = this.dialogSelectedReports.filter(r => r.reportId !== report.reportId);
  }

  /**
   * Resolves report IDs to full SelectedReport objects
   * @param reportIds - Array of report ID strings from API response
   */
  resolveSelectedReports(reportIds: string[] | undefined): void {
    if (!reportIds || reportIds.length === 0) {
      this.selectedReports = [];
      return;
    }

    // If reports are already loaded, resolve immediately
    if (this.reports && this.reports.length > 0) {
      this.selectedReports = reportIds
        .map(id => {
          const report = this.reports.find(r => r.reportId === id);
          if (report) {
            return {
              reportId: report.reportId,
              reportName: report.reportName,
              orgName: report.orgName || this.orgLookup[report.orgId] || 'Unknown Org',
              orgId: report.orgId
            } as SelectedReport;
          }
          return null;
        })
        .filter((r): r is SelectedReport => r !== null);
    } else {
      // Reports not loaded yet - store IDs temporarily and resolve later
      // This will be handled when loadReports completes
      this.selectedReports = reportIds.map(id => ({
        reportId: id,
        reportName: 'Loading...',
        orgName: 'Loading...',
        orgId: ''
      }));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.blobUrlCache.forEach(url => URL.revokeObjectURL(url));
    this.blobUrlCache.clear();
  }
}
