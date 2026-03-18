import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Apps, CanvasType, Orgs } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { PageAdministratorService } from '../../../page-administrator.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { LlmChatboxService } from '../llm-chatbox/llm-chatbox.service';

@Component({
  selector: 'app-canvas-config',
  standalone: false,
  templateUrl: './canvas-config.component.html',
  styleUrl: './canvas-config.component.css'
})
export class CanvasConfigComponent {

  canvasForm = new FormGroup({
    canvasType: new FormControl<string>('', Validators.required),
    canvasWidth: new FormControl<string>(''),
    canvasHeight: new FormControl<string>(''),
    entity: new FormControl<string>(''),
    app: new FormControl<string>('', Validators.required),
    org: new FormControl<string>(''),
    targetForm: new FormControl<boolean>(false)
  });

  formConfig: any;
  canvasTypes: CanvasType[] = [
    { name: 'Card Design', width: '400', height: '300' },
    { name: 'Dashboard Design' },
    { name: 'Report Design' },
    { name: 'Form Design' },
    { name: 'Display Component' }
  ];

  canvasWidth = '400';
  canvasHeight = '300';
  isExpanded = false;

  entity: any;
  apps!: Apps[];
  orgs!: Orgs[];

  app!: string;
  org!: string;
  checked: boolean = false;

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  constructor(public dialogConfig: DynamicDialogConfig, private ref: DynamicDialogRef, private pageAdminService: PageAdministratorService, private chatService: LlmChatboxService) {
    this.formConfig = this.dialogConfig.data;
    if ((!this.formConfig?.reportType || !this.formConfig?.appId) || (this.formConfig?.reportType != undefined || this.formConfig?.appId != undefined)) {
      this.canvasForm.patchValue({
        canvasType: this.formConfig?.reportType || '',
        app: this.formConfig?.appId || '',
        org: this.formConfig?.orgId || ''
      })
      this.getOrgs(this.formConfig?.appId);
    }
  }


  ngOnInit() {
    this.getApps();
  }

  applyCanvasSettings() {
    if (this.canvasForm.valid) {
      console.log(this.canvasForm.getRawValue());
      this.chatService.clearMessages();
      this.ref.close(this.canvasForm.getRawValue());
    }

  }

  onAppChange(appId: string) {
    this.getOrgs(appId)
  }
  /**
   * Fetches the list of Apps from the server with the help of page administrator service and updates the `app` property.
   * Displays a spinner while the API call is in progress.
   * Logs the error in the console if any.
   * @returns {void}
   */
  getApps(): void {
    this.pageAdminService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.apps.map((app: any) => ({
          appId: app.appId,
          appName: app.appName
        }))
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  /**
  * Fetches the list of orgs for an application from the server with the help of page administrator service and updates the `app` property.
  * Displays a spinner while the API call is in progress.
  * Logs the error in the console if any.
  * @param {string} appId - Application Id
  * @returns {void}
  */
  getOrgs(appId: string): void {
    this.pageAdminService.getOrgsByApp(appId).subscribe({
      next: (res: any) => {
        this.orgs = res.orgs.map((org: any) => ({
          orgId: org.orgId,
          orgName: org.orgName
        }))
      },
      error: (err) => {
      }
    })
  }

}
