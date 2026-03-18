import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchedulerjobHomeComponent } from './pages/schedulerjob-home/schedulerjob-home.component';
import { SchedulerjobTableComponent } from './pages/schedulerjob-table/schedulerjob-table.component';

const routes: Routes = [{
  path: '',
  redirectTo: 'home/schedulejob',
  pathMatch: 'full'
},
{
  path: 'home',
  component: SchedulerjobHomeComponent,
  children: [
      {
          path: 'schedulejob',
          component: SchedulerjobTableComponent
        }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulerjobAdministrationRoutingModule { }
