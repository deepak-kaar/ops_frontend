import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DatabaseAdministrationNewRoutingModule } from './database-administration-new-routing.module';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { DatabaseHomeNewComponent } from './pages/database-home-new/database-home-new.component';
import { DatabaseQueryTableNewComponent } from './pages/database-query-table-new/database-query-table-new.component';
import { ManageQueryNewComponent } from './components/manage-query-new/manage-query-new.component';
import { SystemFilterNewComponent } from './components/system-filter-new/system-filter-new.component';

@NgModule({
  declarations: [
    DatabaseHomeNewComponent,
    DatabaseQueryTableNewComponent,
    ManageQueryNewComponent,
    SystemFilterNewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatabaseAdministrationNewRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent,
    MonacoEditorModule.forRoot(),
  ]
})
export class DatabaseAdministrationNewModule { }
