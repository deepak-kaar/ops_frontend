import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationAdministrationComponent } from './organization-administration.component';
import { AppsManagerComponent } from './pages/apps-manager/apps-manager.component';
import { RolesManagerComponent } from './pages/roles-manager/roles-manager.component';
import { AppDetailsComponent } from './pages/app-details/app-details.component';
import { AppFormComponent } from './pages/app-form/app-form.component';


const routes: Routes = [
  {
    path: 'appAdmin',
    redirectTo: 'appAdmin/home/appsManager',
    pathMatch: 'full',
  },
  {
    path: 'appAdmin/home',
    component: OrganizationAdministrationComponent,
    children: [
      {
        path: 'appsManager',
        component: AppsManagerComponent
      },
      {
        path: 'rolesManager',
        component: RolesManagerComponent
      },
      {
        path: 'apps/create',
        component: AppFormComponent
      },
      {
        path: 'apps/edit/:id',
        component: AppFormComponent
      },
      {
        path: 'appDetail/:id',
        component: AppDetailsComponent
      },
    ]
  },
  {
    path: 'opsAdmin',
    pathMatch: 'full',
    redirectTo: 'opsAdmin/home/opsManager'
  },
  {
    path: 'opsAdmin/home',
    component: OrganizationAdministrationComponent,
    children: [
      {
        path: 'opsManager',
        component: AppsManagerComponent
      },
      {
        path: 'apps/create',
        component: AppFormComponent
      },
      {
        path: 'apps/edit/:id',
        component: AppFormComponent
      },
      {
        path: 'rolesManager',
        component: RolesManagerComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationAdministrationRoutingModule { }
