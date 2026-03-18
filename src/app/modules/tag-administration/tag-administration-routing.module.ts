import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TagAdministrationComponent } from './tag-administration.component';
import { TagHomeComponent } from './pages/tag-home/tag-home.component';
import { EngineTableComponent } from './pages/engine-table/engine-table.component';

const routes: Routes = [
  { path: '', component: TagHomeComponent },
  { path: 'engine-table', component: EngineTableComponent }
];
// const routes: Routes = [{
//   path: '',
//   redirectTo: 'home/tag',
//   pathMatch: 'full'
// },
// {
//   path: 'home',
//   component: TagAdministrationComponent,
//   children: [
//       {
//           path: 'tag',
//           component: TagHomeComponent
//         }
//   ]
// }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagAdministrationRoutingModule { }
