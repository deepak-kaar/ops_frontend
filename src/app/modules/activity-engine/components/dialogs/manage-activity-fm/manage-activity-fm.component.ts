import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ActivityEngineComponent } from '../../../activity-engine.component';

@Component({
  selector: 'app-manage-activity-step',
  standalone: false,
  templateUrl: './manage-activity-fm.component.html',
  styleUrl: './manage-activity-fm.component.css'
})
export class ManageActivityFmComponent extends ActivityEngineComponent implements OnInit {
  fmForm: FormGroup;
  calData = new FormData()
  mode: string = 'create';
  calculationId: string = '';
  dataTypes = ['Double', 'String', 'Boolean', 'Integer', 'Date'];

  editorOptions = {
    theme: 'vs-dark', language: 'javascript',
    automaticLayout: true
  };

  constructor() {
    super();
    this.fmForm = this.fb.group({
      fmName: new FormControl<string>('', [Validators.required]),
      fmDesc: new FormControl<string>(''),
      ipAttributes: this.fb.array([]),
      opAttributes: this.fb.array([]),
      fmLogic: new FormControl<string>('', [Validators.required]),
    });

    if (this.dialogConfig.data.mode === 'edit') {
      this.spinner.show();
      this.mode = this.dialogConfig.data.mode;
      this.calculationId = this.dialogConfig.data?.rowData?.functionId;
      this.patchValue(this.dialogConfig.data?.rowData);
      this.spinner.hide()
    }
  }

  ngOnInit(): void {
    if (this.mode === 'create') {
      this.addinputAttr();
      this.addoutputAttr();
    }
  }

  create(): void {
    if (this.mode === 'create') {
      if (!this.fmForm.valid) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please fill the required values", life: 3000 });
        return
      }
      let inputAttr = {
        required: this.fmForm.get('ipAttributes')?.value
          .reduce((acc: string[], attribute: any) => {
            if (attribute.isRequired) {
              acc.push(attribute.ipName);
            }
            return acc;
          }, []),
        properties: this.fmForm.get('ipAttributes')?.value.map((attribute: any) => ({
          name: attribute.ipName,
          isrequired: attribute.isRequired,
          type: attribute.type
        })),
      }
      let outputAttr = {
        required: this.fmForm.get('opAttributes')?.value
          .reduce((acc: string[], attribute: any) => {
            if (attribute.isRequired) {
              acc.push(attribute.opName);
            }
            return acc;
          }, []),
        properties: this.fmForm.get('opAttributes')?.value.map((attribute: any) => ({
          name: attribute.opName,
          isrequired: attribute.isRequired,
          type: attribute.type
        })),
      }

      let payload = {
        functionName: this.fmForm.get('fmName')?.value,
        functionDesc: this.fmForm.get('fmDesc')?.value,
        inputJsonSchema: inputAttr,
        outputJsonSchema: outputAttr,
        jsCode: this.fmForm.get('fmLogic')?.value.replace(/[\r\n]+/g, ''),
        appId: this.filterService.currentApp?.appId ?? '',
        appName: this.filterService.currentApp?.appName ?? '',
        orgId: this.filterService.currentOrg?.orgId ?? '',
        orgName: this.filterService.currentOrg?.orgName ?? '',
      }

      this.activityService.createFunctionModel(payload).subscribe({
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

  /**
   * @method cancel
   * Closes the dialog
   * @returns {void}
   */
  cancel(): void {
    this.ref.close({ status: false });
  }



  /**
   * @method patchValue
   * Patches the form values with the data from the function model
   * @param fmData 
   * @returns {void}
   */
  patchValue(fmData: any): void {
    this.fmForm.patchValue({
      fmName: fmData.functionName,
      fmDesc: fmData.functionDesc,
      fmLogic: fmData.jsCode,
    });
    this.inputAttr.clear();
    this.outputAttr.clear();
    fmData.inputJsonSchema.properties.forEach((property: any) => {
      this.inputAttr.push(this.fb.group({
        ipName: [property.name],
        isRequired: [property.isrequired],
        type: [property.type],
      }));
    });
    fmData.outputJsonSchema.properties.forEach((property: any) => {
      this.outputAttr.push(this.fb.group({
        opName: [property.name],
        isRequired: [property.isrequired],
        type: [property.type],
      }));
    });
  }

  /** 
  * Getter that returns the form array
  * Returns the ipAttributes form control as form array whenever the getter method is called
  * @returns {FormArray}
  */

  get inputAttr(): FormArray {
    return this.fmForm?.get('ipAttributes') as FormArray;
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
    return this.fmForm?.get('opAttributes') as FormArray;
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
