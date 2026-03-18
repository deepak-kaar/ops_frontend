import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MongodbAdministrationComponent } from './mongodb-administration.component';
import { MongoDBHomeComponent } from './pages/mongodb-home/mongodb-home.component';


const routes: Routes = [{ path: '', component: MongoDBHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MongodbAdministrationRoutingModule { }
