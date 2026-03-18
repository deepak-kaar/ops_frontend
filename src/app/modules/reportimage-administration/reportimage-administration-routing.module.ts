import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportimageHomeComponent } from './pages/reportimage-home/reportimage-home.component';
import { ReportimageTableComponent } from './pages/reportimage-table/reportimage-table.component';

const routes: Routes = [
  {
        path: '',
        redirectTo: 'home/reportimage',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: ReportimageHomeComponent,
        children: [
            {
                path: 'reportimage',
                component: ReportimageTableComponent
              }
        ]
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportimageAdministrationRoutingModule { }
