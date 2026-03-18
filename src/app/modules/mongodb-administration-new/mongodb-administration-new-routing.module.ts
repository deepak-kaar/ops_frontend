import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MongodbAdministrationNewComponent } from './mongodb-administration-new.component';
import { MongodbHomeNewComponent } from './pages/mongodb-home-new/mongodb-home-new.component';

const routes: Routes = [
  {
    path: '',
    component: MongodbAdministrationNewComponent,
    children: [
      { path: '', component: MongodbHomeNewComponent },
      { path: 'home', component: MongodbHomeNewComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MongodbAdministrationNewRoutingModule { }
