import { Component, Input } from '@angular/core';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';

/**
 * @component
 * @description
 * ImageComponent is a customizable Image widget.
 */
@Component({
  selector: 'app-image',
  standalone: false,
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent extends BaseWidget {

  /** 
   * Src of the image as input prop. 
   * @type {any}
   */
  @Input() src: any;

  /** 
   * Custom styles applied to the button. 
   * @type {any}
   */
  @Input() style: any;

  /** 
   * Alternate text for Image. 
   * @type {any}
   */
  @Input() alterateText: string | undefined

  /**
   * Serializes the button's state.
   * @returns {NgCompInputs | undefined} An object containing buttonLabel and style if either exists, otherwise undefined.
   */
  public override serialize(): NgCompInputs | undefined {
    return (this.src || this.style || this.alterateText) ? { src: this.src, style: this.style, alterateText: this.alterateText } : undefined;
  }
}