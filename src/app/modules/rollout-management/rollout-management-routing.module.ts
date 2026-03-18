import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolloutManagementComponent } from './rollout-management.component';

const routes: Routes = [
  { path: '', component: RolloutManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolloutManagementRoutingModule { }
