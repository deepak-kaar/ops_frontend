import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ReportPublishAdministrationRoutingModule } from './reportpublish-administration-routing.module';
import { ReportPublishAdministrationComponent } from './reportpublish-administration.component';
import { ReportPublishHomeComponent } from './pages/reportpublish-home/reportpublish-home.component';
import { ReportPublishTableComponent } from './pages/reportpublish-table/reportpublish-table.component';
import { ManageReportPublishComponent } from './components/manage-reportpublish/manage-reportpublish.component';
import { ReportPublishFormComponent } from './pages/reportpublish-form/reportpublish-form.component';

import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { TableWrapperComponent } from 'src/app/core/components/table-wrapper/table-wrapper.component';
import { TableModule } from 'primeng/table';

import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DeleteConfirmationDialogComponent } from 'src/app/core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@NgModule({
  declarations: [
    ReportPublishAdministrationComponent,
    ReportPublishHomeComponent,
    ReportPublishTableComponent,
    ManageReportPublishComponent,
    ReportPublishFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportPublishAdministrationRoutingModule,
    PrimeNgModules,
    TableModule,
    SidebarNewComponent,
    TopbarNewComponent,
    FilterComponent,
    TableWrapperComponent,
    DeleteConfirmationDialogComponent
  ],
  providers: [
    MessageService,
    ConfirmationService,
    DialogService,
    DatePipe
  ]
})
export class ReportPublishAdministrationModule { }
