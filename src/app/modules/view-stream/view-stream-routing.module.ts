import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewHomeComponent } from './pages/view-home/view-home.component';
import { ViewStreamComponent } from './view-stream.component';

const routes: Routes = [
  {
    path: '',
    component: ViewStreamComponent,
    children: [{ path: '', component: ViewHomeComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewStreamRoutingModule { }
