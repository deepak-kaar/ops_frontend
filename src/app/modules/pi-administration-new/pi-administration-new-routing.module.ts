import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PiHomeNewComponent } from './pages/pi-home-new/pi-home-new.component';
import { PiTableNewComponent } from './pages/pi-table-new/pi-table-new.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/pi',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: PiHomeNewComponent,
    children: [
      {
        path: 'pi',
        component: PiTableNewComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PiAdministrationNewRoutingModule { }
