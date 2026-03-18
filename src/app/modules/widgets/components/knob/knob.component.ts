import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-knob',
  standalone: false,
  templateUrl: './knob.component.html',
  styleUrl: './knob.component.css'
})
export class KnobComponent extends BaseWidget {
  @Input() value: number = 50;
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() readonly: boolean = false;
  @Input() style: any;

  constructor() {
    super();
  }
}
