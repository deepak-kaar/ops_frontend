import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

/**
 * @component
 * @description
 * `CodeEditorComponent` is a dialog-based component used to edit JSON code.
 * It uses PrimeNG's DynamicDialog to receive input data and return the edited result.
 * The component uses a code editor (e.g., Monaco) with syntax highlighting for JSON.
 */
@Component({
  selector: 'app-code-editor',
  standalone: false,
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.css'
})
export class CodeEditorComponent {
  /**
   * Configuration options for the code editor.
   * - `theme`: Sets the editor's theme to "vs-dark".
   * - `language`: Specifies JSON as the editing language.
   * - `automaticLayout`: Ensures the editor automatically adjusts its layout.
   */
  editorOptions = {
    theme: 'vs-dark', language: 'json',
    automaticLayout: true
  };

  /**
   * Holds the JSON code to be edited, initially populated from the dialog config data.
   */
  code: string = ''

  /**
   * Stores the original code when switching to empty mode
   */
  originalCode: string = ''

  /**
   * Toggle between normal and empty code editor modes
   */
  isNormalMode: boolean = true

  /**
   * Creates an instance of the CodeEditorComponent.
   *
   * @param dialogConfig - Contains the input data passed to the dialog.
   * @param ref - Reference to the dialog used for closing and returning data.
   */
  constructor(public dialogConfig: DynamicDialogConfig, private ref: DynamicDialogRef) {
    const data = this.dialogConfig?.data ?? {};
    this.code = JSON.stringify(data, null, 2);
    this.originalCode = this.code;
  }

  /**
   * Toggles between normal and empty code editor modes
   * Note: ngModelChange fires after the model is updated, so isNormalMode is already the new value
   */
  toggleMode(): void {
    if (this.isNormalMode) {
      // Just switched TO normal mode - restore original code
      this.code = this.originalCode;
    } else {
      // Just switched TO empty mode - save current code and clear editor
      // Only save if we have code (to avoid overwriting with empty string)
      if (this.code && this.code.trim() !== '') {
        this.originalCode = this.code;
      }
      this.code = '';
    }
  }

  /**
   * Checks if the JSON has the widget generation structure (data/dataObject + displayComponent)
   */
  private hasWidgetGenerationStructure(jsonData: any): boolean {
    if (!jsonData || typeof jsonData !== 'object') {
      return false;
    }
    
    // Check for either 'data' or 'dataObject' property
    const hasData = (jsonData.data && typeof jsonData.data === 'object') ||
                   (jsonData.dataObject && typeof jsonData.dataObject === 'object');
    
    return hasData && 
           jsonData.displayComponent &&
           typeof jsonData.displayComponent === 'object';
  }

  /**
   * Normalizes JSON data structure by converting dataObject to data if needed
   * Preserves sampleData and other properties
   */
  private normalizeWidgetData(jsonData: any): any {
    if (!jsonData || typeof jsonData !== 'object') {
      return jsonData;
    }
    
    // If dataObject exists but data doesn't, normalize dataObject to data
    // But preserve the original dataObject and sampleData for the page designer
    if (jsonData.dataObject && !jsonData.data) {
      return {
        ...jsonData,
        data: jsonData.dataObject,
        // Keep original dataObject and sampleData for sample switching feature
        dataObject: jsonData.dataObject,
        sampleData: jsonData.sampleData
      };
    }
    
    return jsonData;
  }

  /**
   * Called when the user clicks the "save" button.
   * Closes the dialog and returns the updated code along with a success status.
   * If in empty mode and JSON has widget generation structure, includes a flag to generate widgets.
   * @returns - returns nothing
   */
  save():void {
    if (this.code) {
      try {
        const jsonData = JSON.parse(this.code);
        const shouldGenerateWidgets = !this.isNormalMode && this.hasWidgetGenerationStructure(jsonData);
        
        // Normalize the data structure before passing it along
        const normalizedData = shouldGenerateWidgets ? this.normalizeWidgetData(jsonData) : jsonData;
        
        this.ref.close({
          status: true,
          code: this.code,
          shouldGenerateWidgets: shouldGenerateWidgets,
          widgetData: shouldGenerateWidgets ? normalizedData : null
        });
      } catch (error) {
        // If JSON is invalid, just return the code (let the parent handle validation)
        this.ref.close({
          status: true,
          code: this.code,
          shouldGenerateWidgets: false,
          widgetData: null
        });
      }
    }
  }

}
