import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { screenGuardGuard } from './core/guards/screen-guard/screen-guard.guard';
import { ScreenGuardDisplayComponent } from './core/components/screen-guard-display/screen-guard-display.component';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'home',
    loadChildren: () => import('./modules/landing-page/landing-page.module').then((m) => m.LandingPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'pageAdmin',
    loadChildren: () =>
      import('./modules/page-administrator/page-administrator.module').then(
        (m) => m.PageAdministratorModule
      )
  },
  {
    path: 'pageAdminNew',
    loadChildren: () =>
      import('./modules/page-admin-new/page-administrator.module').then(
        (m) => m.PageAdministratorModule
      )
  },
  {
    path: 'orgAdmin',
    loadChildren: () =>
      import('./modules/organization-administration/organization-administration.module').then(
        (m) => m.OrganizationAdministrationModule
      )
  },
  {
    path: 'datapointAdmin',
    loadChildren: () => import('./modules/datapoint-administration/datapoint-administration.module').then((m) => m.DatapointAdministrationModule)
  },
  {
    path: 'datapointAdminV2',
    loadChildren: () => import('./modules/datapoint-administration-new/datapoint-administration-new.module').then((m) => m.DatapointAdministrationNewModule)
  },
  {
    path: 'desktop-required',
    component: ScreenGuardDisplayComponent
  },
  {
    path: 'calculationEngine',
    loadChildren: () => import('./modules/calculation-engine/calculation-engine.module').then((m) => m.CalculationEngineModule)
  },
  {
    path: 'calculationEngineV2',
    loadChildren: () => import('./modules/calculation-engine-v2/calculation-engine-v2.module').then((m) => m.CalculationEngineV2Module)
  },
  {
    path: 'globalRenderer',
    loadChildren: () => import('./modules/renderer/renderer.module').then((m) => m.RendererModule)
  },
  {
    path: 'correlationEngine',
    loadChildren: () => import('./modules/correlation-engine/correlation-engine.module').then((m) => m.CorrelationEngineModule)
  },
  {
    path: 'correlationEngineV2',
    loadChildren: () => import('src/app/modules/correlation-engine-v2/correlation-engine-v2.module').then((m) => m.CorrelationEngineV2Module)
  },
  {
    path: 'accountEnabler',
    loadChildren: () => import('./modules/user-enabler/user-enabler.module').then((m) => m.UserEnablerModule)
  },
  {
    path: 'activityEngine',
    loadChildren: () => import('./modules/activity-engine/activity-engine.module').then((m) => m.ActivityEngineModule)
  },
  {
    path: 'configAdmin',
    loadChildren: () =>
      import('./modules/config-administration/config-administration.module').then(
        (m) => m.ConfigAdministrationModule
      )
  },
  {
    path: 'emailAdmin',
    loadChildren: () =>
      import('./modules/email-administration/email-administration.module').then(
        (m) => m.EmailAdministrationModule
      )
  },
  {
    path: 'reportGenAdmin',
    loadChildren: () =>
      import('./modules/report-gen-administration/report-gen-administration.module').then(
        (m) => m.ReportGenAdministrationModule
      )
  },
  {
    path: 'reportimageAdmin',
    loadChildren: () =>
      import('./modules/reportimage-administration/reportimage-administration.module').then(
        (m) => m.ReportimageAdministrationModule
      )
  },
  {
    path: 'reportimageAdminNew',
    loadChildren: () =>
      import('./modules/reportimage-administration-new/reportimage-administration-new.module').then(
        (m) => m.ReportimageAdministrationNewModule
      )
  },
  {
    path: 'schedulerJobAdmin',
    loadChildren: () =>
      import('./modules/schedulerjob-administration/schedulerjob-administration.module').then(
        (m) => m.SchedularjobAdministrationModule
      )
  },
  {
    path: 'schedulerJobAdminNew',
    loadChildren: () =>
      import('./modules/schedulerjob-administration-new/schedulerjob-administration-new.module').then(
        (m) => m.SchedulerjobAdministrationNewModule
      )
  },
  {
    path: 'piadmin',
    loadChildren: () =>
      import('./modules/pi-administration/pi-administration.module').then(
        (m) => m.PiAdministrationModule
      )
  },
  {
    path: 'piadminNew',
    loadChildren: () =>
      import('./modules/pi-administration-new/pi-administration-new.module').then(
        (m) => m.PiAdministrationNewModule
      )
  },
  {
    path: 'datasourceAdmin',
    loadChildren: () =>
      import('./modules/datasource-administration/datasource-administration.module').then(
        (m) => m.DatasourceAdministrationModule
      )
  },
  {
    path: 'datasourceAdminNew',
    loadChildren: () =>
      import('./modules/datasource-administration-new/datasource-administration-new.module').then(
        (m) => m.DatasourceAdministrationNewModule
      )
  },
  {
    path: 'databaseAdmin',
    loadChildren: () =>
      import('./modules/database-administration/database-administration.module').then(
        (m) => m.DatabaseAdministrationModule
      )
  },
  {
    path: 'databaseAdminNew',
    loadChildren: () =>
      import('./modules/database-administration-new/database-administration-new.module').then(
        (m) => m.DatabaseAdministrationNewModule
      )
  },
  { path: 'webserviceAdmin', loadChildren: () => import('./modules/webservice-administration/webservice-administration.module').then(m => m.WebserviceAdministrationModule) },
  { path: 'webserviceAdminNew', loadChildren: () => import('./modules/webservice-administration-new/webservice-administration-new.module').then(m => m.WebserviceAdministrationNewModule) },
  { path: 'opsinsightDataNew', loadChildren: () => import('./modules/opsinsight-data-new/opsinsight-data-new.module').then(m => m.OpsinsightDataNewModule) },
  { path: 'tagAdmin', loadChildren: () => import('./modules/tag-administration/tag-administration.module').then(m => m.TagAdministrationModule) },
  { path: 'tagAdminNew', loadChildren: () => import('./modules/tag-administration-new/tag-administration-new.module').then(m => m.TagAdministrationNewModule) },
  { path: 'tagUtil', loadChildren: () => import('./modules/tag-utilization/tag-utilization.module').then(m => m.TagUtilizationModule) },
  { path: 'tagUtilNew', loadChildren: () => import('./modules/tag-utilization-new/tag-utilization-new.module').then(m => m.TagUtilizationNewModule) },
  { path: 'mongoDBAdmin', loadChildren: () => import('./modules/mongodb-administration/mongodb-administration.module').then(m => m.MongodbAdministrationModule) },
  { path: 'mongoDBAdminNew', loadChildren: () => import('./modules/mongodb-administration-new/mongodb-administration-new.module').then(m => m.MongodbAdministrationNewModule) },
  {
    path: 'logging',
    loadChildren: () =>
      import('./modules/logging/logging.module').then(m => m.LoggingModule)
  },
  { path: 'actDirectory', loadChildren: () => import('./modules/active-directory/active-directory.module').then(m => m.ActiveDirectoryModule) },
  { path: 'pages', loadChildren: () => import('./modules/page-renderer/page-renderer.module').then(m => m.PageRendererModule) },
  { path: 'rolloutManagement', loadChildren: () => import('./modules/rollout-management/rollout-management.module').then(m => m.RolloutManagementModule) },
  { path: 'reportPublishAdmin', loadChildren: () => import('./modules/reportpublish-administration/reportpublish-administration.module').then(m => m.ReportPublishAdministrationModule) },
  {
    path: 'lockScreen',
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/lock-screen/lock-screen.component')
          .then(m => m.LockScreenComponent)
      },
      {
        path: 'category/create',
        loadComponent: () => import('./modules/lock-screen/pages/category-form/category-form.component')
          .then(m => m.CategoryFormComponent)
      },
      {
        path: 'category/edit/:id',
        loadComponent: () => import('./modules/lock-screen/pages/category-form/category-form.component')
          .then(m => m.CategoryFormComponent)
      }
    ]
  },
  { path: 'scanDocument',
   loadChildren: () => import('./modules/scan-document/scan-document.module').then(m => m.ScanDocumentModule) 
  },
  { 
    path: 'dataStream', 
    loadChildren: () => import('./modules/data-stream/data-stream.module').then(m => m.DataStreamModule)
   },
  { 
    path: 'viewStream',
   loadChildren: () => import('./modules/view-stream/view-stream.module').then(m => m.ViewStreamModule) 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
