import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseWidget } from 'gridstack/dist/angular';

/**
 * @component
 * @description
 * MapComponent is a customizable Map widget.
 * It supports dynamic styling, special styles, and emits an event when clicked.
 */
@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent extends BaseWidget {

  /** 
   * Src of the Map as input prop. 
   * @type {any}
   */
  @Input() src: any;

  /** 
   * Custom styles applied to the button. 
   * @type {any}
   */
  @Input() style: any;

  /**
   * Constructs the component and initializes the DomSanitizer.
   * @param {DomSanitizer} santizer - Angular's DomSanitizer service to sanitize resource URLs.
   */
  constructor(private santizer: DomSanitizer) {
    super();
  }

  /**
   * Lifecycle hook: Initializes the component.
   * Sanitizes the `src` URL to prevent security risks.
   * @returns {void}
   */
  ngOnInit() {
    this.src = this.santizer.bypassSecurityTrustResourceUrl(this.src);
  }
}
