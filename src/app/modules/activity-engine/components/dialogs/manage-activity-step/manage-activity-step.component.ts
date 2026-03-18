import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ActivityEngineComponent } from '../../../activity-engine.component';
import { Observable, finalize } from 'rxjs';
import { SelectChangeEvent } from 'primeng/select';

@Component({
  selector: 'app-manage-activity-step',
  standalone: false,
  templateUrl: './manage-activity-step.component.html',
  styleUrl: './manage-activity-step.component.css'
})
export class ManageActivityStepComponent extends ActivityEngineComponent implements OnInit {

  stepForm: FormGroup;
  fmData$!: Observable<any>;
  calData = new FormData()
  mode: string = 'create';
  calculationId: string = '';
  dataTypes = ['Double', 'String', 'Boolean', 'Integer', 'Date'];

  editorOptions = {
    theme: 'vs-dark', language: 'javascript',
    automaticLayout: true
  };
  retryRules = ['No Retry', 'Retry', 'Retry Until Success'];
  runModes = ['RW', 'RM'];

  constructor(
  ) {
    super();
    this.stepForm = this.fb.group({
      stepName: new FormControl<string>('', [Validators.required]),
      stepDesc: new FormControl<string>(''),
      ipAttributes: this.fb.array([]),
      opAttributes: this.fb.array([]),
      retryRule: new FormControl<string>(''),
      runMode: new FormControl<string>(''),
      functionType: new FormControl<string>(''),
      functionId: new FormControl<string>(''),
      functionName: new FormControl<string>(''),
      functionDesc: new FormControl<string>(''),
    });

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.calculationId = this.dialogConfig.data?.rowData?.calculationId;
      this.patchValue(this.dialogConfig.data?.rowData)
    }
  }

  ngOnInit(): void {
    this.getFmData();
  }

  /**
   * @method getFmData
   * Fetches the list of function models.
   * @returns void
   */
  getFmData(): void {
    // this.spinner.show();
    let payload = {
      // appId: this.filterService.currentApp?.appId ?? '',
      // orgId: this.filterService.currentOrg?.orgId ?? ''
    }
    this.fmData$ = this.activityService.getFunctionModels(payload).pipe(
      finalize(() => this.spinner.hide())
    );
  }

  create(): void {
    if (this.mode === 'create') {
      if (!this.stepForm.valid) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please fill the required values", life: 3000 });
        return
      }
      let inputAttr = {
        required: this.stepForm.get('ipAttributes')?.value
          .reduce((acc: string[], attribute: any) => {
            if (attribute.isRequired) {
              acc.push(attribute.ipName);
            }
            return acc;
          }, []),
        properties: this.stepForm.get('ipAttributes')?.value.map((attribute: any) => ({
          name: attribute.ipName,
          isrequired: attribute.isRequired,
          type: attribute.type,
          value: attribute.value
        })),
      }
      let outputAttr = {
        required: this.stepForm.get('opAttributes')?.value
          .reduce((acc: string[], attribute: any) => {
            if (attribute.isRequired) {
              acc.push(attribute.opName);
            }
            return acc;
          }, []),
        properties: this.stepForm.get('opAttributes')?.value.map((attribute: any) => ({
          name: attribute.opName,
          isrequired: attribute.isRequired,
          type: attribute.type,
          value: attribute.value
        })),
      }

      let payload = {
        stepName: this.stepForm.get('stepName')?.value,
        stepDesc: this.stepForm.get('stepDesc')?.value,
        inputJsonSchema: inputAttr,
        outputJsonSchema: outputAttr,
        functionId: this.stepForm.get('functionId')?.value,
        functionName: this.stepForm.get('functionName')?.value,
        functionDesc: this.stepForm.get('functionDesc')?.value,
        appId: this.filterService.currentApp?.appId ?? '',
        appName: this.filterService.currentApp?.appName ?? '',
        orgId: this.filterService.currentOrg?.orgId ?? '',
        orgName: this.filterService.currentOrg?.orgName ?? '',
      }

      this.activityService.createStep(payload).subscribe({
        next: (res: any) => {
          if (res) {
            this.ref.close({ status: true });
          }
        },
        error: (err) => {
          this.showToast('error', 'Error', "Error While Creating app", false, 3000);
        }
      })

    }
  }

  cancel() {
    this.ref.close({ status: false });
  }

  patchValue(calculationData: any): void {
    let outputAttributes = calculationData.outputAttributes[0];

    this.stepForm.patchValue({
      calculationName: calculationData.calculationName,
      calculationDesc: calculationData.calculationDesc,
      inputAttributes: calculationData.inputAttributes,
      outputAttributes: calculationData.outputAttributes,
      calculationLogic: calculationData.calculationLogic[outputAttributes],
    });
  }

  /** 
  * Getter that returns the form array
  * Returns the ipAttributes form control as form array whenever the getter method is called
  * @returns {FormArray}
  */

  get inputAttr(): FormArray {
    return this.stepForm?.get('ipAttributes') as FormArray;
  }


  /**
   * Adds the fb objects to the ipAttributes fb array
   * @returns {void}
   */
  addinputAttr(): void {
    const variableGp = this.fb.group({
      ipName: [''],
      isRequired: [''],
      value: [''],
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
    return this.stepForm?.get('opAttributes') as FormArray;
  }

  /**
   * Adds the fb objects to the opAttributes fb array
   * @returns {void}
   */
  addoutputAttr(): void {
    const variableGp = this.fb.group({
      opName: [''],
      isRequired: [''],
      value: [''],
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

  onFmChange(event: SelectChangeEvent) {
    this.spinner.show();
    this.activityService.getActivityFM(event.value).subscribe({
      next: (res: any) => {
        this.inputAttr.clear();
        this.outputAttr.clear();
        this.stepForm.patchValue({
          functionId: res.activityFM.functionId,
          functionName: res.activityFM.functionName,
          functionDesc: res.activityFM.functionDesc,
        });
        res.activityFM.inputJsonSchema.properties.forEach((property: any) => {
          this.inputAttr.push(this.fb.group({
            ipName: [property.name],
            isRequired: [property.isrequired],
            type: [property.type],
            value: ['']
          }));
        });

        res.activityFM.outputJsonSchema.properties.forEach((property: any) => {
          this.outputAttr.push(this.fb.group({
            opName: [property.name],
            isRequired: [property.isrequired],
            type: [property.type],
            value: ['']
          }));
        });
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        this.showToast('error', 'Error', "Error While Getting Function Model", false, 3000);
      }
    })
  }
}
