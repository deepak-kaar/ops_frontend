import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
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
* @component CreateInstanceComponent
* This component is used to create instances by providing a form to create or edit them.
* It includes functionality for managing attributes, and making API calls
* to fetch data points and create instances.
*/
@Component({
  selector: 'app-create-instance',
  standalone: false,
  templateUrl: './create-instance.component.html',
  styleUrl: './create-instance.component.css'
})
export class CreateInstanceComponent {
  ref: DynamicDialogRef | undefined;
  dataPoints: any[] | undefined; //Array of data points fetched from the API.
  instanceForm: FormGroup // Reactive from group for managing instance
  entityDetails: any[] = []; // array to store the entty details
  isShowAttribute: boolean = false; // variable to show or hide the entity attributes
  entityList: any[] = []; // array to store the entity list
  entityList1: any[] = []; // array to store the entity list
  orgList: any;
  dataSource = ['Manual', 'Sensor']
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
   * @param {AdminService} adminService - Service to handle API calls related to admin operations.
   * @param {LoggerService} logger - Service to handle logging.
   * @param {Router} router - Service to handle routing
   * @param {MessageService} messageService - service to sho the toast messages
   */
  constructor(private fb: FormBuilder, private datapointAdminService: DatapointAdministrationService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private messageService: MessageService,
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
      InstanceLocation: ['']
    });
    this.appData = this.router.getCurrentNavigation()?.extras.state;

  }

  /**
* Lifecycle hook triggered after the component is initialized.
* Fetches data points from the API.
* @returns {void}
*/
  ngOnInit(): void {
    this.getDatas();
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
    console.log(payload);
    this.spinner.show();
    forkJoin([this.datapointAdminService.getDataPoints(), this.datapointAdminService.getEntityList(payload), this.datapointAdminService.getOrgList()]).subscribe({
      next: ([res1, res2, res3]) => {
        this.spinner.hide();
        this.dataPoints = res1.map((item: any) => ({
          dataType: item.display_name,
          dataTypeId: item.dataTypeId,
        }));
        if (res2.length != 0) {
          this.entityList1 = res2.Entity_Attributes;
          this.entityList = res2.Entity_Attributes.map((item: any) => ({
            entityId: item.entityId,
            entityName: item.entityName,
            entityLevel: item.entityLevel,
            entityLevelName: item.entityLevelName,
            entityOrgLevel: item.entityOrgLevel
          }))
        }
        this.orgList = res3.Organization.map((org: any) => ({
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
      timeFrequency: [[]],
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
      const instanceAttributes = this.instanceForm.getRawValue();
      this.spinner.show();
      const foundObject = this.entityList1.find((item: any) => item.entityId === this.instanceForm.get('entityId')?.value.entityId);

      //console.log(foundObject)
      const convertedEntities = {
        type: 'Instance',
        instanceName: this.instanceForm.get('InstanceName')?.value,
        instanceDesc: this.instanceForm.get('InstanceDesc')?.value,
        entityLookupId: this.instanceForm.get('entityId')?.value.entityId,
        instanceLevel: this.instanceForm.get('InstanceLevel')?.value || 'Opsinsight',
        instanceLevelName: this.instanceForm.get('InstanceLevelName')?.value || 'Opsinsight',
        instanceOrgLevel: this.instanceForm.get('InstanceOrgLevel')?.value,
        instanceLocation: this.instanceForm.get('InstanceLocation')?.value,
        entityFormId: foundObject?.entityFormId,
        instanceAttribute: instanceAttributes.InstanceAttribute.map((attribute: any) => ({
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
        appId: foundObject?.entityLevelName,
        orgId: foundObject?.entityOrgLevel
      };

      //console.log(convertedEntities)
      this.datapointAdminService.createInstance(convertedEntities).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Instance created succesfully', life: 5000 });
          this.resetForm();
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
                showRemoveButton: [false],
                tag: [attribute.tag || ''],
                dataTypeType: [attribute.dataTypeType || 'Primitive'],
                attributes: [attribute.attributes || []],
              });


              attributeGroup.controls['attributeName'].disable({ onlySelf: true });
              attributeGroup.controls['dataType'].disable({ onlySelf: true });
              attributeGroup.controls['minValue'].disable({ onlySelf: true });
              attributeGroup.controls['maxValue'].disable({ onlySelf: true });
              attributeGroup.controls['defaults'].disable({ onlySelf: true });
              attributeGroup.controls['nullable'].disable({ onlySelf: true });
              attributeGroup.controls['comments'].disable({ onlySelf: true });
              attributeGroup.controls['isLookup'].disable({ onlySelf: true });
              attributeGroup.controls['unique'].disable({ onlySelf: true });

              const lookupIdControl = attributeGroup.get('lookupId');
              if (attributeGroup.get('isLookup')?.value) {
                lookupIdControl?.setValidators(Validators.required);
              }
              lookupIdControl?.updateValueAndValidity();
              this.instanceAttributes.push(attributeGroup);
              this.setupAliasAutoUpdate(attributeGroup);
            });

            this.instanceForm.patchValue({
              InstanceLevel: event.value.entityLevel,
              InstanceLevelName: event.value.entityLevelName,
              InstanceOrgLevel: event.value.entityOrgLevel,
            })
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

  /**
 * Resets the form, including clearing validation states and form arrays.
 * @returns {void}
 */
  resetForm(): void {
    this.instanceForm.reset(); // Resets values and sets pristine/untouched
    this.instanceAttributes.clear(); // Clears form array completely

    // Ensure all controls' validation state is reset
    Object.keys(this.instanceForm.controls).forEach((key) => {
      const control = this.instanceForm.get(key);
      control?.setErrors(null); // Clears errors
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });

    this.isShowAttribute = false; // Reset additional state


    this.instanceForm = this.fb.group({
      type: ['Instance', Validators.required],
      InstanceName: ['', Validators.required],
      InstanceDesc: ['', Validators.required],
      entityId: ['', Validators.required],
      orgId: ['', Validators.required],
      InstanceAttribute: this.fb.array([]),
    })
  }

  onLookup(attribute: any) {
    const lookupIdControl = attribute.get('lookupId');
    if (attribute.get('isLookup')?.value) {
      lookupIdControl?.setValidators(Validators.required);
    }
    else {
      lookupIdControl?.clearValidators();
    }
    lookupIdControl?.updateValueAndValidity();
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
      width: '75rem',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true
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
