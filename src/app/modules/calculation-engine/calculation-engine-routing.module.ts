import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalculationEngineComponent } from './calculation-engine.component';
import { CalculationEngineTableComponent } from './pages/calculation-engine-table/calculation-engine-table.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/main',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: CalculationEngineComponent,
    children: [
      {
        path: 'main',
        component: CalculationEngineTableComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalculationEngineRoutingModule { }
