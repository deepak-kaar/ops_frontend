import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportPublishAdministrationService, ReportPublish } from '../../services/reportpublish-administration.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-reportpublish',
  standalone: false,
  templateUrl: './manage-reportpublish.component.html',
  styleUrl: './manage-reportpublish.component.css'
})
export class ManageReportPublishComponent implements OnInit, OnChanges {

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() reportPublishData: ReportPublish | null = null;
  @Output() reportPublishCreated = new EventEmitter<void>();
  @Output() closeDetails = new EventEmitter<void>();

  @Input() appId: string = '';
  @Input() orgId: string = '';

  reportPublishForm!: FormGroup;
  isSubmitting = false;

  frequencyOptions = [
    { label: 'Once', value: 'once' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  templateOptions: any[] = [];
  loadingTemplates = false;
  selectedTemplate: any = null;
  selectedTemplateMappingDate: Date | null = null;
  
  // Report selection dialog
  showReportSelectionDialog = false;
  filteredTemplateOptions: any[] = [];
  reportSearchText = '';
  selectAll = false;
  selectedReports: any[] = [];

  constructor(
    private fb: FormBuilder,
    private reportPublishService: ReportPublishAdministrationService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTemplates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportPublishData'] || changes['mode']) {
      this.initForm();
      if (this.mode === 'edit' && this.reportPublishData) {
        this.populateForm(this.reportPublishData);
      }
    }
  }

  private initForm(): void {
    this.reportPublishForm = this.fb.group({
      pageName: [[], [Validators.required]], // Changed to array for multi-select
      pageDescription: ['', Validators.maxLength(500)],
      publishPath: ['', [Validators.required]], // Accept any path format
      sendAfter: [new Date(), Validators.required],
      frequency: ['daily', Validators.required],
      recipients: ['', [Validators.required, Validators.email]],
      cc: [''],
      bcc: [''],
      emailSubject: ['', [Validators.required, Validators.maxLength(255)]],
      emailBody: [''],
      isActive: [true],
      createdBy: ['']
    });
  }

  private populateForm(data: ReportPublish): void {
    // Parse sendAfter to Date object
    let sendAfterDate = new Date();
    if (data.sendAfter) {
      sendAfterDate = new Date(data.sendAfter);
    }

    // Handle pageName as array for multi-select
    const pageNameArray = Array.isArray(data.pageName) ? data.pageName : [data.pageName];

    this.reportPublishForm.patchValue({
      pageName: pageNameArray,
      pageDescription: data.pageDescription || '',
      publishPath: data.publishPath,
      sendAfter: sendAfterDate,
      frequency: data.frequency,
      recipients: data.recipients,
      cc: data.cc || '',
      bcc: data.bcc || '',
      emailSubject: data.emailSubject,
      emailBody: data.emailBody || '',
      isActive: data.isActive,
      createdBy: data.createdBy || ''
    });
  }

  /**
   * Handle file selection for publish path
   */
  onFileSelect(event: any): void {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      // For browser, we can only get the file name, not the full path
      // In a real scenario, you might need a different approach for file paths
      this.reportPublishForm.patchValue({
        publishPath: file.name
      });
    }
  }

  /**
   * Browse for file path (manual input)
   */
  browseFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.xlsx,.xls,.doc,.docx,.csv,.txt,.png,.jpg,.jpeg,.gif';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Note: Browser security prevents getting full file path
        // User needs to manually enter the server/network path
        this.messageService.add({
          severity: 'info',
          summary: 'File Selected',
          detail: `Selected: ${file.name}. Please enter the full network/server path in the field.`,
          life: 5000
        });
      }
    };

    input.click();
  }

  /**
   * Submit the form
   */
  onSubmit(): void {
    if (this.reportPublishForm.invalid) {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly',
        life: 3000
      });
      return;
    }

    this.isSubmitting = true;
    this.spinner.show();

    const formData = this.reportPublishForm.value;

    // Format sendAfter as ISO string
    if (formData.sendAfter instanceof Date) {
      formData.sendAfter = formData.sendAfter.toISOString();
    }

    if (this.mode === 'create') {
      this.createReportPublish(formData);
    } else {
      this.updateReportPublish(formData);
    }
  }

  private createReportPublish(data: any): void {
    this.reportPublishService.createReportPublish(data).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.spinner.hide();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Report publish entry created successfully',
          life: 3000
        });
        this.reportPublishCreated.emit();
        this.resetForm();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.response || 'Failed to create report publish entry',
          life: 5000
        });
      }
    });
  }

  private updateReportPublish(data: any): void {
    const id = this.reportPublishData?.reportPublishId || this.reportPublishData?._id;
    if (!id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No ID found for update',
        life: 3000
      });
      this.isSubmitting = false;
      this.spinner.hide();
      return;
    }

    data.modifiedBy = data.createdBy || 'system';

    this.reportPublishService.updateReportPublish(id, data).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.spinner.hide();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Report publish entry updated successfully',
          life: 3000
        });
        this.reportPublishCreated.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.response || 'Failed to update report publish entry',
          life: 5000
        });
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.values(this.reportPublishForm.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  resetForm(): void {
    this.reportPublishForm.reset({
      isActive: true,
      frequency: 'daily',
      sendAfter: new Date(),
      pageName: []
    });
    this.selectedTemplateMappingDate = null;
  }

  close(): void {
    this.closeDetails.emit();
  }

  /**
   * Check if a field has error
   */
  hasError(fieldName: string): boolean {
    const control = this.reportPublishForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.reportPublishForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return `${fieldName} is required`;
    if (control.errors['email']) return 'Invalid email format';
    if (control.errors['maxlength']) return `Maximum length exceeded`;

    return 'Invalid value';
  }

  loadTemplates(): void {
    this.loadingTemplates = true;

    const payload = {
      appId: this.appId || '',
      orgId: this.orgId || '',
      templateType: 'Report Design'
    };

    this.http.post<any>('http://localhost:8080/idt/getTemplates', payload).subscribe({
      next: (response) => {
        if (response?.templates) {
          this.templateOptions = response.templates.map((template: any) => ({
            label: template.templateName,
            value: template.templateId || template._id,
            description: template.templateDescription,
            mappingUpdatedOn: template.mappingUpdatedOn,
            selected: false,
            fullData: template
          }));
          this.filteredTemplateOptions = [...this.templateOptions];
        }
        this.loadingTemplates = false;
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.loadingTemplates = false;
      }
    });
  }

  onTemplateChange(event: any): void {
    const selectedValues = event.value; // Array of selected values
    
    if (selectedValues && selectedValues.length > 0) {
      // Get the last selected template
      const lastSelectedValue = selectedValues[selectedValues.length - 1];
      const selected = this.templateOptions.find(t => t.value === lastSelectedValue);

      if (selected) {
        this.selectedTemplate = selected.fullData;
        this.selectedTemplateMappingDate = selected.mappingUpdatedOn ? new Date(selected.mappingUpdatedOn) : null;
        
        // Auto-fill the description from the last selected template
        this.reportPublishForm.patchValue({
          pageDescription: selected.description || ''
        });
      }
    } else {
      // Clear when no selection
      this.selectedTemplate = null;
      this.selectedTemplateMappingDate = null;
      this.reportPublishForm.patchValue({
        pageDescription: ''
      });
    }
  }

  // Report Selection Dialog Methods
  openReportSelectionDialog(): void {
    this.showReportSelectionDialog = true;
    this.reportSearchText = '';
    this.filteredTemplateOptions = [...this.templateOptions];
    
    // Mark previously selected reports
    const currentSelection = this.reportPublishForm.get('pageName')?.value || [];
    this.templateOptions.forEach(opt => {
      opt.selected = currentSelection.includes(opt.value);
    });
    this.updateSelectAll();
  }

  closeReportSelectionDialog(): void {
    this.showReportSelectionDialog = false;
  }

  filterReports(): void {
    const searchLower = this.reportSearchText.toLowerCase();
    this.filteredTemplateOptions = this.templateOptions.filter(opt => 
      opt.label.toLowerCase().includes(searchLower) || 
      (opt.description && opt.description.toLowerCase().includes(searchLower))
    );
  }

  toggleSelectAll(): void {
    this.filteredTemplateOptions.forEach(opt => opt.selected = this.selectAll);
    this.onReportSelect();
  }

  onReportSelect(): void {
    this.selectedReports = this.templateOptions.filter(opt => opt.selected);
    this.updateSelectAll();
  }

  updateSelectAll(): void {
    const visibleSelected = this.filteredTemplateOptions.filter(opt => opt.selected).length;
    this.selectAll = visibleSelected === this.filteredTemplateOptions.length && this.filteredTemplateOptions.length > 0;
  }

  confirmReportSelection(): void {
    const selectedValues = this.selectedReports.map(r => r.value);
    this.reportPublishForm.patchValue({ pageName: selectedValues });
    
    // Update description and mapping date from last selected
    if (this.selectedReports.length > 0) {
      const lastSelected = this.selectedReports[this.selectedReports.length - 1];
      this.selectedTemplate = lastSelected.fullData;
      this.selectedTemplateMappingDate = lastSelected.mappingUpdatedOn ? new Date(lastSelected.mappingUpdatedOn) : null;
      this.reportPublishForm.patchValue({
        pageDescription: lastSelected.description || ''
      });
    }
    
    this.closeReportSelectionDialog();
  }

  getSelectedReportsDisplay(): string {
    const selectedValues = this.reportPublishForm.get('pageName')?.value || [];
    if (selectedValues.length === 0) return '';
    
    const selectedNames = this.templateOptions
      .filter(opt => selectedValues.includes(opt.value))
      .map(opt => opt.label);
    
    return selectedNames.join(', ');
  }
}
