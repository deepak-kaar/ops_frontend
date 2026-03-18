import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-progress-bar',
  standalone: false,
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css'
})
export class ProgressBarComponent extends BaseWidget {
  @Input() value: number = 50;
  @Input() showValue: boolean = true;
  @Input() style: any;

  constructor() {
    super();
  }
}
