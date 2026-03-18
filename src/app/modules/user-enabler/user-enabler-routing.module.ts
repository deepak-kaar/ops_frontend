import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserEnablerHomeComponent } from './pages/user-enabler-home/user-enabler-home.component';
import { UserEnablerTableComponent } from './pages/user-enabler-table/user-enabler-table.component';
import { RoleHierarchyComponent } from './pages/role-hierarchy/role-hierarchy.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/accountsEnabled',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: UserEnablerHomeComponent,
    children: [
        {
            path: 'accountsEnabled',
            component: UserEnablerTableComponent
          },
        {
            path: 'roleHierarchy',
            component: RoleHierarchyComponent
          }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserEnablerRoutingModule {}
