import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DeleteConfirmationDialogComponent, DeleteConfirmationDialogResult } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { Observable, combineLatest, tap, debounceTime, takeUntil, Subject } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { 
  breakPointForToastComponent, 
  ROUTES, 
  TOAST_MESSAGES, 
  ENTITY_STATUSES,
  FILTER_DEBOUNCE_TIME 
} from '../../../shared/constants/datapoint.constants';
import { Entity, FilterPayload } from '../../../shared/interfaces/datapoint.interfaces';
import { TableColumn, TableAction, TableConfig } from 'src/app/core/components/table-wrapper/table-wrapper.component';

/**
 * Entity List Component
 * Displays and manages the list of entities with CRUD operations
 * 
 * Optimized with:
 * - Centralized constants
 * - Typed interfaces
 * - Proper subscription management with takeUntil
 * - Reduced code duplication
 */
@Component({
  selector: 'app-entity-new',
  standalone: false,
  templateUrl: './entity-new.component.html',
  styleUrl: './entity-new.component.css'
})
export class EntityNewComponent {
  @Input() appId: any;
  
  // UI State
  isshowUI = false;
  
  // Data
  entityList: Entity[] = [];
  app: string | null = null;
  org: string | null = null;
  
  // Constants - spread to create mutable array for PrimeNG components
  statuses = [...ENTITY_STATUSES];
  readonly breakPointForToastComponent = breakPointForToastComponent;
  
  // Observables
  isMobile$!: Observable<boolean>;
  
  // Table configuration
  columns: TableColumn[] = [
    { field: 'entityName', header: 'Name', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'entityDesc', header: 'Description', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'InstanceCount', header: 'Instance Count', sortable: true, filterable: true, filterType: 'numeric', minWidth: '10rem', template: 'count' },
    { field: 'entityLevel', header: 'Entity Level', sortable: true, filterable: true, filterType: 'select', filterOptions: [...ENTITY_STATUSES], minWidth: '10rem', template: 'tag' }
  ];
  
  actions: TableAction[] = [
    { icon: 'pi pi-pencil', tooltip: 'Edit', severity: 'info', action: 'edit' },
    { icon: 'pi pi-trash', tooltip: 'Delete', severity: 'danger', action: 'delete' },
    { icon: 'pi pi-cog', tooltip: 'EntityData', severity: 'info', action: 'entityData' }
  ];
  
  tableConfig: TableConfig = {
    dataKey: 'id',
    rows: 20,
    rowsPerPageOptions: [20, 30, 50],
    paginator: true,
    globalFilterFields: ['entityName', 'entityDesc', 'entityLevel', 'status'],
    rowHover: true,
    emptyMessage: 'No entitys found.',
    showCaption: true,
    showSearch: true,
    showClearFilter: true,
    searchPlaceholder: 'Search...',
    createButtonLabel: 'Create Entity / Schema',
    createButtonIcon: 'pi pi-plus',
    showCreateButton: true,
    showMobileView: true,
    mobileCardFields: {
      title: 'entityName',
      subtitle: 'entityDesc',
      stats: [
        { label: 'Instances', field: 'InstanceCount' },
        { label: 'Level', field: 'entityLevel' }
      ]
    }
  };
  
  // Subscription management
  private readonly destroy$ = new Subject<void>();

  constructor(
    private dataPointService: DatapointAdministrationService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private router: Router,
    public dialogService: DialogService,
    private activateRoute: ActivatedRoute,
    private filter: FilterService,
    private responsive: ResponsiveService
  ) {
    this.activateRoute.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe((params: any) => {
      this.appId = params.params.id;
    });
  }

  ngOnInit(): void {
    this.initializeFilterSubscription();
    this.isMobile$ = this.responsive.isMobile$();
  }

  /**
   * Initialize filter subscription for app/org changes
   */
  private initializeFilterSubscription(): void {
    combineLatest([
      this.filter.selectedApp$,
      this.filter.selectedOrg$
    ]).pipe(
      tap(() => this.spinner.show()),
      debounceTime(FILTER_DEBOUNCE_TIME),
      takeUntil(this.destroy$)
    ).subscribe(([app, org]) => {
      this.app = app;
      this.org = org;
      this.getEntityList();
    });
  }

  /**
   * Build payload for API calls
   */
  private buildPayload(): FilterPayload {
    return {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };
  }

  /**
   * Fetch entity list from server
   */
  getEntityList(): void {
    this.dataPointService.getEntityList(this.buildPayload()).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.entityList = res.Entity_Attributes || [];
        this.isshowUI = true;
      },
      error: () => {
        this.spinner.hide();
      }
    });
  }

  /**
   * Navigate to entity data page
   */
  onButtonClick(entity: Entity): void {
    this.router.navigate([ROUTES.ENTITY_DATA, entity.entityId]);
  }

  /**
   * Navigate to create entity page
   */
  createEntity(): void {
    this.router.navigateByUrl(ROUTES.ENTITY_CREATE, {
      state: { appId: this.app, orgId: this.org }
    });
  }

  /**
   * Navigate to edit entity page
   */
  editEntity(entity: Entity): void {
    this.router.navigateByUrl(ROUTES.ENTITY_EDIT, {
      state: {
        appId: this.app,
        orgId: this.org,
        entityData: entity
      }
    });
  }

  deleteEntity(entity: Entity): void {
    const ref = this.dialogService.open(DeleteConfirmationDialogComponent, {
      showHeader: false,
      closable: false,
      modal: true,
      dismissableMask: true,
      styleClass: 'delete-confirmation-modal',
      width: '460px',
      data: {
        entityLabel: 'Entity',
        itemName: entity.entityName ?? '',
        title: 'Delete Entity',
        subtitle: 'This action cannot be undone',
        confirmText: 'Delete Entity',
        cancelText: 'Cancel'
      }
    });

    ref.onClose.subscribe((result?: DeleteConfirmationDialogResult) => {
      if (result?.confirmed) this.executeDelete(entity.entityId);
    });
  }

  /**
   * Execute delete operation
   */
  private executeDelete(entityId: string): void {
    this.spinner.show();
    this.dataPointService.deleteEntity(entityId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.spinner.hide();
        this.messageService.add(TOAST_MESSAGES.DELETE_SUCCESS('Entity'));
        this.getEntityList();
      },
      error: () => {
        this.spinner.hide();
        this.messageService.add(TOAST_MESSAGES.DELETE_ERROR('Entity'));
      }
    });
  }

  /**
   * Handle row click
   */
  onRowClick(entity: Entity): void {
    this.openEntity(entity.entityId);
  }

  /**
   * Handle action button click
   */
  onAction(event: { action: string; row: Entity }): void {
    const { action, row } = event;
    switch (action) {
      case 'edit':
        this.editEntity(row);
        break;
      case 'delete':
        this.deleteEntity(row);
        break;
      case 'entityData':
        this.onButtonClick(row);
        break;
    }
  }

  /**
   * Open entity details (placeholder for future implementation)
   */
  openEntity(entityId: string): void {
    // TODO: Implement entity details navigation
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByEntityId(index: number, entity: Entity): string {
    return entity.entityId;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
