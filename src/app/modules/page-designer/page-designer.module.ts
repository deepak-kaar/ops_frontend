import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop'
import { ToastModule } from 'primeng/toast';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';

import { PageDesignerRoutingModule } from './page-designer-routing.module';
import { PageDesignerComponent } from './page-designer.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarComponent } from 'src/app/core/components/sidebar/sidebar.component';
import { WidgetsModule } from '../widgets/widgets.module';
import { DesignerWidgetHostComponent } from './designer-widget-host/designer-widget-host.component';
import { DesignerSectionContainerComponent } from './designer-section-container/designer-section-container.component';
import { DesignerIteratorContainerComponent } from './designer-iterator-container/designer-iterator-container.component';
import { PageAdministratorModule } from '../page-administrator/page-administrator.module';
import { SidebarNewComponent } from "src/app/core/components/sidebar-new/sidebar-new.component";
import { PageDesignerDataMappingComponent } from './page-designer-data-mapping/page-designer-data-mapping.component';

@NgModule({
  declarations: [
    PageDesignerComponent,
    DesignerWidgetHostComponent,
    DesignerSectionContainerComponent,
    DesignerIteratorContainerComponent,
    PageDesignerDataMappingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ToastModule,
    DynamicDialogModule,
    FileUploadModule,
    PrimeNgModules,
    SidebarComponent,
    WidgetsModule,
    PageDesignerRoutingModule,
    PageAdministratorModule,
    SidebarNewComponent
  ],
})
export class PageDesignerModule { }
