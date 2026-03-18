import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RendererRoutingModule } from './renderer-routing.module';
import { RendererComponent } from './renderer.component';
import { PreviewComponent } from './pages/preview/preview.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { GridstackModule } from 'gridstack/dist/angular';
import { WidgetsModule } from '../widgets/widgets.module';


@NgModule({
  declarations: [
    RendererComponent,
    PreviewComponent,
  ],
  imports: [
    CommonModule,
    RendererRoutingModule,
    PrimeNgModules,
    GridstackModule,
    WidgetsModule
  ]
})
export class RendererModule { }
