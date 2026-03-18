import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-divider',
  standalone: false,
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.css'
})
export class DividerComponent extends BaseWidget {

  @Input() style: any
  constructor() {
    super()
  }

}
