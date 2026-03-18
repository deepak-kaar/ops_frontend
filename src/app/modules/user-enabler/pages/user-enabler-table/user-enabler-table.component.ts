import { Component } from '@angular/core';
import { UserEnablerComponent } from '../../user-enabler.component';
import { finalize, map, Observable, Subject, takeUntil } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ManageUserEnablerComponent } from '../../components/manage-user-enabler/manage-user-enabler.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { FilterService } from 'src/app/core/services/filter/filter.service';

@Component({
  selector: 'app-user-enabler-table',
  standalone: false,
  templateUrl: './user-enabler-table.component.html',
  styleUrl: './user-enabler-table.component.css'
})
export class UserEnablerTableComponent extends UserEnablerComponent {


  appRef!: DynamicDialogRef;

  iSloading: unknown;

  isMobile$!: Observable<boolean>;

  searchValue: any;

  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  accEnabler_data$!: Observable<any>;

  selectedData: any; // store selected Receive row data

  private subscribe$ = new Subject<void>();

  statuses = [{ label: 'Active', value: true }, { label: 'InActive', value: false }];

  constructor(private filterService: FilterService) {
    super();
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      this.getData();
    });
    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      this.getData();
    });
    this.getData();
  }

  onSelect(event: TableRowSelectEvent) {
  }

  clearTable(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  getData(): void {
    this.spinner.show();
    this.accEnabler_data$ = this.userEnablerService.getEnablersService().pipe(
      map((res: any) => res?.data || []),
      finalize(() => this.spinner.hide())
    );
  }


  create(): void {
    if (!(this.filterService.currentApp)) {
      this.showToast('error', 'Error', 'Please select an application', 3000, false);
      return;
    }

    if (!(this.filterService.currentOrg)) {
      this.showToast('error', 'Error', 'Please select an organization', 3000, false);
      return;
    }

    this.appRef = this.dialog.open(ManageUserEnablerComponent, {
      header: 'Create Enabler',
      modal: true,
      closable: true,
      data: {
        mode: 'create'
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      this.getData();
    }
    );
  }


  editData(data: any) {
    this.appRef = this.dialog.open(ManageUserEnablerComponent, {
      header: 'Edit Enabler',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        data
      },
      width: getResponsiveDialogWidth(),
    });

    this.appRef.onClose.subscribe((res: any) => {
      this.getData();
    }
    );
  }

  deleteData(data: any) {
    this.userEnablerService.deleteEnablerService(data._id).subscribe({
      next: () => {
        this.showToast('success', 'Deleted', 'Deleted successfully', 2000, false);
        this.getData();
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to delete', 2000, false);
      }
    });
  }

  getSeverity(status: any) {
    switch (status) {
      case true:
        return 'success';

      case false:
        return 'danger';
      default:
        return 'success'
    }
  }

  getStatus(status: any) {
    switch (status) {
      case true:
        return 'Active';

      case false:
        return 'Inactive';
      default:
        return 'success'
    }
  }

  /**
* Lifecycle hook triggered after the time of component destroy.
* unsubscribes the filter subscriptions
*/
  ngOnDestroy() {
    this.subscribe$.next();
    this.subscribe$.complete();
  }

}

