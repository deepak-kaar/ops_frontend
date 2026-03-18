import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

/**
 * DateTagComponent is a widget that formats and displays a date in a tag.
 * If the input date is in ISO format, it is converted to a mediumDate format.
 */
@Component({
  selector: 'app-date-tag',
  standalone: false,
  templateUrl: './date-tag.component.html',
  styleUrl: './date-tag.component.css'
})
export class DateTagComponent  extends BaseWidget {
 /** Custom styles applied to the date tag. */
 @Input() style?: any;
  
 /** Date value to be formatted and displayed. */
 @Input() date?: any;

 /**
  * Constructs the component and injects the DatePipe service.
  * @param {DatePipe} datePipe - Service for transforming date formats.
  */
 constructor(private datePipe: DatePipe) {
   super();
 }

 /**
  * Lifecycle hook: Initializes the component.
  * Converts ISO-formatted date strings to a readable format using DatePipe.
  * @returns {void}
  */
 ngOnInit(): void {
   if (typeof this.date === 'string' && this.isIsoDate(this.date)) {
     this.date = this.datePipe.transform(new Date(this.date), 'mediumDate')!;
   }
 }

 /**
  * Checks whether a given string follows the ISO date format.
  * @param value - The date string to validate.
  * @returns - True if the value is in ISO date format, otherwise false.
  */
 private isIsoDate(value: string): boolean {
   const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/;
   return isoDateRegex.test(value);
 }
}
