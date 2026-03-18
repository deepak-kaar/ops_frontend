import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoggingDashboardComponent } from './pages/logging-dashboard/logging-dashboard.component';
import { LoggingOverviewComponent } from './pages/logging-overview/logging-overview.component';
import { MetricsConfigComponent } from './pages/metrics-config/metrics-config.component';

const routes: Routes = [
  {
    path: '',
    component: LoggingOverviewComponent
  },
  {
    path: 'dashboard',
    component: LoggingDashboardComponent
  },
  {
    path: 'metrics-config',
    component: MetricsConfigComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoggingRoutingModule {}
