import { Component, inject, OnInit } from '@angular/core';
import { SchedulerjobAdministrationService } from './services/schedulerjob-administration-new.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-schedulerjob-administration-new',
  standalone: false,
  template: '',
  styles: []
})
export class SchedulerjobAdministrationNewComponent implements OnInit {
  protected readonly schedulerjobAdministrationService = inject(SchedulerjobAdministrationService);
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

  protected showToast(severity: string, summary: string, detail: string, life: number, sticky: boolean) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, life: life, sticky: sticky })
  }
}
