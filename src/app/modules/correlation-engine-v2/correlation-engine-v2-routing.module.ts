import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorrelationEngineHomeV2Component } from './pages/correlation-engine-home-v2/correlation-engine-home-v2.component';
import { CorrelationEngineTableV2Component } from './pages/correlation-engine-table-v2/correlation-engine-table-v2.component';
import { CreateCorrelationV2Component } from './pages/create-correlation-v2/create-correlation-v2.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/main',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: CorrelationEngineHomeV2Component,
    children: [
      {
        path: 'main',
        component: CorrelationEngineTableV2Component
      },
      {
        path: 'createCorrelation',
        component: CreateCorrelationV2Component
      },
      {
        path: 'manageCorrelation/:id',
        component: CreateCorrelationV2Component
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorrelationEngineV2RoutingModule { }
