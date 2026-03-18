import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';

import { PageRendererRoutingModule } from './page-renderer-routing.module';
import { PageRendererComponent } from './page-renderer.component';
import { RendererWidgetHostComponent } from './components/renderer-widget-host/renderer-widget-host.component';
import { RendererSectionContainerComponent } from './components/renderer-section-container/renderer-section-container.component';
import { RendererIteratorContainerComponent } from './components/renderer-iterator-container/renderer-iterator-container.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { WidgetsModule } from '../widgets/widgets.module';
import { ReportsComponent } from './pages/reports/reports.component';
import { MdeComponent } from './pages/mde/mde.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FilterComponent } from "src/app/core/components/filter/filter.component";
import { GlobalRendererComponent } from './pages/global-renderer/global-renderer.component';
import { SidebarNewComponent } from "src/app/core/components/sidebar-new/sidebar-new.component";
import { ReportPdfComponent } from './pages/report-pdf/report-pdf.component';

@NgModule({
  declarations: [
    PageRendererComponent,
    RendererWidgetHostComponent,
    RendererSectionContainerComponent,
    RendererIteratorContainerComponent,
    ReportsComponent,
    MdeComponent,
    DashboardComponent,
    GlobalRendererComponent,
    ReportPdfComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ToastModule,
    PrimeNgModules,
    SidebarComponent,
    WidgetsModule,
    PageRendererRoutingModule,
    FilterComponent,
    SidebarNewComponent
],
  exports: [
    GlobalRendererComponent
  ]
})
export class PageRendererModule { }

