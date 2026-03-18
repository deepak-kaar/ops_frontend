import { Component, ViewEncapsulation } from '@angular/core';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-flag',
  standalone: false,
  templateUrl: './create-flag.component.html',
  styleUrl: './create-flag.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CreateFlagComponent {
  activeStep: number = 1;
  entityList: any[] = []; // List of entities fetched from the server.
  instanceList: any[] = []; // List of instances fetched from the server.
  entityOrInstanceList: any[] = []; // List of entityOrInstanceList fetched from the server.
  variableForm: FormGroup; //Reactive form group for managing the variables.
  expressionsForm!: FormGroup; //Reactive form group for managing the expressions.
  flagForm!: FormGroup;
  value: any;
  types = [{ name: 'Entity' }, { name: 'Instance' }];
  isDuplicateError: boolean[] = []; // Track duplicate errors for each variable
  entities?: any[];
  selectedType?: string;
  selectedEntity?: any;
  selectedAttribute: any;
  attributes: any[] = [];
  flagSeverity = [
    { name: 'Critical', id: 'critical' },
    { name: 'High', id: 'high' },
    { name: 'Medium', id: 'medium' },
    { name: 'Low', id: 'low' },
    { name: 'Info', id: 'info' },
  ];

  editorOptions = {
    theme: 'vs-dark', language: 'javascript',
    automaticLayout: true
  };

  values = ['Constant', 'Variables', 'Expression'];
  appData: any;
  //List of possible operators

  operators = [
    {
      key: 'lessThan',
      name: 'less than',
      operator: '<',
    },
    {
      key: 'lessThanOrEqual',
      name: 'less than or equal',
      operator: '<=',
    },
    {
      key: 'greaterThan',
      name: 'greater than',
      operator: '>',
    },
    {
      key: 'greaterThanOrEqual',
      name: 'greater than or equal',
      operator: '>=',
    },
    {
      key: 'equalTo',
      name: 'equal to',
      operator: '==',
    },
    {
      key: 'notEqualTo',
      name: 'not equal to',
      operator: '!=',
    },
  ];
  stateOptions: any[] = [
    { label: 'AND', value: 'AND' },
    { label: 'OR', value: 'OR' },
  ];


  aOperators = ['+', '-', '*', '%', '/'];

  expressionOpt = ['Flow Editor', 'Code Editor'];
  expressionVal: any;
  flagGroup = {
    flagName: ['', Validators.required],
    description: ['', Validators.required],
    flagLevel: ['Opsinsight', Validators.required],
    flagLevelName: [''],
    flagOrgLevel: ['']
  };

  constructor(
    private fb: FormBuilder,
    private datapointAdminService: DatapointAdministrationService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private messageService: MessageService
  ) {

    this.expressionVal = this.expressionOpt[0];
    this.variableForm = this.fb.group({
      variables: this.fb.array([]),
    });

    // Initialize the main form group
    this.expressionsForm = this.fb.group({
      expressions: this.fb.array([]), // Array of expressions
    });
    // Initialize the flag form group

    this.flagForm = this.fb.group(this.flagGroup);

    // Optionally add the first expression by default
    this.addExpression();

    this.onAddVariable();
    // Optionally add the first flag by default
    // this.onAddFlag();

    this.appData = this.router.getCurrentNavigation()?.extras.state;
  }

  ngOnInit(): void {
    this.expressionVal = this.expressionOpt[0];
    this.getDatas();
    if (this.appData?.appId) {
      this.flagForm.patchValue({
        flagLevel: 'Application',
        flagLevelName: this.appData?.appId,
        flagOrgLevel: this.appData?.orgId || ''
      });
    }
  }

  /**
   * Getter for the `atrributes` form array.
   * @returns {FormArray} The form array containing attribute form groups.
   */
  get flags(): FormArray {
    return this.flagForm?.get('flags') as FormArray;
  }

  onAddFlag() {
    const flagGroup = this.fb.group({
      operator: ['', Validators.required],
      value: ['', Validators.required],
      servity: ['', Validators.required],
      message: ['', Validators.required],
    });
    this.flags.push(flagGroup);
  }

  onRemoveFlag(index: number) {
    this.flags.removeAt(index);
  }

  /**
   * Getter for the `atrributes` form array.
   * @returns {FormArray} The form array containing attribute form groups.
   */
  get variables(): FormArray {
    return this.variableForm?.get('variables') as FormArray;
  }

  onAddVariable() {
    const variableGroup = this.fb.group({
      type: [''],
      variableName: ['', Validators.required],
      frequency: [''],
      attribute: [''],
      offset: ['']
      // entityOrInstance: ['', Validators.required],
      // rightAssignmentValue:['', Validators.required],
      // attribute: ['', Validators.required],
      // attributeList: [[]], // Initialize with an empty list
      // entityOrInstanceList: [[]], // Initialize with an empty list
    });
    this.variables.push(variableGroup);
  }

  onRemoveVaribale(index: number) {
    this.variables.removeAt(index);
  }

  // Getter to access the expressions FormArray
  get expressions(): FormArray {
    return this.expressionsForm?.get('expressions') as FormArray;
  }

  // Getter to access the conditions FormArray of a specific expression
  conditions(expressionIndex: number): FormArray {
    return this.expressions.at(expressionIndex).get('conditions') as FormArray;
  }

  // Add a new expression
  addExpression(): void {
    const expressionGroup = this.fb.group({
      editorType: ['Flow Editor'],
      severity: ['', Validators.required],
      conditions: this.fb.array([]), // Initialize an empty array for conditions
      expressionOperator: ['ELSE IF', Validators.required],
      outputMessage: [''],
      code: ['']
    });

    this.expressions.push(expressionGroup);

    // Add a default condition to the new expression
    this.addCondition(this.expressions.length - 1);
  }

  // Add a new condition to a specific expression
  addCondition(expressionIndex: number): void {
    const conditionGroup = this.fb.group({
      leftValueType: ['Variables', Validators.required],
      leftAssignmentVariable: ['', Validators.required],
      operator: ['', Validators.required],
      rightAssignmentVariable: [''],
      rightAssignmentValue: ['', Validators.required],
      rightValueType: ['Variables', Validators.required],
      conditionOperator: ['AND', Validators.required],
    });
    this.conditions(expressionIndex).push(conditionGroup);
  }

  // Remove a specific condition from an expression
  removeCondition(expressionIndex: number, conditionIndex: number): void {
    this.conditions(expressionIndex).removeAt(conditionIndex);
  }

  // Remove an entire expression
  removeExpression(expressionIndex: number): void {
    this.expressions.removeAt(expressionIndex);
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
      this.datapointAdminService.getEntityList(payload),
      this.datapointAdminService.getInstanceList(payload),
    ]).subscribe({
      next: ([res1, res2]) => {
        this.spinner.hide();
        this.entityList = res1.Entity_Attributes.map((res: any) => ({
          entityName: res.entityName,
          type: res.type,
          entityOrInstanceId: res.entityId
        }));
        this.instanceList = res2.Instances.map((res: any) => ({
          entityName: res.instanceName,
          type: res.type,
          entityOrInstanceId: res.instanceId
        }));

      },
      error: (err: any) => {
        this.spinner.hide();
      },
    });
  }
  onSaveFlag() {
    if (
      this.flagForm.valid &&
      this.variableForm.valid &&
      this.expressionsForm.valid
    ) {
      const payload = this.generateFlagPayload();

      this.spinner.show();
      this.datapointAdminService.postFlag(payload).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Flag created succesfully',
            life: 5000,
          });
          this.flagForm.reset();
          this.variableForm.reset();
          this.expressionsForm.reset();
          this.activeStep = 1;
        },
        error: (err: any) => {
          this.spinner.hide();
        },
      });
    } else {
      this.flagForm.markAllAsTouched();
      this.variableForm.markAllAsTouched();
      this.expressionsForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Fill out the required fields',
        life: 5000,
      });
    }
  }
  generateFlagPayload(): any {
    const flagData = this.flagForm.value;
    const variablesData = this.variableForm.value.variables;
    const expressionsData = this.expressionsForm.value.expressions;

    const payload = {
      flagName: flagData.flagName,
      flagDesc: flagData.description,
      // flagSeverity: flagData.severity.name,
      flagLevel: flagData.flagLevel,
      flagLevelName: flagData.flagLevelName,
      flagOrgLevel: flagData.flagOrgLevel || null,
      flagVariables: variablesData.map((variable: any) => ({
        variableName: variable.variableName,
        type: variable.type,
        frequency: variable.frequency,
        typeName: '',
        offset: variable.offset,
        // entityOrInstance: variable.entityOrInstance.entityOrInstanceId,
        attribute: variable.attribute,
      })),
      flagExpressions: expressionsData.map(
        (expression: any, index: number) => ({
          expressionName: `Expression ${index + 1}`,
          code: expression.code,
          editorType: expression.editorType,
          severity: expression.severity,
          outputMessage: expression.outputMessage,
          conditions: expression.conditions.map(
            (condition: any, conditionIndex: number) => ({
              leftValueType: condition.leftValueType,
              leftAssignmentVariable: condition.leftAssignmentVariable,
              leftAssignmentValue: condition.leftAssignmentVariable,
              operator: condition.operator.key,
              rightValueType: condition.rightValueType,
              rightAssignmentVariable: condition.rightAssignmentVariable,
              rightAssignmentValue: condition.rightAssignmentVariable,
              conditionalOperator:
                conditionIndex === expression.conditions.length - 1
                  ? ''
                  : condition.conditionOperator,
            })
          ),
          expressionOperator:
            index === expressionsData.length - 1
              ? 'IF'
              : expression.expressionOperator,
        })
      ),
    };
    return payload;
  }
  /**
   * Handles the change event for the dropdown and fetches entity details by ID.
   * Sets the `isShowAttribute` flag to true and assigns the attributes of the fetched entity to `entityDetails`.
   * Logs the response or error using the logger service.
   *
   * @param {DropdownChangeEvent} event - The dropdown change event containing the selected entity's details.
   * @returns {void}
   */
  getTypeData(event: DropdownChangeEvent, formArrayIndex: number) {
    if (event.value) {
      const selectedType = event.value.name;

      // Get the form group for the current item
      const formGroup = this.variables.at(formArrayIndex);

      // Update the `entityOrInstanceList` based on the selected type
      if (selectedType === 'Entity') {
        formGroup.get('entityOrInstanceList')?.setValue(this.entityList);
      } else {
        formGroup.get('entityOrInstanceList')?.setValue(this.instanceList);
      }

      // Reset the `entityOrInstance` to null
      formGroup.get('entityOrInstance')?.setValue(null);
      // Reset the `attributeList` to null
      formGroup.get('attributeList')?.setValue(null);
    }
  }
  /**
   * Handles the change event for the dropdown and fetches entity details by ID.
   * Logs the response or error using the logger service.
   *
   * @param {DropdownChangeEvent} event - The dropdown change event containing the selected entity's details.
   * @returns {void}
   */
  getEntityData(event: DropdownChangeEvent, formArrayIndex: number): void {
    if (event.value) {
      this.spinner.show();
      let serviceCall: any;
      if (event.value.type === 'Entity') {
        serviceCall = this.datapointAdminService.getEntityDetailsById(event.value.entityOrInstanceId);
      } else if (event.value.type === 'Instance') {
        serviceCall = this.datapointAdminService.getInstanceDetailsById(event.value.entityOrInstanceId);
      }

      serviceCall.subscribe({
        next: (res: any) => {
          this.spinner.hide();
          // this.attributes = res.attributes;
          const attributes = res.attributes;
          // Get the form group for the current item
          const formGroup = this.variables.at(formArrayIndex);
          // Update the `attributeList` based on the EntityOrInstance
          formGroup.get('attributeList')?.setValue(attributes);
        },
        error: (err: any) => {
          this.spinner.hide();
        },
      });
    }
  }
  /**
   * Handles the change event for the input and checks for duplicates.
   * Logs the response or error using the logger service.
   *
   * @param {index} - Index of current input item.
   * @returns {void}
   */
  checkDuplicateVariableName(index: number): void {
    const variableName = this.variables.at(index).get('variableName')?.value;
    const isDuplicate = this.variables.controls.some((control, idx) => {
      if (idx !== index) {
        return control.get('variableName')?.value === variableName;
      }
      return false;
    });

    this.isDuplicateError[index] = isDuplicate;

    if (isDuplicate) {
      // You can also set the form control as invalid or show a toast
      this.variables
        .at(index)
        .get('variableName')
        ?.setErrors({ duplicate: true });
    }
  }
}
