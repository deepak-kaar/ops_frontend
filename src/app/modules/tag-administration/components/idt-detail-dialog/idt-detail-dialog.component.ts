import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-idt-detail-dialog',
  standalone: false,
  templateUrl: './idt-detail-dialog.component.html',
  styleUrls: ['./idt-detail-dialog.component.css']
})
export class IdtDetailDialogComponent implements OnInit {
  idtData: any;
  isDataLoaded: boolean = false;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.idtData = this.config.data?.idt;
    if (this.idtData) {
      this.isDataLoaded = true;
    }
  }
}
