import { Component, Input } from '@angular/core';
import { WidgetService } from '../../widget.service';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';

@Component({
  selector: 'app-radio-button',
  standalone: false,
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.css'
})
export class RadioButtonComponent extends BaseWidget {
  @Input() checked?: boolean;
  @Input() label1?: string;
  @Input() label2?: string;
  @Input() id?: any;
  @Input() attrId?: string;
  @Input() pageId: string = '';
  constructor(private formDataService: WidgetService) {
    super();
  }

  public override serialize(): NgCompInputs | undefined {
    return { label1: this.label1, label2: this.label2, checked: this.checked };
  }

  onInputValueChange(newValue: any) {
    this.checked = newValue;
    this.formDataService.updateFormData(this.id, this.checked);
  }
}
