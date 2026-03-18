import { Component, Input, OnInit, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatapointAdministrationService } from 'src/app/modules/datapoint-administration/datapoint-administration.service';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';

@Component({
    selector: 'app-create-flags-new',
    standalone: false,
    templateUrl: './create-flags-new.component.html',
    styleUrl: './create-flags-new.component.css'
})
export class CreateFlagsNewComponent implements OnInit, OnChanges {
    activeStep: number = 1;
    flagForm!: FormGroup;
    variableForm!: FormGroup;
    expressionForm!: FormGroup;
    @Input() flagId!: string;
    @Output() flagUpdated = new EventEmitter<void>();

    flagSeverity = [
        { name: 'Critical', id: 'critical' },
        { name: 'High', id: 'high' },
        { name: 'Medium', id: 'medium' },
        { name: 'Low', id: 'low' },
        { name: 'Info', id: 'info' },
    ];

    expressionOptions = ['Flow Editor', 'Code Editor'];
    editorOptions = { theme: 'vs-dark', language: 'javascript', automaticLayout: true };
    valueTypes = ['Constant', 'Variables', 'Expression'];
    operators = [
        { name: 'less than', operator: '<', key: 'lessThan' },
        { name: 'less than or equal', operator: '<=', key: 'lessThanOrEqual' },
        { name: 'greater than', operator: '>', key: 'greaterThan' },
        { name: 'greater than or equal', operator: '>=', key: 'greaterThanOrEqual' },
        { name: 'equal to', operator: '==', key: 'equalTo' },
        { name: 'not equal to', operator: '!=', key: 'notEqualTo' },
    ];
    logicalOptions = [
        { label: 'AND', value: 'AND' },
        { label: 'OR', value: 'OR' },
    ];

    breakPointForToastComponent = breakPointForToastComponent;
    appData: any;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService,
        private spinner: NgxSpinnerService,
        private dataPointService: DatapointAdministrationService
    ) {
        this.appData = this.router.getCurrentNavigation()?.extras.state;
    }

    ngOnInit() {
        this.initForms();
    }

    ngOnChanges() {
        if (this.flagId) {
            this.getFlag(this.flagId);
        }
    }

    initForms() {
        this.flagForm = this.fb.group({
            flagName: ['', Validators.required],
            description: ['', Validators.required]
        });

        this.variableForm = this.fb.group({
            variables: this.fb.array([])
        });

        this.expressionForm = this.fb.group({
            expressions: this.fb.array([])
        });

        if (!this.flagId) {
            this.addVariable();
            this.addExpression();
        }
    }

    get variables(): FormArray {
        return this.variableForm.get('variables') as FormArray;
    }

    get expressions(): FormArray {
        return this.expressionForm.get('expressions') as FormArray;
    }

    getConditionsControls(expressionIndex: number): any[] {
        const conditions = this.expressions.at(expressionIndex).get('conditions') as FormArray;
        return conditions ? conditions.controls : [];
    }

    addVariable() {
        const variableGroup = this.fb.group({
            variableName: ['', Validators.required]
        });
        this.variables.push(variableGroup);
    }

    removeVariable(index: number) {
        this.variables.removeAt(index);
    }

    addExpression() {
        const expressionGroup = this.fb.group({
            severity: ['', Validators.required],
            editorType: ['Flow Editor'],
            conditions: this.fb.array([]),
            code: [''],
            outputMessage: ['']
        });
        this.expressions.push(expressionGroup);
        this.addCondition(this.expressions.length - 1);
        
        // Scroll to the newly created expression card
        setTimeout(() => {
            const newCardIndex = this.expressions.length - 1;
            const cardElement = document.querySelector(`[formgroupname="${newCardIndex}"]`);
            if (cardElement) {
                cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    addCondition(expressionIndex: number) {
        const conditions = this.expressions.at(expressionIndex).get('conditions') as FormArray;
        const conditionGroup = this.fb.group({
            leftValueType: ['Variables', Validators.required],
            leftValue: ['', Validators.required],
            operator: ['', Validators.required],
            rightValueType: ['Variables', Validators.required],
            rightValue: ['', Validators.required],
            conditionOperator: ['AND']
        });
        conditions.push(conditionGroup);
    }

    removeCondition(expressionIndex: number, conditionIndex: number) {
        const conditions = this.expressions.at(expressionIndex).get('conditions') as FormArray;
        conditions.removeAt(conditionIndex);
    }

    removeExpression(index: number) {
        this.expressions.removeAt(index);
    }

    goBack() {
        window.history.back();
    }

    // ✅ Navigate to specific step and update activeStep
    goToStep(step: number, activateCallback: Function) {
        this.activeStep = step;
        activateCallback(step);
    }

    onCancel() {
        this.goBack();
    }

    onSubmit() {
        if (this.flagForm.valid && this.variableForm.valid && this.expressionForm.valid) {
            const payload = this.generateFlagPayload();
            this.spinner.show();

            const apiCall = this.flagId
                ? this.dataPointService.updateFlag(payload)
                : this.dataPointService.postFlag(payload);

            apiCall.subscribe({
                next: (res: any) => {
                    this.spinner.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Flag ${this.flagId ? 'updated' : 'created'} successfully`,
                        life: 5000,
                    });
                    if (this.flagId) {
                        this.flagUpdated.emit();
                    } else {
                        this.flagForm.reset();
                        this.variableForm.reset();
                        this.expressionForm.reset();
                        this.activeStep = 1;
                        setTimeout(() => this.goBack(), 1500);
                    }
                },
                error: (err: any) => {
                    this.spinner.hide();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Failed to ${this.flagId ? 'update' : 'create'} flag`,
                        life: 5000,
                    });
                },
            });
        } else {
            this.flagForm.markAllAsTouched();
            this.variableForm.markAllAsTouched();
            this.expressionForm.markAllAsTouched();
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields' });
        }
    }
    // Add this method to your component
    onStepChange(step: number | undefined) {
        if (step !== undefined) {
            this.activeStep = step;
        }
    }


    getFlag(flagId: string) {
        this.spinner.show();
        this.dataPointService.getFlagDetails(flagId).subscribe({
            next: (res: any) => {
                this.spinner.hide();
                if (res?.Flag) {
                    this.patchValue(res.Flag);
                } else if (res?.flagJson?.[0]) {
                    this.patchValue(res.flagJson[0]);
                }
            },
            error: (err) => {
                this.spinner.hide();
            }
        });
    }

    patchValue(data: any) {
        if (!data) return;
        
        // Clear existing arrays first
        this.variables.clear();
        this.expressions.clear();
        
        this.flagForm.patchValue({
            flagName: data.flagName || '',
            description: data.flagDesc || ''
        });
        
        // Add variables first
        if (data.flagVariables?.length) {
            data.flagVariables.forEach((variable: any) => this.addVariableOnPatch(variable));
        }
        
        // Then add expressions after variables are loaded
        if (data.flagExpressions?.length) {
            setTimeout(() => {
                data.flagExpressions.forEach((expression: any) => this.addExpressionOnPatch(expression));
            }, 0);
        }
    }

    addVariableOnPatch(variable: any) {
        const variableGroup = this.fb.group({
            variableName: [variable.variableName, Validators.required]
        });
        this.variables.push(variableGroup);
    }

    addExpressionOnPatch(expression: any) {
        
        console.log(expression);
        
        // Find matching severity object
        const severityObj = this.flagSeverity.find(s => 
            s.id === expression.severity.id || s.name === expression.severity.name
        );
    
        console.log(severityObj);
        
        const expressionGroup = this.fb.group({
            severity: [severityObj || '', Validators.required],
            editorType: [expression.editorType || 'Flow Editor'],
            conditions: this.fb.array([]),
            code: [expression.code || ''],
            outputMessage: [expression.outputMessage || '']
        });
        this.expressions.push(expressionGroup);
        
        expression.conditions?.forEach((condition: any) => {
            this.addConditionOnPatch(this.expressions.length - 1, condition);
        });
    }

    addConditionOnPatch(expressionIndex: number, condition: any) {
        const conditions = this.expressions.at(expressionIndex).get('conditions') as FormArray;
        
        // Find matching operator object
        const operatorObj = this.operators.find(op => 
            op.key === condition.operator || op.operator === condition.operator
        );
        
        // Get variable names from condition
        const leftVarName =  condition.leftValue || condition.leftAssignmentVariable;
        const rightVarName = condition.rightValue || condition.rightAssignmentVariable;
        
        const conditionGroup = this.fb.group({
            leftValueType: [condition.leftValueType || 'Variables', Validators.required],
            leftValue: [leftVarName, Validators.required],
            operator: [operatorObj || '', Validators.required],
            rightValueType: [condition.rightValueType || 'Variables', Validators.required],
            rightValue: [rightVarName, Validators.required],
            conditionOperator: [condition.conditionOperator || condition.conditionalOperator || 'AND']
        });
        conditions.push(conditionGroup);
    }

    generateFlagPayload(): any {
        const flagData = this.flagForm.value;
        const variablesData = this.variableForm.value.variables;
        const expressionsData = this.expressionForm.value.expressions;

        const payload = {
            ...(this.flagId && { flagId: this.flagId }),
            flagName: flagData.flagName,
            flagDesc: flagData.description,
            flagLevel: this.appData?.appId ? 'Application' : 'Opsinsight',
            flagLevelName: this.appData?.appId || 'Opsinsight',
            flagOrgLevel: this.appData?.orgId || null,
            flagVariables: variablesData.map((variable: any) => ({
                variableName: variable.variableName,
                type: '',
                frequency: '',
                typeName: '',
                offset: '',
                attribute: '',
            })),
            flagCategories: this.flagId ? undefined : {}, // Initialize for new flags
            flagExpressions: expressionsData.map((expression: any, index: number) => ({
                expressionName: `Expression ${index + 1}`,
                code: expression.code,
                editorType: expression.editorType,
                severity: expression.severity,
                outputMessage: expression.outputMessage,
                conditions: expression.conditions.map((condition: any, conditionIndex: number) => ({
                    leftValueType: condition.leftValueType,
                    leftAssignmentVariable: condition.leftValue,
                    leftAssignmentValue: condition.leftValue,
                    operator: condition.operator.key,
                    rightValueType: condition.rightValueType,
                    rightAssignmentVariable: condition.rightValue,
                    rightAssignmentValue: condition.rightValue,
                    conditionalOperator: conditionIndex === expression.conditions.length - 1 ? '' : condition.conditionOperator,
                })),
                expressionOperator: index === expressionsData.length - 1 ? 'IF' : 'ELSE IF',
            })),
        };
        return payload;
    }
}
