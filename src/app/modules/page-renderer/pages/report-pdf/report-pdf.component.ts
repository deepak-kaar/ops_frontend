import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageRendererComponent } from '../../page-renderer.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-report-pdf',
  standalone: false,
  templateUrl: './report-pdf.component.html',
  styleUrl: './report-pdf.component.css'
})

export class ReportPdfComponent extends PageRendererComponent implements OnInit, OnDestroy {

  appId!: string;
  orgId!: string;
  reportId!: string;

  loading: boolean = false;
  private subscribe$ = new Subject<void>();
  mappings: any[] = [];
  orderedMappings: any[] = [];
  selectedMapping: any = null;
  displayMappings: any[] = [];
  date1: Date = new Date(new Date().setDate(new Date().getDate() - 1));
  searchValue: string = '';
  constructor(
  router: Router,               
  private route: ActivatedRoute
) {
  super(router);                 
}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.appId = params.get('appId')!;
      this.orgId = params.get('orgId')!;
      this.reportId = params.get('reportId')!;


       this.isMobile$ = this.responsive.isMobile$();
          this.isTablet$ = this.responsive.isTablet$();
          this.loadMappings();
      
          this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
            if (event) {
              this.loadMappings();
            }
          });
      
          this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
            if (event) {
              this.loadMappings();
            }
          });
    });
  }

   ngOnDestroy() {
    this.subscribe$.next();
    this.subscribe$.complete();
  }

  /**
   * Loads templates from the service - uses 'Report Design' templateType
   * No role-based filtering for Reports (only MDE has authorization)
   */
  loadMappings() {
    this.loading = true;

    const payload = {
      appId: this.appId ?? '',
      orgId: this.orgId ?? '',
      templateType: 'Report Design'
    };

    this.pageRendererService.getTemplates(payload).subscribe({
      next: (res: any) => {
        this.mappings = res.templates || res.templateMappings || res.data || [];
        this.orderedMappings = [...this.mappings];

        // Preserve selection if possible; else auto-select first item (SAP-style master/detail)
        const currentId = this.reportId || '';
        if (currentId) {
          const match = this.orderedMappings.find(m => m.mappingId === currentId || m.templateId === currentId);
          this.selectedMapping = match || null;
        }
        if (!this.selectedMapping && this.displayMappings.length > 0) {
          this.selectMapping(this.displayMappings[0]);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Select a mapping and show its preview on the right panel
   */
  selectMapping(mapping: any) {
    this.selectedMapping = mapping;
  }

   /**
   * Check if an item is selected
   */
  isSelected(item: any): boolean {
    if (!item || !this.selectedMapping) return false;
    return (item.mappingId && item.mappingId === this.selectedMapping.mappingId) ||
           (item.templateId && item.templateId === this.selectedMapping.templateId) ||
           (item._id && item._id === this.selectedMapping._id);
  }

  
  /**
   * Get the ID for tracking and preview (handles both mappingId and templateId)
   */
  getItemId(item: any): string {
    return item?.mappingId || item?.templateId || item?._id || '';
  }

  /**
   * Filter the list by search term
   */
  applyListFilter() {
    const q = (this.searchValue || '').trim().toLowerCase();
    if (!q) {
      this.displayMappings = [...this.orderedMappings];
      return;
    }

    this.displayMappings = this.orderedMappings.filter(m => {
      const name = (m.mappingName || m.name || '').toString().toLowerCase();
      const desc = (m.mappingDescription || m.description || '').toString().toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }

    /**
   * Handle date change - triggers preview reload via input binding
   */
  onDateChange() {
    // Preview reloads automatically via input binding
  }
}
