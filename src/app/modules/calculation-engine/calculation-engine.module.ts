import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalculationEngineRoutingModule } from './calculation-engine-routing.module';
import { CalculationEngineComponent } from './calculation-engine.component';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { CalculationEngineTableComponent } from './pages/calculation-engine-table/calculation-engine-table.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ManageCalculationEngineComponent } from './components/manage-calculation-engine/manage-calculation-engine.component';
import { FilterComponent } from './components/filter/filter.component';
import { CalculationEngineDetailComponent } from './components/calculation-engine-detail/calculation-engine-detail.component';
import { CalculationEngineMappingComponent } from './components/calculation-engine-mapping/calculation-engine-mapping.component';
import { CalculationEngineTestrunComponent } from './components/calculation-engine-testrun/calculation-engine-testrun.component';
import { CalculationEngineMappingModalComponent } from './components/calculation-engine-mapping-modal/calculation-engine-mapping-modal.component';


@NgModule({
  declarations: [
    CalculationEngineComponent,
    CalculationEngineTableComponent,
    ManageCalculationEngineComponent,
    FilterComponent,
    CalculationEngineDetailComponent,
    CalculationEngineMappingComponent,
    CalculationEngineTestrunComponent,
    CalculationEngineMappingModalComponent
  ],
  imports: [
    CommonModule,
    CalculationEngineRoutingModule,
    SidebarComponent,
    PrimeNgModules,
    MonacoEditorModule.forRoot(),
  ],
  exports: [
    CalculationEngineDetailComponent,
    CalculationEngineMappingComponent,
    CalculationEngineTestrunComponent
  ]
})
export class CalculationEngineModule { }
