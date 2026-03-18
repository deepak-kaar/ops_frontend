import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportPublishAdministrationComponent } from './reportpublish-administration.component';
import { ReportPublishHomeComponent } from './pages/reportpublish-home/reportpublish-home.component';
import { ReportPublishTableComponent } from './pages/reportpublish-table/reportpublish-table.component';
import { ReportPublishFormComponent } from './pages/reportpublish-form/reportpublish-form.component';

const routes: Routes = [
  {
    path: '',
    component: ReportPublishAdministrationComponent,
    children: [
      {
        path: '',
        component: ReportPublishHomeComponent,
        children: [
          { path: '', component: ReportPublishTableComponent }
        ]
      },
      { path: 'create', component: ReportPublishFormComponent },
      { path: 'edit/:id', component: ReportPublishFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportPublishAdministrationRoutingModule { }
