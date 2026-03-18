import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorrelationEngineComponent } from './correlation-engine.component';
import { CorrelationEngineHomeComponent } from './pages/correlation-engine-home/correlation-engine-home.component';
import { CreateCorrelationComponent } from './pages/create-correlation/create-correlation.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/main',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: CorrelationEngineComponent,
    children: [
      {
        path: 'main',
        component: CorrelationEngineHomeComponent
      },
      {
        path: 'createCorrelation',
        component: CreateCorrelationComponent
      },
      {
        path: 'manageCorrelation/:id',
        component: CreateCorrelationComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorrelationEngineRoutingModule { }
