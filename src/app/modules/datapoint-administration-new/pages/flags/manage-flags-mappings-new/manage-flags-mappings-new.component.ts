import { Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-manage-flags-mappings-new',
  standalone: false,
  templateUrl: './manage-flags-mappings-new.component.html',
  styleUrl: './manage-flags-mappings-new.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ManageFlagsMappingsNewComponent {
  mappingForm: FormGroup
  mode: string = '';
  appData: any;
  flagInput: any;
  selectedRowData: any;
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
    private datapointAdminService: DatapointAdministrationService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService) {
    console.log(dialogConfig?.data);
    this.appData = dialogConfig?.data?.appData;
    this.selectedRowData = dialogConfig?.data?.selectedRow;

    const flagCategories = dialogConfig?.data?.flagData?.flagCategories || {};
    const flagVariables = dialogConfig?.data?.flagData?.flagVariables || [];
    const selectedCategory = dialogConfig?.data?.selectedCategory;

    if (Object.keys(flagCategories).length > 0) {
      if (selectedCategory && flagCategories[selectedCategory]) {
        this.flagInput = flagCategories[selectedCategory];
      } else {
        this.flagInput = Object.values(flagCategories)[0] || [];
      }
    } else if (Array.isArray(flagVariables)) {
      this.flagInput = flagVariables;
    } else if (flagVariables && typeof flagVariables === 'object') {
        // Fallback for legacy
        if (selectedCategory && flagVariables[selectedCategory]) {
            this.flagInput = flagVariables[selectedCategory];
        } else {
            this.flagInput = Object.values(flagVariables)[0] || [];
        }
    }

    this.mappingForm = this.fb.group({
      categoryName: new FormControl<string>(selectedCategory || '', Validators.required),
      inputMappings: this.fb.array([]),
      outputMappings: this.fb.array([]),
    })

    this.setMapping();
    // Always try to populate from saved flagData (restores values for both create and edit)
    this.populateFormWithRowData();
  }

  get inputMappings(): FormArray {
    return this.mappingForm.get('inputMappings') as FormArray;
  }

  get outputMappings(): FormArray {
    return this.mappingForm.get('outputMappings') as FormArray;
  }

  setMapping() {
    if (!this.flagInput?.length) return;
    const selectedCategory = this.dialogConfig?.data?.selectedCategory;
    this.flagInput.map((res: any, index: number) => {
      // If editing existing, match frequency
      const savedFrequency = selectedCategory ? (this.frequencyOptions.find(f => f.type === res.frequency) || null) : null;

      const row = this.fb.group({
        index: [index],
        variableName: [res.variableName],
        type: [selectedCategory ? (res.type || null) : null],
        typeName: [null as any],
        attribute: [null as any],
        frequency: [savedFrequency],
        offset: [selectedCategory ? (res.offset ?? 0) : 0],
      });

      // Push first so row exists in FormArray before onTypeChange accesses it
      this.inputMappings.push(row);

      // Pre-load type options if type is already set
      if (selectedCategory && res.type) {
        this.onTypeChange(res.type, index);
      }

      row.get('type')?.valueChanges.subscribe((selectedType: string) => {
        this.onTypeChange(selectedType, index);
      });

      row.get('typeName')?.valueChanges.subscribe((selectedType: string) => {
        this.onTypeNameChange(selectedType, index);
      });

    });
  }

  onTypeChange(selectedType: string, rowIndex: number) {
    // Clear current selections when type changes
    const currentRow = this.inputMappings.at(rowIndex);
    // currentRow.get('attribute')?.setValue(null);
    // currentRow.get('frequency')?.setValue(null);

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
        this.patchTypeNameIfneeded(rowIndex);
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
        this.patchTypeNameIfneeded(rowIndex);
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
        this.patchAttributeIfneeded(rowIndex);
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
        this.patchAttributeIfneeded(rowIndex);
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
        this.patchAttributeIfneeded(rowIndex);
      },
      error: (error) => {
        console.error('Error loading tags attributes:', error);
        this.typeOptions[rowIndex] = [];
      }
    });
  }

  private patchTypeNameIfneeded(rowIndex: number) {
    const selectedCategory = this.dialogConfig?.data?.selectedCategory;
    if (!selectedCategory) return;

    const flagData = this.dialogConfig?.data?.flagData;
    const variablesObj = flagData?.flagVariables || {};
    let savedVariables: any[] = [];
    if (Array.isArray(variablesObj)) savedVariables = variablesObj;
    else savedVariables = variablesObj[selectedCategory] || [];

    const targetTypeStr = savedVariables[rowIndex]?.typeName;
    if (targetTypeStr) {
      const match = this.typeOptions[rowIndex]?.find(opt => opt.name === targetTypeStr || opt.id === targetTypeStr);
      if (match) {
        this.inputMappings.at(rowIndex).patchValue({ typeName: match });
      }
    }
  }

  private patchAttributeIfneeded(rowIndex: number) {
    const selectedCategory = this.dialogConfig?.data?.selectedCategory;
    if (!selectedCategory) return;

    const flagData = this.dialogConfig?.data?.flagData;
    const variablesObj = flagData?.flagVariables || {};
    let savedVariables: any[] = [];
    if (Array.isArray(variablesObj)) savedVariables = variablesObj;
    else savedVariables = variablesObj[selectedCategory] || [];

    const targetAttrStr = savedVariables[rowIndex]?.attribute;
    if (targetAttrStr) {
      const match = this.attributesOptions[rowIndex]?.find(opt => opt.id === targetAttrStr || opt.name === targetAttrStr);
      if (match) {
        this.inputMappings.at(rowIndex).patchValue({ attribute: match });
      }
    }
  }

  createMapping() {
    const flagData = this.dialogConfig?.data?.flagData;
    const inputMappingsValue = this.inputMappings.value;
    const categoryName = this.mappingForm.getRawValue().categoryName || 'default';

    // Merge inputMappings form values back into category mappings
    const newCategoryMappings = (this.flagInput || []).map((variable: any, index: number) => {
      const mapping = inputMappingsValue[index] || {};

      // frequency p-select stores full object { name, type } — extract the type code
      const frequency = mapping.frequency
        ? (typeof mapping.frequency === 'object' ? mapping.frequency.type : mapping.frequency)
        : '';

      // typeName p-select stores full object { name, id } — extract the name
      const typeName = mapping.typeName
        ? (typeof mapping.typeName === 'object' ? mapping.typeName.name : mapping.typeName)
        : '';

      // attribute p-select stores full object { name, id } — extract the id
      const attribute = mapping.attribute
        ? (typeof mapping.attribute === 'object' ? mapping.attribute.id : mapping.attribute)
        : '';

      return {
        variableName: variable.variableName,
        type: mapping.type || '',
        frequency,
        typeName,
        offset: mapping.offset ?? '',
        attribute,
      };
    });

    let updatedFlagCategories: any = {};
    const originalCategories = flagData.flagCategories || {};
    const originalVariables = flagData.flagVariables || [];
    const originalCategory = this.dialogConfig?.data?.selectedCategory;

    if (originalVariables && typeof originalVariables === 'object' && !Array.isArray(originalVariables)) {
        // Migration: If flagVariables was used for categories, move it
        updatedFlagCategories = { ...originalVariables };
    } else {
        updatedFlagCategories = { ...originalCategories };
    }
    
    // Handle Rename: If the name changed and we were editing an existing category, delete the old one
    if (originalCategory && originalCategory !== categoryName) {
      delete updatedFlagCategories[originalCategory];
    }
    
    updatedFlagCategories[categoryName] = newCategoryMappings;

    const payload = {
      ...(flagData.flagId && { flagId: flagData.flagId }),
      flagName: flagData.flagName,
      flagDesc: flagData.flagDesc,
      flagSeverity: flagData.flagSeverity || null,
      flagVariables: Array.isArray(originalVariables) ? originalVariables : [], // Keep definitions
      flagCategories: updatedFlagCategories,
      flagExpressions: flagData.flagExpressions || [],
      flagLevel: flagData.flagLevel || 'Opsinsight',
      flagOrgLevel: flagData.flagOrgLevel || null,
      flagLevelName: flagData.flagLevelName || '',
    };

    this.spinner.show();

    const apiCall = flagData.flagId
      ? this.datapointAdminService.updateFlag(payload)
      : this.datapointAdminService.postFlag(payload);

    apiCall.subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Mapping ${flagData.flagId ? 'updated' : 'created'} successfully`,
          life: 3000,
        });
        this.ref.close({ status: true });
      },
      error: (err: any) => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${flagData.flagId ? 'update' : 'create'} mapping`,
          life: 3000,
        });
      },
    });
  }

  populateFormWithRowData() {
    const flagData = this.dialogConfig?.data?.flagData;
    if (!flagData) return;
    const selectedCategory = this.dialogConfig?.data?.selectedCategory;

    this.mappingForm.patchValue({
      categoryName: selectedCategory || ''
    });

    const flagCategories = flagData.flagCategories || {};
    const flagVariables = flagData.flagVariables || [];
    let savedVariables: any[] = [];
    
    if (selectedCategory) {
      if (flagCategories[selectedCategory]) {
        savedVariables = flagCategories[selectedCategory];
      } else if (!Array.isArray(flagVariables) && flagVariables[selectedCategory]) {
        // Fallback for legacy
        savedVariables = flagVariables[selectedCategory];
      }
    }

    // Patch each inputMapping row only if editing
    if (selectedCategory && savedVariables.length) {
      savedVariables.forEach((variable: any, index: number) => {
        if (this.inputMappings.at(index)) {
          // Match frequency option object from the saved type code
          const savedFrequency = this.frequencyOptions.find(f => f.type === variable.frequency) || null;

          this.inputMappings.at(index).patchValue({
            type: variable.type || null,
            frequency: savedFrequency,
            offset: variable.offset ?? 0
          });

          // Pre-load type options so entity/instance dropdowns are populated
          if (variable.type) {
            this.onTypeChange(variable.type, index);
          }
        }
      });
    }
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
