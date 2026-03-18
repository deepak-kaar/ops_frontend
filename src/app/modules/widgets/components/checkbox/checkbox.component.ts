import { Component, Input } from '@angular/core';
import { WidgetService } from 'src/app/modules/widgets/widget.service';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';

/**
 * @component
 * @description
 * CheckboxComponent handles the checkbox value as binary (true or false), and updates the form data.
 * It extends the BaseWidget class and integrates with a widget service to interact with backend.
 */
@Component({
  selector: 'app-checkbox',
  standalone: false,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css'
})
export class CheckboxComponent extends BaseWidget {

  /** checkbox value input received as a prop. */
  @Input() checked = false;

  /** Style object for custom styling. */
  @Input() style: any;

  /** Unique identifier for the component instance. */
  @Input() id: any;
  @Input() pageId: string = '';
  /** Attribute ID associated with the file upload field. */
  @Input() attrId: any;

  /**
   * Constructor initializes dependencies.
   * @param commonService - Widget service for updating form data.
   */
  constructor(private commonService: WidgetService) {
    super();
  }

  /**
   * Serializes the component state.
   * @returns Serialized object containing the checked state.
   */
  public override serialize(): NgCompInputs | undefined {
    return { checked: this.checked };
  }

  /**
   * Handles input value change event.
   * Updates the checked state and notifies the common service.
   * @param newValue - The new value of the input.
   */
  onInputValueChange(newValue: any) {
    this.checked = newValue;
    const value = {
      value: newValue,
      id: this.attrId
    }
    this.commonService.updateFormData(this.id, value);
  }
}