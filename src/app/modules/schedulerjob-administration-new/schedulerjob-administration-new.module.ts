import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchedulerjobAdministrationNewRoutingModule } from './schedulerjob-administration-new-routing.module';
import { SchedulerjobAdministrationNewComponent } from './schedulerjob-administration-new.component';
import { SchedulerjobHomeNewComponent } from './pages/schedulerjob-home-new/schedulerjob-home-new.component';
import { SchedulerjobTableNewComponent } from './pages/schedulerjob-table-new/schedulerjob-table-new.component';
import { ManageSchedulerjobNewComponent } from './components/manage-schedulerjob-new/manage-schedulerjob-new.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';


@NgModule({
  declarations: [
    SchedulerjobAdministrationNewComponent,
    SchedulerjobHomeNewComponent,
    SchedulerjobTableNewComponent,
    ManageSchedulerjobNewComponent
  ],
  imports: [
    CommonModule,
    SchedulerjobAdministrationNewRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent,
    FilterComponent
  ]
})
export class SchedulerjobAdministrationNewModule { }
