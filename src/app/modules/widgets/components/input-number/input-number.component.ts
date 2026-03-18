import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-input-number',
  standalone: false,
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.css'
})
export class InputNumberComponent extends BaseWidget {
  @Input() value: number | null = 0;
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() style: any;

  constructor() {
    super();
  }
}
