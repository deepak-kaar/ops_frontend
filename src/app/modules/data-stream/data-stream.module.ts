import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataStreamRoutingModule } from './data-stream-routing.module';
import { DataStreamComponent } from './data-stream.component';
import { StreamHomeComponent } from './pages/stream-home/stream-home.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';


@NgModule({
  declarations: [
    DataStreamComponent,
    StreamHomeComponent
  ],
  imports: [
    CommonModule,
    DataStreamRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent
  ]
})
export class DataStreamModule { }
