import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { WebserviceAdministrationComponent } from '../../webservice-administration.component';
import { SelectButtonOptionClickEvent } from 'primeng/selectbutton';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-manage-webservice',
  standalone: false,
  templateUrl: './manage-webservice.component.html',
  styleUrl: './manage-webservice.component.css'
})
export class ManageWebserviceComponent extends WebserviceAdministrationComponent {
  /**
       * @property {FormGroup} wsForm - Form group that holds application form controls.
       */
  wsForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  /**
   * @property {string} wsLevelId - stores the wsLevelId Id (app Id or orgId).
   */

  wsLevelId: string

  /**
   * @property {string} appId - stores the appId.
   */
  appId: any;

  /**
  * @property {string} orgId - stores the orgId.
  */
  orgId: any;

  /**
* @property {any[]} activeStatus - Stores a list of active status (potentially for dropdown selection).
*/
  activeStatus: any[] = [
    {
      name: 'Active',
      value: true
    },
    {
      name: 'Inactive',
      value: false
    }
  ];


  /**
* @property {any[]} apiTypes - Stores a list of API methods (potentially for dropdown selection).
*/
  apiTypes: any[] = ['REST', 'SOAP']

  /**
* @property {any[]} requestMethods - Stores a list of request methods (potentially for dropdown selection).
*/
  requestMethods: any[] = ['GET', 'POST', 'PUT', 'DELETE']

  /**
* @property {any[]} authTypes - Stores a list of auth Types (potentially for dropdown selection).
*/
  authTypes: any[] = ['No Auth', 'Service Account', 'Bearer Token', 'API Key'];

  /**
* @property {any[]} headerOptions - Common HTTP headers for dropdown selection.
*/
  headerOptions: any[] = [
    'Content-Type',
    'Accept',
    'Authorization',
    'User-Agent',
    'Cache-Control',
    'X-API-Key',
    'X-Requested-With',
    'Origin',
    'Referer',
    'SOAPAction',
    'Custom'
  ];

  baseEditorOptions = {
    theme: 'vs-dark',
    language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false
  };

  authEditorOptions = { ...this.baseEditorOptions };
  headerEditorOptions = { ...this.baseEditorOptions };
  bodyEditorOptions = { ...this.baseEditorOptions };

  tabActions = ['Authorization', 'Headers', 'Body']

  isShowAuthorization: boolean = false;

  isShowHeaders: boolean = false;

  isShowBody: boolean = false;

  selectedTab: any;

  selectedTabIndex = 0;



  isInitialPatch = true;
  private isInitializing = true;

  get wsHeaders(): FormArray {
    return this.wsForm.get('wsHeaders') as FormArray;
  }

  // Custom validators
  private headerKeyValidator(control: any) {
    const value = control.value;
    if (!value) return null;
    
    // Check for valid header name format (no spaces, control chars, etc.)
    const headerNameRegex = /^[a-zA-Z0-9!#$&'*+.^_`|~-]+$/;
    return headerNameRegex.test(value) ? null : { invalidHeaderKey: true };
  }

  private headerValueValidator(control: any) {
    const value = control.value;
    if (!value) return null;
    
    // Check for control characters (except tab)
    const hasControlChars = /[\x00-\x08\x0A-\x1F\x7F]/.test(value);
    return hasControlChars ? { invalidHeaderValue: true } : null;
  }

  addHeader(): void {
    const headerGroup = this.fb.group({
      key: ['', [Validators.required, this.headerKeyValidator]],
      value: ['', [Validators.required, this.headerValueValidator]]
    });
    this.wsHeaders.push(headerGroup);
  }

  removeHeader(index: number): void {
    this.wsHeaders.removeAt(index);
  }


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
    this.wsLevelId = this.dialogConfig.data?.tagSendLevelId || null;
    this.appId = this.dialogConfig.data?.appId || null;
    this.orgId = this.dialogConfig.data?.orgId || null;
    this.selectedTab = this.tabActions[0];
    this.selectedTabIndex = 0;
    this.isShowAuthorization = true;

    this.wsForm = this.fb.group({
      _id: new FormControl<any>(''),
      webserviceId: new FormControl<string>('', [Validators.required]),
      wsName: new FormControl<string>('', [Validators.required]),
      wsURL: new FormControl<string>('', [Validators.required]),
      authType: new FormControl<string>('No Auth'),
      wsAuth: new FormControl<string>(''),
      wsHeaders: this.fb.array([]),
      wsBody: new FormControl<string>(''),
      active: new FormControl<boolean>(true),
      apiType: new FormControl<string>('REST'),
      method: new FormControl<string>('GET'),
      description: new FormControl<string>(''),
    });

    this.wsForm.get('apiType')?.valueChanges.subscribe(() => {
      if (!this.isInitializing) {
        this.updateEditorLanguage();
      }
    });

    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.appId = this.dialogConfig.data?.appData?.appId;
      this.isInitialPatch = true;
      this.patchValue(this.dialogConfig.data?.wsData)
    }
    this.isInitializing = false;
  }


  /**
   * Validates the roleForm.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  saveWS(): void {
    if (this.wsForm.valid) {
      const formValue = this.wsForm.getRawValue();
      const apiType = formValue.apiType;

      let wsAuth = formValue.wsAuth;
      let wsBody = formValue.wsBody;
      let wsHeaders = this.wsHeaders.value.reduce((acc: any, header: any) => {
        if (header.key && header.value) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {});

      if (apiType === 'REST') {
        wsAuth = wsAuth ? JSON.parse(wsAuth) : null;
        wsBody = wsBody ? JSON.parse(wsBody) : null;
        // wsHeaders is already an object from FormArray conversion
      }

      const payload = {
        webserviceId: this.wsForm.get('webserviceId')?.value,
        wsName: this.wsForm.get('wsName')?.value,
        wsURL: this.wsForm.get('wsURL')?.value,
        wsBody: wsBody,
        wsHeaders: wsHeaders,
        authType: this.wsForm.get('authType')?.value,
        wsAuth: wsAuth,
        description: this.wsForm.get('description')?.value,
        active: this.wsForm.get('active')?.value,
        method: this.wsForm.get('method')?.value,
        apiType: this.wsForm.get('apiType')?.value
      }

      console.log(payload);

      if (this.mode == 'create') {
        this.webserviceAdministrationService.postWS(payload).subscribe({
          next: (res: any) => {
            this.showToast('success', 'Success', 'Successfully created', 2000, false);
            this.ref.close({ status: true, data: { ...payload, _id: res.result.insertedId } });
          },
          error: (err) => {
            this.showToast('error', 'Error', 'Error when creating', 2000, false);
          }
        });
      } else {
        const id = this.wsForm.get('_id')?.value;
        this.webserviceAdministrationService.putWS(payload, id).subscribe({
          next: (res: any) => {
            this.showToast('success', 'Success', 'Successfully edited', 2000, false);
            this.ref.close({ status: true, data: { ...payload, _id: id } });
          },
          error: (err) => {
            this.showToast('error', 'Error', 'Error when editing', 2000, false);
          }
        });
      }
    }
  }


  /**
 * Patches the web service data to the appForm
 * @param {any} wsData - web service data
 * @returns {void} - returns nothing (i.e) void
 */
  patchValue(wsData: any): void {
    this.wsForm.patchValue({
      _id: wsData._id,
      webserviceId: wsData.webserviceId,
      wsName: wsData.wsName,
      wsURL: wsData.wsURL,
      wsAuth: this.stringifyValue(wsData.wsAuth),
      wsBody: this.stringifyValue(wsData.wsBody),
      description: wsData.description,
      active: wsData.active,
      method: wsData.method,
      authType: wsData.authType,
      apiType: wsData.apiType
    });

    // Populate headers FormArray
    if (wsData.wsHeaders && typeof wsData.wsHeaders === 'object') {
      Object.entries(wsData.wsHeaders).forEach(([key, value]) => {
        const headerGroup = this.fb.group({
          key: [key, [Validators.required, this.headerKeyValidator]],
          value: [value, [Validators.required, this.headerValueValidator]]
        });
        this.wsHeaders.push(headerGroup);
      });
    }

    this.updateEditorLanguage();
  }

  onTabClick(event: SelectButtonOptionClickEvent) {

    this.selectedTab = event.option;

    this.isShowAuthorization = false;
    this.isShowHeaders = false;
    this.isShowBody = false;

    this.selectedTabIndex = event.index ?? 0;

    switch (this.selectedTabIndex) {
      case 0:
        this.isShowAuthorization = true;
        break;
      case 1:
        this.isShowHeaders = true;
        break;
      case 2:
        this.isShowBody = true;
        break;
      default:
        this.isShowAuthorization = true;
        break;
    }
  }

  onAuthTypeChange(type: string) {
    if (this.isInitialPatch) {
      this.isInitialPatch = false;
      return;
    }

    const apiType = this.wsForm.get('apiType')?.value;
    let authTemplate = '';

    const isXML = apiType?.toLowerCase() === 'soap';

    switch (type) {
      case 'Service Account':
        authTemplate = isXML
          ? `<auth>
    <username></username>
    <password></password>
</auth>`
          : JSON.stringify({ username: '', password: '' }, null, 4);
        break;

      case 'API Key':
        authTemplate = isXML
          ? `<apiKey>
    <key>x-api-key</key>
    <value></value>
</apiKey>`
          : JSON.stringify({ key: 'x-api-key', value: '' }, null, 4);
        break;

      case 'Bearer Token':
        authTemplate = isXML
          ? `<auth>
    <token></token>
</auth>`
          : JSON.stringify({ token: '' }, null, 4);
        break;

      case 'No Auth':
        authTemplate = isXML ? '' : '';
        break;

      default:
        authTemplate = '';
        break;
    }

    this.wsForm.patchValue({
      wsAuth: authTemplate
    });
  }

  updateEditorLanguage(): void {
    const apiType = this.wsForm.get('apiType')?.value;
    const authType = this.wsForm.get('authType')?.value;

    // Determine language
    const language = apiType?.toLowerCase() === 'soap' ? 'xml' : 'json';

    // Update each editor configuration
    this.authEditorOptions = { ...this.baseEditorOptions, language };
    this.headerEditorOptions = { ...this.baseEditorOptions, language };
    this.bodyEditorOptions = { ...this.baseEditorOptions, language };

    console.log(this.authEditorOptions, authType)
    if (authType) {
      this.onAuthTypeChange(authType);
    }
  }

  private stringifyValue(value: any): string {
    if (value == null || value === '') return '';
    return typeof value === 'string' ? value : JSON.stringify(value, null, 4);
  }

  cancel() {
    this.ref.close({ status: false });
  }
}
