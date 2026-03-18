import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { Table } from 'primeng/table';
import { FilterService } from 'src/app/modules/datapoint-administration/services/filter/filter.service';
import { combineLatest, debounceTime, distinctUntilChanged, filter, Observable, Subscription, tap } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

/**
 * @component EntityComponent
 * This component manages the display and interaction with entities. It retrieves the list of entities 
 * from the server, manages entity creation, deletion, and displays notifications for user actions.
 */
@Component({
  selector: 'app-entity',
  standalone: false,
  templateUrl: './entity.component.html',
  styleUrl: './entity.component.css',
  encapsulation: ViewEncapsulation.None
})
export class EntityComponent implements OnInit, OnDestroy {
  @Input() appId: any;
  ref: DynamicDialogRef | undefined;
  @ViewChild('dt') dt: Table | undefined;
  isAdmin = true;
  createAccess = true;
  searchValue: any;
  statuses = ['Application', 'OpsInsight']

  isshowUI: boolean = false;
  entityList: any; // Stores the list of entities fetched from the server.
  manageEntity: boolean = false; // Indicates whether the "Manage Entity" sidebar is visible.
  app: string | undefined | null;
  org: string | undefined | null;
  private subscriptions: Subscription[] = [];

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
   */
  isMobile$!: Observable<boolean>;


  /**
   * Constructor to inject required services.
   * @param {AdminService} dataPointService - Service for admin-related API calls.
   * @param {MessageService} messageService - Service for displaying messages or notifications.
   * @param {PrimeNGConfig} config - PrimeNG configuration service.
   * @param {NgxSpinnerService} spinner - Service for displaying a loading spinner.
   * @param {Router} router - Service for routing
   */
  constructor(private dataPointService: DatapointAdministrationService, private messageService: MessageService,
    private spinner: NgxSpinnerService, private router: Router,
    public dialogService: DialogService,
    private activateRoute: ActivatedRoute,
    private filter: FilterService,
    private responsive: ResponsiveService
  ) {
    this.activateRoute.paramMap.subscribe((params: any) => {
      this.appId = params.params.id;
    })
  }


  /**
   * Lifecycle hook triggered after the component is initialized.
   * Fetches the list of entities from the server.
   */
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
      this.getEntityList();
    });

    this.subscriptions.push(combinedSubscription);
    this.isMobile$ = this.responsive.isMobile$()
  }

  /**
   * Fetches the list of entities from the server and updates the `entityList` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   */
  getEntityList() {
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };

    this.dataPointService.getEntityList(payload).subscribe({
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

  openEntity(event: string) {
    this.router.navigate(['/datapointAdmin/home/manageEntity/', event], { state: { appId: this.app, orgId: this.org } });
  }

  clear(dt: any) {
    const searchinput: any = document.getElementById('searchinput');
    searchinput.value = null;
    this.dt?.clear();
  }

  onButtonClick(instance: any) {
    this.router.navigate(['/datapointAdmin/home/entityData', instance.entityId])
  }

  createEntity() {
    this.router.navigateByUrl('/datapointAdmin/home/createEntity', { state: { appId: this.app, orgId: this.org } })
  }

  applyFilterGlobal($event: Event, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }


  /**
   * Lifecycle hook triggered after the time of component destroy.
   * unsubscribes the filter subscriptions
   */
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
