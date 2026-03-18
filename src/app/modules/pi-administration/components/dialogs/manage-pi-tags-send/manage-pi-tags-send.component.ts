import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PiAdministrationComponent } from '../../../pi-administration.component';
import { finalize, map, Observable } from 'rxjs';
import { DatasourceAdministrationService } from 'src/app/modules/datasource-administration/datasource-administration.service';

@Component({
  selector: 'app-manage-pi-tags-send',
  standalone: false,
  templateUrl: './manage-pi-tags-send.component.html',
  styleUrl: './manage-pi-tags-send.component.css'
})
export class ManagePiTagsSendComponent extends PiAdministrationComponent implements OnInit {
  /**
    * @property {FormGroup} tagSendForm - Form group that holds application form controls.
    */
  tagSendForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
   * @property {string} tagSendLevelId - stores the tagSendLevelId Id (app Id or orgId).
   */

  tagSendLevelId: string


  /**
   * @property {string} tagSendId - stores the tagSendId when the mode is edit.
   */
  tagSendId: string = '';

  /**
   * @property {string} appId - stores the appId.
   */
  appId: any;

  /**
  * @property {string} orgId - stores the orgId.
  */
  orgId: any;

  /**
* @property {Observable<any>} sysNameDropDown$ - Observable to retrieve system name from backend.
*/
  sysNameDropDown$!: Observable<any>;

  /**
* @property {Observable<any>} attrDropDown$ - Observable to retrieve attribute name from backend.
*/
  attrDropDown$!: Observable<any>;

  type = ['Entity', 'Instance'];
  attributesOptions: any;
  listOptions: any;

  /**
   * @constructor
   * @param {DynamicDialogConfig} dialogConfig - Configuration for the dynamic dialog.
   * @param {DynamicDialogRef} ref - Reference to the dynamic dialog instance.
   * @param {FormBuilder} fb - Form builder service for handling reactive forms.
   * @param {DatasourceAdministrationService} datasourceAdministrationService - Service for system name dropdown
   */
  constructor(public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder,
    private datasourceAdministrationService: DatasourceAdministrationService
  ) {
    super();
    this.tagSendLevelId = this.dialogConfig.data?.tagSendLevelId || null;
    this.appId = this.dialogConfig.data?.appId || null,
      this.orgId = this.dialogConfig.data?.orgId || null

    this.tagSendForm = this.fb.group({
      attributeId: new FormControl<string>('', [Validators.required]),
      attributeName: new FormControl<string>('', [Validators.required]),
      type: new FormControl<string>('Instance', [Validators.required]),
      id: new FormControl<string>('', [Validators.required]),
      piDesc: new FormControl<string>('', [Validators.required]),
      tagStatus: new FormControl<string>('active'),
      tagNumber: new FormControl<string>('', [Validators.required]),
      systemName: new FormControl<string>('', [Validators.required]),
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.sysNameDropDown$ = this.datasourceAdministrationService.getDataSource({ fields: 'sysName' }).pipe(
      map((res: any) => res?.dataSourceData || []),
      finalize(() => this.spinner.hide())
    );


    this.attrDropDown$ = this.piAdminService.getAttributesByOrg({ orgId: this.orgId }).pipe(
      map((res: any) => res?.attributes || []),
      finalize(() => this.spinner.hide())
    );
  }


  onAttributeChange(event: any) {
    const selected = event.value;
    this.tagSendForm.patchValue({
      attributeId: selected.id,
      attributeName: selected.name
    });
  }

  onTypeChange() {
    const type = this.tagSendForm.get('type')?.value;
    if (type === 'Entity') {
      this.getEntityList();
    } else {
      this.getInstanceList();
    }
  }

  onTypeNameChange() {
    // Clear current selections when type changes
    const type = this.tagSendForm.get('type')?.value;
    // Make API call based on selected type
    switch (type) {
      case 'Entity':
        this.getEntityAttr(this.tagSendForm.get('id')?.value)
        break;
      case 'Instance':
        this.getInstanceAttr(this.tagSendForm.get('id')?.value)
        break;
      default:
        this.attributesOptions = [];
    }
  }

  getEntityList() {
    this.piAdminService.getEntityList({ orgId: this.orgId }).subscribe({
      next: (res: any) => {
        this.listOptions = res.Entity_Attributes.map((res: any) => ({
          name: res.entityName,
          id: res.entityId
        }));;
      }
    });
  }

  getInstanceList() {
    this.piAdminService.getInstanceList({ orgId: this.orgId }).subscribe({
      next: (res: any) => {
        this.listOptions = res.Instances.map((res: any) => ({
          name: res.instanceName,
          id: res.instanceId
        }));
      }
    });
  }

  private getEntityAttr(entityId: string) {
    this.piAdminService.getEntityDetailsById(entityId).subscribe({
      next: (res) => {
        this.attributesOptions = res.attributes.map((res: any) => ({
          name: res.attributeName,
          id: res.attributeId
        }));
      },
      error: (error) => {
        console.error('Error loading tags attributes:', error);

      }
    });
  }
  private getInstanceAttr(instanceId: string) {
    this.piAdminService.getInstanceDetailsById(instanceId).subscribe({
      next: (res) => {
        this.attributesOptions = res.attributes.map((res: any) => ({
          name: res.attributeName,
          id: res.attributeId
        }));

      },
      error: (error) => {

      }
    });
  }

  /**
   * Validates the roleForm.
   * If its is valid calls the createApp method from org Admin service to create an app by passing the appForm Value.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  createPISend(): void {
    if (this.tagSendForm.valid) {
      const payload = {
        orgId: this.filterService.currentOrg?.orgId ?? '',
        orgName: this.filterService.currentOrg?.orgName ?? '',
        ...this.tagSendForm.getRawValue()
      }

      this.piAdminService.postPISend(payload).subscribe({
        next: (res: any) => {
          this.ref.close({ status: true });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While creating Tag", life: 3000 });
        }
      })

    }
  }

  cancel() {
    this.ref.close({ status: false });
  }
}
