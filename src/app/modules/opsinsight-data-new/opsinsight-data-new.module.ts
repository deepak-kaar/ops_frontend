import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { OpsinsightDataNewRoutingModule } from './opsinsight-data-new-routing.module';
import { OpsinsightDataComponent } from './opsinsight-data.component';
import { PrimeNgModules } from 'src/app/core/modules/primeng.module';
import { SidebarNewComponent } from 'src/app/core/components/sidebar-new/sidebar-new.component';
import { TopbarNewComponent } from 'src/app/core/components/topbar-new/topbar-new.component';
import { FilterComponent } from 'src/app/core/components/filter/filter.component';
import { FilterNewComponent } from 'src/app/core/components/filter-new/filter-new.component';
import { TableWrapperComponent } from 'src/app/core/components/table-wrapper/table-wrapper.component';
import { OpsinsightDataHomeComponent } from './pages/opsinsight-data-home/opsinsight-data-home.component';
import { OpsinsightDataTableComponent } from './pages/opsinsight-data-table/opsinsight-data-table.component';
import { ManageCustomerComponent } from './components/manage-customer/manage-customer.component';
import { AttributeMappingComponent } from './components/attribute-mapping/attribute-mapping.component';
import { CustomerAccessDialogComponent } from './components/customer-access-dialog/customer-access-dialog.component';

@NgModule({
  declarations: [
    OpsinsightDataComponent,
    OpsinsightDataHomeComponent,
    OpsinsightDataTableComponent,
    ManageCustomerComponent,
    AttributeMappingComponent,
    CustomerAccessDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    OpsinsightDataNewRoutingModule,
    PrimeNgModules,
    SidebarNewComponent,
    TopbarNewComponent,
    FilterComponent,
    FilterNewComponent,
    TableWrapperComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OpsinsightDataNewModule { }
