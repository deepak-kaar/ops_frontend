import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalculationEngineHomeV2Component } from './pages/calculation-engine-home-v2/calculation-engine-home-v2.component';
import { CalculationEngineTableV2Component } from './pages/calculation-engine-table-v2/calculation-engine-table-v2.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/main',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: CalculationEngineHomeV2Component,
    children: [
      {
        path: 'main',
        component: CalculationEngineTableV2Component
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalculationEngineV2RoutingModule { }
