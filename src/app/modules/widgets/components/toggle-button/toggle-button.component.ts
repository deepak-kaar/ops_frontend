import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-toggle-button',
  standalone: false,
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.css'
})
export class ToggleButtonComponent extends BaseWidget {
  @Input() onLabel: string = 'On';
  @Input() offLabel: string = 'Off';
  @Input() checked: boolean = false;
  @Input() style: any;

  constructor() {
    super();
  }
}
