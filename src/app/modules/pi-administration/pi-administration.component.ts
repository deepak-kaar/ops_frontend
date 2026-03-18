import { Component, inject, OnInit } from '@angular/core';
import { PiAdministrationService } from './services/pi-administration.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Observable } from 'rxjs';

/**
 * @component PiAdministrationComponent
 * This component is the main component for the PI Admin. It is responsible for displaying the PI Admin Home and the PI Admin service.
 */
@Component({
  selector: 'app-pi-administration',
  standalone: false,
  templateUrl: './pi-administration.component.html',
  styleUrl: './pi-administration.component.css'
})
export class PiAdministrationComponent implements OnInit {
  /**
   * @property {PiAdministrationService} piAdminService - Service to interact with the backend for fetching and managing activity.
   * @property {MessageService} messageService - Service to interact with the toast.
   * @property {NgxSpinnerService} spinner - Service to interact with the spinner.
   * @property {FilterService} filterService - Service to interact with the filter.
   */

  protected readonly piAdminService = inject(PiAdministrationService);
  protected readonly messageService = inject(MessageService);
  protected readonly spinner = inject(NgxSpinnerService);
  protected readonly filterService = inject(FilterService);
  protected readonly dialog = inject(DialogService);
  private readonly responsive = inject(ResponsiveService);

  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  ngOnInit(): void {

    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();
  }

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
