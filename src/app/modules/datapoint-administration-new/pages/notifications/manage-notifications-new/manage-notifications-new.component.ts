import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-manage-notifications-new',
    standalone: false,
    templateUrl: './manage-notifications-new.component.html',
    styleUrl: './manage-notifications-new.component.css'
})
export class ManageNotificationsNewComponent {
    notificationForm!: FormGroup;

    breakPointForToastComponent = breakPointForToastComponent;
    appData: any;
    notifTypes = ['SMS', 'APP', 'EMAIL'];
    messageTypeOptions = [
        { label: 'Static', value: 'Static' },
        { label: 'Dynamic', value: 'Dynamic' }
    ];
    editorOptions = {
        theme: 'vs-dark', language: 'html',
        automaticLayout: true
    };

    isDuplicateError: any = {};

    @Input() notificationId: any;
    @Output() notificationUpdated = new EventEmitter<void>();

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService,
        private spinner: NgxSpinnerService,
        private dataPointService: DatapointAdministrationService,
        public sanitizer: DomSanitizer,
    ) {
        // this.activateRoute.paramMap.subscribe((params: any) => {
        //   this.notificationId = params.params.id;
        // })
        this.appData = this.router.getCurrentNavigation()?.extras.state;
    }

    ngOnInit() {
        this.initForms();
    }

    ngOnChanges() {
        console.log(this.notificationId)
        this.getNotification(this.notificationId);
    }

    initForms() {
        this.notificationForm = this.fb.group({
            notificationId: new FormControl<string>(''),
            notificationName: new FormControl<string>('', Validators.required),
            notificationDescription: new FormControl<string>(''),
            notificationType: new FormControl<string>('', Validators.required),
            messageType: new FormControl<string>('Static', Validators.required),
            greetings: new FormControl<string>(''),
            footer: new FormControl<string>(''),
            notificationBody: new FormControl<string>(''),
            notificationLevel: new FormControl<string>(''),
            notificationLevelName: new FormControl<string>(''),
            notificationOrgLevel: new FormControl<string>(''),
        });
    }

    goBack() {
        window.history.back();
    }

    onCancel() {
        this.goBack();
    }

    changeType(type: string) {
        if (type === 'APP' || type === 'SMS') {
            this.notificationForm.get('notificationBody')?.reset();
        }
    }

    getNotification(notificationId: string) {
        this.spinner.show();
        this.dataPointService.getNotification(notificationId).subscribe({
            next: (res: any) => {
                this.spinner.hide();
                this.patchValue(res.Notification)
            },
            error: (err) => {

            }
        })
    }

    onSubmit() {
        if (this.notificationForm.valid) {
            const payload = this.generateNotificationPayload();
            this.spinner.show();
            
            const apiCall = this.notificationId 
                ? this.dataPointService.updateNotification(payload)
                : this.dataPointService.postNotification(payload);
            
            apiCall.subscribe({
                next: (res: any) => {
                    this.spinner.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Notification ${this.notificationId ? 'updated' : 'created'} successfully`,
                        life: 5000,
                    });
                    if (!this.notificationId) {
                        this.notificationForm.reset();
                        this.goBack();
                    } else {
                        this.notificationUpdated.emit();
                    }
                },
                error: (err: any) => {
                    this.spinner.hide();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Failed to ${this.notificationId ? 'update' : 'create'} notification`,
                        life: 5000,
                    });
                },
            });
        } else {
            this.notificationForm.markAllAsTouched();
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields' });
        }
    }

    generateNotificationPayload(): any {
        const notificationData = this.notificationForm.value;

        let finalBody = notificationData.notificationBody;
        if (notificationData.messageType === 'Dynamic') {
            const isEmail = notificationData.notificationType === 'EMAIL';
            const separator = isEmail ? '<br><br>' : '\n\n';
            finalBody = (notificationData.greetings || '') + 
                        separator + '{{comments}}' + separator + 
                        (notificationData.footer || '');
        }

        const payload = {
            notificationId: notificationData.notificationId,
            notificationName: notificationData.notificationName,
            notificationDescription: notificationData.notificationDescription,
            notificationType: notificationData.notificationType,
            messageType: notificationData.messageType,
            greetings: notificationData.greetings,
            footer: notificationData.footer,
            notificationBody: finalBody,
            notificationLevel: this.appData?.appId ? 'Application' : 'Opsinsight',
            notificationLevelName: this.appData?.appName || 'Opsinsight',
            notificationOrgLevel: this.appData?.orgId || null,
            inputVariables: [],
        };
        return payload;
    }

    patchValue(data: any) {
        this.notificationForm.patchValue({
            notificationId: data.notificationId,
            notificationName: data.notificationName,
            notificationDescription: data.notificationDescription,
            notificationType: data.notificationType,
            messageType: data.messageType || 'Static',
            greetings: data.greetings || '',
            footer: data.footer || '',
            notificationBody: data.notificationBody,
            notificationLevel: data.notificationLevel,
            notificationLevelName: data.notificationLevelName,
            notificationOrgLevel: data.notificationOrgLevel
        })
    }
}
