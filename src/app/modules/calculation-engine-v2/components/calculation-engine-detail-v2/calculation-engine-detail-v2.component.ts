import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-calculation-engine-detail-v2',
  standalone: false,
  templateUrl: './calculation-engine-detail-v2.component.html',
  styleUrl: './calculation-engine-detail-v2.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalculationEngineDetailV2Component {
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
    this.OnUpdateEmit.emit();
  }

  get inputAttr(): FormArray {
    return this.calculationForm.get('ipAttributes') as FormArray;
  }

  addinputAttr(): void {
    const variableGp = this.fb.group({
      ipName: [''],
      isRequired: [''],
      type: ['']
    })
    this.inputAttr.push(variableGp)
  }

  get outputAttr(): FormArray {
    return this.calculationForm.get('opAttributes') as FormArray;
  }

  addoutputAttr(): void {
    const variableGp = this.fb.group({
      opName: [''],
      isRequired: [''],
      type: ['']
    })
    this.outputAttr.push(variableGp)
  }

  removeInputAttr(index: number): void {
    this.inputAttr.removeAt(index);
  }

  removeOutputAttr(index: number): void {
    this.outputAttr.removeAt(index);
  }
}
