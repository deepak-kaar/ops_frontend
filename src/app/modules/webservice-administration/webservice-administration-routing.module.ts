import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebserviceHomeComponent } from './pages/webservice-home/webservice-home.component';
import { WebserviceTableComponent } from './pages/webservice-table/webservice-table.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/webservice',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: WebserviceHomeComponent,
    children: [
        {
            path: 'webservice',
            component: WebserviceTableComponent
          }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebserviceAdministrationRoutingModule { }
