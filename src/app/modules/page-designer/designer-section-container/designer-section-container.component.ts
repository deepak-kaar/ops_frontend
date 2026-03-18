import { Component, Input } from '@angular/core';
import { DesignerWidget } from '../page-designer.component';

@Component({
  selector: 'app-designer-section-container',
  templateUrl: './designer-section-container.component.html',
  styleUrl: './designer-section-container.component.css',
  standalone: false,
})
export class DesignerSectionContainerComponent {
  @Input() sectionWidget!: DesignerWidget;
  @Input() onWidgetClick?: (widget: DesignerWidget) => void;
  @Input() onWidgetDragStart?: () => void;
  @Input() onWidgetDragEnd?: (event: any, widget: DesignerWidget) => void;
  @Input() onWidgetResizeStart?: (widget: DesignerWidget, event: MouseEvent) => void;
  @Input() selectedWidgetId?: string | null;
}

