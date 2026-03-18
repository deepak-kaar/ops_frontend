import { Component, Input } from '@angular/core';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';

@Component({
  selector: 'app-button-group',
  standalone: false,
  templateUrl: './button-group.component.html',
  styleUrl: './button-group.component.css'
})
export class ButtonGroupComponent extends BaseWidget {
  @Input() labels? = {
    btn1label: 'Save',
    btn1Icon: 'pi pi-check',
    btn2label: 'Delete',
    btn2Icon: 'pi pi-trash',
    btn3label: 'Cancel',
    btn3Icon: 'pi pi-times',
  };
  @Input() style: any;

  public override serialize(): NgCompInputs | undefined {
    return this.labels ? { labels: this.labels } : undefined;
  }
}