import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

/**
 * @component
 * @description
 * VideoComponent is a customizable Video widget.
 */
@Component({
  selector: 'app-video',
  standalone: false,
  templateUrl: './video.component.html',
  styleUrl: './video.component.css'
})
export class VideoComponent extends BaseWidget {
  /** 
   * Video src of the video to be displayed as input prop. 
   * @type {any}
   */
  @Input() videoSrc?: string;

  /** 
   * Thumbnail for the video as input prop. 
   * @type {any}
   */
  @Input() thumbnail?: string;
}
