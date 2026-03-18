import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { DatapointAdministrationService } from '../../../datapoint-administration.service';

@Component({
  selector: 'app-entry-form',
  standalone: false,
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css'
})
export class EntryFormComponent {
  selectedCity: any;

  clear(_t87: any) {
    throw new Error('Method not implemented.');
  }
  availableProducts: any[] | undefined;
  isShowUi: boolean = false;
  eventId: string = '';
  eventList: any;
  entityId: any;
  value: any;
  type: string = '';
  logs: [] = [];
  fields: any[] = []
  mode: string = ''
  uploadedFiles: any[] = [];
  form!: FormGroup;



  isAdmin = true;
  createAccess = true;
  editAccess = true;
  constructor(
    private activateroute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private dataAdminService: DatapointAdministrationService,
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    private ref: DynamicDialogRef
  ) {

    if (this.config.data) {
      this.value = this.config.data
      this.entityId = this.value.entityId
      this.mode = this.value.mode
    }
    this.getEntityDetails()
    // combineLatest([
    //   this.activateroute.paramMap,
    //   this.activateroute.queryParams,
    // ]).subscribe(([paramMap, queryParams]) => {
    //   this.entityId = paramMap.get('id');
    // });
  }

  ngOnInit() {
    this.getLogs();

  }

  onWidgetClick(event: any) { }

  getLogs() {
    this.spinner.show();
    this.dataAdminService.getLogs({ entityId: this.entityId }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.logs = res.records
      },
      error: (err) => {
      }
    })
  }

  getEntityDetails() {
    this.dataAdminService.getEntitySchemaById(this.entityId).subscribe({
      next: (res: any) => {
        this.form = this.fb.group({});
        this.fields = res.attributes.sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
        console.log(this.fields)
        this.type = res.entityDocuments.type
        this.fields.forEach(field => {
          let validators = field.isNull ? [Validators.required] : [];
          if (field.dataPointID.dataType === 'Binary' || field.dataPointID.dataType === 'Text') {
            validators = []
          }
          this.form.addControl(field.attributeName, this.fb.control('', validators));
        });
        this.isShowUi = true;
      },
      error: (err) => {

      }
    })
  }



  submit(eventId?: any) {
    if (this.form.valid) {
      const paylaod = {
        entityOrInstanceId: this.entityId,
        type: this.type,
        data: this.form.getRawValue(),
        isMasterData:true
      }
      this.dataAdminService.addEntityData(paylaod).subscribe({
        next: (res: any) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data Added Successfully' });
          this.ref.close()
        },
        error: (err) => {
          console.log(err);
        }
      })
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill the required fields' });
    }
  }

  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

}
