import { Component, Input } from '@angular/core';
import { DatapointAdministrationService } from '../../datapoint-administration.service';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-manage-flag',
  standalone: false,
  templateUrl: './manage-flag.component.html',
  styleUrl: './manage-flag.component.css'
})
export class ManageFlagComponent {
  @Input() flagId!: string;
  activeStep: number = 1;
  entityList: any[] = []; // List of entities fetched from the server.
  instanceList: any[] = []; // List of instances fetched from the server.
  entityOrInstanceList: any[] = []; // List of entityOrInstanceList fetched from the server.
  variableForm: FormGroup; //Reactive form group for managing the variables.
  expressionsForm!: FormGroup; //Reactive form group for managing the expressions.
  flagForm!: FormGroup;
  value: any;
  isDuplicateError: boolean[] = []; // Track duplicate errors for each variable
  types = [{ name: 'Entity' }, { name: 'Instance' }];
  entities?: any[];
  selectedType?: string;
  selectedEntity?: any;
  selectedAttribute: any;
  attributes: any[] = [];
  flagSeverity = [
    { name: 'Red', id: 'red' },
    { name: 'Green', id: 'green' },
    { name: 'Yellow', id: 'yellow' },
    { name: 'Orange', id: 'orange' },
  ];
  variables_list: any[] = []
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
  flagGroup = {
    flagName: ['', Validators.required],
    severity: ['', Validators.required],
    description: ['', Validators.required],
  };
  appData: any;

  constructor(
    private fb: FormBuilder,
    private datapointAdminService: DatapointAdministrationService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private messageService: MessageService
  ) {
    // this.activateRoute.paramMap.subscribe((params: any) => {
    //   this.flagId = params.params.id;
    // });

    this.variableForm = this.fb.group({
      variables: this.fb.array([]),
    });

    // Initialize the main form group
    this.expressionsForm = this.fb.group({
      expressions: this.fb.array([]), // Array of expressions
    });
    // Initialize the flag form group

    this.flagForm = this.fb.group(this.flagGroup);
    this.appData = this.router.getCurrentNavigation()?.extras.state;
  }

  ngOnInit(): void {
    this.getDatas();
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
      type: ['', Validators.required],
      variableName: ['', Validators.required],
      entityOrInstance: ['', Validators.required],
      attribute: ['', Validators.required],
      attributeList: [[]], // Initialize with an empty list
      entityOrInstanceList: [[]], // Initialize with an empty list
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
      conditions: this.fb.array([]), // Initialize an empty array for conditions
      expressionOperator: ['AND', Validators.required],
    });

    this.expressions.push(expressionGroup);

    // Add a default condition to the new expression
    this.addCondition(this.expressions.length - 1);
  }

  // Add a new condition to a specific expression
  addCondition(expressionIndex: number): void {
    const conditionGroup = this.fb.group({
      type: ['Entity', Validators.required],
      leftAssignmentVariable: ['', Validators.required],
      operator: ['', Validators.required],
      rightAssignmentVariable: ['', Validators.required],
      rightAssignmentValue: ['', Validators.required],
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
        this.getFlagDetails();
      },
      error: (err: any) => {
        this.spinner.hide();
      },
    });
  }
  onUpdateFlag() {
    if (
      this.flagForm.valid &&
      this.variableForm.valid &&
      this.expressionsForm.valid
    ) {
      const payload = this.generateFlagPayload();

      this.spinner.show();
      this.datapointAdminService.updateFlag(payload).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Flag details Updated succesfully',
            life: 5000,
          });
          // this.flagForm.reset();
          // this.variableForm.reset();
          // this.expressionsForm.reset();
          // this.activeStep = 0;
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
      flagId: this.flagId,
      flagName: flagData.flagName,
      flagDesc: flagData.description,
      flagSeverity: flagData.severity.name,
      flagVariables: variablesData.map((variable: any) => ({
        variableName: variable.variableName,
        type: variable.type.name,
        entityOrInstance: variable.entityOrInstance.entityOrInstanceId,
        attribute: variable.attribute.attributeId,
      })),
      flagExpressions: expressionsData.map(
        (expression: any, index: number) => ({
          expressionName: `Expression ${index + 1}`,
          conditions: expression.conditions.map(
            (condition: any, conditionIndex: number) => ({
              variable: condition.leftAssignmentVariable.variableName,
              valueType: 'value', //TODO: Later replace this with the actual type
              operator: condition.operator.key,
              valueOrVariable: condition.rightAssignmentValue,
              conditionalOperator:
                conditionIndex === expression.conditions.length - 1
                  ? ''
                  : condition.conditionOperator,
            })
          ),
          expressionOperator:
            index === expressionsData.length - 1
              ? ''
              : expression.expressionOperator,
        })
      ),
    };
    return payload;
  }
  /**
   * Handles the change event for the dropdown and assigns entityOrInstanceList.
   *.
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
      let serviceCall: any
      if (event.value.type === 'Entity') {
        serviceCall = this.datapointAdminService.getEntityDetailsById(event.value.entityOrInstanceId);
      } else if (event.value.type === 'Instance') {
        serviceCall = this.datapointAdminService.getInstanceDetailsById(event.value.entityOrInstanceId);
      }
      serviceCall
        .subscribe({
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
            console.error(err);
          },
        });
    }
  }
  getFlagDetails() {
    this.datapointAdminService.getFlagDetails(this.flagId).subscribe({
      next: (res: any) => {
        this.variables_list = res.flagJson[0].flagVariables
        this.populateFormWithFlagData(res.flagJson[0]);
      },
      error: (err: any) => {
      },
    });
  }

  populateFormWithFlagData(flagData: any): void {
    // Set flag name, description, and severity
    this.setFlagFormValues(flagData);

    // Populate the flag variables
    this.populateVariables(flagData.flagVariables);

    // Populate the expressions
    this.populateExpressions(flagData.flagExpressions);
  }

  setFlagFormValues(flagData: any): void {
    this.flagForm.patchValue({
      flagName: flagData.flagName,
      description: flagData.flagDesc,
      severity: this.flagSeverity.find(
        (severity) => severity.name === flagData.flagSeverity
      ),
    });
  }

  populateVariables(variablesData: any[]): void {
    // this.variableForm.setControl('variables', this.fb.array([]));
    variablesData.forEach((variable: any) => this.addVariableToForm(variable));
  }

  populateExpressions(expressionsData: any[]): void {
    // this.expressionsForm.setControl('expressions', this.fb.array([]));
    expressionsData.forEach((expression: any) =>
      this.addExpressionToForm(expression)
    );
  }

  addVariableToForm(variable: any): void {
    // Choose the correct entity or instance list based on the variable type
    const entityOrInstanceList =
      variable.type === 'Entity' ? this.entityList : this.instanceList;

    // Find the selected entity or instance
    const selectedEntityOrInstance = entityOrInstanceList.find(
      (entityOrInstance: any) =>
        entityOrInstance.entityOrInstanceId === variable.entityOrInstance
    );

    if (!selectedEntityOrInstance) {
      console.error('Selected Entity/Instance not found.');
      return;
    }

    // Fetch entity details for attributes
    this.fetchEntityAttributes(variable.entityOrInstance, variable.type, (res: any) => {
      const attribute = res.attributes.find(
        (attribute: any) => attribute.attributeId === variable.attribute
      );

      if (!attribute) {
        console.error('Selected Attribute not found.');
        return;
      }

      const variableGroup = this.createVariableFormGroup(
        variable,
        selectedEntityOrInstance,
        attribute,
        res.attributes,
        entityOrInstanceList
      );
      this.variables.push(variableGroup);
    });
  }

  fetchEntityAttributes(
    entityOrInstanceId: string,
    type: string,
    callback: (res: any) => void
  ): void {
    this.spinner.show();
    let serviceCall: any;
    if (type === 'Entity') {
      serviceCall = this.datapointAdminService.getEntityDetailsById(entityOrInstanceId);
    } else if (type === 'Instance') {
      serviceCall = this.datapointAdminService.getInstanceDetailsById(entityOrInstanceId);
    }
    serviceCall.subscribe({
      next: (res: any) => {
        this.spinner.hide();
        callback(res);
      },
      error: (err: any) => {
        this.spinner.hide();
        console.error(err);
      },
    });
  }

  createVariableFormGroup(
    variable: any,
    selectedEntityOrInstance: any,
    attribute: any,
    attributes: any[],
    entityOrInstanceList: any[]
  ): FormGroup {
    return this.fb.group({
      type: [
        this.types.find((type) => type.name === variable.type),
        Validators.required,
      ],
      variableName: [variable.variableName, Validators.required],
      entityOrInstance: [selectedEntityOrInstance, Validators.required],
      attribute: [attribute, Validators.required],
      attributeList: [attributes], // List of attributes for the entity/instance
      entityOrInstanceList: [entityOrInstanceList], // List of possible entities or instances
    });
  }

  addExpressionToForm(expression: any): void {
    const expressionGroup = this.fb.group({
      conditions: this.fb.array([]), // Initialize an empty array for conditions
      expressionOperator: [
        expression.expressionOperator || 'AND',
        Validators.required,
      ],
    });

    expression.conditions.forEach((condition: any) =>
      this.addConditionToForm(expressionGroup, condition)
    );
    this.expressions.push(expressionGroup);
  }

  addConditionToForm(expressionGroup: FormGroup, condition: any): void {
    const selectedVariable = this.getSelectedVariableForCondition(condition);

    const conditionGroup = this.fb.group({
      // leftAssignmentVariable: [selectedVariable, Validators.required],
      leftAssignmentVariable: [selectedVariable, Validators.required],
      operator: [this.getOperatorForCondition(condition), Validators.required],
      rightAssignmentValue: [condition.valueOrVariable, Validators.required],
      conditionOperator: [
        condition.conditionalOperator || 'AND',
        Validators.required,
      ],
    });

    (expressionGroup.get('conditions') as FormArray).push(conditionGroup);
  }

  getSelectedVariableForCondition(condition: any): any {
    // const selectedVariable = this.variables?.value.find(
    //   (variable: any) => variable.variableName === condition.variable
    // );

    const selectedVariable = this.variables_list.find(
      (variable: any) => variable.variableName === condition.variable
    );
    //console.error(this.variables);

    if (!selectedVariable) {
      console.error(`Variable with name ${condition.variable} not found.`);
    }
    return selectedVariable;
  }

  getOperatorForCondition(condition: any): any {
    return this.operators.find((op) => op.key === condition.operator);
  }
  /**
   * Handles the change event for the input and checks for duplicates.
   * Logs the response or error using the logger service.
   *
   * @param index - Index of current input item.
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
