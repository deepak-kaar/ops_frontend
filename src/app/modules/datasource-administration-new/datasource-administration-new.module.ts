import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DatasourceAdministrationNewRoutingModule } from './datasource-administration-new-routing.module';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { DatasourceHomeNewComponent } from './pages/datasource-home-new/datasource-home-new.component';
import { DatasourceTableNewComponent } from './pages/datasource-table-new/datasource-table-new.component';
import { ManageDatasourceNewComponent } from './components/manage-datasource-new/manage-datasource-new.component';

@NgModule({
  declarations: [
    DatasourceHomeNewComponent,
    DatasourceTableNewComponent,
    ManageDatasourceNewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatasourceAdministrationNewRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent,
    FilterComponent,
    MonacoEditorModule.forRoot(),
  ]
})
export class DatasourceAdministrationNewModule { }
