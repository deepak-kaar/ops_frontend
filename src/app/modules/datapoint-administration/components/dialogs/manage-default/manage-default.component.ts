import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatapointAdministrationService } from '../../../datapoint-administration.service';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';

@Component({
  selector: 'app-manage-default',
  standalone: false,
  templateUrl: './manage-default.component.html',
  styleUrl: './manage-default.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ManageDefaultComponent implements OnInit {
  defaults = ['Constant', 'Recent', 'Current'];
  refFrequency = ['Current', 'Hourly', 'Shift', 'Day', 'Week', 'Month', 'Quartetly', 'Semi-Annual', 'Yearly'];
  dataSource = ['Manual', 'Sensor', 'Calculated'];
  attrList: [] = [];
  orgList: [] = [];
  apps: [] = [];
  orgs: [] = [];
  types = ['Entity', 'Instance']
  data: any;
  attrActions = ['Alias Search', 'Entity/Instance Search'];
  selectedAction: any;
  min: number = 1;
  deafultForm: FormGroup = new FormGroup({
    applyOrder: new FormControl<number>(1, Validators.required),
    algorithm: new FormControl<string>('', Validators.required),
    defaultValue: new FormControl<any>(''),
    maxOffset: new FormControl<any>(''),
    appId: new FormControl<any>(''),
    facilityName: new FormControl<any>(null),
    refTag: new FormControl<any>(''),
    refTagDs: new FormControl<any>(null),
    refTagFreq: new FormControl<any>(null),
    calIndicator: new FormControl<boolean>(false),
    type: new FormControl<any>(['']),
    entityId: new FormControl<any>([''])
  })
  instances: any;
  entityList: any;

  constructor(private spinner: NgxSpinnerService,
    private datapointAdminService: DatapointAdministrationService,
    public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private pageAdminService: PageAdministratorService
  ) { }
  /**
   * Lifecycle hook triggered after the component is initialized.
   * Fetches the list of entities from the server.
   */
  ngOnInit() {
    this.selectedAction = this.attrActions[0];
    if (this.dialogConfig.data) {
      this.data = this.dialogConfig.data
      if (this.data.mode === 'edit') {
        this.patchValue();
      }
      else {
        this.deafultForm.get('applyOrder')?.setValue(this.dialogConfig.data.min);
        this.min = this.dialogConfig.data.min
      }
    }

    const fieldsToWatch = ['appId', 'facilityName', 'refTagDs', 'refTagFreq', 'entityId'];

    fieldsToWatch.forEach(field => {
      this.deafultForm.get(field)?.valueChanges.subscribe(value => {
        this.getAttributeList();
      });
    });

    // this.getAttributeList();
    this.getApps();
  }

  /**
   * Fetches the list of entities from the server and updates the `attrList` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   */
  getAttributeList() {
    this.spinner.show();
    let typeValue = this.deafultForm.get('type')?.value ?? null;
    let entityValue = this.deafultForm.get('entityId')?.value;

    let payload = {
      ...(this.deafultForm.get('appId')?.value && { appId: this.deafultForm.get('appId')?.value }),
      ...(this.deafultForm.get('facilityName')?.value && { orgId: this.deafultForm.get('facilityName')?.value }),
      ...(this.deafultForm.get('refTagDs')?.value && { dataSource: this.deafultForm.get('refTagDs')?.value }),
      ...(this.deafultForm.get('refTagFreq')?.value && { frequency: this.deafultForm.get('refTagFreq')?.value }),
      ...(typeValue === 'Entity' && entityValue && { entityId: entityValue }),
      ...(typeValue === 'Instance' && entityValue && { instanceId: entityValue }),
    };

    this.datapointAdminService.getFilteredAttributes(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.attrList = res.attributes.map((item: any) => ({
          attrId: item.attributeId,
          attrName: item.attributeName,
          attrAlias: item.alias
        }));
      },
      error: (err) => {
        this.spinner.hide();
        console.error(err);
      }
    })
  }

  onAlgoChange(type: string) {
    if (type === 'Constant') {
      this.deafultForm.get('refTag')?.disable({ emitEvent: false });
      this.deafultForm.get('refTagDs')?.disable({ emitEvent: false });
      this.deafultForm.get('refTagFreq')?.disable({ emitEvent: false });
      this.deafultForm.get('facilityName')?.disable({ emitEvent: false });
    } else {
      this.deafultForm.get('refTag')?.enable({ emitEvent: false });
      this.deafultForm.get('refTagDs')?.enable({ emitEvent: false });
      this.deafultForm.get('refTagFreq')?.enable({ emitEvent: false });
      this.deafultForm.get('facilityName')?.enable({ emitEvent: false });
    }

  }

  submit() {
    if (this.deafultForm.valid) {
      const data = this.deafultForm.getRawValue();
      this.ref.close({
        status: true,
        data: data
      });
    }
  }

  patchValue() {
    this.deafultForm.setValue(this.dialogConfig.data.data)
    this.min = this.deafultForm.get('applyOrder')?.value;
    if (this.deafultForm.get('algorithm')?.value === 'Constant') {
      this.deafultForm.get('refTag')?.disable();
      this.deafultForm.get('refTagDs')?.disable();
      this.deafultForm.get('refTagFreq')?.disable();
      this.deafultForm.get('facilityName')?.disable();
    }
    else {
      this.getAttributeList();
      this.getOrgs(this.deafultForm.get('appId')?.value);
      this.deafultForm.get('refTag')?.enable();
      this.deafultForm.get('refTagDs')?.enable();
      this.deafultForm.get('refTagFreq')?.enable();
      this.deafultForm.get('facilityName')?.enable();
    }
  }

  /**
 * Fetches the list of available applications from the server
 * using `PageAdministratorService` and updates the `apps` property.
 * @returns {void} - returns nothing
 */
  getApps(): void {
    this.pageAdminService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.apps.map((app: any) => ({
          appId: app.appId,
          appName: app.appName
        }));
      },
      error: (err) => {
        console.error('Failed to fetch applications:', err);
      }
    });
  }

  /**
   * Triggered when the selected application changes.
   * 
   * - Clears the `orgs` list to avoid stale data.
   * - Fetches the corresponding organizations.
   * - Updates the shared `FilterService` with the new selection.
   * - Emits the updated filter parameters.
   * 
   * @param appId - The newly selected application ID.
   */
  onAppChange(appId: string): void {
    this.orgs = [];
    this.getOrgs(appId);
    // this.getAttributeList();
  }

  /**
   * Fetches the list of organizations for a given application from the server
   * using `PageAdministratorService` and updates the `orgs` property.
   * 
   * @param appId - The ID of the selected application.
   */
  getOrgs(appId: string): void {
    this.pageAdminService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {
        this.orgs = res.orgs.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }));
      },
      error: (err) => {
        console.error('Failed to fetch organizations:', err);
      }
    });
  }


  /**
   * Fetches the list of entities from the server and updates the `entityList` property.
   * Displays a spinner while the API call is in progress.
   * Logs the response or error using the LoggerService.
   */
  getEntity() {
    this.spinner.show();
    const org = this.deafultForm.get('facilityName')?.value;
    let payload = {
      ...(this.deafultForm.get('appId')?.value && { appId: this.deafultForm.get('appId')?.value }),
      ...(this.deafultForm.get('facilityName')?.value && { orgId: org.orgId }),
    };
    this.datapointAdminService.getEntityList(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.entityList = res.Entity_Attributes.map((item: any) => ({
          id: item.entityId,
          name: item.entityName,
        }));
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  /**
  * Fetches the list of entities from the server and updates the `instances` property.
  * Displays a spinner while the API call is in progress.
  * Logs the response or error using the LoggerService.
  */
  getInstance() {
    this.spinner.show();
    const org = this.deafultForm.get('facilityName')?.value;
    let payload = {
      ...(this.deafultForm.get('appId')?.value && { appId: this.deafultForm.get('appId')?.value }),
      ...(this.deafultForm.get('facilityName')?.value && { orgId: org.orgId }),
    };
    this.datapointAdminService.getInstanceList(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.entityList = res.Instances.map((item: any) => ({
          id: item.instanceId,
          name: item.instanceName,
        }));
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  onAttrChange(attrLevel: string) {
    this.entityList = [];
    if (attrLevel === 'Entity') {
      this.getEntity();
    }
    else {
      this.getInstance();
    }
  }
}
