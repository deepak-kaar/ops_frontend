import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmailAdministrationRoutingModule } from './email-administration-routing.module';
import { EmailHomeComponent } from './pages/email-home/email-home.component';
import { EmailTableComponent } from './pages/email-table/email-table.component';
import { ManageEmailComponent } from './components/manage-email/manage-email.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { ManageUploadComponent } from './components/manage-upload/manage-upload.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@NgModule({
  declarations: [
    EmailHomeComponent,
    EmailTableComponent,
    ManageEmailComponent,
    ManageUploadComponent
  ],
  imports: [
    CommonModule,
    EmailAdministrationRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent,
    FilterComponent,
    NgxDocViewerModule,
    MonacoEditorModule.forRoot(),
  ]
})
export class EmailAdministrationModule { }
