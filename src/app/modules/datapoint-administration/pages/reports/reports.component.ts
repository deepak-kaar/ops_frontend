import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  @Input() appId: any;
  items: MenuItem[];
  ref: DynamicDialogRef | undefined;

  searchValue: any;
  statuses = ['Application', 'OpsInsight']

  isshowUI: boolean = false;
  entityList: any; // Stores the list of entities fetched from the server.
  manageEntity: boolean = false; // Indicates whether the "Manage Entity" sidebar is visible.

  isAdmin = true;
  createAccess = true
  apps: any;
  app: any;
  org: any;

 /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * Constructor to inject required services.
   * @param {AdminService} datapointAdminService - Service for admin-related API calls.
   * @param {LoggerService} logger - Service for logging.
   * @param {MessageService} messageService - Service for displaying messages or notifications.
   * @param {PrimeNGConfig} config - PrimeNG configuration service.
   * @param {NgxSpinnerService} spinner - Service for displaying a loading spinner.
   * @param {Router} router - Service for routing
   */
  constructor(private datapointAdminService: DatapointAdministrationService, 
    private messageService: MessageService, 
    private spinner: NgxSpinnerService, 
    private router: Router,
    public dialogService: DialogService,
    private activateRoute: ActivatedRoute
  ) {
    this.activateRoute.paramMap.subscribe((params: any) => {
      this.appId = params.params.id;
    })
    this.items = [
      {
        label: 'Mapping',
      },
      { separator: true },
      {
        label: 'Data Entry',
      },
    ];
  }


  /**
   * Lifecycle hook triggered after the component is initialized.
   * Fetches the list of entities from the server.
   */
  ngOnInit() {
    this.getEntityList();
    this.getAppList();
  }

  /**
   * Fetches the list of entities from the server and updates the `entityList` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   */
  getEntityList() {
    const payload = {
      type: 'Entity',
      appId: this.appId || null
    }
    this.spinner.show();
    this.datapointAdminService.getEntityList(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.entityList = res.Entity_Attributes;
        this.isshowUI = true;
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  getAppList() {
    let payload
    if (this.appId) {
      payload = {
        appId: this.appId,
        templateType: 'Report Design'
      }
    }
    else {
      payload = {
        templateType: 'Report Design'
      }
    }
    this.datapointAdminService.getIdtList(payload).subscribe({
      next: (res: any) => {
        this.apps = res.idtList;
        console.log(this.apps)
      },
      error: (err) => {
      }
    })
  }

  openEntity(event: string) {
    this.router.navigate(['/globalRenderer/reportPage', event]);
  }


  clear(arg0: any) {
  }
  onButtonClick(entity: any) {
    const templateId = entity.idtId;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/globalRenderer/reportMapping', templateId], {
        queryParams: { entityId: entity.entityOrInstanceId, screenType: 'Form' }
      })
    );
    window.open(url, '_blank');
  }

  onFilterApply(filterParam: { appId: any, orgId: any }) {
    this.app = filterParam.appId || null
    this.org = filterParam.orgId || null
    this.getEntityList();
  }
}
