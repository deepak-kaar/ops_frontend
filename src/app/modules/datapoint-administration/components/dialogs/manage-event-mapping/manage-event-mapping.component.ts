import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatapointAdministrationService } from '../../../datapoint-administration.service';

@Component({
  selector: 'app-manage-event-mapping',
  standalone: false,
  templateUrl: './manage-event-mapping.component.html',
  styleUrl: './manage-event-mapping.component.css'
})
export class ManageEventMappingComponent {

  mappingForm: FormGroup
  mode: string = '';
  appData: any;
  flagInput: any;
  typeOptions = ['Flag Template', 'Flag Instance'];
  flags: any;

  types = ['Entity', 'Instance', 'Tags']
  constructor(public dialogConfig: DynamicDialogConfig,
    protected ref: DynamicDialogRef,
    private fb: FormBuilder,
    private datapointAdminService: DatapointAdministrationService) {
    console.log(dialogConfig?.data);
    this.appData = dialogConfig?.data?.appData;
    this.mappingForm = this.fb.group({
      mappingDesc: new FormControl<string>('', Validators.required),
      flagType: new FormControl<string>('', Validators.required),
      flagId: new FormControl<string>(''),
      flagInstances: new FormControl<string>('')
    })
  }

  ngOnInit(){
    this.getFlag()
  }

  createMapping() {
    throw new Error('Method not implemented.');
  }

  getFlag() {
    this.datapointAdminService.getFlagList(this.appData).subscribe({
      next: (res: any) => {
        this.flags = res.flag;
        console.log(this.flags);
      },
      error: (err) => {

      },
    })
  }
}
