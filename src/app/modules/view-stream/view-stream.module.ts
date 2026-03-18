import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewStreamRoutingModule } from './view-stream-routing.module';
import { ViewStreamComponent } from './view-stream.component';
import { ViewHomeComponent } from './pages/view-home/view-home.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';


@NgModule({
  declarations: [
    ViewStreamComponent,
    ViewHomeComponent
  ],
  imports: [
    CommonModule,
    ViewStreamRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent
  ]
})
export class ViewStreamModule { }
