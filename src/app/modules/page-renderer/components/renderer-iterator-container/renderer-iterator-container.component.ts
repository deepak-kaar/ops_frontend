import { Component, Input } from '@angular/core';
import { DesignerWidget } from 'src/app/modules/page-designer/page-designer.component';

@Component({
  selector: 'app-renderer-iterator-container',
  templateUrl: './renderer-iterator-container.component.html',
  styleUrl: './renderer-iterator-container.component.css',
  standalone: false,
})
export class RendererIteratorContainerComponent {
  @Input() iteratorWidget!: DesignerWidget;

  get rows(): DesignerWidget[][] {
    return this.iteratorWidget?.rows ?? [];
  }

  getWidgetStyles(widget: DesignerWidget): any {
    if (!widget?.position) return { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' };
    return {
      position: 'absolute',
      left: `${widget.position.x * 100}%`,
      top: `${widget.position.y * 100}%`,
      width: `${widget.position.w * 100}%`,
      height: `${widget.position.h * 100}%`,
      'z-index': widget.position.zIndex || 1,
      'background-color': widget.input?.style?.backgroundColor || (widget.input?.style?.backgroundMode === 'transparent' ? 'transparent' : 'var(--p-surface-0)'),
      'background-image': widget.input?.style?.backgroundImage || 'none',
      'background-size': widget.input?.style?.backgroundSize || 'cover',
      'background-position': widget.input?.style?.backgroundPosition || 'center center',
      'background-repeat': widget.input?.style?.backgroundRepeat || 'no-repeat',
    };
  }
}
