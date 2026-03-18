import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { WebserviceAdministrationNewRoutingModule } from './webservice-administration-new-routing.module';
import { WebserviceAdministrationComponent } from './webservice-administration.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { TableWrapperComponent } from 'src/app/core/components/table-wrapper/table-wrapper.component';
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
    WebserviceAdministrationComponent,
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
    HttpClientModule,
    RouterModule,
    WebserviceAdministrationNewRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent,
    FilterComponent,
    TableWrapperComponent,
    MonacoEditorModule.forRoot(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WebserviceAdministrationNewModule { }
