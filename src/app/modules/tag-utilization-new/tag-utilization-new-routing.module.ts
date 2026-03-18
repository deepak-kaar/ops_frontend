import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TagUtilHomeNewComponent } from './pages/tagutil-home-new/tagutil-home-new.component';

const routes: Routes = [{ path: '', component: TagUtilHomeNewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagUtilizationNewRoutingModule { }
