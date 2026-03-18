import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';

/**
 * @component
 * @description
 * IconButtonComponent is a customizable Icon Button widget.
 * It supports dynamic styling, special styles, and emits an event when clicked.
 */
@Component({
  selector: 'app-icon-button',
  standalone: false,
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.css'
})
export class IconButtonComponent extends BaseWidget {
  /** 
   * icon displayed on the button. 
   * @type {any}
   */
  @Input() icon: string = '';

  /** 
   * Custom styles applied to the button. 
   * @type {any}
   */
  @Input() style: any;

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
    return this.icon ? { icon: this.icon } : undefined;
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