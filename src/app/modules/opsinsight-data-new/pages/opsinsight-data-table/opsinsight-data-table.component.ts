import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OpsinsightDataComponent } from '../../opsinsight-data.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { BehaviorSubject, catchError, combineLatest, finalize, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ManageCustomerComponent } from '../../components/manage-customer/manage-customer.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CustomerAccessDialogComponent } from '../../components/customer-access-dialog/customer-access-dialog.component';
import { TableColumn, TableAction, TableConfig } from 'src/app/core/components/table-wrapper/table-wrapper.component';

@Component({
  selector: 'app-opsinsight-data-table',
  standalone: false,
  templateUrl: './opsinsight-data-table.component.html',
  styleUrl: './opsinsight-data-table.component.css'
})
export class OpsinsightDataTableComponent extends OpsinsightDataComponent implements OnInit {
  appRef!: DynamicDialogRef;

  private subscribe$ = new Subject<void>();
  searchValue: any = '';
  isLoading: boolean = false;

  customer_data$!: Observable<any>;
  filteredCustomers$!: Observable<any>;
  private search$ = new BehaviorSubject<string>('');
  selectedCustomer: any[] = [];
  activeCustomer: any;
  isDeepLinkMode: boolean = false;
  
  // Table configuration
  columns: TableColumn[] = [
    { field: 'consumerName', header: 'Consumer Name', sortable: true, filterable: false, minWidth: '12rem' },
    { field: 'consumerShortName', header: 'Consumer Short Name', sortable: true, filterable: false, minWidth: '12rem' },
    { field: 'consumerOrg', header: 'Consumer Org', sortable: true, filterable: false, minWidth: '10rem' },
    { field: 'consumerSupport', header: 'Consumer Support', sortable: true, filterable: false, minWidth: '12rem' },
    { field: 'createdBy', header: 'Created By', sortable: true, filterable: false, minWidth: '10rem' },
    { field: 'createdDate', header: 'Created Date', sortable: true, filterable: false, minWidth: '12rem' },
    { field: 'modifiedBy', header: 'Modified By', sortable: true, filterable: false, minWidth: '10rem' },
    { field: 'modifiedDate', header: 'Modified Date', sortable: true, filterable: false, minWidth: '12rem' },
    { field: 'isActive', header: 'Is Active', sortable: true, filterable: false, minWidth: '8rem', template: 'custom' },
    { field: 'lastRunDate', header: 'Last Run Date', sortable: true, filterable: false, minWidth: '12rem' },
    { field: 'lastRunStatus', header: 'Last Run Status', sortable: true, filterable: false, minWidth: '12rem' }
  ];
  
  actions: TableAction[] = [
    { icon: 'pi pi-pencil', tooltip: 'Edit', severity: 'info', action: 'edit' },
    { icon: 'pi pi-trash', tooltip: 'Delete', severity: 'danger', action: 'delete' }
  ];
  
  tableConfig: TableConfig = {
    dataKey: '_id',
    rows: 20,
    rowsPerPageOptions: [20, 30, 50],
    paginator: true,
    globalFilterFields: ['consumerName', 'consumerShortName', 'consumerOrg', 'consumerSupport'],
    selectionMode: 'multiple',
    rowHover: true,
    emptyMessage: 'No Customer data found.',
    showCaption: false,
    showSearch: false,
    showClearFilter: false,
    showCreateButton: true,
    showMobileView: true,
    mobileCardFields: {
      title: 'consumerName',
      subtitle: 'consumerShortName',
      stats: []
    }
  };

  constructor(private route: ActivatedRoute, private router: Router) {
    super();
    this.getCustomers();
  }

  private openCustomerAccessDialog(customer: any, attributes: any[]): void {
    const header = 'Customer Access';

    const dialogRef = this.dialog.open(CustomerAccessDialogComponent, {
      header,
      modal: true,
      closable: true,
      width: '80vw',
      data: {
        customerName: customer.consumerName,
        serviceName: customer.serviceName || '',
        attributes
      }
    });

    dialogRef.onClose.subscribe(() => {
      // Optional: clear query params after dialog is closed
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true
      });
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.checkDeepLinkAccess();
  }

  private checkDeepLinkAccess(): void {
    const custNameParam = this.route.snapshot.queryParamMap.get('custName');
    if (!custNameParam) {
      return;
    }

    // Decode and remove quotes if present
    const cleanedName = decodeURIComponent(custNameParam).replace(/^"+|"+$/g, '').trim();
    if (!cleanedName) {
      return;
    }

    this.isDeepLinkMode = true;

    this.spinner.show();
    this.opsinsightDataService.getCustomerByName(cleanedName).pipe(
      finalize(() => this.spinner.hide())
    ).subscribe({
      next: (res: any) => {
        const customer = res?.data || res?.result;
        if (!customer || customer.isActive === false) {
          this.showToast('error', 'Access Denied', 'Customer not found or inactive', 3000, false);
          return;
        }

        this.opsinsightDataService.getCustomerAttributes(customer._id).subscribe({
          next: (attrRes: any) => {
            const attributes = attrRes?.result || attrRes?.data || [];
            this.openCustomerAccessDialog(customer, attributes);
          },
          error: () => {
            this.showToast('error', 'Error', 'Failed to load customer attributes', 3000, false);
          }
        });
      },
      error: () => {
        this.showToast('error', 'Access Denied', 'Customer not found', 3000, false);
      }
    });
  }

  getCustomers(): void {
    this.spinner.show();
    this.isLoading = true;

    this.customer_data$ = this.opsinsightDataService.getCustomers().pipe(
      map((res: any) => {
        const customers = res?.result || res?.data || [];
        // Format dates for display
        return customers.map((customer: any) => ({
          ...customer,
          createdDate: customer.createdOn ? this.formatDate(customer.createdOn) : '',
          modifiedDate: customer.modifiedOn ? this.formatDate(customer.modifiedOn) : '',
          lastRunDate: customer.lastRunDate ? this.formatDate(customer.lastRunDate) : ''
        }));
      }),
      finalize(() => {
        this.spinner.hide();
        this.isLoading = false;
      })
    );

    this.filteredCustomers$ = combineLatest([
      this.customer_data$,
      this.search$.pipe(startWith(this.searchValue || ''))
    ]).pipe(
      map(([customers, search]) => {
        const term = String(search || '').trim().toLowerCase();
        if (!term) return customers;

        const fields = this.tableConfig.globalFilterFields || [];
        return customers.filter((customer: any) =>
          fields.some((field) => {
            const value = this.getFieldValue(customer, field);
            return value !== null && value !== undefined &&
              String(value).toLowerCase().includes(term);
          })
        );
      })
    );
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value || '';
    this.searchValue = value;
    this.search$.next(value);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.search$.next('');
  }

  private getFieldValue(row: any, field: string): any {
    const keys = field.split('.');
    let value = row;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }

  createCustomer(): void {
    this.appRef = this.dialog.open(ManageCustomerComponent, {
      header: 'Create Customer',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    });

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.getCustomers();
      }
    });
  }

  onCustomerSelect(event: any): void {
    this.activeCustomer = event.data;
  }

  onRowSelect(event: any): void {
    this.selectedCustomer = event.data ? [event.data] : [];
  }

  onAction(event: { action: string; row: any }): void {
    const { action, row } = event;
    switch (action) {
      case 'edit':
        this.editCustomer(row);
        break;
      case 'delete':
        this.deleteCustomer(row);
        break;
    }
  }

  editCustomer(data: any) {
    this.appRef = this.dialog.open(ManageCustomerComponent, {
      header: 'Edit Customer',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        customerData: data
      },
      width: getResponsiveDialogWidth(),
    });

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.getCustomers();
      }
    });
  }

  deleteCustomer(data: any) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      header: 'Confirm Delete',
      modal: true,
      closable: true,
      data: {
        message: 'Are you sure you want to delete this customer?',
        itemName: data.consumerName
      },
      width: '550px'
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        this.opsinsightDataService.deleteCustomer(data._id).subscribe({
          next: () => {
            this.showToast('success', 'Deleted', 'Customer deleted successfully', 2000, false);
            this.getCustomers();
          },
          error: () => {
            this.showToast('error', 'Error', 'Failed to delete customer', 2000, false);
          }
        });
      }
    });
  }


  getSeverity(status: boolean) {
    return status ? 'success' : 'danger';
  }

  getStatus(status: boolean) {
    return status ? 'Active' : 'Inactive';
  }

  ngOnDestroy() {
    this.subscribe$.next();
    this.subscribe$.complete();
  }
}
