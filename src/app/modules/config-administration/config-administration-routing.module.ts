import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigHomeComponent } from './pages/config-home/config-home.component';
import { ConfigTableComponent } from './pages/config-table/config-table.component';

const routes: Routes = [{
  path: '',
  redirectTo: 'home/config',
  pathMatch: 'full'
},
{
  path: 'home',
  component: ConfigHomeComponent,
  children: [
      {
          path: 'config',
          component: ConfigTableComponent
        }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigAdministrationRoutingModule { }
