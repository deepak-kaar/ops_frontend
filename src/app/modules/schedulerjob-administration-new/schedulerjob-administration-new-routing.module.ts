import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchedulerjobHomeNewComponent } from './pages/schedulerjob-home-new/schedulerjob-home-new.component';
import { SchedulerjobTableNewComponent } from './pages/schedulerjob-table-new/schedulerjob-table-new.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/schedulejob',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: SchedulerjobHomeNewComponent,
    children: [
      {
        path: 'schedulejob',
        component: SchedulerjobTableNewComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulerjobAdministrationNewRoutingModule { }
