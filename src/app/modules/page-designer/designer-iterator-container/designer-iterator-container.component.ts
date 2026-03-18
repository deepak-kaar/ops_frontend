import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DesignerWidget } from '../page-designer.component';

@Component({
  selector: 'app-designer-iterator-container',
  templateUrl: './designer-iterator-container.component.html',
  styleUrl: './designer-iterator-container.component.css',
  standalone: false,
})
export class DesignerIteratorContainerComponent {
  @Input() iteratorWidget!: DesignerWidget;
  @Input() selectedWidgetId?: string | null;
  @Input() onWidgetClick?: (widget: DesignerWidget) => void;
  @Input() onWidgetDragStart?: () => void;
  @Input() onWidgetDragEnd?: (event: any, widget: DesignerWidget, rowIndex: number) => void;
  @Input() onWidgetResizeStart?: (widget: DesignerWidget, event: MouseEvent, rowIndex: number) => void;
  @Output() addRow = new EventEmitter<void>();
  @Output() deleteRow = new EventEmitter<number>();
  @Output() reorderRows = new EventEmitter<{ fromIndex: number; toIndex: number }>();

  get rows(): DesignerWidget[][] {
    return this.iteratorWidget?.rows ?? [[]];
  }

  /** Template row (row 0) - only this row is editable in the designer, same as section */
  get templateRow(): DesignerWidget[] {
    const rows = this.rows;
    return rows.length > 0 ? rows[0] : [];
  }

  onAddRow(): void {
    this.addRow.emit();
  }

  onDeleteRow(rowIndex: number, event: Event): void {
    event.stopPropagation();
    this.deleteRow.emit(rowIndex);
  }

  onReorder(event: { previousIndex: number; currentIndex: number }): void {
    this.reorderRows.emit({ fromIndex: event.previousIndex, toIndex: event.currentIndex });
  }

  trackByRow(index: number): number {
    return index;
  }
}
