import { CalculationEngineService } from './../../services/calculation-engine.service';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FilterEngineService } from '../../services/filter-engine.service';

/**
 * 
 */
@Component({
  selector: 'app-manage-calculation-engine',
  standalone: false,
  templateUrl: './manage-calculation-engine.component.html',
  styleUrl: './manage-calculation-engine.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ManageCalculationEngineComponent {

  calculationForm: FormGroup;
  calData = new FormData()
  mode: string = 'create';
  calculationId: string = '';
  dataTypes = ['Double', 'String', 'Boolean', 'Integer', 'Date'];

  editorOptions = {
    theme: 'vs-dark', language: 'javascript',
    automaticLayout: true
  };

  constructor(public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private config: PrimeNG,
    private messageService: MessageService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private calculationEngineService: CalculationEngineService,
    private filterService: FilterEngineService
  ) {
    this.calculationForm = this.fb.group({
      calculationName: new FormControl<string>('', [Validators.required]),
      calculationDesc: new FormControl<string>(''),
      ipAttributes: this.fb.array([]),
      opAttributes: this.fb.array([]),
      calculationLogic: new FormControl<string>('', [Validators.required]),
    });

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.calculationId = this.dialogConfig.data?.rowData?.calculationId;
      this.patchValue(this.dialogConfig.data?.rowData)
    }
  }

  ngOnInit(): void {
    this.addinputAttr();
    this.addoutputAttr();
  }

  create(): void {
    if (this.mode === 'create') {
      if (!this.calculationForm.valid) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please fill the required values", life: 3000 });
        return
      }
      let inputAttr = {
        required: this.calculationForm.get('ipAttributes')?.value
          .reduce((acc: string[], attribute: any) => {
            if (attribute.isRequired) {
              acc.push(attribute.ipName);
            }
            return acc;
          }, []),
        properties: this.calculationForm.get('ipAttributes')?.value.map((attribute: any) => ({
          name: attribute.ipName,
          isrequired: attribute.isRequired,
          type: attribute.type
        })),
      }
      let outputAttr = {
        required: this.calculationForm.get('opAttributes')?.value
          .reduce((acc: string[], attribute: any) => {
            if (attribute.isRequired) {
              acc.push(attribute.opName);
            }
            return acc;
          }, []),
        properties: this.calculationForm.get('opAttributes')?.value.map((attribute: any) => ({
          name: attribute.opName,
          isrequired: attribute.isRequired,
          type: attribute.type
        })),
      }

      let payload = {
        calculationName: this.calculationForm.get('calculationName')?.value,
        calculationDesc: this.calculationForm.get('calculationDesc')?.value,
        inputJsonSchema: inputAttr,
        outputJsonSchema: outputAttr,
        jsLogic: this.calculationForm.get('calculationLogic')?.value.replace(/[\r\n]+/g, ''),
        appId: this.filterService.currentApp?.appId ?? '',
        appName: this.filterService.currentApp?.appName ?? '',
        orgId: this.filterService.currentOrg?.orgId ?? '',
        orgName: this.filterService.currentOrg?.orgName ?? '',
      }

      this.calculationEngineService.createCalEngine(payload).subscribe({
        next: (res: any) => {
          if (res) {
            this.ref.close({ status: true });
          }
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While Creating Calculation Template", life: 3000 });
        }
      })

    }
  }

  cancel() {
    this.ref.close({ status: false });
  }

  patchValue(calculationData: any): void {
    let outputAttributes = calculationData.outputJsonSchema[0];

    this.calculationForm.patchValue({
      calculationName: calculationData.calculationName,
      calculationDesc: calculationData.calculationDesc,
      inputJsonSchema: calculationData.inputAttributes,
      outputAttributes: calculationData.outputAttributes,
      calculationLogic: calculationData.jsLogic,
    });
  }

  /** 
  * Getter that returns the form array
  * Returns the ipAttributes form control as form array whenever the getter method is called
  * @returns {FormArray}
  */

  get inputAttr(): FormArray {
    return this.calculationForm?.get('ipAttributes') as FormArray;
  }


  /**
   * Adds the fb objects to the ipAttributes fb array
   * @returns {void}
   */
  addinputAttr(): void {
    const variableGp = this.fb.group({
      ipName: [''],
      isRequired: [''],
      type: ['']
    })
    this.inputAttr.push(variableGp)
  }

  /** 
  * Getter that returns the form array
  * Returns the opAttributes form control as form array whenever the getter method is called
  * @returns {FormArray}
  */

  get outputAttr(): FormArray {
    return this.calculationForm?.get('opAttributes') as FormArray;
  }

  /**
   * Adds the fb objects to the opAttributes fb array
   * @returns {void}
   */
  addoutputAttr(): void {
    const variableGp = this.fb.group({
      opName: [''],
      isRequired: [''],
      type: ['']
    })
    this.outputAttr.push(variableGp)
  }

  /**
   * Removes an attribute group from the `inputAttr` form array.
   * @param {number} index - Index of the attribute to remove.
   * @returns {void}
   */
  removeInputAttr(index: number): void {
    this.inputAttr.removeAt(index);
  }

  /**
    * Removes an attribute group from the `outputAttr` form array.
    * @param {number} index - Index of the attribute to remove.
    * @returns {void}
    */
  removeOutputAttr(index: number): void {
    this.outputAttr.removeAt(index);
  }

}
