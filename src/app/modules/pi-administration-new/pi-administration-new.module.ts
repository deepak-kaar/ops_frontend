import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PiAdministrationNewRoutingModule } from './pi-administration-new-routing.module';
import { PiAdministrationNewComponent } from './pi-administration-new.component';
import { PiHomeNewComponent } from './pages/pi-home-new/pi-home-new.component';
import { PiTableNewComponent } from './pages/pi-table-new/pi-table-new.component';
import { ManagePiNewComponent } from './components/manage-pi-new/manage-pi-new.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';


@NgModule({
  declarations: [
    PiAdministrationNewComponent,
    PiHomeNewComponent,
    PiTableNewComponent,
    ManagePiNewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    PiAdministrationNewRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    FilterComponent,
    TopbarNewComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PiAdministrationNewModule { }
