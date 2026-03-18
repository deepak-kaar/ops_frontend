import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CalculationEngineService } from 'src/app/modules/calculation-engine/services/calculation-engine.service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CalculationEngineMappingModalV2Component } from '../calculation-engine-mapping-modal-v2/calculation-engine-mapping-modal-v2.component';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { Table } from 'primeng/table';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-calculation-engine-mapping-v2',
  standalone: false,
  templateUrl: './calculation-engine-mapping-v2.component.html',
  styleUrl: './calculation-engine-mapping-v2.component.css'
})
export class CalculationEngineMappingV2Component implements OnChanges {
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
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  @ViewChild('dt') dt!: Table;

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
    this.appRef = this.dialog.open(CalculationEngineMappingModalV2Component, {
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

  applyFilterGlobal(event: Event, matchMode: string) {
    const value = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(value, matchMode);
  }

  openMapping(template: any) {
    this.appRef = this.dialog.open(CalculationEngineMappingModalV2Component, {
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

  clear(dt: Table) {
    this.searchValue = '';
    dt?.clear();
  }

  run() {
    this.spinner.show();
    if (!this.templateData || !this.testDate) {
      this.spinner.hide();
      return;
    }

    const changedAttributes: Record<string, string> = {};
    Object.keys(this.templateData.inputAttributeList).forEach(key => {
      const parts = key.split("#");
      if (parts.length >= 3) {
        const identifier = `${parts[0]}#${parts[1]}`;
        const frequency = parts[2];
        changedAttributes[identifier] = frequency;
      } else {
        const [id, suffix] = key.split("_");
        if (id && suffix) {
          changedAttributes[id] = suffix;
        }
      }
    });

    const payload = {
      changedAttributes,
      triggeredDate: new Date(this.testDate).toISOString()
    }
    this.calculationEngService.runCalc(payload).subscribe({
      next: (res: any) => {
        this.showCycleError = false;
        this.cycleError = null;
        this.showResult = true;

        const hasNoInputAttributes = !changedAttributes || Object.keys(changedAttributes).length === 0;
        const noCalculationsExecuted = !res.executedCalculations ||
          (Array.isArray(res.executedCalculations) && res.executedCalculations.length === 0);
        const noImpactedCalculations = (res.cacheStats?.impactedCalculations === 0) ||
          (res.impactedCalculations === 0);

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

        const resultMap = new Map<string, any>();
        const currentCalculationId = this.templateData?.calculationId;

        if (res.executedCalculations && Array.isArray(res.executedCalculations)) {
          res.executedCalculations.forEach((calc: any) => {
            if (calc.result && Array.isArray(calc.result)) {
              calc.result.forEach((resultItem: any) => {
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

        this.resultData = Array.from(resultMap.values());
        this.spinner.hide();
      },
      error: (err: any) => {
        console.error('Calculation error:', err);
        this.spinner.hide();

        const errorData = err?.error || err;
        const status = err?.status || err?.error?.status;

        if (status === 400 && errorData && errorData.token === "400" && errorData.cycles && Array.isArray(errorData.cycles)) {
          const normalizedCycles = errorData.cycles.map((cycle: any) => {
            if (cycle && typeof cycle === 'object' && (cycle.path || cycle.calculations)) {
              return cycle;
            }
            if (Array.isArray(cycle)) {
              return {
                path: cycle,
                calculations: []
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
        } else {
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

  formatAttributeName(attr: string): string {
    const parts = attr.split('#');
    if (parts.length >= 2) {
      return parts[1];
    }
    return attr;
  }

  formatCyclePath(cycle: string[]): string {
    return cycle.map(attr => this.formatAttributeName(attr)).join(' → ');
  }

  hasKeys(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    return Object.keys(obj).length > 0;
  }


}
