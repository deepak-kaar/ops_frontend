import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { WidgetService } from '../../widget.service';

@Component({
  selector: 'app-input-text',
  standalone: false,
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.css'
})
export class InputTextComponent extends BaseWidget {

  members = [
    { name: 'Amy Elsner', image: 'amyelsner.png', email: 'amy@email.com', role: 'Owner' },
    { name: 'Bernardo Dominic', image: 'bernardodominic.png', email: 'bernardo@email.com', role: 'Editor' },
    { name: 'Ioni Bowcher', image: 'ionibowcher.png', email: 'ioni@email.com', role: 'Viewer' }
  ];
  logs: any[] = [];
  ref: DynamicDialogRef | undefined;
  @Input() value?: string;
  @Input() pageId: string = '';
  @Input() id?: any;
  @Input() attrId: any;
  @Input() attrName: string = ''
  @Input() style: any;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readOnly: boolean = false;
  @Input() ch: any;
  @Input() updateDate: any;
  @Input() frequency: any;
  @Output() valueChange = new EventEmitter<string>();
  @Output() valueEnter = new EventEmitter<any>();
  @Output() attrid = new EventEmitter<any>();
  @Output() odtid = new EventEmitter<any>();

  private formDataService = inject(WidgetService);
  constructor(public dialogService: DialogService) {
    super();
  }

  ngOnInit() {
    console.log(this.updateDate);
    const value = {
      value: this.value,
      attributeId: this.attrId,
      required: this.required,
      name: this.attrName,
      frequency: this.frequency,
      date: this.updateDate
    }
    // this.formDataService.updateFormData(this.id, value);
    this.odtid.emit(this.odtid);
    if (this.attrId) {
      // this.getAttributeLogs();
      this.attrid.emit(this.attrId)
      this.valueEnter.emit({
        value: this.value,
        id: this.attrId,
        frequency: this.frequency,
        attrName: this.attrName
      });
    }
  }
  onInput() {
    this.valueChange.emit(this.value);
  }

  // getAttributeLogs() {
  //   this.formDataService.getAttributeLogs(this.attrId).subscribe({
  //     next: (res: any) => {
  //       this.logs = res?.sensorJson;
  //     },
  //     error: (err) => {
  //       console.log(err);
  //     }
  //   })
  // }

  onInputValueChange(newValue: any) {
    this.value = newValue;
    const value = {
      value: this.value,
      attributeId: this.attrId,
      frequency: this.frequency,
      date: this.updateDate
    }
    this.formDataService.updateFormData(this.id, value);
    this.valueEnter.emit({
      value: newValue,
      id: this.attrId,
      attrName: this.attrName,
      frequency: this.frequency,
      date: this.updateDate
    });
  }
  onOpenDifferenceDialog() {
    // this.ref = this.dialogService.open(GraphDialogComponent, {
    //   header: 'Average Graph',
    //   width: '60rem',
    //   data: {
    //     attributeId: this.attrId,
    //     attributeName: this.attrName,
    //   },
    //   contentStyle: { overflow: 'auto' },
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw'
    //   },
    // });
    // this.ref.onClose.subscribe((data: any) => {
    //   if (data) {
    //   }
    // });
  }
}
