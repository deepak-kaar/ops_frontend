import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailHomeComponent } from './pages/email-home/email-home.component';
import { EmailTableComponent } from './pages/email-table/email-table.component';

const routes: Routes = [
   {
      path: '',
      redirectTo: 'home/email',
      pathMatch: 'full'
    },
    {
      path: 'home',
      component: EmailHomeComponent,
      children: [
          {
              path: 'email',
              component: EmailTableComponent
            }
      ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailAdministrationRoutingModule { }
