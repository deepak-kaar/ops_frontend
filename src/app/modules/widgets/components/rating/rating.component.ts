import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-rating',
  standalone: false,
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css'
})
export class RatingComponent extends BaseWidget {
  @Input() value: number = 3;
  @Input() stars: number = 5;
  @Input() readonly: boolean = false;
  @Input() style: any;

  constructor() {
    super();
  }
}
