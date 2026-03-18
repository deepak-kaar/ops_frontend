import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-calculation-engine-detail',
  standalone: false,
  templateUrl: './calculation-engine-detail.component.html',
  styleUrl: './calculation-engine-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalculationEngineDetailComponent {
  @Input() template: any;
  calculationForm!: FormGroup;
  @Output() OnUpdateEmit = new EventEmitter();

  editorOptions = {
    theme: 'vs-dark', language: 'javascript',
    automaticLayout: true
  };
  dataTypes = ['Double', 'String', 'Boolean', 'Integer', 'Date', 'Array'];
  constructor(private fb: FormBuilder) {
    this.calculationForm = this.fb.group({
      calculationName: new FormControl<string>('', [Validators.required]),
      calculationDesc: new FormControl<string>(''),
      ipAttributes: new FormArray([]),
      opAttributes: new FormArray([]),
      inputAttributes: new FormControl<string>('', [Validators.required]),
      outputAttributes: new FormControl<string>('', [Validators.required]),
      calculationLogic: new FormControl<string>('', [Validators.required]),
    });
  }

  ngOnChanges() {
    if (this.template) {
      this.patchValue(this.template);
    }
  }

  patchValue(calculationData: any) {
    let outputAttributes = calculationData.outputJsonSchema.properties[0];
    this.calculationForm.patchValue({
      calculationName: calculationData.calculationName,
      calculationDesc: calculationData.calculationDesc,
      inputAttributes: calculationData.inputAttributes,
      outputAttributes: calculationData.outputAttributes,
      calculationLogic: calculationData.jsLogic,
    });
    this.inputAttr.clear();
    if (calculationData.inputJsonSchema.properties && Array.isArray(calculationData.inputJsonSchema.properties)) {
      calculationData.inputJsonSchema.properties.forEach((attribute: any) => {
        const attributeGroup = this.fb.group({
          ipName: [attribute.name || ''],
          type: [attribute?.type || ''],
          isRequired: [attribute.isrequired || false],
        });
        this.inputAttr.push(attributeGroup);
      });

      this.outputAttr.clear();
      calculationData.outputJsonSchema.properties.forEach((attribute: any) => {
        const attributeGroup = this.fb.group({
          opName: [attribute.name || ''],
          type: [attribute?.type || ''],
          isRequired: [attribute.isrequired || false],
        });
        this.outputAttr.push(attributeGroup);
      });
    }
  }

  updateCalculation() {
    console.log(this.calculationForm.value);
    this.OnUpdateEmit.emit();
  }

  /** 
  * Getter that returns the form array
  * Returns the ipAttributes form control as form array whenever the getter method is called
  * @returns {FormArray}
  */

  get inputAttr(): FormArray {
    return this.calculationForm.get('ipAttributes') as FormArray;
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
    return this.calculationForm.get('opAttributes') as FormArray;
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
