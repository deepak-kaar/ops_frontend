import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { CorrelationEngineComponent } from '../../correlation-engine.component';

/**
  * Component for creating a new Correlation Template.
  *
  * This component provides a form for users to input details for a new correlation,
  * such as the correlation name and description. It utilizes Angular's reactive forms
  * for validation and form state management.
  *
  * @example
  * <app-create-correlation></app-create-correlation>  *
  * @method ngOnInit Initializes the component, retrieving navigation state data.
  * @constructor Injects FormBuilder for form creation.
  */
@Component({
  selector: 'app-create-correlation',
  standalone: false,
  templateUrl: './create-correlation.component.html',
  styleUrl: './create-correlation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateCorrelationComponent extends CorrelationEngineComponent implements OnInit {

  operations$!: Observable<any>;
  dataTypes = ['Double', 'String', 'Boolean', 'Integer', 'Date'];
  editorOptions = {
    theme: 'vs-dark', language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false
  };

  previewEditorOptions = {
    theme: 'vs-dark',
    language: 'json',
    automaticLayout: true,
    readOnly: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false
  };

  correlationLogicEditorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
    readOnly: false,
    minimap: { enabled: false },
    scrollBeyondLastLine: false
  };

  /**
   * @property {FormGroup} correlationForm - The reactive form group for correlation creation.
   */
  correlationForm!: FormGroup;

  /**
   * @property {any} appData - Data passed from the navigation state, typically containing app and org context.
   */
  appData: any;

  mode: string = '';
  private router = inject(Router);
  private fb = inject(FormBuilder);


  /**
   * @method ngOnInit Initializes the component, retrieving navigation state data.
   */
  ngOnInit(): void {

    this.appData = this.router.getCurrentNavigation()?.extras.state;
    if (this.router.url.split('/')[3] === 'manageCorrelation')
      this.mode = 'Edit';
    else
      this.mode = 'Create'

    this.initializeForm()
    this.operations$ = this.correlationService.getAvailableOperations();
    this.addInputParams();
    this.addOutputParams();
    this.addPipeline();
  }

  /**
   * @method inputParams - Returns the input params form array.
   * @returns {FormArray} - The input params form array.
   */
  get inputParams(): FormArray {
    return this.correlationForm.get('inputParams') as FormArray;
  }

  /**
   * @method outputParams - Returns the output params form array.
   * @returns {FormArray} - The output params form array.
   */
  get outputParams(): FormArray {
    return this.correlationForm.get('outputParams') as FormArray;
  }

  /**
   * @method correlationStages - Returns the correlation stages form array.
   * @returns {FormArray} - The correlation stages form array.
   */
  getCorrelationStages(pipelineIndex: number): FormArray {
    return (this.correlationPipelines.at(pipelineIndex).get('correlationStages') as FormArray);
  }


  /**
   * @method addInputParams - Adds a new input param to the input params form array.
   * @returns {void}
   */
  addInputParams(): void {
    const variableGp = this.fb.group({
      ipName: [''],
      isRequired: [''],
      type: [''],
      simulateField: ''
    })
    this.inputParams.push(variableGp);
  }

  /**
   * @method addOutputParams - Adds a new output param to the output params form array.
   * @returns {void}
   */
  addOutputParams(): void {
    const variableGp = this.fb.group({
      opName: [''],
      isRequired: [''],
      type: ['']
    })
    this.outputParams.push(variableGp);
  }

  /**
   * @method addOutputParams - Adds a new output param to the output params form array.
   * @returns {void}
   */

  addStage(pipelineIndex: number): void {

    const stagesArray = this.getCorrelationStages(pipelineIndex);
    const stage = this.fb.group({
      type: [''],
      correlationLogic: [''],
      preview: [''],
    });

    // Subscribe to type changes → fetch operation JSON
    stage.get('type')?.valueChanges.subscribe(type => {
      this.correlationService.getOperation(type).subscribe((json: any) => {
        stage.patchValue({ correlationLogic: JSON.stringify(json?.json, null, 2) });
      });
    });

    // Subscribe to correlationLogic changes → call preview
    stage.get('correlationLogic')?.valueChanges.subscribe(correlationLogic => {
      if (correlationLogic && correlationLogic.trim()) {
        const stageIndex = stagesArray.controls.findIndex(control => control === stage);
        const stageType = stage.get('type')?.value || '';
        this.callPreviewCorrelationStages(pipelineIndex, correlationLogic, stageType, stageIndex);
      }
    });

    stagesArray.push(stage);
  }



  /**
  * @method initializeForm - Initialize the form.
  * @returns {void}
  */
  initializeForm(): void {
    this.correlationForm = this.fb.group({
      correlationName: ['', Validators.required],
      correlationDescription: ['', Validators.required],
      appId: [''],
      orgId: [''],
      inputParams: this.fb.array([]),
      outputParams: this.fb.array([]),
      jsLogic: [''],
      correlationPipelines: this.fb.array([]), // moved correlationStages inside each pipeline
    });
  }

  /**
    * @method correlationPipelines - Returns the correlation Pipelines form array.
    * @returns {FormArray} - The correlation Pipelines form array.
    */
  get correlationPipelines(): FormArray {
    return this.correlationForm.get('correlationPipelines') as FormArray;
  }

  addPipeline(): void {
    const pipelineGroup = this.fb.group({
      pipelineName: ['', Validators.required],
      correlationStages: this.fb.array([]),
    });
    this.correlationPipelines.push(pipelineGroup);
    this.addStage(this.correlationPipelines.length - 1);
  }


  patchValue() {
    if (this.mode === 'Edit') {
      this.correlationForm.patchValue({

      })
    }
  }



  /**
   * @method callPreviewCorrelationStages - Calls the preview correlation stages method from correlation service
   * @param {number} triggerStageIndex - The index of the stage that triggered this preview call
   * @param {string} currentLogic - The current correlation logic that triggered this call
   * @param {string} currentType - The current type of the stage that triggered this call
   * @returns {void}
   */
  callPreviewCorrelationStages(triggerStageIndex: number, currentLogic: string, currentType: string, stageIndex: number): void {
    try {
      // Create input parameters object dynamically from the form
      const inputParams = this.correlationForm.get('inputParams')?.value.reduce((acc: any, param: any) => {
        if (param.ipName && param.simulateField) {
          acc[param.ipName] = param.simulateField;
        }
        return acc;
      }, {});

      // Build stages array by reading from form controls directly to get fresh values
      const stages: any[] = [];
      const pipeline = this.correlationPipelines.at(triggerStageIndex);
      const correlationStages = pipeline.get('correlationStages')?.value || [];
      // Iterate through form controls directly instead of form value
      correlationStages.forEach((stageControl: any, index: number) => {
        let logicToUse: string;
        let typeToUse: string;

        // Use the current parameters if this is the triggering stage
        if (index === stageIndex) {
          logicToUse = currentLogic;
          typeToUse = currentType;
        } else {
          // Get values directly from form controls for fresh data
          logicToUse = stageControl?.correlationLogic || '';
          typeToUse = stageControl?.type || '';
        }

        if (logicToUse && logicToUse.trim() && typeToUse) {
          try {
            const stagePayload = {
              function: typeToUse,
              logic: JSON.parse(logicToUse)
            }
            // If the logic itself is an array of stages, add all of them
            if (Array.isArray(stagePayload.logic)) {
              stages.push(...stagePayload.logic);
            }
            // If it's a single stage object, add it
            else if (typeof stagePayload.logic === 'object' && stagePayload.logic !== null) {
              stages.push(stagePayload);
            }
          } catch (parseError) {
            console.error(`Error parsing stage ${index} logic:`, parseError);
          }
        }
      });

      // Create the preview payload with dynamic structure
      const previewPayload = {
        inputJsonSchema: inputParams,
        stages: stages,
        executeAll: true
      };



      // Call the service method
      this.correlationService.getPreviewCorrelationStages(previewPayload).subscribe({
        next: (response: any) => {
          console.log('Preview Response:', response);
          // Update the preview field for the stage that triggered this call
          if (stageIndex >= 0 && stageIndex < correlationStages.length) {
            this.getCorrelationStages(triggerStageIndex).at(stageIndex)?.patchValue({
              preview: JSON.stringify(response?.result?.ctx, null, 2)
            });

          }
        },
        error: (error: any) => {
          console.error('Preview Error:', error);
          this.showToast('error', 'Error', 'Failed to get correlation preview', false);
        }
      });

    } catch (error) {
      console.error('Error in callPreviewCorrelationStages:', error);
      this.showToast('error', 'Error', 'Invalid correlation logic format', false);
    }
  }

  /**
  * @method createCorrelation - Calls the create correlation method from correlation service to create a correlation engine.
  * Map the input params and output params form array values  to split the required and normal parameters as separate ones
  * parse the calculation template array value
  * @returns {void}
  */
  createCorrelation(): void {
    if (!this.correlationForm.valid) {
      return
    }
    this.spinner.show();
    let inputAttr = {
      required: this.correlationForm.get('inputParams')?.value
        .reduce((acc: string[], attribute: any) => {
          if (attribute.isRequired) {
            acc.push(attribute.ipName);
          }
          return acc;
        }, []),
      properties: this.correlationForm.get('inputParams')?.value.map((attribute: any) => ({
        name: attribute.ipName,
        isrequired: attribute.isRequired,
        type: attribute.type
      })),
    }
    let outputAttr = {
      required: this.correlationForm.get('outputParams')?.value
        .reduce((acc: string[], attribute: any) => {
          if (attribute.isRequired) {
            acc.push(attribute.opName);
          }
          return acc;
        }, []),
      properties: this.correlationForm.get('outputParams')?.value.map((attribute: any) => ({
        name: attribute.opName,
        isrequired: attribute.isRequired,
        type: attribute.type
      })),
    }
    const payload = {
      correlationName: this.correlationForm.get('correlationName')?.value,
      correlationDesc: this.correlationForm.get('correlationDescription')?.value,
      internalJsonSchema: this.correlationForm.get('correlationPipelines')?.value.map((item: any) => {
        return {
          pipelineStatement: item.pipelineName,
          pipelineSteps: item.correlationStages.map((stage: any) => {
            return {
              function: stage.type,
              logic: JSON.parse(stage.correlationLogic)
            };
          })
        };
      }),
      appId: this.appData?.appId,
      orgId: this.appData?.orgId,
      inputJsonSchema: inputAttr,
      type: 'Correlation Engine',
      outputJsonSchema: outputAttr,
      jsLogic: this.correlationForm.get('jsLogic')?.value.replace(/[\r\n]+/g, '')
    }

    this.correlationService.createCorrelation(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.showToast('success', 'Success', 'Correlation Template Created Successfully', false)
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }


}
