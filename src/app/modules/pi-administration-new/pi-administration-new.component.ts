import { Component, inject, OnInit } from '@angular/core';
import { PiAdministrationNewService } from './services/pi-administration-new.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterService } from 'src/app/core/services/filter/filter.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-pi-administration-new',
  standalone: false,
  template: '',
  styles: []
})
export class PiAdministrationNewComponent implements OnInit {
  protected readonly piAdministrationService = inject(PiAdministrationNewService);
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
