import { Component, ViewEncapsulation } from '@angular/core';
import { CorrelationEngineComponent } from '../../correlation-engine.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CorrelationEngineService } from '../../services/correlation-engine.service';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { FilterEngineService } from '../../services/filter-engine.service';

@Component({
  selector: 'app-correlation-engine-home',
  standalone: false,
  templateUrl: './correlation-engine-home.component.html',
  styleUrl: './correlation-engine-home.component.css',
})
export class CorrelationEngineHomeComponent {
  correlationData: any[] = [];
  selectedCorrelation: any;
  loading: unknown;
  searchValue: any;
  appRef!: DynamicDialogRef;
  private subscribe$ = new Subject<void>();
  showSelections: boolean = false;
  selectionOptions: string[] = ["Calculation Details", "Calculation Mapping", "Calculation Test Run"];
  selectedOption: string = this.selectionOptions[0];

  /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
   * Constructor injects necessary services.
   * @constructor
   * @param {OrganizationAdministrationService} orgAdminService - Service to interact with the backend for fetching and managing applications.
   * @param {DialogService} dialog - Primeng dialog Service to interact with dialog components.
   * @param {NgxSpinnerService} spinner - Ngx Spinner service to interact with loaders.
   * @param {Router} router - Angular Router service to interact router,
   * @param {MessageService}  messageService - Primeng Message service to intearct with toast
   */

  constructor(
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private router: Router,
    private correlationEngineService: CorrelationEngineService,
    private filterService: FilterEngineService) {
    this.filterService.selectedApp$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getCorData();
      }
    })

    this.filterService.selectedOrg$.pipe(takeUntil(this.subscribe$)).subscribe(event => {
      if (event) {
        this.getCorData();
      }
    })
  }

  ngOnInit(): void {
    this.getCorData()
  }

  getCorData(): void {
    this.spinner.show();
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }

    this.correlationEngineService.getCorrelationEngine(payload).subscribe({
      next: (res: any) => {
        if (res) {
          this.correlationData = res.correlationList;
          console.log(this.correlationData);
          this.spinner.hide();
        }
      },
      error: (err) => {
        this.spinner.hide();
        if (err.error.token === '404')
          this.correlationData = []
      }
    });
  }

  createApp(): void {
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }
    this.router.navigate(['correlationEngine/home/createCorrelation'], { state: { appData: payload } });
  }


  onCorrelationSelect(event: TableRowSelectEvent) {
    this.router.navigate(['/correlationEngine/home/manageCorrelation', event?.data?.correlationId])
    this.showSelections = true;
  }

  onCorrelationUnSelect(event: TableRowSelectEvent) {
    this.showSelections = false;
  }

  clear(_t19: Table) {
    // TODO: Implement table clearing logic
  }

  copyApp(_t59: any) {
    // TODO: Implement app copy logic
  }


  /**
   * Edits an existing application.
   * @param {any}app - The application data to be edited.
   */
  editApp(app: any) {
  }


  deleteApp(event: any, calculationId: string) {
  }

  OnUpdateEmit(event: any) {
    this.getCorData();
  }

  getSeverity(status: string) {
    switch (status) {
      case 'active':
        return 'success';

      case 'inactive':
        return 'danger';
      default:
        return 'success'
    }
  }

  getStatus(status: string) {
    switch (status) {
      case 'active':
        return 'Active';

      case 'inactive':
        return 'Inactive';
      default:
        return 'success'
    }
  }

  ngOnDestroy(): void {
    this.subscribe$.next();
    this.subscribe$.complete();
  }
}
