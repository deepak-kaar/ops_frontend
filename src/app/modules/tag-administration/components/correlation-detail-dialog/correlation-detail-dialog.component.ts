import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-correlation-detail-dialog',
  standalone: false,
  templateUrl: './correlation-detail-dialog.component.html',
  styleUrls: ['./correlation-detail-dialog.component.css']
})
export class CorrelationDetailDialogComponent implements OnInit {
  correlationData: any;
  inputAttributes: any[] = [];
  outputAttributes: any[] = [];
  internalSchemas: any[] = [];
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
    this.correlationData = this.config.data?.correlation;

    if (this.correlationData) {
      // Extract input attributes
      if (this.correlationData.inputJsonSchema?.properties && Array.isArray(this.correlationData.inputJsonSchema.properties)) {
        this.inputAttributes = this.correlationData.inputJsonSchema.properties;
      }

      // Extract output attributes
      if (this.correlationData.outputJsonSchema?.properties && Array.isArray(this.correlationData.outputJsonSchema.properties)) {
        this.outputAttributes = this.correlationData.outputJsonSchema.properties;
      }

      // Extract internal schemas
      if (this.correlationData.internalJsonSchema && Array.isArray(this.correlationData.internalJsonSchema)) {
        this.internalSchemas = this.correlationData.internalJsonSchema;
      }

      this.isDataLoaded = true;
    }
  }
}
