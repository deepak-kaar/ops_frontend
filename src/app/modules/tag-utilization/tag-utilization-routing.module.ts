import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TagUtilizationComponent } from './tag-utilization.component';
import { TagUtilHomeComponent } from './pages/tagutil-home/tagutil-home.component';

const routes: Routes = [{ path: '', component: TagUtilHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagUtilizationRoutingModule { }
