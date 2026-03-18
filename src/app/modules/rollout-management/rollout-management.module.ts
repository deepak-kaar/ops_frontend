import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolloutManagementRoutingModule } from './rollout-management-routing.module';
import { RolloutManagementComponent } from './rollout-management.component';
import { PrimeNgModules } from '../../core/modules/primeng.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RolloutManagementRoutingModule,
    RolloutManagementComponent
  ]
})
export class RolloutManagementModule { }
