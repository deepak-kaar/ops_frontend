import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CalculationEngineService } from '../../services/calculation-engine.service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CalculationEngineMappingModalComponent } from '../calculation-engine-mapping-modal/calculation-engine-mapping-modal.component';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Table } from 'primeng/table';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-calculation-engine-mapping',
  standalone: false,
  templateUrl: './calculation-engine-mapping.component.html',
  styleUrl: './calculation-engine-mapping.component.css'
})
export class CalculationEngineMappingComponent implements OnChanges {
  flags: any;
  searchValue: any;
  @Input() template: any;
  mappings: any;
  visible: boolean = false;
  showResult: boolean = false;
  showCycleError: boolean = false;
  templateData: any;
  testDate: any;
  resultData: any;
  cycleError: any = null;


  appRef!: DynamicDialogRef;
  /**
  * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
  */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  constructor(private fb: FormBuilder, private messageService: MessageService,
    private dialog: DialogService,
    private spinner: NgxSpinnerService,
    private calculationEngService: CalculationEngineService,
  ) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getMappings();
  }

  confirm(template: any) {
    this.templateData = template;
    this.visible = true;
    // Reset error states when opening dialog
    this.showCycleError = false;
    this.cycleError = null;
    this.showResult = false;
    this.resultData = [];
  }

  getMappings() {
    this.calculationEngService.getCalcMappings({ templateId: this.template.calculationId }).subscribe({
      next: (res: any) => {
        this.mappings = res.calculationMapping;
      },
      error: (err: any) => {
      }
    })
  }

  createAttributeTemplate() {
    this.appRef = this.dialog.open(CalculationEngineMappingModalComponent, {
      header: 'Create Attribute Template Mapping',
      modal: true,
      closable: true,
      maximizable: true,
      data: {
        template: this.template,
        mode: 'create',
        appData: {
          appId: this.template.appId,
          orgId: this.template.orgId
        }
      },
      width: '95rem'
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status === 200) {
        this.getMappings();
      }
    });
  }

  applyFilterGlobal($event: any, arg1: any) {
    throw new Error('Method not implemented.');
  }
  openMapping(template: any) {
    this.appRef = this.dialog.open(CalculationEngineMappingModalComponent, {
      header: 'Create Attribute Template Mapping',
      modal: true,
      closable: true,
      maximizable: true,
      data: {
        template: template,
        mode: 'edit',
        appData: {
          appId: this.template.appId,
          orgId: this.template.orgId
        }
      },
      width: '95rem'
    })

    this.appRef.onClose.subscribe((res: any) => {
      if (res?.status === 200) {
        this.getMappings();
      }
    });
  }
  clear(_t17: any) {
    throw new Error('Method not implemented.');
  }

  run() {
    this.spinner.show();
    if (!this.templateData || !this.testDate) {
      this.spinner.hide();
      return;
    }
      
    // New format: key is "typeName#attributeName#frequency#date"
    // Extract typeName#attributeName and frequency to match backend expectation
    const changedAttributes: Record<string, string> = {};
    console.log(this.templateData.inputAttributeList);
    
    Object.keys(this.templateData.inputAttributeList).forEach(key => {
      // Key format: "typeName#attributeName#frequency#date"
      const parts = key.split("#");
      if (parts.length >= 3) {
        // Extract typeName#attributeName as identifier and frequency as value
        // This matches what backend expects: { "typeName#attributeName": "frequency" }
        const identifier = `${parts[0]}#${parts[1]}`;
        const frequency = parts[2];
        changedAttributes[identifier] = frequency;
      } else {
        // Fallback for old format (legacy support): "attributeId_frequency"
        const [id, suffix] = key.split("_");
        if (id && suffix) {
          changedAttributes[id] = suffix;
        }
      }
    });
    
    console.log(changedAttributes);
    const payload = {
      changedAttributes,
      triggeredDate: new Date(this.testDate).toISOString()
    }
    console.log(payload)
    this.calculationEngService.runCalc(payload).subscribe({
      next: (res: any) => {
        // Reset cycle error state
        this.showCycleError = false;
        this.cycleError = null;
        this.showResult = true;
        console.log('Full response:', res);
        
        // Check if no calculations were executed due to missing input attributes
        const hasNoInputAttributes = !changedAttributes || Object.keys(changedAttributes).length === 0;
        const noCalculationsExecuted = !res.executedCalculations || 
          (Array.isArray(res.executedCalculations) && res.executedCalculations.length === 0);
        const noImpactedCalculations = (res.cacheStats?.impactedCalculations === 0) || 
          (res.impactedCalculations === 0);
        
        // Show warning if no input attributes provided and no calculations executed
        if (hasNoInputAttributes && noCalculationsExecuted && noImpactedCalculations) {
          this.spinner.hide();
          this.messageService.add({
            severity: 'warn',
            summary: 'Calculation Not Executed',
            detail: 'Since there are no input attributes in the calculation logic, the output cannot be derived. Please ensure your calculation includes input attributes that can trigger the calculation.',
            life: 5000
          });
          this.showResult = false;
          return;
        }
        
        // Also check if calculations were provided but none executed (even with input attributes)
        if (!hasNoInputAttributes && noCalculationsExecuted && noImpactedCalculations) {
          this.spinner.hide();
          this.messageService.add({
            severity: 'info',
            summary: 'No Calculations Executed',
            detail: 'The calculation logic was evaluated but no calculations were executed. This may occur if the calculation conditions are not met or if there are no dependencies to process.',
            life: 6000
          });
          this.showResult = false;
          return;
        }
        
        // Option 1: Show only results from the current calculation (this.templateData.calculationId)
        // Option 2: Show all results (final values for all output attributes)
        // Currently using Option 2 to show cascading calculation results
        
        const resultMap = new Map<string, any>();
        const currentCalculationId = this.templateData?.calculationId;
        
        // Process all executed calculations
        if (res.executedCalculations && Array.isArray(res.executedCalculations)) {
          res.executedCalculations.forEach((calc: any) => {
            // If you want to show only current calculation results, uncomment this:
            // if (calc.calculationId !== currentCalculationId) return;
            
            if (calc.result && Array.isArray(calc.result)) {
              calc.result.forEach((resultItem: any) => {
                // Use outputAttr as key to track unique output attributes
                // If same outputAttr appears multiple times, keep the latest (last one wins)
                const key = resultItem.outputAttr || resultItem.attributeId;
                if (key) {
                  resultMap.set(key, {
                    outputAttr: resultItem.outputAttr || key,
                    attributeId: resultItem.attributeId,
                    result: resultItem.result,
                    calculationId: calc.calculationId
                  });
                }
              });
            }
          });
        }
        
        // Convert map to array for display
        this.resultData = Array.from(resultMap.values());
        console.log('Processed result data (final values per output attribute):', this.resultData);
        console.log(`Showing ${this.resultData.length} unique output attribute(s) with their final calculated values`);
        this.spinner.hide();
      },
      error: (err: any) => {
        console.error('Calculation error:', err);
        this.spinner.hide();
        
        // Extract error data - handle both HttpErrorResponse and plain error objects
        const errorData = err?.error || err;
        const status = err?.status || err?.error?.status;
        
        // Check if this is a cycle error (400 status with cycles)
        if (status === 400 && errorData && errorData.token === "400" && errorData.cycles && Array.isArray(errorData.cycles)) {
          // Handle cycle error - show in UI instead of toast
          // Normalize cycles: convert old format (array of arrays) to new format (array of objects)
          const normalizedCycles = errorData.cycles.map((cycle: any) => {
            // If already in enriched format (has path and calculations), use as is
            if (cycle && typeof cycle === 'object' && (cycle.path || cycle.calculations)) {
              return cycle;
            }
            // If it's an array (old format), convert to new format
            if (Array.isArray(cycle)) {
              return {
                path: cycle,
                calculations: [] // Will be empty for old format
              };
            }
            return cycle;
          });

          this.showCycleError = true;
          this.showResult = false;
          this.cycleError = {
            error: errorData.error || "Circular dependency detected",
            cycles: normalizedCycles,
            instanceId: errorData.instanceId
          };
          console.log('Cycle error detected:', this.cycleError);
        } else {
          // For other errors, you might still want to show a toast or handle differently
          // But for now, we'll just log it
          console.error('Non-cycle error:', err);
        }
      }
    })
  }
  closeRun() {
    this.showResult = false;
    this.showCycleError = false;
    this.cycleError = null;
    this.visible = !this.visible
  }

  /**
   * Formats a single attribute identifier for display
   * Extracts attribute name from format: "typeName#attributeName#frequency#date"
   */
  formatAttributeName(attr: string): string {
    const parts = attr.split('#');
    if (parts.length >= 2) {
      return parts[1]; // Return attribute name (e.g., "test_cal_attr_a")
    }
    return attr; // Fallback to full string
  }

  /**
   * Formats cycle information for display
   * Extracts attribute names from the cycle path and joins them with arrows
   */
  formatCyclePath(cycle: string[]): string {
    return cycle.map(attr => this.formatAttributeName(attr)).join(' → ');
  }

  /**
   * Checks if an object has any keys
   * Used in templates where Object.keys() is not available
   */
  hasKeys(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    return Object.keys(obj).length > 0;
  }


}