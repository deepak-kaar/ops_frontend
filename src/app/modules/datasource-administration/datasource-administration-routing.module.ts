import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatasourceHomeComponent } from './pages/datasource-home/datasource-home.component';
import { DatasourceTableComponent } from './pages/datasource-table/datasource-table.component';

const routes: Routes = [{
  path: '',
  redirectTo: 'home/datasource',
  pathMatch: 'full'
},
{
  path: 'home',
  component: DatasourceHomeComponent,
  children: [
      {
          path: 'datasource',
          component: DatasourceTableComponent
        }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatasourceAdministrationRoutingModule { }
