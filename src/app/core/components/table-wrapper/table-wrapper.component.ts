import { Component, Input, Output, EventEmitter, ViewChild, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';

/**
 * Column configuration interface
 */
export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'numeric' | 'date' | 'select';
  filterOptions?: any[] | readonly any[];
  minWidth?: string;
  template?: string; // 'text', 'date', 'tag', 'count', 'custom'
  styleClass?: string;
  clickable?: boolean;
}

/**
 * Action button configuration interface
 */
export interface TableAction {
  icon: string;
  tooltip: string;
  severity?: 'info' | 'danger' | 'secondary' | 'success' | 'warn' | 'help' | 'primary' | 'contrast';
  action: string; // Action identifier
  visible?: (row: any) => boolean;
}

/**
 * Table configuration interface
 */
export interface TableConfig {
  dataKey?: string;
  rows?: number;
  rowsPerPageOptions?: number[];
  paginator?: boolean;
  globalFilterFields?: string[];
  selectionMode?: 'single' | 'multiple' | null;
  rowHover?: boolean;
  emptyMessage?: string;
  showCaption?: boolean;
  showSearch?: boolean;
  showClearFilter?: boolean;
  searchPlaceholder?: string;
  createButtonLabel?: string;
  createButtonIcon?: string;
  showCreateButton?: boolean;
  showMobileView?: boolean;
  mobileCardFields?: {
    title: string;
    subtitle?: string;
    stats?: { label: string; field: string }[];
  };
}

@Component({
  selector: 'app-table-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    TagModule,
    SelectModule
  ],
  templateUrl: './table-wrapper.component.html',
  styleUrl: './table-wrapper.component.css'
})
export class TableWrapperComponent {
  @ViewChild('dt') dt!: Table;

  // Data inputs
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() config: TableConfig = {};
  @Input() loading: boolean = false;
  @Input() isMobile: boolean = false;
  @Input() selectedItem: any = null;

  // Custom templates
  @ContentChild('bodyTemplate') bodyTemplate!: TemplateRef<any>;
  @ContentChild('headerTemplate') headerTemplate!: TemplateRef<any>;
  @ContentChild('mobileCardTemplate') mobileCardTemplate!: TemplateRef<any>;
  @ContentChild('captionLeftTemplate') captionLeftTemplate!: TemplateRef<any>;
  @ContentChild('captionRightTemplate') captionRightTemplate!: TemplateRef<any>;

  // Output events
  @Output() onCreate = new EventEmitter<void>();
  @Output() onRowClick = new EventEmitter<any>();
  @Output() onRowSelect = new EventEmitter<any>();
  @Output() onRowUnselect = new EventEmitter<any>();
  @Output() onAction = new EventEmitter<{ action: string; row: any }>();
  @Output() selectedItemChange = new EventEmitter<any>();

  // Internal state
  searchValue: string = '';

  // Default configuration
  get tableConfig(): TableConfig {
    return {
      dataKey: 'id',
      rows: 20,
      rowsPerPageOptions: [20, 30, 50],
      paginator: true,
      globalFilterFields: [],
      selectionMode: null,
      rowHover: true,
      emptyMessage: 'No records found.',
      showCaption: true,
      showSearch: true,
      showClearFilter: true,
      searchPlaceholder: 'Search...',
      createButtonLabel: 'Create',
      createButtonIcon: 'pi pi-plus',
      showCreateButton: true,
      showMobileView: true,
      ...this.config
    };
  }

  /**
   * Apply global filter
   */
  applyFilterGlobal(event: Event, matchMode: string): void {
    const value = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(value, matchMode);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.dt?.clear();
    this.searchValue = '';
  }

  /**
   * Handle row click
   */
  handleRowClick(row: any): void {
    this.onRowClick.emit(row);
  }

  /**
   * Handle row selection
   */
  handleRowSelect(event: any): void {
    this.selectedItemChange.emit(event.data);
    this.onRowSelect.emit(event);
  }

  /**
   * Handle row unselection
   */
  handleRowUnselect(event: any): void {
    this.selectedItemChange.emit(null);
    this.onRowUnselect.emit(event);
  }

  /**
   * Handle action button click
   */
  handleAction(action: string, row: any, event: Event): void {
    event.stopPropagation();
    this.onAction.emit({ action, row });
  }

  /**
   * Handle create button click
   */
  handleCreate(): void {
    this.onCreate.emit();
}

  /**
   * Get cell value from row
   */
  getCellValue(row: any, field: string): any {
    const keys = field.split('.');
    let value = row;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }

  /**
   * Convert readonly array to mutable array for p-select
   */
  getFilterOptions(options: any[] | readonly any[] | undefined): any[] | undefined {
    if (!options) return undefined;
    return Array.isArray(options) ? [...options] : undefined;
  }

  /**
   * Check if action is visible
   */
  isActionVisible(action: TableAction, row: any): boolean {
    if (action.visible) {
      return action.visible(row);
    }
    return true;
  }

  /**
   * Track by function for ngFor
   */
  trackByFn(index: number, item: any): any {
    return item[this.tableConfig.dataKey || 'id'] || index;
  }
}
