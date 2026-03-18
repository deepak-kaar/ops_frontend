import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CorrelationEngineService } from 'src/app/modules/correlation-engine/services/correlation-engine.service';
import { FilterEngineService } from 'src/app/modules/correlation-engine/services/filter-engine.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-create-correlation-v2',
  standalone: false,
  templateUrl: './create-correlation-v2.component.html',
  styleUrl: './create-correlation-v2.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateCorrelationV2Component implements OnInit {

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

  correlationForm!: FormGroup;
  appData: any;
  mode: string = '';

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private correlationService = inject(CorrelationEngineService);
  private messageService = inject(MessageService);
  private spinner = inject(NgxSpinnerService);
  private filterService = inject(FilterEngineService);

  ngOnInit(): void {
    this.appData = history.state?.appData ?? null;
    if (this.router.url.includes('manageCorrelation')) {
      this.mode = 'Edit';
    } else {
      this.mode = 'Create';
    }
    if (!this.appData && (this.filterService.currentApp || this.filterService.currentOrg)) {
      this.appData = {
        appId: this.filterService.currentApp?.appId ?? '',
        orgId: this.filterService.currentOrg?.orgId ?? ''
      };
    }
    this.initializeForm();
    this.operations$ = this.correlationService.getAvailableOperations();
    this.addInputParams();
    this.addOutputParams();
    this.addPipeline();
  }

  get inputParams(): FormArray {
    return this.correlationForm.get('inputParams') as FormArray;
  }

  get outputParams(): FormArray {
    return this.correlationForm.get('outputParams') as FormArray;
  }

  getCorrelationStages(pipelineIndex: number): FormArray {
    return (this.correlationPipelines.at(pipelineIndex).get('correlationStages') as FormArray);
  }

  get correlationPipelines(): FormArray {
    return this.correlationForm.get('correlationPipelines') as FormArray;
  }

  addInputParams(): void {
    const variableGp = this.fb.group({
      ipName: [''],
      isRequired: [''],
      type: [''],
      simulateField: ''
    });
    this.inputParams.push(variableGp);
  }

  addOutputParams(): void {
    const variableGp = this.fb.group({
      opName: [''],
      isRequired: [''],
      type: ['']
    });
    this.outputParams.push(variableGp);
  }

  addStage(pipelineIndex: number): void {
    const stagesArray = this.getCorrelationStages(pipelineIndex);
    const stage = this.fb.group({
      type: [''],
      correlationLogic: [''],
      preview: [''],
    });

    stage.get('type')?.valueChanges.subscribe(type => {
      this.correlationService.getOperation(type).subscribe((json: any) => {
        stage.patchValue({ correlationLogic: JSON.stringify(json?.json, null, 2) });
      });
    });

    stage.get('correlationLogic')?.valueChanges.subscribe(correlationLogic => {
      if (correlationLogic && correlationLogic.trim()) {
        const stageIndex = stagesArray.controls.findIndex(control => control === stage);
        const stageType = stage.get('type')?.value || '';
        this.callPreviewCorrelationStages(pipelineIndex, correlationLogic, stageType, stageIndex);
      }
    });

    stagesArray.push(stage);
  }

  initializeForm(): void {
    this.correlationForm = this.fb.group({
      correlationName: ['', Validators.required],
      correlationDescription: ['', Validators.required],
      appId: [''],
      orgId: [''],
      inputParams: this.fb.array([]),
      outputParams: this.fb.array([]),
      jsLogic: [''],
      correlationPipelines: this.fb.array([]),
    });
  }

  addPipeline(): void {
    const pipelineGroup = this.fb.group({
      pipelineName: ['', Validators.required],
      correlationStages: this.fb.array([]),
    });
    this.correlationPipelines.push(pipelineGroup);
    this.addStage(this.correlationPipelines.length - 1);
  }

  protected showToast(severity: string, summary: string, detail: string, sticky: boolean): void {
    this.messageService.add({ severity, summary, detail, sticky });
  }

  callPreviewCorrelationStages(triggerStageIndex: number, currentLogic: string, currentType: string, stageIndex: number): void {
    try {
      const inputParams = this.correlationForm.get('inputParams')?.value.reduce((acc: any, param: any) => {
        if (param.ipName && param.simulateField) {
          acc[param.ipName] = param.simulateField;
        }
        return acc;
      }, {});

      const stages: any[] = [];
      const pipeline = this.correlationPipelines.at(triggerStageIndex);
      const correlationStages = pipeline.get('correlationStages')?.value || [];

      correlationStages.forEach((stageControl: any, index: number) => {
        let logicToUse: string;
        let typeToUse: string;

        if (index === stageIndex) {
          logicToUse = currentLogic;
          typeToUse = currentType;
        } else {
          logicToUse = stageControl?.correlationLogic || '';
          typeToUse = stageControl?.type || '';
        }

        if (logicToUse && logicToUse.trim() && typeToUse) {
          try {
            const stagePayload = {
              function: typeToUse,
              logic: JSON.parse(logicToUse)
            };
            if (Array.isArray(stagePayload.logic)) {
              stages.push(...stagePayload.logic);
            } else if (typeof stagePayload.logic === 'object' && stagePayload.logic !== null) {
              stages.push(stagePayload);
            }
          } catch {
            // skip invalid stage
          }
        }
      });

      const previewPayload = {
        inputJsonSchema: inputParams,
        stages,
        executeAll: true
      };

      this.correlationService.getPreviewCorrelationStages(previewPayload).subscribe({
        next: (response: any) => {
          if (stageIndex >= 0 && stageIndex < correlationStages.length) {
            this.getCorrelationStages(triggerStageIndex).at(stageIndex)?.patchValue({
              preview: JSON.stringify(response?.result?.ctx, null, 2)
            });
          }
        },
        error: () => {
          this.showToast('error', 'Error', 'Failed to get correlation preview', false);
        }
      });
    } catch {
      this.showToast('error', 'Error', 'Invalid correlation logic format', false);
    }
  }

  createCorrelation(): void {
    if (!this.correlationForm.valid) {
      return;
    }
    this.spinner.show();

    const appId = this.appData?.appId ?? this.filterService.currentApp?.appId ?? '';
    const orgId = this.appData?.orgId ?? this.filterService.currentOrg?.orgId ?? '';

    const inputAttr = {
      required: this.correlationForm.get('inputParams')?.value
        .reduce((acc: string[], attribute: any) => {
          if (attribute.isRequired) acc.push(attribute.ipName);
          return acc;
        }, []),
      properties: this.correlationForm.get('inputParams')?.value.map((attribute: any) => ({
        name: attribute.ipName,
        isrequired: attribute.isRequired,
        type: attribute.type
      })),
    };

    const outputAttr = {
      required: this.correlationForm.get('outputParams')?.value
        .reduce((acc: string[], attribute: any) => {
          if (attribute.isRequired) acc.push(attribute.opName);
          return acc;
        }, []),
      properties: this.correlationForm.get('outputParams')?.value.map((attribute: any) => ({
        name: attribute.opName,
        isrequired: attribute.isRequired,
        type: attribute.type
      })),
    };

    const payload = {
      correlationName: this.correlationForm.get('correlationName')?.value,
      correlationDesc: this.correlationForm.get('correlationDescription')?.value,
      internalJsonSchema: this.correlationForm.get('correlationPipelines')?.value.map((item: any) => ({
        pipelineStatement: item.pipelineName,
        pipelineSteps: item.correlationStages.map((stage: any) => ({
          function: stage.type,
          logic: JSON.parse(stage.correlationLogic)
        }))
      })),
      appId,
      orgId,
      inputJsonSchema: inputAttr,
      type: 'Correlation Engine',
      outputJsonSchema: outputAttr,
      jsLogic: (this.correlationForm.get('jsLogic')?.value ?? '').replace(/[\r\n]+/g, '')
    };

    this.correlationService.createCorrelation(payload).subscribe({
      next: () => {
        this.spinner.hide();
        this.showToast('success', 'Success', 'Correlation Template Created Successfully', false);
        this.router.navigate(['correlationEngineV2/home/main']);
      },
      error: () => {
        this.spinner.hide();
      }
    });
  }
}
