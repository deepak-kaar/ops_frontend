import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CorrelationEngineRoutingModule } from './correlation-engine-routing.module';
import { CorrelationEngineComponent } from './correlation-engine.component';
import { CorrelationEngineHomeComponent } from './pages/correlation-engine-home/correlation-engine-home.component';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FilterComponent } from './components/filter/filter.component';
import { CreateCorrelationComponent } from './pages/create-correlation/create-correlation.component';



@NgModule({
  declarations: [
    CorrelationEngineComponent,
    CorrelationEngineHomeComponent,
    FilterComponent,
    CreateCorrelationComponent,
  ],
  imports: [
    CommonModule,
    CorrelationEngineRoutingModule,
    SidebarComponent,
    PrimeNgModules,
    MonacoEditorModule.forRoot()
  ]
})
export class CorrelationEngineModule { }
