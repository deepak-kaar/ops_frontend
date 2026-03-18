import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PiAdministrationRoutingModule } from './pi-administration-routing.module';
import { PiAdminHomeComponent } from './pages/pi-admin-home/pi-admin-home.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PiAdminTabComponent } from './pages/pi-admin-tab/pi-admin-tab.component';
import { ManagePiTagsSendComponent } from './components/dialogs/manage-pi-tags-send/manage-pi-tags-send.component';
import { ManagePiTagsReceiveComponent } from './components/dialogs/manage-pi-tags-receive/manage-pi-tags-receive.component';


@NgModule({
  declarations: [
    PiAdminHomeComponent,
    PiAdminTabComponent,
    ManagePiTagsSendComponent,
    ManagePiTagsReceiveComponent
  ],
  imports: [
    CommonModule,
    PiAdministrationRoutingModule,
    PrimeNgModules,
    SidebarComponent,
    FilterComponent,
    MonacoEditorModule.forRoot(),
  ]
})
export class PiAdministrationModule { }
