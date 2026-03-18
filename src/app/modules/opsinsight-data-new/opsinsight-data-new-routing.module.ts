import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OpsinsightDataHomeComponent } from './pages/opsinsight-data-home/opsinsight-data-home.component';
import { OpsinsightDataTableComponent } from './pages/opsinsight-data-table/opsinsight-data-table.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/consumer',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: OpsinsightDataHomeComponent,
    children: [
      {
        path: 'consumer',
        component: OpsinsightDataTableComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OpsinsightDataNewRoutingModule { }
