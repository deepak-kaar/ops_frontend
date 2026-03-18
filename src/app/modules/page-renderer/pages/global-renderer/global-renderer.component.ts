import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, ViewChild, inject, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { ResponsiveService } from 'src/app/core/utils/responsive.service';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { DesignerPage, DesignerWidget } from 'src/app/modules/page-designer/page-designer.component';
import { WidgetService } from 'src/app/modules/widgets/widget.service';
import { PageRendererService } from 'src/app/modules/page-renderer/services/page-renderer.service';
// MOCK-WS: remove when real WebSocket is available
import { MockWebSocketService, MockWsPayload } from 'src/app/core/services/mock-websocket.service';

@Component({
  selector: 'app-global-renderer',
  standalone: false,
  templateUrl: './global-renderer.component.html',
  styleUrl: './global-renderer.component.css'
})
export class GlobalRendererComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('reportCanvas') reportCanvas?: ElementRef<HTMLElement>;

  @Input() pageData: DesignerPage | null = null;
  @Input() type: string = 'preview';
  @Input() date: string = '';
  @Input() embedded: boolean = false;
  @Input() mappingId: string = '';
  @Input() pageType: any;
  @Input() isTemplate: boolean = false; // When true, uses getTemplate instead of getTemplateMapping
  /** Attribute IDs frozen for current user role (from Lock Screen); inputs with these IDs are disabled in View mode */
  @Input() frozenAttributeIds: string[] = [];
  /** Schema/property keys frozen for current user role (for unmapped fields) */
  @Input() frozenFieldKeys: string[] = [];
  @Input() reportId: string = this.mappingId

  loading = true;
  error: string | null = null;
  mobileSidebarVisible = false;
  isMobile$!: Observable<boolean>;
  isTablet$!: Observable<boolean>;

  currentMappingData: any = null;
  private readonly spinner = inject(NgxSpinnerService);
  private readonly formService = inject(WidgetService);
  private readonly pageRendererService = inject(PageRendererService);
  private lastLoadedMappingId: string | null = null;
  private lastLoadedDate: string | null = null;
  // MOCK-WS: remove when real WebSocket is available
  private mockWsSub: Subscription | null = null;

   /**
   * @method showToast - Shows a toast notification.
   * @param {string} severity - The severity of the toast.
   * @param {string} summary - The summary of the toast.
   * @param {string} detail - The detail of the toast.
   * @param {boolean} sticky - Whether the toast should be sticky.
   */
  protected showToast(severity: string, summary: string, detail: string, sticky: boolean) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, sticky: sticky })
  }

  isFullscreen = false;

  // Version history modal state
  showHistoryModal = false;
  reportHistory: any[] = [];
  loadingHistory = false;
  previewPdfSrc: SafeResourceUrl | null = null;
  showPdfPreview = false;
  lastReport: any;

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  onFullScreenChange() {
    this.isFullscreen = !!document.fullscreenElement;
  }

  toggleFullScreen() {
    const elem = this.elRef.nativeElement.querySelector('.global-renderer-root');
    if (!elem) return;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err: any) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  constructor(
    @Optional() private route: ActivatedRoute,
    private http: HttpClient,
    private responsive: ResponsiveService,
    private pageAdminService: PageAdministratorService,
    private messageService: MessageService,
    private elRef: ElementRef,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer,
    // MOCK-WS: remove when real WebSocket is available
    private mockWs: MockWebSocketService
  ) { }

  ngOnInit(): void {
    this.isMobile$ = this.responsive.isMobile$();
    this.isTablet$ = this.responsive.isTablet$();

    // MOCK-WS: subscribe to live-data simulation (remove when real WS is wired)
    this.mockWsSub = this.mockWs.data$.subscribe(payload => {
      this.applyMockWsPayload(payload);
    });

    // If pageData is provided as input, use it directly (for preview mode)
    if (this.pageData) {
      this.loading = false;
      return;
    }

    // If mappingId is provided as input (embedded usage), load from it
    if (this.mappingId) {
      this.loadPageFromMappingId(this.mappingId);
      return;
    }

    // Get mappingId from query params (only if route is available)
    if (this.route) {
      const mappingId = this.route?.snapshot?.queryParams?.['mappingId'];
      this.type = this.route?.snapshot?.queryParams?.['type'] || this.type || 'preview';
      this.date = this.route?.snapshot?.queryParams?.['date'] || this.date || '';
      this.mappingId = mappingId || '';
      // this.reportId = reportId || this.reportId || '';

      if (mappingId) {
        // Load from mapping ID - will fetch mapping first, then template
        this.loadPageFromMappingId(mappingId);
        return;
      }

      // Get JSON file path from route params or query params
      this.route.params.subscribe(params => {
        const fileName = params['file'] || this.route?.snapshot.queryParams['file'];

        if (fileName) {
          // Files in public folder are served from root
          // Try assets/dashboards first, then root, then assets
          let filePath: string;
          if (fileName.startsWith('/')) {
            filePath = fileName;
          } else if (fileName.includes('/')) {
            filePath = `/${fileName}`;
          } else {
            // Try assets/dashboards first, fallback to root
            filePath = `/assets/dashboards/${fileName}`;
          }
          this.loadPageFromFile(filePath);
        } else {
          // Try to load from public folder (default)
          this.loadPageFromFile('/assets/dashboards/sample-dashboard.json');
        }
      });
    }
  }

  // MOCK-WS: remove when real WebSocket is available
  ngOnDestroy(): void {
    this.mockWsSub?.unsubscribe();
  }

  /**
   * MOCK-WS: Walks all widgets (recursively) and applies randomised values
   * to chart, numeric, progress and knob widget types.
   * Remove this when a real WebSocket service is plugged in.
   */
  private applyMockWsPayload(payload: MockWsPayload): void {
    try {
      if (!this.pageData?.widgets?.length) return;

      const applyToWidget = (w: any) => {
        try {
          if (!w) return;

          if (w.input && typeof w.input === 'object') {
            const t: string = w.type ?? '';
            switch (t) {
              // --- Single-series charts ---
              case 'pie-chart':
              case 'donut-chart':
              case 'polar':
              case 'radar':
              case 'bar-chart':
              case 'hbar':
              case 'line':
              case 'apex-line-chart':
                w.input = { ...w.input, labels: payload.labels, values: [...payload.values] };
                w._refreshKey = Date.now();
                break;
              // --- Dual-series charts ---
              case 'shbar':
              case 'svbar':
                w.input = { ...w.input, labels: payload.labels, values1: [...payload.values1], values2: [...payload.values2] };
                w._refreshKey = Date.now();
                break;
              // --- Numeric widgets ---
              case 'progress-bar':
              case 'knob':
                w.input = { ...w.input, value: payload.progressValue };
                w._refreshKey = Date.now();
                break;
              case 'rating':
                w.input = { ...w.input, value: Math.max(1, Math.min(w.input.stars ?? 5, Math.round(payload.numericValue / 20))) };
                w._refreshKey = Date.now();
                break;
              case 'input-number':
                w.input = { ...w.input, value: payload.numericValue };
                w._refreshKey = Date.now();
                break;
              // --- Metric text labels ---
              case 'label':
                if (w.input.label && typeof w.input.label === 'string' && /\d/.test(w.input.label)) {
                  if (w.input.label.includes('%')) {
                    const sign = Math.random() > 0.5 ? '+' : '-';
                    const pct = Math.floor(Math.random() * 30) + 1;
                    w.input = { ...w.input, label: `${sign}${pct}%` };
                  } else {
                    const matches = w.input.label.match(/\d+([.,]\d+)?/);
                    if (matches && matches[0]) {
                      let val = parseFloat(matches[0].replace(',', ''));
                      val = val * (1 + (Math.random() * 0.1 - 0.05)); // +/- 5%
                      val = Math.round(val);
                      w.input = { ...w.input, label: w.input.label.replace(/\d+([.,]\d+)?/, val.toString()) };
                    }
                  }
                  w._refreshKey = Date.now();
                }
                break;
              default:
                break;
            }
          }

          // Recurse into section/iterator children
          if (Array.isArray(w.children) && w.children.length > 0) {
            w.children = w.children.map((child: any) => {
              const childClone = { ...child };
              applyToWidget(childClone);
              return childClone;
            });
          }
        } catch (inner) {
          console.warn('[MockWS] Widget update skipped due to error:', inner);
        }
      };

      // Shallow-spread pageData to trigger Angular OnChanges/ChangeDetection
      const updatedWidgets = this.pageData.widgets.map((w: any) => {
        const clone = { ...w };
        applyToWidget(clone);
        return clone;
      });

      this.pageData = { ...this.pageData, widgets: updatedWidgets } as any;
    } catch (err) {
      console.warn('[MockWS] applyMockWsPayload error:', err);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If pageData input changes directly (not via mappingId), update the preview
    if (changes['pageData'] && this.pageData && !this.embedded) {
      this.loading = false;
      return;
    }

    // For embedded usage: reload when mappingId/date/type/isTemplate changes
    if (this.embedded) {
      const mappingIdChanged = changes['mappingId'] && !changes['mappingId'].firstChange;
      const dateChanged = changes['date'] && !changes['date'].firstChange;
      const typeChanged = changes['type'] && !changes['type'].firstChange;
      const isTemplateChanged = changes['isTemplate'] && !changes['isTemplate'].firstChange;

      if ((mappingIdChanged || dateChanged || typeChanged || isTemplateChanged) && this.mappingId) {
        // Always reload when mappingId actually changes
        if (mappingIdChanged && changes['mappingId'].currentValue !== changes['mappingId'].previousValue) {
          this.loadPageFromMappingId(this.mappingId);
          return;
        }
        // Reload on date/type/isTemplate change if mappingId exists
        if ((dateChanged || typeChanged || isTemplateChanged) && this.lastLoadedMappingId !== this.mappingId) {
          this.loadPageFromMappingId(this.mappingId);
        }
      }
    }
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarVisible = !this.mobileSidebarVisible;
  }

  /**
   * Loads page data from a JSON file
   */
  loadPageFromFile(filePath: string): void {
    this.spinner.show();
    this.error = null;

    this.http.get<DesignerPage>(filePath).subscribe({
      next: (data) => {
        this.pageData = data;
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error loading page data from:', filePath, err);

        // Try fallback paths
        const fileName = filePath.split('/').pop() || 'sample-dashboard.json';
        const fallbackPaths = [
          `/${fileName}`,  // Try root public folder
          `/assets/${fileName}`,  // Try assets folder
        ];

        // Remove current path from fallbacks if it's already there
        const remainingFallbacks = fallbackPaths.filter(p => p !== filePath);

        if (remainingFallbacks.length > 0) {
          this.tryFallbackPaths(remainingFallbacks, 0);
        } else {
          this.error = `Failed to load page data from ${filePath}. Please check the file path.`;
          this.spinner.hide();
        }
      }
    });
  }

  /**
   * Tries fallback paths if the primary path fails
   */
  private tryFallbackPaths(paths: string[], index: number): void {
    if (index >= paths.length) {
      this.error = 'Failed to load page data from all attempted paths. Please check the file exists.';
      this.spinner.hide();
      return;
    }

    this.http.get<DesignerPage>(paths[index]).subscribe({
      next: (data) => {
        this.pageData = data;
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error loading from fallback path:', paths[index], err);
        this.tryFallbackPaths(paths, index + 1);
      }
    });
  }

  /**
   * Loads page data from a JSON object (for direct JSON input)
   */
  loadPageFromJson(json: DesignerPage): void {
    this.pageData = json;
    this.spinner.hide();
  }

  /**
   * Gets canvas styles as CSS object
   */
  getCanvasStyles(): any {
    if (!this.pageData?.canvas?.styles) {
      return {};
    }

    const styles: any = {};
    const canvasStyles = this.pageData.canvas.styles;

    // Background
    if (canvasStyles.backgroundMode === 'transparent') {
      styles['background-color'] = 'transparent';
      styles['background-image'] = 'none';
    } else if (canvasStyles.backgroundMode === 'image' && canvasStyles.backgroundImageUrl) {
      styles['background-image'] = `url('${canvasStyles.backgroundImageUrl}')`;
      styles['background-size'] = canvasStyles.backgroundSize || 'cover';
      styles['background-position'] = canvasStyles.backgroundPosition || 'center center';
      styles['background-repeat'] = canvasStyles.backgroundRepeat || 'no-repeat';
    } else if (canvasStyles.backgroundMode === 'gradient') {
      if (canvasStyles.gradientType === 'radial') {
        styles['background-image'] = `radial-gradient(circle, ${canvasStyles.gradientStartColor}, ${canvasStyles.gradientEndColor})`;
      } else {
        const angle = canvasStyles.gradientAngle ?? 90;
        styles['background-image'] = `linear-gradient(${angle}deg, ${canvasStyles.gradientStartColor}, ${canvasStyles.gradientEndColor})`;
      }
    } else if (canvasStyles.backgroundColor) {
      styles['background-color'] = canvasStyles.backgroundColor;
    }

    return styles;
  }

  /**
   * Gets widget styles as CSS object
   */
  getWidgetStyles(widget: DesignerWidget): any {
    if (!widget.input?.style) {
      return {};
    }

    const styles: any = {};
    const widgetStyle = widget.input.style;

    const minHeightPx = this.pageData?.canvas?.minHeightPx || 800;

    // Position (horizontal percentage, vertical pixels)
    styles['position'] = 'absolute';
    styles['left'] = `${widget.position.x * 100}%`;
    styles['width'] = `${widget.position.w * 100}%`;
    styles['top'] = `${widget.position.y * minHeightPx}px`;
    styles['height'] = `${widget.position.h * minHeightPx}px`;
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

  /**
   * Gets canvas height in pixels
   */
  getCanvasHeight(): string {
    if (this.pageData?.canvas?.heightPx) {
      return `${this.pageData.canvas.heightPx}px`;
    }
    return this.embedded ? '100%' : '100vh';
  }

  /**
   * Gets canvas width - 100% when embedded to fit container, otherwise use defined width
   */
  getCanvasWidth(): string {
    // In embedded mode, always use 100% to fit within the preview container
    if (this.embedded) {
      return '100%';
    }
    if (this.pageData?.canvas?.width) {
      return `${this.pageData.canvas.width}px`;
    }
    return '100%';
  }



  /**
   * Loads page from mapping ID or template ID
   * When isTemplate is true, uses getTemplate endpoint
   * Otherwise uses getTemplateMapping endpoint
   */
  loadPageFromMappingId(id: string): void {
    this.spinner.show();
    this.error = null;
    this.loading = true;
    this.pageData = null;

    this.lastLoadedMappingId = id;
    this.lastLoadedDate = this.date || '';

    // Choose the right API based on isTemplate flag
    if (this.isTemplate) {
      this.loadFromTemplate(id);
    } else {
      this.loadFromMapping(id);
    }
  }

  /**
   * Loads page from template ID using getTemplate endpoint
   */
  private loadFromTemplate(templateId: string): void {
    this.pageAdminService.getTemplate(templateId).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.loading = false;
        const templateData = res.template || res;
        this.currentMappingData = templateData;
        this.loadReportHistory(this.currentMappingData?.templateId)

        // Get designObject from template response (at root level or in templateObj)
        const designObject = templateData.designObject || templateData.templateObj?.designObject;

        if (!designObject) {
          this.error = 'Design object not found in template';
          return;
        }

        // Get widgets from designObject.widgets
        const widgets = designObject.widgets || [];

        if (!widgets || widgets.length === 0) {
          this.error = 'No widgets found in design object';
          return;
        }

        this.pageData = {
          canvas: designObject.canvas || {},
          widgets: widgets,
          version: designObject.version || '1.0',
          timestamp: designObject.timestamp || new Date().toISOString()
        } as DesignerPage;
      },
      error: (err) => {
        console.error('Error loading template:', err);
        this.error = 'Failed to load template data';
        this.spinner.hide();
        this.loading = false;
      }
    });
  }

  /**
   * Loads page from mapping ID using getTemplateMapping endpoint
   */
  private loadFromMapping(mappingId: string): void {
    this.pageAdminService.getTemplateMapping({ mappingId: mappingId, date: this.date }).subscribe({
      next: (mappingRes: any) => {
        this.spinner.hide();
        this.loading = false;
        const mappingData = mappingRes.mapping || mappingRes;
        this.currentMappingData = mappingData; // Store for save functionality
        console.log('Mapping data fields:', Object.keys(mappingData), mappingData);

        // Get designObject from mapping response (at root level or in templateObj)
        const designObject = mappingData.designObject || mappingData.templateObj?.designObject;
        const inputSchema = mappingData.inputSchema || mappingData.templateObj?.inputSchema;
        const appId = mappingData.appId;
        const orgId = mappingData.orgId;

        if (!designObject) {
          this.error = 'Design object not found in mapping';
          return;
        }

        if (!inputSchema) {
          this.error = 'Input schema not found in mapping';
          return;
        }

        // Get widgets from designObject.widgets (not children)
        const widgets = designObject.widgets || [];

        if (!widgets || widgets.length === 0) {
          this.error = 'No widgets found in design object';
          return;
        }
        this.pageData = {
          canvas: designObject.canvas || {},
          widgets: widgets,
          version: designObject.version || '1.0',
          timestamp: designObject.timestamp || new Date().toISOString()
        } as DesignerPage;


      },
      error: (err) => {
        console.error('Error loading mapping:', err);
        this.error = 'Failed to load mapping data';
        this.spinner.hide();
        this.loading = false;
      }
    });
  }


  SaveData() {
    this.spinner.show();
    this.formService.submitFormData(this.mappingId, this.date).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: "Data Saved Successfully",
          life: 3000
        });
      },
      error: (err: any) => {
        console.error('Error saving data:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
          life: 3000
        });
        this.spinner.hide();
      }
    });
  }

  /**
   * Captures the rendered report HTML and sends it to the
   * report renderer service to generate a PDF.
   */
  async saveAsPdf(): Promise<void> {
    if (!this.reportCanvas?.nativeElement) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to capture report content.',
        life: 3000
      });
      return;
    }

    this.spinner.show();

    try {
      // Prepare tables before capturing HTML
      // await this.prepareTable();

      // Prepare complete HTML with styles
      const finalHtml = await this.prepareHtml();

      // Remove extra whitespace and newlines
      const htmlContent = finalHtml.replace(/\n\s*/g, '');

      this.pageRendererService.generateReport(htmlContent).subscribe({
        next: (blob: Blob) => {
          this.spinner.hide();
          // Create a download link and trigger download
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const date = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || new Date().getTime().toString();
          link.download = `report-${this.mappingId || 'report'}-${date}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'PDF generated and downloaded successfully.',
            life: 3000
          });
        },
        error: (err: any) => {
          console.error('Error generating PDF report:', err);
          this.spinner.hide();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to generate PDF.',
            life: 3000
          });
        }
      });
    } catch (error) {
      console.error('Error preparing HTML:', error);
      this.spinner.hide();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to prepare HTML content.',
        life: 3000
      });
    }
  }

  /**
   * Extract and inline HTML with styles, images, and canvas
   */
  async prepareHtml(): Promise<string> {
    if (!this.reportCanvas?.nativeElement) {
      throw new Error('Report canvas element not found');
    }

    // Wait for charts to fully render
    await this.waitForChartsToRender();

    // Convert canvas elements to images BEFORE getting HTML
    await this.convertCanvasToImages();

    // Convert and inline images BEFORE getting HTML to preserve dimensions
    await this.convertImagesToBase64();

    const htmlContent = this.reportCanvas.nativeElement.innerHTML;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const updatedHtmlContent = doc.body.innerHTML;

    // Fetch all styles (external CSS + inline styles)
    const cssContent = await this.fetchAllStyles();

    // Images are already converted to base64, just return the HTML
    const inlinedHtml = updatedHtmlContent;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
          }
          ${cssContent}
        </style>
      </head>
      <body>
        ${inlinedHtml}
      </body>
      </html>
    `;
  }

  /**
   * Wait for charts to fully render
   */
  private async waitForChartsToRender(): Promise<void> {
    // Wait for canvas elements to be ready
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const canvases = this.reportCanvas?.nativeElement.querySelectorAll('canvas');
        if (canvases && canvases.length > 0) {
          // Check if canvases have content (not blank)
          let allReady = true;
          canvases.forEach((canvas: HTMLCanvasElement) => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const hasContent = imageData.data.some((pixel: number) => pixel !== 0);
              if (!hasContent && canvas.width > 0 && canvas.height > 0) {
                allReady = false;
              }
            }
          });

          if (allReady) {
            clearInterval(checkInterval);
            // Additional delay to ensure animations are complete
            setTimeout(resolve, 500);
          }
        } else {
          // No canvases found, resolve immediately
          clearInterval(checkInterval);
          setTimeout(resolve, 300);
        }
      }, 100);

      // Maximum wait time of 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }

  /**
   * Convert canvas elements to images directly in the DOM
   */
  private async convertCanvasToImages(): Promise<void> {
    if (!this.reportCanvas?.nativeElement) {
      return;
    }

    const canvases = Array.from(
      this.reportCanvas.nativeElement.querySelectorAll('canvas')
    ) as HTMLCanvasElement[];

    for (const canvas of canvases) {
      try {
        // Get computed styles to preserve dimensions
        const computedStyle = window.getComputedStyle(canvas);
        const width = canvas.width || parseInt(computedStyle.width, 10) || 400;
        const height = canvas.height || parseInt(computedStyle.height, 10) || 400;

        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/png', 1.0);

        if (imageDataUrl && imageDataUrl !== 'data:,') {
          // Create image element
          const img = document.createElement('img');
          img.src = imageDataUrl;
          img.style.width = computedStyle.width || `${width}px`;
          img.style.height = computedStyle.height || `${height}px`;
          img.style.maxWidth = computedStyle.maxWidth || '100%';
          img.style.maxHeight = computedStyle.maxHeight || '100%';
          img.style.display = computedStyle.display || 'block';
          img.style.margin = computedStyle.margin || '0';
          img.style.padding = computedStyle.padding || '0';

          // Preserve any classes
          img.className = canvas.className;

          // Replace canvas with image
          if (canvas.parentNode) {
            canvas.parentNode.insertBefore(img, canvas);
            canvas.parentNode.removeChild(canvas);
          }
        }
      } catch (error) {
        console.warn(`Failed to convert canvas to image: ${canvas.id || 'unknown'}`, error);
      }
    }
  }

  /**
   * Fetch external and inline styles
   */
  private async fetchAllStyles(): Promise<string> {
    const links = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]')
    ) as HTMLLinkElement[];

    const externalStyles = await Promise.all(
      links.map(async (link) => {
        try {
          const response = await fetch(link.href);
          return await response.text();
        } catch (error) {
          console.warn(`Failed to fetch stylesheet: ${link.href}`, error);
          return '';
        }
      })
    );

    const inlineStyles = Array.from(document.querySelectorAll('style'))
      .map((styleTag) => styleTag.innerHTML)
      .join('\n');

    return [...externalStyles, inlineStyles].join('\n');
  }

  /**
   * Convert images to base64 directly in the DOM to preserve dimensions and styles
   */
  private async convertImagesToBase64(): Promise<void> {
    if (!this.reportCanvas?.nativeElement) {
      return;
    }

    const images = Array.from(
      this.reportCanvas.nativeElement.querySelectorAll('img')
    ) as HTMLImageElement[];

    for (const img of images) {
      try {
        // Skip if already a data URL
        if (img.src.startsWith('data:')) {
          continue;
        }

        // Get computed styles to preserve dimensions and layout
        const computedStyle = window.getComputedStyle(img);

        // Get actual rendered dimensions
        const actualWidth = img.offsetWidth || img.width || parseInt(computedStyle.width, 10) || 0;
        const actualHeight = img.offsetHeight || img.height || parseInt(computedStyle.height, 10) || 0;

        // Convert to base64
        const base64 = await this.imageToBase64(img.src);

        if (base64 && base64 !== img.src) {
          // Preserve all computed styles
          img.style.width = computedStyle.width || (actualWidth > 0 ? `${actualWidth}px` : 'auto');
          img.style.height = computedStyle.height || (actualHeight > 0 ? `${actualHeight}px` : 'auto');
          img.style.maxWidth = computedStyle.maxWidth || 'none';
          img.style.maxHeight = computedStyle.maxHeight || 'none';
          img.style.minWidth = computedStyle.minWidth || '0';
          img.style.minHeight = computedStyle.minHeight || '0';
          img.style.objectFit = computedStyle.objectFit || 'fill';
          img.style.objectPosition = computedStyle.objectPosition || '50% 50%';
          img.style.display = computedStyle.display || 'inline-block';
          img.style.margin = computedStyle.margin || '0';
          img.style.padding = computedStyle.padding || '0';
          img.style.verticalAlign = computedStyle.verticalAlign || 'baseline';
          img.style.position = computedStyle.position || 'static';

          // Set explicit width/height attributes if we have actual dimensions
          if (actualWidth > 0) {
            img.width = actualWidth;
          }
          if (actualHeight > 0) {
            img.height = actualHeight;
          }

          // Update src to base64
          img.src = base64;
        }
      } catch (error) {
        console.warn(`Failed to convert image to base64: ${img.src}`, error);
      }
    }
  }

  /**
   * Convert an image to Base64
   */
  private async imageToBase64(url: string): Promise<string> {
    // Handle data URLs (already base64)
    if (url.startsWith('data:')) {
      return url;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn(`Failed to convert image to base64: ${url}`, error);
      return url; // Return original URL if conversion fails
    }
  }

  /**
   * Prepare tables by adjusting heights before export
   */
  async prepareTable(): Promise<void> {
    if (!this.reportCanvas?.nativeElement) {
      return;
    }

    const containers = Array.from(
      this.reportCanvas.nativeElement.querySelectorAll('.renderer-widget-root, .absolute')
    ) as HTMLElement[];

    let accumulatedOffset = 0;

    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      const table = container.querySelector('.p-datatable-table, table');

      let heightIncreased = false;
      let newHeight = container.clientHeight;
      let oldHeight = container.clientHeight;

      if (table) {
        const tableHeight = table.scrollHeight;

        if (container.clientHeight < tableHeight + 20) {
          newHeight = tableHeight + 20;
          container.style.height = `${newHeight}px`;
          heightIncreased = true;
        }
      }

      if (heightIncreased) {
        accumulatedOffset += newHeight - oldHeight;
        for (let j = i + 1; j < containers.length; j++) {
          const nextContainer = containers[j];
          const currentTop = parseFloat(nextContainer.style.top) || 0;
          nextContainer.style.top = `${currentTop + accumulatedOffset}px`;
        }
      }
    }
  }

  /**
   * Placeholder handlers for additional actions.
   * These can be implemented as needed.
   */
  mailReport(report: any): void {
    if(!report){return;}
    const payload = {
      from: "",
      to: "",
      emailSubject: "Generated Report",
      emailBody: "Sending the last generated report as pdf in this mail. Kindly, use it for your purusal",
      selected_reports: [report.data.reportId]
    };
   this.pageRendererService.postMail(payload).subscribe({
  next: (res) => {
    console.log("Mail sent successfully", res);
    this.showToast('success', 'Success', 'Mail Sent', false);
  },
  error: (err) => {
    console.error("Mail sending failed", err);
  }
});
  }

  previewReport(): void {
    // TODO: Implement preview functionality
  }

  exportToExcel(): void {
    // TODO: Implement export to Excel functionality
  }

  /**
   * Regenerates the PDF report, opens it in a new window, and stores it
   */
  async regenerateReport(): Promise<void> {
    if (!this.reportCanvas?.nativeElement) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to capture report content.',
        life: 3000
      });
      return;
    }

    // if (!this.reportId || !this.mappingId) {
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: 'Report ID or Mapping ID is missing.',
    //     life: 3000
    //   });
    //   return;
    // }

    this.spinner.show();

    try {
      // Prepare tables before capturing HTML
      await this.prepareTable();

      // Prepare complete HTML with styles
      const finalHtml = await this.prepareHtml();

      // Remove extra whitespace and newlines
      const htmlContent = finalHtml.replace(/\n\s*/g, '');

      // Generate PDF
      this.pageRendererService.generateReport(htmlContent).subscribe({
        next: async (blob: Blob) => {
          let pdfWindow: Window | null = null;
          let objectUrl: string | null = null;

          try {
            // Open PDF in new window
            objectUrl = window.URL.createObjectURL(blob);
            pdfWindow = window.open(objectUrl, '_blank');

            if (!pdfWindow) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Please allow pop-ups to view the PDF.',
                life: 3000
              });
            }

            // Convert blob to base64 for storage
            const base64Pdf = await this.blobToBase64(blob);

            // Prepare payload for storing report
            const payload = {
              reportId: this.mappingId || '',
              reportMappingId: this.mappingId || '',
              pdfBuffer: base64Pdf,
            };

            // Store the PDF
            this.pageRendererService.storeReport(payload).subscribe({
              next: () => {
                // Close the PDF window after successful storage
                if (pdfWindow && !pdfWindow.closed) {
                  pdfWindow.close();
                }
                // Clean up object URL
                if (objectUrl) {
                  window.URL.revokeObjectURL(objectUrl);
                }

                this.loadReportHistory(this.reportId || this.currentMappingData?.templateId || this.mappingId);

                this.spinner.hide();
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'PDF regenerated and stored successfully.',
                  life: 3000
                });
              },
              error: (storeErr: any) => {
                // Close the PDF window even if storage fails
                if (pdfWindow && !pdfWindow.closed) {
                  pdfWindow.close();
                }
                // Clean up object URL
                if (objectUrl) {
                  window.URL.revokeObjectURL(objectUrl);
                }

                console.error('Error storing PDF report:', storeErr);
                this.spinner.hide();
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: storeErr?.error?.message || 'PDF generated but failed to store.',
                  life: 3000
                });
              }
            });

          } catch (error) {
            // Close the PDF window on error
            if (pdfWindow && !pdfWindow.closed) {
              pdfWindow.close();
            }
            // Clean up object URL
            if (objectUrl) {
              window.URL.revokeObjectURL(objectUrl);
            }

            console.error('Error processing PDF:', error);
            this.spinner.hide();
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to process PDF.',
              life: 3000
            });
          }
        },
        error: (err: any) => {
          console.error('Error generating PDF report:', err);
          this.spinner.hide();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to generate PDF.',
            life: 3000
          });
        }
      });
    } catch (error) {
      console.error('Error preparing HTML:', error);
      this.spinner.hide();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to prepare HTML content.',
        life: 3000
      });
    }
  }

  /**
   * Convert Blob to Base64 string (full data URL format)
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Return the full base64 data URL format (data:application/pdf;base64,<base64string>)
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Loads report re-generation version history from reportID using getReportHistory endpoint
   */
  loadReportHistory(reportID: string): void {
    console.log('coming here', reportID)
    this.loadingHistory = true;
    this.reportHistory = [];
    this.pageAdminService.getReportHistory(reportID).subscribe({
      next: (res: any) => {
        const reportsList = res.versionHistory || res;
        this.reportHistory = Array.isArray(reportsList) ? reportsList : [];
        this.lastReport = reportsList?.[0]?.data || {}
        console.log('lastReport', this.lastReport);
        this.loadingHistory = false;
      },
      error: (err) => {
        console.error('Error loading report history:', err);
        this.loadingHistory = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load report history.',
          life: 3000
        });
      }
    });
  }

  /**
   * Converts a base64 string (or data URL, or Buffer object) into a Blob
   */
  private base64ToBlob(data: any, contentType: string): Blob {
    let raw: string;

    if (typeof data === 'string') {
      // Strip data URL prefix if present: "data:application/pdf;base64,XXXX"
      raw = data.includes(',') ? data.split(',')[1] : data;
    } else if (data?.type === 'Buffer' && Array.isArray(data.data)) {
      // Node-style Buffer object { type: 'Buffer', data: [bytes...] }
      const uint8 = new Uint8Array(data.data);
      return new Blob([uint8], { type: contentType });
    } else {
      throw new Error('Unsupported pdfBuffer format');
    }

    const byteCharacters = atob(raw);
    const byteArrays: Uint8Array[] = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays as BlobPart[], { type: contentType });
  }

  /**
   * Lazily creates and caches a Blob URL from the version's pdfBuffer
   */
  private getOrCreateBlobUrl(version: any): string | null {
    // Return cached URL if already created
    if (version._pdfBlobUrl) {
      return version._pdfBlobUrl;
    }

    const pdfBuffer = version.data?.pdfBuffer || version.pdfBuffer;
    if (!pdfBuffer) {
      console.warn('No pdfBuffer on version:', version);
      return null;
    }

    try {
      const blob = this.base64ToBlob(pdfBuffer, 'application/pdf');
      version._pdfBlobUrl = URL.createObjectURL(blob);
      return version._pdfBlobUrl;
    } catch (e) {
      console.error('Failed to create blob URL. pdfBuffer type:', typeof version.pdfBuffer, e);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to process PDF data.',
        life: 3000
      });
      return null;
    }
  }

  /**
   * Opens the version history modal and loads report history
   */
  openHistoryModal(): void {
    this.showHistoryModal = true;
    const id = this.reportId || this.currentMappingData?.templateId || this.mappingId;
    if (id) {
      this.loadReportHistory(id);
    }
  }

  /**
   * Opens an inline PDF preview for a given version
   */
  previewVersion(version: any): void {
    const blobUrl = this.getOrCreateBlobUrl(version);
    if (!blobUrl) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No PDF',
        detail: 'No PDF available for this version.',
        life: 3000
      });
      return;
    }
    this.previewPdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    this.showPdfPreview = true;
  }

  /**
   * Downloads the PDF for a given version
   */
  downloadVersion(version: any): void {
    const blobUrl = this.getOrCreateBlobUrl(version);
    if (!blobUrl) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No PDF',
        detail: 'No PDF available for this version.',
        life: 3000
      });
      return;
    }
    const link = document.createElement('a');
    link.href = blobUrl;
    const updatedAt = version.data?.updatedAt || version.updatedAt;
    const date = updatedAt
      ? this.datePipe.transform(new Date(updatedAt), 'yyyy-MM-dd_HH-mm') || ''
      : '';
    const reportName = version.data?.reportName || 'report';
    link.download = `${reportName}-version${version.version ? '-v' + version.version : ''}-${date}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Opens the PDF in a new window and triggers the print dialog
   */
  printVersion(version: any): void {
    const blobUrl = this.getOrCreateBlobUrl(version);
    if (!blobUrl) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No PDF',
        detail: 'No PDF available for this version.',
        life: 3000
      });
      return;
    }
    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Pop-up Blocked',
        detail: 'Please allow pop-ups to print the PDF.',
        life: 3000
      });
    }
  }

  /**
   * Closes the PDF preview dialog
   */
  closePreview(): void {
    this.showPdfPreview = false;
    this.previewPdfSrc = null;
  }
}
