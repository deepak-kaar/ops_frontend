import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';

/**
 * ButtonComponent is a customizable button widget.
 * It supports dynamic styling, special styles, and emits an event when clicked.
 */
@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent extends BaseWidget {

  /** 
   * Label text displayed on the button. 
   * @type {any}
   */
  @Input() buttonLabel: any;

  /** 
   * Custom styles applied to the button. 
   * @type {any}
   */
  @Input() style: any;

  /** 
   * Additional special styling for the button. 
   * @type {any}
   */
  @Input() specialStyle: any;

  /** 
   * Event emitted when the button is clicked. 
   * @event buttonClick
   * @returns {void}
   */
  @Output() buttonClick = new EventEmitter<void>();

  /**
   * Serializes the button's state.
   * @returns {NgCompInputs | undefined} An object containing buttonLabel and style if either exists, otherwise undefined.
   */
  public override serialize(): NgCompInputs | undefined {
    return (this.buttonLabel || this.style) ? { buttonLabel: this.buttonLabel, style: this.style } : undefined;
  }

  /**
   * Lifecycle hook: Initializes the component.
   * @returns {void}
   */
  ngOnInit(): void { }

  /**
   * Handles button click event.
   * Emits the `buttonClick` event when the button is clicked.
   * @returns {void}
   */
  handleClick(): void {
    this.buttonClick.emit();
  }
}