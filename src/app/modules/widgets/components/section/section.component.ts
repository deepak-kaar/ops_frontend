import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-section',
  standalone: false,
  templateUrl: './section.component.html',
  styleUrl: './section.component.css'
})
export class SectionComponent extends BaseWidget {
  @Input() style: any
  constructor() {
    super();
  }
}
