import { Component, inject } from '@angular/core';
import { ConfigAdministrationService } from './services/config-administration.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from 'primeng/dynamicdialog';
import { FilterService } from 'src/app/core/services/filter/filter.service';

@Component({
  selector: 'app-config-administration',
  standalone: false,
  templateUrl: './config-administration.component.html',
  styleUrl: './config-administration.component.css'
})
export class ConfigAdministrationComponent {

  /**
    * @property {ConfigAdministrationService} configAdministrationService - Service to interact with the backend for fetching and managing activity.
    * @property {MessageService} messageService - Service to interact with the toast.
    * @property {NgxSpinnerService} spinner - Service to interact with the spinner.
    * @property {FilterService} filterService - Service to interact with the filter.
    */

  protected readonly configAdministrationService = inject(ConfigAdministrationService);
  protected readonly messageService = inject(MessageService);
  protected readonly spinner = inject(NgxSpinnerService);
  protected readonly filterService = inject(FilterService);
  protected readonly dialog = inject(DialogService);

  /**
   * @method showToast - Shows a toast notification.
   * @param {string} severity - The severity of the toast.
   * @param {string} summary - The summary of the toast.
   * @param {string} detail - The detail of the toast.
   * @param {boolean} sticky - Whether the toast should be sticky.
   */
  protected showToast(severity: string, summary: string, detail: string, sticky: boolean) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, sticky: sticky })
  }
}
