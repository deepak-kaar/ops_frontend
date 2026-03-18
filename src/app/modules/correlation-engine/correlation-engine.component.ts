import { Component, inject } from '@angular/core';
import { CorrelationEngineService } from './services/correlation-engine.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/internal/Observable';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs';

@Component({
  selector: 'app-correlation-engine',
  standalone: false,
  templateUrl: './correlation-engine.component.html',
  styleUrl: './correlation-engine.component.css'
})
export class CorrelationEngineComponent {

  protected readonly correlationService = inject(CorrelationEngineService);
  protected readonly messageService = inject(MessageService);
  protected readonly spinner = inject(NgxSpinnerService);
    mobileSidebarVisible = false;
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  constructor(private BreakpointObserver: BreakpointObserver)
  {

    this.isMobile$ = this.BreakpointObserver.observe([Breakpoints.Handset]).pipe(
     map(result => result.matches),
     shareReplay()
   );
    this.isTablet$ = this.BreakpointObserver.observe([Breakpoints.Tablet]).pipe(
     map(result => result.matches),
     shareReplay()
   );
  }


    toggleMobileSidebar() { this.mobileSidebarVisible = !this.mobileSidebarVisible; }

  protected showToast(severity: string, summary: string, detail: string, sticky: boolean) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, sticky: sticky })
  }
}
