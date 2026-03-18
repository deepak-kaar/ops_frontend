import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PiAdministrationNewComponent } from '../../pi-administration-new.component';
import { finalize, map, Observable } from 'rxjs';
import { DatasourceAdministrationService } from 'src/app/modules/datasource-administration/datasource-administration.service';

@Component({
  selector: 'app-manage-pi-new',
  standalone: false,
  templateUrl: './manage-pi-new.component.html',
  styleUrl: './manage-pi-new.component.css'
})
export class ManagePiNewComponent extends PiAdministrationNewComponent implements OnInit {
  tagForm: FormGroup;
  mode: string = 'create';
  tagType: string = 'send'; // 'send' or 'receive'
  orgId: any;
  sysNameDropDown$!: Observable<any>;
  attrDropDown$!: Observable<any>;
  type = ['Entity', 'Instance'];
  attributesOptions: any;
  listOptions: any;

  // Options for Receive mode
  extTypes = ['ABSTOTAL', 'AC', 'APV', 'ATMAX', 'C', 'MAX', 'MAXTIME', 'MEAN', 'MIN', 'PCTON', 'PV', 'RANGE', 'STD', 'SUMTANKS', 'TOTAL', '1:30AM', '2AM', '4AM', '5AM'];
  freqTypes = ['D', 'H'];

  constructor(
    public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder,
    private datasourceAdministrationService: DatasourceAdministrationService
  ) {
    super();
    this.orgId = this.dialogConfig.data?.orgId || null;
    this.tagType = this.dialogConfig.data?.tagType || 'send';

    this.tagForm = this.fb.group({
      attributeId: new FormControl<string>('', [Validators.required]),
      attributeName: new FormControl<string>('', [Validators.required]),
      type: new FormControl<string>('Instance', [Validators.required]),
      id: new FormControl<string>('', [Validators.required]),
      piDesc: new FormControl<string>('', [Validators.required]),
      tagStatus: new FormControl<string>('active'),
      tagNumber: new FormControl<string>('', [Validators.required]),
      systemName: new FormControl<string>('', [Validators.required]),
      // Fields for Receive mode
      extType: new FormControl<string>(''),
      freqType: new FormControl<string>(''),
    });
  }

  get isReceiveMode(): boolean {
    return this.tagType === 'receive';
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.sysNameDropDown$ = this.datasourceAdministrationService.getDataSource({ fields: 'sysName' }).pipe(
      map((res: any) => res?.dataSourceData || []),
      finalize(() => this.spinner.hide())
    );

    this.attrDropDown$ = this.piAdministrationService.getAttributesByOrg({ orgId: this.orgId }).pipe(
      map((res: any) => res?.attributes || []),
      finalize(() => this.spinner.hide())
    );
  }

  onAttributeChange(event: any) {
    const selected = event.value;
    this.tagForm.patchValue({
      attributeId: selected.id,
      attributeName: selected.name
    });
  }

  onTypeChange() {
    const type = this.tagForm.get('type')?.value;
    if (type === 'Entity') {
      this.getEntityList();
    } else {
      this.getInstanceList();
    }
  }

  onTypeNameChange() {
    const type = this.tagForm.get('type')?.value;
    switch (type) {
      case 'Entity':
        this.getEntityAttr(this.tagForm.get('id')?.value);
        break;
      case 'Instance':
        this.getInstanceAttr(this.tagForm.get('id')?.value);
        break;
      default:
        this.attributesOptions = [];
    }
  }

  getEntityList() {
    this.piAdministrationService.getEntityList({ orgId: this.orgId }).subscribe({
      next: (res: any) => {
        this.listOptions = res.Entity_Attributes.map((res: any) => ({
          name: res.entityName,
          id: res.entityId
        }));
      }
    });
  }

  getInstanceList() {
    this.piAdministrationService.getInstanceList({ orgId: this.orgId }).subscribe({
      next: (res: any) => {
        this.listOptions = res.Instances.map((res: any) => ({
          name: res.instanceName,
          id: res.instanceId
        }));
      }
    });
  }

  private getEntityAttr(entityId: string) {
    this.piAdministrationService.getEntityDetailsById(entityId).subscribe({
      next: (res) => {
        this.attributesOptions = res.attributes.map((res: any) => ({
          name: res.attributeName,
          id: res.attributeId
        }));
      }
    });
  }

  private getInstanceAttr(instanceId: string) {
    this.piAdministrationService.getInstanceDetailsById(instanceId).subscribe({
      next: (res) => {
        this.attributesOptions = res.attributes.map((res: any) => ({
          name: res.attributeName,
          id: res.attributeId
        }));
      }
    });
  }

  createPITag(): void {
    if (this.tagForm.valid) {
      const basePayload = {
        orgId: this.filterService.currentOrg?.orgId ?? '',
        orgName: this.filterService.currentOrg?.orgName ?? '',
        attributeId: this.tagForm.get('attributeId')?.value,
        attributeName: this.tagForm.get('attributeName')?.value,
        type: this.tagForm.get('type')?.value,
        id: this.tagForm.get('id')?.value,
        piDesc: this.tagForm.get('piDesc')?.value,
        tagStatus: this.tagForm.get('tagStatus')?.value,
        tagNumber: this.tagForm.get('tagNumber')?.value,
        systemName: this.tagForm.get('systemName')?.value
      };

      if (this.isReceiveMode) {
        // Add Receive-specific fields
        const receivePayload = {
          ...basePayload,
          extType: this.tagForm.get('extType')?.value,
          freqType: this.tagForm.get('freqType')?.value,
        };

        this.piAdministrationService.postPIReceive(receivePayload).subscribe({
          next: () => {
            this.ref.close({ status: true });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error while creating PI Tag Receive', life: 3000 });
          }
        });
      } else {
        // Send mode
        this.piAdministrationService.postPISend(basePayload).subscribe({
          next: () => {
            this.ref.close({ status: true });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error while creating PI Tag Send', life: 3000 });
          }
        });
      }
    }
  }

  cancel() {
    this.ref.close({ status: false });
  }
}
