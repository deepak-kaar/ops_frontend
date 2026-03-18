import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterService } from '../tag-administration/services/filter/filter.service';
import { TagAdministrationService } from '../tag-administration/tag-administration.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, Observable, shareReplay } from 'rxjs';

@Component({
  selector: 'app-tag-administration-new',
  template: '',
  standalone: false
})
export class TagAdministrationNewComponent implements OnInit {
  isMobile$!: Observable<boolean>;

  constructor(
    public dialog: DialogService,
    public messageService: MessageService,
    public spinner: NgxSpinnerService,
    public filterService: FilterService,
    public tagAdministrationService: TagAdministrationService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isMobile$ = this.breakpointObserver.observe(['(max-width: 768px)']).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  ngOnInit(): void { }
}
