import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ReportPublishAdministrationService, ReportPublish } from '../../services/reportpublish-administration.service';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { LabelService } from 'src/app/modules/rollout-management/services/label.service';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
  selector: 'app-reportpublish-form',
  standalone: false,
  templateUrl: './reportpublish-form.component.html',
  styleUrl: './reportpublish-form.component.css'
})
export class ReportPublishFormComponent implements OnInit, OnDestroy {

  mode: 'create' | 'edit' = 'create';
  reportPublishData: ReportPublish | null = null;
  reportPublishForm!: FormGroup;
  isSubmitting = false;
  mobileSidebarOpen = false;
  labels: string[] = [];
  selectedLabel: string | null = null;

  frequencyOptions = [
    { label: 'Once', value: 'once' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  templateOptions: any[] = [];
  filteredTemplateOptions: any[] = [];
  selectedTemplateMappingDate: Date | null = null;
  showReportSelectionDialog = false;
  reportSearchText = '';
  selectAll = false;
  selectedReports: any[] = [];

  private subs: Subscription[] = [];
  private editId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reportPublishService: ReportPublishAdministrationService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private filterService: FilterService,
    private labelService: LabelService,
    private responsive: ResponsiveService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.subs.push(
      this.labelService.selectedLabel$.subscribe(label => this.selectedLabel = label)
    );
    this.labelService.getAllLabels().subscribe({ next: labels => this.labels = labels });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.mode = 'edit';
        this.editId = id;
        // Use router state data if available (passed from table), else fetch from API
        const stateData = history.state?.reportPublishData as ReportPublish;
        if (stateData && (stateData._id || stateData.reportPublishId)) {
          this.reportPublishData = stateData;
          this.populateForm(stateData);
          this.loadTemplates();
        } else {
          this.loadForEdit(id);
        }
      } else {
        this.mode = 'create';
        this.loadTemplates();
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggleSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  onLabelChange(): void {
    this.labelService.setSelectedLabel(this.selectedLabel);
  }

  private initForm(): void {
    this.reportPublishForm = this.fb.group({
      pageName: [[], [Validators.required]],
      pageDescription: ['', Validators.maxLength(500)],
      publishPath: ['', [Validators.required]],
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

  private loadForEdit(id: string): void {
    this.spinner.show();
    this.reportPublishService.getReportPublishById(id).subscribe({
      next: (res: any) => {
        this.reportPublishData = res?.reportPublish || res;
        if (this.reportPublishData) {
          this.populateForm(this.reportPublishData);
        }
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load record', life: 3000 });
        this.goBack();
      }
    });
  }

  private populateForm(data: ReportPublish): void {
    let sendAfterDate = new Date();
    if (data.sendAfter) sendAfterDate = new Date(data.sendAfter);
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

  onSubmit(): void {
    if (this.reportPublishForm.invalid) {
      Object.values(this.reportPublishForm.controls).forEach(c => { c.markAsTouched(); c.markAsDirty(); });
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill in all required fields correctly', life: 3000 });
      return;
    }

    this.isSubmitting = true;
    this.spinner.show();
    const formData = { ...this.reportPublishForm.value };
    if (formData.sendAfter instanceof Date) formData.sendAfter = formData.sendAfter.toISOString();

    if (this.mode === 'create') {
      this.reportPublishService.createReportPublish(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.spinner.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Report publish entry created successfully', life: 3000 });
          this.goBack();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.spinner.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.response || 'Failed to create entry', life: 5000 });
        }
      });
    } else {
      const id = this.editId || this.reportPublishData?.reportPublishId || this.reportPublishData?._id;
      if (!id) { this.isSubmitting = false; this.spinner.hide(); return; }
      formData.modifiedBy = formData.createdBy || 'system';
      this.reportPublishService.updateReportPublish(id, formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.spinner.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Report publish entry updated successfully', life: 3000 });
          this.goBack();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.spinner.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.response || 'Failed to update entry', life: 5000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/reportPublishAdmin');
  }

  hasError(fieldName: string): boolean {
    const control = this.reportPublishForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  browseFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.messageService.add({ severity: 'info', summary: 'File Selected', detail: `Selected: ${file.name}. Please enter the full network/server path.`, life: 5000 });
      }
    };
    input.click();
  }

  loadTemplates(): void {
    const payload = { appId: this.filterService.currentApp?.appId || '', orgId: this.filterService.currentOrg?.orgId || '', templateType: 'Report Design' };
    this.http.post<any>('http://localhost:8080/idt/getTemplates', payload).subscribe({
      next: (response) => {
        if (response?.templates) {
          this.templateOptions = response.templates.map((t: any) => ({
            label: t.templateName, value: t.templateId || t._id,
            description: t.templateDescription, mappingUpdatedOn: t.mappingUpdatedOn,
            selected: false, fullData: t
          }));
          this.filteredTemplateOptions = [...this.templateOptions];
        }
      },
      error: (err) => console.error('Error loading templates:', err)
    });
  }

  openReportSelectionDialog(): void {
    this.showReportSelectionDialog = true;
    this.reportSearchText = '';
    this.filteredTemplateOptions = [...this.templateOptions];
    const currentSelection = this.reportPublishForm.get('pageName')?.value || [];
    this.templateOptions.forEach(opt => opt.selected = currentSelection.includes(opt.value));
    this.updateSelectAll();
  }

  closeReportSelectionDialog(): void {
    this.showReportSelectionDialog = false;
  }

  filterReports(): void {
    const s = this.reportSearchText.toLowerCase();
    this.filteredTemplateOptions = this.templateOptions.filter(opt =>
      opt.label.toLowerCase().includes(s) || (opt.description && opt.description.toLowerCase().includes(s))
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
    if (this.selectedReports.length > 0) {
      const last = this.selectedReports[this.selectedReports.length - 1];
      this.selectedTemplateMappingDate = last.mappingUpdatedOn ? new Date(last.mappingUpdatedOn) : null;
      this.reportPublishForm.patchValue({ pageDescription: last.description || '' });
    }
    this.closeReportSelectionDialog();
  }

  getSelectedReportsDisplay(): string {
    const selectedValues = this.reportPublishForm.get('pageName')?.value || [];
    if (selectedValues.length === 0) return '';
    // If templates are loaded, show labels; otherwise show raw values
    if (this.templateOptions.length > 0) {
      const matched = this.templateOptions.filter(opt => selectedValues.includes(opt.value)).map(opt => opt.label);
      return matched.length > 0 ? matched.join(', ') : selectedValues.join(', ');
    }
    return selectedValues.join(', ');
  }
}
