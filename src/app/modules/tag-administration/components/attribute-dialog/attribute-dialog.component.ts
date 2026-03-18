import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DynamicDialogRef, DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { forkJoin } from 'rxjs';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { ManageDefaultComponent } from '../manage-default/manage-default.component';

@Component({
  selector: 'app-attribute-dialog',
  standalone: false,
  templateUrl: './attribute-dialog.component.html',
  styleUrls: ['./attribute-dialog.component.css']
})
export class AttributeDialogComponent {
  ref1: DynamicDialogRef | undefined;
  activeTabIndex: number = 0;
  entityList: [] = [];
  entityDataList: [] = [];
  dataPoints: [] = [];
  dataType = ['Primitive', 'Link Object Id', 'Embedded Object']
  defaultsArray: any[] = [];
  tags: [] = [];
  appId: string = '';
  orgId: string = '';
  attributes: [] = [];
  payload: any
  dataSource = ['Manual', 'Sensor', 'Calculated'];
  timeFrequencyCheckboxes = [
    { id: 1, label: 'Current', selected: false },
    { id: 2, label: 'Hourly', selected: false },
    { id: 3, label: 'Shift', selected: false },
    { id: 4, label: 'Day', selected: false },
    { id: 5, label: 'Week', selected: false },
    { id: 6, label: 'Month', selected: false },
    { id: 7, label: 'Quarterly', selected: false },
    { id: 8, label: 'Semi Annual', selected: false },
    { id: 9, label: 'Year', selected: false }
  ];

  calculationTotalCheckboxes = [
    { id: 1, label: 'MTD', selected: false },
    { id: 2, label: 'YTD', selected: false },
    // { id: 1, label: 'Current', selected: false },
    // { id: 2, label: 'Hourly', selected: false },
    // { id: 3, label: 'Shift', selected: false },
    // { id: 4, label: 'Day', selected: false },
    // { id: 5, label: 'Week', selected: false },
    // { id: 6, label: 'Month', selected: false },
    // { id: 7, label: 'Quarterly', selected: false },
    // { id: 8, label: 'Semi Annual', selected: false },
    // { id: 9, label: 'Year', selected: false }
  ];

  calculationAverageCheckboxes = [
    { id: 1, label: 'MTD', selected: false },
    { id: 2, label: 'YTD', selected: false },
    // { id: 1, label: 'Current', selected: false },
    // { id: 2, label: 'Hourly', selected: false },
    // { id: 3, label: 'Shift', selected: false },
    // { id: 4, label: 'Day', selected: false },
    // { id: 5, label: 'Week', selected: false },
    // { id: 6, label: 'Month', selected: false },
    // { id: 7, label: 'Quarterly', selected: false },
    // { id: 8, label: 'Semi Annual', selected: false },
    // { id: 9, label: 'Year', selected: false }
  ];
  displayComponents: any[] = []
  attributeId: string = ''
  attributeForm: FormGroup = new FormGroup({
    attributeName: new FormControl<string>(''),
    dataTypeType: new FormControl<any>(''),
    dataType: new FormControl<any>(''),
    comments: new FormControl<string>(''),
    nullable: new FormControl<boolean>(false),
    decimalPlaces: new FormControl<any>(''),
    engineeringUnit: new FormControl<any>(''),
    unique: new FormControl<boolean>(false),
    collection: new FormControl<boolean>(false),
    timeSeries: new FormControl<boolean>(false),
    minValue: new FormControl<any>(''),
    maxValue: new FormControl<any>(''),
    validationRule: new FormControl<any>(''),
    acceptedQuality: new FormControl<any>(''),
    isLookup: new FormControl<boolean>(false),
    lookupId: new FormControl<any>(''),
    lookupAttribute: new FormControl<any>(''),
    dataSource: new FormControl<string>(''),
    attrList: new FormControl<any>([]),
    timeFrequency: new FormControl<any>(''),
    calculationTotal: new FormControl<any>(''),
    calculationAverage: new FormControl<any>(''),
    displayComponent: new FormControl<any>([]),
    defaults: new FormControl<any>([]),
    alias: new FormControl<any>(''),
    order: new FormControl<number>(0),
    tag: new FormControl<string>(''),
    attributes: new FormControl<string[]>([]),
    showRemoveButton: new FormControl<boolean>(false)
  })
  isShowUi: boolean = false;
  products: [] = [];
  constructor(private router: Router, private activateRoute: ActivatedRoute,
    private datapointAdminService: DatapointAdministrationService,
    public dialogService: DialogService,
    private spinner: NgxSpinnerService,
    public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef
  ) {

  }

  ngOnInit() {
    if (this.dialogConfig.data) {
      console.log("Attr Value", this.dialogConfig.data);
      this.getAttributes(this.dialogConfig.data.attributeValue?.dataType?.dataTypeId);
      this.appId = this.dialogConfig.data?.appId;
      this.orgId = this.dialogConfig.data?.orgId;
      if (!this.dialogConfig.data.attributeValue?.showRemoveButton) {
        this.attributeForm.get('attributeName')?.disable({ onlySelf: true });
        this.attributeForm.get('dataType')?.disable({ onlySelf: true });
        this.attributeForm.get('dataTypeType')?.disable({ onlySelf: true });
        this.attributeForm.get('defaults')?.disable({ onlySelf: true });
        this.attributeForm.get('nullable')?.disable({ onlySelf: true });
        this.attributeForm.get('comments')?.disable({ onlySelf: true });
        this.attributeForm.get('isLookup')?.disable({ onlySelf: true });
        this.attributeForm.get('unique')?.disable({ onlySelf: true });
      }
      const attr = this.dialogConfig.data.attributeValue || {};
      this.attributeForm.patchValue(attr);
      console.log(this.attributeForm.getRawValue());
      this.defaultsArray = this.dialogConfig.data?.attributeValue?.defaults
      const timeFreqValues = this.attributeForm.get('timeFrequency')?.value || [];
      this.timeFrequencyCheckboxes.forEach(check => {
        check.selected = timeFreqValues.includes(check.label);
      });
      const totalValues = this.attributeForm.get('calculationTotal')?.value || [];
      this.calculationTotalCheckboxes.forEach(check => {
        check.selected = totalValues.includes(check.label);
      });
      const avgValues = this.attributeForm.get('calculationAverage')?.value || [];
      this.calculationAverageCheckboxes.forEach(check => {
        check.selected = avgValues.includes(check.label);
      });
      this.payload = {
        ...(this.appId && { appId: this.appId }),
        ...(this.orgId && { orgId: this.orgId })
      };
      this.getDatas();
      this.getDisplayComp();
    }

  }
  getDatas() {
    this.spinner.show();
    forkJoin([this.datapointAdminService.getEntityList(this.payload), this.datapointAdminService.getDataPoints(), this.datapointAdminService.getAttrList(this.payload)]).subscribe({
      next: ([res1, res2, res3]) => {
        this.spinner.hide();
        if (res1) {
          this.entityList = res1.Entity_Attributes
            .map((item: any) => ({
              entityId: item.entityId,
              entityName: item.entityName
            }));
          this.entityDataList = res1.Entity_Attributes
            .map((item: any) => ({
              dataTypeId: item.entityId,
              dataType: item.entityName
            }));
        }
        if (res2) {
          this.dataPoints = res2.map((item: any) => ({
            dataType: item.display_name,
            dataTypeId: item.dataTypeId,
          }));
        }
        if (res3) {
          this.tags = res3[0].attributes.map((tag: any) => ({
            tagId: tag.attributeId,
            tagName: tag.attributeName,
            tagAlias: tag.alias
          }))
        }

        this.isShowUi = true;
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
        this.isShowUi = true;
      }
    })
  }

  getDisplayComp() {
    this.datapointAdminService.getTemplateList({ templateType: 'Display Component' }).subscribe({
      next: (res: any) => {
        this.displayComponents = res.template.map((item: any) => ({
          id: item.templateId,
          name: item.templateName,
          type: 'custom'
        }));

        this.displayComponents.push({ id: 1, "type": "standard", "name": "Input Text" },
          { id: 2, "type": "standard", "name": "Dropdown" },
          { id: 3, "type": "standard", "name": "Radio Button" },
          { id: 4, "type": "standard", "name": "Checkbox" })
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
  async createDefault() {
    const min = await this.getMax();
    this.ref1 = this.dialogService.open(ManageDefaultComponent, {
      data: {
        min: min,
        mode: 'create',
      },
      header: 'Create Default',
      width: '50rem',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true
    });
    this.ref1.onClose.subscribe((res: any) => {
      if (res.status) {
        this.defaultsArray.push(res.data)
      }
    });
  }

  onLookup() {
    const lookupIdControl = this.attributeForm.get('lookupId');
    const lookupAttrControl = this.attributeForm.get('lookupAttribute');
    if (this.attributeForm.get('isLookup')?.value) {
      lookupIdControl?.setValidators(Validators.required);
      lookupAttrControl?.setValidators(Validators.required);
    }
    else {
      lookupIdControl?.clearValidators();
      lookupAttrControl?.clearValidators();
    }
    lookupIdControl?.updateValueAndValidity();
    lookupAttrControl?.updateValueAndValidity();
  }

  getEntityData(entityId: any) {
    this.datapointAdminService.getAttributeList(entityId.entityId).subscribe({
      next: (res: any) => {
        const lookupAttrList = this.attributeForm.get('attrList');
        lookupAttrList?.setValue(res.attributes);
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  submit() {
    if (this.attributeForm.valid) {
      // this.spinner.show();
      const defaults = this.attributeForm.get('defaults');
      defaults?.setValue(this.defaultsArray);
      const attribute = this.attributeForm.getRawValue();
      this.ref.close({
        status: true,
        id: this.dialogConfig.data.id,
        data: attribute
      });
    }
  }

  onRowReorder(event: any) {
    const dragIndex = event.dragIndex;
    const dropIndex = event.dropIndex;
    const draggedApplyOrder = this.defaultsArray[dropIndex].applyOrder;
    const droppedApplyOrder = this.defaultsArray[dragIndex].applyOrder;
    this.defaultsArray[dropIndex].applyOrder = droppedApplyOrder;
    this.defaultsArray[dragIndex].applyOrder = draggedApplyOrder;
  }

  async manageDefault(index: number, defaults: any) {
    const min = await this.getMax();
    this.ref1 = this.dialogService.open(ManageDefaultComponent, {
      data: {
        min: min,
        mode: 'edit',
        data: defaults
      },
      header: 'Manage Default',
      width: '50rem',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true
    });
    this.ref1.onClose.subscribe((res: any) => {
      if (res?.status) {
        this.defaultsArray.splice(index, 1);
        this.defaultsArray.push(res.data)
      }
    });
  }

  deleteDefalut(index: number) {
    console.log(index);
    this.defaultsArray.splice(index, 1);
  }
  async getMax() {
    if (this.defaultsArray.length === 0) return 1;
    return Math.max(...this.defaultsArray.map(item => item.applyOrder), 1) + 1;
  }

  onSavingChange(option: any, event: any) {
    option.selected = event.checked;
    // Rebuild the array of selected values
    const selectedValues = this.timeFrequencyCheckboxes
      .filter(item => item.selected)
      .map(item => item.label);

    // Update form control
    this.attributeForm.get('timeFrequency')?.setValue(selectedValues);
  }
  onTotalChange(option: any, event: any) {
    option.selected = event.checked;
    // Rebuild the array of selected values
    const selectedValues = this.calculationTotalCheckboxes
      .filter(item => item.selected)
      .map(item => item.label);

    // Update form control
    this.attributeForm.get('calculationTotal')?.setValue(selectedValues);
  }
  onAverageChange(option: any, event: any) {
    option.selected = event.checked;
    // Rebuild the array of selected values
    const selectedValues = this.calculationAverageCheckboxes
      .filter(item => item.selected)
      .map(item => item.label);

    // Update form control
    this.attributeForm.get('calculationAverage')?.setValue(selectedValues);
  }

  getAttributes(entityId: string) {
    if (!entityId || entityId.trim() === '') {
      console.warn('Invalid entityId');
      this.attributes = [];
      return;
    }

    this.datapointAdminService.getEntityDetailsById(entityId).subscribe({
      next: (res: any) => {
        if (!res || !res.attributes) {
          this.attributes = [];
          return;
        }

        this.attributes = res.attributes.map((item: any) => ({
          attributeId: item.attributeId,
          attributeName: item.attributeName
        }));
      },
      error: (err) => {
        console.error('Failed to fetch attributes:', err);
        // Handle specific 404
        if (err.status === 404) {
          console.warn('Entity not found (404)');
          this.attributes = []; // reset gracefully
        }
      }
    });
  }


  onEntityChange(entityId: any) {
    this.getAttributes(entityId.dataTypeId);
  }

}
