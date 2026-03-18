import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatapointAdministrationRoutingModule } from './datapoint-administration-routing.module';
import { DatapointAdministrationComponent } from './datapoint-administration.component';
import { DatapointHomeComponent } from './pages/datapoint-home/datapoint-home.component';
import { SidebarComponent } from "../../core/components/sidebar/sidebar.component";
import { EntityComponent } from './pages/entity/entity.component';
import { InstancesComponent } from './pages/instances/instances.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { CreateEntityComponent } from './pages/create-entity/create-entity.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AttributeDialogComponent } from './components/dialogs/attribute-dialog/attribute-dialog.component';
import { ManageDefaultComponent } from './components/dialogs/manage-default/manage-default.component';
import { ManageEntityComponent } from './pages/manage-entity/manage-entity.component';
import { ManageInstanceComponent } from './pages/manage-instance/manage-instance.component';
import { ManageAttributeComponent } from './pages/manage-attribute/manage-attribute.component';
import { CreateAttributeComponent } from './pages/create-attribute/create-attribute.component';
import { CreateInstanceComponent } from './pages/create-instance/create-instance.component';
import { AttributesComponent } from './pages/attributes/attributes.component';
import { DataUpdateScreensComponent } from './pages/data-update-screens/data-update-screens.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { FilterComponent } from './components/filter/filter.component';
import { EntryFormComponent } from './components/dialogs/entry-form/entry-form.component';
import { EditFormComponent } from './components/dialogs/edit-form/edit-form.component';
import { DatasComponent } from './components/datas/datas.component';
import { FlagsComponent } from './pages/flags/flags.component';
import { CreateFlagComponent } from './pages/create-flag/create-flag.component';
import { ManageFlagComponent } from './pages/manage-flag/manage-flag.component';
import { EventsComponent } from './pages/events/events.component';
import { CreateEventComponent } from './pages/create-event/create-event.component';
import { ManageEventComponent } from './pages/manage-event/manage-event.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FlagMappingComponent } from './components/flag-mapping/flag-mapping.component';
import { ManageFlagMappingComponent } from './components/dialogs/manage-flag-mapping/manage-flag-mapping.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { CreateNotificationComponent } from './pages/create-notification/create-notification.component';
import { ManageNotificationComponent } from './pages/manage-notification/manage-notification.component';
import { NotifMappingComponent } from './components/notif-mapping/notif-mapping.component';
import { ManageNotifMappingComponent } from './components/dialogs/manage-notif-mapping/manage-notif-mapping.component';
import { EventMappingComponent } from './components/event-mapping/event-mapping.component';
import { ManageEventMappingComponent } from './components/dialogs/manage-event-mapping/manage-event-mapping.component';

@NgModule({
  declarations: [
    DatapointAdministrationComponent,
    DatapointHomeComponent,
    EntityComponent,
    InstancesComponent,
    CreateEntityComponent,
    ManageDefaultComponent,
    ManageEntityComponent,
    ManageInstanceComponent,
    ManageAttributeComponent,
    CreateAttributeComponent,
    CreateInstanceComponent,
    AttributesComponent,
    DataUpdateScreensComponent,
    ReportsComponent,
    FilterComponent,
    EntryFormComponent,
    EditFormComponent,
    DatasComponent,
    FlagsComponent,
    CreateFlagComponent,
    ManageFlagComponent,
    EventsComponent,
    CreateEventComponent,
    ManageEventComponent,
    FlagMappingComponent,
    ManageFlagMappingComponent,
    NotificationsComponent,
    CreateNotificationComponent,
    ManageNotificationComponent,
    NotifMappingComponent,
    ManageNotifMappingComponent,
    EventMappingComponent,
    ManageEventMappingComponent,

  ],
  imports: [
    CommonModule,
    DragDropModule,
    DatapointAdministrationRoutingModule,
    SidebarComponent,
    PrimeNgModules,
    MonacoEditorModule.forRoot(),
  ],
  exports: [
    ManageDefaultComponent,
  ]
})
export class DatapointAdministrationModule { }
