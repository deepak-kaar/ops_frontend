import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WidgetService } from '../../widget.service';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';

@Component({
  selector: 'app-date-picker',
  standalone: false,
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css'
})
export class DatePickerComponent extends BaseWidget {
  @Input() date: any[] | any;
  @Input() style: any
  @Input() id: any;
  @Input() attrId: any;
  @Input() pageId: string = '';
  @Output() selectedDate = new EventEmitter<any>();
  @Output() attrid = new EventEmitter<any>();

  constructor(private formDataService: WidgetService) {
    super()
  }
  public override serialize(): NgCompInputs | undefined {
    return this.date ? { date: this.date } : undefined;
  }

  ngOnInit() {
    if (this.style?.selectionRange) {
      if (Array.isArray(this.date)) {
        this.date = this.date
      }
    } else {
      if (this.date) {
        this.date = new Date(this.date);
      } else {
        this.date = new Date();
      }
    }
    this.selectedDate.emit(this.date);
    if (this.attrId) {
      this.attrid.emit(this.attrId);
    }
  }


  onInputValueChange(newValue: any) {
    this.selectedDate.emit(newValue)
    this.date = newValue;
    const value = {
      value: newValue,
      id: this.attrId
    }
    this.formDataService.updateFormData(this.id, value);
  }

}
