import { Component } from '@angular/core';
import { DatabaseAdministrationComponent } from '../../database-administration.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, map, Observable } from 'rxjs';
import { PiAdministrationService } from 'src/app/modules/pi-administration/services/pi-administration.service';

@Component({
  selector: 'app-manage-mapping',
  standalone: false,
  templateUrl: './manage-mapping.component.html',
  styleUrl: './manage-mapping.component.css'
})
export class ManageMappingComponent extends DatabaseAdministrationComponent {

  /**
      * @property {FormGroup} dbMappingForm - Form group that holds application form controls.
      */
  dbMappingForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
   * @property {string} dbMappingLevelId - stores the dbMappingLevelId Id (app Id or orgId).
   */

  dbMappingLevelId: string

  /**
   * @property {string} appId - stores the appId.
   */
  appId: any;

  /**
  * @property {string} orgId - stores the orgId.
  */
  orgId: any;


  languageOptions = ['sql', 'json', 'javascript'];

  editorOptions!: any;

  /**
* @property {Observable<any>} attrDropDown$ - Observable to retrieve attribute name from backend.
*/
  attrDropDown$!: Observable<any>;

  type = ['Entity', 'Instance'];
  attributesOptions: any;
  listOptions: any;

  freqTypes = ['D', 'H'];

  /**
* @property {any[]} activeStatus - Stores a list of active status (potentially for dropdown selection).
*/
  activeStatus: any[] = [
    {
      name: 'Active',
      value: 'active'
    },
    {
      name: 'Inactive',
      value: 'inactive'
    }
  ];


  /**
   * @constructor
   * @param {DynamicDialogConfig} dialogConfig - Configuration for the dynamic dialog.
   * @param {DynamicDialogRef} ref - Reference to the dynamic dialog instance.
   * @param {FormBuilder} fb - Form builder service for handling reactive forms.
   */
  constructor(public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder,
    private attributeService: PiAdministrationService
  ) {
    super();
    this.dbMappingLevelId = this.dialogConfig.data?.tagSendLevelId || null;
    this.appId = this.dialogConfig.data?.appId || null;
    this.orgId = this.dialogConfig.data?.orgId || null;

    /// need to ask about incoming of sysId,systemName when creating
    this.dbMappingForm = this.fb.group({
      queryId: new FormControl<string>('', [Validators.required]),
      externalMappingId: new FormControl<string>('', [Validators.required]),
      tagNumber: new FormControl<string>('', [Validators.required]),
      attributeNumber: new FormControl<string>('', [Validators.required]),
      attributeId: new FormControl<string>('', [Validators.required]),
      lastUpdateOn: new FormControl<string>('', [Validators.required]),
      freqType: new FormControl<string>('', [Validators.required]),
      queryParameters: new FormControl<string>('', [Validators.required]),
      queryLang: new FormControl<string>('javascript', [Validators.required]),
      sysId: new FormControl<string>('', [Validators.required]),
      sysName: new FormControl<string>('', [Validators.required]),
      type: new FormControl<string>('', [Validators.required]),
      active: new FormControl<boolean>(true),
      description: new FormControl<string>('', []),
      id: new FormControl<string>('', [])
    });

    this.editorOptions = {
      theme: 'vs-dark', language: this.dbMappingForm.get('queryLang')?.value,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false
    };

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.appId = this.dialogConfig.data?.appData?.appId;
      this.patchValue(this.dialogConfig.data?.mapData)
    }
  }


  override ngOnInit() {
    super.ngOnInit();
    this.attrDropDown$ = this.attributeService.getAttributesByOrg({ orgId: this.orgId }).pipe(
      map((res: any) => res?.attributes || []),
      finalize(() => this.spinner.hide())
    );
  }

  /**
   * Validates the dbMappingForm.
   * If its is valid calls the createMapping method from org Admin service to create an map by passing the dbMappingForm Value.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  createDBMapping(): void {
    if (this.dbMappingForm.valid) {
      const formValue = this.dbMappingForm.getRawValue();
      const queryParameters = formValue.queryParameters ? JSON.parse(formValue.queryParameters) : null
      const payload = {
        ...this.dbMappingForm.getRawValue(),
        queryParameters: queryParameters
      }

      // this.databaseAdministrationService.postDBQuery(payload).subscribe({
      //   next: (res: any) => {
      //     this.ref.close({ status: true });
      //   },
      //   error: (err) => {
      //     this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While create query", life: 3000 });
      //   }
      // });
    }
  }


  /**
 * Patches the map data to the appForm
 * @param {any} mapData - map data
 * @returns {void} - returns nothing (i.e) void
 */
  patchValue(mapData: any): void {
    console.log(mapData)
    this.dbMappingForm.patchValue({
      queryId: mapData.queryId,
      externalMappingId: mapData.externalMappingId,
      tagNumber: mapData.tagNumber,
      attributeNumber: mapData.attributeNumber,
      attributeId: mapData.attributeId,
      lastUpdateOn: mapData.lastUpdateOn,
      freqType: mapData.freqType,
      queryParameters: mapData.queryParameters,
      queryLang: mapData.queryLang,
      sysId: mapData.sysId,
      sysName: mapData.sysName,
      type: mapData.type,
      active: mapData.active,
      description: mapData.description,
      id: mapData.id
    });

    this.onLanguageChange();
  }

  onLanguageChange() {
    this.editorOptions = {
      ...this.editorOptions,
      language: this.dbMappingForm.get('queryLang')?.value
    }
  }

  cancel() {
    this.ref.close({ status: false });
  }


  //Entity, Intance
  onAttributeChange(event: any) {
    const selected = event.value;
    this.dbMappingForm.patchValue({
      attributeId: selected.id,
      attributeName: selected.name
    });
  }

  onTypeChange() {
    const type = this.dbMappingForm.get('type')?.value;
    if (type === 'Entity') {
      this.getEntityList();
    } else {
      this.getInstanceList();
    }
  }

  onTypeNameChange() {
    // Clear current selections when type changes
    const type = this.dbMappingForm.get('type')?.value;
    // Make API call based on selected type
    switch (type) {
      case 'Entity':
        this.getEntityAttr(this.dbMappingForm.get('id')?.value)
        break;
      case 'Instance':
        this.getInstanceAttr(this.dbMappingForm.get('id')?.value)
        break;
      default:
        this.attributesOptions = [];
    }
  }

  getEntityList() {
    this.attributeService.getEntityList({ orgId: this.orgId }).subscribe({
      next: (res: any) => {
        this.listOptions = res.Entity_Attributes.map((res: any) => ({
          name: res.entityName,
          id: res.entityId
        }));;
      }
    });
  }

  getInstanceList() {
    this.attributeService.getInstanceList({ orgId: this.orgId }).subscribe({
      next: (res: any) => {
        this.listOptions = res.Instances.map((res: any) => ({
          name: res.instanceName,
          id: res.instanceId
        }));
      }
    });
  }

  private getEntityAttr(entityId: string) {
    this.attributeService.getEntityDetailsById(entityId).subscribe({
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
    console.log(instanceId);
    this.attributeService.getInstanceDetailsById(instanceId).subscribe({
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

}
