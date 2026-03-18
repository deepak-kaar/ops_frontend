import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TagAdministrationNewRoutingModule } from './tag-administration-new-routing.module';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { TagHomeNewComponent } from './pages/tag-home-new/tag-home-new.component';
import { EngineTableNewComponent } from './pages/engine-table-new/engine-table-new.component';
import { FilterNewComponent } from './components/filter-new/filter-new.component';

@NgModule({
  declarations: [
    TagHomeNewComponent,
    EngineTableNewComponent,
    FilterNewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TagAdministrationNewRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent
  ]
})
export class TagAdministrationNewModule { }
