import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from 'primeng/dynamicdialog';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { DatasourceAdministrationService } from '../datasource-administration/datasource-administration.service';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-datasource-administration-new',
  standalone: false,
  template: '',
  styles: []
})
export class DatasourceAdministrationNewComponent implements OnInit {
  /**
   * @property {DatasourceAdministrationService} dataSourceAdministrationService - Service to interact with the backend for fetching and managing datasources.
   * @property {MessageService} messageService - Service to interact with the toast.
   * @property {NgxSpinnerService} spinner - Service to interact with the spinner.
   * @property {FilterService} filterService - Service to interact with the filter.
   * @property {ResponsiveService} responsiveService - Service to handle responsive breakpoints.
   */

  protected readonly dataSourceAdministrationService = inject(DatasourceAdministrationService);
  protected readonly messageService = inject(MessageService);
  protected readonly spinner = inject(NgxSpinnerService);
  protected readonly filterService = inject(FilterService);
  protected readonly dialog = inject(DialogService);
  protected readonly responsiveService = inject(ResponsiveService);

  /**
   * @property {Observable<boolean>} isMobile$ - Stores the application view mode status indicating whether it's accessed on a mobile device.
   */
  isMobile$!: Observable<boolean>;

  ngOnInit(): void {
    this.isMobile$ = this.responsiveService.isMobile$();
  }

  /**
   * @method showToast - Shows a toast notification.
   * @param {string} severity - The severity of the toast.
   * @param {string} summary - The summary of the toast.
   * @param {string} detail - The detail of the toast.
   * @param {number} life - The life duration of the toast in ms.
   * @param {boolean} sticky - Whether the toast should be sticky.
   */
  protected showToast(severity: string, summary: string, detail: string, life: number, sticky: boolean) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, life: life, sticky: sticky });
  }
}
