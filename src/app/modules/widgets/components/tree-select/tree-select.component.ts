import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-tree-select',
  standalone: false,
  templateUrl: './tree-select.component.html',
  styleUrl: './tree-select.component.css'
})
export class TreeSelectComponent extends BaseWidget {
  @Input() options: any[] = [];
  @Input() value: any = null;
  @Input() placeholder: string = 'Select';
  @Input() style: any;

  constructor() {
    super();
  }
}
