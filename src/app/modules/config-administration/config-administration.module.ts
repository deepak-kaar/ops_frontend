import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ConfigAdministrationRoutingModule } from './config-administration-routing.module';
import { ConfigHomeComponent } from './pages/config-home/config-home.component';
import { ConfigTableComponent } from './pages/config-table/config-table.component';
import { ManageConfigComponent } from './components/manage-config/manage-config.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { TableWrapperComponent } from 'src/app/core/components/table-wrapper/table-wrapper.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';


@NgModule({
  declarations: [
    ConfigHomeComponent,
    ConfigTableComponent,
    ManageConfigComponent
  ],
  imports: [
    CommonModule,
    FormsModule, // Required for ngModel in templates
    ConfigAdministrationRoutingModule,
    PrimeNgModules, // Includes TableModule which is exported
    SidebarNewComponent,
    TopbarNewComponent,
    FilterComponent,
    TableWrapperComponent,
    MonacoEditorModule.forRoot(),
  ]
})
export class ConfigAdministrationModule { }
