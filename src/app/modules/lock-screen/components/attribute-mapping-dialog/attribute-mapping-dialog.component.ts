import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModules } from '../../../../core/modules/primeng.module';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { LockScreenService } from '../../lock-screen.service';
import { MessageService } from 'primeng/api';
import { FilterService } from '../../../../core/services/filter/filter.service';
import { FilterNewComponent } from '../../../../core/components/filter-new/filter-new.component';
import { Subscription } from 'rxjs';

interface PageMapping {
    _id: string;
    mappingId: string;
    name: string;
    description: string;
    inputSchema: any;
    [key: string]: any;
}

interface AttributeInfo {
    propertyKey: string;
    propertyName: string;
    schemaKey: string;
    widgetId?: string;
    widgetType?: string;
    attributeId?: string | null;
    attributeName?: string | null;
    entityOrInstanceId?: string | null;
    entityOrInstanceName?: string | null;
    frequency?: string | null;
    type?: string | null;
    /** Friendly label when attribute is not mapped (e.g. from schema key "age.input-text" -> "Age") */
    displayLabel?: string;
    /** True if this field is present in selected page schema */
    isMappedInPage: boolean;
    /** True when schema mapping is explicitly mapped to an attribute */
    isAttributeMapped?: boolean;
}

@Component({
    selector: 'app-attribute-mapping-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        PrimeNgModules,
        FilterNewComponent
    ],
    providers: [MessageService],
    templateUrl: './attribute-mapping-dialog.component.html',
    styleUrls: ['./attribute-mapping-dialog.component.css']
})
export class AttributeMappingDialogComponent implements OnInit {
    pages: PageMapping[] = [];
    selectedPage: PageMapping | null = null;
    attributes: AttributeInfo[] = [];
    selectedAttributes: { [key: string]: boolean } = {};
    existingMappings: any[] = [];
    selectAll: boolean = false;
    isLoading: boolean = false;
    isLoadingCategory: boolean = false;
    isLoadingPageDetails: boolean = false;
    categoryId: string = '';
    private filterSubscriptions: Subscription[] = [];

    constructor(
        private lockScreenService: LockScreenService,
        private messageService: MessageService,
        private filterService: FilterService,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.categoryId = this.config.data?.categoryId || '';
    }

    ngOnInit(): void {
        // Subscribe to filter changes
        this.filterSubscriptions.push(
            this.filterService.selectedApp$.subscribe(() => {
                this.loadPages();
            })
        );

        this.filterSubscriptions.push(
            this.filterService.selectedOrg$.subscribe(() => {
                this.loadPages();
            })
        );

        this.loadPages();
        // Load existing mappings if categoryId is provided
        if (this.categoryId) {
            this.loadExistingMappings();
        }
    }

    ngOnDestroy(): void {
        this.filterSubscriptions.forEach(sub => sub.unsubscribe());
    }

    loadExistingMappings(): void {
        this.isLoadingCategory = true;
        this.lockScreenService.getCategoryById(this.categoryId).subscribe({
            next: (response: any) => {
                this.existingMappings = response.category?.attributeMappings || [];
                this.isLoadingCategory = false;
            },
            error: (err) => {
                console.error('Error loading existing mappings:', err);
                this.isLoadingCategory = false;
                // Don't show error toast, just continue without existing mappings
            }
        });
    }

    loadPages(): void {
        this.isLoading = true;

        const selectedApp = this.filterService.currentApp;
        const selectedOrg = this.filterService.currentOrg;

        const payload = {
            appId: selectedApp?.appId || '',
            orgId: selectedOrg?.orgId || '',
            templateType: 'Form Design'
        };

        this.lockScreenService.getTemplateMappings(payload).subscribe({
            next: (response: any) => {
                const rawPages = response.templateMappings || response.mappings || [];
                this.pages = (rawPages || []).map((page: any) => ({
                    ...page,
                    // Keep a stable mapping ID for selected-page API call.
                    mappingId: page.mappingId || page._id
                }));
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading pages:', err);
                this.isLoading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load pages'
                });
            }
        });
    }

    selectPage(page: PageMapping): void {
        this.selectedPage = page;
        const mappingId = String(page.mappingId || page._id || '');

        if (!mappingId) {
            this.extractAttributes(page);
            return;
        }

        this.isLoadingPageDetails = true;
        this.lockScreenService.getTemplateMapping({ mappingId }).subscribe({
            next: (response: any) => {
                const mappingData = response?.mapping || response || {};

                // Merge list item + detailed payload so extraction has maximum context.
                const pageWithDetails: PageMapping = {
                    ...page,
                    ...mappingData,
                    _id: page._id || mappingData._id || mappingId,
                    mappingId,
                    name: page.name || mappingData.name || mappingData.templateName || 'Unnamed Page',
                    inputSchema:
                        page.inputSchema ||
                        page['templateObj']?.inputSchema ||
                        mappingData.inputSchema ||
                        mappingData.templateObj?.inputSchema,
                    templateObj: mappingData.templateObj || page['templateObj'],
                    designObject:
                        mappingData.designObject ||
                        mappingData.templateObj?.designObject ||
                        page['designObject'] ||
                        page['templateObj']?.designObject
                };

                this.selectedPage = pageWithDetails;
                this.extractAttributes(pageWithDetails);
                this.isLoadingPageDetails = false;
            },
            error: (err) => {
                console.error('Error loading selected page mapping details:', err);
                // Fallback to list payload so user can still proceed.
                this.extractAttributes(page);
                this.isLoadingPageDetails = false;
            }
        });
    }

    /**
     * Derives a friendly display label from schema key (e.g. "age.input-text" -> "Age", "w-1765884285965-527.input-text" -> "Field 527").
     */
    private getDisplayLabelFromSchemaKey(schemaKey: string, propertyName: string): string {
        const part = schemaKey.split('.')[0] || schemaKey;
        if (part.startsWith('w-') && part.includes('-')) {
            const segments = part.split('-');
            const last = segments[segments.length - 1];
            if (/^\d+$/.test(last)) {
                return `Field ${last}`;
            }
        }
        const capitalized = part.charAt(0).toUpperCase() + part.slice(1);
        return capitalized || propertyName || 'Field';
    }

    /**
     * Resolve input schema from mapping payload; supports both direct and nested shapes.
     */
    private getPageInputSchema(page: PageMapping): any {
        return page.inputSchema || page['templateObj']?.inputSchema || null;
    }

    /**
     * Resolve preview widgets from mapping payload; same source used by global-renderer.
     */
    private getPageWidgets(page: PageMapping): any[] {
        const rootWidgets =
            page['designObject']?.widgets ||
            page['templateObj']?.designObject?.widgets ||
            page['templateObj']?.children ||
            [];
        return this.flattenWidgets(rootWidgets);
    }

    private flattenWidgets(widgets: any[]): any[] {
        const result: any[] = [];
        const stack = Array.isArray(widgets) ? [...widgets] : [];

        while (stack.length > 0) {
            const widget = stack.shift();
            if (!widget || typeof widget !== 'object') continue;
            result.push(widget);

            const childSets = [
                widget?.children,
                widget?.input?.children,
                widget?.designObject?.widgets
            ];

            for (const childSet of childSets) {
                if (Array.isArray(childSet) && childSet.length > 0) {
                    stack.push(...childSet);
                }
            }
        }

        return result;
    }

    /**
     * Resolve a user-friendly field label from the same widget object used in preview renderer.
     */
    private getWidgetLabel(widget: any, schemaKey: string, propertyName: string): string {
        if (widget?.input?.attrName) return widget.input.attrName;
        if (widget?.input?.label) return widget.input.label;
        if (widget?.type === 'label' && widget?.input?.value) return widget.input.value;
        if (widget?.input?.placeholder) return widget.input.placeholder;
        if (widget?.input?.title) return widget.input.title;
        if (widget?.label) return widget.label;
        return this.getDisplayLabelFromSchemaKey(schemaKey, propertyName);
    }

    private getWidgetNumeric(widget: any, key: string): number {
        const value = widget?.position?.[key] ?? widget?.[key];
        return typeof value === 'number' ? value : Number(value ?? 0);
    }

    private isGenericWidgetText(text: string): boolean {
        const t = String(text || '').trim().toLowerCase();
        return t === '' || ['input', 'label', 'section', 'paragraph', 'button'].includes(t);
    }

    private buildDataObjectLabelMap(dataObject: any): Map<string, string> {
        const result = new Map<string, string>();
        const walk = (node: any) => {
            if (!node || typeof node !== 'object') return;
            for (const [k, v] of Object.entries(node)) {
                if (k.startsWith('w-') && v && typeof v === 'object') {
                    const label = (v as any).label;
                    if (typeof label === 'string' && label.trim()) {
                        result.set(k, label.trim());
                    }
                }
                if (v && typeof v === 'object') walk(v);
            }
        };
        walk(dataObject);
        return result;
    }

    /**
     * Build best-effort label map for widget IDs.
     * 1) direct label from same widget
     * 2) nearest label widget (common in Manifa pages where labels are separate widgets)
     */
    private buildWidgetLabelMap(widgets: any[], page?: any): Map<string, string> {
        const labelsById = new Map<string, string>();
        const dataObjectLabels = this.buildDataObjectLabelMap(page?.dataObject);
        for (const [id, label] of dataObjectLabels.entries()) {
            labelsById.set(id, label);
        }
        const labelWidgets = (widgets || []).filter((w: any) => w?.type === 'label');

        for (const widget of widgets || []) {
            const id = widget?.id ? String(widget.id) : '';
            if (!id) continue;
            if (labelsById.has(id)) continue;
            const direct = this.getWidgetLabel(widget, id, 'value');
            if (direct && !/^Field\s+\d+$/i.test(direct) && !this.isGenericWidgetText(direct)) {
                labelsById.set(id, direct);
                continue;
            }

            const wx = this.getWidgetNumeric(widget, 'x');
            const wy = this.getWidgetNumeric(widget, 'y');
            const ww = this.getWidgetNumeric(widget, 'w') || 1;
            const widgetCenterX = wx + ww / 2;

            let bestText = '';
            let bestScore = Number.POSITIVE_INFINITY;

            const isUnitLabel = (text: string) => /^\(.*\)$/.test(text.trim());
            const sameParentLabels = labelWidgets.filter((lw: any) => (lw?.parentId || '') === (widget?.parentId || ''));
            const candidateLabels = sameParentLabels.length > 0 ? sameParentLabels : labelWidgets;

            for (const lw of candidateLabels) {
                const text = this.getWidgetLabel(lw, id, 'label');
                if (!text || this.isGenericWidgetText(text)) continue;

                const lx = this.getWidgetNumeric(lw, 'x');
                const ly = this.getWidgetNumeric(lw, 'y');
                const lwWidth = this.getWidgetNumeric(lw, 'w') || 1;
                const labelCenterX = lx + lwWidth / 2;

                const vertical = wy - ly; // prefer labels above the input
                const verticalPenalty = vertical < 0 ? 1000 : vertical * 10;

                const left = Math.max(wx, lx);
                const right = Math.min(wx + ww, lx + lwWidth);
                const overlap = Math.max(0, right - left);
                const overlapPenalty = overlap > 0 ? (1 - overlap / ww) * 20 : 200;

                const horizontal = Math.abs(widgetCenterX - labelCenterX);
                const shortPenalty = text.length < 4 ? 50 : 0;
                const unitLikePenalty = isUnitLabel(text) ? 250 : 0;

                const score = verticalPenalty + overlapPenalty + horizontal + shortPenalty + unitLikePenalty;

                if (score < bestScore) {
                    bestScore = score;
                    bestText = text;
                }
            }

            if (bestText) {
                labelsById.set(id, bestText);
            }
        }

        return labelsById;
    }

    extractAttributes(page: PageMapping): void {
        this.attributes = [];
        this.selectedAttributes = {};
        this.selectAll = false;

        const inputSchema = this.getPageInputSchema(page);
        if (!inputSchema || typeof inputSchema !== 'object') {
            return;
        }

        // Build widget lookup from designObject.widgets (same structure used by global-renderer preview)
        const widgets = this.getPageWidgets(page);
        const widgetById = new Map<string, any>();
        for (const widget of widgets) {
            if (widget?.id) {
                widgetById.set(String(widget.id), widget);
            }
        }
        const widgetLabelMap = this.buildWidgetLabelMap(widgets, page);

        // Include every property that has a mapping object (mapped or unmapped)
        for (const [schemaKey, schemaValue] of Object.entries(inputSchema)) {
            if (schemaValue && typeof schemaValue === 'object') {
                const widgetId = (schemaKey.split('.')[0] || '').trim();
                const previewWidget = widgetId ? widgetById.get(widgetId) : null;
                for (const [propertyName, propertyDef] of Object.entries(schemaValue as any)) {
                    const propertyKey = `${schemaKey}.${propertyName}`;
                    const propDef = propertyDef as any;
                    const mapping = (propDef?.mapping && typeof propDef.mapping === 'object')
                        ? propDef.mapping
                        : {};
                    const widgetType = String(previewWidget?.type || '').toLowerCase();

                    // Match global-renderer behavior: don't treat static label widgets as mappable fields.
                    if (widgetType === 'label') {
                        continue;
                    }

                    const hasAttribute = !!(mapping.type === 'attribute' && mapping.attributeId);
                    const resolvedWidgetLabel = widgetId ? widgetLabelMap.get(widgetId) : '';
                    const attributeInfo: AttributeInfo = {
                        propertyKey,
                        propertyName,
                        schemaKey,
                        widgetId: widgetId || undefined,
                        widgetType: previewWidget?.type || undefined,
                        attributeId: hasAttribute ? mapping.attributeId : null,
                        attributeName: hasAttribute ? mapping.attributeName : null,
                        entityOrInstanceId: hasAttribute ? mapping.entityOrInstanceId : null,
                        entityOrInstanceName: hasAttribute ? mapping.entityOrInstanceName : null,
                        frequency: hasAttribute ? mapping.frequency : null,
                        type: mapping.type ?? null,
                        // Prefer visual page label first (global-render style), then mapped attribute name.
                        displayLabel: resolvedWidgetLabel || mapping.attributeName || this.getWidgetLabel(previewWidget, schemaKey, propertyName),
                        isMappedInPage: true,
                        isAttributeMapped: hasAttribute
                    };
                    this.attributes.push(attributeInfo);

                    if (this.isAttributeAlreadyMapped(attributeInfo)) {
                        this.selectedAttributes[propertyKey] = true;
                    }
                }
            }
        }

        this.updateSelectAllState();
    }

    isAttributeAlreadyMapped(attribute: AttributeInfo): boolean {
        if (!this.existingMappings || this.existingMappings.length === 0) return false;
        const pageId = String(this.selectedPage?.mappingId || this.selectedPage?._id || '');
        return this.existingMappings.some((m: any) =>
            String(m.pageMappingId || '') === pageId && (
                m.propertyKey === attribute.propertyKey ||
                m.attributeId === attribute.attributeId ||
                m.attributeId === attribute.propertyKey ||
                m.attributeName === (attribute.displayLabel || attribute.attributeName)
            )
        );
    }

    toggleAttributeSelection(attributeKey: string): void {
        this.selectedAttributes[attributeKey] = !this.selectedAttributes[attributeKey];
        this.updateSelectAllState();
    }

    toggleSelectAll(): void {
        const all = this.attributes;
        const allSelected = all.length > 0 && all.every(attr => this.selectedAttributes[attr.propertyKey]);
        all.forEach(attr => {
            this.selectedAttributes[attr.propertyKey] = !allSelected;
        });
        this.selectAll = !allSelected;
    }

    updateSelectAllState(): void {
        const all = this.attributes;
        this.selectAll = all.length > 0 && all.every(attr => this.selectedAttributes[attr.propertyKey]);
    }

    getSelectedAttributesList(): AttributeInfo[] {
        return this.attributes.filter(attr => this.selectedAttributes[attr.propertyKey]);
    }

    /** Selected rows are treated directly as attributes for category mapping */
    getMappableSelectedList(): AttributeInfo[] {
        return this.attributes.filter(attr => this.selectedAttributes[attr.propertyKey]);
    }

    saveMapping(): void {
        const selectedAttrs = this.getMappableSelectedList();

        const currentPageMappings = selectedAttrs.map(attr => ({
            // Treat page field itself as attribute when no mapped attributeId exists
            attributeId: attr.attributeId || attr.propertyKey,
            attributeName: attr.displayLabel || attr.attributeName || attr.propertyName,
            entityOrInstanceId: attr.entityOrInstanceId,
            entityOrInstanceName: attr.entityOrInstanceName,
            frequency: attr.frequency ?? undefined,
            propertyKey: attr.propertyKey,
            schemaKey: attr.schemaKey,
            pageMappingId: this.selectedPage?.mappingId || this.selectedPage?._id,
            pageName: this.selectedPage?.name
        }));

        // Merge with existing mappings from other pages
        // Remove existing mappings from the current page and add new ones
        const currentPageId = this.selectedPage?.mappingId || this.selectedPage?._id;
        const otherPagesMappings = this.existingMappings.filter(
            (mapping: any) => mapping.pageMappingId !== currentPageId
        );

        const mergedMappings = [...otherPagesMappings, ...currentPageMappings];

        this.ref.close({
            success: true,
            attributeMappings: mergedMappings,
            currentPageMappings: currentPageMappings
        });
    }

    cancel(): void {
        this.ref.close({ success: false });
    }
}
