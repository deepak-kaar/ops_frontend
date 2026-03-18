import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-text-input',
  standalone: false,
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.css'
})
export class TextInputComponent {
  value: any;
  constructor(public config: DynamicDialogConfig, private ref: DynamicDialogRef, private messageService: MessageService) {
  }

  ngOnInit() {
    if (this.config.data) {
      this.value = this.config.data
    }
  }

  onSaveText() {
    if (this.value) {
      this.ref.close(this.value);
    }
    else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Please Enter some value`,
      })
    }

  }
  onCloseTemplate() {
    this.ref.close();
  }
}
