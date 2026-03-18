import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CalculationEngineService } from '../../services/calculation-engine.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-calculation-engine-testrun',
  standalone: false,
  templateUrl: './calculation-engine-testrun.component.html',
  styleUrl: './calculation-engine-testrun.component.css'
})
export class CalculationEngineTestrunComponent {
  @Input() template: any;
  calculationForm!: FormGroup;
  dynamicInputFields!: any[];
  response_output: any;
  response_status: boolean = false;

  constructor(private fb: FormBuilder, private calculationEngineService: CalculationEngineService, private messageService: MessageService) {

  }

  ngOnChanges() {
    if (this.template) {
      this.patchValue(this.template);
    }
  }

  patchValue(calculationData: any) {
    const formGroup: { [key: string]: FormControl } = {};
    this.dynamicInputFields = calculationData.inputJsonSchema.properties;


    this.dynamicInputFields.forEach(field => {
      formGroup[field.name] = new FormControl(0, Validators.required);
    });

    this.calculationForm = new FormGroup(formGroup);
  }

  testRunCalculation() {
    const payload = {
      "calculationId": this.template.calculationId,
      "inputValues": this.calculationForm.value
    }

    this.calculationEngineService.createCalEngineTestRun(payload).subscribe({
      next: (res: any) => {
        if (res) {
          this.response_output = Object.entries(res?.results).map(([name, value]) => ({
            name,
            value
          }));
          this.response_status = true;
        }
      },
      error: (err) => {
        this.response_output = null
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While Test Run", life: 3000 });
      }
    })
  }

}
