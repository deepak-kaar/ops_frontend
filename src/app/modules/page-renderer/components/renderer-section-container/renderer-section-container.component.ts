import { Component, Input } from '@angular/core';
import { DesignerWidget } from 'src/app/modules/page-designer/page-designer.component';

@Component({
  selector: 'app-renderer-section-container',
  templateUrl: './renderer-section-container.component.html',
  styleUrl: './renderer-section-container.component.css',
  standalone: false,
})
export class RendererSectionContainerComponent {
  @Input() sectionWidget!: DesignerWidget;
  @Input() pageId: string = '';
  @Input() date: string = '';
  @Input() frozenAttributeIds: string[] = [];
  @Input() frozenFieldKeys: string[] = [];

  getWidgetStyles(widget: DesignerWidget): any {
    if (!widget.input?.style) {
      return {};
    }

    const styles: any = {};
    const widgetStyle = widget.input.style;

    // Position (percentage-based)
    styles['position'] = 'absolute';
    styles['left'] = `${widget.position.x * 100}%`;
    styles['top'] = `${widget.position.y * 100}%`;
    styles['width'] = `${widget.position.w * 100}%`;
    styles['height'] = `${widget.position.h * 100}%`;
    if (widget.position.zIndex) {
      styles['z-index'] = widget.position.zIndex;
    }

    // Background
    if (widgetStyle.backgroundMode === 'transparent') {
      styles['background-color'] = 'transparent';
      styles['background-image'] = 'none';
    } else if (widgetStyle.backgroundMode === 'image' && widgetStyle.backgroundImageUrl) {
      styles['background-image'] = `url('${widgetStyle.backgroundImageUrl}')`;
      styles['background-size'] = widgetStyle.backgroundSize || 'cover';
      styles['background-position'] = widgetStyle.backgroundPosition || 'center center';
      styles['background-repeat'] = widgetStyle.backgroundRepeat || 'no-repeat';
    } else if (widgetStyle.backgroundMode === 'gradient') {
      if (widgetStyle.gradientType === 'radial') {
        styles['background-image'] = `radial-gradient(circle, ${widgetStyle.gradientStartColor}, ${widgetStyle.gradientEndColor})`;
      } else {
        const angle = widgetStyle.gradientAngle ?? 90;
        styles['background-image'] = `linear-gradient(${angle}deg, ${widgetStyle.gradientStartColor}, ${widgetStyle.gradientEndColor})`;
      }
    } else if (widgetStyle.backgroundColor) {
      styles['background-color'] = widgetStyle.backgroundColor;
    }

    // Typography
    if (widgetStyle.fontFamily) styles['font-family'] = widgetStyle.fontFamily;
    if (widgetStyle.fontSize) styles['font-size'] = `${widgetStyle.fontSize}px`;
    if (widgetStyle.fontWeight) styles['font-weight'] = widgetStyle.fontWeight;
    if (widgetStyle.color) styles['color'] = widgetStyle.color;
    if (widgetStyle.textAlign) styles['text-align'] = widgetStyle.textAlign.toLowerCase();

    // Padding
    if (widgetStyle.paddingLeft !== undefined) styles['padding-left'] = `${widgetStyle.paddingLeft}px`;
    if (widgetStyle.paddingRight !== undefined) styles['padding-right'] = `${widgetStyle.paddingRight}px`;
    if (widgetStyle.paddingTop !== undefined) styles['padding-top'] = `${widgetStyle.paddingTop}px`;
    if (widgetStyle.paddingBottom !== undefined) styles['padding-bottom'] = `${widgetStyle.paddingBottom}px`;

    // Border radius
    if (widgetStyle.borderTopRightRadius !== undefined) styles['border-top-right-radius'] = `${widgetStyle.borderTopRightRadius}px`;
    if (widgetStyle.borderTopLeftRadius !== undefined) styles['border-top-left-radius'] = `${widgetStyle.borderTopLeftRadius}px`;
    if (widgetStyle.borderBottomLeftRadius !== undefined) styles['border-bottom-left-radius'] = `${widgetStyle.borderBottomLeftRadius}px`;
    if (widgetStyle.borderBottomRightRadius !== undefined) styles['border-bottom-right-radius'] = `${widgetStyle.borderBottomRightRadius}px`;

    // Border
    if (widgetStyle.borderTopWidth !== undefined) styles['border-top-width'] = `${widgetStyle.borderTopWidth}px`;
    if (widgetStyle.borderBottomWidth !== undefined) styles['border-bottom-width'] = `${widgetStyle.borderBottomWidth}px`;
    if (widgetStyle.borderLeftWidth !== undefined) styles['border-left-width'] = `${widgetStyle.borderLeftWidth}px`;
    if (widgetStyle.borderRightWidth !== undefined) styles['border-right-width'] = `${widgetStyle.borderRightWidth}px`;
    if (widgetStyle.borderTopStyle) styles['border-top-style'] = widgetStyle.borderTopStyle;
    if (widgetStyle.borderBottomStyle) styles['border-bottom-style'] = widgetStyle.borderBottomStyle;
    if (widgetStyle.borderLeftStyle) styles['border-left-style'] = widgetStyle.borderLeftStyle;
    if (widgetStyle.borderRightStyle) styles['border-right-style'] = widgetStyle.borderRightStyle;
    if (widgetStyle.borderTopColor) styles['border-top-color'] = widgetStyle.borderTopColor;
    if (widgetStyle.borderBottomColor) styles['border-bottom-color'] = widgetStyle.borderBottomColor;
    if (widgetStyle.borderLeftColor) styles['border-left-color'] = widgetStyle.borderLeftColor;
    if (widgetStyle.borderRightColor) styles['border-right-color'] = widgetStyle.borderRightColor;

    return styles;
  }
}

