import { Component, ViewEncapsulation } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

export interface DeleteConfirmationDialogData {
  title?: string;
  subtitle?: string;
  entityLabel?: string;
  itemName?: string;
  questionText?: string;
  message?: string; // backward compatibility
  descriptionText?: string;
  warningMessage?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface DeleteConfirmationDialogResult {
  confirmed: boolean;
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrl: './delete-confirmation-dialog.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DeleteConfirmationDialogComponent {
  title = 'Delete Item';
  subtitle = 'This action cannot be undone';
  entityLabel = 'Item';
  itemName = '';

  questionText = 'Are you sure you want to delete this item?';
  descriptionText = 'This will permanently remove the item and all associated data from the system.';
  warningMessage = 'Warning: This action is irreversible and will affect all related records.';

  confirmText = 'Delete Item';
  cancelText = 'Cancel';

  appendItemName = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    const data: DeleteConfirmationDialogData = this.config.data ?? {};

    this.entityLabel = (data.entityLabel && typeof data.entityLabel === 'string') ? data.entityLabel.trim() : 'Item';
    this.itemName = (data.itemName && typeof data.itemName === 'string') ? data.itemName.trim() : (data.itemName ? String(data.itemName) : '');

    this.title = (data.title && typeof data.title === 'string') ? data.title.trim() : `Delete ${this.entityLabel}`;
    this.subtitle = (data.subtitle && typeof data.subtitle === 'string') ? data.subtitle.trim() : 'This action cannot be undone';

    // Backward compatibility with old `message`
    if (data.message && !data.questionText) {
      this.questionText = (typeof data.message === 'string') ? data.message.trim() : String(data.message);
      this.appendItemName = false;
    } else {
      this.questionText =
        ((data.questionText && typeof data.questionText === 'string') ? data.questionText.trim() : null) ||
        (this.itemName
          ? 'Are you sure you want to delete'
          : `Are you sure you want to delete this ${this.entityLabel.toLowerCase()}?`);
      this.appendItemName = !!this.itemName;
    }

    this.descriptionText =
      ((data.descriptionText && typeof data.descriptionText === 'string') ? data.descriptionText.trim() : null) ||
      `This will permanently remove the ${this.entityLabel.toLowerCase()} and all associated data from the system.`;

    this.warningMessage =
      ((data.warningMessage && typeof data.warningMessage === 'string') ? data.warningMessage.trim() : null) ||
      'Warning: This action is irreversible and will affect all related records.';

    this.confirmText = ((data.confirmText && typeof data.confirmText === 'string') ? data.confirmText.trim() : null) || `Delete ${this.entityLabel}`;
    this.cancelText = ((data.cancelText && typeof data.cancelText === 'string') ? data.cancelText.trim() : null) || 'Cancel';
  }

  onConfirm(): void {
    this.ref.close({ confirmed: true } as DeleteConfirmationDialogResult);
  }

  onCancel(): void {
    this.ref.close({ confirmed: false } as DeleteConfirmationDialogResult);
  }
}
