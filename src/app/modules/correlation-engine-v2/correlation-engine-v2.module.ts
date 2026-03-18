import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CorrelationEngineV2RoutingModule } from './correlation-engine-v2-routing.module';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { CorrelationEngineHomeV2Component } from './pages/correlation-engine-home-v2/correlation-engine-home-v2.component';
import { CorrelationEngineTableV2Component } from './pages/correlation-engine-table-v2/correlation-engine-table-v2.component';
import { CreateCorrelationV2Component } from './pages/create-correlation-v2/create-correlation-v2.component';
import { CorrelationEngineFilterComponent } from './components/filter/correlation-engine-filter.component';
import { CardModule } from 'primeng/card';

@NgModule({
  declarations: [
    CorrelationEngineHomeV2Component,
    CorrelationEngineTableV2Component,
    CreateCorrelationV2Component,
    CorrelationEngineFilterComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CorrelationEngineV2RoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent,
    MonacoEditorModule.forRoot(),
    CardModule
  ]
})
export class CorrelationEngineV2Module { }
