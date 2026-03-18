import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatabaseAdministrationRoutingModule } from './database-administration-routing.module';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { DatabaseHomeComponent } from './pages/database-home/database-home.component';
import { DatabaseQueryTableComponent } from './pages/database-query-table/database-query-table.component';
import { SystemFilterComponent } from './components/system-filter/system-filter.component';
import { ManageQueryComponent } from './components/manage-query/manage-query.component';
import { DatabaseMappingTableComponent } from './pages/database-mapping-table/database-mapping-table.component';
import { ManageMappingComponent } from './components/manage-mapping/manage-mapping.component';


@NgModule({
  declarations: [
    DatabaseHomeComponent,
    DatabaseQueryTableComponent,
    SystemFilterComponent,
    ManageQueryComponent,
    DatabaseMappingTableComponent,
    ManageMappingComponent
  ],
  imports: [
    CommonModule,
    DatabaseAdministrationRoutingModule,
    PrimeNgModules,
    SidebarComponent,
    FilterComponent,
    MonacoEditorModule.forRoot(),
  ]
})
export class DatabaseAdministrationModule { }
