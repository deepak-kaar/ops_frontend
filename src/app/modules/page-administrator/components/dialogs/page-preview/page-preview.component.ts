import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DesignerPage, DesignerWidget } from 'src/app/modules/page-designer/page-designer.component';
import { CodeEditorComponent } from '../code-editor/code-editor.component';
import { DialogService, DynamicDialogRef as PreviewDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-page-preview',
  standalone: false,
  templateUrl: './page-preview.component.html',
  styleUrl: './page-preview.component.css'
})
export class PagePreviewComponent implements OnInit {
  template: any;
  designObject: DesignerPage | null = null;
  displayComponent: Record<string, string> = {};
  sampleDataArray: any[] = [];
  sampleDataOptions: any[] = [];
  selectedSampleIndex: number = -1;
  previewPageData: DesignerPage | null = null;
  codeEditorRef: PreviewDialogRef | undefined;

  constructor(
    public config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private messageService: MessageService,
    private dialogService: DialogService
  ) {
    this.template = this.config?.data?.template || {};
    this.designObject = this.template?.designObject || this.template?.templateObj?.designObject;
    this.displayComponent = this.template?.displayComponent || this.template?.templateObj?.displayComponent || {};
    
    // Get sample data from template
    const sampleData = this.template?.sampleData || this.template?.templateObj?.sampleData;
    if (sampleData && Array.isArray(sampleData) && sampleData.length > 0) {
      this.sampleDataArray = sampleData;
      this.sampleDataOptions = [
        { label: 'Original Data', value: -1 },
        ...sampleData.map((sample: any, index: number) => ({
          label: sample.name || sample.id || `Sample ${index + 1}`,
          value: index
        }))
      ];
      this.selectedSampleIndex = -1;
    }
  }

  ngOnInit(): void {
    // Initialize with original data
    this.updatePreview();
  }

  /**
   * Opens JSON editor to add new sample data
   */
  openSampleDataEditor(): void {
    // Create template based on first sample or original data
    let templateData: any = {};
    
    if (this.sampleDataArray.length > 0) {
      templateData = { ...this.sampleDataArray[0] };
    } else if (this.template?.dataObject || this.template?.templateObj?.dataObject) {
      const dataObject = this.template?.dataObject || this.template?.templateObj?.dataObject;
      const rootKeys = Object.keys(dataObject || {});
      if (rootKeys.length === 1 && typeof dataObject[rootKeys[0]] === 'object') {
        templateData = { ...dataObject[rootKeys[0]] };
      } else {
        templateData = { ...dataObject };
      }
    }

    this.codeEditorRef = this.dialogService.open(CodeEditorComponent, {
      width: '70vw',
      height: '60vh',
      data: templateData,
      header: 'Add New Sample Data',
      closable: true,
      modal: true
    });

    this.codeEditorRef.onClose.subscribe((result: any) => {
      if (result && result.status === true && result.code) {
        try {
          const newSampleData = JSON.parse(result.code);
          
          if (typeof newSampleData !== 'object' || Array.isArray(newSampleData)) {
            this.messageService.add({
              severity: 'error',
              summary: 'Invalid Format',
              detail: 'Sample data must be a JSON object, not an array',
              life: 3000
            });
            return;
          }

          this.sampleDataArray.push(newSampleData);
          const displayName = newSampleData.name || newSampleData.id || `Sample ${this.sampleDataArray.length}`;
          this.sampleDataOptions.push({
            label: displayName,
            value: this.sampleDataArray.length - 1
          });

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'New sample data added',
            life: 2000
          });
        } catch (error: any) {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid JSON',
            detail: error?.message || 'Unable to parse JSON',
            life: 3000
          });
        }
      }
    });
  }

  /**
   * Updates preview when sample data selection changes
   */
  onSampleDataChange(): void {
    this.updatePreview();
  }

  /**
   * Updates the preview with selected sample data
   */
  private updatePreview(): void {
    if (!this.designObject || !this.displayComponent) {
      return;
    }

    // Clone the design object
    const clonedDesign = JSON.parse(JSON.stringify(this.designObject));
    
    // Determine which data to use
    let dataToUse: any;
    if (this.selectedSampleIndex === -1) {
      // Use original dataObject
      dataToUse = this.template?.dataObject || this.template?.templateObj?.dataObject;
    } else {
      // Use selected sample data
      const selectedSample = this.sampleDataArray[this.selectedSampleIndex];
      if (!selectedSample) {
        return;
      }
      
      // Wrap in root key if original had one
      const originalData = this.template?.dataObject || this.template?.templateObj?.dataObject;
      const rootKeys = Object.keys(originalData || {});
      const singleRootKey = rootKeys.length === 1 && originalData && typeof originalData[rootKeys[0]] === 'object'
        ? rootKeys[0]
        : null;
      
      if (singleRootKey) {
        dataToUse = { [singleRootKey]: selectedSample };
      } else {
        dataToUse = selectedSample;
      }
    }

    if (!dataToUse) {
      this.previewPageData = clonedDesign;
      return;
    }

    // Apply data to widgets
    this.applyDataToWidgets(clonedDesign.widgets, dataToUse, this.displayComponent);
    
    this.previewPageData = clonedDesign;
  }

  /**
   * Applies data to widgets recursively
   */
  private applyDataToWidgets(
    widgets: DesignerWidget[],
    data: any,
    displayComponent: Record<string, string>
  ): void {
    if (!widgets || !Array.isArray(widgets)) {
      return;
    }

    const rootKeys = Object.keys(data || {});
    const singleRootKey = rootKeys.length === 1 && data && typeof data[rootKeys[0]] === 'object'
      ? rootKeys[0]
      : null;

    const resolveFieldData = (fieldPath: string): any => {
      const direct = this.extractDataFromPath(data, fieldPath);
      if (direct !== null && direct !== undefined) {
        return direct;
      }

      if (singleRootKey && !fieldPath.startsWith(singleRootKey + '.')) {
        const nestedPath = `${singleRootKey}.${fieldPath}`;
        const nested = this.extractDataFromPath(data, nestedPath);
        if (nested !== null && nested !== undefined) {
          return nested;
        }
      }

      return null;
    };

    for (const widget of widgets) {
      if (widget.type === 'section' && widget.children) {
        this.applyDataToWidgets(widget.children, data, displayComponent);
        continue;
      }

      const fieldPath = this.extractFieldPathFromLabel(widget.label);
      if (!fieldPath) {
        continue;
      }

      const displayComp = displayComponent[fieldPath];
      if (!displayComp) {
        continue;
      }

      const widgetType = this.mapDisplayComponentToWidgetType(displayComp);
      if (!widgetType) {
        continue;
      }

      const fieldData = resolveFieldData(fieldPath);
      const existingStyle = widget.input?.style || {};

      const newInput = this.createWidgetInputFromData(widgetType, fieldData, displayComp);
      
      widget.input = {
        ...widget.input,
        ...newInput,
        style: { ...existingStyle, ...newInput.style }
      };
    }
  }

  /**
   * Extracts field path from widget label (format: "Label (fieldPath)")
   */
  private extractFieldPathFromLabel(label: string): string | null {
    const match = label.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
  }

  /**
   * Extracts data from nested JSON object using dot notation path
   */
  private extractDataFromPath(data: any, path: string): any {
    const keys = path.split('.');
    let value = data;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    return value;
  }

  /**
   * Maps displayComponent values to widget types
   */
  private mapDisplayComponentToWidgetType(displayComponent: string): string | null {
    const mapping: Record<string, string> = {
      'input-field': 'input-text',
      'input-text': 'input-text',
      'bar-chart': 'bar-chart',
      'donut-chart': 'donut-chart',
      'line-chart': 'apex-line-chart',
      'pie-chart': 'pie-chart',
      'image': 'image',
      'label': 'label',
      'paragraph': 'paragraph',
      'text-area': 'text-area',
      'checkbox': 'checkbox',
      'date-picker': 'date-picker',
      'dropdown': 'dropdown',
      'radio-button': 'radio-button',
      'file-upload': 'file-upload',
      'btn': 'btn',
      'btn-icon': 'btn-icon',
      'button': 'btn',
      'icon-button': 'btn-icon'
    };
    return mapping[displayComponent.toLowerCase()] || null;
  }

  /**
   * Creates widget input based on widget type and data
   */
  private createWidgetInputFromData(widgetType: string, data: any, displayComponent: string): any {
    const defaultStyle = {
      backgroundMode: 'transparent',
      backgroundColor: 'transparent'
    };

    const baseInput = {
      style: { ...defaultStyle }
    };

    switch (widgetType) {
      case 'input-text':
        return {
          ...baseInput,
          value: typeof data === 'string' || typeof data === 'number' ? String(data) : ''
        };
      case 'image':
        return {
          ...baseInput,
          src: typeof data === 'string' ? data : '/assets/images/svgs/no-image.svg',
          alterateText: displayComponent || 'Image'
        };
      case 'label':
        return {
          ...baseInput,
          label: typeof data === 'string' || typeof data === 'number' ? String(data) : 'Label'
        };
      case 'paragraph':
        return {
          ...baseInput,
          content: typeof data === 'string' || typeof data === 'number' ? String(data) : 'Paragraph'
        };
      case 'bar-chart':
        if (data && typeof data === 'object' && data.labels && data.values) {
          return {
            ...baseInput,
            labels: data.labels,
            values: data.values,
            title: data.title || 'Chart'
          };
        }
        return {
          ...baseInput,
          labels: ['Q1', 'Q2', 'Q3'],
          values: [540, 325, 702],
          title: 'Title'
        };
      case 'donut-chart':
        if (data && typeof data === 'object' && data.labels && data.values) {
          return {
            ...baseInput,
            labels: data.labels,
            values: data.values
          };
        }
        return {
          ...baseInput,
          labels: ['A', 'B', 'C'],
          values: [100, 200, 300]
        };
      case 'pie-chart':
        if (data && typeof data === 'object' && data.labels && data.values) {
          return {
            ...baseInput,
            labels: data.labels,
            values: data.values
          };
        }
        return {
          ...baseInput,
          labels: ['A', 'B', 'C'],
          values: [540, 300, 400]
        };
      case 'apex-line-chart':
        if (data && typeof data === 'object' && data.labels && data.values) {
          return {
            ...baseInput,
            labels: data.labels,
            values: data.values
          };
        }
        return {
          ...baseInput,
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          values: [31, 40, 28, 51, 42, 109, 100]
        };
      default:
        return baseInput;
    }
  }

  /**
   * Closes the preview dialog
   */
  close(): void {
    this.ref.close();
  }
}

