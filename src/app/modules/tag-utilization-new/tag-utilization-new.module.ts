import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TagUtilizationNewRoutingModule } from './tag-utilization-new-routing.module';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { TagUtilHomeNewComponent } from './pages/tagutil-home-new/tagutil-home-new.component';
import { FilterNewComponent } from './components/filter-new/filter-new.component';

@NgModule({
  declarations: [
    TagUtilHomeNewComponent,
    FilterNewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TagUtilizationNewRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent
  ]
})
export class TagUtilizationNewModule { }
