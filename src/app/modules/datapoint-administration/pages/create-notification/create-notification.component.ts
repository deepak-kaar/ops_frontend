import { Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { MessageService } from 'primeng/api';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
  selector: 'app-create-notification',
  standalone: false,
  templateUrl: './create-notification.component.html',
  styleUrl: './create-notification.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CreateNotificationComponent {

  notificationForm: FormGroup;
  notifTypes = ['SMS', 'APP', 'EMAIL'];
  editorOptions = {
    theme: 'vs-dark', language: 'html',
    automaticLayout: true
  };
  appData: any;
  isDuplicateError: boolean[] = []; // Track duplicate errors for each variable

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
    private spinner: NgxSpinnerService) {
    this.notificationForm = this.fb.group({
      notificationName: new FormControl<string>('', Validators.required),
      notificationDescription: new FormControl<string>(''),
      notificationType: new FormControl<string>('', Validators.required),
      notificationBody: new FormControl<string>('', Validators.required),
      notificationLevel: new FormControl<string>(''),
      notificationLevelName: new FormControl<string>(''),
      notificationOrgLevel: new FormControl<string>(''),
      inputVariables: this.fb.array([])
    })

    this.appData = this.router.getCurrentNavigation()?.extras.state;
  }

  ngOnInit() {
    if (this.appData?.appId) {
      this.notificationForm.patchValue({
        notificationLevel: 'Application',
        notificationLevelName: this.appData?.appId,
        notificationOrgLevel: this.appData?.orgId || ''
      });
    }

    this.addInputVariable()
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
      console.log(this.notificationForm.getRawValue());
      this.dataPointAdminService.postNotification(this.notificationForm.value).subscribe({
        next: (res: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Notification created successfully',
            life: 5000,
          })
          this.notificationForm?.reset();
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
