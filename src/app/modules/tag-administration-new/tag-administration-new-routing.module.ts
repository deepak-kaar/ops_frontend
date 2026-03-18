import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TagHomeNewComponent } from './pages/tag-home-new/tag-home-new.component';
import { EngineTableNewComponent } from './pages/engine-table-new/engine-table-new.component';

const routes: Routes = [
  { path: '', component: TagHomeNewComponent },
  { path: 'engine-table', component: EngineTableNewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagAdministrationNewRoutingModule { }
