import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityHomeComponent } from './pages/activity-home/activity-home.component';
import { FunctionModelsComponent } from './pages/function-models/function-models.component';
import { ActivityStepsComponent } from './pages/activity-steps/activity-steps.component';
import { ActivityTemplatesComponent } from './pages/activity-templates/activity-templates.component';
import { ActivityInstancesComponent } from './pages/activity-instances/activity-instances.component';
import { ManageActivityTemplateComponent } from './components/dialogs/manage-activity-template/manage-activity-template.component';

const routes: Routes = [{
  path: '',
  redirectTo: 'home/fuctionModels',
  pathMatch: 'full'
},
{
  path: 'home',
  component: ActivityHomeComponent,
  children: [
    {
      path: 'fuctionModels',
      component: FunctionModelsComponent
    },
    {
      path: 'activitySteps',
      component: ActivityStepsComponent
    },
    {
      path: 'createActivityTemplate',
      component: ManageActivityTemplateComponent
    },
    {
      path: 'activityTemplates',
      component: ActivityTemplatesComponent
    },
    {
      path: 'activityInstances',
      component: ActivityInstancesComponent
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityEngineRoutingModule { }
