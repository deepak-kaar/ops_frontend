import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StreamHomeComponent } from './pages/stream-home/stream-home.component';
import { DataStreamComponent } from './data-stream.component';

const routes: Routes = [
  {
    path: '',
    component: DataStreamComponent,
    children: [{ path: '', component: StreamHomeComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataStreamRoutingModule { }
