import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatasourceHomeNewComponent } from './pages/datasource-home-new/datasource-home-new.component';
import { DatasourceTableNewComponent } from './pages/datasource-table-new/datasource-table-new.component';

const routes: Routes = [{
  path: '',
  redirectTo: 'home/datasource',
  pathMatch: 'full'
},
{
  path: 'home',
  component: DatasourceHomeNewComponent,
  children: [
    {
      path: 'datasource',
      component: DatasourceTableNewComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatasourceAdministrationNewRoutingModule { }
