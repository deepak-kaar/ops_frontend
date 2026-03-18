import { Component, Input } from '@angular/core';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';
import { WidgetService } from '../../widget.service';

@Component({
  selector: 'app-text-area',
  standalone: false,
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.css'
})
export class TextAreaComponent extends BaseWidget {
  @Input() value: any;
  @Input() pageId: string = '';
  @Input() id: any;
  @Input() style: any;
  @Input() attrId: string = '';

  constructor(private formDataService: WidgetService) {
    super();
  }
  public override serialize(): NgCompInputs | undefined {
    return this.value ? { tableData: this.value } : undefined;
  }

  onInputValueChange(newValue: any) {
    this.value = newValue;
    const value = {
      attributeId: this.attrId,
      value: this.value
    }
    this.formDataService.updateFormData(this.id, value);
  }
}

