import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollerModule } from 'primeng/scroller';
import { MongodbAdministrationNewRoutingModule } from './mongodb-administration-new-routing.module';
import { MongodbAdministrationNewComponent } from './mongodb-administration-new.component';
import { MongodbHomeNewComponent } from './pages/mongodb-home-new/mongodb-home-new.component';
import { FilterNewComponent } from './component/filter-new/filter-new.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';

@NgModule({
  declarations: [
    MongodbAdministrationNewComponent,
    MongodbHomeNewComponent
  ],
  imports: [
    CommonModule,
    MongodbAdministrationNewRoutingModule,
    PrimeNgModules,
    ScrollerModule,
    MonacoEditorModule,
    FilterNewComponent,
    SidebarNewComponent,
    TopbarNewComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MongodbAdministrationNewModule { }
