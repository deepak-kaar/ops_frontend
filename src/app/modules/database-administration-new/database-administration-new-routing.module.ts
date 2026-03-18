import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatabaseHomeNewComponent } from './pages/database-home-new/database-home-new.component';
import { DatabaseQueryTableNewComponent } from './pages/database-query-table-new/database-query-table-new.component';

const routes: Routes = [{
  path: '',
  redirectTo: 'home/database',
  pathMatch: 'full'
},
{
  path: 'home',
  component: DatabaseHomeNewComponent,
  children: [
    {
      path: 'database',
      component: DatabaseQueryTableNewComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatabaseAdministrationNewRoutingModule { }
