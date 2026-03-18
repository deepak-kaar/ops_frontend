import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScanDocumentRoutingModule } from './scan-document-routing.module';
import { ScanDocumentComponent } from './scan-document.component';
import { ScanHomeComponent } from './pages/scan-home/scan-home.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';


@NgModule({
  declarations: [
    ScanDocumentComponent,
    ScanHomeComponent
  ],
  imports: [
    CommonModule,
    ScanDocumentRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent
  ]
})
export class ScanDocumentModule { }
