import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportHomeComponent } from './pages/report-home/report-home.component';
import { ReportTableComponent } from './pages/report-table/report-table.component';

const routes: Routes = [
   {
      path: '',
      redirectTo: 'home/generate-report',
      pathMatch: 'full'
    },
    {
      path: 'home',
      component: ReportHomeComponent,
      children: [
          {
              path: 'generate-report',
              component: ReportTableComponent
            }
      ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportGenAdministrationRoutingModule { }
