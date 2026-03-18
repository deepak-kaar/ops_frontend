import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportGenAdministrationRoutingModule } from './report-gen-administration-routing.module';
import { ManageReportComponent } from './components/manage-report/manage-report.component';
import { ReportHomeComponent } from './pages/report-home/report-home.component';
import { ReportGenAdministrationComponent } from './report-gen-administration.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ReportTableComponent } from './pages/report-table/report-table.component';


@NgModule({
  declarations: [
    ManageReportComponent,
    ReportHomeComponent,
    ReportGenAdministrationComponent,
    ReportTableComponent
  ],
  imports: [
    CommonModule,
    ReportGenAdministrationRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent,
    FilterComponent,
    NgxDocViewerModule,
    MonacoEditorModule.forRoot(),
  ]
})
export class ReportGenAdministrationModule { }
