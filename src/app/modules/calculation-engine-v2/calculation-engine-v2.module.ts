import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CalculationEngineV2RoutingModule } from './calculation-engine-v2-routing.module';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { CalculationEngineHomeV2Component } from './pages/calculation-engine-home-v2/calculation-engine-home-v2.component';
import { CalculationEngineTableV2Component } from './pages/calculation-engine-table-v2/calculation-engine-table-v2.component';
import { CalculationEngineFilterComponent } from './components/filter/calculation-engine-filter.component';
import { ManageCalculationEngineComponent } from './components/manage-calculation-engine/manage-calculation-engine.component';
import { CalculationEngineDetailV2Component } from './components/calculation-engine-detail-v2/calculation-engine-detail-v2.component';
import { CalculationEngineMappingV2Component } from './components/calculation-engine-mapping-v2/calculation-engine-mapping-v2.component';
import { CalculationEngineTestrunV2Component } from './components/calculation-engine-testrun-v2/calculation-engine-testrun-v2.component';
import { CalculationEngineMappingModalV2Component } from './components/calculation-engine-mapping-modal-v2/calculation-engine-mapping-modal-v2.component';

@NgModule({
  declarations: [
    CalculationEngineHomeV2Component,
    CalculationEngineTableV2Component,
    CalculationEngineFilterComponent,
    ManageCalculationEngineComponent,
    CalculationEngineDetailV2Component,
    CalculationEngineMappingV2Component,
    CalculationEngineTestrunV2Component,
    CalculationEngineMappingModalV2Component
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CalculationEngineV2RoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent,
    MonacoEditorModule.forRoot(),
  ]
})
export class CalculationEngineV2Module { }
