import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-manage-notification',
  standalone: false,
  templateUrl: './manage-notification.component.html',
  styleUrl: './manage-notification.component.css'
})
export class ManageNotificationComponent implements OnInit, OnChanges {

  notificationForm: FormGroup;
  notifTypes = ['SMS', 'APP', 'EMAIL'];
  editorOptions = {
    theme: 'vs-dark', language: 'html',
    automaticLayout: true
  };
  appData: any;
  @Input() notificationId: any;
  isDuplicateError: any;
  isShowUi: any;

 /**
    * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
    */
  breakPointForToastComponent: { [key: string]: any; } =breakPointForToastComponent;


  /**
   * 
   * @param {FormGroup} fb  - intializes form Builder
   * @param {DomSanitizer} sanitizer - intializes Angular DOM Santizer
   * creates new form group called notification form using form builder class
   */
  constructor(private fb: FormBuilder,
    public sanitizer: DomSanitizer,
    private router: Router,
    private dataPointAdminService: DatapointAdministrationService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private activateRoute: ActivatedRoute) {
    this.notificationForm = this.fb.group({
      notificationId: new FormControl<string>('', Validators.required),
      notificationName: new FormControl<string>('', Validators.required),
      notificationDescription: new FormControl<string>(''),
      notificationType: new FormControl<string>('', Validators.required),
      notificationBody: new FormControl<string>('', Validators.required),
      notificationLevel: new FormControl<string>(''),
      notificationLevelName: new FormControl<string>(''),
      notificationOrgLevel: new FormControl<string>(''),
      inputVariables: this.fb.array([])
    })

    // this.activateRoute.paramMap.subscribe((params: any) => {
    //   this.notificationId = params.params.id;
    // })
    this.appData = this.router.getCurrentNavigation()?.extras.state;
  }

  ngOnInit() {
    // this.getNotification(this.notificationId);
  }

  ngOnChanges() {
    console.log(this.notificationId)
    this.getNotification(this.notificationId);
  }

  /**
   * Handles form submission to create a new event.
   * Validates the form, constructs the payload, and sends it to the server.
   * Provides success or error notifications based on the outcome.
   * @returns {void}
   */
  onSubmit(): void {
    this.spinner.show();
    if (this.notificationForm.valid) {
      this.dataPointAdminService.updateNotification(this.notificationForm.value).subscribe({
        next: (res: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Notification updated successfully',
            life: 5000,
          })
          this.spinner.hide()
        },
      })
    }
  }

  /**
  * Navigates back to the admin home page when the close callback is triggered.
  * @param {MouseEvent} $event - Mouse event triggering the callback.
  * @returns {void}
  */
  closeCallback($event: MouseEvent): void {
    window.history.back();
  }

  changeType(type: string) {
    if (type === 'APP' || type === 'SMS') {
      this.notificationForm.get('notificationBody')?.reset();
    }
  }
  getNotification(notificationId: string) {
    this.spinner.show();
    this.dataPointAdminService.getNotification(notificationId).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.patchValue(res.Notification)
      },
      error: (err) => {

      }
    })
  }

  patchValue(data: any) {
    this.notificationForm.patchValue({
      notificationId: data.notificationId,
      notificationName: data.notificationName,
      notificationDescription: data.notificationDescription,
      notificationType: data.notificationType,
      notificationBody: data.notificationBody,
      notificationLevel: data.notificationLevel,
      notificationLevelName: data.notificationLevelName,
      notificationOrgLevel: data.notificationOrgLevel
    })
    data.inputVariables.forEach((variable: any) => this.addInputonPatch(variable));

    this.isShowUi = true;
  }


  get inputMappings(): FormArray {
    return this.notificationForm.get('inputVariables') as FormArray;
  }

  addInputVariable() {
    const variableGroup = this.fb.group({
      type: [''],
      variableName: ['', Validators.required],
      frequency: [''],
      attribute: [''],
      offset: ['']
    });
    this.inputMappings.push(variableGroup);

  }

  addInputonPatch(variable: any) {
    const variableGroup = this.fb.group({
      type: [variable.type],
      variableName: [variable.variableName, Validators.required],
      frequency: [variable.frequency],
      attribute: [variable.attribute],
      offset: [variable.offset]
    });
    this.inputMappings.push(variableGroup);
  }


  /**
 * Handles the change event for the input and checks for duplicates.
 * Logs the response or error using the logger service.
 *
 * @param {index} - Index of current input item.
 * @returns {void}
 */
  checkDuplicateVariableName(index: number): void {
    const variableName = this.inputMappings.at(index).get('variableName')?.value;
    const isDuplicate = this.inputMappings.controls.some((control, idx) => {
      if (idx !== index) {
        return control.get('variableName')?.value === variableName;
      }
      return false;
    });

    this.isDuplicateError[index] = isDuplicate;

    if (isDuplicate) {
      // You can also set the form control as invalid or show a toast
      this.inputMappings
        .at(index)
        .get('variableName')
        ?.setErrors({ duplicate: true });
    }
  }


  onRemoveVaribale(index: number) {
    this.inputMappings.removeAt(index);
  }
}
