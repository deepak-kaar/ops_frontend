import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrimeNgModules } from './core/modules/primeng.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService, TreeDragDropService } from 'primeng/api';
import { NgxSpinnerModule } from "ngx-spinner";
import { DatePipe } from '@angular/common';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RolloutInterceptor } from './core/interceptors/rollout/rollout.interceptor';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    ConfirmDialogModule,
    DynamicDialogModule,
    ToastModule,
    PrimeNgModules,
    BrowserModule,
    AppRoutingModule,
    NgxSpinnerModule,
    DragDropModule,
    MonacoEditorModule.forRoot()
  ],
  providers: [DialogService, provideAnimationsAsync(),
    ConfirmationService, MessageService,
    providePrimeNG({
      theme: {
        preset: Aura,
      }
    }), MessageService, DatePipe, ConfirmationService,TreeDragDropService,
    { provide: HTTP_INTERCEPTORS, useClass: RolloutInterceptor, multi: true }
   ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
