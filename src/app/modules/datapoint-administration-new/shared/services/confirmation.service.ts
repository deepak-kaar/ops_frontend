import { Injectable, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subject } from 'rxjs';
import { TOAST_MESSAGES } from '../constants/datapoint.constants';

/**
 * Configuration for delete confirmation
 */
export interface DeleteConfig {
  itemType: string;
  itemName?: string;
  customMessage?: string;
}

/**
 * Reusable confirmation service for delete operations
 * Reduces boilerplate code across components
 */
@Injectable({
  providedIn: 'root'
})
export class DatapointConfirmationService {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly spinner = inject(NgxSpinnerService);

  /**
   * Show delete confirmation dialog and execute delete operation
   * @param config - Configuration for the confirmation dialog
   * @param deleteOperation - Observable that performs the delete
   * @param onSuccess - Callback after successful deletion
   */
  confirmDelete(
    config: DeleteConfig,
    deleteOperation: Observable<any>,
    onSuccess?: () => void
  ): void {
    const message = config.customMessage || 
      `Are you sure you want to delete this ${config.itemType.toLowerCase()}${config.itemName ? ` "${config.itemName}"` : ''}?`;

    this.confirmationService.confirm({
      message,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.executeDelete(config.itemType, deleteOperation, onSuccess)
    });
  }

  /**
   * Execute delete operation with spinner and toast notifications
   */
  private executeDelete(
    itemType: string,
    deleteOperation: Observable<any>,
    onSuccess?: () => void
  ): void {
    this.spinner.show();
    
    deleteOperation.subscribe({
      next: () => {
        this.spinner.hide();
        this.messageService.add(TOAST_MESSAGES.DELETE_SUCCESS(itemType));
        onSuccess?.();
      },
      error: (error) => {
        this.spinner.hide();
        this.messageService.add(TOAST_MESSAGES.DELETE_ERROR(itemType));
        console.error(`Failed to delete ${itemType}:`, error);
      }
    });
  }

  /**
   * Show a custom confirmation dialog
   */
  confirm(options: {
    message: string;
    header?: string;
    icon?: string;
    acceptLabel?: string;
    rejectLabel?: string;
    onAccept: () => void;
    onReject?: () => void;
  }): void {
    this.confirmationService.confirm({
      message: options.message,
      header: options.header || 'Confirmation',
      icon: options.icon || 'pi pi-question-circle',
      acceptLabel: options.acceptLabel || 'Yes',
      rejectLabel: options.rejectLabel || 'No',
      accept: options.onAccept,
      reject: options.onReject
    });
  }

  /**
   * Show success toast
   */
  showSuccess(message: string, summary = 'Success'): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail: message,
      life: 3000
    });
  }

  /**
   * Show error toast
   */
  showError(message: string, summary = 'Error'): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail: message,
      life: 5000
    });
  }

  /**
   * Show info toast
   */
  showInfo(message: string, summary = 'Info'): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail: message,
      life: 3000
    });
  }

  /**
   * Show warning toast
   */
  showWarning(message: string, summary = 'Warning'): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail: message,
      life: 4000
    });
  }
}
