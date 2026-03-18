import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Table } from 'primeng/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { PageAdministratorService } from '../../page-administrator.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PageMappingModalComponent } from '../dialogs/page-mapping-modal/page-mapping-modal.component';
import { PagePreviewComponent } from '../dialogs/page-preview/page-preview.component';

@Component({
  selector: 'app-page-mapping',
  standalone: false,
  templateUrl: './page-mapping.component.html',
  styleUrl: './page-mapping.component.css'
})
export class PageMappingComponent implements OnInit, OnChanges {
  @Input() templateId?: string;
  @Input() app?: string;
  @Input() org?: string;
  
  template: any;
  mappings: any[] = [];
  searchValue: any;
  
  /**
   * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
   */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  appRef!: DynamicDialogRef;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private pageAdminService: PageAdministratorService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Get templateId from route params if not provided as input
    this.route.params.subscribe(params => {
      if (params['templateId'] && !this.templateId) {
        this.templateId = params['templateId'];
        if (this.templateId) {
          this.loadData();
        }
      }
    });

    // Get templateId from query params
    this.route.queryParams.subscribe(params => {
      if (params['templateId'] && !this.templateId) {
        this.templateId = params['templateId'];
        if (this.templateId) {
          this.loadData();
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['templateId'] && !changes['templateId'].firstChange) {
      this.loadData();
    } else if (this.templateId) {
      this.loadData();
    }
  }

  ngOnInit(): void {
    // If templateId is provided as input, load data immediately
    if (this.templateId) {
      this.loadData();
    }
  }

  /**
   * Loads template details and mappings
   */
  loadData(): void {
    if (!this.templateId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Template ID is required',
        life: 3000
      });
      return;
    }

    this.spinner.show();
    
    // Load template details
    this.pageAdminService.getTemplate(this.templateId).subscribe({
      next: (res: any) => {
        this.template = res.template || res;
        this.getMappings();
      },
      error: (err) => {
        console.error('Error loading template:', err);
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load template details',
          life: 3000
        });
      }
    });
  }

  /**
   * Fetches template mappings
   */
  getMappings(): void {
    if (!this.templateId) {
      return;
    }

    this.pageAdminService.getTemplateMappings({ templateId: this.templateId }).subscribe({
      next: (res: any) => {
        this.mappings = res.templateMappings || res.mappings || res || [];
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error loading template mappings:', err);
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load template mappings',
          life: 3000
        });
      }
    });
  }

  /**
   * Opens create mapping dialog
   */
  createMapping(): void {
    if (!this.template) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Template details not loaded. Please wait...',
        life: 3000
      });
      return;
    }

    this.appRef = this.dialog.open(PageMappingModalComponent, {
      header: 'Create Template Mapping',
      modal: true,
      closable: true,
      maximizable: true,
      width: '95rem',
      data: {
        template: this.template,
        mode: 'create',
        appData: {
          appId: this.app || this.template?.appId,
          orgId: this.org || this.template?.orgId
        }
      }
    });

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status === 200) {
        this.getMappings();
      }
    });
  }

  /**
   * Opens edit mapping dialog
   */
  openMapping(mapping: any): void {
    if (!this.template) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Template details not loaded. Please wait...',
        life: 3000
      });
      return;
    }

    // Load full mapping details if needed
    const mappingId = mapping.mappingId || mapping._id || mapping.id;
    if (mappingId) {
      this.spinner.show();
      this.pageAdminService.getTemplateMapping(mappingId).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          const mappingData = res.mapping || res;
          
          // Merge template data with mapping data
          // The mapping will have inputSchema with mappings applied
          const templateWithMapping = {
            ...this.template,
            // Include mapping fields
            mappingId: mappingId,
            name: mappingData.name || mappingData.mappingName,
            mappingName: mappingData.name || mappingData.mappingName,
            description: mappingData.description || mappingData.mappingDescription,
            mappingDescription: mappingData.description || mappingData.mappingDescription,
            // Use mapping's inputSchema if available (contains mappings), otherwise use template's
            inputSchema: mappingData.inputSchema || this.template?.inputSchema || this.template?.templateObj?.inputSchema,
            // Include other mapping properties for backward compatibility
            propertyMappings: mappingData.propertyMappings,
            ...mappingData
          };
          
          this.appRef = this.dialog.open(PageMappingModalComponent, {
            header: 'Edit Template Mapping',
            modal: true,
            closable: true,
            maximizable: true,
            width: '95rem',
            data: {
              template: templateWithMapping,
              mode: 'edit',
              appData: {
                appId: this.app || this.template?.appId || mappingData.appId,
                orgId: this.org || this.template?.orgId || mappingData.orgId
              }
            }
          });

          this.appRef.onClose.subscribe((res: any) => {
            if (res?.status === 200) {
              this.getMappings();
            }
          });
        },
        error: (err) => {
          this.spinner.hide();
          console.error('Error loading mapping details:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load mapping details',
            life: 3000
          });
        }
      });
    } else {
      // If no mapping ID, open with basic mapping data
      // Merge template with mapping data
      const templateWithMapping = {
        ...this.template,
        name: mapping.name || mapping.mappingName,
        mappingName: mapping.name || mapping.mappingName,
        description: mapping.description || mapping.mappingDescription,
        mappingDescription: mapping.description || mapping.mappingDescription,
        // Use mapping's inputSchema if available, otherwise use template's
        inputSchema: mapping.inputSchema || this.template?.inputSchema || this.template?.templateObj?.inputSchema,
        propertyMappings: mapping.propertyMappings,
        ...mapping
      };
      
      this.appRef = this.dialog.open(PageMappingModalComponent, {
        header: 'Edit Template Mapping',
        modal: true,
        closable: true,
        maximizable: true,
        width: '95rem',
        data: {
          template: templateWithMapping,
          mode: 'edit',
          appData: {
            appId: this.app || this.template?.appId || mapping.appId,
            orgId: this.org || this.template?.orgId || mapping.orgId
          }
        }
      });

      this.appRef.onClose.subscribe((res: any) => {
        if (res?.status === 200) {
          this.getMappings();
        }
      });
    }
  }

  /**
   * Opens the mapped page in renderer view
   */
  viewMappedPage(mapping: any): void {
    const mappingId = mapping.mappingId || mapping._id || mapping.id;
    if (!mappingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Mapping ID not found',
        life: 3000
      });
      return;
    }

    // Navigate to page renderer with only mappingId
    // The renderer will fetch the mapping and then the template
    this.router.navigate(['/pages/preview', mappingId], {
      queryParams: {
        mappingId: mappingId
      }
    });
  }

  /**
   * Opens preview dialog for the template (at header level)
   */
  previewTemplate(): void {
    if (!this.template) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Template details not loaded. Please wait...',
        life: 3000
      });
      return;
    }

    // Open preview with template data
    this.appRef = this.dialog.open(PagePreviewComponent, {
      header: 'Page Preview',
      modal: true,
      closable: true,
      maximizable: true,
      width: '95vw',
      height: '90vh',
      data: {
        template: this.template
      }
    });
  }

  /**
   * Opens preview dialog with sample data selection for a specific mapping
   */
  previewPage(mapping: any): void {
    if (!this.template) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Template details not loaded. Please wait...',
        life: 3000
      });
      return;
    }

    // Load full mapping details if needed
    const mappingId = mapping.mappingId || mapping._id || mapping.id;
    if (mappingId) {
      this.spinner.show();
      this.pageAdminService.getTemplateMapping(mappingId).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          const mappingData = res.mapping || res;
          
          // Merge template with mapping data for preview
          const templateForPreview = {
            ...this.template,
            ...mappingData,
            designObject: mappingData.designObject || this.template?.designObject || this.template?.templateObj?.designObject,
            displayComponent: mappingData.displayComponent || this.template?.displayComponent || this.template?.templateObj?.displayComponent,
            dataObject: mappingData.dataObject || this.template?.dataObject || this.template?.templateObj?.dataObject,
            sampleData: mappingData.sampleData || this.template?.sampleData || this.template?.templateObj?.sampleData
          };
          
          this.appRef = this.dialog.open(PagePreviewComponent, {
            header: 'Page Preview',
            modal: true,
            closable: true,
            maximizable: true,
            width: '95vw',
            height: '90vh',
            data: {
              template: templateForPreview
            }
          });
        },
        error: (err) => {
          this.spinner.hide();
          console.error('Error loading mapping for preview:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load mapping for preview',
            life: 3000
          });
        }
      });
    } else {
      // Use template directly if no mapping ID
      this.appRef = this.dialog.open(PagePreviewComponent, {
        header: 'Page Preview',
        modal: true,
        closable: true,
        maximizable: true,
        width: '95vw',
        height: '90vh',
        data: {
          template: this.template
        }
      });
    }
  }

  /**
   * Deletes a mapping
   */
  deleteMapping(mapping: any, event: Event): void {
    event.stopPropagation();
    
    const mappingId = mapping.mappingId || mapping._id || mapping.id;
    const mappingName = mapping.mappingName || mapping.name || 'this mapping';

    if (!mappingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Mapping ID not found',
        life: 3000
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${mappingName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.spinner.show();
        this.pageAdminService.deleteTemplateMapping(mappingId).subscribe({
          next: () => {
            this.spinner.hide();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Mapping deleted successfully',
              life: 3000
            });
            this.getMappings();
          },
          error: (err) => {
            this.spinner.hide();
            console.error('Error deleting mapping:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete mapping',
              life: 3000
            });
          }
        });
      }
    });
  }

  /**
   * Applies global filter to table
   */
  applyFilterGlobal(event: any, matchMode: string): void {
    // Implementation for table filtering
  }

  /**
   * Clears table filters
   */
  clear(table: Table): void {
    table.clear();
    this.searchValue = '';
  }
}
