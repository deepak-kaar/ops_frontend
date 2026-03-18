import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-input-otp',
  standalone: false,
  templateUrl: './input-otp.component.html',
  styleUrl: './input-otp.component.css'
})
export class InputOtpComponent extends BaseWidget {
  @Input() value: string = '';
  @Input() length: number = 6;
  @Input() style: any;

  constructor() {
    super();
  }
}
