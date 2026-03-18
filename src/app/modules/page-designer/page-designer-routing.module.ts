import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageDesignerComponent } from './page-designer.component';

const routes: Routes = [
  {
    path: '',
    component: PageDesignerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PageDesignerRoutingModule {}


