import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActiveDirectoryRoutingModule } from './active-directory-routing.module';
import { ActiveDirectoryComponent } from './pages/active-directory-home/active-directory.component';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { DialogService } from 'primeng/dynamicdialog';


@NgModule({
  declarations: [
    ActiveDirectoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ActiveDirectoryRoutingModule,
    SidebarNewComponent,
    TopbarNewComponent,
    PrimeNgModules
  ],
  providers: [DialogService]
})
export class ActiveDirectoryModule { }
