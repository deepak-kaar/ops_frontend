import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

import { TagUtilizationRoutingModule } from './tag-utilization-routing.module';
import { TagUtilizationComponent } from './tag-utilization.component';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { TagUtilHomeComponent } from './pages/tagutil-home/tagutil-home.component';
import { FilterComponent } from './components/filter/filter.component';

@NgModule({
  declarations: [
    TagUtilizationComponent,
    TagUtilHomeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TagUtilizationRoutingModule,
    SidebarComponent,
    PrimeNgModules,
    FilterComponent,
    DropdownModule
  ]
})
export class TagUtilizationModule { }
