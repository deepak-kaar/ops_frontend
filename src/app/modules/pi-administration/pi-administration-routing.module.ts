import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PiAdminHomeComponent } from './pages/pi-admin-home/pi-admin-home.component';
import { PiAdminTabComponent } from './pages/pi-admin-tab/pi-admin-tab.component';

const routes: Routes = [{
  path: '',
  redirectTo: 'home/pi-tabs',
  pathMatch: 'full'
},
{
  path: 'home',
  component: PiAdminHomeComponent,
  children: [
      {
          path: 'pi-tabs',
          component: PiAdminTabComponent
        }
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PiAdministrationRoutingModule { }
