import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ActivityEngineRoutingModule } from './activity-engine-routing.module';
import { ActivityEngineComponent } from './activity-engine.component';
import { ActivityHomeComponent } from './pages/activity-home/activity-home.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarComponent } from "src/app/core/components/sidebar/sidebar.component";
import { SidebarNewComponent } from "src/app/core/components/sidebar-new/sidebar-new.component";
import { TopbarNewComponent } from "src/app/core/components/topbar-new/topbar-new.component";
import { FunctionModelsComponent } from './pages/function-models/function-models.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ManageActivityFmComponent } from './components/dialogs/manage-activity-fm/manage-activity-fm.component';
import { ActivityStepsComponent } from './pages/activity-steps/activity-steps.component';
import { ManageActivityStepComponent } from './components/dialogs/manage-activity-step/manage-activity-step.component';
import { ActivityTemplatesComponent } from './pages/activity-templates/activity-templates.component';
import { ActivityInstancesComponent } from './pages/activity-instances/activity-instances.component';
import { ManageActivityTemplateComponent } from './components/dialogs/manage-activity-template/manage-activity-template.component';
import { ManageActivityInstanceComponent } from './components/dialogs/manage-activity-instance/manage-activity-instance.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ManageWfstepComponent } from './components/dialogs/manage-wfstep/manage-wfstep.component';
import { WfStatusComponent } from './components/dialogs/wf-status/wf-status.component';


@NgModule({
  declarations: [
    ActivityEngineComponent,
    ActivityHomeComponent,
    FunctionModelsComponent,
    ManageActivityFmComponent,
    ActivityStepsComponent,
    ManageActivityStepComponent,
    ActivityTemplatesComponent,
    ActivityInstancesComponent,
    ManageActivityTemplateComponent,
    ManageActivityInstanceComponent,
    ManageWfstepComponent,
    WfStatusComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    PrimeNgModules,
    ActivityEngineRoutingModule,
    SidebarComponent,
    SidebarNewComponent,
    TopbarNewComponent,
    FilterComponent,
    MonacoEditorModule.forRoot(),
  ],
  providers: [
    DynamicDialogConfig,
    DynamicDialogRef
  ]
})
export class ActivityEngineModule { }
