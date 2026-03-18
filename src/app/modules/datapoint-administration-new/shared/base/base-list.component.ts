import { Directive, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { combineLatest, debounceTime, Observable, Subject, Subscription, tap, takeUntil } from 'rxjs';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { 
  breakPointForToastComponent, 
  FILTER_DEBOUNCE_TIME, 
  TOAST_MESSAGES 
} from '../constants/datapoint.constants';
import { FilterPayload, NavigationState } from '../interfaces/datapoint.interfaces';

/**
 * Base class for list components
 * Provides common functionality to reduce code duplication
 * 
 * @example
 * export class EntityListComponent extends BaseListComponent<Entity> {
 *   protected itemType = 'Entity';
 *   protected getListMethod = 'getEntityList';
 *   protected deleteMethod = 'deleteEntity';
 *   protected listResponseKey = 'Entity_Attributes';
 *   protected idField = 'entityId';
 * }
 */
@Directive()
export abstract class BaseListComponent<T = any> implements OnInit, OnDestroy {
  // Injected services using inject() for cleaner code
  protected readonly router = inject(Router);
  protected readonly spinner = inject(NgxSpinnerService);
  protected readonly messageService = inject(MessageService);
  protected readonly confirmationService = inject(ConfirmationService);
  protected readonly filterService = inject(FilterService);
  protected readonly responsiveService = inject(ResponsiveService);
  protected readonly datapointService = inject(DatapointAdministrationService);

  // ViewChild for table reference
  @ViewChild('dt') dt: Table | undefined;

  // Common properties
  isShowUI = false;
  searchValue = '';
  app: string | null = null;
  org: string | null = null;
  items: T[] = [];
  selectedItem: T | null = null;
  isMobile$!: Observable<boolean>;

  // Subscription management
  protected readonly destroy$ = new Subject<void>();
  protected subscriptions: Subscription[] = [];

  // Toast breakpoint config
  readonly breakPointForToastComponent: { [key: string]: any } = breakPointForToastComponent;

  // Abstract properties - must be implemented by child classes
  protected abstract readonly itemType: string;
  protected abstract readonly listResponseKey: string;
  protected abstract readonly idField: keyof T;
  
  // Optional: Override these methods in child classes for custom behavior
  protected abstract fetchList(): Observable<any>;
  protected abstract getDeleteMethod(id: string): Observable<any>;
  protected abstract getCreateRoute(): string;
  protected abstract getEditRoute(): string;

  ngOnInit(): void {
    this.initializeFilterSubscription();
    this.isMobile$ = this.responsiveService.isMobile$();
    this.onInit();
  }

  /**
   * Hook for child classes to add custom initialization logic
   */
  protected onInit(): void {}

  /**
   * Initialize the filter subscription for app/org changes
   */
  protected initializeFilterSubscription(): void {
    combineLatest([
      this.filterService.selectedApp$,
      this.filterService.selectedOrg$
    ]).pipe(
      tap(() => this.spinner.show()),
      debounceTime(FILTER_DEBOUNCE_TIME),
      takeUntil(this.destroy$)
    ).subscribe(([app, org]) => {
      this.app = app;
      this.org = org;
      this.loadList();
    });
  }

  /**
   * Build filter payload from app/org
   */
  protected buildPayload(): FilterPayload {
    return {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };
  }

  /**
   * Load the list data
   */
  loadList(): void {
    this.fetchList().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.items = res[this.listResponseKey] || [];
        this.isShowUI = true;
        this.onListLoaded();
      },
      error: (err) => {
        this.spinner.hide();
        console.error(`Failed to load ${this.itemType} list:`, err);
      }
    });
  }

  /**
   * Hook for child classes after list is loaded
   */
  protected onListLoaded(): void {}

  /**
   * Navigate to create page
   */
  create(): void {
    this.router.navigateByUrl(this.getCreateRoute(), {
      state: this.buildNavigationState()
    });
  }

  /**
   * Navigate to edit page
   */
  edit(item: T, event?: Event): void {
    event?.stopPropagation();
    this.router.navigateByUrl(this.getEditRoute(), {
      state: this.buildNavigationState({ item, isEdit: true })
    });
  }

  /**
   * Delete an item with confirmation
   */
  delete(item: T, event?: Event): void {
    event?.stopPropagation();
    const id = item[this.idField] as string;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this ${this.itemType.toLowerCase()}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => this.executeDelete(id)
    });
  }

  /**
   * Execute the delete operation
   */
  protected executeDelete(id: string): void {
    this.spinner.show();
    this.getDeleteMethod(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.spinner.hide();
        this.messageService.add(TOAST_MESSAGES.DELETE_SUCCESS(this.itemType));
        this.loadList();
      },
      error: () => {
        this.spinner.hide();
        this.messageService.add(TOAST_MESSAGES.DELETE_ERROR(this.itemType));
      }
    });
  }

  /**
   * Build navigation state for routing
   */
  protected buildNavigationState(extra: Record<string, any> = {}): NavigationState {
    return {
      appId: this.app,
      orgId: this.org,
      ...extra
    };
  }

  /**
   * Apply global filter to table
   */
  applyFilterGlobal(event: Event, matchMode: string): void {
    const value = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(value, matchMode);
  }

  /**
   * Clear all filters
   */
  clear(): void {
    this.searchValue = '';
    this.dt?.clear();
  }

  /**
   * Track by function for ngFor optimization
   */
  trackById(index: number, item: T): any {
    return item[this.idField] || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
