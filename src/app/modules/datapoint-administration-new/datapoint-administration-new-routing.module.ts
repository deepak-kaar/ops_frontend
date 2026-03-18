import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntityNewComponent } from './pages/entity/entity-new/entity-new.component';
import { DatapointHomeNewComponent } from './pages/datapoint-home-new/datapoint-home-new.component';
import { CreateEntityNewComponent } from './pages/entity/create-entity-new/create-entity-new.component';
import { EditNewEntityComponent } from './pages/entity/edit-new-entity/edit-new-entity.component';
import { InstanceNewComponent } from './pages/instance/instance-new/instance-new.component';
import { TagsNewComponent } from './pages/tags/tags-new/tags-new.component';
import { FlagsNewComponent } from './pages/flags/flags-new/flags-new.component';
import { EventsNewComponent } from './pages/events/events-new/events-new.component';
import { NotificationsNewComponent } from './pages/notifications/notifications-new/notifications-new.component';
import { CreateInstanceNewComponent } from './pages/instance/create-instance-new/create-instance-new.component';
import { CreateFlagsNewComponent } from './pages/flags/create-flags-new/create-flags-new.component';
import { CreateEventNewComponent } from './pages/events/create-event-new/create-event-new.component';
import { ManageNotificationsNewComponent } from './pages/notifications/manage-notifications-new/manage-notifications-new.component';
import { DatasNewComponent } from './components/datas-new/datas-new.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/entityNew',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: DatapointHomeNewComponent,
    children: [
      // Entity Routes
      { path: 'entityNew', component: EntityNewComponent },
      { path: 'createEntityNew', component: CreateEntityNewComponent },
      { path: 'editEntityNew', component: EditNewEntityComponent },
      { path: 'entityDataNew/:id', component: DatasNewComponent },
      
      // Instance Routes
      { path: 'instanceNew', component: InstanceNewComponent },
      { path: 'createInstanceNew', component: CreateInstanceNewComponent },
      
      // Tags/Attributes Routes
      { path: 'attributeNew', component: TagsNewComponent },
      
      // Flags Routes
      { path: 'flagsNew', component: FlagsNewComponent },
      { path: 'createFlagsNew', component: CreateFlagsNewComponent },
      
      // Events Routes
      { path: 'eventsNew', component: EventsNewComponent },
      { path: 'createEventsNew', component: CreateEventNewComponent },
      
      // Notifications Routes
      { path: 'notificationsNew', component: NotificationsNewComponent },
      { path: 'createNotificationNew', component: ManageNotificationsNewComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatapointAdministrationNewRoutingModule { }
