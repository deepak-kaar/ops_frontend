import { Component, Input, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-create-event-new',
    standalone: false,
    templateUrl: './create-event-new.component.html',
    styleUrls: ['./create-event-new.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class CreateEventNewComponent implements OnInit {

    eventForm: FormGroup;
    breakPointForToastComponent = breakPointForToastComponent;

    activityTypes = [
        { label: 'Notification', value: 'Notification' },
        { label: 'Monitoring', value: 'Monitoring' },
        { label: 'Workflow', value: 'Workflow' }
    ];

    roles: any[] = [];
    templates: any[] = [];
    notifications: any[] = [];
    flags: any[] = [];
    selectedFlag: any;
    appData: any;
    
    // Template Preview Properties
    showPreviewDialog = false;
    previewTemplateData: any = null;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private spinner: NgxSpinnerService,
        private messageService: MessageService,
        private datapointAdminService: DatapointAdministrationService
    ) {
        this.eventForm = this.fb.group({
            eventName: ['', Validators.required],
            eventDesc: ['', Validators.required],
            flagID: ['', Validators.required],
            eventStartTasks: this.fb.array([]),
            eventOngoingTasks: this.fb.array([]),
            eventEndTasks: this.fb.array([]),
            eventLevel: [''],
            eventLevelName: [''],
            eventOrgLevel: [''],
            isEffectiveAfter: [false],
            effectiveAfterHours: [''],
            effectiveAfterMinutes: [''],
            isThresholdTime: [false],
            thresholdHours: [''],
            thresholdMinutes: ['']
        });

        const navigation = this.router.getCurrentNavigation();
        this.appData = navigation?.extras?.state || window.history.state;
    }

    ngOnInit(): void {
        console.log(this.appData);
        if (this.appData?.appId) {
            this.eventForm.patchValue({
                eventLevel: 'Application',
                eventLevelName: this.appData?.appId,
                eventOrgLevel: this.appData?.orgId || ''
            });
        }
        this.getDatas();
        if (this.appData?.eventId) {
            this.getEventDetails();
        } else {
            this.addTask('start');
            this.addTask('ongoing');
            this.addTask('end');
        }
    }

    // Removed attributes array

    getTasks(section: 'start' | 'ongoing' | 'end'): FormArray {
        switch (section) {
            case 'start': return this.eventForm.get('eventStartTasks') as FormArray;
            case 'ongoing': return this.eventForm.get('eventOngoingTasks') as FormArray;
            case 'end': return this.eventForm.get('eventEndTasks') as FormArray;
        }
    }

    onFlagSelect(event: any): void {
        this.selectedFlag = this.flags.find(f => f.value === event.value);
    }

    addTask(section: 'start' | 'ongoing' | 'end'): void {
        const taskGroup = this.fb.group({
            activityType: ['', Validators.required],
            role: [[], Validators.required],
            template: ['', Validators.required]
        });
        this.getTasks(section).push(taskGroup);
    }

    removeTask(section: 'start' | 'ongoing' | 'end', index: number): void {
        this.getTasks(section).removeAt(index);
    }

    goBack(): void {
        window.history.back();
    }

    onCancel(): void {
        window.history.back();
    }

    onSubmit(): void {
        if (this.eventForm.valid) {
            this.spinner.show();

            const payload = {
                ...(this.appData?.eventId && { eventId: this.appData?.eventId }),
                eventName: this.eventForm.get('eventName')?.value,
                eventDescription: this.eventForm.get('eventDesc')?.value,
                flagID: this.eventForm.get('flagID')?.value,
                eventStart: this.eventForm.get('eventStartTasks')?.value.map((task: any) => ({
                    activityType: task.activityType,
                    roleId: task.role,
                    templateId: task.template
                })),
                eventOngoing: this.eventForm.get('eventOngoingTasks')?.value.map((task: any) => ({
                    activityType: task.activityType,
                    roleId: task.role,
                    templateId: task.template
                })),
                eventEnd: this.eventForm.get('eventEndTasks')?.value.map((task: any) => ({
                    activityType: task.activityType,
                    roleId: task.role,
                    templateId: task.template
                })),
                eventLevel: this.eventForm.get('eventLevel')?.value,
                eventLevelName: this.eventForm.get('eventLevelName')?.value,
                eventOrgLevel: this.eventForm.get('eventOrgLevel')?.value,
                isEffectiveAfter: this.eventForm.get('isEffectiveAfter')?.value,
                effectiveAfterHours: this.eventForm.get('effectiveAfterHours')?.value,
                effectiveAfterMinutes: this.eventForm.get('effectiveAfterMinutes')?.value,
                isThresholdTime: this.eventForm.get('isThresholdTime')?.value,
                thresholdHours: this.eventForm.get('thresholdHours')?.value,
                thresholdMinutes: this.eventForm.get('thresholdMinutes')?.value,
                event_status: 'event_start'
            };

            const apiCall = this.appData?.eventId
                ? this.datapointAdminService.updateEvent(payload)
                : this.datapointAdminService.postEvent(payload);

            apiCall.subscribe({
                next: (res) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Event ${this.appData?.eventId ? 'updated' : 'created'} successfully`,
                        life: 5000
                    });

                    setTimeout(() => {
                        this.spinner.hide();
                        this.goBack();
                    }, 500);

                },
                error: (err) => {
                    this.spinner.hide();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Failed to ${this.appData?.eventId ? 'update' : 'create'} event`,
                        life: 5000
                    });
                }
            });
        } else {
            this.eventForm.markAllAsTouched();
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Fill out the required fields',
                life: 5000
            });
        }
    }

    getDatas(): void {
        this.spinner.show();
        const payload = {
            ...(this.appData?.appId && { appId: this.appData?.appId }),
            ...(this.appData?.orgId && { orgId: this.appData?.orgId })
        };

        forkJoin([
            this.datapointAdminService.getFilteredRoles(payload),
            this.datapointAdminService.getNotications(payload),
            this.datapointAdminService.getFlagList(payload)
        ]).subscribe({
            next: ([rolesRes, notificationsRes, flagsRes]) => {
                this.spinner.hide();
                this.roles = rolesRes.roles.map((item: any) => ({
                    label: item.roleName,
                    value: item.roleId
                }));
                this.notifications = notificationsRes.Notifications || [];
                this.templates = this.notifications.map((item: any) => ({
                    label: item.notificationName,
                    value: item.notificationId
                }));
                this.flags = flagsRes.flag?.map((item: any) => ({
                    label: item.flagName,
                    value: item.flagId,
                    flagSeverity: item.flagSeverity,
                    flagDesc: item.flagDesc,
                    flagVariables: item.flagVariables,
                    ...item
                })) || [];
                
                if (this.eventForm.get('flagID')?.value) {
                    this.onFlagSelect({ value: this.eventForm.get('flagID')?.value });
                }
            },
            error: (err) => {
                this.spinner.hide();
                console.error(err);
            }
        });
    }

    // Removed createTrigger method as the payload format has changed

    getEventDetails(): void {
        console.log('here');
        this.spinner.show();
        this.datapointAdminService.getEvent(this.appData?.eventId).subscribe({
            next: (res: any) => {
                this.spinner.hide();
                this.patchEventData(res.Event);
            },
            error: (err) => {
                this.spinner.hide();
            }
        });
    }

    patchEventData(event: any): void {
        // Clear existing form arrays
        this.getTasks('start').clear();
        this.getTasks('ongoing').clear();
        this.getTasks('end').clear();

        this.eventForm.patchValue({
            eventName: event.eventName,
            eventDesc: event.eventDescription,
            flagID: event.flagID || event.flagId || '',
            eventLevel: event.eventLevel,
            eventLevelName: event.eventLevelName,
            eventOrgLevel: event.eventOrgLevel,
            isEffectiveAfter: event.isEffectiveAfter || false,
            effectiveAfterHours: event.effectiveAfterHours || '',
            effectiveAfterMinutes: event.effectiveAfterMinutes || '',
            isThresholdTime: event.isThresholdTime || false,
            thresholdHours: event.thresholdHours || '',
            thresholdMinutes: event.thresholdMinutes || ''
        });
        
        if (this.flags.length > 0 && this.eventForm.get('flagID')?.value) {
            this.onFlagSelect({ value: this.eventForm.get('flagID')?.value });
        }

        // Removed eventInputVariables parsing

        const populateTasks = (tasksData: any[], section: 'start' | 'ongoing' | 'end') => {
            tasksData?.forEach((activity: any) => {
                const taskGroup = this.fb.group({
                    activityType: [activity.activityType, Validators.required],
                    role: [Array.isArray(activity.roleId) ? activity.roleId : (activity.roleId ? [activity.roleId] : []), Validators.required],
                    template: [activity.templateId, Validators.required]
                });
                this.getTasks(section).push(taskGroup);
            });
        };

        populateTasks(event.eventStart, 'start');
        populateTasks(event.eventOngoing, 'ongoing');
        populateTasks(event.eventEnd, 'end');
    }

    showTemplatePreview(templateId: string): void {
        const fullTemplateData = this.notifications.find((n: any) => n.notificationId === templateId);
        if (fullTemplateData) {
            this.previewTemplateData = fullTemplateData;
            this.showPreviewDialog = true;
            console.log("preview details", this.previewTemplateData);
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Template details not found.',
                life: 3000
            });
        }
    }
}
