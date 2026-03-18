import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportimageAdministrationRoutingModule } from './reportimage-administration-routing.module';
import { ReportimageHomeComponent } from './pages/reportimage-home/reportimage-home.component';
import { ReportimageTableComponent } from './pages/reportimage-table/reportimage-table.component';
import { ManageReportimageComponent } from './components/manage-reportimage/manage-reportimage.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';


@NgModule({
  declarations: [
    ReportimageHomeComponent,
    ReportimageTableComponent,
    ManageReportimageComponent
  ],
  imports: [
    CommonModule,
    ReportimageAdministrationRoutingModule,
    PrimeNgModules,
    SidebarComponent,
    FilterComponent
  ]
})
export class ReportimageAdministrationModule { }
