import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DesignerWidget } from '../page-designer.component';

@Component({
  selector: 'app-designer-widget-host',
  templateUrl: './designer-widget-host.component.html',
  styleUrl: './designer-widget-host.component.css',
  standalone: false,
})
export class DesignerWidgetHostComponent {
  @Input() widget!: DesignerWidget;
  @Input() selectedWidgetId?: string | null;
  @Output() sectionWidgetClick = new EventEmitter<DesignerWidget>();
  @Output() sectionWidgetDragStart = new EventEmitter<void>();
  @Output() sectionWidgetDragEnd = new EventEmitter<{ event: any; widget: DesignerWidget }>();
  @Output() sectionWidgetResizeStart = new EventEmitter<{ widget: DesignerWidget; event: MouseEvent }>();

  @Input() onIteratorWidgetClick?: (widget: DesignerWidget) => void;
  @Input() onIteratorWidgetDragEnd?: (event: any, widget: DesignerWidget, iteratorWidget: DesignerWidget, rowIndex: number) => void;
  @Input() onIteratorWidgetResizeStart?: (widget: DesignerWidget, event: MouseEvent, iteratorWidget: DesignerWidget, rowIndex: number) => void;
  @Input() onIteratorAddRow?: (iteratorWidget: DesignerWidget) => void;
  @Input() onIteratorDeleteRow?: (iteratorWidget: DesignerWidget, rowIndex: number) => void;
  @Input() onIteratorReorderRows?: (iteratorWidget: DesignerWidget, fromIndex: number, toIndex: number) => void;

  onSectionWidgetClick = (widget: DesignerWidget) => {
    this.sectionWidgetClick.emit(widget);
  };

  onSectionWidgetDragStart = () => {
    this.sectionWidgetDragStart.emit();
  };

  onSectionWidgetDragEnd = (event: any, widget: DesignerWidget) => {
    this.sectionWidgetDragEnd.emit({ event, widget });
  };

  onSectionWidgetResizeStart = (widget: DesignerWidget, event: MouseEvent) => {
    this.sectionWidgetResizeStart.emit({ widget, event });
  };

  /** Forwards iterator drag end with this widget as iterator context */
  onIteratorDragEnd = (ev: any, w: DesignerWidget, rowIndex: number): void => {
    this.onIteratorWidgetDragEnd?.(ev, w, this.widget, rowIndex);
  };

  /** Forwards iterator resize start with this widget as iterator context */
  onIteratorResizeStart = (w: DesignerWidget, ev: MouseEvent, rowIndex: number): void => {
    this.onIteratorWidgetResizeStart?.(w, ev, this.widget, rowIndex);
  };
}


