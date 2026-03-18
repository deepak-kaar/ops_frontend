import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivityEngineComponent } from '../../../activity-engine.component';
import { Observable, finalize } from 'rxjs';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-manage-activity-instance',
  standalone: false,
  templateUrl: './manage-activity-instance.component.html',
  styleUrl: './manage-activity-instance.component.css'
})
export class ManageActivityInstanceComponent extends ActivityEngineComponent implements OnInit {

  instanceForm!: FormGroup;
  templatesData$!: Observable<any>;
  // private ref = inject(DynamicDialogRef);

  ngOnInit(): void {
    this.instanceForm = this.fb.group({
      instanceDesc: new FormControl<string>(''),
      template: new FormControl<string>(''),
      internalJsonSchema: this.fb.array([])
    })

    this.getTemplates();
  }

  getTemplates() {
    let payload = {
      appId: this.filterService.currentApp?.appId ?? '',
      orgId: this.filterService.currentOrg?.orgId ?? ''
    }
    this.templatesData$ = this.activityService.getTemplates(payload).pipe(
      finalize(() => this.spinner.hide())
    );
  }

  getTemplateDetail(value: any) {
    if (value.internalJsonSchema) {
      value.internalJsonSchema.map((input: any) => {
        this.internalJsonSchema.push(
          this.fb.group({
            ipName: [input.ipName],
            type: [input.type],
            isRequired: [input.isRequired],
            value: [input.value]
          })
        );
      })
    }
  }


  get internalJsonSchema(): FormArray {
    return this.instanceForm.get('internalJsonSchema') as FormArray;
  }

  onSubmit() {
    this.spinner.show();
    const payload = this.transformWorkflowData(this.instanceForm.get('template')?.value);
    this.activityService.createInstance(payload).subscribe((res: any) => {
      this.spinner.hide();
      this.showToast('success', 'Success', 'Activity Instance created successfully', false, 3000);
      this.ref.close();
    })
  }

  /**
     * Transform the workflow data from the current format to the required format
    */
  private transformWorkflowData(formData: any): any {
    const transformedWorkflowSteps = formData.workflowSteps.map((workflowStep: any, index: number) => {
      const stepId: any = {};

      for (const key of Object.keys(workflowStep.stepId)) {
        const step = workflowStep.stepId[key];
        console.log(key, step.stepId);
        stepId[key] = step.stepId;
      }

      return {
        order: workflowStep.order,
        stepId: stepId
      };
    });
    const internalJson = this.instanceForm.get('internalJsonSchema')?.value.reduce((acc: any, item: any) => {
      acc[item.ipName] = item.value;
      return acc;
    }, {} as Record<string, any>);

    return {
      templateId: this.instanceForm.get('template')?.value?.templateId,
      templateName: formData.templateName,
      templateDesc: formData.templateDesc,
      workflowSteps: transformedWorkflowSteps,
      appId: formData.appId,
      orgId: formData.orgId,
      instanceDesc: formData.instanceDesc,
      internalJson: internalJson
    };
  }

}
