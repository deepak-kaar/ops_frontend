import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { Table } from 'primeng/table';
import { FilterService } from '../../services/filter/filter.service';
import { combineLatest, debounceTime, Subscription, tap } from 'rxjs';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-attributes',
  standalone: false,
  templateUrl: './attributes.component.html',
  styleUrl: './attributes.component.css'
})
export class AttributesComponent implements OnInit {
  appId: any;
  ref: DynamicDialogRef | undefined;
  @ViewChild('dt') dt: Table | undefined;
  searchValue: any;
  statuses = ['Application', 'OpsInsight']

  isshowUI: boolean = false;
  attrList: any; // Stores the list of entities fetched from the server.
  manageEntity: boolean = false; // Indicates whether the "Manage Entity" sidebar is visible.
  app: string | undefined | null;
  org: string | undefined | null;
  isAdmin = true;
  createAccess = true;
  private subscriptions: Subscription[] = [];
  /**
   * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
   */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;


  /**
   * Constructor to inject required services.
   * @param {AdminService} adminService - Service for admin-related API calls.
   * @param {MessageService} messageService - Service for displaying messages or notifications.
   * @param {NgxSpinnerService} spinner - Service for displaying a loading spinner.
   * @param {Router} router - Service for routing
   */
  constructor(private datapointAdminService: DatapointAdministrationService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService, private router: Router,
    public dialogService: DialogService,
    private filter: FilterService,

    private activateRoute: ActivatedRoute
  ) {
    // this.activateRoute.paramMap.subscribe((params: any) => {
    //   this.appId = params.params.id;
    // })
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
      this.getAttributeList();
    });

    this.subscriptions.push(combinedSubscription);
  }

  /**
   * Fetches the list of entities from the server and updates the `attrList` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   */
  getAttributeList() {
    this.spinner.show();
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };

    this.datapointAdminService.getAttrList(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.attrList = res[0].attributes;
        this.isshowUI = true;
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  openAttr(event: string) {
    this.router.navigate(['/datapointAdmin/home/manageAttribute/', event], { state: { appId: this.app, orgId: this.org } });
  }

  applyFilterGlobal($event: Event, stringVal: any) {
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }


  clear(dt: any) {
    this.dt?.clear();
    const searchinput: any = document.getElementById('searchinput');
    searchinput.value = null;
  }


  createAttribute() {
    this.router.navigateByUrl('/datapointAdmin/home/createAttribute', { state: { appId: this.app, orgId: this.org } })
  }

  /**
    * Lifecycle hook triggered after the time of component destroy.
    * unsubscribes the filter subscriptions
    */
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
