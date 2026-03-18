import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TagAdministrationRoutingModule } from './tag-administration-routing.module';
import { TagAdministrationComponent } from './tag-administration.component';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { TagHomeComponent } from './pages/tag-home/tag-home.component';
import { FilterComponent } from './components/filter/filter.component';
import { DialogService } from 'primeng/dynamicdialog';
import { CalculationDetailDialogComponent } from './components/calculation-detail-dialog/calculation-detail-dialog.component';
import { CorrelationDetailDialogComponent } from './components/correlation-detail-dialog/correlation-detail-dialog.component';
import { ActivityDetailDialogComponent } from './components/activity-detail-dialog/activity-detail-dialog.component';
import { IdtDetailDialogComponent } from './components/idt-detail-dialog/idt-detail-dialog.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { EngineTableComponent } from './pages/engine-table/engine-table.component';
import { CalculationEngineModule } from '../calculation-engine/calculation-engine.module';
import { DragDropModule } from 'primeng/dragdrop';
import { AttributeDialogComponent } from './components/attribute-dialog/attribute-dialog.component';
import { ManageDefaultComponent } from './components/manage-default/manage-default.component';


@NgModule({
  declarations: [
    TagAdministrationComponent,
    TagHomeComponent,
    CalculationDetailDialogComponent,
    CorrelationDetailDialogComponent,
    ActivityDetailDialogComponent,
    IdtDetailDialogComponent,
    EngineTableComponent,
    AttributeDialogComponent,
    ManageDefaultComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    TagAdministrationRoutingModule,
    SidebarComponent,
    PrimeNgModules,
    FilterComponent,
    MonacoEditorModule,
    CalculationEngineModule
  ],

  providers: [DialogService]

})
export class TagAdministrationModule { }
