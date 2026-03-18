import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportimageAdministrationNewRoutingModule } from './reportimage-administration-new-routing.module';
import { ReportimageHomeNewComponent } from './pages/reportimage-home-new/reportimage-home-new.component';
import { ReportimageTableNewComponent } from './pages/reportimage-table-new/reportimage-table-new.component';
import { ManageReportimageNewComponent } from './components/manage-reportimage-new/manage-reportimage-new.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';


@NgModule({
  declarations: [
    ReportimageHomeNewComponent,
    ReportimageTableNewComponent,
    ManageReportimageNewComponent
  ],
  imports: [
    CommonModule,
    ReportimageAdministrationNewRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent,
    FilterComponent
  ]
})
export class ReportimageAdministrationNewModule { }
