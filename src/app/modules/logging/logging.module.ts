import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';

import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { LoggingRoutingModule } from './logging-routing.module';
import { LoggingDashboardComponent } from './pages/logging-dashboard/logging-dashboard.component';
import { LoggingOverviewComponent } from './pages/logging-overview/logging-overview.component';
import { MetricsConfigComponent } from './pages/metrics-config/metrics-config.component';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component'; 
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { LoggingComponent } from './logging.component';


@NgModule({
  declarations: [
    LoggingComponent,
    LoggingDashboardComponent,
    LoggingOverviewComponent,
    MetricsConfigComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    TableModule,
    ButtonModule,
    PrimeNgModules,
    MonacoEditorModule,
    SidebarComponent, // standalone → fine
    SidebarNewComponent,
    TopbarNewComponent,
    LoggingRoutingModule,
    
  ]
})
export class LoggingModule {}

