import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { CorrelationEngineService } from 'src/app/modules/correlation-engine/services/correlation-engine.service';
import { FilterEngineService } from 'src/app/modules/correlation-engine/services/filter-engine.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-correlation-engine-table-v2',
  standalone: false,
  templateUrl: './correlation-engine-table-v2.component.html',
  styleUrl: './correlation-engine-table-v2.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class CorrelationEngineTableV2Component {
  correlationData: any[] = [];
  selectedCorrelation: any;
  loading: unknown;
  searchValue: any;
  private subscribe$ = new Subject<void>();

  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  constructor(
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private router: Router,
    private correlationEngineService: CorrelationEngineService,
    private filterService: FilterEngineService
  ) {
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(() => {
      this.getCorData();
    });
    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(() => {
      this.getCorData();
    });
  }

  ngOnInit(): void {
    this.getCorData();
  }

  getCorData(): void {
    this.spinner.show();
    const payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    };
    this.correlationEngineService.getCorrelationEngine(payload).subscribe({
      next: (res: any) => {
        if (res) {
          this.correlationData = res.correlationList ?? [];
        }
        this.spinner.hide();
      },
      error: () => {
        this.correlationData = [];
        this.spinner.hide();
      }
    });
  }

  createApp(): void {
    const payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    };
    this.router.navigate(['correlationEngineV2/home/createCorrelation'], { state: { appData: payload } });
  }

  onCorrelationSelect(event: TableRowSelectEvent): void {
    this.router.navigate(['/correlationEngineV2/home/manageCorrelation', event?.data?.correlationId]);
  }

  onCorrelationUnSelect(_event: TableRowSelectEvent): void {
    // no-op
  }

  clear(dt: Table): void {
    this.searchValue = '';
    dt?.clear();
  }

  applyFilterGlobal(event: Event, matchMode: string): void {
    const value = (event.target as HTMLInputElement)?.value;
    this.dt?.filterGlobal(value, matchMode);
  }

  deleteApp(event: any, correlationId: string): void {
    // TODO: wire delete API when available
  }

  getSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'success';
    }
  }

  getStatus(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      default: return 'Active';
    }
  }

  ngOnDestroy(): void {
    this.subscribe$.next();
    this.subscribe$.complete();
  }

  @ViewChild('dt') dt: Table | undefined;
}
