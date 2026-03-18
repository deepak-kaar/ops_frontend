import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportimageHomeNewComponent } from './pages/reportimage-home-new/reportimage-home-new.component';
import { ReportimageTableNewComponent } from './pages/reportimage-table-new/reportimage-table-new.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/reportimage',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: ReportimageHomeNewComponent,
    children: [
      {
        path: 'reportimage',
        component: ReportimageTableNewComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportimageAdministrationNewRoutingModule { }
