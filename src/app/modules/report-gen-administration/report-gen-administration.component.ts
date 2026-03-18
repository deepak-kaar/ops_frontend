import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from 'primeng/dynamicdialog';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Observable } from 'rxjs';
import { ReportGenAdministrationService } from './services/report-gen-administration.service';
import { FilterService } from 'src/app/core/services/filter/filter.service';

@Component({
  selector: 'app-report-gen-administration',
  standalone: false,
  templateUrl: './report-gen-administration.component.html',
  styleUrl: './report-gen-administration.component.css'
})
export class ReportGenAdministrationComponent implements OnInit{
  /**
    * @property {ReportGenAdministrationService} ReportGenAdministrationService - Service to interact with the backend for fetching and managing activity.
    * @property {MessageService} messageService - Service to interact with the toast.
    * @property {NgxSpinnerService} spinner - Service to interact with the spinner.
    * @property {FilterService} filterService - Service to interact with the filter.
    */
   
  protected readonly ReportGenAdministrationService = inject(ReportGenAdministrationService);
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
   * @param {number} life - The life of the toast.
   * @param {boolean} sticky - Whether the toast should be sticky.
   */
  protected showToast(severity: string, summary: string, detail: string, life: number,sticky: boolean) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail,life: life, sticky: sticky })
  }
}
