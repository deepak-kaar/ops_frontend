import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';
import { WidgetService } from '../../widget.service';

@Component({
  selector: 'app-dropdown',
  standalone: false,
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent extends BaseWidget {
  @Input() style: any;
  @Input() data: [] = [];
  @Input() id: any;
  @Input() optionLabel: any
  @Input() dataSource: any
  @Input() attrId: string = ''
  @Input() attrName: string = ''
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readOnly: boolean = false;
  @Input() optionValue: any;
  @Input() value: any
  @Input() pageId: string = '';
  @Input() frequency: any;
  @Input() updateDate: string = '';
  // spinner = inject(NgxSpinnerService)
  isshowUi: boolean = false;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter<any>();
  selectedData: any;
  // commonService = inject(CommonService);

  constructor(private commonService:WidgetService){
    super()
  }

  ngOnInit(): void {
    if (!Array.isArray(this.data) || !this.data.length) {
      this.fetchOptions();
    } else {
      this.isshowUi = true;
    }
    this.selectedData = this.value || null;
  }

  // Handle dropdown value change and emit it
  onDropdownValueChange(event: any): void {
    const { value } = event;
    this.valueChanged.emit(value);

    const payload = {
      value,
      attributeId: this.attrId,
      required: this.required,
      name: this.attrName
    };

    this.commonService.updateFormData(this.id, payload);
    this.commonService.updateValue(this.id, value);
  }

  // Fetch options dynamically if not provided
  private fetchOptions(): void {
    if (!this.attrId) return;

    // this.spinner.show();
    this.commonService.getDrdData(this.attrId).subscribe({
      next: (res) => {
        this.data = res.values;
        this.isshowUi = !!this.data.length;
        // this.spinner.hide();
      },
      error: (err) => {
        console.error('Error fetching dropdown data:', err);
        // this.spinner.hide();
      }
    });
  }
}
