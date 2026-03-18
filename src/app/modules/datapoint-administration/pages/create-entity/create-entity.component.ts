import { Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { DatapointAdministrationService } from '../../datapoint-administration.service';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AttributeDialogComponent } from '../../components/dialogs/attribute-dialog/attribute-dialog.component';
import { combineLatest, Observable, startWith } from 'rxjs';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
/**
 * @component CreateEntityComponent
 * This component is used to create entities by providing a form to create or edit them.
 * It includes functionality for managing attributes, and making API calls
 * to fetch data points and create entities.
 */
@Component({
  selector: 'app-create-entity',
  standalone: false,
  templateUrl: './create-entity.component.html',
  styleUrl: './create-entity.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CreateEntityComponent {

  ref: DynamicDialogRef | undefined;
  filteredOptions: [] = [];
  appList: [] = [];
  subEntityLabel: string | undefined;
  entityList: any;
  dataPoints: any[] | undefined; //Array of data points fetched from the API.
  entityForm: FormGroup; //Reactive form group for managing the entity.
  entityDetails: any[] = [];
  isShowAttribute: boolean = false;
  activeTabIndex: number = 0;
  entityLevel = ['Application', 'Opsinsight'];
  dataSource = ['Manual', 'Sensor'];
  attrList: any[] = [];
  isShowApp: boolean = false;
  isAdmin = true;
  createAccess = true;
  editAccess = true;
  appData: any;
  orgs: any;

  /**
     * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device or web.
     */
  isMobile$!: Observable<boolean>;
  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * Constructor initializes the form and injects necessary services.
   * @param {FormBuilder} fb - Service to create form controls and groups.
   * @param {DatapointAdministrationService} datapointAdminService - Service to handle API calls related to admin operations.
   * @param {PageAdministratorService} pageAdminService - Service to handle logging.
   * @param {Router} router - Service to handle routing
   * @param {MessageService} messageService - service to sho the toast messages
   */
  constructor(
    private fb: FormBuilder,
    private datapointAdminService: DatapointAdministrationService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private messageService: MessageService,
    public dialogService: DialogService,
    private pageAdminService: PageAdministratorService,
    private responsive: ResponsiveService
  ) {
    this.getAppList();
    this.entityForm = this.fb.group({
      type: ['Entity', Validators.required],
      entityOrInstanceName: ['', Validators.required],
      entityOrInstanceDesc: ['', Validators.required],
      entityLevel: ['', Validators.required],
      entityLevelName: [''],
      entityOrgLevel: [''],
      entityOrInstanceAttribute: this.fb.array([]),
      isEntityOrInstance: [true]
    });

    this.appData = this.router.getCurrentNavigation()?.extras.state;
    this.getOrgs(this.appData?.appId);
    this.addAttribute();
  }

  /**
   * Lifecycle hook triggered after the component is initialized.
   * Fetches data points from the API.
   * @returns {void}
   */
  ngOnInit(): void {
    if (this.appData?.appId) {
      this.entityForm.patchValue({
        entityLevel: 'Application',
        entityLevelName: this.appData?.appId,
        entityOrgLevel: this.appData?.orgId || ''
      });
      this.isShowApp = true;
    }
    this.getEntity();
    this.getDataPoints();
    this.isMobile$ = this.responsive.isMobile$()

  }

  /**
   * Fetches data points from the API and processes the response.
   * Updates the `dataPoints` array with mapped data.
   * @returns {void}
   */
  getDataPoints(): void {
    this.datapointAdminService.getDataPoints().subscribe({
      next: (res: any) => {
        this.dataPoints = res.map((item: any) => ({
          dataType: item.display_name,
          dataTypeId: item.dataTypeId,
        }));

      },
      error: (err) => {

      },
    });
  }


  /**
   * Fetches existing entity list from the API and processes the response.
   * Updates the `entityList` array with mapped data.
   * @returns {void}
   */
  getEntity(): void {
    this.datapointAdminService.getEntityList({ type: 'Entity' }).subscribe({
      next: (res: any) => {
        this.entityList = res.Entity_Attributes.map((item: any) => ({
          entityId: item.entityOrInstanceId,
          entityName: item.entityOrInstanceName
        }))
      },
      error: (err) => {
        console.log(err);
      },
    })
  }

  /**
   * Fetches App list from the API and processes the response.
   * Updates the `appList` array with mapped data.
   * @returns {void}
   */
  getAppList(): void {
    this.datapointAdminService.getAppList().subscribe({
      next: (res: any) => {
        this.appList = res.apps.map((item: any) => ({
          id: item.appId,
          name: item.appName
        }))
        this.filteredOptions = this.appList
      },
      error: (err) => {
      }
    })
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
      dataType: [''],
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
      attributes: [[]],
    });
    this.attributes.push(attributeGroup);

    // Auto-update alias
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
    if (this.entityForm.valid) {
      this.spinner.show();
      const convertedEntities = {
        type: 'Entity',
        entityName: this.entityForm.get('entityOrInstanceName')
          ?.value,
        entityDesc: this.entityForm.get('entityOrInstanceDesc')
          ?.value,
        entityLevel: this.entityForm.get('entityLevel')?.value || 'Opsinsight',
        entityLevelName: this.entityForm.get('entityLevelName')?.value || 'Opsinsight',
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
        appId: this.entityForm.get('entityLevelName')?.value || '',
        orgId: this.entityForm.get('entityOrgLevel')?.value || ''
      };

      // console.log(convertedEntities);
      this.datapointAdminService.createEntity(convertedEntities).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Entity created succesfully',
            life: 5000,
          });
          this.resetForm();
          this.isShowAttribute = false;
          this.addAttribute();
        },
        error: (err) => {
          this.spinner.hide();
        },
      });
    } else {
      console.log('Form errors:', this.entityForm.errors);
      console.log('Invalid fields:', Object.keys(this.entityForm.controls).filter(key => this.entityForm.get(key)?.invalid));
      this.attributes.controls.forEach((control, i) => {
        if (control.invalid) {
          console.log(`Attribute ${i} errors:`, control.errors);
          console.log(`Attribute ${i} invalid fields:`, Object.keys(control.value).filter(key => control.get(key)?.invalid));
        }
      });
      this.entityForm.markAllAsTouched();
      this.attributes.controls.forEach(control => control.markAllAsTouched());
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Fill out the required fields',
        life: 5000,
      });
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
 * Resets the entity form and clears the attributes array.
 * Ensure all controls' validation state is reset
 * Reintialises the entityForm and calls the get entity method`.
 * @returns {void}
 */
  resetForm(): void {

    this.entityForm.reset(); // Resets values and sets pristine/untouched
    this.attributes.clear(); // Clears form array completely

    // Ensure all controls' validation state is reset
    Object.keys(this.entityForm.controls).forEach((key) => {
      const control = this.entityForm.get(key);
      control?.setErrors(null); // Clears errors
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });

    this.isShowAttribute = false; // Reset additional state
    this.entityForm = this.fb.group({
      type: ['Entity', Validators.required],
      entityOrInstanceName: ['', Validators.required],
      entityOrInstanceDesc: ['', Validators.required],
      entityLevel: ['', Validators.required],
      entityLevelName: [''],
      entityOrInstanceAttribute: this.fb.array([]),
    });
    this.getEntity();
  }


  /**
* Gets the event paylaod from the dropdown change resets the entityLevel formcontrol in entityForm array.
* sets the filteredOpstoins array with applist
* @param {any} event - event gets the event from dropdown change
* if appList is empty opens the Toast message using message service`.
* @returns {void}
*/
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
      this.isShowApp = true;
    }
    else {
      this.filteredOptions = [];
      this.isShowApp = false;
    }
  }

  onLookup(attribute: any) {
    const lookupIdControl = attribute.get('lookupId');
    const lookupAttrControl = attribute.get('lookupAttribute');
    if (attribute.get('isLookup')?.value) {
      lookupIdControl?.setValidators(Validators.required);
      lookupAttrControl?.setValidators(Validators.required);
    }
    else {
      lookupIdControl?.clearValidators();
      lookupAttrControl?.clearValidators();
    }
    lookupIdControl?.updateValueAndValidity();
    lookupAttrControl.updateValueAndValidity();
  }

  getEntityData(entityId: any, attribute: any) {
    this.datapointAdminService.getAttributeList(entityId.entityId).subscribe({
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
      height: '60rem',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      modal: true,
      closable: true
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res?.status) {
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
}
