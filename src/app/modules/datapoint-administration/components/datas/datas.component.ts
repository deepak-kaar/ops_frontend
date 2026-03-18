import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { combineLatest } from 'rxjs';
import { EditFormComponent } from '../dialogs/edit-form/edit-form.component';
import { EntryFormComponent } from '../dialogs/entry-form/entry-form.component';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-datas',
  standalone: false,
  templateUrl: './datas.component.html',
  styleUrl: './datas.component.css'
})
export class DatasComponent {

  ref: DynamicDialogRef | undefined;
  clear(_t87: Table) {
    throw new Error('Method not implemented.');
  }
  availableProducts: any[] | undefined;
  isShowUi: boolean = false;
  eventId: string = '';
  eventList: any;
  entityId: any;
  value: any;
  datas: any[] = []
  logs: [] = [];
  fields: any[] = []
  uploadedFiles: any[] = [];
  entityName: string = '';


  isAdmin = true
  createAccess = true
  editAccess = true

 /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } =breakPointForToastComponent;
  constructor(
    private activateroute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private datapointAdminService: DatapointAdministrationService,
    public dialogService: DialogService,
  ) {
    combineLatest([
      this.activateroute.paramMap,
      this.activateroute.queryParams,
    ]).subscribe(([paramMap, queryParams]) => {
      this.entityId = paramMap.get('id');
    });
  }

  ngOnInit() {
    this.getEntityDatas();
    this.getEntityDetails()
  }

  onWidgetClick(event: any) { }

  getEntityDatas() {
    this.spinner.show();
    this.datapointAdminService.getEntityDatasById(this.entityId).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.isShowUi = true;
        this.datas = res
      },
      error: (err) => {
        this.spinner.hide();
        this.isShowUi = true;
      }
    })
  }

  getEntityDetails() {
    this.datapointAdminService.getEntityDetailsById(this.entityId).subscribe({
      next: (res: any) => {
        this.fields = res.attributes.sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
        this.entityName = 'Add ' + res.entityDocuments.entityName + ' Data'
      },
      error: (err) => {

      }
    })
  }


  addData() {
    this.ref = this.dialogService.open(EntryFormComponent, {
      header: 'Add Data',
      width: '50rem',
      closable: true,
      modal: true,
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: {
        entityId: this.entityId,
        mode: 'create'
      }
    });
    this.ref.onClose.subscribe((res: any) => {
      this.getEntityDatas();
    });
  }

  editData(instanceId: string) {
    this.ref = this.dialogService.open(EditFormComponent, {
      header: 'Edit Data',
      width: '50rem',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: {
        entityId: this.entityId,
        instanceId: instanceId,
        mode: 'create'
      }
    });
    this.ref.onClose.subscribe((res: any) => {
      this.getEntityDatas();
    });
  }
  islink(content: any): boolean {
    if (typeof content === "string" && (content.startsWith('https://') || content.startsWith('http://'))) {
      return true;
    }
    return false;
  }
  islinkintext(content: any): boolean {
    return content.includes("http://") || content.includes("https://")
  }

  storelinkpart(content: string): string[] {
    const arr = this.splitarr(content)
    return arr;
  }
  splitarr(content: any) {
    const urlregex = /(https?:\/\/[^\s]+)/g;
    const urlmatch = content.split(urlregex);
    const result = urlmatch.filter((match: string) => match.trim() == '');
    return urlmatch;
  }
}
