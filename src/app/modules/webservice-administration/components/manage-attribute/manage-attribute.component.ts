import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { DatasourceAdministrationService } from 'src/app/modules/datasource-administration/datasource-administration.service';
import { WebserviceAdministrationComponent } from '../../webservice-administration.component';
import { WebserviceAdministrationService } from '../../services/webservice-administration.service';

@Component({
  selector: 'app-manage-attribute',
  standalone: false,
  templateUrl: './manage-attribute.component.html',
  styleUrl: './manage-attribute.component.css'
})
export class ManageAttributeComponent extends WebserviceAdministrationComponent {

  /**
  * @property {FormGroup} form - Form group that holds application form controls.
  */
  form: FormGroup;

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
   */
  constructor(public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder
  ) {
    super();
    this.form = this.fb.group({
      attributeId: new FormControl<string>('', [Validators.required]),
      attributeName: new FormControl<string>('', [Validators.required]),
      type: new FormControl<string>('', [Validators.required]),
      id: new FormControl<string>('', [Validators.required]),
    });
  }

  onAttributeChange(event: any) {
    const selected = event.value;
    this.form.patchValue({
      attributeId: selected.id,
      attributeName: selected.name
    });
  }

  onTypeChange() {
    const type = this.form.get('type')?.value;
    if (type === 'Entity') {
      this.getEntityList();
    } else {
      this.getInstanceList();
    }
  }

  onTypeNameChange() {
    // Clear current selections when type changes
    const type = this.form.get('type')?.value;
    // Make API call based on selected type
    switch (type) {
      case 'Entity':
        this.getEntityAttr(this.form.get('id')?.value)
        break;
      case 'Instance':
        this.getInstanceAttr(this.form.get('id')?.value)
        break;
      default:
        this.attributesOptions = [];
    }
  }

  getEntityList() {
    const payload = {
      appId: null,
      orgId: null
    }
    this.webserviceAdministrationService.getEntityList(payload).subscribe({
      next: (res: any) => {
        this.listOptions = res.Entity_Attributes.map((res: any) => ({
          name: res.entityName,
          id: res.entityId
        }));;
      }
    });
  }

  getInstanceList() {
    const payload = {
      appId: null,
      orgId: null
    }
    this.webserviceAdministrationService.getInstanceList(payload).subscribe({
      next: (res: any) => {
        this.listOptions = res.Instances.map((res: any) => ({
          name: res.instanceName,
          id: res.instanceId
        }));
      }
    });
  }

  private getEntityAttr(entityId: string) {
    this.webserviceAdministrationService.getEntityDetailsById(entityId).subscribe({
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
    this.webserviceAdministrationService.getInstanceDetailsById(instanceId).subscribe({
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

  onCancel() {
    this.ref.close({ status: false });
  }

  onSave() {
    this.ref.close({ status: true, data: this.form.getRawValue() });
  }


}
