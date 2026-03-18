import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-toggle-switch',
  standalone: false,
  templateUrl: './toggle-switch.component.html',
  styleUrl: './toggle-switch.component.css'
})
export class ToggleSwitchComponent extends BaseWidget {
  @Input() checked: boolean = false;
  @Input() style: any;

  constructor() {
    super();
  }
}
