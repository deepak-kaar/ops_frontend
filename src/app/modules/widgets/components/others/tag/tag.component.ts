import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-tag',
  standalone: false,
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.css'
})
export class TagComponent extends BaseWidget{
  @Input() style?: any;
  @Input() value?: any;
}
