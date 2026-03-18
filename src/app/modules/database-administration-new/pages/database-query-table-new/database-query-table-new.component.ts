import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatabaseAdministrationNewComponent } from '../../database-administration-new.component';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { finalize, map, Observable, Subject, takeUntil } from 'rxjs';
import { Table } from 'primeng/table';
import { ManageQueryNewComponent } from '../../components/manage-query-new/manage-query-new.component';
import { getResponsiveDialogWidth } from 'src/app/core/utils/dialog-utils';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { SystemFilterService } from 'src/app/modules/database-administration/services/system/system-filter.service';
import { DatabaseAdministrationService } from 'src/app/modules/database-administration/services/database-administration.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-database-query-table-new',
  standalone: false,
  templateUrl: './database-query-table-new.component.html',
  styleUrl: './database-query-table-new.component.css'
})
export class DatabaseQueryTableNewComponent extends DatabaseAdministrationNewComponent implements OnInit, OnDestroy {

  appRef!: DynamicDialogRef;
  private subscribe$ = new Subject<void>();
  searchDBQueryValue: any;
  db_query_data$!: Observable<any>;
  @ViewChild('dt') dt!: Table;
  selectedDBQueries: any[] = [];

  constructor(
    dialog: DialogService,
    messageService: MessageService,
    spinner: NgxSpinnerService,
    filterService: SystemFilterService,
    databaseAdministrationService: DatabaseAdministrationService,
    breakpointObserver: BreakpointObserver
  ) {
    super(dialog, messageService, spinner, filterService, databaseAdministrationService, breakpointObserver);
    this.filterService.selectedSystem$.pipe(takeUntil(this.subscribe$)).subscribe((event: any) => {
      if (event) {
        this.getDBQuery();
      }
    });
    this.getDBQuery();
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  prepareTableData(data: any[]) {
    return data.map(row => ({
      ...row,
      editorOptions: this.getEditorBaseOptions(row.queryLanguage)
    }));
  }

  getEditorBaseOptions(lang: string) {
    return {
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      readOnly: true,
      language: lang || 'plaintext'
    };
  }

  getDBQuery(): void {
    this.spinner.show();
    this.db_query_data$ = this.databaseAdministrationService.getDatabase().pipe(
      map((res: any) => this.prepareTableData(res?.dataBaseData) || []),
      finalize(() => this.spinner.hide())
    );
  }

  createDBQuery(): void {
    if (!(this.filterService.currentSystem)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a system' });
      return;
    }

    this.appRef = this.dialog.open(ManageQueryNewComponent, {
      header: 'Create Query',
      modal: true,
      closable: true,
      data: {
        mode: 'create',
        systemData: this.filterService.currentSystem
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Query created successfully', life: 3000 });
        this.getDBQuery();
      }
    });
  }

  clearDBQueryTable(_t19: Table) {
    this.dt.reset();
    this.searchDBQueryValue = '';
    this.selectedDBQueries = [];
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  editDBQuery(data: any) {
    this.appRef = this.dialog.open(ManageQueryNewComponent, {
      header: 'Edit Query',
      modal: true,
      closable: true,
      data: {
        mode: 'edit',
        queryData: data,
      },
      width: getResponsiveDialogWidth(),
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Query edited successfully', life: 3000 });
        this.getDBQuery();
      }
    });
  }

  deleteDBQuery(data: any) {
    const deleteDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      header: 'Confirm Delete',
      modal: true,
      closable: true,
      data: {
        message: 'Are you sure you want to delete this database query?',
        itemName: data.queryId
      },
      width: '550px'
    });

    deleteDialogRef.onClose.subscribe((result: any) => {
      if (result?.confirmed) {
        this.databaseAdministrationService.deleteDatabase(data._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Database query deleted successfully'
            });
            this.getDBQuery();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete database query'
            });
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.subscribe$.next();
    this.subscribe$.complete();
  }
}
