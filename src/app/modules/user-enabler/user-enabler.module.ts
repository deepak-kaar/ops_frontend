import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserEnablerRoutingModule } from './user-enabler-routing.module';
import { UserEnablerHomeComponent } from './pages/user-enabler-home/user-enabler-home.component';
import { UserEnablerTableComponent } from './pages/user-enabler-table/user-enabler-table.component';
import { RoleHierarchyComponent } from './pages/role-hierarchy/role-hierarchy.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { ManageUserEnablerComponent } from './components/manage-user-enabler/manage-user-enabler.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { DialogService } from 'primeng/dynamicdialog';
import { UserEnablerComponent } from './user-enabler.component';

@NgModule({
  declarations: [
    UserEnablerComponent,
    UserEnablerHomeComponent,
    UserEnablerTableComponent,
    ManageUserEnablerComponent,
    RoleHierarchyComponent,
  ],
  imports: [
    CommonModule,
    UserEnablerRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent,
    FilterComponent
  ],
  providers: [DialogService]

})
export class UserEnablerModule { }
