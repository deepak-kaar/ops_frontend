import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DatasourceAdministrationRoutingModule } from './datasource-administration-routing.module';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { DatasourceHomeComponent } from './pages/datasource-home/datasource-home.component';
import { DatasourceTableComponent } from './pages/datasource-table/datasource-table.component';
import { ManageDatasourceComponent } from './components/dialogs/manage-datasource/manage-datasource.component';


@NgModule({
  declarations: [
    DatasourceHomeComponent,
    DatasourceTableComponent,
    ManageDatasourceComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DatasourceAdministrationRoutingModule,
    PrimeNgModules,
    SidebarComponent,
    FilterComponent,
    MonacoEditorModule.forRoot(),
  ]
})
export class DatasourceAdministrationModule { }
