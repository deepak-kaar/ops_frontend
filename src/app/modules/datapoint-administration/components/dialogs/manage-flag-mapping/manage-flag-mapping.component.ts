import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatapointAdministrationService } from '../../../datapoint-administration.service';

@Component({
  selector: 'app-manage-flag-mapping',
  standalone: false,
  templateUrl: './manage-flag-mapping.component.html',
  styleUrl: './manage-flag-mapping.component.css'
})
export class ManageFlagMappingComponent {

  mappingForm: FormGroup
  mode: string = '';
  appData: any;
  flagInput: any;
  typeOptions: { [key: number]: any[] } = {};
  attributesOptions: { [key: number]: any[] } = {};
  outputtypeOptions: { [key: number]: any[] } = {};
  outputattributesOptions: { [key: number]: any[] } = {};
  frequencyOptions = [{
    name: 'Hour',
    type: 'H'
  },
  {
    name: 'Day',
    type: 'D'
  },
  {
    name: 'Week',
    type: 'W'
  },
  {
    name: 'Month',
    type: 'M'
  },
  {
    name: 'Quarterly',
    type: 'Q'
  },
  {
    name: 'Semi Annual',
    type: 'S'
  },
  {
    name: 'Year',
    type: 'Y'
  }];
  flagOutput = [
    {
      "variableName": "Output Variable",
      "type": "Entity",
      "entityOrInstance": "6818b6bed5d32499884d0511",
      "attribute": "6819acc5643ca38d429fae96"
    }
  ]
  types = ['Entity', 'Instance', 'Tags']
  constructor(public dialogConfig: DynamicDialogConfig,
    protected ref: DynamicDialogRef,
    private fb: FormBuilder,
    private datapointAdminService: DatapointAdministrationService) {
    console.log(dialogConfig?.data);
    this.flagInput = dialogConfig?.data?.flagData.flagVariables;
    this.appData = dialogConfig?.data?.appData;
    this.mappingForm = this.fb.group({
      mappingDesc: new FormControl<string>('', Validators.required),
      events: this.fb.array([]),
      inputMappings: this.fb.array([]),
      outputMappings: this.fb.array([]),
    })

    this.setMapping();
  }

  get inputMappings(): FormArray {
    return this.mappingForm.get('inputMappings') as FormArray;
  }

  get events(): FormArray {
    return this.mappingForm.get('events') as FormArray;
  }

  get outputMappings(): FormArray {
    return this.mappingForm.get('outputMappings') as FormArray;
  }

  setMapping() {
    const event = this.fb.group({
      eventName: [''],
    })
    this.events.push(event);

    this.flagInput.map((res: any, index: number) => {
      const row = this.fb.group({
        index: [index],
        variableName: [res.variableName],
        type: [res.type],
        typeName: [res.typeName],
        attribute: [null, [Validators.required]],
        frequency: [null, [Validators.required]],
        offset: [0, [Validators.required]],
      });
      row.get('type')?.valueChanges.subscribe((selectedType: string) => {
        this.onTypeChange(selectedType, index);
      });

      row.get('typeName')?.valueChanges.subscribe((selectedType: string) => {
        this.onTypeNameChange(selectedType, index);
      });
      this.inputMappings.push(row);
    });

    this.flagOutput.map((res: any, index: number) => {
      const row = this.fb.group({
        index: [index],
        variableName: ['Output Variable'],
        type: [res.type],
        typeName: [res.typeName],
        attribute: [null, [Validators.required]],
        frequency: [null, [Validators.required]],
        offset: [0, [Validators.required]],
      });
      row.get('type')?.valueChanges.subscribe((selectedType: string) => {
        this.onTypeChange(selectedType, index);
      });

      row.get('typeName')?.valueChanges.subscribe((selectedType: string) => {
        this.onTypeNameChange(selectedType, index);
      });
      this.outputMappings.push(row);
    });

  }

  onTypeChange(selectedType: string, rowIndex: number) {
    // Clear current selections when type changes
    const currentRow = this.inputMappings.at(rowIndex);
    currentRow.get('attribute')?.setValue(null);
    currentRow.get('frequency')?.setValue(null);

    // Make API call based on selected type
    switch (selectedType) {
      case 'Entity':
        this.loadEntityOptions(rowIndex);
        break;
      case 'Instance':
        this.loadInstanceOptions(rowIndex);
        break;
      case 'Tags':
        this.loadTagsOptions(rowIndex);
        break;
      default:
        this.typeOptions[rowIndex] = [];
    }
  }

  onTypeNameChange(selectedType: any, rowIndex: number) {
    // Clear current selections when type changes
    const currentRow = this.inputMappings.at(rowIndex);
    const type = currentRow.get('type')?.value;
    // Make API call based on selected type
    switch (type) {
      case 'Entity':
        this.getEntityAttr(rowIndex, selectedType.id)
        break;
      case 'Instance':
        this.getInstanceAttr(rowIndex, selectedType.id)
        break;
      default:
        this.attributesOptions[rowIndex] = [];
    }
  }

  private loadEntityOptions(rowIndex: number) {
    // API call for Entity type
    this.datapointAdminService.getEntityList(this.appData).subscribe({
      next: (res) => {
        this.typeOptions[rowIndex] = res.Entity_Attributes.map((res: any) => ({
          name: res.entityName,
          id: res.entityId
        }));
      },
      error: (error) => {
        console.error('Error loading entity attributes:', error);
        this.typeOptions[rowIndex] = [];
      }
    });
  }

  private loadInstanceOptions(rowIndex: number) {
    // API call for Instance type
    this.datapointAdminService.getInstanceList(this.appData).subscribe({
      next: (res) => {
        this.typeOptions[rowIndex] = res.Instances.map((res: any) => ({
          name: res.instanceName,
          id: res.instanceId
        }));
      },
      error: (error) => {
        console.error('Error loading instance attributes:', error);
        this.typeOptions[rowIndex] = [];
      }
    });
  }

  private loadTagsOptions(rowIndex: number) {
    this.datapointAdminService.getAttrList(this.appData).subscribe({
      next: (res) => {
        this.attributesOptions[rowIndex] = res[0].attributes.map((res: any) => ({
          name: res.attributeName,
          id: res.attributeId
        }));
      },
      error: (error) => {
        console.error('Error loading tags attributes:', error);
        this.typeOptions[rowIndex] = [];
      }
    });
  }

  // Helper method to get attribute options for a specific row
  getTypeOptions(rowIndex: number): any[] {
    return this.typeOptions[rowIndex] || [];
  }

  getAttributeOptions(rowIndex: number): any[] {
    return this.attributesOptions[rowIndex] || [];
  }

  // // Helper method to get frequency options for a specific row
  // getFrequencyOptions(rowIndex: number): any[] {
  //   return this.frequencyOptions[rowIndex] || [];
  // }

  private getEntityAttr(rowIndex: number, entityId: string) {
    this.datapointAdminService.getEntityDetailsById(entityId).subscribe({
      next: (res) => {
        this.attributesOptions[rowIndex] = res.attributes.map((res: any) => ({
          name: res.attributeName,
          id: res.attributeId
        }));
      },
      error: (error) => {
        console.error('Error loading tags attributes:', error);
        this.typeOptions[rowIndex] = [];
      }
    });
  }
  private getInstanceAttr(rowIndex: number, instanceId: string) {
    this.datapointAdminService.getInstanceDetailsById(instanceId).subscribe({
      next: (res) => {
        this.attributesOptions[rowIndex] = res.attributes.map((res: any) => ({
          name: res.attributeName,
          id: res.attributeId
        }));
      },
      error: (error) => {
        console.error('Error loading tags attributes:', error);
        this.typeOptions[rowIndex] = [];
      }
    });
  }

  createMapping() { }

  addEvent() {
    const event = this.fb.group({
      eventName: [''],
    })
    this.events.push(event);
  }
  addOutput() {
    const row = {
      "variableName": "Output Variable",
      "type": "Entity",
      "entityOrInstance": "6818b6bed5d32499884d0511",
      "attribute": "6819acc5643ca38d429fae96"
    }
    this.flagOutput.push(row);

    const row1 = this.fb.group({
      // index: [index],
      variableName: ['Output Variable'],
      type: [''],
      typeName: [''],
      attribute: [null, [Validators.required]],
      frequency: [null, [Validators.required]],
      offset: [0, [Validators.required]],
    });
    // row1.get('type')?.valueChanges.subscribe((selectedType: string) => {
    //   this.onTypeChange(selectedType, index);
    // });

    // row1.get('typeName')?.valueChanges.subscribe((selectedType: string) => {
    //   this.onTypeNameChange(selectedType, index);
    // });
    this.outputMappings.push(row1);
  }
}
