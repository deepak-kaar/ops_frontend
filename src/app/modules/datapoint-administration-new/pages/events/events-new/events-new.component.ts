import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DeleteConfirmationDialogComponent, DeleteConfirmationDialogResult } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { FilterService } from 'src/app/modules/datapoint-administration/services/filter/filter.service';
import { combineLatest, debounceTime, Subscription, tap } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { TableColumn, TableAction, TableConfig } from 'src/app/core/components/table-wrapper/table-wrapper.component';
import { EventsService } from '../../../services/events.service';

@Component({
  selector: 'app-events-new',
  standalone: false,
  templateUrl: './events-new.component.html',
  styleUrl: './events-new.component.css'
})
export class EventsNewComponent implements OnInit, OnDestroy {

  app: string | undefined | null;
  org: string | undefined | null;
  private subscriptions: Subscription[] = [];
  selectedEvent: any;

  // Table configuration
  columns: TableColumn[] = [
    { field: 'eventName', header: 'Event Name', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' },
    { field: 'flagName', header: 'Mapped Flag', sortable: true, filterable: true, filterType: 'text', minWidth: '12rem' },
    { field: 'isActive', header: 'Active Status', sortable: true, filterable: false, minWidth: '10rem' },
    { field: 'eventDescription', header: 'Description', sortable: true, filterable: true, filterType: 'text', minWidth: '14rem' }
  ];

  actions: TableAction[] = [
    { icon: 'pi pi-list', tooltip: 'View Logs', severity: 'secondary', action: 'view_logs' },
    { icon: 'pi pi-pencil', tooltip: 'Edit', severity: 'info', action: 'edit' },
    { icon: 'pi pi-trash', tooltip: 'Delete', severity: 'danger', action: 'delete' }
  ];

  tableConfig: TableConfig = {
    dataKey: 'eventId',
    rows: 20,
    rowsPerPageOptions: [20, 30, 50],
    paginator: true,
    globalFilterFields: ['eventName', 'flagName', 'eventDescription'],
    selectionMode: 'single',
    rowHover: true,
    emptyMessage: 'No events found.',
    showCaption: true,
    showSearch: true,
    showClearFilter: true,
    searchPlaceholder: 'Search...',
    createButtonLabel: 'Create Event',
    createButtonIcon: 'pi pi-plus',
    showCreateButton: true,
    showMobileView: false
  };

  isshowUi: boolean = false;
  events: any[] = [];
  displayLogsModal: boolean = false;
  eventLogs: any[] = [];

  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  constructor(
    private datapointAdminService: DatapointAdministrationService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private filter: FilterService,
    private dialogService: DialogService,
    private eventsService: EventsService
  ) { }

  ngOnInit() {
    const combinedSubscription = combineLatest([
      this.filter.selectedApp$,
      this.filter.selectedOrg$
    ]).pipe(
      tap(() => this.spinner.show()),
      debounceTime(300)
    ).subscribe(([app, org]) => {
      this.app = app;
      this.org = org;
      this.getEvents();
    });

    this.subscriptions.push(combinedSubscription);
  }

  getEvents() {
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };
    this.spinner.show();
    this.datapointAdminService.getEvents(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.events = res.Events || [];
        this.isshowUi = true;
      },
      error: (err) => {
        this.spinner.hide();
        console.error(err);
      }
    });
  }

  getSeverity(isActive: boolean): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    return isActive ? 'success' : 'secondary';
  }

  createEvent() {
    this.router.navigateByUrl('/datapointAdminV2/home/createEventsNew', { state: { appId: this.app, orgId: this.org } });
  }

  onEventSelect(event: any): void {
    this.selectedEvent = event.data;
  }

  onEventUnSelect(event: any): void {
    this.selectedEvent = null;
  }

  onAction(event: { action: string; row: any }): void {
    const { action, row } = event;
    switch (action) {
      case 'view_logs':
        this.viewLogs(row);
        break;
      case 'edit':
        this.editEvent(row);
        break;
      case 'delete':
        this.deleteEvent(row);
        break;
    }
  }

  viewLogs(event: any) {
    this.spinner.show();
    this.eventsService.getEventLogs(event.eventId).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.eventLogs = res.logs || [];
        this.displayLogsModal = true;
      },
      error: () => {
        this.spinner.hide();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch logs' });
      }
    });
  }

  editEvent(event: any) {
    this.router.navigateByUrl('/datapointAdminV2/home/createEventsNew', {
      state: {
        appId: this.app,
        orgId: this.org,
        eventId: event.eventId
      }
    });
  }

  deleteEvent(event: any): void {
    const ref = this.dialogService.open(DeleteConfirmationDialogComponent, {
      showHeader: false,
      closable: false,
      modal: true,
      dismissableMask: true,
      styleClass: 'delete-confirmation-modal',
      width: '460px',
      data: {
        entityLabel: 'Event',
        itemName: event.eventName ?? '',
        title: 'Delete Event',
        subtitle: 'This action cannot be undone',
        confirmText: 'Delete Event',
        cancelText: 'Cancel'
      }
    });

    ref.onClose.subscribe((result?: DeleteConfirmationDialogResult) => {
      if (!result?.confirmed) return;
      this.spinner.show();
      this.datapointAdminService.deleteEvent(event.eventId).subscribe({
        next: () => {
          this.spinner.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Event deleted successfully' });
          this.getEvents();
        },
        error: () => {
          this.spinner.hide();
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete event' });
        }
      });
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
