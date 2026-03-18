import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

// Routing
import { DatapointAdministrationNewRoutingModule } from './datapoint-administration-new-routing.module';

// Shared PrimeNG Modules
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';

// Core Standalone Components
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { FilterNewComponent } from 'src/app/core/components/filter-new/filter-new.component';
import { TableWrapperComponent } from 'src/app/core/components/table-wrapper/table-wrapper.component';

// Page Components - Entity
import { EntityNewComponent } from './pages/entity/entity-new/entity-new.component';
import { CreateEntityNewComponent } from './pages/entity/create-entity-new/create-entity-new.component';
import { EditNewEntityComponent } from './pages/entity/edit-new-entity/edit-new-entity.component';

// Page Components - Instance
import { InstanceNewComponent } from './pages/instance/instance-new/instance-new.component';
import { CreateInstanceNewComponent } from './pages/instance/create-instance-new/create-instance-new.component';

// Page Components - Tags
import { TagsNewComponent } from './pages/tags/tags-new/tags-new.component';

// Page Components - Flags
import { FlagsNewComponent } from './pages/flags/flags-new/flags-new.component';
import { CreateFlagsNewComponent } from './pages/flags/create-flags-new/create-flags-new.component';
import { ManageFlagsMappingsNewComponent } from './pages/flags/manage-flags-mappings-new/manage-flags-mappings-new.component';

// Page Components - Events
import { EventsNewComponent } from './pages/events/events-new/events-new.component';
import { CreateEventNewComponent } from './pages/events/create-event-new/create-event-new.component';
import { ManageEventsMappingsNewComponent } from './pages/events/manage-events-mappings-new/manage-events-mappings-new.component';

// Page Components - Notifications
import { NotificationsNewComponent } from './pages/notifications/notifications-new/notifications-new.component';
import { ManageNotificationsNewComponent } from './pages/notifications/manage-notifications-new/manage-notifications-new.component';
import { ManageNotificationsMappingsNewComponent } from './pages/notifications/manage-notifications-mappings-new/manage-notifications-mappings-new.component';

// Shared Components
import { DatapointHomeNewComponent } from './pages/datapoint-home-new/datapoint-home-new.component';
import { DatapointRoutingCardNewComponent } from './components/datapoint-routing-card-new/datapoint-routing-card-new.component';
import { DatasNewComponent } from './components/datas-new/datas-new.component';
import { EntityDatasFormNewComponent } from './components/entity-datas-form-new/entity-datas-form-new.component';
import { EntityDatasEditFormNewComponent } from './components/entity-datas-edit-form-new/entity-datas-edit-form-new.component';
import { FlagMappingNewComponent } from './components/flag-mapping-new/flag-mapping-new.component';
import { NotificationMappingNewComponent } from './components/notification-mapping-new/notification-mapping-new.component';

/**
 * DatapointAdministrationNewModule
 * 
 * This module handles all datapoint administration features including:
 * - Entity management (CRUD)
 * - Instance management (CRUD)
 * - Tags/Attributes management
 * - Flags management with mappings
 * - Events management with mappings
 * - Notifications management with mappings
 * 
 * Optimization notes:
 * - Uses shared PrimeNgModules to avoid duplicate imports
 * - Core components are standalone for better tree-shaking
 * - Shared base classes reduce code duplication
 * - Constants and interfaces are centralized in /shared folder
 */
@NgModule({
  declarations: [
    // Home/Layout
    DatapointHomeNewComponent,
    DatapointRoutingCardNewComponent,
    
    // Entity
    EntityNewComponent,
    CreateEntityNewComponent,
    EditNewEntityComponent,
    
    // Instance
    InstanceNewComponent,
    CreateInstanceNewComponent,
    
    // Tags
    TagsNewComponent,
    
    // Flags
    FlagsNewComponent,
    CreateFlagsNewComponent,
    ManageFlagsMappingsNewComponent,
    FlagMappingNewComponent,
    
    // Events
    EventsNewComponent,
    CreateEventNewComponent,
    ManageEventsMappingsNewComponent,
    
    // Notifications
    NotificationsNewComponent,
    ManageNotificationsNewComponent,
    ManageNotificationsMappingsNewComponent,
    NotificationMappingNewComponent,
    
    // Shared Data Components
    DatasNewComponent,
    EntityDatasFormNewComponent,
    EntityDatasEditFormNewComponent
  ],
  imports: [
    // Angular Core
    CommonModule,
    
    // Routing
    DatapointAdministrationNewRoutingModule,
    
    // Angular CDK
    DragDropModule,
    
    // PrimeNG (shared module with all PrimeNG imports)
    PrimeNgModules,
    
    // Standalone Core Components
    SidebarNewComponent,
    TopbarNewComponent,
    FilterNewComponent,
    TableWrapperComponent,
    
    // Monaco Editor
    MonacoEditorModule.forRoot()
  ]
})
export class DatapointAdministrationNewModule { }
