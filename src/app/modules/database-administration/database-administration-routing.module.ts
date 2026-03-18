import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatabaseHomeComponent } from './pages/database-home/database-home.component';
import { DatabaseQueryTableComponent } from './pages/database-query-table/database-query-table.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/database',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: DatabaseHomeComponent,
    children: [
        {
            path: 'database',
            component: DatabaseQueryTableComponent
          }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatabaseAdministrationRoutingModule { }
