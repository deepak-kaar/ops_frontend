import { Component, Input, SimpleChanges } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';

@Component({
  selector: 'app-speed-guage',
  standalone: false,
  templateUrl: './speed-guage.component.html',
  styleUrl: './speed-guage.component.css'
})
export class SpeedGuageComponent extends BaseWidget {
  @Input() speed: number = 0;

  needleRotation: number = -90;

  ngOnInit() {
    this.updateGauge();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['speed']) {
      this.updateGauge();
    }
  }

  updateGauge() {
    this.needleRotation = -90 + (this.speed * 1.8);
  }
}