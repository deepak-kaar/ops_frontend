import { Component, Input, OnInit } from '@angular/core';
import { DesignerWidget } from 'src/app/modules/page-designer/page-designer.component';

@Component({
  selector: 'app-renderer-widget-host',
  templateUrl: './renderer-widget-host.component.html',
  styleUrl: './renderer-widget-host.component.css',
  standalone: false,
})
export class RendererWidgetHostComponent implements OnInit {
  @Input() widget!: DesignerWidget;
  @Input() widgetStyles!: any;
  @Input() pageId: string = '';
  @Input() date: string = '';
  /** Attribute IDs that are frozen for current role; widgets with matching attributeId are disabled */
  @Input() frozenAttributeIds: string[] = [];
  /** Schema/property keys that are frozen for current role; supports unmapped fields */
  @Input() frozenFieldKeys: string[] = [];

  ngOnInit(): void {
  }

  private normalizeToken(value: any): string {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9._-]/g, '');
  }

  private pushCandidate(candidates: Set<string>, value: any) {
    const token = this.normalizeToken(value);
    if (token) candidates.add(token);
  }

  private toLowerText(value: any): string {
    return String(value || '').toLowerCase().trim();
  }

  /**
   * Keep frontend matching aligned with backend IDT matching logic
   * (see findMatchingWidgetsRecursive in backend idt.js).
   */
  private matchesFieldName(fieldNameRaw: string): boolean {
    const fieldName = this.toLowerText(fieldNameRaw);
    if (!fieldName || !this.widget) return false;

    const widgetAny: any = this.widget;
    const idLower = this.toLowerText(widgetAny.id);
    const labelLower = this.toLowerText(
      widgetAny.label ?? widgetAny?.input?.label ?? widgetAny?.input?.attrName
    );

    return (
      idLower === fieldName ||
      labelLower === fieldName ||
      idLower.endsWith(`-${fieldName}`) ||
      labelLower.includes(`(${fieldName})`)
    );
  }

  isWidgetFrozen(): boolean {
    if (!this.widget) return false;

    // 1) Match mapped attribute IDs
    if (this.frozenAttributeIds?.length) {
      const id = (this.widget as any).attributeId ?? this.widget.input?.attributeId;
      if (id != null && id !== '') {
        const idStr = this.normalizeToken(id);
        if (this.frozenAttributeIds.some((fid) => this.normalizeToken(fid) === idStr)) {
          return true;
        }
      }
    }

    // 2) Match schema/property keys for unmapped fields (e.g. age.input-text.value)
    if (this.frozenFieldKeys?.length) {
      const widgetId = (this.widget as any)?.id;
      const widgetType = (this.widget as any)?.type;
      const attrName = (this.widget as any)?.input?.attrName;
      const label = (this.widget as any)?.input?.label ?? (this.widget as any)?.label;

      const candidateKeys = new Set<string>();
      const addSchemaCandidates = (base: any, type: any) => {
        const b = this.normalizeToken(base);
        const t = this.normalizeToken(type);
        if (!b || !t) return;
        this.pushCandidate(candidateKeys, `${b}.${t}`);
        this.pushCandidate(candidateKeys, `${b}.${t}.value`);
        this.pushCandidate(candidateKeys, `${b}.${t}.checked`);
        this.pushCandidate(candidateKeys, `${b}.${t}.date`);
        this.pushCandidate(candidateKeys, `${b}.${t}.src`);
        this.pushCandidate(candidateKeys, `${b}.${t}.options`);
      };

      // widget-id based keys (existing logic)
      addSchemaCandidates(widgetId, widgetType);
      // attrName/label based keys (dynamic fallback; e.g. "Age" -> age.input-text.value)
      addSchemaCandidates(attrName, widgetType);
      addSchemaCandidates(label, widgetType);

      const frozenKeySet = new Set((this.frozenFieldKeys || []).map((k) => this.normalizeToken(k)));
      for (const key of candidateKeys) {
        if (frozenKeySet.has(key)) {
          return true;
        }
      }

      // Field-name based fallback for keys like "age.input-text.value"
      // where widget id/label matching is the only reliable link.
      for (const rawKey of this.frozenFieldKeys || []) {
        const fieldName = String(rawKey || '').split('.')[0];
        if (this.matchesFieldName(fieldName)) {
          return true;
        }
      }
    }

    return false;
  }
}

