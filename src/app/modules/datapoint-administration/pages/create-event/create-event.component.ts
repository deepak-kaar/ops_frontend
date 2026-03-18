import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray, Form } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

/**
 * @component CreateEventComponent
 * Component for creating events with associated triggers, workflows, and notifications.
 * Handles form initialization, data fetching, and event submission.
 */
@Component({
  selector: 'app-create-event',
  standalone: false,
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css'
})
export class CreateEventComponent {

  entityList: any[] = []; // List of entities fetched from the server.
  rolesData: any[] = []; // List of roles fetched from the server.
  activities: string[] = ['Notification', 'Monitoring', 'Workflow'];
  templateList: any[] = []; // List of templates from the server
  flagList: any[] = []; // List of flags from the server;
  typeOptions: { [key: number]: any[] } = {};
  attributesOptions: { [key: number]: any[] } = {};
  types = ['Entity', 'Instance', 'Tags'];
  frequencyOptions = [{
    name: 'Hour',
    type: 'H'
  },
  {
    name: 'Day',
    type: 'D'
  },
  {
    name: 'Week',
    type: 'W'
  },
  {
    name: 'Month',
    type: 'M'
  },
  {
    name: 'Quarterly',
    type: 'Q'
  },
  {
    name: 'Semi Annual',
    type: 'S'
  },
  {
    name: 'Year',
    type: 'Y'
  }];

  /**
   * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
   */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  /**
   * Reactive form group for managing event creation inputs.
   * @type {FormGroup}
   */
  createEvent: FormGroup;
  attributeForm: FormGroup;
  appData: any;
  notifications: any;


  /**
   * Constructor injecting necessary dependencies.
   * @param {DatapointAdministrationService} datapointAdminService - Service for handling data admin-related API calls.
   * @param {NgxSpinnerService} spinner - Spinner service for showing and hiding loading indicators.
   * @param {Router} router - Angular Router for navigation.
   * @param {MessageService} messageService - PrimeNG message service for notifications.
   */
  constructor(
    private datapointAdminService: DatapointAdministrationService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.appData = this.router.getCurrentNavigation()?.extras.state;

    this.createEvent = this.fb.group({
      eventName: new FormControl<string>('', [Validators.required]),
      eventDescription: new FormControl<string>('', [Validators.required]),
      // flagID: new FormControl<any>('', [Validators.required]),
      // eventCardTemplateIDTID: new FormControl<any>(''),
      // eventDetailpageIDTID: new FormControl<any>(''),
      eventLevel: new FormControl<any>(['', Validators.required]),
      eventLevelName: new FormControl<any>(['']),
      eventOrgLevel: new FormControl<any>(['']),
      eventStart: this.fb.array([]),
      eventOnGoing: this.fb.array([]),
      eventEnd: this.fb.array([]),
      eventInputVariables: this.fb.array([])
    });

    this.attributeForm = this.fb.group({
      inputMappings: this.fb.array([]),
    });
    this.setMapping();
  }

  /**
   * Lifecycle hook that is called after the component's view has been initialized.
   * Fetches required data for entity and roles lists.
   */
  ngOnInit() {
    if (this.appData?.appId) {
      this.createEvent.patchValue({
        eventLevel: 'Application',
        eventLevelName: this.appData?.appId,
        eventOrgLevel: this.appData?.orgId || ''
      });
    }
    this.getDatas();
    this.addEventStart();
    this.addEventOnGoing();
    this.addEventEnd();
    this.getNotifications();
  }

  /** 
   * Getter that returns the form array
   * Returns the eventstart form control as form array whenever the getter method is called
   * @returns {FormArray}
   */

  get eventStarts(): FormArray {
    return this.createEvent.get('eventStart') as FormArray;
  }

  /** 
  * Returns the eventOnGoings form control as form array whenever the method is called
  * @returns {FormArray}
  */

  get eventOnGoings(): FormArray {
    return this.createEvent.get('eventOnGoing') as FormArray;
  }

  /** 
  * Returns the eventEnds form control as form array whenever the method is called
  * @returns {FormArray}
  */

  get eventEnds(): FormArray {
    return this.createEvent.get('eventEnd') as FormArray;
  }


  /** 
  * Returns the inputMappings form control as form array whenever the method is called
  * @returns {FormArray}
  */
  get inputMappings(): FormArray {
    return this.attributeForm.get('inputMappings') as FormArray;
  }

  /**
   * Fetches roles and entity lists concurrently and updates component state.
   * Hides the spinner once data is loaded.
   * Logs errors in case of failure.
   * @returns {void}
   */
  getDatas(): void {

    let payload = {
      ...(this.appData?.appId && { appId: this.appData?.appId }),
      ...(this.appData?.orgId && { orgId: this.appData?.orgId })
    };

    forkJoin([
      this.datapointAdminService.getFilteredRoles(payload),
      // this.datapointAdminService.getTemplateList(),
      this.datapointAdminService.getFlagList(payload),
    ]).subscribe({
      next: ([res1, res3]) => {
        this.spinner.hide();
        this.rolesData = res1.roles.map((item: any) => ({
          roleId: item.roleId,
          roleName: item.roleName,
          roleDesc: item.roleDesc,
        }));
        // this.templateList = res3?.template.map((item: any) => ({
        //   templateId: item.templateId,
        //   templateName: item.templateName,
        // }));

        this.flagList = res3?.flag.map((item: any) => ({
          flagId: item.flagId,
          flagName: item.flagName,
        }));

      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      },
    });
  }

  /**
   * Handles form submission to create a new event.
   * Validates the form, constructs the payload, and sends it to the server.
   * Provides success or error notifications based on the outcome.
   * @returns {void}
   */
  onSubmit(): void {
    this.spinner.show();
    if (this.createEvent.valid) {
      const triggers = [
        this.createTrigger(
          'event_start',
          'monitEventInit',
          'notifEventInit',
          'workflowEventInit'
        ),
        this.createTrigger(
          'ongoing_event',
          'monitEventOn',
          'notifEventOn',
          'workflowEventOn'
        ),
        this.createTrigger(
          'event_end',
          'monitEventComp',
          'notifEventComp',
          'workflowEventComp'
        ),
      ];
      const payload = {
        eventName: this.createEvent.get('eventName')?.value,
        eventDescription: this.createEvent.get('eventDescription')?.value,
        entityOrInstanceID:
          this.createEvent.get('entityOrInstanceID')?.value.entityId,
        attributeID: this.createEvent.get('eventName')?.value,
        flagID: this.createEvent.get('flagID')?.value.flagId,
        eventCardTemplateIDTID: this.createEvent.get('eventCardTemplateIDTID')
          ?.value.templateId,
        eventDetailpageIDTID: this.createEvent.get('eventDetailpageIDTID')
          ?.value.templateId,
        event_status: 'event_start',
        triggers: triggers,
        eventLevel: this.createEvent.get('eventLevel')?.value,
        eventLevelName: this.createEvent.get('eventLevelName')?.value,
        eventOrgLevel: this.createEvent.get('eventOrgLevel')?.value
      };

      this.datapointAdminService.postEvent(payload).subscribe({
        next: (res: any) => {
          console.log(res);
          this.createEvent.reset();
          this.spinner.hide();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Event created successfully',
            life: 5000,
          });
        },
        error: (err) => {
          this.spinner.hide();
        },
      });
    } else {
      this.spinner.hide();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Fill out the required fields',
        life: 5000,
      });
    }
  }

  onChange() {
    throw new Error('Method not implemented.');
  }



  /**
   * Adds the eventstart fb objects to the eventstart fb array
   * @returns {void}
   */
  addEventStart(): void {
    const variableGp = this.fb.group({
      activityType: [''],
      activityTemplate: [''],
      activityRoles: ['']
    })

    this.eventStarts.push(variableGp)
  }


  /**
   * Adds the event on going to fb objects to the eventstart fb array
   * @returns {void}
   */
  addEventOnGoing(): void {
    const variableGp = this.fb.group({
      activityType: [''],
      activityTemplate: [''],
      activityRoles: [''],
      thresholdTime: ['']
    })

    this.eventOnGoings.push(variableGp)
  }


  /**
   * Adds the event end to fb objects to the eventstart fb array
   * @returns {void}
   */
  addEventEnd(): void {
    const variableGp = this.fb.group({
      activityType: [''],
      activityTemplate: [''],
      activityRoles: [''],
      thresholdTime: ['']
    })

    this.eventEnds.push(variableGp)
  }


  /**
   * Creates a trigger object based on input parameters.
   * @param {string} triggerType - Type of the trigger (e.g., 'event_start').
   * @param {string} monitKey - Key for monitoring role ID.
   * @param {string} notifKey - Key for notification role ID.
   * @param {string} workflowKey - Key for workflow role ID.
   * @returns {Record<string, any>} Trigger object.
   */
  createTrigger(
    triggerType: string,
    monitKey: string,
    notifKey: string,
    workflowKey: string
  ): Record<string, any> {
    return {
      trigger_type: triggerType,
      applicationRoleId: this.createEvent.get(monitKey)?.value,
      notificationRoleID: this.createEvent.get(notifKey)?.value,
      workflowRoleID: this.createEvent.get(workflowKey)?.value,
    };
  }

  /**
   * Navigates back to the admin home page when the close callback is triggered.
   * @param {MouseEvent} $event - Mouse event triggering the callback.
   * @returns {void}
   */
  closeCallback($event: MouseEvent): void {
    window.history.back();
  }

  openPageTemplate() {
    if (this.createEvent.get('eventDetailpageIDTID')?.value) {
      const templateId = this.createEvent.get('eventDetailpageIDTID')?.value
        .templateId;
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/globalRenderer/mapping', templateId])
      );

      window.open(url, '_blank');
    }

    // this.router.navigate(['/globalRenderer',this.createEvent.get('eventDetailpageIDTID')?.value.templateId]);
  }
  openCardTemplate() {
    if (this.createEvent.get('eventDetailpageIDTID')?.value) {
      const templateId = this.createEvent.get('eventDetailpageIDTID')?.value
        .templateId;
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/globalRenderer/mapping', templateId])
      );

      window.open(url, '_blank');
    }
    // this.router.navigate(['/pageBuilder'], { queryParams: { mapping: true } });
  }

  onRemoveVaribale(index: number) {
    this.eventStarts.removeAt(index);
  }

  setMapping() {
    const row = this.fb.group({
      index: [this.inputMappings.length],
      variableName: [],
      type: [''],
      typeName: [''],
      attribute: [null, [Validators.required]],
      frequency: [null, [Validators.required]],
      offset: [0, [Validators.required]],
    });
    row.get('type')?.valueChanges.subscribe((selectedType: any) => {
      this.onTypeChange(selectedType, this.inputMappings.length);
    });

    row.get('typeName')?.valueChanges.subscribe((selectedType: any) => {
      this.onTypeNameChange(selectedType, this.inputMappings.length);
    });
    this.inputMappings.push(row);
  }

  onTypeChange(selectedType: string, rowIndex: number) {
    // Clear current selections when type changes
    const currentRow = this.inputMappings.at(rowIndex);
    currentRow.get('attribute')?.setValue(null);
    currentRow.get('frequency')?.setValue(null);

    // Make API call based on selected type
    switch (selectedType) {
      case 'Entity':
        this.loadEntityOptions(rowIndex);
        break;
      case 'Instance':
        this.loadInstanceOptions(rowIndex);
        break;
      case 'Tags':
        this.loadTagsOptions(rowIndex);
        break;
      default:
        this.typeOptions[rowIndex] = [];
    }
  }

  onTypeNameChange(selectedType: any, rowIndex: number) {
    // Clear current selections when type changes
    const currentRow = this.inputMappings.at(rowIndex);
    const type = currentRow.get('type')?.value;
    // Make API call based on selected type
    switch (type) {
      case 'Entity':
        this.getEntityAttr(rowIndex, selectedType.id)
        break;
      case 'Instance':
        this.getInstanceAttr(rowIndex, selectedType.id)
        break;
      default:
        this.attributesOptions[rowIndex] = [];
    }
  }

  private loadEntityOptions(rowIndex: number) {
    // API call for Entity type
    this.datapointAdminService.getEntityList(this.appData).subscribe({
      next: (res) => {
        this.typeOptions[rowIndex] = res.Entity_Attributes.map((res: any) => ({
          name: res.entityName,
          id: res.entityId
        }));
      },
      error: (error) => {
        console.error('Error loading entity attributes:', error);
        this.typeOptions[rowIndex] = [];
      }
    });
  }

  private loadInstanceOptions(rowIndex: number) {
    // API call for Instance type
    this.datapointAdminService.getInstanceList(this.appData).subscribe({
      next: (res) => {
        this.typeOptions[rowIndex] = res.Instances.map((res: any) => ({
          name: res.instanceName,
          id: res.instanceId
        }));
      },
      error: (error) => {
        console.error('Error loading instance attributes:', error);
        this.typeOptions[rowIndex] = [];
      }
    });
  }

  private loadTagsOptions(rowIndex: number) {
    this.datapointAdminService.getAttrList(this.appData).subscribe({
      next: (res) => {
        this.attributesOptions[rowIndex] = res[0].attributes.map((res: any) => ({
          name: res.attributeName,
          id: res.attributeId
        }));
      },
      error: (error) => {
        console.error('Error loading tags attributes:', error);
        this.typeOptions[rowIndex] = [];
      }
    });
  }

  // Helper method to get attribute options for a specific row
  getTypeOptions(rowIndex: number): any[] {
    return this.typeOptions[rowIndex] || [];
  }

  getAttributeOptions(rowIndex: number): any[] {
    return this.attributesOptions[rowIndex] || [];
  }

  // // Helper method to get frequency options for a specific row
  // getFrequencyOptions(rowIndex: number): any[] {
  //   return this.frequencyOptions[rowIndex] || [];
  // }

  private getEntityAttr(rowIndex: number, entityId: string) {
    this.datapointAdminService.getEntityDetailsById(entityId).subscribe({
      next: (res) => {
        this.attributesOptions[rowIndex] = res.attributes.map((res: any) => ({
          name: res.attributeName,
          id: res.attributeId
        }));
      },
      error: (error) => {
        console.error('Error loading tags attributes:', error);
        this.typeOptions[rowIndex] = [];
      }
    });
  }
  private getInstanceAttr(rowIndex: number, instanceId: string) {
    this.datapointAdminService.getInstanceDetailsById(instanceId).subscribe({
      next: (res) => {
        this.attributesOptions[rowIndex] = res.attributes.map((res: any) => ({
          name: res.attributeName,
          id: res.attributeId
        }));
      },
      error: (error) => {
        console.error('Error loading tags attributes:', error);
        this.typeOptions[rowIndex] = [];
      }
    });
  }


  getNotifications() {
    this.spinner.show();
    this.datapointAdminService.getNotications(this.appData).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.notifications = res.Notifications;
        console.log(this.notifications);
      },
      error: (err) => {
        console.error(err);
      }
    })
  }
  onActivityChange(type: string) {
    if(type==='Notification'){
      this.notifications = this.notifications;
    }
  }
}
