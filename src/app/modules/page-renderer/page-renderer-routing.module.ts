import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageRendererComponent } from './page-renderer.component';
import { MdeComponent } from './pages/mde/mde.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GlobalRendererComponent } from './pages/global-renderer/global-renderer.component';
import { ReportPdfComponent } from './pages/report-pdf/report-pdf.component';

const routes: Routes = [
  {
    path: '',
    component: PageRendererComponent,
    children: [
      {
        path: 'mde',
        component: MdeComponent,
      },
      {
        path: 'mde/:id',
        component: GlobalRendererComponent,
      },
      {
        path: 'reports',
        component: ReportsComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'report/:id',
        component: GlobalRendererComponent,
      },
      {
        path: 'preview/:id',
        component: GlobalRendererComponent,
      },
      {
        path: 'report-pdf/:appId/:orgId/:reportId',
        component: ReportPdfComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PageRendererRoutingModule { }

