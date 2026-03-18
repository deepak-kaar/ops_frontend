import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-location-tag',
  standalone: false,
  templateUrl: './location-tag.component.html',
  styleUrl: './location-tag.component.css'
})
export class LocationTagComponent extends BaseWidget {
  @Input() location: any;
  @Input() style: any;
}
