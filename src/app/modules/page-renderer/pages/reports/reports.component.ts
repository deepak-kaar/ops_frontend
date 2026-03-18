import { Component, OnInit, OnDestroy, ViewEncapsulation, inject } from '@angular/core';
import { PageRendererService } from '../../services/page-renderer.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { PageRendererComponent } from '../../page-renderer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ReportsComponent extends PageRendererComponent implements OnInit, OnDestroy {

  loading: boolean = false;
  mappings: any[] = [];
  orderedMappings: any[] = [];
  displayMappings: any[] = [];
  selectedMapping: any = null;
  searchValue: string = '';
  date1: Date = new Date(new Date().setDate(new Date().getDate() - 1));

  private subscribe$ = new Subject<void>();

  ngOnInit() {
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
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? '',
      templateType: 'Report Design'
    };

    this.pageRendererService.getTemplates(payload).subscribe({
      next: (res: any) => {
        this.mappings = res.templates || res.templateMappings || res.data || [];
        this.orderedMappings = [...this.mappings];
        this.applyListFilter();

        // Preserve selection if possible; else auto-select first item (SAP-style master/detail)
        const currentId = this.selectedMapping?.mappingId || this.selectedMapping?.templateId;
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
   * Handle date change - triggers preview reload via input binding
   */
  onDateChange() {
    // Preview reloads automatically via input binding
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
}
