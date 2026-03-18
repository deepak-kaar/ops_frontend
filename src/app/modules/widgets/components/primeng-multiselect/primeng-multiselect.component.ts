import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-primeng-multiselect',
  standalone: false,
  templateUrl: './primeng-multiselect.component.html',
  styleUrl: './primeng-multiselect.component.css'
})
export class PrimengMultiselectComponent extends BaseWidget {
  @Input() options: any[] = [];

  private _value: any[] = [];
  @Input()
  set value(v: any) {
    if (Array.isArray(v)) {
      this._value = v;
      return;
    }

    if (v === null || v === undefined || v === '') {
      this._value = [];
      return;
    }

    // PrimeNG MultiSelect expects an array model; coerce single values to array.
    this._value = [v];
  }
  get value(): any[] {
    return this._value;
  }

  @Input() optionLabel: string = 'name';
  @Input() placeholder: string = 'Select';
  @Input() style: any;

  constructor() {
    super();
  }
}
