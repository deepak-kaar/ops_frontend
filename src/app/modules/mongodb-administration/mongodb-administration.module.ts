import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollerModule } from 'primeng/scroller';  // ✅ Changed from virtualscroller

import { MongodbAdministrationComponent } from './mongodb-administration.component';
import { MongoDBHomeComponent } from './pages/mongodb-home/mongodb-home.component';
import { MongodbAdministrationRoutingModule } from './mongodb-administration-routing.module';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { FilterComponent } from './component/filter/filter.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [
    MongodbAdministrationComponent,
    MongoDBHomeComponent
  ],
  imports: [
    CommonModule,
    MongodbAdministrationRoutingModule,
    SidebarComponent,
    FilterComponent, 
    PrimeNgModules,
    ScrollerModule,
       MonacoEditorModule
  ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MongodbAdministrationModule { }