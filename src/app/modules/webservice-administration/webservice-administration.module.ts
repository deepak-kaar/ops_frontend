import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WebserviceAdministrationRoutingModule } from './webservice-administration-routing.module';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { WebserviceHomeComponent } from './pages/webservice-home/webservice-home.component';
import { WebserviceTableComponent } from './pages/webservice-table/webservice-table.component';
import { WebserviceFilterComponent } from './components/webservice-filter/webservice-filter.component';
import { ManageWebserviceComponent } from './components/manage-webservice/manage-webservice.component';
import { WebserviceMapTableComponent } from './pages/webservice-map-table/webservice-map-table.component';
import { ManageWebresponseComponent } from './components/manage-webresponse/manage-webresponse.component';
import { ManageAttributeComponent } from './components/manage-attribute/manage-attribute.component';


@NgModule({
  declarations: [
    WebserviceHomeComponent,
    WebserviceTableComponent,
    WebserviceFilterComponent,
    ManageWebserviceComponent,
    WebserviceMapTableComponent,
    ManageWebresponseComponent,
    ManageAttributeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    WebserviceAdministrationRoutingModule,
    PrimeNgModules,
    SidebarComponent,
    FilterComponent,
    MonacoEditorModule.forRoot(),
  ]
})
export class WebserviceAdministrationModule { }
