import { Component, inject } from '@angular/core';
import { ActivityEngineService } from './activity-engine.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';


/**
 * @component ActivityEngineComponent
 * This component is the main component for the activity engine. It is responsible for displaying the activity engine and the activity engine service.
 */
@Component({
  selector: 'app-activity-engine',
  standalone: false,
  templateUrl: './activity-engine.component.html',
  styleUrl: './activity-engine.component.css'
})
export class ActivityEngineComponent {

  /**
   * @property {ActivityEngineService} activityService - Service to interact with the backend for fetching and managing activity.
   * @property {MessageService} messageService - Service to interact with the toast.
   * @property {NgxSpinnerService} spinner - Service to interact with the spinner.
   * @property {FilterService} filterService - Service to interact with the filter.
   */

  protected readonly activityService = inject(ActivityEngineService);
  protected readonly messageService = inject(MessageService);
  protected readonly spinner = inject(NgxSpinnerService);
  protected readonly filterService = inject(FilterService);
  protected readonly dialog = inject(DialogService);
  protected readonly router = inject(Router);
  protected readonly fb = inject(FormBuilder);
  protected dialogConfig = inject(DynamicDialogConfig);
  protected ref = inject(DynamicDialogRef);

  /**
   * @method showToast - Shows a toast notification.
   * @param {string} severity - The severity of the toast.
   * @param {string} summary - The summary of the toast.
   * @param {string} detail - The detail of the toast.
   * @param {boolean} sticky - Whether the toast should be sticky.
   * @param {number} life - The life of the toast.
   * @returns {void}
   */
  protected showToast(severity: string, summary: string, detail: string, sticky: boolean, life?: number | 3000): void {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, sticky: sticky, life: life })
  }
}
