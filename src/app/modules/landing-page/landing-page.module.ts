import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingPageRoutingModule } from './landing-page-routing.module';
import { LandingPageComponent } from './landing-page.component';
import { PrimeNgModules } from '../../core/modules/primeng.module';
import { ModuleCardsComponent } from './components/module-cards/module-cards.component';
import { OngoingFlagEventsComponent } from './components/ongoing-flag-events/ongoing-flag-events.component';
import { WidgetsModule } from '../widgets/widgets.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NewsComponent } from './components/news/news.component';
import { BlogsComponent } from './components/blogs/blogs.component';
import { InboxComponent } from './pages/inbox/inbox.component';
import { ServicesComponent } from './pages/services/services.component';
import { TopbarComponent } from "src/app/core/components/topbar/topbar.component";
import { SidebarNewComponent } from "src/app/core/components/sidebar-new/sidebar-new.component";


@NgModule({
  declarations: [
    LandingPageComponent,
    ModuleCardsComponent,
    OngoingFlagEventsComponent,
    DashboardComponent,
    NewsComponent,
    BlogsComponent,
    InboxComponent,
    ServicesComponent,
  ],
  imports: [
    PrimeNgModules,
    CommonModule,
    LandingPageRoutingModule,
    WidgetsModule,
    TopbarComponent,
    SidebarNewComponent
]
})
export class LandingPageModule { }
