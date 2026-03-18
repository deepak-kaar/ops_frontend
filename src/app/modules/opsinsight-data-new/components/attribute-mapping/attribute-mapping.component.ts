import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OpsinsightDataComponent } from '../../opsinsight-data.component';
import { catchError, finalize, forkJoin, map, Observable, of, Subscription } from 'rxjs';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { FilterNewComponent } from 'src/app/core/components/filter-new/filter-new.component';

@Component({
  selector: 'app-attribute-mapping',
  standalone: false,
  templateUrl: './attribute-mapping.component.html',
  styleUrl: './attribute-mapping.component.css'
})
export class AttributeMappingComponent extends OpsinsightDataComponent implements OnInit {
  customerId: string = '';
  customerName: string = '';
  attributes$!: Observable<any[]>;
  mappedAttributes$!: Observable<any[]>;
  selectedAttributes: any[] = [];
  allAttributes: any[] = [];
  mappedAttributeIds: Set<string> = new Set();
  private filterSubscriptions: Subscription[] = [];

  constructor(
    public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private filterService: FilterService
  ) {
    super();
    this.customerId = this.dialogConfig.data?.customerId || '';
    this.customerName = this.dialogConfig.data?.customerName || '';
  }

  override ngOnInit(): void {
    super.ngOnInit();
    
    // Subscribe to filter changes
    this.filterSubscriptions.push(
      this.filterService.selectedApp$.subscribe(() => {
        this.loadAttributes();
      })
    );

    this.filterSubscriptions.push(
      this.filterService.selectedOrg$.subscribe(() => {
        this.loadAttributes();
      })
    );

    this.loadAttributes();
    
    // If existing attributes are passed, pre-select them
    if (this.dialogConfig.data?.existingAttributes) {
      this.selectedAttributes = [...this.dialogConfig.data.existingAttributes];
    } else if (this.customerId) {
      this.loadMappedAttributes();
    }
  }

  ngOnDestroy(): void {
    this.filterSubscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAttributes(): void {
    this.spinner.show();
    
    const selectedApp = this.filterService.currentApp;
    const selectedOrg = this.filterService.currentOrg;
    
    const appId = selectedApp?.appId || '';
    const orgId = selectedOrg?.orgId || '';
    
    // Fetch all attributes dynamically from database
    this.attributes$ = this.opsinsightDataService.getAttributes(appId || undefined, orgId || undefined).pipe(
      map((res: any) => {
        // Extract attributes from response - backend returns { token, response, attributes }
        const attributes = res?.attributes || res?.result || res?.data || [];
        
        // Map all attributes with useful fields
        return attributes.map((attr: any) => ({
          _id: attr._id,
          attributeId: attr.attributeId,
          attributeName: attr.attributeName || 'N/A',
          minValue: attr.minValue || 'N/A',
          maxValue: attr.maxValue || 'N/A',
          comments: attr.comments || 'N/A',
          value: attr.value,
          entityOrInstanceId: attr.entityOrInstanceId,
          isActive: attr.isActive !== undefined ? attr.isActive : true,
          displayName: attr.attributeName || 'N/A'
        }));
      }),
      catchError((err) => {
        console.error('Error loading attributes:', err);
        return of([]);
      }),
      finalize(() => this.spinner.hide())
    );

    this.attributes$.subscribe(attrs => {
      this.allAttributes = attrs;
      // Update selectAll state
      this.selectAll = attrs.length > 0 && this.selectedAttributes.length === attrs.length;
    });
  }

  loadMappedAttributes(): void {
    if (!this.customerId) return;

    this.opsinsightDataService.getCustomerAttributes(this.customerId).subscribe({
      next: (res: any) => {
        const mapped = res?.result || res?.data || [];
        this.mappedAttributeIds = new Set(mapped.map((m: any) => m.attributeId || m._id));
        // Pre-select mapped attributes
        this.selectedAttributes = mapped;
      },
      error: (err) => {
        console.error('Error loading mapped attributes:', err);
        this.mappedAttributeIds = new Set();
      }
    });
  }

  onAttributeToggle(attribute: any, event: any): void {
    if (event.checked) {
      if (!this.selectedAttributes.find(a => (a.attributeId || a._id) === (attribute.attributeId || attribute._id))) {
        this.selectedAttributes.push(attribute);
      }
    } else {
      this.selectedAttributes = this.selectedAttributes.filter(
        a => (a.attributeId || a._id) !== (attribute.attributeId || attribute._id)
      );
    }
    // Update selectAll state
    this.selectAll = this.allAttributes.length > 0 && this.selectedAttributes.length === this.allAttributes.length;
  }

  isAttributeSelected(attribute: any): boolean {
    return this.selectedAttributes.some(
      a => (a.attributeId || a._id) === (attribute.attributeId || attribute._id)
    );
  }

  selectAll: boolean = false;

  toggleSelectAll(event: any): void {
    const checked = event.checked;
    this.selectAll = checked;
    if (checked) {
      // Select all attributes
      this.selectedAttributes = [...this.allAttributes];
    } else {
      // Deselect all
      this.selectedAttributes = [];
    }
  }

  saveMapping(): void {
    // If mode is 'selection', just return the selected attributes without saving to backend
    if (this.dialogConfig.data?.mode === 'selection') {
      const payload = {
        attributes: this.selectedAttributes.map(attr => ({
          _id: attr._id,
          attributeId: attr.attributeId,
          attributeName: attr.attributeName || attr.displayName,
          value: attr.value,
          code: attr.code || attr.value,
          entityOrInstanceId: attr.entityOrInstanceId,
          isActive: attr.isActive
        }))
      };
      this.ref.close({ status: true, data: payload });
      return;
    }

    // Original behavior: save to backend if customerId exists
    if (!this.customerId) {
      this.showToast('error', 'Error', 'Customer ID is required', 2000, false);
      return;
    }

    const payload = {
      attributes: this.selectedAttributes.map(attr => ({
        _id: attr._id,
        attributeId: attr.attributeId,
        attributeName: attr.attributeName || attr.displayName,
        value: attr.value,
        code: attr.code || attr.value,
        entityOrInstanceId: attr.entityOrInstanceId,
        isActive: attr.isActive
      }))
    };

    this.spinner.show();
    this.opsinsightDataService.postCustomerAttributes(this.customerId, payload).subscribe({
      next: (res: any) => {
        this.showToast('success', 'Success', 'Attributes mapped successfully', 2000, false);
        this.ref.close({ status: true, data: payload });
      },
      error: (err) => {
        this.showToast('error', 'Error', 'Failed to map attributes', 2000, false);
        console.error('Error mapping attributes:', err);
      },
      complete: () => {
        this.spinner.hide();
      }
    });
  }

  cancel(): void {
    this.ref.close({ status: false });
  }
}
