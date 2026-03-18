import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-calculation-detail-dialog',
  standalone: false,
  templateUrl: './calculation-detail-dialog.component.html',
  styleUrls: ['./calculation-detail-dialog.component.css']
})
export class CalculationDetailDialogComponent implements OnInit {
  calculationData: any;
  inputAttributes: any[] = [];
  outputAttributes: any[] = [];
  isDataLoaded: boolean = false;

  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
    readOnly: true
  };

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.calculationData = this.config.data?.calculation;

    if (this.calculationData) {
      // Extract input attributes
      if (this.calculationData.inputJsonSchema?.properties && Array.isArray(this.calculationData.inputJsonSchema.properties)) {
        this.inputAttributes = this.calculationData.inputJsonSchema.properties;
      }

      // Extract output attributes
      if (this.calculationData.outputJsonSchema?.properties && Array.isArray(this.calculationData.outputJsonSchema.properties)) {
        this.outputAttributes = this.calculationData.outputJsonSchema.properties;
      }

      this.isDataLoaded = true;
    }
  }
}
