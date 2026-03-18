import { Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AttributeDialogComponent } from 'src/app/modules/datapoint-administration/components/dialogs/attribute-dialog/attribute-dialog.component';
import { combineLatest, forkJoin, Observable, startWith } from 'rxjs';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';

@Component({
    selector: 'app-create-instance-new',
    standalone: false,
    templateUrl: './create-instance-new.component.html',
    styleUrl: './create-instance-new.component.css',
    encapsulation: ViewEncapsulation.None
})
export class CreateInstanceNewComponent {

    ref: DynamicDialogRef | undefined;
    entityList: any[] = [];
    entityList1: any[] = []; // Store full entity data
    dataPoints: any[] = []; // Store data points for mapping
    instanceForm: FormGroup;
    isEditMode: boolean = false;
    instanceId: string | null = null;
    appData: any;
    locations: any[] = [];

    isMobile$!: Observable<boolean>;
    breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

    constructor(
        private fb: FormBuilder,
        private datapointAdminService: DatapointAdministrationService,
        private spinner: NgxSpinnerService,
        private router: Router,
        private messageService: MessageService,
        public dialogService: DialogService,
        private responsive: ResponsiveService
    ) {
        this.instanceForm = this.fb.group({
            type: ['Instance', Validators.required],
            instanceName: ['', Validators.required],
            instanceDesc: ['', Validators.required],
            entityId: ['', Validators.required],
            instanceLevel: [''],
            instanceLevelName: [''],
            instanceOrgLevel: [''],
            instanceLocation: [''],
            instanceAttribute: this.fb.array([]),
            isEntityOrInstance: [false]
        });

        this.appData = this.router.getCurrentNavigation()?.extras.state;
    }

    ngOnInit(): void {
        this.getDataPoints();
        this.getEntityList();
        this.getLocations();
        this.isMobile$ = this.responsive.isMobile$();

        if (this.appData?.isEdit && this.appData?.instanceId) {
            this.isEditMode = true;
            this.instanceId = this.appData.instanceId;
            // Wait for entity list to load before fetching instance details
            this.getEntityList().then(() => {
                this.fetchInstanceDetails(this.instanceId as string);
            });
        } else {
            this.addAttribute();
        }
    }

    getDataPoints(): void {
        this.datapointAdminService.getDataPoints().subscribe({
            next: (res: any) => {
                this.dataPoints = res.map((item: any) => ({
                    dataType: item.dataType,
                    dataTypeId: item.dataTypeId,
                    display_name: item.display_name
                }));
            },
            error: (err) => {
                console.error('Error fetching data points:', err);
            }
        });
    }

    getEntityList(): Promise<void> {
        return new Promise((resolve, reject) => {
            let payload = {
                ...(this.appData?.appId && { appId: this.appData?.appId }),
                ...(this.appData?.orgId && { orgId: this.appData?.orgId }),
                type: 'Entity'
            };
            this.datapointAdminService.getEntityList(payload).subscribe({
                next: (res: any) => {
                    if (res && res.Entity_Attributes && res.Entity_Attributes.length > 0) {
                        this.entityList1 = res.Entity_Attributes;
                        this.entityList = res.Entity_Attributes.map((item: any) => ({
                            entityId: item.entityId,
                            entityName: item.entityName,
                            entityLevel: item.entityLevel,
                            entityLevelName: item.entityLevelName,
                            entityOrgLevel: item.entityOrgLevel
                        }));
                    }
                    resolve();
                },
                error: (err) => {
                    reject(err);
                }
            });
        });
    }

    getLocations(): void {
        // Location is now a text input field
    }

    get attributes(): FormArray {
        return this.instanceForm.get('instanceAttribute') as FormArray;
    }

    addAttribute(): void {
        const attributeGroup = this.fb.group({
            attributeName: ['', Validators.required],
            dataType: ['String', Validators.required],
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
        this.setupAliasAutoUpdate(attributeGroup);
    }

    removeAttribute(index: number): void {
        this.attributes.removeAt(index);
    }

    fetchInstanceDetails(id: string): void {
        this.spinner.show();
        this.datapointAdminService.getInstanceDetailsById(id).subscribe({
            next: (res: any) => {
                const instance = res.instanceDocuments || this.appData?.instanceData;
                // Find the entity object from entityList to set it properly
                const selectedEntity = this.entityList.find((item: any) => item.entityId === instance.entityLookupId);
                this.instanceForm.patchValue({
                    entityId: selectedEntity || instance.entityLookupId,
                    instanceName: instance.instanceName,
                    instanceDesc: instance.instanceDesc,
                    instanceLevel: instance.instanceLevel || '',
                    instanceLevelName: instance.instanceLevelName || '',
                    instanceOrgLevel: instance.instanceOrgLevel,
                    instanceLocation: instance.instanceLocation,
                    isEntityOrInstance: instance.isMasterDataInstance
                });

                // Check if attributes are already in the instance details
                if (res.attributes && Array.isArray(res.attributes) && res.attributes.length > 0) {
                    this.spinner.hide();
                    this.populateAttributes(res.attributes);
                } else {
                    // Fetch attributes separately
                    this.datapointAdminService.getAttributeList(id).subscribe({
                        next: (attrRes: any) => {
                            this.spinner.hide();
                            const attributes = attrRes.attributes || attrRes.Instance_Attributes || attrRes;
                            if (attributes && Array.isArray(attributes) && attributes.length > 0) {
                                this.populateAttributes(attributes);
                            } else {
                                this.addAttribute(); // Add default attribute if no attributes found
                            }
                        },
                        error: (err) => {
                            console.error('Error fetching attributes:', err);
                            this.spinner.hide();
                            this.addAttribute(); // Add default attribute if fetch fails
                        }
                    });
                }
            },
            error: (err) => {
                console.error('Error fetching instance details:', err);
                this.spinner.hide();
            }
        });
    }

    populateAttributes(attributes: any[]): void {
        this.attributes.clear();
        if (attributes && attributes.length > 0) {
            attributes.forEach((attr: any, index: number) => {
                const attributeGroup = this.fb.group({
                    attributeName: [attr.attributeName || '', Validators.required],
                    dataType: [attr.dataPointID?.dataTypeId || attr.dataPointID || attr.dataType || 'String', Validators.required],
                    minValue: [attr.minValue || ''],
                    maxValue: [attr.maxValue || ''],
                    defaults: [attr.defaults || []],
                    isLookup: [attr.isLookup || false],
                    validationRule: [attr.validationRule || ''],
                    acceptedQuality: [attr.acceptedQuality || ''],
                    unique: [attr.unique || false],
                    nullable: [attr.isNull || attr.nullable || false],
                    decimalPlaces: [attr.decimalPlaces || ''],
                    engineeringUnit: [attr.engineeringUnit || ''],
                    comments: [attr.comments || ''],
                    dataSource: [attr.dataSource || ''],
                    lookupId: [attr.lookupId || ''],
                    collection: [attr.collection || false],
                    timeSeries: [attr.timeSeries || false],
                    timeFrequency: [attr.timeFrequency || []],
                    calculationTotal: [attr.calculationTotal || []],
                    calculationAverage: [attr.calculationAverage || []],
                    displayComponent: [attr.displayComponent || []],
                    lookupAttribute: [attr.lookupAttribute || ''],
                    alias: [attr.alias || ''],
                    order: [attr.order !== undefined ? attr.order : index],
                    attrList: [attr.attrList || []],
                    showRemoveButton: [true],
                    tag: [attr.tag || ''],
                    dataTypeType: [attr.dataTypeType || ''],
                    attributes: [attr.attributes || []]
                });

                const lookupIdControl = attributeGroup.get('lookupId');
                if (attributeGroup.get('isLookup')?.value) {
                    lookupIdControl?.setValidators(Validators.required);
                }
                lookupIdControl?.updateValueAndValidity();
                this.attributes.push(attributeGroup);
                this.setupAliasAutoUpdate(attributeGroup);
            });
        } else {
            this.addAttribute();
        }
    }

    onSubmit(): void {
        if (this.instanceForm.valid) {
            this.spinner.show();
            const entityIdValue = this.instanceForm.get('entityId')?.value;
            const foundEntity = this.entityList1.find((item: any) =>
                item.entityId === (entityIdValue?.entityId || entityIdValue)
            );

            const payload = {
                type: 'Instance',
                instanceName: this.instanceForm.get('instanceName')?.value,
                instanceDesc: this.instanceForm.get('instanceDesc')?.value,
                entityLookupId: entityIdValue?.entityId || entityIdValue,
                instanceLevel: this.instanceForm.get('instanceLevel')?.value || 'Opsinsight',
                instanceLevelName: this.instanceForm.get('instanceLevelName')?.value || 'Opsinsight',
                instanceOrgLevel: this.instanceForm.get('instanceOrgLevel')?.value,
                instanceLocation: this.instanceForm.get('instanceLocation')?.value,
                entityFormId: foundEntity?.entityFormId,
                instanceAttribute: (this.instanceForm.get('instanceAttribute') as FormArray).getRawValue().map((attribute: any) => {
                    // Handle dataPointID - it might be stored as string (dataTypeId) or object
                    let dataPointID;

                    // Check if dataType is already an object with dataType and dataTypeId
                    if (attribute.dataType && typeof attribute.dataType === 'object' &&
                        attribute.dataType.dataType && attribute.dataType.dataTypeId) {
                        // Already in the correct format, use it directly
                        dataPointID = {
                            dataType: attribute.dataType.dataType,
                            dataTypeId: attribute.dataType.dataTypeId
                        };
                    } else {
                        // dataType is a string - find the dataPoint by dataTypeId, dataType, or display_name
                        const dataTypeValue = attribute.dataType || '';
                        const dataPoint = this.dataPoints.find((dp: any) =>
                            dp.dataTypeId === dataTypeValue ||
                            dp.dataType === dataTypeValue ||
                            dp.display_name === dataTypeValue
                        );

                        // Format dataPointID as object with dataType and dataTypeId
                        if (dataPoint) {
                            dataPointID = {
                                dataType: dataPoint.dataType,
                                dataTypeId: dataPoint.dataTypeId
                            };
                        } else {
                            // Fallback: if dataTypeValue is empty or not found, use default String type
                            // Try to find String type in dataPoints as last resort
                            const stringDataPoint = this.dataPoints.find((dp: any) =>
                                dp.dataType === 'String' || dp.display_name === 'String'
                            );

                            if (stringDataPoint) {
                                dataPointID = {
                                    dataType: stringDataPoint.dataType,
                                    dataTypeId: stringDataPoint.dataTypeId
                                };
                            } else {
                                // Ultimate fallback - use the value as both dataType and dataTypeId
                                dataPointID = {
                                    dataType: dataTypeValue || 'String',
                                    dataTypeId: dataTypeValue || ''
                                };
                            }
                        }
                    }

                    // Ensure dataPointID is always defined
                    if (!dataPointID || !dataPointID.dataType || !dataPointID.dataTypeId) {
                        console.warn('Invalid dataPointID for attribute:', attribute.attributeName, 'Using fallback');
                        dataPointID = {
                            dataType: 'String',
                            dataTypeId: ''
                        };
                    }

                    return {
                        attributeName: attribute.attributeName,
                        dataPointID: dataPointID,
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
                        attributes: attribute.attributes
                    };
                }),
                ...(this.isEditMode && { instanceId: this.instanceId }),
                appId: foundEntity?.entityLevelName,
                orgId: foundEntity?.entityOrgLevel
            };

            const request = this.isEditMode ?
                this.datapointAdminService.updateInstance(payload) :
                this.datapointAdminService.createInstance(payload);

            request.subscribe({
                next: () => {
                    this.spinner.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Instance ${this.isEditMode ? 'updated' : 'created'} successfully`
                    });
                    this.goBack();
                },
                error: () => {
                    this.spinner.hide();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Failed to ${this.isEditMode ? 'update' : 'create'} instance`
                    });
                }
            });
        } else {
            this.instanceForm.markAllAsTouched();
            this.attributes.controls.forEach(control => control.markAllAsTouched());
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Fill out the required fields'
            });
        }
    }

    goBack(): void {
        window.history.back();
    }

    onCancel(): void {
        this.goBack();
    }

    drop(event: CdkDragDrop<any[]>) {
        moveItemInArray(this.attributes.controls, event.previousIndex, event.currentIndex);
        this.attributes.controls.forEach((control, index) => {
            control.get('order')?.setValue(index);
        });
    }

    moreActions(index: number) {
        const attributeData = this.attributes.controls[index];
        this.ref = this.dialogService.open(AttributeDialogComponent, {
            data: {
                id: index,
                attributeValue: attributeData.getRawValue(),
                appId: this.appData?.appId,
                orgId: this.appData?.orgId
            },
            header: 'More Actions',
            width: '75rem',
            height: '60rem',
            contentStyle: { overflow: 'hidden', padding: '0' },
            baseZIndex: 10000,
            modal: true,
            closable: true,
            showHeader: false
        });
        this.ref.onClose.subscribe((res: any) => {
            if (res?.status) {
                const attribute = this.attributes.controls[res.id];
                attribute.setValue(res.data);
            }
        });
    }

    onLookup(attribute: any): void {
        const lookupIdControl = attribute.get('lookupId');
        if (attribute.get('isLookup')?.value) {
            lookupIdControl?.setValidators(Validators.required);
        } else {
            lookupIdControl?.clearValidators();
        }
        lookupIdControl?.updateValueAndValidity();
    }

    /**
     * Handles the change event for the entity dropdown and fetches entity details by ID.
     * Populates the instance attributes from the selected entity.
     * 
     * @param {DropdownChangeEvent} event - The dropdown change event containing the selected entity's details.
     * @returns {void}
     */
    getEntityData(event: DropdownChangeEvent): void {
        if (event.value) {
            this.datapointAdminService.getEntityDetailsById(event.value.entityId).subscribe({
                next: (res: any) => {
                    this.attributes.clear();
                    if (res.attributes && Array.isArray(res.attributes)) {
                        res.attributes.forEach((attribute: any) => {
                            const attributeGroup = this.fb.group({
                                attributeName: [attribute.attributeName || '', Validators.required],
                                dataType: [attribute.dataPointID?.dataTypeId || attribute.dataPointID || attribute.dataType || '', Validators.required],
                                minValue: [attribute.minValue || ''],
                                maxValue: [attribute.maxValue || ''],
                                defaults: [attribute.defaults || []],
                                isLookup: [attribute.isLookup || false],
                                validationRule: [attribute.validationRule || ''],
                                acceptedQuality: [attribute.acceptedQuality || ''],
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
                                order: [attribute.order || this.attributes.length],
                                attrList: [attribute.attrList || []],
                                showRemoveButton: [false],
                                tag: [attribute.tag || ''],
                                dataTypeType: [attribute.dataTypeType || 'Primitive'],
                                attributes: [attribute.attributes || []]
                            });

                            // Disable certain fields when loading from entity (like in old component)
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
                            this.attributes.push(attributeGroup);
                            this.setupAliasAutoUpdate(attributeGroup);
                        });

                        // Update instance level fields from entity
                        this.instanceForm.patchValue({
                            instanceLevel: event.value.entityLevel,
                            instanceLevelName: event.value.entityLevelName,
                            instanceOrgLevel: event.value.entityOrgLevel
                        });
                    }
                },
                error: (err) => {
                    console.error('Error fetching entity details:', err);
                }
            });
        }
    }

    /**
     * Clears the entity selection and attributes.
     * @returns {void}
     */
    clearEntity(): void {
        this.attributes.clear();
    }

    private setupAliasAutoUpdate(attributeGroup: FormGroup): void {
        const entityNameCtrl = this.instanceForm.get('instanceName');
        const attributeNameCtrl = attributeGroup.get('attributeName');
        const aliasCtrl = attributeGroup.get('alias');

        if (entityNameCtrl && attributeNameCtrl && aliasCtrl) {
            combineLatest([
                entityNameCtrl.valueChanges.pipe(startWith(entityNameCtrl.value)),
                attributeNameCtrl.valueChanges.pipe(startWith(attributeNameCtrl.value))
            ]).subscribe(([instanceName, attrName]) => {
                if (instanceName && attrName) {
                    const suggestedAlias = `${instanceName}$${attrName}`;
                    aliasCtrl.setValue(suggestedAlias, { emitEvent: false });
                }
            });
        }
    }
}
