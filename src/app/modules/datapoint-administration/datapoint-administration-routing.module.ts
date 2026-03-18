import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatapointHomeComponent } from 'src/app/modules/datapoint-administration/pages/datapoint-home/datapoint-home.component';
import { EntityComponent } from 'src/app/modules/datapoint-administration/pages/entity/entity.component';
import { CreateEntityComponent } from 'src/app/modules/datapoint-administration/pages/create-entity/create-entity.component';
import { ManageEntityComponent } from 'src/app/modules/datapoint-administration/pages/manage-entity/manage-entity.component';
import { CreateInstanceComponent } from 'src/app/modules/datapoint-administration/pages/create-instance/create-instance.component';
import { ManageInstanceComponent } from 'src/app/modules/datapoint-administration/pages/manage-instance/manage-instance.component';
import { CreateAttributeComponent } from 'src/app/modules/datapoint-administration/pages/create-attribute/create-attribute.component';
import { ManageAttributeComponent } from 'src/app/modules/datapoint-administration/pages/manage-attribute/manage-attribute.component';
import { InstancesComponent } from './pages/instances/instances.component';
import { AttributesComponent } from './pages/attributes/attributes.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { DataUpdateScreensComponent } from './pages/data-update-screens/data-update-screens.component';
import { DatasComponent } from './components/datas/datas.component';
import { FlagsComponent } from './pages/flags/flags.component';
import { CreateFlagComponent } from './pages/create-flag/create-flag.component';
import { ManageFlagComponent } from './pages/manage-flag/manage-flag.component';
import { EventsComponent } from './pages/events/events.component';
import { CreateEventComponent } from './pages/create-event/create-event.component';
import { ManageEventComponent } from './pages/manage-event/manage-event.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { CreateNotificationComponent } from './pages/create-notification/create-notification.component';
import { ManageNotificationComponent } from './pages/manage-notification/manage-notification.component';

const routes: Routes = [{
  path: '',
  redirectTo: 'home/entity',
  pathMatch: 'full',
},
{
  path: 'home',
  component: DatapointHomeComponent,
  children: [
    {
      path: 'entity',
      component: EntityComponent
    },
    {
      path: 'instance',
      component: InstancesComponent
    },
    {
      path: 'entity',
      component: EntityComponent
    },
    {
      path: 'attribute',
      component: AttributesComponent
    },
    {
      path: 'reports',
      component: ReportsComponent
    },
    {
      path: 'mde',
      component: DataUpdateScreensComponent
    },
    {
      path: 'createEntity',
      component: CreateEntityComponent
    },
    {
      path: 'manageEntity/:id',
      component: ManageEntityComponent
    },
    {
      path: 'createInstance',
      component: CreateInstanceComponent
    },
    {
      path: 'manageInstance/:id',
      component: ManageInstanceComponent
    },
    {
      path: 'createAttribute',
      component: CreateAttributeComponent
    },
    {
      path: 'manageAttribute/:id',
      component: ManageAttributeComponent
    },
    {
      path: 'entityData/:id',
      component: DatasComponent

    },
    {
      path: 'flags',
      component: FlagsComponent
    },
    {
      path: 'createFlag',
      component: CreateFlagComponent
    },
    {
      path: 'manageFlag/:id',
      component: ManageFlagComponent
    },
    {
      path: 'events',
      component: EventsComponent
    },
    {
      path: 'createEvent',
      component: CreateEventComponent
    },
    {
      path: 'manageEvent',
      component: ManageEventComponent
    },
    {
      path: 'notifications',
      component: NotificationsComponent
    },
    {
      path: 'createNotification',
      component: CreateNotificationComponent
    },
    {
      path: 'ManageNotification/:id',
      component: ManageNotificationComponent
    },
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatapointAdministrationRoutingModule { }
