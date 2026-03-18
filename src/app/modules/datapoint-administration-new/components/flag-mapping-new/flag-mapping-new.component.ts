import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Subscription, combineLatest, tap, debounceTime } from 'rxjs';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { CreateFlagsNewComponent } from 'src/app/modules/datapoint-administration-new/pages/flags/create-flags-new/create-flags-new.component';
import { ManageFlagsMappingsNewComponent } from 'src/app/modules/datapoint-administration-new/pages/flags/manage-flags-mappings-new/manage-flags-mappings-new.component';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-flag-mapping-new',
  standalone: false,
  templateUrl: './flag-mapping-new.component.html',
  styleUrl: './flag-mapping-new.component.css'
})
export class FlagMappingNewComponent {
  @Input() app: any;
  @Input() org: any;
  @Input() flagData: any;
  ref: DynamicDialogRef | undefined;
  @ViewChild('dt') dt: Table | undefined;
  isAdmin = true;
  createAccess = true;
  searchValue: any;
  statuses = ['Red', 'Orange', 'Yellow', 'Green'];
  private subscriptions: Subscription[] = [];
  isshowUI: boolean = false;
  flags: any; // Stores the list of entities fetched from the server.
  flagJson: any;
  manageFlag: boolean = false; // Indicates whether the "Manage Flag" sidebar is visible.
  isShowFlagDetails: boolean = false;
  selectedMapping: any;

  /**
 * @property {string[]} flagActions - Stores the options for Flag Action selection Button.
 */
  flagActions: string[] = ["Flag Details",
    "Flag Mappings"];


  /**
   * @property {any} selectedFlagAction - Stores the currently selected Flag action.
   */
  selectedFlagAction: any;

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;



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
    private filter: FilterService,
    private activateRoute: ActivatedRoute,
    private confirmationService: ConfirmationService
  ) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getFlagDetails();
  }


  /**
   * Lifecycle hook triggered after the component is initialized.
   * Fetches the list of entities from the server.
   */
  ngOnInit() {
    this.selectedFlagAction = this.flagActions[0];
  }

  /**
 * Fetches the data of flag from the server and updates the `flags` property.
 * Displays a spinner while the API call is in progress.
 * Logs the response or error using the LoggerService.
 * @returns {void} - returns nothing
 */
  getFlagDetails(): void {
    if (!this.flagData?.flagId) return;

    this.spinner.show();
    this.dataPointService.getFlagDetails(this.flagData.flagId).subscribe({
      next: (res: any) => {
        const flagDetail = res?.Flag || res?.flagJson?.[0];
        this.flagJson = flagDetail;
        
        const categoriesObj = flagDetail?.flagCategories || {};
        const variablesObj = flagDetail?.flagVariables || [];
        
        let categories: any[] = [];

        if (Object.keys(categoriesObj).length > 0) {
            for (const [category, vars] of Object.entries(categoriesObj)) {
                categories.push({ category, variables: vars });
            }
        } else if (Array.isArray(variablesObj)) {
            // Unmapped or simple definitions
            const hasMapping = variablesObj.some((v: any) => v.attribute && v.attribute !== '');
            if (hasMapping) {
                categories.push({ category: 'default', variables: variablesObj });
            }
        } else if (variablesObj && typeof variablesObj === 'object') {
            // Legacy categories in variables
            for (const [category, vars] of Object.entries(variablesObj)) {
                categories.push({ category, variables: vars });
            }
        }
        this.flags = categories;
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
      }
    });
  }


  /**
   * Fetches the list of entities from the server and updates the `flags` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   * @returns {void} - returns nothing
   */
  getFlagList(): void {
    let payload = {
      ...(this.app && { appId: this.app }),
      ...(this.org && { orgId: this.org })
    };

    this.dataPointService.getFlagList(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.flags = res.flag;
        this.isshowUI = true;
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  /**
   * Opens the manage flag page by passin the id as flag id as parameter
   * calls the navigateByUrl method from router and passes the flag id as well as the appId and orgId as state
   * @returns {void} - returns nothing
   */
  openFlag(event: string): void {
    this.isShowFlagDetails = true
    // this.router.navigate(['/datapointAdmin/home/manageFlag/', event], { state: { appId: this.app, orgId: this.org } });
  }

  clear(dt: any) {
    const searchinput: any = document.getElementById('searchinput');
    searchinput.value = null;
    this.dt?.clear();
  }


  onFilterApply(filterParam: { appId: any, orgId: any }) {
    this.app = filterParam.appId || null
    this.org = filterParam.orgId || null
    this.getFlagList();
  }

  createFlag(isNew: boolean = false) {
    if (isNew) {
      this.selectedMapping = null;
    }

    // If flagJson with categories is already loaded, open immediately
    if (this.flagJson?.flagCategories && Object.keys(this.flagJson.flagCategories).length > 0) {
      this.openMappingDialog();
      return;
    }

    // Fallback: If legacy flagVariables with categories is already loaded
    if (this.flagJson?.flagVariables && typeof this.flagJson.flagVariables === 'object' && !Array.isArray(this.flagJson.flagVariables)) {
        this.openMappingDialog();
        return;
    }

    // Otherwise fetch full flag details first to get flagVariables
    if (!this.flagData?.flagId) return;

    this.spinner.show();
    this.dataPointService.getFlagDetails(this.flagData.flagId).subscribe({
      next: (res: any) => {
        this.flagJson = res?.Flag || res?.flagJson?.[0];
        this.spinner.hide();
        this.openMappingDialog();
      },
      error: () => {
        this.spinner.hide();
        // Fall back to flagData even without flagVariables
        this.openMappingDialog();
      }
    });
  }

  openMappingDialog() {
    const flagDataToPass = this.flagJson || this.flagData;

    this.ref = this.dialogService.open(ManageFlagsMappingsNewComponent, {
      modal: true,
      closable: true,
      header: 'Variable Mapping',
      styleClass: 'custom-header-dialog',
      data: {
        flagData: flagDataToPass,
        appData: {
          appId: this.app,
          orgId: this.org
        },
        selectedRow: this.selectedMapping,
        selectedCategory: this.selectedMapping ? this.selectedMapping.category : null
      },
      width: '85rem'
    });

    this.ref.onClose.subscribe((result: any) => {
      if (result?.status === true) {
        this.getFlagDetails();
      }
    });
  }

  onEditMapping(item: any) {
    this.selectedMapping = item;
    // item contains {category, variables}, but openMappingDialog expects selectedMapping to have the variables' properties or just the category
    // actually openMappingDialog uses this.selectedMapping.category
    this.createFlag();
  }

  onMappingSelect(event: any) {
    this.selectedMapping = event.data;
    this.createFlag();
  }

  onDeleteMapping(item: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the category "${item.category}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.spinner.show();
        let updatedFlagCategories = { ...(this.flagJson.flagCategories || {}) };
        let updatedFlagVariables = this.flagJson.flagVariables;

        if (Object.keys(updatedFlagCategories).length === 0 && !Array.isArray(updatedFlagVariables)) {
            // Migration/Legacy handle
            updatedFlagCategories = { ...updatedFlagVariables };
            updatedFlagVariables = []; // Reset variables to empty array (will be handled by backend if needed, but safer to be explicit)
        }

        delete updatedFlagCategories[item.category];

        const payload = {
          ...this.flagJson,
          flagVariables: Array.isArray(updatedFlagVariables) ? updatedFlagVariables : [],
          flagCategories: updatedFlagCategories
        };

        this.dataPointService.updateFlag(payload).subscribe({
          next: () => {
            this.spinner.hide();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Mapping deleted successfully',
              life: 3000,
            });
            this.getFlagDetails();
          },
          error: () => {
            this.spinner.hide();
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete mapping',
              life: 3000,
            });
          }
        });
      }
    });
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
