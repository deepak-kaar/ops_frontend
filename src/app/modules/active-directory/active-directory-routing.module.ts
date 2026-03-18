import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActiveDirectoryComponent } from './pages/active-directory-home/active-directory.component';

const routes: Routes = [{ path: '', component: ActiveDirectoryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActiveDirectoryRoutingModule { }
