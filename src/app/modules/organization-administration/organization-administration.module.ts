import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationAdministrationRoutingModule } from './organization-administration-routing.module';
import { OrganizationAdministrationComponent } from './organization-administration.component';
import { SidebarNewComponent } from "../../core/components/sidebar-new/sidebar-new.component";
import { TopbarNewComponent } from "../../core/components/topbar-new/topbar-new.component";
import { AppsManagerComponent } from './pages/apps-manager/apps-manager.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { ManageAppComponent } from './components/dialogs/manage-app/manage-app.component';
import { RolesManagerComponent } from './pages/roles-manager/roles-manager.component';
import { ManageRoleComponent } from './components/dialogs/manage-role/manage-role.component';
import { AppDetailsComponent } from './pages/app-details/app-details.component';
import { OrgsManagerComponent } from './components/apps/orgs-manager/orgs-manager.component';
import { AppRolesManagerComponent } from './components/apps/app-roles-manager/app-roles-manager.component';
import { ManageOrgComponent } from './components/dialogs/manage-org/manage-org.component';
import { RolesAssignerComponent } from './components/apps/roles-assigner/roles-assigner.component';
import { ShiftsManagerComponent } from './components/orgs/shifts-manager/shifts-manager.component';
import { GroupsManagerComponent } from './components/orgs/groups-manager/groups-manager.component';
import { ManageGroupComponent } from './components/dialogs/manage-group/manage-group.component';
import { ManageShiftComponent } from './components/dialogs/manage-shift/manage-shift.component';
import { DataAccessComponent } from './components/orgs/data-access/data-access.component';
import { FrequencyManagerComponent } from './components/apps/frequency-manager/frequency-manager.component';
import { ManageFrequencyComponent } from './components/dialogs/manage-frequency/manage-frequency.component';
import { PostLogsComponent } from './components/dialogs/post-logs/post-logs.component';
import { AppFormComponent } from './pages/app-form/app-form.component';


@NgModule({
  declarations: [
    OrganizationAdministrationComponent,
    AppsManagerComponent,
    ManageAppComponent,
    RolesManagerComponent,
    ManageRoleComponent,
    AppDetailsComponent,
    OrgsManagerComponent,
    AppRolesManagerComponent,
    ManageOrgComponent,
    RolesAssignerComponent,
    ShiftsManagerComponent,
    GroupsManagerComponent,
    ManageGroupComponent,
    ManageShiftComponent,
    DataAccessComponent,
    FrequencyManagerComponent,
    ManageFrequencyComponent,
    PostLogsComponent,
    AppFormComponent,
  ],
  imports: [
    CommonModule,
    PrimeNgModules,
    OrganizationAdministrationRoutingModule,
    SidebarNewComponent,
    TopbarNewComponent
  ]
})
export class OrganizationAdministrationModule { }
