import { Component } from '@angular/core';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { combineLatest, debounceTime, Subscription, tap } from 'rxjs';
import { FilterService } from 'src/app/modules/datapoint-administration/services/filter/filter.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

/**
 * @component InstanceComponent
 * This component manages the display and interaction with instances. It retrieves the list of instances 
 * from the server, manages a button for instances creation, and displays notifications for user actions.
 */
@Component({
  selector: 'app-instances',
  standalone: false,
  templateUrl: './instances.component.html',
  styleUrl: './instances.component.css'
})
export class InstancesComponent {

  appId: any;
  ref: DynamicDialogRef | undefined;
  isshowUi: boolean = false;
  instances: any; // Stores the list of instances fetched from the server.
  manageEntity: boolean = false; // Indicates whether the "Manage Entity" sidebar is visible.
  searchValue: any;
  app: any;
  org: any;
  isAdmin = true;
  createAccess = true;
  private subscriptions: Subscription[] = [];

 /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * Constructor to inject required services.
   * @param {AdminService} datapointAdminService - Service for admin-related API calls.
   * @param {MessageService} messageService - Service for displaying messages or notifications.
   * @param {NgxSpinnerService} spinner - Service for displaying a loading spinner.
   * @param {FilterService} filter - Service for subscribing the appId and OrgId from filter comp
   */
  constructor(private datapointAdminService: DatapointAdministrationService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private router: Router,
    public dialogService: DialogService,
    private activateRoute: ActivatedRoute,
    private filter: FilterService
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

      // // Prevent duplicate API calls when values haven't changed
      // distinctUntilChanged((prev, curr) => 
      //   JSON.stringify(prev) === JSON.stringify(curr)
      // ),

      // Add small debounce to handle rapid changes
      // debounceTime(300)
      tap(() => this.spinner.show()),
      debounceTime(300)
    ).subscribe(([app, org]) => {
      this.app = app;
      this.org = org;
      this.getInstanceList();
    });

    this.subscriptions.push(combinedSubscription);
  }

  /**
   * Fetches the list of entities from the server and updates the `instances` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   */
  getInstanceList() {
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };
    this.datapointAdminService.getInstanceList(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.instances = res.Instances;
        this.isshowUi = true;
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  openInstance(event: string) {
    this.router.navigate(['/datapointAdmin/home/manageInstance/', event], { state: { appId: this.app, orgId: this.org } });
  }

  createInstance() {
    this.router.navigateByUrl('/datapointAdmin/home/createInstance', { state: { appId: this.app, orgId: this.org } })
  }

  clear(dt: Table) {
    
  }
}
