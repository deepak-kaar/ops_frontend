import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DesignerWidget } from '../page-designer.component';
import { PageAdministratorService } from '../../page-administrator/page-administrator.service';

@Component({
    selector: 'app-page-designer-data-mapping',
    templateUrl: './page-designer-data-mapping.component.html',
    styleUrl: './page-designer-data-mapping.component.css',
    standalone: false,
})
export class PageDesignerDataMappingComponent implements OnChanges {

    @Input() selectedWidget: DesignerWidget | null = null;
    @Input() formConfig: { appId?: string; orgId?: string } = {};

    /** Mappable props for the current widget type */
    widgetPropDefs: { key: string; label: string }[] = [];

    /** Current mapping values indexed by propKey */
    mappings: {
        [propKey: string]: {
            type: string;
            typeName: any;
            attribute: string;
            attributeName: string;
        }
    } = {};

    /** Dropdown options */
    sourceTypes = ['Entity', 'Instance'];

    /** Per-prop entity/instance list options (after type is selected) */
    typeOptions: { [propKey: string]: any[] } = {};

    /** Per-prop attribute list options (after entity/instance is selected) */
    attributeOptions: { [propKey: string]: any[] } = {};

    saveBtnLoading = false;

    constructor(private pageAdminService: PageAdministratorService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedWidget']) {
            this.initForWidget();
        }
    }

    private initForWidget() {
        if (!this.selectedWidget) {
            this.widgetPropDefs = [];
            this.mappings = {};
            this.typeOptions = {};
            this.attributeOptions = {};
            return;
        }
        this.widgetPropDefs = this.pageAdminService.getWidgetInputProps(this.selectedWidget.type);
        // Load existing mappings from widget
        this.mappings = {};
        this.typeOptions = {};
        this.attributeOptions = {};
        const existing = this.selectedWidget.dataMapping || {};
        for (const prop of this.widgetPropDefs) {
            if (existing[prop.key]) {
                this.mappings[prop.key] = { ...existing[prop.key] };
                // Re-populate dropdowns for already-mapped props
                this._loadTypeOptions(prop.key, existing[prop.key].type);
                if (existing[prop.key].typeName?.id) {
                    this._loadAttributeOptions(prop.key, existing[prop.key].type, existing[prop.key].typeName.id);
                }
            } else {
                this.mappings[prop.key] = { type: '', typeName: null, attribute: '', attributeName: '' };
            }
        }
    }

    onTypeChange(propKey: string) {
        const type = this.mappings[propKey]?.type;
        // reset downstream selections
        this.mappings[propKey].typeName = null;
        this.mappings[propKey].attribute = '';
        this.mappings[propKey].attributeName = '';
        this.typeOptions[propKey] = [];
        this.attributeOptions[propKey] = [];
        if (type) {
            this._loadTypeOptions(propKey, type);
        }
    }

    private _loadTypeOptions(propKey: string, type: string) {
        const payload = {
            ...(this.formConfig?.appId && { appId: this.formConfig.appId }),
            ...(this.formConfig?.orgId && { orgId: this.formConfig.orgId }),
        };
        if (type === 'Entity') {
            this.pageAdminService.getEntityList(payload).subscribe({
                next: (res: any) => {
                    this.typeOptions[propKey] = (res?.Entity_Attributes || []).map((e: any) => ({
                        id: e.entityId,
                        name: e.entityName
                    }));
                },
                error: () => { this.typeOptions[propKey] = []; }
            });
        } else if (type === 'Instance') {
            this.pageAdminService.getInstanceList(payload).subscribe({
                next: (res: any) => {
                    this.typeOptions[propKey] = (res?.Instances || []).map((i: any) => ({
                        id: i.instanceId,
                        name: i.instanceName
                    }));
                },
                error: () => { this.typeOptions[propKey] = []; }
            });
        }
    }

    onTypeNameChange(propKey: string) {
        const { type, typeName } = this.mappings[propKey];
        this.mappings[propKey].attribute = '';
        this.mappings[propKey].attributeName = '';
        this.attributeOptions[propKey] = [];
        if (typeName?.id) {
            this._loadAttributeOptions(propKey, type, typeName.id);
        }
    }

    private _loadAttributeOptions(propKey: string, type: string, id: string) {
        if (type === 'Entity') {
            this.pageAdminService.getEntityDetailsById(id).subscribe({
                next: (res: any) => {
                    this.attributeOptions[propKey] = (res?.attributes || []).map((a: any) => ({
                        id: a.attributeId, name: a.attributeName
                    }));
                },
                error: () => { this.attributeOptions[propKey] = []; }
            });
        } else if (type === 'Instance') {
            this.pageAdminService.getInstanceDetailsById(id).subscribe({
                next: (res: any) => {
                    this.attributeOptions[propKey] = (res?.attributes || []).map((a: any) => ({
                        id: a.attributeId, name: a.attributeName
                    }));
                },
                error: () => { this.attributeOptions[propKey] = []; }
            });
        }
    }

    onAttributeChange(propKey: string) {
        const attrId = this.mappings[propKey].attribute;
        const attrs = this.attributeOptions[propKey] || [];
        const attr = attrs.find((a: any) => a.id === attrId);
        if (attr) {
            this.mappings[propKey].attributeName = attr.name;
        }
    }

    clearMapping(propKey: string) {
        this.mappings[propKey] = { type: '', typeName: null, attribute: '', attributeName: '' };
        this.typeOptions[propKey] = [];
        this.attributeOptions[propKey] = [];
    }

    saveMappings() {
        if (!this.selectedWidget) return;
        const result: any = {};
        for (const prop of this.widgetPropDefs) {
            const m = this.mappings[prop.key];
            if (m?.attribute) {
                result[prop.key] = { ...m };
            }
        }
        this.selectedWidget.dataMapping = result;
    }

    hasMappedProps(): boolean {
        return this.widgetPropDefs.some(p =>
            !!this.mappings[p.key]?.attribute
        );
    }

    getMappingSummary(propKey: string): string {
        const m = this.mappings[propKey];
        if (!m?.attribute) return '';
        const entity = m.typeName?.name || '';
        const attr = m.attributeName || m.attribute;
        return `${entity}.${attr}`;
    }
}
