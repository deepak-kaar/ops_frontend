import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { combineLatest, forkJoin, startWith } from 'rxjs';
import { ManageDefaultComponent } from '../../components/dialogs/manage-default/manage-default.component';
import { DatapointAdministrationService } from '../../datapoint-administration.service';

@Component({
  selector: 'app-create-attribute',
  standalone: false,
  templateUrl: './create-attribute.component.html',
  styleUrl: './create-attribute.component.css'
})
export class CreateAttributeComponent {
  ref: DynamicDialogRef | undefined;
  activeTabIndex: number = 0;
  entityList: [] = [];
  dataPoints: [] = [];
  defaultsArray: any[] = [];
  dataSource = ['Manual', 'Sensor', 'Calculated'];
  attributeLevel = ['Entity', 'Instance'];
  timeFrequencyCheckboxes = [
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
  displayComponents: any[] = []
  attributeId: string = ''
  attributeForm: FormGroup = new FormGroup({
    attributeId: new FormControl<string>(''),
    attributeName: new FormControl<string>('', Validators.required),
    entityId: new FormControl<string>(''),
    dataType: new FormControl<any>('', Validators.required),
    comments: new FormControl<string>(''),
    nullable: new FormControl<boolean>(false),
    attrLevel: new FormControl<string>('Orphan'),
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
    tag: new FormControl<string>(''),
    timeFrequency: new FormControl<any>(''),
    calculationTotal: new FormControl<any>(''),
    calculationAverage: new FormControl<any>(''),
    displayComponent: new FormControl<any>(''),
    defaults: new FormControl<any>([]),
    alias: new FormControl<string>(''),
    attributeLevel: new FormControl<string>('Opsinsight'),
    attributeLevelName: new FormControl<string>('Opsinsight'),
    attributeOrgLevel: new FormControl<string>(''),
  })
  products: [] = [];
  appData: any;
  constructor(private router: Router, private activateRoute: ActivatedRoute, private datapointAdminService: DatapointAdministrationService, public dialogService: DialogService, private spinner: NgxSpinnerService, private messageService: MessageService) {
    this.appData = this.router.getCurrentNavigation()?.extras.state;
  }

  ngOnInit() {
    if (this.appData?.appId) {
      this.attributeForm.patchValue({
        attributeLevel: 'Application',
        attributeLevelName: this.appData?.appId,
        attributeOrgLevel: this.appData?.orgId || ''
      });
    }
    this.getDatas();
    this.getDisplayComp();
  }
  getDatas() {
    forkJoin([this.datapointAdminService.getDataPoints()]).subscribe({
      next: ([res2]) => {
        if (res2) {
          this.dataPoints = res2.map((item: any) => ({
            dataType: item.display_name,
            dataTypeId: item.dataTypeId,
          }));
        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  getEntity() {
    this.spinner.show();
    let payload = {
      ...(this.appData?.appId && { appId: this.appData?.appId }),
      ...(this.appData?.orgId && { orgId: this.appData?.orgId })
    };
    this.datapointAdminService.getEntityList(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.entityList = res.Entity_Attributes.map((item: any) => ({
          id: item.entityId,
          name: item.entityName,
          level: item.entityLevel,
          levelName: item.entityLevelName,
          orgLevel: item.entityOrgLevel
        }));
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  getInstance() {
    this.spinner.show();
    let payload = {
      ...(this.appData?.appId && { appId: this.appData?.appId }),
      ...(this.appData?.orgId && { orgId: this.appData?.orgId })
    };

    this.datapointAdminService.getInstanceList(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.entityList = res.Instances.map((item: any) => ({
          id: item.instanceId,
          name: item.instanceName,
          level: item.instanceLevel,
          levelName: item.instanceLevelName,
          orgLevel: item.instanceOrgLevel
        }));
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

  async createDefault() {
    const min = await this.getMax();
    this.ref = this.dialogService.open(ManageDefaultComponent, {
      data: {
        mode: 'create',
        min: min,
        appId: this.appData?.appId,
        orgId: this.appData?.orgId,
      },
      header: 'Create Default',
      width: '50rem',
      modal: true,
      closable: true,
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
    });
    this.ref.onClose.subscribe((res: any) => {
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
      this.spinner.show();
      const defaults = this.attributeForm.get('defaults');
      defaults?.setValue(this.defaultsArray);
      const attribute = this.attributeForm.getRawValue();
      this.datapointAdminService.createAttribute(attribute).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Attribute Created Successfully' });
          this.router.navigateByUrl('/datapointAdmin/home/attribute')
        },
        error: (err) => {
          this.spinner.hide();
        }
      })
    }
  }

  closeCallback(e: Event): void {
    window.history.back();
  }

  deleteDefalut(index: number) {
    console.log(index);
    this.defaultsArray.splice(index, 1);
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
    this.ref = this.dialogService.open(ManageDefaultComponent, {
      data: {
        mode: 'edit',
        min: min,
        data: defaults,
        appId: this.appData?.appId,
        orgId: this.appData?.orgId,
      },
      header: 'Manage Default',
      width: '50rem',
      modal: true,
      closable: true,
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
    });
    this.ref.onClose.subscribe((res: any) => {
      if (res.status) {
        this.defaultsArray.splice(index, 1);
        this.defaultsArray.push(res.data)
      }
    });
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

  async getMax() {
    if (this.defaultsArray.length === 0) return 1;
    return Math.max(...this.defaultsArray.map(item => item.applyOrder), 1) + 1;
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

  onEntityChange(entity: any) {
    this.attributeForm.patchValue({
      attributeLevel: entity.level,
      attributeLevelName: entity.levelName,
      attributeOrgLevel: entity.Orglevel,
    })
  }

}
