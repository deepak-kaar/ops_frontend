import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-label',
  standalone: false,
  templateUrl: './label.component.html',
  styleUrl: './label.component.css'
})
export class LabelComponent extends BaseWidget {
  @Input() label: string = 'Label';
  @Input() style: any


  constructor(private datePipe: DatePipe) {
    super();
  }
  ngOnInit() {
    if (typeof this.label === 'string' && this.isIsoDate(this.label)) {
      this.label = this.datePipe.transform(new Date(this.label), 'mediumDate')!;
    }
  }
  private isIsoDate(value: string): boolean {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/;
    return isoDateRegex.test(value);
  }

}
