import { Component, inject, OnInit } from '@angular/core';
import { WebserviceAdministrationService } from './services/webservice-administration.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { WebService } from './services/webservice/web.service';
import { DialogService } from 'primeng/dynamicdialog';
import { JsonTreeBuilderService } from './services/jsonmapping/json-tree-builder.service';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-webservice-administration',
  standalone: false,
  templateUrl: './webservice-administration.component.html',
  styleUrls: ['./webservice-administration.component.css']
})
export class WebserviceAdministrationComponent implements OnInit {
  /**
        * @property {WebserviceAdministrationService} webserviceAdministrationService - Service to interact with the backend for fetching and managing activity.
        * @property {JsonTreeBuilderService} jsonTreeBuilderService - Service to interact with the backend for fetching and managing activity.
        * @property {MessageService} messageService - Service to interact with the toast.
        * @property {NgxSpinnerService} spinner - Service to interact with the spinner.
        * @property {FilterService} filterService - Service to interact with the filter.
        */

  protected readonly webserviceAdministrationService = inject(WebserviceAdministrationService);
  protected readonly jsonTreeBuilderService = inject(JsonTreeBuilderService);
  protected readonly messageService = inject(MessageService);
  protected readonly spinner = inject(NgxSpinnerService);
  protected readonly filterService = inject(WebService);
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
  protected showToast(severity: string, summary: string, detail: string, life: number, sticky: boolean) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, life: life, sticky: sticky })
  }
}
