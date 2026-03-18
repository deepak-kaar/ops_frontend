import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from 'primeng/dynamicdialog';
import { UserEnablerService } from './service/user-enabler.service';

@Component({
  selector: 'app-user-enabler',
  standalone: false,
  templateUrl: './user-enabler.component.html',
  styleUrl: './user-enabler.component.css'
})
export class UserEnablerComponent {

  protected readonly userEnablerService = inject(UserEnablerService);
  protected readonly messageService = inject(MessageService);
  protected readonly spinner = inject(NgxSpinnerService);
  protected readonly dialog = inject(DialogService);

  /**
   * @method showToast - Shows a toast notification.
   * @param {string} severity - The severity of the toast.
   * @param {string} summary - The summary of the toast.
   * @param {string} detail - The detail of the toast.
   * @param {boolean} sticky - Whether the toast should be sticky.
   */
  protected showToast(severity: string, summary: string, detail: string, life: number, sticky: boolean) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, life: life, sticky: sticky })
  }
}
