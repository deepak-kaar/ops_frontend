import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { PageAdministratorService } from '../../../page-administrator.service';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-page-mapping-modal',
  standalone: false,
  templateUrl: './page-mapping-modal.component.html',
  styleUrl: './page-mapping-modal.component.css'
})
export class PageMappingModalComponent implements OnInit {
  mappingForm: FormGroup;
  mode: string = 'create'; // 'create' | 'edit'
  template: any;
  appData: any;
  inputSchema: any = {};
  propertyMappings: FormArray;
  
  // Options for dropdowns
  entityList: any[] = [];
  instanceList: any[] = [];
  tagsList: any[] = [];
  types = ['Entity', 'Instance', 'Tags'];
  
  // Store options per property (for Entity/Instance/Tags selection)
  entityOptions: { [key: string]: any[] } = {};
  instanceOptions: { [key: string]: any[] } = {};
  tagOptions: { [key: string]: any[] } = {};
  
  // Store attributes per property (for attribute selection)
  attributeOptions: { [key: string]: any[] } = {};
  
  // Frequency options for time series attributes
  frequencyOptions = [
    { label: 'Hourly', value: 'H' },
    { label: 'Daily', value: 'D' },
    { label: 'Monthly', value: 'M' },
    { label: 'Quarterly', value: 'Q' },
    { label: 'Semi Annual', value: 'S' },
    { label: 'Yearly', value: 'Y' }
  ];
  
  // Store selected attributes with full data (to check timeSeries)
  selectedAttributes: { [key: string]: any } = {};
  
  isShow: boolean = false;

  constructor(
    public dialogConfig: DynamicDialogConfig,
    protected ref: DynamicDialogRef,
    private fb: FormBuilder,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private pageAdminService: PageAdministratorService,
    private datapointAdminService: DatapointAdministrationService
  ) {
    this.template = this.dialogConfig?.data?.template;
    this.mode = this.dialogConfig?.data?.mode || 'create';
    this.appData = this.dialogConfig?.data?.appData || {};
    
    // Get inputSchema from template (check multiple possible locations)
    // Priority: 1) mapping's inputSchema (if editing), 2) template's inputSchema, 3) templateObj's inputSchema
    if (this.mode === 'edit') {
      // In edit mode, use the mapping's inputSchema if available (contains mappings)
      this.inputSchema = this.template?.inputSchema || 
                        this.template?.mapping?.inputSchema ||
                        this.template?.templateObj?.inputSchema ||
                        this.template?.designObject?.inputSchema ||
                        {};
    } else {
      // In create mode, use the template's original inputSchema
      this.inputSchema = this.template?.inputSchema || 
                        this.template?.templateObj?.inputSchema ||
                        this.template?.designObject?.inputSchema ||
                        {};
    }
    
    // Get existing mapping data if in edit mode
    const existingMapping = this.mode === 'edit' ? this.template : null;
    
    this.mappingForm = this.fb.group({
      mappingName: new FormControl<string>(existingMapping?.mappingName || existingMapping?.name || '', Validators.required),
      mappingDescription: new FormControl<string>(existingMapping?.mappingDescription || existingMapping?.description || ''),
      propertyMappings: this.fb.array([])
    });
    
    this.propertyMappings = this.mappingForm.get('propertyMappings') as FormArray;
  }

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Loads entity, instance, and tags data
   */
  loadData(): void {
    this.spinner.show();
    
    const payload = {
      ...(this.appData?.appId && { appId: this.appData.appId }),
      ...(this.appData?.orgId && { orgId: this.appData.orgId })
    };

    forkJoin([
      this.datapointAdminService.getEntityList(payload),
      this.datapointAdminService.getInstanceList(payload),
      this.datapointAdminService.getAttrList(payload)
    ]).subscribe({
      next: ([entities, instances, tags]) => {
        this.entityList = entities?.Entity_Attributes?.map((item: any) => ({
          name: item.entityName,
          id: item.entityId
        })) || [];
        
        this.instanceList = instances?.Instances?.map((item: any) => ({
          name: item.instanceName,
          id: item.instanceId
        })) || [];
        
        this.tagsList = tags?.[0]?.attributes?.map((item: any) => ({
          name: item.attributeName,
          id: item.attributeId
        })) || [];
        
        // Initialize property mappings after data is loaded
        this.initializePropertyMappings();
        
        this.spinner.hide();
        this.isShow = true;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.spinner.hide();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load entity/instance/tags data',
          life: 3000
        });
        // Still initialize mappings even if data load fails
        this.initializePropertyMappings();
        this.isShow = true;
      }
    });
  }

  /**
   * Initializes property mappings from inputSchema
   */
  initializePropertyMappings(): void {
    // Clear existing form array
    while (this.propertyMappings.length !== 0) {
      this.propertyMappings.removeAt(0);
    }

    // Iterate through inputSchema structure
    for (const [schemaKey, schemaValue] of Object.entries(this.inputSchema)) {
      // schemaKey format: "fieldPath.widget-type"
      // schemaValue contains properties like labels, values, etc.
      
      if (schemaValue && typeof schemaValue === 'object') {
        for (const [propertyName, propertyDef] of Object.entries(schemaValue as any)) {
          const propertyKey = `${schemaKey}.${propertyName}`;
          const propDef = propertyDef as any;
          
          // Get existing mapping if in edit mode
          // Check if template has propertyMappings object with saved mappings
          let existingMapping: any = {
            type: null,
            attributeId: null,
            attributeName: null,
            rawValue: null,
            dataPath: null,
            entityOrInstanceId: null,
            entityOrInstanceName: null
          };
          
          if (this.mode === 'edit') {
            // In edit mode, the inputSchema already contains mappings in the mapping property
            // The fetched mapping will have inputSchema with all mappings applied
            if (propDef.mapping && propDef.mapping.type !== null) {
              // Use the mapping from inputSchema (new structure)
              existingMapping = propDef.mapping;
            } else {
              // Fallback to old propertyMappings structure for backward compatibility
              const templateMappings = this.template?.propertyMappings || this.template?.mapping?.propertyMappings;
              if (templateMappings && templateMappings[schemaKey] && templateMappings[schemaKey][propertyName]) {
                existingMapping = templateMappings[schemaKey][propertyName];
              }
            }
          }

          const propertyGroup = this.fb.group({
            propertyKey: [propertyKey],
            propertyName: [propertyName],
            schemaKey: [schemaKey],
            type: [propDef.type],
            required: [propDef.required],
            description: [propDef.description],
            mappingType: [existingMapping.type || null],
            attributeId: [existingMapping.attributeId || null],
            attributeName: [existingMapping.attributeName || null],
            rawValue: [existingMapping.rawValue || null],
            dataPath: [existingMapping.dataPath || null],
            entityOrInstanceId: [existingMapping.entityOrInstanceId || null], // For Entity/Instance selection
            entityOrInstanceName: [existingMapping.entityOrInstanceName || null],
            frequency: [existingMapping.frequency || null] // For time series attributes
          });
          
          // If editing and has existing mapping with entity/instance, store it for later initialization
          if (this.mode === 'edit' && existingMapping.type === 'attribute' && existingMapping.entityOrInstanceId) {
            // Store the entity/instance info temporarily for initialization after data loads
            propertyGroup.get('entityOrInstanceId')?.setValue(existingMapping.entityOrInstanceId, { emitEvent: false });
          }

          // Subscribe to mapping type changes
          propertyGroup.get('mappingType')?.valueChanges.subscribe((mappingType: string | null) => {
            if (mappingType !== null) {
              this.onMappingTypeChange(propertyKey, mappingType);
            }
          });

          // Subscribe to entity/instance selection changes
          propertyGroup.get('entityOrInstanceName')?.valueChanges.subscribe((selected: any) => {
            if (selected) {
              const mappingType = propertyGroup.get('mappingType')?.value;
              if (mappingType) {
                this.onEntityOrInstanceChange(propertyKey, selected, mappingType);
              }
            } else {
              // Clear attributes when selection is cleared
              this.attributeOptions[propertyKey] = [];
              propertyGroup.get('attributeId')?.setValue(null);
              propertyGroup.get('attributeName')?.setValue(null);
              propertyGroup.get('frequency')?.setValue(null);
              delete this.selectedAttributes[propertyKey];
            }
          });

          // If editing and has existing mapping, set initial values
          if (this.mode === 'edit' && existingMapping.type === 'attribute' && existingMapping.entityOrInstanceId) {
            // Find the entity/instance in the lists
            const entityOrInstance = [
              ...this.entityList.map(e => ({ ...e, sourceType: 'Entity' })),
              ...this.instanceList.map(i => ({ ...i, sourceType: 'Instance' })),
              ...this.tagsList.map(t => ({ ...t, sourceType: 'Tags' }))
            ].find(item => item.id === existingMapping.entityOrInstanceId);
            
            if (entityOrInstance) {
              propertyGroup.get('entityOrInstanceId')?.setValue(existingMapping.entityOrInstanceId, { emitEvent: false });
              propertyGroup.get('entityOrInstanceName')?.setValue(entityOrInstance, { emitEvent: false });
              // Load attributes after a short delay to ensure lists are loaded
              setTimeout(() => {
                this.loadAttributesForProperty(propertyKey, existingMapping.entityOrInstanceId, entityOrInstance.sourceType);
                // Set attribute after attributes are loaded
                setTimeout(() => {
                  if (existingMapping.attributeId) {
                    propertyGroup.get('attributeId')?.setValue(existingMapping.attributeId);
                    propertyGroup.get('attributeName')?.setValue(existingMapping.attributeName);
                    
                    // Store attribute data and set frequency if exists
                    const attributes = this.getAttributeOptions(propertyKey);
                    const attribute = attributes.find((attr: any) => attr.id === existingMapping.attributeId);
                    if (attribute) {
                      this.selectedAttributes[propertyKey] = attribute;
                      if (existingMapping.frequency) {
                        propertyGroup.get('frequency')?.setValue(existingMapping.frequency);
                      }
                    }
                  }
                }, 500);
              }, 100);
            }
          }

          this.propertyMappings.push(propertyGroup);
        }
      }
    }
  }

  /**
   * Handles mapping type change (attribute vs raw)
   */
  onMappingTypeChange(propertyKey: string, mappingType: string): void {
    const propertyGroup = this.findPropertyGroup(propertyKey);
    if (!propertyGroup) return;

    if (mappingType === 'attribute') {
      // Clear raw value fields
      propertyGroup.get('rawValue')?.setValue(null);
      propertyGroup.get('dataPath')?.setValue(null);
    } else if (mappingType === 'raw') {
      // Clear attribute fields
      propertyGroup.get('attributeId')?.setValue(null);
      propertyGroup.get('attributeName')?.setValue(null);
      propertyGroup.get('entityOrInstanceId')?.setValue(null);
      propertyGroup.get('entityOrInstanceName')?.setValue(null);
      propertyGroup.get('frequency')?.setValue(null);
      delete this.selectedAttributes[propertyKey];
    }
  }

  /**
   * Handles entity/instance selection change
   */
  onEntityOrInstanceChange(propertyKey: string, selected: any, mappingType: string): void {
    const propertyGroup = this.findPropertyGroup(propertyKey);
    if (!propertyGroup) return;

    if (mappingType === 'attribute' && selected) {
      propertyGroup.get('entityOrInstanceId')?.setValue(selected.id);
      
      // Determine source type from selected item
      const sourceType = selected.sourceType || 
                        (this.entityList.some(e => e.id === selected.id) ? 'Entity' : 
                         this.instanceList.some(i => i.id === selected.id) ? 'Instance' : 'Tags');
      
      // Load attributes for selected entity/instance
      this.loadAttributesForProperty(propertyKey, selected.id, sourceType);
    }
  }

  /**
   * Handles attribute selection change
   */
  onAttributeChange(event: any, propertyKey: string): void {
    const propertyGroup = this.findPropertyGroup(propertyKey);
    if (!propertyGroup) return;
    
    const selectedAttributeId = event.value;
    if (selectedAttributeId) {
      // Find attribute from options
      const attributes = this.getAttributeOptions(propertyKey);
      const attribute = attributes.find((attr: any) => attr.id === selectedAttributeId);
      
      if (attribute) {
        propertyGroup.get('attributeName')?.setValue(attribute.name);
        propertyGroup.get('attributeId')?.setValue(attribute.id);
        
        // Store full attribute data to check timeSeries
        this.selectedAttributes[propertyKey] = attribute;
        
        // If attribute is not time series, clear frequency
        if (!attribute.timeSeries) {
          propertyGroup.get('frequency')?.setValue(null);
        }
      }
    } else {
      propertyGroup.get('attributeName')?.setValue(null);
      propertyGroup.get('attributeId')?.setValue(null);
      propertyGroup.get('frequency')?.setValue(null);
      delete this.selectedAttributes[propertyKey];
    }
  }

  /**
   * Checks if the selected attribute is a time series
   */
  isTimeSeriesAttribute(propertyKey: string): boolean {
    const attribute = this.selectedAttributes[propertyKey];
    return attribute?.timeSeries === true;
  }

  /**
   * Loads attributes for a selected entity or instance
   */
  loadAttributesForProperty(propertyKey: string, entityOrInstanceId: string, sourceType: string): void {
    const propertyGroup = this.findPropertyGroup(propertyKey);
    if (!propertyGroup) return;

    const mappingType = propertyGroup.get('mappingType')?.value;
    if (mappingType !== 'attribute') return;

    // Determine if it's Entity or Instance based on current selection
    // We'll need to check which list the selected item came from
    const isEntity = this.entityList.some(e => e.id === entityOrInstanceId);
    const isInstance = this.instanceList.some(i => i.id === entityOrInstanceId);

    if (isEntity) {
      this.datapointAdminService.getEntityDetailsById(entityOrInstanceId).subscribe({
        next: (res) => {
          this.attributeOptions[propertyKey] = res.attributes?.map((attr: any) => ({
            name: attr.attributeName,
            id: attr.attributeId,
            timeSeries: attr.timeSeries || false
          })) || [];
        },
        error: (err) => {
          console.error('Error loading entity attributes:', err);
          this.attributeOptions[propertyKey] = [];
        }
      });
    } else if (isInstance) {
      this.datapointAdminService.getInstanceDetailsById(entityOrInstanceId).subscribe({
        next: (res) => {
          this.attributeOptions[propertyKey] = res.attributes?.map((attr: any) => ({
            name: attr.attributeName,
            id: attr.attributeId,
            timeSeries: attr.timeSeries || false
          })) || [];
        },
        error: (err) => {
          console.error('Error loading instance attributes:', err);
          this.attributeOptions[propertyKey] = [];
        }
      });
    } else if (sourceType === 'Tags') {
      // For tags, use the tags list directly and add timeSeries property
      this.attributeOptions[propertyKey] = this.tagsList.map((tag: any) => ({
        ...tag,
        timeSeries: tag.timeSeries || false
      }));
    }
  }

  /**
   * Gets entity/instance options based on mapping type
   */
  getEntityOrInstanceOptions(propertyKey: string, mappingType: string): any[] {
    if (mappingType === 'attribute') {
      const propertyGroup = this.findPropertyGroup(propertyKey);
      if (!propertyGroup) return [];
      
      // Return combined list for selection
      return [
        ...this.entityList.map(e => ({ ...e, sourceType: 'Entity' })),
        ...this.instanceList.map(i => ({ ...i, sourceType: 'Instance' })),
        ...this.tagsList.map(t => ({ ...t, sourceType: 'Tags' }))
      ];
    }
    return [];
  }

  /**
   * Gets attribute options for a property
   */
  getAttributeOptions(propertyKey: string): any[] {
    return this.attributeOptions[propertyKey] || [];
  }

  /**
   * Finds property group by property key
   */
  findPropertyGroup(propertyKey: string): FormGroup | null {
    const index = this.propertyMappings.controls.findIndex(
      (control) => control.get('propertyKey')?.value === propertyKey
    );
    return index >= 0 ? (this.propertyMappings.at(index) as FormGroup) : null;
  }

  /**
   * Saves the mapping
   */
  saveMapping(): void {
    if (this.mappingForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields',
        life: 3000
      });
      return;
    }

    // Start with the complete inputSchema structure
    // Deep clone to avoid mutating the original
    const mappedInputSchema = JSON.parse(JSON.stringify(this.inputSchema));
    
    // Apply mappings to the properties that have been mapped
    this.propertyMappings.controls.forEach((control) => {
      const formGroup = control as FormGroup;
      const propertyKey = formGroup.get('propertyKey')?.value;
      const mappingType = formGroup.get('mappingType')?.value;
      const schemaKey = formGroup.get('schemaKey')?.value;
      const propertyName = formGroup.get('propertyName')?.value;
      
      // Ensure the schema structure exists
      if (!mappedInputSchema[schemaKey]) {
        mappedInputSchema[schemaKey] = {};
      }
      
      if (!mappedInputSchema[schemaKey][propertyName]) {
        // If property doesn't exist in schema, create it with basic structure
        mappedInputSchema[schemaKey][propertyName] = {
          type: formGroup.get('type')?.value,
          required: formGroup.get('required')?.value,
          description: formGroup.get('description')?.value,
          mapping: {
            type: null,
            attributeId: null,
            attributeName: null,
            rawValue: null,
            dataPath: null,
            entityOrInstanceId: null,
            entityOrInstanceName: null,
            frequency: null
          }
        };
      }
      
      // Update the mapping object based on mapping type
      if (mappingType === 'attribute') {
        const mappingObj: any = {
          type: 'attribute',
          attributeId: formGroup.get('attributeId')?.value,
          attributeName: formGroup.get('attributeName')?.value,
          entityOrInstanceId: formGroup.get('entityOrInstanceId')?.value,
          entityOrInstanceName: formGroup.get('entityOrInstanceName')?.value?.name || formGroup.get('entityOrInstanceName')?.value,
          rawValue: null,
          dataPath: null
        };
        
        // Add frequency if attribute is time series
        const frequency = formGroup.get('frequency')?.value;
        if (frequency) {
          mappingObj.frequency = frequency;
        } else {
          mappingObj.frequency = null;
        }
        
        mappedInputSchema[schemaKey][propertyName].mapping = mappingObj;
      } else if (mappingType === 'raw') {
        mappedInputSchema[schemaKey][propertyName].mapping = {
          type: 'raw',
          rawValue: formGroup.get('rawValue')?.value,
          dataPath: formGroup.get('dataPath')?.value,
          attributeId: null,
          attributeName: null,
          entityOrInstanceId: null,
          entityOrInstanceName: null,
          frequency: null
        };
      } else {
        // No mapping selected - keep default null mapping
        mappedInputSchema[schemaKey][propertyName].mapping = {
          type: null,
          attributeId: null,
          attributeName: null,
          rawValue: null,
          dataPath: null,
          entityOrInstanceId: null,
          entityOrInstanceName: null,
          frequency: null
        };
      }
    });

    // Get template name from template object
    const templateName = this.template?.templateName || 
                        this.template?.name || 
                        this.template?.templateObj?.templateName ||
                        '';

    const payload: any = {
      templateId: this.template?.templateId || this.template?._id || this.template?.id,
      templateName: templateName,
      appId: this.appData?.appId,
      orgId: this.appData?.orgId,
      mappingType: 'page-template', // Default mapping type for page templates
      name: this.mappingForm.get('mappingName')?.value, // 'name' field
      description: this.mappingForm.get('mappingDescription')?.value, // 'description' field
      mappingDescription: this.mappingForm.get('mappingDescription')?.value, // Keep for backward compatibility
      inputSchema: mappedInputSchema // Always send the complete inputSchema, even if nothing is mapped
    };

    // If editing, include mapping ID
    if (this.mode === 'edit' && (this.template?.mappingId || this.template?._id || this.template?.id)) {
      payload.mappingId = this.template?.mappingId || this.template?._id || this.template?.id;
    }

    this.spinner.show();
    this.pageAdminService.createTemplateMapping(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Template mapping ${this.mode === 'edit' ? 'updated' : 'created'} successfully`,
          life: 3000
        });
        this.ref.close({ status: 200 });
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error saving mapping:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.mode === 'edit' ? 'update' : 'create'} template mapping`,
          life: 3000
        });
      }
    });
  }

  /**
   * Cancels and closes the dialog
   */
  cancel(): void {
    this.ref.close();
  }
}
