import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { combineLatest, forkJoin, startWith } from 'rxjs';
import { AttributeDialogComponent } from '../../components/dialogs/attribute-dialog/attribute-dialog.component';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

/**
 * @component ManageEntityComponent
 * This component is used to manage entities by providing a form to update them.
 * It includes functionality for managing attributes, and making API calls
 * to fetch data points and update entities.
 */
@Component({
  selector: 'app-manage-entity',
  standalone: false,
  templateUrl: './manage-entity.component.html',
  styleUrl: './manage-entity.component.css'
})
export class ManageEntityComponent {
  ref: DynamicDialogRef | undefined;
  dataPoints: any[] | undefined; //Array of data points fetched from the API.
  entityForm: FormGroup; //Reactive form group for managing the entity.
  entityDetails: any[] = [];
  isShowAttribute: boolean = false;
  activeTabIndex: number = 0;
  entityId: string = '';
  filteredOptions: [] = [];
  appList: [] = [];
  attrList: any[] = [{ attributeId: 1, attributeName: 'Test' }]
  subEntityLabel: string | undefined;
  entityList: any;
  entityLevel = ['Application', 'Opsinsight'];
  dataSource = ['Manual', 'Sensor'];
  orgs: any
  appData: any;
  isAdmin = true;
  createAccess = true;
  editAccess = true;

 /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * Constructor initializes the form and injects necessary services.
   * @param {FormBuilder} fb - Service to create form controls and groups.
   * @param {DatapointAdministrationService} dataPointAdminService - Service to handle API calls related to admin operations.
   * @param {LoggerService} logger - Service to handle logging.
   * @param {Router} router - Service to handle routing
   * @param {MessageService} messageService - service to show the toast messages
   * @param {ActivatedRoute} activateRoute - service to fetch param from the route
   */
  constructor(
    private fb: FormBuilder,
    private dataPointAdminService: DatapointAdministrationService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private pageAdminService: PageAdministratorService,
    private messageService: MessageService,
    private activateRoute: ActivatedRoute,
    public dialogService: DialogService,
  ) {

    this.activateRoute.paramMap.subscribe((params: any) => {
      this.entityId = params.params.id;
    })

    this.entityForm = this.fb.group({
      type: ['Entity', Validators.required],
      entityOrInstanceName: ['', Validators.required],
      entityOrInstanceDesc: ['', Validators.required],
      entityOrInstanceAttribute: this.fb.array([]),
      entityLevel: ['', Validators.required],
      entityLevelName: [''],
      entityOrgLevel: [''],
      isEntityOrInstance: [true]
    });
    this.addAttribute();
    this.appData = this.router.getCurrentNavigation()?.extras.state;
  }

  /**
   * Lifecycle hook triggered after the component is initialized.
   * Fetches data points from the API.
   * @returns {void}
   */
  ngOnInit(): void {
    this.getDatas();
    this.getEntity();
    this.getAppList();
  }


  /**
   * Getter for the `entityOrInstanceAttribute` form array.
   * @returns {FormArray} The form array containing attribute form groups.
   */
  get attributes(): FormArray {
    return this.entityForm?.get('entityOrInstanceAttribute') as FormArray;
  }

  /**
   * Adds a new attribute group to the `entityOrInstanceAttribute` form array.
   * @returns {void}
   */
  addAttribute(): void {
    const attributeGroup = this.fb.group({
      attributeName: ['', Validators.required],
      dataType: ['', Validators.required],
      unique: [false],
      attrList: [[]],
      nullable: [false],
      comments: [''],
      alias: [''],
      order: [this.attributes.length],
      decimalPlaces: [''],
      engineeringUnit: [''],
      collection: [false],
      timeSeries: [false],
      minValue: [''],
      maxValue: [''],
      validationRule: [''],
      acceptedQuality: [''],
      isLookup: [false],
      lookupId: [''],
      lookupAttribute: [''],
      dataSource: [''],
      timeFrequency: [[]],
      calculationTotal: [[]],
      calculationAverage: [[]],
      displayComponent: [[]],
      defaults: [[]],
      showRemoveButton: [true],
      tag: [''],
      dataTypeType: [''],
      attributes: [[]]
    });
    this.attributes.push(attributeGroup);
    this.setAlias(attributeGroup);
  }

  getAppList() {
    this.dataPointAdminService.getAppList().subscribe({
      next: (res: any) => {
        this.appList = res.apps.map((item: any) => ({
          id: item.appId,
          name: item.appName
        }))
      },
      error: (err) => {
      }
    })
  }

  /**
   * Removes an attribute group from the `entityOrInstanceAttribute` form array.
   * @param {number} index - Index of the attribute to remove.
   * @returns {void}
   */
  removeAttribute(index: number): void {
    this.attributes.removeAt(index);
  }

  /**
   * Closes the sidebar and passes the close event.
   * @param {Event} e - The close event.
   * @returns {void}
   */
  closeCallback(e: Event): void {
    window.history.back();
  }

  /**
   * Submits the form data to create or update an entity.
   * Converts the form data into the required format and makes an API call.
   * @returns {void}
   */
  onSubmit(): void {
    // if (this.entityForm.valid) {
    this.spinner.show();
    const convertedEntities = {
      entityId: this.entityId,
      type: 'Entity',
      entityName: this.entityForm.get('entityOrInstanceName')
        ?.value,
      entityDesc: this.entityForm.get('entityOrInstanceDesc')
        ?.value,
      entityLevel: this.entityForm.get('entityLevel')?.value,
      entityLevelName: this.entityForm.get('entityLevelName')?.value || 'OpsInsight',
      entityOrgLevel: this.entityForm.get('entityOrgLevel')?.value,
      isEntityOrInstance: this.entityForm.get('isEntityOrInstance')?.value,
      entityAttribute: this.entityForm
        .get('entityOrInstanceAttribute')
        ?.value.map((attribute: any) => ({
          attributeName: attribute.attributeName,
          dataPointID: attribute.dataType,
          minValue: attribute.minValue,
          maxValue: attribute.maxValue,
          defaults: attribute.defaults,
          isLookup: attribute.isLookup,
          validationRule: attribute.validationRule,
          acceptedQuality: attribute.acceptedQuality,
          unique: attribute.unique,
          isNull: attribute.nullable,
          decimalPlaces: attribute.decimalPlaces,
          engineeringUnit: attribute.engineeringUnit,
          comments: attribute.comments,
          dataSource: attribute.dataSource,
          value: attribute.value,
          lookupId: attribute.lookupId,
          collection: attribute.collection,
          timeSeries: attribute.timeSeries,
          timeFrequency: attribute.timeFrequency,
          calculationTotal: attribute.calculationTotal,
          calculationAverage: attribute.calculationAverage,
          displayComponent: attribute.displayComponent,
          lookupAttribute: attribute.lookupAttribute,
          alias: attribute.alias,
          authorizationID: '673t6tgukjku663109e2a86y7gugj',
          isActive: true,
          order: attribute.order,
          tag: attribute.tag,
          dataTypeType: attribute.dataTypeType,
          attributes: attribute.attributes,
        })),
    };
    this.dataPointAdminService.updateEntityOrInstance(convertedEntities).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Entity updated succesfully',
          life: 5000,
        });
        this.isShowAttribute = false;
      },
      error: (err) => {
        this.spinner.hide();
      },
    });
    // } else {
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: 'Fill out the required fields',
    //     life: 5000,
    //   });
    // }
  }

  /**
   * Clears the entity details and hides the attributes section.
   * Resets the `isShowAttribute` flag to false and clears the `entityDetails` array.
   *
   * @returns {void}
   */
  clearEntity(): void {
    this.isShowAttribute = false;
    this.entityDetails.length = 0;
  }


  getEntity() {
    this.dataPointAdminService.getEntityList({ type: 'Entity' }).subscribe({
      next: (res: any) => {
        this.entityList = res.Entity_Attributes.map((item: any) => ({
          entityId: item.entityOrInstanceId,
          entityName: item.entityOrInstanceName
        }))
      },
      error: (err) => {

      },
    })
  }

  /**
  * Fetches data points and entity detail using rxjs forkjoin from the API and processes the response.
  * Updates the `dataPoints` array with mapped data.
  * @returns {void}
  */
  getDatas(): void {
    this.spinner.show();
    forkJoin([this.dataPointAdminService.getDataPoints(), this.dataPointAdminService.getEntityDetailsById(this.entityId)]).subscribe({
      next: ([res1, res2]) => {
        this.dataPoints = res1.map((item: any) => ({
          dataType: item.display_name,
          dataTypeId: item.dataTypeId,
        }));
        this.patchValue(res2)
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  patchValue(entity_details: any): void {
    this.entityForm.patchValue({
      entityOrInstanceName: entity_details.entityDocuments.entityName,
      entityOrInstanceDesc: entity_details.entityDocuments.entityDesc,
      entityLevel: entity_details.entityDocuments.entityLevel,
      entityLevelName: entity_details.entityDocuments.entityLevelName,
      entityOrgLevel: entity_details.entityDocuments.entityOrgLevel,
      isEntityOrInstance: entity_details.entityDocuments.isEntityOrInstance
    })

    if (this.entityForm.get('entityLevel')?.value === 'Application') {
      this.getOrgs(entity_details.entityDocuments.entityLevelName);
      this.filteredOptions = this.appList
    }
    this.attributes.clear();

    entity_details.attributes.sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
    if (entity_details.attributes && Array.isArray(entity_details.attributes)) {
      entity_details.attributes.forEach((attribute: any) => {
        const attributeGroup = this.fb.group({
          attributeName: [attribute.attributeName || '', Validators.required],
          dataType: [attribute.dataPointID || '', Validators.required],
          minValue: [attribute.minValue || ''],
          maxValue: [attribute.maxValue || ''],
          defaults: [attribute.defaults || []],
          isLookup: [attribute.isLookup || false],
          validationRule: [attribute.validationRule || ''],
          acceptedQuality: attribute.acceptedQuality,
          unique: [attribute.unique || false],
          nullable: [attribute.isNull || false],
          decimalPlaces: [attribute.decimalPlaces || ''],
          engineeringUnit: [attribute.engineeringUnit || ''],
          comments: [attribute.comments || ''],
          dataSource: [attribute.dataSource || ''],
          lookupId: [attribute.lookupId || ''],
          collection: [attribute.collection || false],
          timeSeries: [attribute.timeSeries || false],
          timeFrequency: [attribute.timeFrequency || ''],
          calculationTotal: [attribute.calculationTotal || ''],
          calculationAverage: [attribute.calculationAverage || ''],
          displayComponent: [attribute.displayComponent || []],
          lookupAttribute: [attribute.lookupAttribute || ''],
          alias: [attribute.alias || ''],
          order: [attribute.order || this.attributes.length],
          attrList: [attribute.attrList || []],
          showRemoveButton: [true],
          tag: [attribute.tag || ''],
          dataTypeType: attribute.dataTypeType,
          attributes: [attribute.attributes || []],
        });
        this.attributes.push(attributeGroup);
        this.setAlias(attributeGroup);
      });
    }
  }

  onEntityLevelChange(event: any): void {
    const selectedEntity = event.value;
    this.entityForm.get('entityLevelName')?.reset();
    if (selectedEntity === 'Application') {
      this.subEntityLabel = 'Choose Application'
      if (this.appList.length === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No apps are created, please create an app or change the entity level',
          life: 5000,
        })
      }
      this.filteredOptions = this.appList;
    }
    else {
      this.filteredOptions = [];
    }
  }

  openLogs() {
    // this.ref = this.dialogService.open(LegalOrgComponent, {
    //   header: 'Logs',
    //   width: '70rem',
    //   contentStyle: { overflow: 'auto' },
    //   baseZIndex: 10000,
    //   data: {
    //     entityId: this.entityId
    //   }
    // });
    // this.ref.onClose.subscribe((res: any) => {
    // });
  }


  getEntityData(entityId: any, attribute: any) {
    this.dataPointAdminService.getAttributeList(entityId.entityId).subscribe({
      next: (res: any) => {
        const lookupAttrList = attribute.get('attrList');
        lookupAttrList.setValue(res.attributes);
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  drop(event: CdkDragDrop<any, any, any>) {
    moveItemInArray(this.attributes.controls, event.previousIndex, event.currentIndex);
    this.attributes.controls.forEach((control, index) => {
      control.get('order')?.setValue(index);
    });
    this.attributes.updateValueAndValidity();
  }

  moreActions(event: number) {
    const attributeData = this.attributes.controls[event]
    this.ref = this.dialogService.open(AttributeDialogComponent, {
      data: {
        id: event,
        attributeValue: attributeData.value,
        appId: this.appData?.appId,
        orgId: this.appData?.orgId
      },
      header: 'More Actions',
      width: '75rem',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res.status) {
        const attribute = this.attributes.controls[res.id];
        attribute.setValue(res.data)
      }
    });
  }

  /**
* Fetches the list of orgs for an application from the server with the help of page administrator service and updates the `app` property.
* Displays a spinner while the API call is in progress.
* Logs the error in the console if any.
* @param {string} appId - Application Id
* @returns {void}
*/
  getOrgs(appId: string): void {
    this.pageAdminService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {
        this.orgs = res.orgs.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }))
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  onAppChange(appId: string) {
    this.getOrgs(appId)
  }

  private setAlias(attributeGroup: FormGroup) {
    const entityNameCtrl = this.entityForm.get('entityOrInstanceName');
    const attributeNameCtrl = attributeGroup.get('attributeName');
    const aliasCtrl = attributeGroup.get('alias');
    combineLatest([
      entityNameCtrl!.valueChanges.pipe(startWith(entityNameCtrl!.value)),
      attributeNameCtrl!.valueChanges.pipe(startWith(attributeNameCtrl!.value))
    ]).subscribe(([entityName, attrName]) => {
      if (entityName && attrName) {
        const suggestedAlias = `${entityName}_${attrName}`;
        aliasCtrl!.setValue(suggestedAlias, { emitEvent: false });
      }
    });
  }
}
