import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadEvent } from 'primeng/fileupload';
import { Table } from 'primeng/table';
import { DatapointAdministrationService } from '../../../datapoint-administration.service';

@Component({
  selector: 'app-edit-form',
  standalone: false,
  templateUrl: './edit-form.component.html',
  styleUrl: './edit-form.component.css'
})
export class EditFormComponent {

  value: any;
  entityId: string = '';
  mode: string = '';
  instanceId: string = '';
  availableProducts: any[] | undefined;
  isShowUi: boolean = false;
  eventId: string = '';
  eventList: any;
  type: string = '';
  logs: [] = [];
  fields: any[] = []

  uploadedFiles: any[] = [];
  form!: FormGroup;
  constructor(
    private spinner: NgxSpinnerService,
    private dataPointAdminService: DatapointAdministrationService,
    private fb: FormBuilder,
    public config: DynamicDialogConfig, private ref: DynamicDialogRef,
    private messageService: MessageService) {
    if (this.config.data) {
      this.value = this.config.data
      this.entityId = this.value.entityId
      this.mode = this.value.mode
      this.instanceId = this.value.instanceId
    }
  }
  ngOnInit() {
    this.getEntityData()
  }

  getEntityData() {
    this.spinner.show();
    const payload = {
      entityId: this.entityId,
      instanceId: this.instanceId
    }
    this.dataPointAdminService.getEntityData(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.form = this.fb.group({});
        this.fields = res.data.sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
        this.fields.forEach(field => {
          let validators = field.isNull ? [Validators.required] : [];
          if (field.dataPointID.dataType === 'Binary' || field.dataPointID.dataType === 'Text') {
            validators = []
          }
          this.form.addControl(field.attributeName, this.fb.control('', validators));
          this.form.get(field.attributeName)?.setValue(field.value);

        });
        this.isShowUi = true;
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }
  clear(_t62: any) {
    throw new Error('Method not implemented.');
  }
  submit() {
    if (this.form.valid) {
      const paylaod = {
        instanceId: this.instanceId,
        data: this.form.getRawValue()
      }
      this.dataPointAdminService.updateData(paylaod).subscribe({
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
  onUpload($event: FileUploadEvent) {
    throw new Error('Method not implemented.');
  }
}
