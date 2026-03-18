import { Component } from '@angular/core';
import { SchedulerjobAdministrationComponent } from '../../schedulerjob-administration.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-manage-schedulerjob',
  standalone: false,
  templateUrl: './manage-schedulerjob.component.html',
  styleUrl: './manage-schedulerjob.component.css'
})
export class ManageSchedulerjobComponent extends SchedulerjobAdministrationComponent {
  /**
      * @property {FormGroup} jobForm - Form group that holds application form controls.
      */
  jobForm: FormGroup;

  /**
   * @property {string} mode - stores the mode of this dialog.
   */
  mode: string = 'create';

  cronModeOptions = [
    { label: 'Every (*)', value: 'any' },
    { label: 'Fixed value', value: 'fixed' },
    { label: 'Range', value: 'range' },
    { label: 'Step (*/n)', value: 'step' }
  ];

  minuteOptions = [
    { label: '*', value: '*' },
    ...Array.from({ length: 60 }, (_, i) => ({
      label: i.toString(),
      value: i.toString(),
    })),
  ];

  hourOptions = [
    { label: '*', value: '*' },
    ...Array.from({ length: 24 }, (_, i) => ({
      label: i.toString(),
      value: i.toString(),
    })),
  ];

  dayOptions = [
    { label: '*', value: '*' },
    ...Array.from({ length: 31 }, (_, i) => ({
      label: (i + 1).toString(),
      value: (i + 1).toString(),
    })),
  ];

  monthOptions = [
    { label: '*', value: '*' },
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];
  dayOfWeekOptions = [
    { label: '*', value: '*' },
    { label: 'Sunday', value: '0' },
    { label: 'Monday', value: '1' },
    { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' },
    { label: 'Thursday', value: '4' },
    { label: 'Friday', value: '5' },
    { label: 'Saturday', value: '6' },
  ];

  // without * for ranges
  minuteOptionsNoStar = this.minuteOptions.filter(o => o.value !== '*');
  hourOptionsNoStar = this.hourOptions.filter(o => o.value !== '*');
  dayOptionsNoStar = this.dayOptions.filter(o => o.value !== '*');
  monthOptionsNoStar = this.monthOptions.filter(o => o.value !== '*');
  dayOfWeekOptionsNoStar = this.dayOfWeekOptions.filter(o => o.value !== '*');

  // Max days per month (let February be 29 to allow Feb 29 schedules)
  MAX_DAYS_PER_MONTH: Record<string, number> = {
    '1': 31,
    '2': 29, // Feb 29 allowed; 30,31 will still be invalid
    '3': 31,
    '4': 30,
    '5': 31,
    '6': 30,
    '7': 31,
    '8': 31,
    '9': 30,
    '10': 31,
    '11': 30,
    '12': 31
  };

  // For UI messages
  cronWarningMessage: string | null = null;   // partially invalid combos
  cronFatalErrorMessage: string | null = null; // fully invalid (job never runs)
  cronFatalError = false;                     // used to disable Save
  formInitialized = false;

  schedulerTypes: string[] = ['Email', 'Account Enabler'];

  /**
   * @constructor
   * @param {DynamicDialogConfig} dialogConfig - Configuration for the dynamic dialog.
   * @param {DynamicDialogRef} ref - Reference to the dynamic dialog instance.
   * @param {FormBuilder} fb - Form builder service for handling reactive forms.
   * @param {DatePipe} datePipe - Datepipe to handle date field.
   */
  constructor(public dialogConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    super();

    const appId = this.filterService.currentApp?.appId ?? '';
    const appName = this.filterService.currentApp?.appName ?? '';
    const orgId = this.filterService.currentOrg?.orgId ?? '';
    const orgName = this.filterService.currentOrg?.orgName ?? '';

    this.jobForm = this.fb.group({
      schedulerJobId: new FormControl<string>(''),
      schedulerJobName: new FormControl<string>('', [Validators.required]),
      schedulerJob: new FormControl<string>(''),
      jobDescription: new FormControl<string>(''),
      cronExpression: new FormControl<string>('', [Validators.required]),
      triggerName: new FormControl<string>(''),
      schedulerType: new FormControl<string>(''),

      // modes
      minuteMode: new FormControl<'any' | 'fixed' | 'range'>('any'),
      hourMode: new FormControl<'any' | 'fixed' | 'range'>('any'),
      dayOfMonthMode: new FormControl<'any' | 'fixed' | 'range'>('any'),
      monthMode: new FormControl<'any' | 'fixed' | 'range'>('any'),
      dayOfWeekMode: new FormControl<'any' | 'fixed' | 'range'>('any'),

      // existing single values
      minute: new FormControl<string>('*'),
      hour: new FormControl<string>('*'),
      dayOfMonth: new FormControl<string>('*'),
      month: new FormControl<string>('*'),
      dayOfWeek: new FormControl<string>('*'),

      // range from/to
      minuteFrom: new FormControl<string | null>(null),
      minuteTo: new FormControl<string | null>(null),

      hourFrom: new FormControl<string | null>(null),
      hourTo: new FormControl<string | null>(null),

      dayOfMonthFrom: new FormControl<string | null>(null),
      dayOfMonthTo: new FormControl<string | null>(null),

      monthFrom: new FormControl<string | null>(null),
      monthTo: new FormControl<string | null>(null),

      dayOfWeekFrom: new FormControl<string | null>(null),
      dayOfWeekTo: new FormControl<string | null>(null),

      // Step

      minuteStep: new FormControl<string | null>(null),
      hourStep: new FormControl<string | null>(null),
      dayOfMonthStep: new FormControl<string | null>(null),
      monthStep: new FormControl<string | null>(null),
      dayOfWeekStep: new FormControl<string | null>(null),

      inScheduled: new FormControl<boolean>(true),
      createdOn: new FormControl<Date>(new Date()),

      //AppID and OrgID
      appId: new FormControl<string>(appId),
      appName: new FormControl<string>(appName),
      orgId: new FormControl<string>(orgId),
      orgName: new FormControl<string>(orgName)
    });


    this.jobForm.valueChanges.subscribe(v => {
      if (this.formInitialized) {
        this.updateCronAndValidation();
      }
    });

    setTimeout(() => {
      this.formInitialized = true;
      this.updateCronAndValidation();  // Validate once after full init
    }, 0);


    if (this.dialogConfig.data.mode === 'edit') {
      this.mode = this.dialogConfig.data.mode;
      this.patchValue(this.dialogConfig.data?.jobData)
    }
  }

  private updateCronAndValidation(): void {
    const v = this.jobForm.value;

    // -------- build expressions (now including step) -------
    const minuteExpr = this.buildField(
      v.minuteMode,
      v.minute,
      v.minuteFrom,
      v.minuteTo,
      v.minuteStep
    );

    const hourExpr = this.buildField(
      v.hourMode,
      v.hour,
      v.hourFrom,
      v.hourTo,
      v.hourStep
    );

    const domExpr = this.buildField(
      v.dayOfMonthMode,
      v.dayOfMonth,
      v.dayOfMonthFrom,
      v.dayOfMonthTo,
      v.dayOfMonthStep
    );

    const monthExpr = this.buildField(
      v.monthMode,
      v.month,
      v.monthFrom,
      v.monthTo,
      v.monthStep
    );

    const dowExpr = this.buildField(
      v.dayOfWeekMode,
      v.dayOfWeek,
      v.dayOfWeekFrom,
      v.dayOfWeekTo,
      v.dayOfWeekStep
    );

    // -------- write cron field -------
    const cron = `${minuteExpr} ${hourExpr} ${domExpr} ${monthExpr} ${dowExpr}`;
    this.jobForm.get('cronExpression')?.setValue(cron, { emitEvent: false });

    // -------- reset UI messages -------
    this.cronWarningMessage = null;
    this.cronFatalErrorMessage = null;
    this.cronFatalError = false;

    const cronCtrl = this.jobForm.get('cronExpression');

    // clear previous step/date errors
    if (cronCtrl?.errors) {
      const e = { ...cronCtrl.errors };
      delete e['invalidStep'];
      delete e['invalidDateCombo'];
      cronCtrl.setErrors(Object.keys(e).length ? e : null);
    }

    // -------------------------------
    // STEP VALIDATION
    // -------------------------------

    const stepErrors: string[] = [];

    const validateStep = (label: string, stepValue: string | null, max: number) => {
      if (!stepValue) return;

      const n = Number(stepValue);

      if (Number.isNaN(n)) {
        stepErrors.push(`${label}: step must be a number`);
        return;
      }

      if (!Number.isInteger(n)) {
        stepErrors.push(`${label}: step must be an integer`);
        return;
      }

      if (n <= 0) {
        stepErrors.push(`${label}: step must be greater than zero`);
        return;
      }

      if (n === 1) {
        stepErrors.push(`${label}: step of 1 is the same as every (*)`);
        return;
      }

      if (n > max) {
        stepErrors.push(`${label}: step cannot be greater than ${max}`);
        return;
      }
    };

    if (v.minuteMode === 'step') validateStep('Minute', v.minuteStep, 59);
    if (v.hourMode === 'step') validateStep('Hour', v.hourStep, 23);
    if (v.dayOfMonthMode === 'step') validateStep('Day of Month', v.dayOfMonthStep, 31);
    if (v.monthMode === 'step') validateStep('Month', v.monthStep, 12);
    if (v.dayOfWeekMode === 'step') validateStep('Day of Week', v.dayOfWeekStep, 7);

    // if step invalid → block save + show message
    if (stepErrors.length > 0) {
      this.cronFatalError = true;
      this.cronFatalErrorMessage = stepErrors.join(' | ');
      cronCtrl?.setErrors({ ...(cronCtrl.errors || {}), invalidStep: true });
      return;
    }

    // -------------------------------
    // DAY-MONTH VALIDATION (your logic)
    // -------------------------------
    const analysis = this.validateDayMonth(domExpr, monthExpr);

    if (!analysis) return;

    const invalidMonths = analysis.invalid.map(i =>
      this.monthOptions.find(m => m.value === i.month)?.label ?? i.month
    );

    // fully invalid
    if (analysis.valid.length === 0) {
      this.cronFatalError = true;
      this.cronFatalErrorMessage =
        'Selected combination of day(s) and month(s) never occurs in the calendar. This job will never run.';

      cronCtrl?.setErrors({ ...(cronCtrl.errors || {}), invalidDateCombo: true });
    }
    // partially invalid
    else if (invalidMonths.length > 0) {
      this.cronWarningMessage =
        'Note: the job will not run in ' +
        invalidMonths.join(', ') +
        ' because those month(s) do not contain all selected day(s).';
    }
  }



  /**
   * Validates the jobForm.
   * It its not valid shows a toast message with error
   * @returns {void} - returns nothing (i.e) void
   */
  saveJob(): void {
    if (this.jobForm.valid) {
      const payload = this.jobForm.value;
      if (this.mode == 'create') {
        this.schedulerjobAdministrationService.postJob(payload).subscribe({
          next: (res: any) => {
            this.ref.close({ status: true });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While creating job", life: 3000 });
          }
        });
      } else {
        this.schedulerjobAdministrationService.putJob(payload, payload.schedulerJobId).subscribe({
          next: (res: any) => {
            this.ref.close({ status: true });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Error While editing job", life: 3000 });
          }
        });
      }


    }
  }

  private parseField(expr: string) {
    if (expr === '*' || !expr) {
      return { mode: 'any', single: '*', from: null, to: null };
    }

    if (expr.includes('-')) {
      const [from, to] = expr.split('-');
      return { mode: 'range', single: from, from, to };
    }

    if (expr.startsWith('*/')) {
      return { mode: 'step', single: null, from: null, to: null, step: expr.substring(2) };
    }

    // fixed value
    return { mode: 'fixed', single: expr, from: null, to: null };
  }

  patchValue(jobData: any): void {
    this.jobForm.patchValue({
      schedulerJobId: jobData.schedulerJobId,
      schedulerJobName: jobData.schedulerJobName,
      schedulerJob: jobData.schedulerJob,
      jobDescription: jobData.jobDescription,
      cronExpression: jobData.cronExpression,
      triggerName: jobData.triggerName,
      inScheduled: jobData.inScheduled,
      schedulerType: jobData.schedulerType,
      createdOn: jobData.createdOn,
      appId: jobData.appId,
      appName: jobData.appName,
      orgId: jobData.orgId,
      orgName: jobData.orgName
    });

    if (jobData.cronExpression) {
      const parts = jobData.cronExpression.trim().split(' ');
      if (parts.length === 5) {
        const [m, h, dom, mon, dow] = parts;

        const minuteField = this.parseField(m);
        const hourField = this.parseField(h);
        const domField = this.parseField(dom);
        const monthField = this.parseField(mon);
        const dowField = this.parseField(dow);

        this.jobForm.patchValue({
          minuteMode: minuteField.mode,
          minute: minuteField.single,
          minuteFrom: minuteField.from,
          minuteTo: minuteField.to,

          hourMode: hourField.mode,
          hour: hourField.single,
          hourFrom: hourField.from,
          hourTo: hourField.to,

          dayOfMonthMode: domField.mode,
          dayOfMonth: domField.single,
          dayOfMonthFrom: domField.from,
          dayOfMonthTo: domField.to,

          monthMode: monthField.mode,
          month: monthField.single,
          monthFrom: monthField.from,
          monthTo: monthField.to,

          dayOfWeekMode: dowField.mode,
          dayOfWeek: dowField.single,
          dayOfWeekFrom: dowField.from,
          dayOfWeekTo: dowField.to,
        });
      }
    }
  }

  private expandRange(expr: string, max: number): number[] {
    const [from, to] = expr.split('-').map(Number);
    const result: number[] = [];

    if (from <= to) {
      for (let i = from; i <= to; i++) result.push(i);
    } else {
      // Wrapped range, e.g. 12-3 => 12,1,2,3
      for (let i = from; i <= max; i++) result.push(i);
      for (let i = 1; i <= to; i++) result.push(i);
    }
    return result;
  }

  private expandMonthExpr(expr: string): string[] {
    if (expr === '*' || !expr) {
      return Object.keys(this.MAX_DAYS_PER_MONTH);
    }

    if (!expr.includes('-')) {
      return [expr];
    }

    return this.expandRange(expr, 12).map(n => n.toString());
  }

  private expandDayExpr(expr: string): number[] {
    if (expr === '*' || !expr) return [];
    if (!expr.includes('-')) return [Number(expr)];
    return this.expandRange(expr, 31);
  }


  private validateDayMonth(domExpr: string, monthExpr: string) {
    const months = this.expandMonthExpr(monthExpr);
    const days = this.expandDayExpr(domExpr);

    if (days.length === 0) return null; // '*' => no check

    const valid: { month: string; days: number[] }[] = [];
    const invalid: { month: string; days: number[] }[] = [];

    for (const m of months) {
      const max = this.MAX_DAYS_PER_MONTH[m];
      const okDays = days.filter(d => d <= max);
      const badDays = days.filter(d => d > max);

      if (badDays.length === 0) {
        valid.push({ month: m, days: okDays });
      } else if (okDays.length === 0) {
        invalid.push({ month: m, days: badDays });
      } else {
        // partially valid
        valid.push({ month: m, days: okDays });
        invalid.push({ month: m, days: badDays });
      }
    }

    return { valid, invalid };
  }

  private getMaxForField(field: 'minute' | 'hour' | 'dom' | 'month' | 'dow'): number {
    switch (field) {
      case 'minute': return 59;
      case 'hour': return 23;
      case 'dom': return 31;
      case 'month': return 12;
      case 'dow': return 7;
      default: return 59;
    }
  }

  private validateStep(stepValue: string | null, fieldMax: number): string | null {

    if (!stepValue) return null;

    const n = Number(stepValue);

    if (Number.isNaN(n)) return 'Step must be a number';

    if (!Number.isInteger(n)) return 'Step must be an integer';

    if (n <= 0) return 'Step must be greater than zero';

    if (n === 1) return 'Step of 1 is the same as every (*)';

    if (n > fieldMax) return `Step cannot be greater than ${fieldMax}`;

    return null;
  }





  private buildField(
    mode: 'any' | 'fixed' | 'range' | 'step',
    single: string,
    from?: string | null,
    to?: string | null,
    step?: string | null
  ): string {
    if (mode === 'any') return '*';
    if (mode === 'fixed') return single || '*';
    if (mode === 'range' && from && to) return `${from}-${to}`;
    if (mode === 'step' && step) {
      if (step === '1') return '*';
      return `*/${step}`;
    }
    return '*';
  }


  get readableCron(): string {
    const v = this.jobForm.value;

    const minuteExpr = this.buildField(v.minuteMode, v.minute, v.minuteFrom, v.minuteTo, v.minuteStep);
    const hourExpr = this.buildField(v.hourMode, v.hour, v.hourFrom, v.hourTo, v.hourStep);
    const domExpr = this.buildField(v.dayOfMonthMode, v.dayOfMonth, v.dayOfMonthFrom, v.dayOfMonthTo, v.dayOfMonthStep);
    const monthExpr = this.buildField(v.monthMode, v.month, v.monthFrom, v.monthTo, v.monthStep);
    const dowExpr = this.buildField(v.dayOfWeekMode, v.dayOfWeek, v.dayOfWeekFrom, v.dayOfWeekTo, v.dayOfWeekStep);

    const isStar = (x: string) => x === '*';
    const isRange = (x: string) => x.includes('-');
    const isStep = (x: string) => x.startsWith('*/');
    const getStepValue = (x: string) => x.substring(2);

    const splitRange = (x: string) => x.split('-');

    const asInt = (x: string) => parseInt(x, 10);



    // ---------------------
    // TIME TEXT
    // ---------------------
    const formatTime = (h: string, m: string) => {
      const hourNum = asInt(h);
      const minuteNum = asInt(m);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
      return `${formattedHour}:${minuteNum.toString().padStart(2, '0')} ${period}`;
    };

    let timeText = '';

    // 1) exact single time (no star, no range, no step)
    if (!isStar(hourExpr) && !isRange(hourExpr) && !isStep(hourExpr) &&
      !isStar(minuteExpr) && !isRange(minuteExpr) && !isStep(minuteExpr)) {

      timeText = `at ${formatTime(hourExpr, minuteExpr)}`;
    }

    // 2) step minutes
    else if (isStep(minuteExpr) && isStar(hourExpr)) {
      timeText = `every ${getStepValue(minuteExpr)} minutes`;
    }

    // 3) step hours
    else if (isStep(hourExpr) && isStar(minuteExpr)) {
      timeText = `every ${getStepValue(hourExpr)} hours`;
    }

    // 4) step minutes within selected hour
    else if (isStep(minuteExpr) && !isStar(hourExpr) && !isRange(hourExpr)) {
      timeText = `every ${getStepValue(minuteExpr)} minutes during hour ${hourExpr}`;
    }

    // 5) generic fallback (existing logic)
    else {
      let minutePart = isStar(minuteExpr)
        ? 'every minute'
        : isRange(minuteExpr)
          ? `minutes ${minuteExpr}`
          : isStep(minuteExpr)
            ? `every ${getStepValue(minuteExpr)} minutes`
            : `at minute ${minuteExpr}`;

      let hourPart = isStar(hourExpr)
        ? 'every hour'
        : isRange(hourExpr)
          ? `hours ${hourExpr}`
          : isStep(hourExpr)
            ? `every ${getStepValue(hourExpr)} hours`
            : `at hour ${hourExpr}`;

      timeText = `${minutePart} ${hourPart}`;
    }

    // ---------------------
    // DAY OF MONTH
    // ---------------------
    let domText = '';
    if (!isStar(domExpr)) {
      if (isRange(domExpr)) {
        domText = ` on days ${domExpr}`;
      } else if (isStep(domExpr)) {
        domText = ` every ${getStepValue(domExpr)} day(s) of the month`;
      } else {
        domText = ` on the ${domExpr}${this.getOrdinalSuffix(domExpr)}`;
      }
    }

    // ---------------------
    // MONTH
    // ---------------------
    let monthText = '';
    if (!isStar(monthExpr)) {
      if (isRange(monthExpr)) {
        const [f, t] = splitRange(monthExpr);
        const fl = this.monthOptions.find(m => m.value === f)?.label ?? f;
        const tl = this.monthOptions.find(m => m.value === t)?.label ?? t;
        monthText = ` from ${fl} to ${tl}`;
      } else if (isStep(monthExpr)) {
        monthText = ` every ${getStepValue(monthExpr)} month(s)`;
      } else {
        const label = this.monthOptions.find(m => m.value === monthExpr)?.label ?? monthExpr;
        monthText = ` in ${label}`;
      }
    }


    // ---------------------
    // DAY OF WEEK
    // ---------------------
    let dowText = '';
    if (!isStar(dowExpr)) {
      if (isRange(dowExpr)) {
        const [from, to] = splitRange(dowExpr);
        const fl = this.dayOfWeekOptions.find(d => d.value === from)?.label ?? from;
        const tl = this.dayOfWeekOptions.find(d => d.value === to)?.label ?? to;
        dowText = ` on ${fl}–${tl}`;
      } else if (isStep(dowExpr)) {
        dowText = ` every ${getStepValue(dowExpr)} day(s) of the week`;
      } else {
        const label = this.dayOfWeekOptions.find(d => d.value === dowExpr)?.label ?? dowExpr;
        dowText = ` on ${label}`;
      }
    }

    // ---------------------
    // VALIDATION FOR DAY/MONTH
    // ---------------------
    let note = '';
    const analysis = this.validateDayMonth(domExpr, monthExpr);

    if (analysis) {
      const invalidMonths = analysis.invalid.map(i =>
        this.monthOptions.find(m => m.value === i.month)?.label ?? i.month
      );

      if (analysis.valid.length === 0) {
        note = ` (Warning: selected months do not contain the chosen day(s); this job will never run)`;
      } else if (invalidMonths.length > 0) {
        note = ` (Note: will not run in ${invalidMonths.join(', ')} because these months do not contain those day(s))`;
      }
    }

    return `Runs ${timeText}${domText}${monthText}${dowText}${note}.`;
  }


  /** Utility for 1st, 2nd, 3rd, 4th suffixes */
  getOrdinalSuffix(value: string | number): string {
    const n = typeof value === 'string' ? parseInt(value, 10) : value;
    const j = n % 10;
    const k = n % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }


  cancel() {
    this.ref.close({ status: false });
  }
}
