import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchedulerjobAdministrationRoutingModule } from './schedulerjob-administration-routing.module';
import { SchedulerjobHomeComponent } from './pages/schedulerjob-home/schedulerjob-home.component';
import { SchedulerjobTableComponent } from './pages/schedulerjob-table/schedulerjob-table.component';
import { ManageSchedulerjobComponent } from './components/manage-schedulerjob/manage-schedulerjob.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';


@NgModule({
  declarations: [
    SchedulerjobHomeComponent,
    SchedulerjobTableComponent,
    ManageSchedulerjobComponent
  ],
  imports: [
    CommonModule,
    SchedulerjobAdministrationRoutingModule,
    PrimeNgModules,
    SidebarComponent,
    FilterComponent
  ]
})
export class SchedularjobAdministrationModule { }
