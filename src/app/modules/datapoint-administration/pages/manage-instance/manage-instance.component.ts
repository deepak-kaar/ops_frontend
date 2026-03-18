import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { combineLatest, forkJoin, startWith } from 'rxjs';
import { AttributeDialogComponent } from '../../components/dialogs/attribute-dialog/attribute-dialog.component';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

/**
 * @component ManageInstanceComponent
 * This component is used to manage instances by providing a form to update them.
 * It includes functionality for managing attributes, and making API calls
 * to fetch data points and update instances.
 */
@Component({
  selector: 'app-manage-instance',
  standalone: false,
  templateUrl: './manage-instance.component.html',
  styleUrl: './manage-instance.component.css'
})
export class ManageInstanceComponent {
  ref: DynamicDialogRef | undefined;
  dataPoints: any[] | undefined; //Array of data points fetched from the API.
  instanceForm: FormGroup // Reactive from group for managing instance
  entityDetails: any[] = []; // array to store the entty details
  isShowAttribute: boolean = false; // variable to show or hide the entity attributes
  entityList: any[] = []; // array to store the entity list
  instanceId: string = '';
  orgList: any;
  dataSource = ['Manual', 'Sensor']
  isAdmin = true;
  createAccess = true;
  editAccess = true;
  appData: any;

 /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * Constructor initializes the form and injects necessary services.
   * @param {FormBuilder} fb - Service to create form controls and groups.
   * @param {AdminService} datapointAdminService - Service to handle API calls related to admin operations.
   * @param {Router} router - Service to handle routing
   * @param {MessageService} messageService - service to show the toast messages
   * @param {ActivatedRoute} activateRoute - service to fetch param from the route
   */
  constructor(private fb: FormBuilder, private datapointAdminService: DatapointAdministrationService,
    private spinner: NgxSpinnerService,
    private router: Router, private messageService: MessageService,
    private activateRoute: ActivatedRoute,
    public dialogService: DialogService
  ) {
    this.instanceForm = this.fb.group({
      type: ['Instance', Validators.required],
      InstanceName: ['', Validators.required],
      InstanceDesc: ['', Validators.required],
      entityId: ['', Validators.required],
      InstanceLevel: ['', Validators.required],
      InstanceLevelName: ['', Validators.required],
      InstanceOrgLevel: [''],
      InstanceAttribute: this.fb.array([]),
      InstanceLocation: [''],
    });

    this.activateRoute.paramMap.subscribe((params: any) => {
      this.instanceId = params.params.id;
    })
    this.appData = this.router.getCurrentNavigation()?.extras.state;
  }

  /**
* Lifecycle hook triggered after the component is initialized.
* Fetches data points from the API.
* @returns {void}
*/
  ngOnInit(): void {
    // this.getDataPoints();
    this.getDatas()
  }

  /**
* Fetches data points and entity lists in parallel using forkJoin.
* Processes and maps the results to `dataPoints` and `entityList` properties.
* @returns {void}
*/
  getDatas(): void {
    let payload = {
      ...(this.appData?.appId && { appId: this.appData?.appId }),
      ...(this.appData?.orgId && { orgId: this.appData?.orgId })
    };
    this.spinner.show();
    forkJoin([this.datapointAdminService.getDataPoints(), this.datapointAdminService.getEntityList(payload), this.datapointAdminService.getInstanceDetailsById(this.instanceId), this.datapointAdminService.getOrgList()]).subscribe({
      next: ([res1, res2, res3, res4]) => {
        this.spinner.hide();
        this.dataPoints = res1.map((item: any) => ({
          dataType: item.display_name,
          dataTypeId: item.dataTypeId,
        }));

        if (res2.length != 0) {
          this.entityList = res2.Entity_Attributes.map((item: any) => ({
            entityId: item.entityId,
            entityName: item.entityName
          }))
        }
        this.patchValue(res3)
        this.orgList = res4.Organization.map((org: any) => ({
          id: org.orgId,
          name: org.orgName
        }))
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  /**
* Getter for the `InstanceAttribute` form array.
* @returns {FormArray} The form array containing attribute form groups.
*/
  get instanceAttributes(): FormArray {
    return this.instanceForm?.get('InstanceAttribute') as FormArray;
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
      order: [this.instanceAttributes.length],
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
      timeFrequency: [''],
      calculationTotal: [[]],
      calculationAverage: [[]],
      displayComponent: [[]],
      defaults: [[]],
      showRemoveButton: [true],
      tag: [''],
      dataTypeType: [''],
      attributes: [[]],
    });
    this.instanceAttributes.push(attributeGroup);
    this.setupAliasAutoUpdate(attributeGroup);
  }

  /**
  * Removes an attribute group from the `entityOrInstanceAttribute` form array.
  * @param {number} index - Index of the attribute to remove.
  * @returns {void}
  */
  removeAttribute(index: number): void {
    this.instanceAttributes.removeAt(index);
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
    if (this.instanceForm.valid) {
      this.spinner.show();
      const convertedEntities = {
        type: 'Instance',
        instanceId: this.instanceId,
        instanceName: this.instanceForm.get('InstanceName')?.value,
        instanceDesc: this.instanceForm.get('InstanceDesc')?.value,
        entityLookupId: this.instanceForm.get('entityId')?.value,
        instanceLevel: this.instanceForm.get('InstanceLevel')?.value,
        instanceLevelName: this.instanceForm.get('InstanceLevelName')?.value,
        instanceOrgLevel: this.instanceForm.get('InstanceOrgLevel')?.value,
        instanceLocation: this.instanceForm.get('InstanceLocation')?.value,
        instanceAttribute: this.instanceForm.get('InstanceAttribute')?.value.map((attribute: any) => ({
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
        }))
      };
      this.datapointAdminService.updateInstance(convertedEntities).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Instance updated succesfully', life: 5000 });
          this.instanceForm.reset();
          this.instanceAttributes.clear();
          this.isShowAttribute = false;
        },
        error: (err) => {
          this.spinner.hide();
        }
      })
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Fill out the required fields', life: 5000 })
    }
  }

  /**
* Handles the change event for the dropdown and fetches entity details by ID.
* Sets the `isShowAttribute` flag to true and assigns the attributes of the fetched entity to `entityDetails`.
* Logs the response or error using the logger service.
*
* @param {DropdownChangeEvent} event - The dropdown change event containing the selected entity's details.
* @returns {void}
*/
  getEntityData(event: DropdownChangeEvent): void {
    if (event.value) {
      this.datapointAdminService.getEntityDetailsById(event.value.entityId).subscribe({
        next: (res: any) => {
          this.isShowAttribute = true;
          this.entityDetails = res.attributes
          this.instanceAttributes.clear();
          this.instanceForm.patchValue({
            InstanceLevel: event.value.entityLevel,
            InstanceLevelName: event.value.entityLevelName,
            InstanceOrgLevel: event.value.entityOrgLevel,
          })
          if (this.entityDetails && Array.isArray(this.entityDetails)) {
            this.entityDetails.forEach((attribute: any) => {
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
                timeFrequency: [attribute.timeFrequency || []],
                calculationTotal: [attribute.calculationTotal || []],
                calculationAverage: [attribute.calculationAverage || []],
                displayComponent: [attribute.displayComponent || []],
                lookupAttribute: [attribute.lookupAttribute || ''],
                alias: [attribute.alias || ''],
                order: [attribute.order || this.instanceAttributes.length],
                attrList: [attribute.attrList || []],
                showRemoveButton: [true],
                tag: [attribute.tag || ''],
                dataTypeType: [attribute.dataTypeType || 'Primitive'],
                attributes: [attribute.attributes || []],
              });

              const lookupIdControl = attributeGroup.get('lookupId');
              if (attributeGroup.get('isLookup')?.value) {
                lookupIdControl?.setValidators(Validators.required);
              }
              lookupIdControl?.updateValueAndValidity();
              this.instanceAttributes.push(attributeGroup);
              this.setupAliasAutoUpdate(attributeGroup);
            });
          }
        },
        error: (err) => {
        }
      })
    }
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

  patchValue(entity_details: any): void {
    this.instanceForm.patchValue({
      InstanceName: entity_details.instanceDocuments.instanceName,
      InstanceDesc: entity_details.instanceDocuments.instanceDesc,
      InstanceLevel: entity_details.instanceDocuments?.instanceLevel || ' ',
      InstanceLevelName: entity_details.instanceDocuments?.instanceLevelName,
      InstanceOrgLevel: entity_details.instanceDocuments?.instanceOrgLevel,
      InstanceLocation: entity_details.instanceDocuments?.instanceLocation,
      entityId: entity_details.instanceDocuments?.entityLookupId
    })
    this.instanceAttributes.clear();
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
          timeFrequency: [attribute.timeFrequency || []],
          calculationTotal: [attribute.calculationTotal || []],
          calculationAverage: [attribute.calculationAverage || []],
          displayComponent: [attribute.displayComponent || []],
          lookupAttribute: [attribute.lookupAttribute || ''],
          alias: [attribute.alias || ''],
          order: [attribute.order || this.instanceAttributes.length],
          attrList: [attribute.attrList || []],
          showRemoveButton: [true],
          tag: [attribute.tag || ''],
          dataTypeType: [attribute.dataTypeType || ''],
          attributes: [attribute.attributes || []],
        });
        this.instanceAttributes.push(attributeGroup);
        // this.setupAliasAutoUpdate(attributeGroup);
      });
    }
  }

  drop(event: CdkDragDrop<any, any, any>) {
    moveItemInArray(this.instanceAttributes.controls, event.previousIndex, event.currentIndex);
    this.instanceAttributes.controls.forEach((control, index) => {
      control.get('order')?.setValue(index);
    });
    this.instanceAttributes.updateValueAndValidity();
  }

  moreActions(event: number) {
    const attributeData = this.instanceAttributes.controls[event]
    this.ref = this.dialogService.open(AttributeDialogComponent, {
      data: {
        id: event,
        attributeValue: attributeData.getRawValue(),
        appId: this.appData?.appId,
        orgId: this.appData?.orgId
      },
      header: 'More Actions',
      modal: true,
      closable: true,
      width: '75rem',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res.status) {
        const attribute = this.instanceAttributes.controls[res.id];
        attribute.setValue(res.data)
      }
    });
  }

  private setupAliasAutoUpdate(attributeGroup: FormGroup): void {
    const parentEntityName = this.instanceForm.get('entityId')?.value
    const entityNameCtrl = this.instanceForm.get('InstanceName');
    const attributeNameCtrl = attributeGroup.get('attributeName');
    const aliasCtrl = attributeGroup.get('alias');
    combineLatest([
      entityNameCtrl!.valueChanges.pipe(startWith(entityNameCtrl!.value)),
      attributeNameCtrl!.valueChanges.pipe(startWith(attributeNameCtrl!.value))
    ]).subscribe(([entityName, attrName]) => {
      if (entityName && attrName) {
        const suggestedAlias = `${parentEntityName.entityName}$${entityName}$${attrName}`;
        aliasCtrl!.setValue(suggestedAlias, { emitEvent: false });
      }
    });
  }
}
