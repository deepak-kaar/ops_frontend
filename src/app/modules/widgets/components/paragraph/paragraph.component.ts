import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-paragraph',
  standalone: false,
  templateUrl: './paragraph.component.html',
  styleUrl: './paragraph.component.css'
})
export class ParagraphComponent extends BaseWidget {
  @Input() content: any;
  @Input() style: any;
}
