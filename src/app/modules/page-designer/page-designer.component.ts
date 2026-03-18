import { Component, HostListener, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PageAdministratorService } from '../page-administrator/page-administrator.service';
import { ImageUploadComponent } from '../page-administrator/components/dialogs/image-upload/image-upload.component';
import { CodeEditorComponent } from '../page-administrator/components/dialogs/code-editor/code-editor.component';
import { LlmChatboxComponent } from '../page-administrator/components/dialogs/llm-chatbox/llm-chatbox.component';
import { TemplateConfirmationComponent } from '../page-administrator/components/dialogs/template-confirmation/template-confirmation.component';
import { Router } from '@angular/router';
import { CanvasConfigComponent } from '../page-administrator/components/dialogs/canvas-config/canvas-config.component';
import { SampleDataMetadataComponent } from '../page-administrator/components/dialogs/sample-data-metadata/sample-data-metadata.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-page-designer',
  templateUrl: './page-designer.component.html',
  styleUrl: './page-designer.component.css',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class PageDesignerComponent implements OnInit {
  leftWidth = 260;
  rightWidth = 320;
  private minSidebarWidth = 200;
  private maxSidebarWidth = 480;
  payload: any;

  private resizingSidebarSide: 'left' | 'right' | null = null;
  private startX = 0;
  private startWidth = 0;

  private resizingWidgetId: string | null = null;
  private widgetResizeStart = {
    mouseX: 0,
    mouseY: 0,
    widthPx: 0,
    heightPx: 0,
  };
  private isDragging = false; // Track if widget is being dragged
  private draggingWidgetId: string | null = null; // Track which widget is being dragged

  // Alignment guides (Figma-like)
  alignmentGuides: {
    type: 'vertical' | 'horizontal';
    position: number; // Position in pixels
    start: number; // Start position in pixels
    end: number; // End position in pixels
  }[] = [];
  private readonly SNAP_THRESHOLD = 5; // Pixels threshold for snapping/alignment detection

  // Palette widgets (same structure as used in page builder: tabs -> items)
  tabs: any[] = [];

  // Templates list
  templates: any[] = [];

  // Sidebar tabs for switching between Components and Templates
  sidebarTabs: string[] = ['Widgets', 'Templates'];
  selectedSidebarTab: string = 'Widgets';

  // Right sidebar panel tabs (Styles vs Data Mapping)
  rightPanelTabs = [
    { label: 'Styles', value: 'Styles' },
    { label: 'Mapping', value: 'Data Mapping' }
  ];
  rightPanelTab: string = 'Styles';

  // Designer canvas widgets
  canvasWidgets: DesignerWidget[] = [];
  selectedWidget: DesignerWidget | null = null;

  // Stores the last data/displayComponent JSON used to auto-generate widgets
  private lastDataMappingJson: any = null;
  formConfig: { appId: string, orgId: string, reportType: string } | any;

  // Sample data switching
  sampleDataArray: any[] = [];
  selectedSampleIndex: number = -1; // -1 means using original dataObject
  sampleDataOptions: any[] = [];

  showUi: boolean = false;

  // Widget styling
  widgetStyles: any = {
    backgroundColor: '',
    backgroundMode: 'transparent', // 'transparent' | 'color' | 'image' | 'gradient'
    backgroundImageUrl: '',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    gradientType: 'linear', // 'linear' | 'radial'
    gradientAngle: 90,
    gradientStartColor: '#2196F3',
    gradientEndColor: '#4CAF50',
    fontFamily: '',
    fontSize: 14,
    fontWeight: '',
    color: '',
    textAlign: 'left',
    textDecoration: '',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderRightStyle: 'solid',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopColor: '#000000',
    borderBottomColor: '#000000',
    borderLeftColor: '#000000',
    borderRightColor: '#000000',
    // Chart-specific styles
    borderColors: ['#FF9F40', '#4BC0C0', '#36A2EB'],
    backgroundColors: ['#4CAF50', '#2196F3', '#FFEB3B'],
    tooltipColor: '#ffffff',
    tooltipBgColor: '#000000',
    gridColor: '#dfe7ef',
    bgColor: '#2196F3',
    borderColor: '#2196F3',
    pBorderColor: '#2196F3',
    phBgColor: '#2196F3',
    phBorderColor: '#2196F3',
    bg1: '#2196F3',
    bg2: '#4CAF50',
  };

  // Styling options
  borderStyles = ['solid', 'dotted', 'dashed', 'groove', 'none'];
  bgSizeOptions: string[] = ['auto', 'cover', 'contain'];
  bgRepeatOptions: string[] = ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'];
  bgPositionOptions: string[] = [
    'left top',
    'left center',
    'left bottom',
    'center top',
    'center center',
    'center bottom',
    'right top',
    'right center',
    'right bottom'
  ];
  fontFamilies: any[] = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Helvetica', value: 'Helvetica' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Verdana', value: 'Verdana' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Palatino', value: 'Palatino' },
    { label: 'Garamond', value: 'Garamond' },
    { label: 'Bookman', value: 'Bookman' },
    { label: 'Comic Sans MS', value: 'Comic Sans MS' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS' },
    { label: 'Trebuchet', value: 'trebuchet' },
    { label: 'Arial Black', value: 'Arial Black' },
    { label: 'Impact', value: 'Impact' },
    { label: 'Manifa Pro', value: 'manifapro' },
    { label: 'Manifa Pro Italic', value: 'manifapro-italic' },
    { label: 'Ghawar', value: 'ghawar' },
    { label: 'Segoe UI', value: 'segoe' }
  ];
  fontWeights: any[] = [
    { label: 'Normal', value: 'normal' },
    { label: 'Bold', value: 'bold' },
    { label: '100', value: '100' },
    { label: '200', value: '200' },
    { label: '300', value: '300' },
    { label: '400', value: '400' },
    { label: '500', value: '500' },
    { label: '600', value: '600' },
    { label: '700', value: '700' },
    { label: '800', value: '800' },
    { label: '900', value: '900' }
  ];
  justifyOptions: any[] = [
    { label: 'Left', justify: 'left' },
    { label: 'Center', justify: 'center' },
    { label: 'Right', justify: 'right' },
    { label: 'Justify', justify: 'justify' }
  ];

  // Canvas styling
  canvasStyles: any = {
    backgroundColor: '',
    backgroundMode: 'color', // 'color' | 'image' | 'gradient'
    backgroundImageUrl: '',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    gradientType: 'linear', // 'linear' | 'radial'
    gradientAngle: 90,
    gradientStartColor: '#2196F3',
    gradientEndColor: '#4CAF50',
  };

  // Canvas size in pixels (used to translate between px and relative 0..1 coords)
  canvasWidth = 1200;
  public canvasBaseHeight = 800;
  canvasHeightPx: number = 800; // Dynamic canvas height
  canvasMinHeightPx: number = 800; // Minimum canvas height (80vh or 90vh)
  configRef!: DynamicDialogRef;
  ref: DynamicDialogRef | undefined;
  codeRef: DynamicDialogRef | undefined;
  llmRef: DynamicDialogRef | undefined;
  sampleDataEditorRef: DynamicDialogRef | undefined;
  canvasHeight: any;

  constructor(
    private pageAdminService: PageAdministratorService,
    public sanitizer: DomSanitizer,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {
    console.log(this.router.getCurrentNavigation()?.extras.state);
    this.formConfig = this.router.getCurrentNavigation()?.extras.state;
    this.payload = {
      ...(this.formConfig?.appId && { appId: this.formConfig?.appId }),
      ...(this.formConfig?.orgId && { orgId: this.formConfig?.orgId })
    };
  }

  triggerWorkflow() {
    const payload = {
      "NewPageName": "Dashboard",
      "NewPageType": "Fiori",
      "NewPageId": "NP001",
      "NewPageObject": "Z_DASHBOARD",
      "NewPageLink": "/sap/bc/ui5_ui5/sap/zdashboard",

      "OldPageName": "Home",
      "OldPageType": "Fiori",
      "OldPageId": "OP001",
      "OldPageObject": "Z_HOME",
      "OldPageLink": "/sap/bc/ui5_ui5/sap/zhome",

      "CreatedOn": "2025-09-30",
      "CreatedBy": "HEMANTH",
      "Version": "1.0",

      "Message": "Page updated successfully",
      "MessageType": "S"
    };

    // Make POST request to Node.js backend
    this.http.post(environment.apiUrl + '/triggerWorkflow', payload).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Workflow Triggered Successfully' });
        console.log('Workflow response:', res);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to trigger workflow' });
        console.error('Workflow POST error:', err);
      }
    });
  }

  ngOnInit(): void {
    this.tabs = this.pageAdminService.getAllWidgtes() || [];
    if (!this.formConfig?.reportType || !this.formConfig?.appId) {
      this.openConfigDiaglog();
    }
    else if (this.formConfig?.reportType === 'Card Design') {
      this.openConfigDiaglog();
    }
    else {
      this.showUi = true;
      this.getTemplates();
      
      // Check if templateId is provided (edit mode)
      if (this.formConfig?.templateId && this.formConfig?.mode === 'edit') {
        // Switch to Templates tab
        this.selectedSidebarTab = 'Templates';
        
        // Wait for templates to load, then auto-select and load the template
        setTimeout(() => {
          const template = this.templates.find(t => 
            t.templateId === this.formConfig.templateId || 
            t._id === this.formConfig.templateId
          );
          
          if (template) {
            this.loadTemplate(template);
          }
        }, 500); // Give time for templates to load
      }
    }
    this.updateCanvasMinHeight();
    this.updateCanvasHeight();
  }

  openConfigDiaglog() {
    this.configRef = this.dialogService.open(CanvasConfigComponent, {
      data: this.formConfig,
      header: 'Canvas Config ',
      width: '25%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true
    });

    this.configRef.onClose.subscribe((config: any) => {
      if (config) {
        this.formConfig = {};
        this.formConfig.appId = config.app
        this.formConfig.orgId = config.org;
        this.formConfig.reportType = config.canvasType
        this.showUi = true;
        this.getTemplates();
        if (config?.canvasWidth && config?.canvasHeight) {
        } else {
        }
      }
      else {
        this.router.navigateByUrl('/pageAdmin/pageManager')
      }
    });
  }


  /**
   * Updates the minimum canvas height based on viewport (85vh)
   */
  updateCanvasMinHeight(): void {
    // 85vh = 85% of viewport height
    this.canvasMinHeightPx = window.innerHeight * 0.85;
  }

  /**
   * Finds a widget by ID (searches canvas widgets, section children, and iterator rows)
   */
  private findWidgetById(id: string): DesignerWidget | null {
    for (const widget of this.canvasWidgets) {
      if (widget.id === id) {
        return widget;
      }
      if (widget.children) {
        for (const child of widget.children) {
          if (child.id === id) return child;
        }
      }
      if (widget.rows) {
        for (const row of widget.rows) {
          for (const child of row) {
            if (child.id === id) return child;
          }
        }
      }
    }
    return null;
  }

  /**
   * Recalculates the canvas height dynamically based on widget positions
   * Triggers on: widget drop, resize end, and adding new widget
   * 
   * Uses canvasMinHeightPx as the reference height to ensure consistent calculations
   * regardless of current canvas height, preventing feedback loops
   */
  updateCanvasHeight(): void {
    if (!this.canvasWidgets.length) {
      // No widgets: use minimum height (85vh)
      this.canvasHeightPx = this.canvasMinHeightPx;
      return;
    }

    // Calculate the maximum bottom edge position among all widgets
    // Widget positions are in relative coordinates (0-1) based on canvas height
    const maxBottomRel = this.canvasWidgets.reduce((max, widget) => {
      const widgetY = widget.position.y ?? 0;
      const widgetH = widget.position.h ?? 0.15;
      const bottomEdge = widgetY + widgetH;
      return Math.max(max, bottomEdge);
    }, 0);

    // Use minimum canvas height as the reference to convert relative to pixels
    // This ensures consistent calculations regardless of current canvas height
    // and prevents feedback loops when canvas height changes
    const referenceHeight = this.canvasMinHeightPx;

    // Convert relative bottom position to pixels based on reference height
    const maxBottomPx = referenceHeight * maxBottomRel;

    // Buffer for padding (50px)
    const buffer = 50;

    // Set canvas height to the larger of: max widget bottom + buffer, or minimum 85vh
    this.canvasHeightPx = Math.max(maxBottomPx + buffer, this.canvasMinHeightPx);
  }

  startResize(side: 'left' | 'right', event: MouseEvent) {
    event.preventDefault();
    this.resizingSidebarSide = side;
    this.startX = event.clientX;
    this.startWidth = side === 'left' ? this.leftWidth : this.rightWidth;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    // Sidebar resize
    if (this.resizingSidebarSide) {
      const delta = event.clientX - this.startX;
      let newWidth =
        this.resizingSidebarSide === 'left'
          ? this.startWidth + delta
          : this.startWidth - delta;

      newWidth = Math.max(
        this.minSidebarWidth,
        Math.min(this.maxSidebarWidth, newWidth)
      );

      if (this.resizingSidebarSide === 'left') {
        this.leftWidth = newWidth;
      } else if (this.resizingSidebarSide === 'right') {
        this.rightWidth = newWidth;
      }
    }

    // Widget resize with alignment detection
    if (this.resizingWidgetId) {
      const canvas = document.getElementById('designer-canvas');
      if (!canvas) {
        return;
      }

      const widget = this.findWidgetById(this.resizingWidgetId);
      if (!widget) {
        return;
      }

      const deltaX = event.clientX - this.widgetResizeStart.mouseX;
      const deltaY = event.clientY - this.widgetResizeStart.mouseY;

      // Check if this is a nested widget (has parentId)
      if (widget.parentId) {
        const parent = this.findWidgetById(widget.parentId);
        if (parent) {
          let container: HTMLElement | null = null;
          let siblings: DesignerWidget[] = [];

          if (parent.children) {
            container = canvas.querySelector(`[data-section-id="${parent.id}"]`) as HTMLElement;
            siblings = parent.children;
          } else if (parent.rows != null) {
            container = canvas.querySelector(`[data-iterator-id="${parent.id}"] .designer-iterator-content`) as HTMLElement;

            // Find which row the widget belongs to if rowIndex is not directly set
            let rowIndex = widget.rowIndex;
            if (rowIndex === undefined) {
              rowIndex = parent.rows.findIndex(row => row.some(w => w.id === widget.id));
            }

            if (rowIndex >= 0) {
              siblings = parent.rows[rowIndex] || [];
            }
          }

          if (container) {
            const sectionWidth = container.clientWidth;
            const sectionHeight = container.clientHeight;
            const newWidthPx = Math.max(this.widgetResizeStart.widthPx + deltaX, 40);
            const newHeightPx = Math.max(this.widgetResizeStart.heightPx + deltaY, 40);

            const newW = newWidthPx / sectionWidth;
            const newH = newHeightPx / sectionHeight;

            widget.position.w = Math.min(Math.max(newW, 0.05), 1 - widget.position.x);
            widget.position.h = Math.min(Math.max(newH, 0.05), 1 - widget.position.y);

            this.detectAlignmentGuides(widget, siblings, sectionWidth, sectionHeight, true);
            // Skip typical canvas resize logic
            return;
          }
        }
      } else {
        // Regular canvas widget
        const canvasWidth = canvas.clientWidth;
        const canvasHeight = this.canvasMinHeightPx;

        const newWidthPx = Math.max(this.widgetResizeStart.widthPx + deltaX, 40);
        const newHeightPx = Math.max(this.widgetResizeStart.heightPx + deltaY, 40);

        const newW = newWidthPx / canvasWidth;
        const newH = newHeightPx / canvasHeight;

        widget.position.w = Math.min(Math.max(newW, 0.05), 1 - widget.position.x);
        widget.position.h = Math.max(newH, 0.05);

        // Detect alignment during resize
        this.detectAlignmentGuides(widget, this.canvasWidgets, canvasWidth, canvasHeight, false);
      }
    }

    // Widget drag with alignment detection
    if (this.isDragging && this.draggingWidgetId) {
      const canvas = document.getElementById('designer-canvas');
      if (!canvas) {
        return;
      }

      const widget = this.findWidgetById(this.draggingWidgetId);
      if (!widget) {
        return;
      }

      // Handle canvas-level widgets
      if (!widget.parentId) {
        // Get current drag position from CDK Drag
        const dragElement = canvas.querySelector(`[data-widget-id="${widget.id}"]`) as HTMLElement;
        if (dragElement) {
          const canvasWidth = canvas.clientWidth;
          const canvasHeight = this.canvasMinHeightPx;
          const rect = dragElement.getBoundingClientRect();
          const canvasRect = canvas.getBoundingClientRect();

          // Calculate current position relative to canvas
          const currentX = rect.left - canvasRect.left;
          const currentY = rect.top - canvasRect.top;
          const currentWidth = rect.width;
          const currentHeight = rect.height;

          // Detect alignment during drag
          this.detectAlignmentGuides(widget, this.canvasWidgets, canvasWidth, canvasHeight, false, {
            x: currentX,
            y: currentY,
            w: currentWidth,
            h: currentHeight
          });
        }
      } else {
        // Handle nested widgets in sections
        const sectionWidget = this.findWidgetById(widget.parentId);
        if (sectionWidget) {
          const sectionContainer = canvas.querySelector(`[data-section-id="${sectionWidget.id}"]`) as HTMLElement;
          if (sectionContainer) {
            const sectionRect = sectionContainer.getBoundingClientRect();
            const sectionWidth = sectionRect.width;
            const sectionHeight = sectionRect.height;

            // Find the nested widget element
            const nestedElements = sectionContainer.querySelectorAll('.absolute');
            let nestedElement: HTMLElement | null = null;
            for (const el of Array.from(nestedElements)) {
              const widgetEl = el.querySelector('.designer-widget-root');
              if (widgetEl && widgetEl.getAttribute('data-widget-id') === widget.id) {
                nestedElement = el as HTMLElement;
                break;
              }
            }

            if (nestedElement) {
              const rect = nestedElement.getBoundingClientRect();
              const containerRect = sectionContainer.getBoundingClientRect();

              const currentX = rect.left - containerRect.left;
              const currentY = rect.top - containerRect.top;
              const currentWidth = rect.width;
              const currentHeight = rect.height;

              // Detect alignment for nested widgets
              if (sectionWidget.children) {
                this.detectAlignmentGuides(widget, sectionWidget.children, sectionWidth, sectionHeight, true, {
                  x: currentX,
                  y: currentY,
                  w: currentWidth,
                  h: currentHeight
                });
              }
            }
          }
        }
      }
    }
  }

  @HostListener('window:mouseup')
  stopResize() {
    if (this.resizingWidgetId) {
      // Widget resize ended - update canvas height
      this.updateCanvasHeight();
    }
    this.resizingSidebarSide = null;
    this.resizingWidgetId = null;
    this.draggingWidgetId = null;
    // Clear alignment guides when interaction ends
    this.alignmentGuides = [];
  }

  onPaletteWidgetClick(widgetDef: any): void {
    const id = `w-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const defaultInput = this.createDefaultInput(widgetDef.type);

    // Check if a section widget is selected - if so, add to that section
    if (this.selectedWidget?.type === 'section') {
      this.addWidgetToSection(widgetDef, id, defaultInput, this.selectedWidget);
      return;
    }
    // Check if an iterator widget is selected - if so, add to first row (template)
    if (this.selectedWidget?.type === 'iterator') {
      this.addWidgetToIterator(widgetDef, id, defaultInput, this.selectedWidget);
      return;
    }

    // Find the next available position that doesn't overlap
    const availablePosition = this.findAvailablePosition(0.25, 0.15);

    // Map widget type to selector if not provided
    const selector = widgetDef.selector || widgetDef.component || this.getSelectorFromType(widgetDef.type);

    const newWidget: DesignerWidget = {
      id,
      label: widgetDef.label,
      type: widgetDef.type,
      selector: selector,
      position: {
        x: Math.max(0, Math.min(availablePosition.x, 0.95)), // Clamp x to 0-0.95
        y: Math.max(0, availablePosition.y), // Clamp y to >= 0
        w: 0.25,
        h: 0.15,
        zIndex: this.canvasWidgets.length + 1,
      },
      input: defaultInput,
    };

    // If it's a section widget, initialize with empty children array
    if (widgetDef.type === 'section') {
      newWidget.children = [];
    }
    // If it's an iterator widget, initialize with one empty row
    if (widgetDef.type === 'iterator') {
      newWidget.rows = [[]];
    }

    this.canvasWidgets = [...this.canvasWidgets, newWidget];
    this.selectedWidget = newWidget;
    // New widget added - update canvas height
    this.updateCanvasHeight();

    // Scroll to show the newly added widget if it's below the visible area
    setTimeout(() => this.scrollToWidget(newWidget), 100);
  }

  /**
   * Adds a widget to a section (nested widget)
   */
  private addWidgetToSection(widgetDef: any, id: string, defaultInput: any, sectionWidget: DesignerWidget): void {
    if (!sectionWidget.children) {
      sectionWidget.children = [];
    }

    // Find available position within the section
    const availablePosition = this.findAvailablePositionInSection(sectionWidget, 0.25, 0.15);

    // Map widget type to selector if not provided
    const selector = widgetDef.selector || widgetDef.component || this.getSelectorFromType(widgetDef.type);

    const nestedWidget: DesignerWidget = {
      id,
      label: widgetDef.label,
      type: widgetDef.type,
      selector: selector,
      position: {
        x: Math.max(0, Math.min(availablePosition.x, 0.95)),
        y: Math.max(0, availablePosition.y),
        w: 0.25,
        h: 0.15,
        zIndex: sectionWidget.children.length + 1,
      },
      input: defaultInput,
      parentId: sectionWidget.id,
    };

    sectionWidget.children = [...sectionWidget.children, nestedWidget];
    this.selectedWidget = nestedWidget;
  }

  /**
   * Adds a widget to the first row (template) of an iterator
   */
  private addWidgetToIterator(widgetDef: any, id: string, defaultInput: any, iteratorWidget: DesignerWidget): void {
    if (!iteratorWidget.rows || iteratorWidget.rows.length === 0) {
      iteratorWidget.rows = [[]];
    }
    const templateRow = iteratorWidget.rows[0];
    const availablePosition = this.findAvailablePositionInIteratorRow(iteratorWidget, 0, 0.25, 0.15);

    const selector = widgetDef.selector || widgetDef.component || this.getSelectorFromType(widgetDef.type);
    const nestedWidget: DesignerWidget = {
      id,
      label: widgetDef.label,
      type: widgetDef.type,
      selector,
      position: {
        x: Math.max(0, Math.min(availablePosition.x, 0.95)),
        y: Math.max(0, availablePosition.y),
        w: 0.25,
        h: 0.15,
        zIndex: templateRow.length + 1,
      },
      input: defaultInput,
      parentId: iteratorWidget.id,
      rowIndex: 0,
    };

    iteratorWidget.rows[0] = [...templateRow, nestedWidget];
    this.selectedWidget = nestedWidget;
  }

  /**
   * Finds available position within an iterator row for nested widgets
   */
  private findAvailablePositionInIteratorRow(iteratorWidget: DesignerWidget, rowIndex: number, widgetWidth: number, widgetHeight: number): { x: number; y: number } {
    const row = iteratorWidget.rows?.[rowIndex];
    if (!row || row.length === 0) {
      return { x: 0.05, y: 0.05 };
    }
    const gridStepX = 0.05;
    const gridStepY = 0.05;
    const maxX = 0.95 - widgetWidth;
    const maxBottomRel = row.reduce((max, w) => Math.max(max, (w.position.y ?? 0) + (w.position.h ?? 0.15)), 0);
    const maxYForRow = Math.min(0.95 - widgetHeight, maxBottomRel + 0.05);
    for (let y = 0.05; y <= maxYForRow; y += gridStepY) {
      for (let x = 0.05; x <= maxX; x += gridStepX) {
        const testPosition = { x, y, w: widgetWidth, h: widgetHeight };
        const hasOverlap = row.some((w) => this.checkOverlap(testPosition, w.position));
        if (!hasOverlap) return { x, y };
      }
    }
    return { x: 0.05, y: maxBottomRel + 0.05 };
  }

  /**
   * Finds available position within a section for nested widgets
   */
  private findAvailablePositionInSection(sectionWidget: DesignerWidget, widgetWidth: number, widgetHeight: number): { x: number; y: number } {
    if (!sectionWidget.children || sectionWidget.children.length === 0) {
      return { x: 0.05, y: 0.05 };
    }

    const gridStepX = 0.05;
    const gridStepY = 0.05;
    const maxX = 0.95 - widgetWidth;

    // Calculate max bottom of existing nested widgets
    const maxBottomRel = sectionWidget.children.reduce((max, widget) => {
      const bottom = (widget.position.y ?? 0) + (widget.position.h ?? 0.15);
      return Math.max(max, bottom);
    }, 0);

    const maxYForSection = Math.min(0.95 - widgetHeight, maxBottomRel + 0.5);

    // Search for available space
    for (let y = 0.05; y <= maxYForSection; y += gridStepY) {
      for (let x = 0.05; x <= maxX; x += gridStepX) {
        const testPosition = { x, y, w: widgetWidth, h: widgetHeight };

        const hasOverlap = sectionWidget.children.some((widget) =>
          this.checkOverlap(testPosition, widget.position)
        );

        if (!hasOverlap) {
          return { x, y };
        }
      }
    }

    // Place below existing widgets
    const newY = Math.min(maxBottomRel + 0.05, 0.95 - widgetHeight);
    return { x: 0.05, y: newY };
  }

  /**
   * Scrolls the canvas container to show the specified widget
   */
  private scrollToWidget(widget: DesignerWidget): void {
    const scrollContainer = document.querySelector('.flex-1.overflow-auto');

    if (!scrollContainer) {
      return;
    }

    const container = scrollContainer as HTMLElement;
    const canvas = document.getElementById('designer-canvas');

    if (!canvas) {
      return;
    }

    // Calculate widget position in pixels relative to canvas
    const canvasHeight = canvas.clientHeight;
    const widgetTopPx = (widget.position.y ?? 0) * canvasHeight;
    const widgetBottomPx = widgetTopPx + ((widget.position.h ?? 0.15) * canvasHeight);

    // Get canvas position relative to scroll container
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate if widget is below visible area
    const widgetAbsoluteTop = canvasRect.top - containerRect.top + container.scrollTop + widgetTopPx;
    const containerViewportBottom = container.scrollTop + container.clientHeight;

    // If widget is below the visible area, scroll to show it
    if (widgetAbsoluteTop + (widgetBottomPx - widgetTopPx) > containerViewportBottom) {
      // Scroll to show the widget with some padding
      const targetScroll = widgetAbsoluteTop - container.clientHeight / 2;
      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  }

  /**
   * Finds the next available position on the canvas that doesn't overlap with existing widgets
   * @param widgetWidth - Width of the widget (0-1)
   * @param widgetHeight - Height of the widget (0-1)
   * @param startX - Optional starting X position to search from
   * @param startY - Optional starting Y position to search from
   */
  private findAvailablePosition(widgetWidth: number, widgetHeight: number, startX?: number, startY?: number): { x: number; y: number } {
    if (this.canvasWidgets.length === 0) {
      return { x: startX ?? 0.05, y: startY ?? 0.05 };
    }

    // Grid-based placement: try positions in a grid pattern
    const gridStepX = 0.05; // 5% increments horizontally
    const gridStepY = 0.05; // 5% increments vertically
    const maxX = 0.95 - widgetWidth; // Don't place beyond canvas edge

    const maxBottomRel = this.canvasWidgets.reduce((max, widget) => {
      const bottom = (widget.position.y ?? 0) + (widget.position.h ?? 0.15);
      return Math.max(max, bottom);
    }, 0);

    const availableCanvasHeightRel = this.canvasHeightPx / this.canvasMinHeightPx;
    const maxYForCurrentCanvas = availableCanvasHeightRel - widgetHeight;
    const searchLimitY = Math.max(maxYForCurrentCanvas, maxBottomRel + 0.5);

    const searchStartX = startX ?? 0.05;
    const searchStartY = startY ?? 0.05;

    for (let y = searchStartY; y <= searchLimitY; y += gridStepY) {
      for (let x = searchStartX; x <= maxX; x += gridStepX) {
        const testPosition = { x, y, w: widgetWidth, h: widgetHeight };

        const hasOverlap = this.canvasWidgets.some((widget) =>
          this.checkOverlap(testPosition, widget.position)
        );

        if (!hasOverlap) {
          return { x, y };
        }
      }
    }

    // Place below all widgets
    const newYRel = maxBottomRel + (20 / this.canvasMinHeightPx);
    return { x: 0.05, y: newYRel };
  }

  /**
   * Checks if two rectangles overlap
   */
  private checkOverlap(
    rect1: { x: number; y: number; w: number; h: number },
    rect2: { x: number; y: number; w: number; h: number }
  ): boolean {
    return !(
      rect1.x + rect1.w <= rect2.x ||
      rect2.x + rect2.w <= rect1.x ||
      rect1.y + rect1.h <= rect2.y ||
      rect2.y + rect2.h <= rect1.y
    );
  }

  private createDefaultInput(type: string): any {
    // Basic defaults; charts use these to render sample data
    // Default style with transparent background
    const defaultStyle = {
      backgroundMode: 'transparent',
      backgroundColor: 'transparent'
    };

    switch (type) {
      case 'pie-chart':
        return {
          labels: ['A', 'B', 'C'],
          values: [540, 300, 400],
          style: { ...defaultStyle },
        };
      case 'donut-chart':
        return {
          labels: ['A', 'B', 'C'],
          values: [100, 200, 300],
          style: { ...defaultStyle },
        };
      case 'polar':
        return {
          labels: ['Green', 'Yellow', 'Blue'],
          values: [11, 16, 7, 3, 14],
          title: 'Title',
          style: { ...defaultStyle },
        };
      case 'radar':
        return {
          labels: [
            'Eating',
            'Drinking',
            'Sleeping',
            'Designing',
            'Coding',
            'Cycling',
            'Running',
          ],
          values: [65, 59, 90, 81, 56, 55, 40],
          title: 'Title',
          style: { ...defaultStyle },
        };
      case 'bar-chart':
        return {
          labels: ['Q1', 'Q2', 'Q3'],
          values: [540, 325, 702],
          title: 'Title',
          style: { ...defaultStyle },
        };
      case 'line':
        return {
          labels: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
          ],
          values: [65, 59, 80, 81, 56, 55, 40],
          title: 'Title',
          style: { ...defaultStyle },
        };
      case 'hbar':
        return {
          labels: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
          ],
          values: [65, 59, 80, 81, 56, 55, 40],
          title: 'Title',
          style: { ...defaultStyle },
        };
      case 'svbar':
        return {
          labels: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
          ],
          values1: [50, 25, 12, 48, 90, 76, 42],
          values2: [21, 84, 24, 75, 37, 65, 34],
          title1: 'Title1',
          title2: 'Title2',
          style: { ...defaultStyle },
        };
      case 'shbar':
        return {
          labels: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
          ],
          values1: [50, 25, 12, 48, 90, 76, 42],
          values2: [21, 84, 24, 75, 37, 65, 34],
          title1: 'Title1',
          title2: 'Title2',
          style: { ...defaultStyle },
        };
      case 'apex-line-chart':
        return {
          labels: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          values: [31, 40, 28, 51, 42, 109, 100],
          style: { ...defaultStyle },
        };
      case 'btn':
        return {
          buttonLabel: 'Button',
          style: { ...defaultStyle },
        };
      case 'btn-icon':
        return {
          icon: 'pi pi-user',
          style: { ...defaultStyle },
        };
      case 'image':
        return {
          src: '/assets/images/svgs/no-image.svg',
          alterateText: 'Image',
          style: { ...defaultStyle },
        };
      case 'primeng-dynamic-table':
        const attributes = Array(5).fill(0).map((_, i) => ({ attributeName: `Column${i + 1}`, order: i }));
        const products = Array(2).fill(0).map(() =>
          attributes.reduce((obj, attr) => ({ ...obj, [attr.attributeName]: attr.attributeName }), {})
        );
        return {
          dataSets: { attributes, products },
          style: { ...defaultStyle },
          emitterId: null,
          id: null,
        };
      case 'static-table':
        return {
          style: { ...defaultStyle },
        };
      case 'video':
        return {
          videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
          thumbnail: '/assets/images/svgs/no-image.svg',
          style: { ...defaultStyle },
        };
      case 'dropdown':
        return {
          // Sample static options so the dropdown is usable in the designer
          data: Array(5)
            .fill(0)
            .map((_, i) => ({ name: `Value${i + 1}`, code: `V${i + 1}` })),
          optionValue: '',
          optionLabel: '',
          value: '',
          style: { ...defaultStyle },
        };
      case 'progress-bar':
        return { value: 50, showValue: true, style: { ...defaultStyle } };
      case 'rating':
        return { value: 3, stars: 5, style: { ...defaultStyle } };
      case 'input-number':
        return { value: 0, min: 0, max: 100, style: { ...defaultStyle } };
      case 'input-otp':
        return { value: '', length: 6, style: { ...defaultStyle } };
      case 'knob':
        return { value: 50, min: 0, max: 100, style: { ...defaultStyle } };
      case 'primeng-multiselect':
        return {
          options: Array(5).fill(0).map((_, i) => ({ name: `Option ${i + 1}`, code: `O${i + 1}` })),
          optionLabel: 'name',
          value: [],
          style: { ...defaultStyle },
        };
      case 'tree-select':
        return {
          options: [
            { label: 'Node 1', key: '1', children: [{ label: 'Node 1.1', key: '1-1' }, { label: 'Node 1.2', key: '1-2' }] },
            { label: 'Node 2', key: '2' },
          ],
          value: null,
          style: { ...defaultStyle },
        };
      case 'toggle-switch':
        return { checked: false, style: { ...defaultStyle } };
      case 'toggle-button':
        return { onLabel: 'On', offLabel: 'Off', checked: false, style: { ...defaultStyle } };
      case 'iterator':
        return { style: { ...defaultStyle } };
      default:
        return {
          style: { ...defaultStyle },
        };
    }
  }

  onDragStarted(widget: DesignerWidget): void {
    this.isDragging = true;
    this.draggingWidgetId = widget.id;
  }

  onCanvasWidgetDragEnd(event: CdkDragEnd, widget: DesignerWidget): void {
    const canvas = document.getElementById('designer-canvas');
    if (!canvas) {
      this.isDragging = false;
      this.draggingWidgetId = null;
      this.alignmentGuides = [];
      return;
    }

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = this.canvasMinHeightPx;

    // How far the user dragged from the original rendered position
    const dragDelta = event.source.getFreeDragPosition();

    // Current rendered pixel position based on percentages
    const currentLeftPx = widget.position.x * canvasWidth;
    const currentTopPx = widget.position.y * canvasHeight;

    // New absolute position in pixels
    let newLeftPx = currentLeftPx + dragDelta.x;
    let newTopPx = currentTopPx + dragDelta.y;

    // Apply snapping if alignment guides are active
    if (this.alignmentGuides.length > 0) {
      const widgetWidthPx = widget.position.w * canvasWidth;
      const widgetHeightPx = widget.position.h * canvasHeight;

      for (const guide of this.alignmentGuides) {
        if (guide.type === 'vertical') {
          // Snap to vertical guide (left edge, right edge, or center)
          const widgetLeft = newLeftPx;
          const widgetRight = newLeftPx + widgetWidthPx;
          const widgetCenter = newLeftPx + widgetWidthPx / 2;

          if (Math.abs(widgetLeft - guide.position) < this.SNAP_THRESHOLD) {
            newLeftPx = guide.position;
          } else if (Math.abs(widgetRight - guide.position) < this.SNAP_THRESHOLD) {
            newLeftPx = guide.position - widgetWidthPx;
          } else if (Math.abs(widgetCenter - guide.position) < this.SNAP_THRESHOLD) {
            newLeftPx = guide.position - widgetWidthPx / 2;
          }
        } else if (guide.type === 'horizontal') {
          // Snap to horizontal guide (top edge, bottom edge, or center)
          const widgetTop = newTopPx;
          const widgetBottom = newTopPx + widgetHeightPx;
          const widgetCenter = newTopPx + widgetHeightPx / 2;

          if (Math.abs(widgetTop - guide.position) < this.SNAP_THRESHOLD) {
            newTopPx = guide.position;
          } else if (Math.abs(widgetBottom - guide.position) < this.SNAP_THRESHOLD) {
            newTopPx = guide.position - widgetHeightPx;
          } else if (Math.abs(widgetCenter - guide.position) < this.SNAP_THRESHOLD) {
            newTopPx = guide.position - widgetHeightPx / 2;
          }
        }
      }
    }

    // Convert back to 0..1 relative coordinates and clamp inside canvas
    const newX = newLeftPx / canvasWidth;
    const newY = newTopPx / canvasHeight;

    widget.position.x = Math.min(Math.max(newX, 0), 1 - widget.position.w);
    // allow placing widgets further down; clamp only to non-negative
    widget.position.y = Math.max(newY, 0);

    // Clear the transform that CDK Drag applied; we now rely purely on left/top
    event.source.reset();

    // Re-enable pointer events after drag
    const dragElement = event.source.element.nativeElement;
    if (dragElement) {
      dragElement.style.pointerEvents = '';
    }

    // Clear alignment guides and reset dragging flag
    this.alignmentGuides = [];
    this.draggingWidgetId = null;

    // Reset dragging flag after a short delay to allow click event to be processed
    setTimeout(() => {
      this.isDragging = false;
    }, 100);

    // Widget drop ended - update canvas height
    this.updateCanvasHeight();
  }

  selectWidget(widget: DesignerWidget): void {
    // Don't select if we're currently dragging
    if (this.isDragging) {
      return;
    }

    // Toggle selection: if clicking the same widget, deselect it
    if (this.selectedWidget?.id === widget.id) {
      this.selectedWidget = null;
      return;
    }

    this.selectedWidget = widget;
    // Load widget's existing styles into widgetStyles
    if (widget.input?.style) {
      this.widgetStyles = {
        ...this.widgetStyles,
        ...widget.input.style
      };
    } else {
      // Initialize style object if it doesn't exist
      if (!widget.input) {
        widget.input = {};
      }
      widget.input.style = {
        backgroundMode: 'transparent',
        backgroundColor: 'transparent'
      };
      this.widgetStyles = {
        ...this.widgetStyles,
        backgroundMode: 'transparent',
        backgroundColor: 'transparent'
      };
    }

    // Ensure backgroundMode is set (default to transparent if not set)
    if (!this.widgetStyles.backgroundMode) {
      this.widgetStyles.backgroundMode = 'transparent';
    }

    // Initialize chart-specific styles if widget is a chart and styles don't exist
    if (this.isChartWidget()) {
      if (!this.widgetStyles.tooltipBgColor) {
        this.widgetStyles.tooltipBgColor = '#000000';
      }
      if (!this.widgetStyles.tooltipColor) {
        this.widgetStyles.tooltipColor = '#ffffff';
      }
      if (this.isGridChart() && !this.widgetStyles.gridColor) {
        this.widgetStyles.gridColor = '#dfe7ef';
      }
      if (!this.widgetStyles.backgroundColors || !Array.isArray(this.widgetStyles.backgroundColors)) {
        this.widgetStyles.backgroundColors = ['#4CAF50', '#2196F3', '#FFEB3B'];
      }
      if (!this.widgetStyles.borderColors || !Array.isArray(this.widgetStyles.borderColors)) {
        this.widgetStyles.borderColors = ['#FF9F40', '#4BC0C0', '#36A2EB'];
      }
      if (!this.widgetStyles.bgColor) {
        this.widgetStyles.bgColor = '#2196F3';
      }
      if (!this.widgetStyles.borderColor) {
        this.widgetStyles.borderColor = '#2196F3';
      }
      if (!this.widgetStyles.pBorderColor) {
        this.widgetStyles.pBorderColor = '#2196F3';
      }
      if (!this.widgetStyles.phBgColor) {
        this.widgetStyles.phBgColor = '#2196F3';
      }
      if (!this.widgetStyles.phBorderColor) {
        this.widgetStyles.phBorderColor = '#2196F3';
      }
      if (!this.widgetStyles.bg1) {
        this.widgetStyles.bg1 = '#2196F3';
      }
      if (!this.widgetStyles.bg2) {
        this.widgetStyles.bg2 = '#4CAF50';
      }
    }
  }

  /**
   * Handles clicks on the canvas (empty area) to deselect widgets
   */
  onCanvasClick(event: MouseEvent): void {
    // Only deselect if clicking directly on the canvas, not on a widget
    const target = event.target as HTMLElement;

    // Check if click is on canvas itself (not on any widget)
    if (target.id === 'designer-canvas') {
      this.selectedWidget = null;
      return;
    }

    // Check if click is on empty area (not on widget or section)
    const clickedWidget = target.closest('.designer-widget-root');
    const clickedSection = target.closest('.designer-section-container');

    if (!clickedWidget && !clickedSection) {
      this.selectedWidget = null;
    }
  }

  /**
   * Handles style changes and applies them to the selected widget
   */
  onStyleChange(): void {
    if (!this.selectedWidget) {
      return;
    }

    // Ensure input.style exists
    if (!this.selectedWidget.input) {
      this.selectedWidget.input = {};
    }
    if (!this.selectedWidget.input.style) {
      this.selectedWidget.input.style = {};
    }

    // Compute background-image based on mode
    let backgroundImage = '';
    if (this.widgetStyles.backgroundMode === 'image' && this.widgetStyles.backgroundImageUrl) {
      backgroundImage = `url('${this.widgetStyles.backgroundImageUrl}')`;
    } else if (this.widgetStyles.backgroundMode === 'gradient') {
      if (this.widgetStyles.gradientType === 'radial') {
        backgroundImage = `radial-gradient(circle, ${this.widgetStyles.gradientStartColor}, ${this.widgetStyles.gradientEndColor})`;
      } else {
        const angle = this.widgetStyles.gradientAngle ?? 90;
        backgroundImage = `linear-gradient(${angle}deg, ${this.widgetStyles.gradientStartColor}, ${this.widgetStyles.gradientEndColor})`;
      }
    }

    // Create a new style object to trigger Angular change detection
    const newStyle: any = { ...this.selectedWidget.input.style };

    // Update widget's style object with current widgetStyles
    Object.entries(this.widgetStyles).forEach(([key, value]) => {
      // Allow empty strings for style values (they can be valid, e.g., clearing a color)
      // Only skip undefined and null values
      if (value !== undefined && value !== null) {
        newStyle[key] = value;
      }
    });

    // Handle transparent background
    if (this.widgetStyles.backgroundMode === 'transparent') {
      newStyle.backgroundColor = 'transparent';
      newStyle.backgroundImage = 'none';
    } else if (backgroundImage) {
      // Add computed background-image if applicable
      newStyle.backgroundImage = backgroundImage;
    } else if (this.widgetStyles.backgroundMode === 'color') {
      // Clear background-image when using color mode
      newStyle.backgroundImage = 'none';
    }

    // Assign the new style object to trigger change detection
    this.selectedWidget.input.style = newStyle;
  }

  /**
   * Handles canvas style changes and applies them to the canvas element
   */
  onCanvasStyleChange(): void {
    const canvas = document.getElementById('designer-canvas');
    if (!canvas) {
      return;
    }

    // Compute background-image based on mode
    let backgroundImage = '';
    if (this.canvasStyles.backgroundMode === 'image' && this.canvasStyles.backgroundImageUrl) {
      backgroundImage = `url('${this.canvasStyles.backgroundImageUrl}')`;
    } else if (this.canvasStyles.backgroundMode === 'gradient') {
      if (this.canvasStyles.gradientType === 'radial') {
        backgroundImage = `radial-gradient(circle, ${this.canvasStyles.gradientStartColor}, ${this.canvasStyles.gradientEndColor})`;
      } else {
        const angle = this.canvasStyles.gradientAngle ?? 90;
        backgroundImage = `linear-gradient(${angle}deg, ${this.canvasStyles.gradientStartColor}, ${this.canvasStyles.gradientEndColor})`;
      }
    }

    // Apply styles to canvas element
    if (this.canvasStyles.backgroundMode === 'color' && this.canvasStyles.backgroundColor) {
      canvas.style.backgroundColor = this.canvasStyles.backgroundColor;
      canvas.style.backgroundImage = 'none';
    } else if (backgroundImage) {
      canvas.style.backgroundImage = backgroundImage;
      canvas.style.backgroundSize = this.canvasStyles.backgroundSize || 'cover';
      canvas.style.backgroundPosition = this.canvasStyles.backgroundPosition || 'center center';
      canvas.style.backgroundRepeat = this.canvasStyles.backgroundRepeat || 'no-repeat';
    } else {
      canvas.style.backgroundColor = '';
      canvas.style.backgroundImage = 'none';
    }
  }

  /**
   * Handles clicks on widgets nested inside a section
   */
  onSectionWidgetClick(nestedWidget: DesignerWidget, sectionWidget: DesignerWidget): void {
    // Toggle selection: if clicking the same widget, deselect it
    if (this.selectedWidget?.id === nestedWidget.id) {
      this.selectedWidget = null;
      return;
    }

    // Select the nested widget
    this.selectedWidget = nestedWidget;

    // Load widget's existing styles into widgetStyles
    if (nestedWidget.input?.style) {
      this.widgetStyles = {
        ...this.widgetStyles,
        ...nestedWidget.input.style
      };
    } else {
      if (!nestedWidget.input) {
        nestedWidget.input = {};
      }
      nestedWidget.input.style = {
        backgroundMode: 'transparent',
        backgroundColor: 'transparent'
      };
      this.widgetStyles = {
        ...this.widgetStyles,
        backgroundMode: 'transparent',
        backgroundColor: 'transparent'
      };
    }

    // Ensure backgroundMode is set
    if (!this.widgetStyles.backgroundMode) {
      this.widgetStyles.backgroundMode = 'transparent';
    }
  }

  /**
   * Handles drag start for widgets nested inside a section
   */
  onSectionWidgetDragStart(): void {
    this.isDragging = true;
    // For nested widgets, we rely on the currently selected widget (if any)
    // to track alignment during drag. This keeps the template simple and
    // avoids changing the event payload from the section container.
    this.draggingWidgetId = this.selectedWidget?.id ?? null;
  }

  /**
   * Handles drag end for widgets nested inside a section
   */
  onSectionWidgetDragEnd(event: CdkDragEnd, nestedWidget: DesignerWidget, sectionWidget: DesignerWidget): void {
    // Find the section container element
    const draggedElement = event.source.element.nativeElement;
    const sectionContainer = draggedElement.closest('.designer-section-container') as HTMLElement;

    if (!sectionContainer) {
      console.warn('Section container not found for nested widget drag');
      event.source.reset();
      this.alignmentGuides = [];
      this.draggingWidgetId = null;
      setTimeout(() => {
        this.isDragging = false;
      }, 100);
      return;
    }

    // Get the drag delta (transform offset applied by CDK Drag)
    const dragDelta = event.source.getFreeDragPosition();

    // Get section dimensions
    const sectionRect = sectionContainer.getBoundingClientRect();
    const sectionWidth = sectionRect.width;
    const sectionHeight = sectionRect.height;

    // Current position in pixels relative to section (based on stored percentages)
    const currentLeftPx = nestedWidget.position.x * sectionWidth;
    const currentTopPx = nestedWidget.position.y * sectionHeight;

    // New position in pixels: current position + drag delta
    let newLeftPx = currentLeftPx + dragDelta.x;
    let newTopPx = currentTopPx + dragDelta.y;

    // Apply snapping if alignment guides are active (for nested widgets)
    if (this.alignmentGuides.length > 0 && sectionWidget.children) {
      const widgetWidthPx = nestedWidget.position.w * sectionWidth;
      const widgetHeightPx = nestedWidget.position.h * sectionHeight;

      for (const guide of this.alignmentGuides) {
        if (guide.type === 'vertical') {
          const widgetLeft = newLeftPx;
          const widgetRight = newLeftPx + widgetWidthPx;
          const widgetCenter = newLeftPx + widgetWidthPx / 2;

          if (Math.abs(widgetLeft - guide.position) < this.SNAP_THRESHOLD) {
            newLeftPx = guide.position;
          } else if (Math.abs(widgetRight - guide.position) < this.SNAP_THRESHOLD) {
            newLeftPx = guide.position - widgetWidthPx;
          } else if (Math.abs(widgetCenter - guide.position) < this.SNAP_THRESHOLD) {
            newLeftPx = guide.position - widgetWidthPx / 2;
          }
        } else if (guide.type === 'horizontal') {
          const widgetTop = newTopPx;
          const widgetBottom = newTopPx + widgetHeightPx;
          const widgetCenter = newTopPx + widgetHeightPx / 2;

          if (Math.abs(widgetTop - guide.position) < this.SNAP_THRESHOLD) {
            newTopPx = guide.position;
          } else if (Math.abs(widgetBottom - guide.position) < this.SNAP_THRESHOLD) {
            newTopPx = guide.position - widgetHeightPx;
          } else if (Math.abs(widgetCenter - guide.position) < this.SNAP_THRESHOLD) {
            newTopPx = guide.position - widgetHeightPx / 2;
          }
        }
      }
    }

    // Convert to relative coordinates (0-1) within the section container
    // Clamp positions to stay within section bounds
    const newX = Math.max(0, Math.min(newLeftPx / sectionWidth, 1 - nestedWidget.position.w));
    const newY = Math.max(0, Math.min(newTopPx / sectionHeight, 1 - nestedWidget.position.h));

    // Update widget position (relative to section, not root canvas)
    nestedWidget.position.x = newX;
    nestedWidget.position.y = newY;

    // Clear the transform that CDK Drag applied - we now rely purely on left/top percentages
    event.source.reset();

    // Re-enable pointer events after drag
    if (draggedElement) {
      draggedElement.style.pointerEvents = '';
    }

    // Clear alignment guides and reset dragging flag
    this.alignmentGuides = [];
    this.draggingWidgetId = null;

    // Reset dragging flag after a short delay to allow click event to be processed
    setTimeout(() => {
      this.isDragging = false;
    }, 100);
  }

  /**
   * Handles resize start for widgets nested inside a section
   */
  onSectionWidgetResizeStart(nestedWidget: DesignerWidget, event: MouseEvent, sectionWidget: DesignerWidget): void {
    event.stopPropagation();
    this.resizingWidgetId = nestedWidget.id;

    const sectionContainer = (event.currentTarget as HTMLElement)?.closest('.designer-section-container') as HTMLElement;
    if (!sectionContainer) {
      return;
    }

    const sectionWidth = sectionContainer.clientWidth;
    const sectionHeight = sectionContainer.clientHeight;

    this.widgetResizeStart = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      widthPx: nestedWidget.position.w * sectionWidth,
      heightPx: nestedWidget.position.h * sectionHeight,
    };

    // Detect alignment for nested widgets during resize
    if (sectionWidget.children) {
      this.detectAlignmentGuides(nestedWidget, sectionWidget.children, sectionWidth, sectionHeight, true);
    }
  }

  /** Iterator: same as section for selecting nested widget */
  onIteratorWidgetClick(nestedWidget: DesignerWidget): void {
    this.onSectionWidgetClick(nestedWidget, {} as DesignerWidget);
  }

  /** Iterator: add a new row by cloning the first row (used when you want more rows inside one iterator) */
  addIteratorRow(iteratorWidget: DesignerWidget): void {
    if (!iteratorWidget.rows || iteratorWidget.rows.length === 0) {
      iteratorWidget.rows = [[]];
      return;
    }
    const templateRow = iteratorWidget.rows[0];
    const newRow: DesignerWidget[] = templateRow.map((w) => {
      const clone = this.deepCloneWidget(w);
      clone.id = `w-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      clone.parentId = iteratorWidget.id;
      clone.rowIndex = iteratorWidget.rows!.length;
      return clone;
    });
    this.updateWidgetIds(newRow, iteratorWidget.id);
    newRow.forEach((w, i) => { w.rowIndex = iteratorWidget.rows!.length; });
    iteratorWidget.rows.push(newRow);
  }

  /** Iterator: duplicate the entire iterator widget on the canvas (Add button in iterator) */
  duplicateIteratorWidget = (iteratorWidget: DesignerWidget): void => {
    // Check if we need to select it first
    if (this.selectedWidget?.id !== iteratorWidget.id) {
      this.selectWidget(iteratorWidget);
    }
    // Then use the standardized cloning logic
    this.cloneSelectedWidget();
  };

  /** Iterator: delete a row (keep at least one row) */
  deleteIteratorRow(iteratorWidget: DesignerWidget, rowIndex: number): void {
    if (!iteratorWidget.rows || iteratorWidget.rows.length <= 1) return;
    iteratorWidget.rows.splice(rowIndex, 1);
    iteratorWidget.rows.forEach((row, ri) => row.forEach((w) => { w.rowIndex = ri; }));
  }

  /** Iterator: reorder rows */
  reorderIteratorRows(iteratorWidget: DesignerWidget, fromIndex: number, toIndex: number): void {
    if (!iteratorWidget.rows) return;
    const row = iteratorWidget.rows.splice(fromIndex, 1)[0];
    iteratorWidget.rows.splice(toIndex, 0, row);
    iteratorWidget.rows.forEach((r, ri) => r.forEach((w) => { w.rowIndex = ri; }));
  }

  /** Iterator: drag end - same logic as section (container = .designer-iterator-content, always row 0 in designer) */
  onIteratorWidgetDragEnd(event: CdkDragEnd, nestedWidget: DesignerWidget, iteratorWidget: DesignerWidget, rowIndex: number): void {
    const draggedElement = event.source.element.nativeElement as HTMLElement;
    const container = draggedElement.closest('.designer-iterator-content') as HTMLElement;
    if (!container) {
      event.source.reset();
      this.alignmentGuides = [];
      this.draggingWidgetId = null;
      setTimeout(() => { this.isDragging = false; }, 100);
      return;
    }

    const dragDelta = event.source.getFreeDragPosition();
    const rect = container.getBoundingClientRect();
    const sectionWidth = rect.width;
    const sectionHeight = rect.height;

    let newLeftPx = nestedWidget.position.x * sectionWidth + dragDelta.x;
    let newTopPx = nestedWidget.position.y * sectionHeight + dragDelta.y;

    const row = iteratorWidget.rows?.[rowIndex];
    if (this.alignmentGuides.length > 0 && row) {
      const widgetWidthPx = nestedWidget.position.w * sectionWidth;
      const widgetHeightPx = nestedWidget.position.h * sectionHeight;
      for (const guide of this.alignmentGuides) {
        if (guide.type === 'vertical') {
          const widgetLeft = newLeftPx;
          const widgetRight = newLeftPx + widgetWidthPx;
          const widgetCenter = newLeftPx + widgetWidthPx / 2;
          if (Math.abs(widgetLeft - guide.position) < this.SNAP_THRESHOLD) newLeftPx = guide.position;
          else if (Math.abs(widgetRight - guide.position) < this.SNAP_THRESHOLD) newLeftPx = guide.position - widgetWidthPx;
          else if (Math.abs(widgetCenter - guide.position) < this.SNAP_THRESHOLD) newLeftPx = guide.position - widgetWidthPx / 2;
        } else {
          const widgetTop = newTopPx;
          const widgetBottom = newTopPx + widgetHeightPx;
          const widgetCenter = newTopPx + widgetHeightPx / 2;
          if (Math.abs(widgetTop - guide.position) < this.SNAP_THRESHOLD) newTopPx = guide.position;
          else if (Math.abs(widgetBottom - guide.position) < this.SNAP_THRESHOLD) newTopPx = guide.position - widgetHeightPx;
          else if (Math.abs(widgetCenter - guide.position) < this.SNAP_THRESHOLD) newTopPx = guide.position - widgetHeightPx / 2;
        }
      }
    }

    const newX = Math.max(0, Math.min(newLeftPx / sectionWidth, 1 - nestedWidget.position.w));
    const newY = Math.max(0, Math.min(newTopPx / sectionHeight, 1 - nestedWidget.position.h));
    nestedWidget.position.x = newX;
    nestedWidget.position.y = newY;

    event.source.reset();
    if (draggedElement) {
      draggedElement.style.pointerEvents = '';
    }

    this.alignmentGuides = [];
    this.draggingWidgetId = null;
    this.cdr.detectChanges();
    setTimeout(() => { this.isDragging = false; }, 100);
  }

  /** Iterator: resize start - use .designer-iterator-content like section */
  onIteratorWidgetResizeStart(nestedWidget: DesignerWidget, event: MouseEvent, iteratorWidget: DesignerWidget, rowIndex: number): void {
    event.stopPropagation();
    this.resizingWidgetId = nestedWidget.id;
    const container = (event.currentTarget as HTMLElement)?.closest('.designer-iterator-content') as HTMLElement;
    if (!container) return;
    const sectionWidth = container.clientWidth;
    const sectionHeight = container.clientHeight;
    this.widgetResizeStart = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      widthPx: nestedWidget.position.w * sectionWidth,
      heightPx: nestedWidget.position.h * sectionHeight,
    };
    const row = iteratorWidget.rows?.[rowIndex];
    if (row && iteratorWidget.children) {
      this.detectAlignmentGuides(nestedWidget, row, sectionWidth, sectionHeight, true);
    }
  }

  deleteSelectedWidget(): void {
    if (!this.selectedWidget) {
      return;
    }
    const id = this.selectedWidget.id;

    if (this.selectedWidget.parentId) {
      const parent = this.findWidgetById(this.selectedWidget.parentId);
      if (!parent) {
        this.selectedWidget = null;
        return;
      }
      if (parent.children) {
        parent.children = parent.children.filter((w) => w.id !== id);
      } else if (parent.rows) {
        for (let ri = 0; ri < parent.rows.length; ri++) {
          parent.rows[ri] = parent.rows[ri].filter((w) => w.id !== id);
        }
      }
    } else {
      this.canvasWidgets = this.canvasWidgets.filter((w) => w.id !== id);
    }

    this.selectedWidget = null;
    this.updateCanvasHeight();
  }

  /**
   * Clones the selected widget and all its children (if any)
   */
  cloneSelectedWidget(): void {
    if (!this.selectedWidget) {
      return;
    }

    // Check if widget is nested inside a section - can't clone nested widgets directly
    if (this.selectedWidget.parentId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select the parent section to clone nested widgets',
        life: 3000
      });
      return;
    }

    // Clone the widget with all its children
    const clonedWidget = this.deepCloneWidget(this.selectedWidget);

    // Generate new ID for the cloned widget
    clonedWidget.id = `w-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Recursively update IDs for all children and set parentId references
    if (clonedWidget.children && clonedWidget.children.length > 0) {
      this.updateWidgetIds(clonedWidget.children, clonedWidget.id);
    }

    // Find available position for the cloned widget (offset slightly to the right and down)
    const offsetX = 0.05; // 5% offset
    const offsetY = 0.05; // 5% offset
    const availablePosition = this.findAvailablePosition(
      clonedWidget.position.w,
      clonedWidget.position.h,
      clonedWidget.position.x + offsetX,
      clonedWidget.position.y + offsetY
    );

    // Update position of cloned widget
    clonedWidget.position.x = Math.max(0, Math.min(availablePosition.x, 0.95));
    clonedWidget.position.y = Math.max(0, availablePosition.y);
    clonedWidget.position.zIndex = this.canvasWidgets.length + 1;

    // Add cloned widget to canvas
    this.canvasWidgets.push(clonedWidget);

    // Select the cloned widget
    this.selectedWidget = clonedWidget;
    this.selectWidget(clonedWidget);

    // Update canvas height and scroll to new widget
    this.updateCanvasHeight();
    setTimeout(() => {
      this.scrollToWidget(clonedWidget);
    }, 100);

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Widget cloned successfully',
      life: 2000
    });
  }

  /**
   * Deep clones a widget and all its children recursively
   */
  private deepCloneWidget(widget: DesignerWidget): DesignerWidget {
    const cloned: DesignerWidget = {
      id: widget.id, // Will be updated by caller
      label: widget.label,
      type: widget.type,
      selector: widget.selector,
      position: {
        x: widget.position.x,
        y: widget.position.y,
        w: widget.position.w,
        h: widget.position.h,
        zIndex: widget.position.zIndex
      },
      input: this.deepClone(widget.input || {}),
      parentId: widget.parentId,
      rowIndex: widget.rowIndex
    };

    if (widget.children && widget.children.length > 0) {
      cloned.children = widget.children.map(child => this.deepCloneWidget(child));
    }
    if (widget.rows && widget.rows.length > 0) {
      cloned.rows = widget.rows.map(row => row.map(child => this.deepCloneWidget(child)));
    }

    return cloned;
  }

  /**
   * Recursively updates IDs for all widgets in a children array
   * @param children - Array of child widgets to update
   * @param parentId - Optional parent ID to set for children
   */
  private updateWidgetIds(children: DesignerWidget[], parentId?: string): void {
    children.forEach(child => {
      child.id = `w-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      if (parentId) {
        child.parentId = parentId;
      }
      if (child.children && child.children.length > 0) {
        this.updateWidgetIds(child.children, child.id);
      }
    });
  }

  clearCanvas(): void {
    this.canvasWidgets = [];
    this.selectedWidget = null;
    // Canvas cleared - update canvas height
    this.updateCanvasHeight();
  }

  onWidgetResizeStart(widget: DesignerWidget, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    const canvas = document.getElementById('designer-canvas');
    if (!canvas) {
      return;
    }

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = this.canvasMinHeightPx;

    this.resizingWidgetId = widget.id;
    this.widgetResizeStart = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      widthPx: widget.position.w * canvasWidth,
      heightPx: widget.position.h * canvasHeight,
    };
  }

  /**
   * Maps widget type to its component selector
   */
  private getSelectorFromType(type: string): string {
    const typeToSelectorMap: Record<string, string> = {
      'pie-chart': 'app-pie-chart',
      'donut-chart': 'app-donut',
      'polar': 'app-polar-area',
      'radar': 'app-radar',
      'bar-chart': 'app-bar-chart',
      'line': 'app-line',
      'hbar': 'app-horizontal-bar',
      'svbar': 'app-sv-bar',
      'shbar': 'app-sh-bar',
      'apex-line-chart': 'app-apexspline',
      'label': 'app-label',
      'paragraph': 'app-paragraph',
      'input-text': 'app-input-text',
      'text-area': 'app-text-area',
      'checkbox': 'app-checkbox',
      'date-picker': 'app-date-picker',
      'dropdown': 'app-dropdown',
      'radio-button': 'app-radio-button',
      'file-upload': 'app-file-upload',
      'btn': 'app-button',
      'btn-icon': 'app-icon-button',
      'primeng-dynamic-table': 'app-dynamic-table',
      'static-table': 'app-static-table',
      'image': 'app-image',
      'video': 'app-video',
      'map': 'app-map',
      'tag': 'app-tag',
      'date-tag': 'app-date-tag',
      'location-tag': 'app-location-tag',
      'spacer': 'app-spacer',
      'divider': 'app-divider',
      'guage': 'app-speed-guage',
      'section': 'app-designer-section-container',
      'progress-bar': 'app-progress-bar',
      'rating': 'app-rating',
      'input-number': 'app-input-number',
      'input-otp': 'app-input-otp',
      'knob': 'app-knob',
      'primeng-multiselect': 'app-primeng-multiselect',
      'tree-select': 'app-tree-select',
      'toggle-switch': 'app-toggle-switch',
      'toggle-button': 'app-toggle-button',
      'iterator': 'app-designer-iterator-container'
    };
    return typeToSelectorMap[type] || '';
  }

  /**
   * Checks if the selected widget is a chart widget
   */
  isChartWidget(): boolean {
    if (!this.selectedWidget) {
      return false;
    }
    // Check by selector first
    const chartSelectors = [
      'app-pie-chart',
      'app-donut',
      'app-polar-area',
      'app-radar',
      'app-bar-chart',
      'app-line',
      'app-horizontal-bar',
      'app-sv-bar',
      'app-sh-bar',
      'app-apexspline'
    ];
    if (chartSelectors.includes(this.selectedWidget.selector)) {
      return true;
    }
    // Also check by type as fallback
    const chartTypes = [
      'pie-chart',
      'donut-chart',
      'polar',
      'radar',
      'bar-chart',
      'line',
      'hbar',
      'svbar',
      'shbar',
      'apex-line-chart'
    ];
    return chartTypes.includes(this.selectedWidget.type);
  }

  /**
   * Checks if the selected widget is a grid chart (has grid lines)
   */
  isGridChart(): boolean {
    if (!this.selectedWidget) {
      return false;
    }
    // Check by selector first
    const gridChartSelectors = [
      'app-line',
      'app-bar-chart',
      'app-horizontal-bar',
      'app-radar',
      'app-sv-bar',
      'app-sh-bar',
      'app-apexspline'
    ];
    if (gridChartSelectors.includes(this.selectedWidget.selector)) {
      return true;
    }
    // Also check by type as fallback
    const gridChartTypes = [
      'line',
      'bar-chart',
      'hbar',
      'radar',
      'svbar',
      'shbar',
      'apex-line-chart'
    ];
    return gridChartTypes.includes(this.selectedWidget.type);
  }

  /**
   * Exports the current page design as a JSON object
   */
  exportPageDesign(): DesignerPage {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      canvas: {
        width: this.canvasWidth,
        heightPx: this.canvasHeightPx,
        minHeightPx: this.canvasMinHeightPx,
        styles: { ...this.canvasStyles }
      },
      widgets: this.canvasWidgets.map(w => this.serializeWidget(w))
    };
  }

  /**
   * Builds a lightweight object containing only the logical input
   * properties for a widget (and its children), explicitly ignoring style.
   * This is useful when consumers need just the configuration / data
   * without any visual styling information.
   */
  private serializeWidgetInputs(widget: DesignerWidget): any {
    // Safely strip style from the input object
    const { style, ...inputWithoutStyle } = widget.input || {};

    const result: any = {
      id: widget.id,
      type: widget.type,
      selector: widget.selector,
      input: inputWithoutStyle || {}
    };

    // Recursively capture children with the same input-only structure
    if (widget.children && widget.children.length > 0) {
      result.children = widget.children.map(child =>
        this.serializeWidgetInputs(child)
      );
    }

    return result;
  }

  /**
   * Recursively serializes a widget and its children
   */
  private serializeWidget(widget: DesignerWidget): DesignerWidget {
    const serialized: DesignerWidget = {
      id: widget.id,
      label: widget.label,
      type: widget.type,
      selector: widget.selector,
      position: { ...widget.position },
      input: this.deepClone(widget.input || {}),
      parentId: widget.parentId
    };

    if (widget.children && widget.children.length > 0) {
      serialized.children = widget.children.map(child => this.serializeWidget(child));
    }
    if (widget.rows && widget.rows.length > 0) {
      serialized.rows = widget.rows.map(row => row.map((child: DesignerWidget) => this.serializeWidget(child)));
    }

    return serialized;
  }

  /**
   * Deep clone utility for objects
   */
  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item));
    }
    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Saves the page design as JSON and downloads it
   */
  savePageDesign(): void {
    try {
      const pageDesign = this.exportPageDesign();
      // Build an additional object that contains only widget inputs (no styles)
      const widgetInputsOnly = this.canvasWidgets.map(w =>
        this.serializeWidgetInputs(w)
      );

      // Generate standardized JSON structure components
      const inputSchema = this.generateInputSchemaForAllWidgets(
        this.canvasWidgets,
        this.lastDataMappingJson?.displayComponent
      );
      const dataObject = this.lastDataMappingJson?.data ||
        this.extractDataObjectFromWidgets(this.canvasWidgets);
      const displayComponent = this.lastDataMappingJson?.displayComponent ||
        this.generateDisplayComponentFromWidgets(this.canvasWidgets);

      const exportData = {
        // Include appId and orgId if available
        ...(this.formConfig?.appId && { appId: this.formConfig.appId }),
        ...(this.formConfig?.orgId && { orgId: this.formConfig.orgId }),
        dataObject: dataObject,
        displayComponent: displayComponent,
        designObject: pageDesign,
        inputSchema: inputSchema,
      };

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Page design saved successfully',
        life: 3000
      });
    } catch (error) {
      console.error('Error saving page design:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save page design',
        life: 3000
      });
    }
  }

  /**
   * Widget input schema definitions - defines required properties for each widget type
   */
  private readonly WIDGET_INPUT_SCHEMAS: Record<string, Record<string, { type: string; required: boolean; description: string }>> = {
    'input-field': {
      value: { type: 'string | number', required: true, description: 'The input field value' }
    },
    'input-text': {
      value: { type: 'string | number', required: true, description: 'The input field value' }
    },
    'text-area': {
      value: { type: 'string', required: true, description: 'The text area value' }
    },
    'label': {
      label: { type: 'string', required: true, description: 'The label text' }
    },
    'paragraph': {
      content: { type: 'string', required: true, description: 'The paragraph content' }
    },
    'image': {
      src: { type: 'string', required: true, description: 'Image source URL or path' },
      alterateText: { type: 'string', required: false, description: 'Alternate text for the image' }
    },
    'bar-chart': {
      labels: { type: 'array', required: true, description: 'Array of label strings for the chart' },
      values: { type: 'array', required: true, description: 'Array of numeric values for the chart' },
      title: { type: 'string', required: true, description: 'Chart title' }
    },
    'donut-chart': {
      labels: { type: 'array', required: true, description: 'Array of label strings for the donut chart' },
      values: { type: 'array', required: true, description: 'Array of numeric values for the donut chart' }
    },
    'pie-chart': {
      labels: { type: 'array', required: true, description: 'Array of label strings for the pie chart' },
      values: { type: 'array', required: true, description: 'Array of numeric values for the pie chart' }
    },
    'line': {
      labels: { type: 'array', required: true, description: 'Array of label strings for the line chart' },
      values: { type: 'array', required: true, description: 'Array of numeric values for the line chart' },
      title: { type: 'string', required: true, description: 'Chart title' }
    },
    'apex-line-chart': {
      labels: { type: 'array', required: true, description: 'Array of label strings for the chart' },
      values: { type: 'array', required: true, description: 'Array of numeric values for the chart' }
    },
    'hbar': {
      labels: { type: 'array', required: true, description: 'Array of label strings for the chart' },
      values: { type: 'array', required: true, description: 'Array of numeric values for the chart' },
      title: { type: 'string', required: true, description: 'Chart title' }
    },
    'radar': {
      labels: { type: 'array', required: true, description: 'Array of label strings for the radar chart' },
      values: { type: 'array', required: true, description: 'Array of numeric values for the radar chart' },
      title: { type: 'string', required: true, description: 'Chart title' }
    },
    'polar': {
      labels: { type: 'array', required: true, description: 'Array of label strings for the polar chart' },
      values: { type: 'array', required: true, description: 'Array of numeric values for the polar chart' },
      title: { type: 'string', required: true, description: 'Chart title' }
    },
    'svbar': {
      labels: { type: 'array', required: true, description: 'Array of label strings for the chart' },
      values1: { type: 'array', required: true, description: 'Array of numeric values for dataset 1' },
      values2: { type: 'array', required: true, description: 'Array of numeric values for dataset 2' },
      title1: { type: 'string', required: true, description: 'Title for dataset 1' },
      title2: { type: 'string', required: true, description: 'Title for dataset 2' }
    },
    'shbar': {
      labels: { type: 'array', required: true, description: 'Array of label strings for the chart' },
      values1: { type: 'array', required: true, description: 'Array of numeric values for dataset 1' },
      values2: { type: 'array', required: true, description: 'Array of numeric values for dataset 2' },
      title1: { type: 'string', required: true, description: 'Title for dataset 1' },
      title2: { type: 'string', required: true, description: 'Title for dataset 2' }
    },
    'btn': {
      buttonLabel: { type: 'string', required: true, description: 'Button label text' }
    },
    'btn-icon': {
      icon: { type: 'string', required: true, description: 'Icon class name (e.g., pi pi-user)' }
    },
    'video': {
      videoSrc: { type: 'string', required: true, description: 'Video source URL' },
      thumbnail: { type: 'string', required: false, description: 'Thumbnail image URL' }
    },
    'dropdown': {
      data: { type: 'array', required: true, description: 'Array of option objects' },
      optionValue: { type: 'string', required: false, description: 'Property name for option value' },
      optionLabel: { type: 'string', required: false, description: 'Property name for option label' },
      value: { type: 'string | number', required: false, description: 'Selected value' }
    },
    'primeng-dynamic-table': {
      dataSets: { type: 'object', required: true, description: 'Object containing attributes and products arrays' },
      emitterId: { type: 'string | null', required: false, description: 'Emitter ID for data binding' },
      id: { type: 'string | null', required: false, description: 'Table ID' }
    }
  };

  /**
   * Extracts field path from widget label
   * Widget labels from code editor are in format: "Label (fieldPath)"
   */
  private extractFieldPathFromLabel(label: string): string | null {
    const match = label.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
  }

  /**
   * Finds field path for a widget from displayComponent mapping
   */
  private findFieldPathForWidget(widget: DesignerWidget, displayComponent: Record<string, string>): string {
    // First, try to extract from widget label (format: "Label (fieldPath)")
    const fieldPathFromLabel = this.extractFieldPathFromLabel(widget.label);
    if (fieldPathFromLabel) {
      // Verify it exists in displayComponent
      if (displayComponent[fieldPathFromLabel]) {
        return fieldPathFromLabel;
      }
    }

    // Search displayComponent for matching widget type
    for (const [fieldPath, displayComp] of Object.entries(displayComponent)) {
      const widgetType = this.mapDisplayComponentToWidgetType(displayComp);
      if (widgetType === widget.type) {
        return fieldPath;
      }
    }

    // Fallback: use widget ID or generate from label
    if (fieldPathFromLabel) {
      return fieldPathFromLabel;
    }

    // Generate field path from label (remove special chars, convert to camelCase)
    const sanitized = widget.label
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');

    return sanitized || widget.id;
  }

  /**
   * Generates inputSchema for all widgets on the canvas
   * This ensures consistent structure regardless of how widgets were added
   */
  private generateInputSchemaForAllWidgets(
    widgets: DesignerWidget[],
    displayComponent?: Record<string, string>
  ): Record<string, any> {
    const inputSchema: Record<string, any> = {};

    console.log('=== generateInputSchemaForAllWidgets ===');
    console.log('Widgets count:', widgets.length);
    console.log('DisplayComponent:', displayComponent);

    for (const widget of widgets) {
      console.log(`Processing widget: ${widget.id}, type: ${widget.type}, label: ${widget.label}`);

      // Skip section widgets (they don't have input schema, their children do)
      if (widget.type === 'section') {
        console.log('Skipping section widget, processing children...');
        // Process children if they exist
        if (widget.children && widget.children.length > 0) {
          const childrenSchema = this.generateInputSchemaForAllWidgets(widget.children, displayComponent);
          Object.assign(inputSchema, childrenSchema);
        }
        continue;
      }

      // Get widget schema definition
      const widgetSchema = this.WIDGET_INPUT_SCHEMAS[widget.type];
      if (!widgetSchema) {
        console.warn(`No input schema defined for widget type: ${widget.type}. Available types:`, Object.keys(this.WIDGET_INPUT_SCHEMAS));
        continue;
      }

      // Determine field path
      let fieldPath: string;
      if (displayComponent) {
        fieldPath = this.findFieldPathForWidget(widget, displayComponent);
        console.log(`Found fieldPath from displayComponent: ${fieldPath}`);
      } else {
        // For manually added widgets, extract from label or use ID
        const extractedPath = this.extractFieldPathFromLabel(widget.label);
        fieldPath = extractedPath || widget.id;
        console.log(`Extracted fieldPath from label: ${extractedPath}, using: ${fieldPath}`);
      }

      // Create schema key: "fieldPath.widget-type"
      const schemaKey = `${fieldPath}.${widget.type}`;
      console.log(`Creating schema key: ${schemaKey}`);

      // Build schema for this widget
      inputSchema[schemaKey] = {};

      for (const [propName, propDef] of Object.entries(widgetSchema)) {
        inputSchema[schemaKey][propName] = {
          type: propDef.type,
          required: propDef.required,
          description: propDef.description,
          mapping: {
            type: null,
            attributeId: null,
            attributeName: null,
            rawValue: null,
            dataPath: null
          }
        };
      }

      console.log(`Schema created for ${schemaKey}:`, inputSchema[schemaKey]);
    }

    console.log('Final inputSchema:', inputSchema);
    return inputSchema;
  }

  /**
   * Extracts dataObject from widgets or uses existing dataMapping
   */
  private extractDataObjectFromWidgets(widgets: DesignerWidget[]): any {
    // If we have dataMapping from code editor, use its data
    if (this.lastDataMappingJson?.data) {
      return this.lastDataMappingJson.data;
    }

    // Otherwise, build dataObject from widget inputs (excluding styles)
    const dataObject: any = {};

    for (const widget of widgets) {
      if (widget.type === 'section' && widget.children) {
        // Handle nested widgets in sections
        const sectionData = this.extractDataObjectFromWidgets(widget.children);
        if (Object.keys(sectionData).length > 0) {
          const fieldPath = this.extractFieldPathFromLabel(widget.label) || widget.id;
          this.setNestedValue(dataObject, fieldPath, sectionData);
        }
        continue;
      }

      // Extract field path
      const fieldPath = this.extractFieldPathFromLabel(widget.label) || widget.id;

      // Extract input data (excluding style)
      if (widget.input) {
        const { style, ...inputData } = widget.input;
        if (Object.keys(inputData).length > 0) {
          this.setNestedValue(dataObject, fieldPath, inputData);
        }
      }
    }

    return dataObject;
  }

  /**
   * Sets a nested value in an object using dot notation path
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Generates displayComponent mapping from widgets
   */
  private generateDisplayComponentFromWidgets(widgets: DesignerWidget[]): Record<string, string> {
    const displayComponent: Record<string, string> = {};

    // Reverse mapping: widget type -> displayComponent name
    const widgetTypeToDisplayComponent: Record<string, string> = {
      'input-text': 'input-field',
      'input-field': 'input-field',
      'bar-chart': 'bar-chart',
      'donut-chart': 'donut-chart',
      'apex-line-chart': 'line-chart',
      'line': 'line-chart',
      'pie-chart': 'pie-chart',
      'image': 'image',
      'label': 'label',
      'paragraph': 'paragraph',
      'text-area': 'text-area',
      'checkbox': 'checkbox',
      'date-picker': 'date-picker',
      'dropdown': 'dropdown',
      'radio-button': 'radio-button',
      'file-upload': 'file-upload',
      'btn': 'btn',
      'btn-icon': 'btn-icon'
    };

    for (const widget of widgets) {
      if (widget.type === 'section' && widget.children) {
        // Process children in sections
        const childrenDisplayComponent = this.generateDisplayComponentFromWidgets(widget.children);
        Object.assign(displayComponent, childrenDisplayComponent);
        continue;
      }

      // Extract field path
      const fieldPath = this.extractFieldPathFromLabel(widget.label) || widget.id;

      // Map widget type to displayComponent name
      const displayCompName = widgetTypeToDisplayComponent[widget.type] || widget.type;

      displayComponent[fieldPath] = displayCompName;
    }

    return displayComponent;
  }

  /**
   * Handles the main Save button click.
   * Opens a dialog to capture template name & description, then
   * posts the template to `/idt/postTemplate`. On success, it will
   * also download the JSON design (existing behavior).
   */
  onSaveClicked(): void {
    // Open the template confirmation dialog (reused from page builder)
    this.ref = this.dialogService.open(TemplateConfirmationComponent, {
      data: 'template',
      modal: true,
      header: 'Save Template',
      closable: true
    });

    this.ref.onClose.subscribe((data: any) => {
      if (!data) {
        return;
      }

      try {
        // Build the full design + mapping + widget inputs object
        const pageDesign = this.exportPageDesign();
        const widgetInputsOnly = this.canvasWidgets.map(w =>
          this.serializeWidgetInputs(w)
        );

        // Generate standardized JSON structure components
        // 1. Generate inputSchema for ALL widgets (regardless of how they were added)
        const inputSchema = this.generateInputSchemaForAllWidgets(
          this.canvasWidgets,
          this.lastDataMappingJson?.displayComponent
        );

        // 2. Extract or generate dataObject
        const dataObject = this.lastDataMappingJson?.data ||
          this.extractDataObjectFromWidgets(this.canvasWidgets);

        // 3. Extract or generate displayComponent
        const displayComponent = this.lastDataMappingJson?.displayComponent ||
          this.generateDisplayComponentFromWidgets(this.canvasWidgets);

        // 4. Get sampleData array if available
        const sampleData = this.sampleDataArray.length > 0 ? this.sampleDataArray :
          (this.lastDataMappingJson?.sampleData || null);

        // Debug logging
        console.log('=== Template Save Debug ===');
        console.log('Canvas Widgets Count:', this.canvasWidgets.length);
        console.log('Widget Types:', this.canvasWidgets.map(w => w.type));
        console.log('Input Schema:', inputSchema);
        console.log('Data Object:', dataObject);
        console.log('Display Component:', displayComponent);
        console.log('Sample Data:', sampleData);
        console.log('Last Data Mapping JSON:', this.lastDataMappingJson);

        // Update lastDataMappingJson with current sampleData if it exists
        const updatedDataMapping = this.lastDataMappingJson ? {
          ...this.lastDataMappingJson,
          ...(sampleData && { sampleData: sampleData })
        } : null;

        // Build payload with standardized structure
        const payload: any = {
          saveType: data.saveType,
          // Include appId and orgId if available
          ...(this.formConfig?.appId && { appId: this.formConfig.appId }),
          ...(this.formConfig?.orgId && { orgId: this.formConfig.orgId }),
          // Standardized 4-component structure
          dataObject: dataObject,
          displayComponent: displayComponent,
          designObject: pageDesign,
          inputSchema: inputSchema,
          // Include sampleData if available
          ...(sampleData && { sampleData: sampleData }),
          // Additional components for backward compatibility
          // Nested templateObj for backward compatibility
          templateObj: {
            dataObject: dataObject,
            displayComponent: displayComponent,
            designObject: pageDesign,
            inputSchema: inputSchema,
            widgetInputs: widgetInputsOnly,
            dataMapping: updatedDataMapping,
            ...(sampleData && { sampleData: sampleData })
          },
          templateName: data.pageName,
          templateDescription: data.pageDescription,
          templateWidth: this.canvasWidth,
          templateHeight: this.canvasHeight,
          templateType: this.formConfig?.reportType,
          appId: this.formConfig?.appId,
          orgId: this.formConfig?.orgId,
          "activeIdtVersion": "Parent",
          "activeOdtVersion": "Parent",
          "visble": false,
          "sharable": false,
          "confidentialType": false,
          "allowCopyContent": false,
          "allowEditContent": false,
          "isActive": false,
        };

        console.log('Final Payload:', JSON.stringify(payload, null, 2));

        this.pageAdminService.postTemplate(payload).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Template saved successfully',
              life: 3000
            });
          },
          error: (err) => {
            console.error('Error saving template:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to save template',
              life: 3000
            });
          }
        });
      } catch (error) {
        console.error('Error preparing template payload:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to prepare template data',
          life: 3000
        });
      }
    });
  }

  /**
   * Handles data changes for widgets
   */
  onDataChange(): void {
    // Data changes are already applied via ngModel binding
    // This method can be used for additional processing if needed
  }

  /**
   * Opens a JSON editor dialog to edit sample data for the selected widget
   * Currently implemented for primeng-dynamic-table widgets
   */
  openWidgetSampleDataEditor(): void {
    if (!this.selectedWidget || this.selectedWidget.type !== 'primeng-dynamic-table') {
      return;
    }

    // Prepare template data based on the selected widget's current dataSets
    const currentDataSets = this.selectedWidget.input?.dataSets;
    let templateData: any = {};

    if (currentDataSets && typeof currentDataSets === 'object') {
      // Exclude non-data properties like style, emitterId, id when editing
      const { style, emitterId, id, ...dataOnly } = currentDataSets;
      templateData = { ...dataOnly };
    } else {
      // Fallback to a default structure similar to createDefaultInput for primeng-dynamic-table
      const attributes = Array(5)
        .fill(0)
        .map((_, i) => ({ attributeName: `Column${i + 1}`, order: i }));
      const products = Array(2)
        .fill(0)
        .map(() =>
          attributes.reduce(
            (obj, attr) => ({ ...obj, [attr.attributeName]: attr.attributeName }),
            {}
          )
        );
      templateData = { attributes, products };
    }

    // Open the generic code editor as a JSON editor for this widget
    this.codeRef = this.dialogService.open(CodeEditorComponent, {
      width: '70vw',
      height: '60vh',
      data: templateData,
      header: 'Edit Table Sample Data (JSON)',
      closable: true,
      modal: true
    });

    this.codeRef.onClose.subscribe((config: any) => {
      if (!config || !config.status || !config.code) {
        return;
      }

      try {
        const parsed = JSON.parse(config.code);

        // Basic validation: must have attributes and products arrays
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          !Array.isArray(parsed.attributes) ||
          !Array.isArray(parsed.products)
        ) {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid Format',
            detail:
              'JSON must contain \"attributes\" (array) and \"products\" (array) for the dynamic table.',
            life: 3000
          });
          return;
        }

        // Preserve existing metadata like style, emitterId, id
        const existingDataSets = this.selectedWidget!.input?.dataSets || {};
        const { style, emitterId, id } = existingDataSets;

        const newDataSets = {
          ...existingDataSets,
          attributes: parsed.attributes,
          products: parsed.products,
          ...(style && { style }),
          ...(emitterId && { emitterId }),
          ...(id && { id })
        };

        // Apply the new dataSets to the selected widget
        if (!this.selectedWidget!.input) {
          this.selectedWidget!.input = {};
        }
        this.selectedWidget!.input = {
          ...this.selectedWidget!.input,
          dataSets: newDataSets
        };

        // Trigger any additional data-change handling
        this.onDataChange();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Table sample data updated successfully',
          life: 3000
        });
      } catch (error: any) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid JSON',
          detail: error?.message || 'Unable to parse JSON',
          life: 3000
        });
      }
    });
  }

  /**
   * Opens the image upload dialog for image widgets
   */
  openImageUpload(): void {
    if (!this.selectedWidget || this.selectedWidget.type !== 'image') {
      return;
    }

    this.ref = this.dialogService.open(ImageUploadComponent, {
      header: 'Upload Image',
      width: '50vw',
      modal: true,
      closable: true,
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
    });

    this.ref.onClose.subscribe((data: any) => {
      if (data && this.selectedWidget) {
        // Update the image source with the uploaded image data URL
        if (!this.selectedWidget.input) {
          this.selectedWidget.input = {};
        }
        this.selectedWidget.input.src = data;
        this.onDataChange();
      }
    });
  }

  /**
   * Copies the page design JSON to clipboard
   */
  copyPageDesignToClipboard(): void {
    try {
      const pageDesign = this.exportPageDesign();
      const jsonString = JSON.stringify(pageDesign, null, 2);

      navigator.clipboard.writeText(jsonString).then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Page design copied to clipboard',
          life: 3000
        });
      }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to copy to clipboard',
          life: 3000
        });
      });
    } catch (error) {
      console.error('Error copying page design:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to copy page design',
        life: 3000
      });
    }
  }

  /**
   * Opens the code editor dialog
   */
  openCodeEditor(): void {
    const pageDesign = this.exportPageDesign();

    this.codeRef = this.dialogService.open(CodeEditorComponent, {
      width: '70vw',
      height: '50vw',
      data: pageDesign,
      header: 'Code Editor',
      closable: true,
      modal: true
    });

    this.codeRef.onClose.subscribe((config: any) => {
      if (config && config.status === true) {
        try {
          // Check if widgets should be generated from data/displayComponent structure
          if (config.shouldGenerateWidgets && config.widgetData) {
            this.generateWidgetsFromJsonData(config.widgetData);
          } else {
            // Normal mode - apply parsed design back to canvas
            const parsed = JSON.parse(config.code);
            if (parsed.widgets && Array.isArray(parsed.widgets)) {
              this.canvasWidgets = parsed.widgets;
              this.updateCanvasHeight();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Page design updated from code editor',
                life: 3000
              });
            }
          }
        } catch (error: any) {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid JSON',
            detail: error?.message || 'Unable to parse editor content.',
            life: 3000
          });
        }
      }
    });
  }

  /**
   * Maps displayComponent values to widget types
   */
  private mapDisplayComponentToWidgetType(displayComponent: string): string | null {
    const mapping: Record<string, string> = {
      'input-field': 'input-text',
      'input-text': 'input-text',
      'bar-chart': 'bar-chart',
      'donut-chart': 'donut-chart',
      'line-chart': 'apex-line-chart',
      'pie-chart': 'pie-chart',
      'image': 'image',
      'label': 'label',
      'paragraph': 'paragraph',
      'text-area': 'text-area',
      'checkbox': 'checkbox',
      'date-picker': 'date-picker',
      'dropdown': 'dropdown',
      'radio-button': 'radio-button',
      'file-upload': 'file-upload',
      'btn': 'btn',
      'btn-icon': 'btn-icon',
      'button': 'btn',
      'icon-button': 'btn-icon'
    };
    return mapping[displayComponent.toLowerCase()] || null;
  }

  /**
   * Extracts data from nested JSON object using dot notation path
   */
  private extractDataFromPath(data: any, path: string): any {
    const keys = path.split('.');
    let value = data;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    return value;
  }

  /**
   * Creates widget input based on widget type and data
   */
  private createWidgetInputFromData(widgetType: string, data: any, displayComponent: string): any {
    const defaultStyle = {
      backgroundMode: 'transparent',
      backgroundColor: 'transparent'
    };

    const baseInput = {
      style: { ...defaultStyle }
    };

    switch (widgetType) {
      case 'input-text':
        return {
          ...baseInput,
          value: typeof data === 'string' || typeof data === 'number' ? String(data) : ''
        };
      case 'image':
        return {
          ...baseInput,
          src: typeof data === 'string' ? data : '/assets/images/svgs/no-image.svg',
          alterateText: displayComponent || 'Image'
        };
      case 'label':
        return {
          ...baseInput,
          label: typeof data === 'string' || typeof data === 'number' ? String(data) : 'Label'
        };
      case 'paragraph':
        return {
          ...baseInput,
          content: typeof data === 'string' || typeof data === 'number' ? String(data) : 'Paragraph'
        };
      case 'bar-chart':
        if (data && typeof data === 'object' && data.labels && data.values) {
          return {
            ...baseInput,
            labels: data.labels,
            values: data.values,
            title: data.title || 'Chart'
          };
        }
        return {
          ...baseInput,
          labels: ['Q1', 'Q2', 'Q3'],
          values: [540, 325, 702],
          title: 'Title'
        };
      case 'donut-chart':
        if (data && typeof data === 'object' && data.labels && data.values) {
          return {
            ...baseInput,
            labels: data.labels,
            values: data.values
          };
        }
        return {
          ...baseInput,
          labels: ['A', 'B', 'C'],
          values: [100, 200, 300]
        };
      case 'pie-chart':
        if (data && typeof data === 'object' && data.labels && data.values) {
          return {
            ...baseInput,
            labels: data.labels,
            values: data.values
          };
        }
        return {
          ...baseInput,
          labels: ['A', 'B', 'C'],
          values: [540, 300, 400]
        };
      case 'apex-line-chart':
        if (data && typeof data === 'object' && data.labels && data.values) {
          return {
            ...baseInput,
            labels: data.labels,
            values: data.values
          };
        }
        return {
          ...baseInput,
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          values: [31, 40, 28, 51, 42, 109, 100]
        };
      default:
        return baseInput;
    }
  }

  /**
   * Gets widget label from type and field path
   */
  private getWidgetLabel(widgetType: string, fieldPath: string): string {
    const typeLabels: Record<string, string> = {
      'input-text': 'Input Field',
      'bar-chart': 'Bar Chart',
      'donut-chart': 'Donut Chart',
      'pie-chart': 'Pie Chart',
      'apex-line-chart': 'Line Chart',
      'image': 'Image',
      'label': 'Label',
      'paragraph': 'Paragraph'
    };

    const baseLabel = typeLabels[widgetType] || widgetType;
    const fieldName = fieldPath.split('.').pop() || fieldPath;
    return `${baseLabel} (${fieldName})`;
  }

  /**
   * Generates widgets from JSON data structure with data/dataObject and displayComponent
   */
  private generateWidgetsFromJsonData(jsonData: any): void {
    // Support both 'data' and 'dataObject' properties
    const data = jsonData.data || jsonData.dataObject;

    if (!data || !jsonData.displayComponent) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Structure',
        detail: 'JSON must contain "data" (or "dataObject") and "displayComponent" properties',
        life: 3000
      });
      return;
    }

    // Normalize the structure: if dataObject was used, create a normalized copy
    // Preserve all properties including sampleData
    const normalizedJson = jsonData.dataObject && !jsonData.data
      ? { ...jsonData, data: jsonData.dataObject }
      : jsonData;

    // Remember the mapping JSON for saving alongside design (preserve sampleData)
    this.lastDataMappingJson = {
      ...normalizedJson,
      sampleData: jsonData.sampleData // Explicitly preserve sampleData
    };

    // Store sample data array if provided
    if (jsonData.sampleData && Array.isArray(jsonData.sampleData) && jsonData.sampleData.length > 0) {
      this.sampleDataArray = jsonData.sampleData;
      // Create dropdown options: "Original" + each sample entry
      this.sampleDataOptions = [
        { label: 'Original Data', value: -1 }
      ];
      this.sampleDataArray.forEach((sample, index) => {
        // Use metadata name if available, otherwise fallback to name/id or index
        const displayName = sample.metadata?.name ||
          sample.name ||
          sample.id ||
          `Sample ${index + 1}`;
        this.sampleDataOptions.push({
          label: displayName,
          value: index
        });
      });
      this.selectedSampleIndex = -1; // Start with original data
    } else {
      this.sampleDataArray = [];
      this.sampleDataOptions = [];
      this.selectedSampleIndex = -1;
    }
    const displayComponents = jsonData.displayComponent;
    const newWidgets: DesignerWidget[] = [];
    let currentY = 0.05;
    const widgetHeight = 0.15;
    const widgetWidth = 0.25;
    const spacing = 0.05;

    // Helper: try to resolve data for a given field path.
    // 1) Try the field path as-is (supports dot notation like "employee.name")
    // 2) If not found and data has exactly one root object (e.g. { employee: {...} }),
    //    try "<rootKey>.<fieldPath>" so mappings like "name" work against data.employee.name
    const rootKeys = Object.keys(data || {});
    const singleRootKey =
      rootKeys.length === 1 && data && typeof data[rootKeys[0]] === 'object'
        ? rootKeys[0]
        : null;

    const resolveFieldData = (fieldPath: string): any => {
      // First, try the path as provided
      const direct = this.extractDataFromPath(data, fieldPath);
      if (direct !== null && direct !== undefined) {
        return direct;
      }

      // Fallback: if there is a single root object (e.g. "employee"),
      // also try "<root>.<fieldPath>" so that "name" → "employee.name"
      if (singleRootKey && !fieldPath.startsWith(singleRootKey + '.')) {
        const nestedPath = `${singleRootKey}.${fieldPath}`;
        const nested = this.extractDataFromPath(data, nestedPath);
        if (nested !== null && nested !== undefined) {
          return nested;
        }
      }

      // If nothing found, return null
      return null;
    };

    // Process each field in displayComponent
    for (const [fieldPath, displayComponent] of Object.entries(displayComponents)) {
      const widgetType = this.mapDisplayComponentToWidgetType(displayComponent as string);

      if (!widgetType) {
        console.warn(`Unknown displayComponent: ${displayComponent} for field: ${fieldPath}`);
        continue;
      }

      // Extract data for this field (supports both "name" and "employee.name" style mappings)
      const fieldData = resolveFieldData(fieldPath);

      // Create widget input from data
      const widgetInput = this.createWidgetInputFromData(widgetType, fieldData, displayComponent as string);

      // Find available position
      const availablePosition = this.findAvailablePosition(widgetWidth, widgetHeight, 0.05, currentY);

      const id = `w-${Date.now()}-${Math.floor(Math.random() * 1000)}-${fieldPath}`;
      const selector = this.getSelectorFromType(widgetType);

      const newWidget: DesignerWidget = {
        id,
        label: this.getWidgetLabel(widgetType, fieldPath),
        type: widgetType,
        selector: selector,
        position: {
          x: availablePosition.x,
          y: availablePosition.y,
          w: widgetWidth,
          h: widgetHeight,
          zIndex: this.canvasWidgets.length + newWidgets.length + 1,
        },
        input: widgetInput,
      };

      newWidgets.push(newWidget);
      currentY = availablePosition.y + widgetHeight + spacing;
    }

    if (newWidgets.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Widgets Generated',
        detail: 'No valid widgets could be generated from the JSON',
        life: 3000
      });
      return;
    }

    // Add widgets to canvas
    this.canvasWidgets = [...this.canvasWidgets, ...newWidgets];
    this.updateCanvasHeight();

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Generated ${newWidgets.length} widget(s) from JSON`,
      life: 3000
    });
  }

  /**
   * Opens the LLM chatbox dialog
   */
  openLlmEditor(): void {
    const pageDesign = this.exportPageDesign();

    this.llmRef = this.dialogService.open(LlmChatboxComponent, {
      width: '90vw',
      height: '90vw',
      data: pageDesign,
      header: 'LLM Chat Box',
      closable: true,
      modal: true,
      maximizable: true
    });
  }

  /**
   * Detects alignment guides (Figma-like) when dragging or resizing widgets
   * @param currentWidget - The widget being moved/resized
   * @param otherWidgets - Array of other widgets to check alignment against
   * @param containerWidth - Width of the container (canvas or section)
   * @param containerHeight - Height of the container
   * @param isNested - Whether the widget is nested in a section
   * @param currentRect - Optional current rectangle in pixels (for drag operations)
   */
  private detectAlignmentGuides(
    currentWidget: DesignerWidget,
    otherWidgets: DesignerWidget[],
    containerWidth: number,
    containerHeight: number,
    isNested: boolean,
    currentRect?: { x: number; y: number; w: number; h: number }
  ): void {
    this.alignmentGuides = [];

    if (!currentWidget || !otherWidgets || otherWidgets.length === 0) {
      return;
    }

    // Get current widget's rectangle in pixels
    let currentX: number, currentY: number, currentW: number, currentH: number;

    if (currentRect) {
      // Use provided rectangle (for drag operations)
      currentX = currentRect.x;
      currentY = currentRect.y;
      currentW = currentRect.w;
      currentH = currentRect.h;
    } else {
      // Calculate from relative positions (for resize operations)
      currentX = currentWidget.position.x * containerWidth;
      currentY = currentWidget.position.y * containerHeight;
      currentW = currentWidget.position.w * containerWidth;
      currentH = currentWidget.position.h * containerHeight;
    }

    const currentLeft = currentX;
    const currentRight = currentX + currentW;
    const currentTop = currentY;
    const currentBottom = currentY + currentH;
    const currentCenterX = currentX + currentW / 2;
    const currentCenterY = currentY + currentH / 2;

    // Collect all alignment points from other widgets
    const verticalGuides: number[] = [];
    const horizontalGuides: number[] = [];

    for (const widget of otherWidgets) {
      if (widget.id === currentWidget.id) continue;

      const widgetX = widget.position.x * containerWidth;
      const widgetY = widget.position.y * containerHeight;
      const widgetW = widget.position.w * containerWidth;
      const widgetH = widget.position.h * containerHeight;

      // Vertical alignment points (left, center, right)
      verticalGuides.push(widgetX); // Left edge
      verticalGuides.push(widgetX + widgetW / 2); // Center
      verticalGuides.push(widgetX + widgetW); // Right edge

      // Horizontal alignment points (top, center, bottom)
      horizontalGuides.push(widgetY); // Top edge
      horizontalGuides.push(widgetY + widgetH / 2); // Center
      horizontalGuides.push(widgetY + widgetH); // Bottom edge
    }

    // Check for vertical alignments (draw full-height guide through all aligned widgets)
    for (const guideX of verticalGuides) {
      const distLeft = Math.abs(currentLeft - guideX);
      const distRight = Math.abs(currentRight - guideX);
      const distCenter = Math.abs(currentCenterX - guideX);

      if (distLeft < this.SNAP_THRESHOLD || distRight < this.SNAP_THRESHOLD || distCenter < this.SNAP_THRESHOLD) {
        this.alignmentGuides.push({
          type: 'vertical',
          position: guideX,
          // Draw the guide across the whole container height so it is
          // clearly visible both "above" and "below" the current widget.
          start: 0,
          end: containerHeight
        });
        break; // Only show one vertical guide at a time
      }
    }

    // Check for horizontal alignments (draw full-width guide)
    for (const guideY of horizontalGuides) {
      const distTop = Math.abs(currentTop - guideY);
      const distBottom = Math.abs(currentBottom - guideY);
      const distCenter = Math.abs(currentCenterY - guideY);

      if (distTop < this.SNAP_THRESHOLD || distBottom < this.SNAP_THRESHOLD || distCenter < this.SNAP_THRESHOLD) {
        this.alignmentGuides.push({
          type: 'horizontal',
          position: guideY,
          // Draw the guide across the whole container width
          start: 0,
          end: containerWidth
        });
        break; // Only show one horizontal guide at a time
      }
    }
  }

  /**
   * Updates the position/size of the currently selected widget from the
   * numeric inputs (X, Y, W, H) in the sidebar. Works for both normal
   * canvas widgets and section (nested) widgets because all positions
   * are stored as relative 0..1 values to their parent container.
   */
  onPositionChange(
    axis: 'x' | 'y' | 'w' | 'h',
    valuePercent: number | null | undefined
  ): void {
    if (!this.selectedWidget || valuePercent == null) {
      return;
    }

    // Clamp percentage to 0..100, then convert to 0..1
    const clampedPercent = Math.max(0, Math.min(100, Number(valuePercent)));
    const value = clampedPercent / 100;

    const widget = this.selectedWidget;

    // Ensure w/h defaults
    if (widget.position.w == null) {
      widget.position.w = 0.25;
    }
    if (widget.position.h == null) {
      widget.position.h = 0.15;
    }

    if (axis === 'w') {
      // Width: keep within [0.05, 1 - x]
      const maxW = 1 - widget.position.x;
      widget.position.w = Math.min(Math.max(value, 0.05), maxW);
      this.updateCanvasHeight();
    } else if (axis === 'h') {
      // Height: keep within bounds (unbounded for root)
      const maxH = !widget.parentId ? 100 : 1 - widget.position.y;
      widget.position.h = Math.min(Math.max(value, 0.05), maxH);
      this.updateCanvasHeight();
    } else if (axis === 'x') {
      // X: keep within [0, 1 - w]
      const maxX = 1 - widget.position.w;
      widget.position.x = Math.min(Math.max(value, 0), maxX);
    } else if (axis === 'y') {
      // Y: for both canvas and nested widgets, keep within bounds
      const maxY = !widget.parentId ? 100 : 1 - widget.position.h;
      widget.position.y = Math.min(Math.max(value, 0), maxY);
      this.updateCanvasHeight();
    }
  }

  /**
   * Handles sample data selection change
   * Updates widget data while preserving positions and styles
   */
  onSampleDataChange(): void {
    if (!this.lastDataMappingJson || !this.lastDataMappingJson.displayComponent) {
      return;
    }

    // Determine which data to use
    let dataToUse: any;
    if (this.selectedSampleIndex === -1) {
      // Use original dataObject
      dataToUse = this.lastDataMappingJson.data || this.lastDataMappingJson.dataObject;
    } else {
      // Use selected sample data
      const selectedSample = this.sampleDataArray[this.selectedSampleIndex];
      if (!selectedSample) {
        return;
      }

      // Exclude metadata when using sample data for rendering
      const { metadata, ...sampleWithoutMetadata } = selectedSample;

      // Sample data is typically a flat object, but we need to wrap it in the same structure
      // Check if original data had a root key (like "employee")
      const originalData = this.lastDataMappingJson.data || this.lastDataMappingJson.dataObject;
      if (!originalData) {
        return;
      }

      const rootKeys = Object.keys(originalData);
      const singleRootKey = rootKeys.length === 1 && originalData && typeof originalData[rootKeys[0]] === 'object'
        ? rootKeys[0]
        : null;

      // If original had a root key, wrap sample in same structure
      if (singleRootKey) {
        dataToUse = { [singleRootKey]: sampleWithoutMetadata };
      } else {
        dataToUse = sampleWithoutMetadata;
      }
    }

    // Update each widget's input data based on the new data
    const displayComponents = this.lastDataMappingJson.displayComponent;

    // Helper to resolve field data (same logic as in generateWidgetsFromJsonData)
    const rootKeys = Object.keys(dataToUse || {});
    const singleRootKey =
      rootKeys.length === 1 && dataToUse && typeof dataToUse[rootKeys[0]] === 'object'
        ? rootKeys[0]
        : null;

    const resolveFieldData = (fieldPath: string): any => {
      const direct = this.extractDataFromPath(dataToUse, fieldPath);
      if (direct !== null && direct !== undefined) {
        return direct;
      }

      if (singleRootKey && !fieldPath.startsWith(singleRootKey + '.')) {
        const nestedPath = `${singleRootKey}.${fieldPath}`;
        const nested = this.extractDataFromPath(dataToUse, nestedPath);
        if (nested !== null && nested !== undefined) {
          return nested;
        }
      }

      return null;
    };

    // Update widgets recursively (including nested widgets in sections)
    const updateWidgetData = (widgets: DesignerWidget[]): void => {
      for (const widget of widgets) {
        // Skip section widgets themselves, but process their children
        if (widget.type === 'section' && widget.children) {
          updateWidgetData(widget.children);
          continue;
        }

        // Extract field path from widget label
        const fieldPath = this.extractFieldPathFromLabel(widget.label);
        if (!fieldPath) {
          continue;
        }

        // Get the display component type for this field
        const displayComponent = displayComponents[fieldPath];
        if (!displayComponent) {
          continue;
        }

        // Get widget type
        const widgetType = this.mapDisplayComponentToWidgetType(displayComponent);
        if (!widgetType) {
          continue;
        }

        // Extract new data for this field
        const fieldData = resolveFieldData(fieldPath);

        // Preserve existing style
        const existingStyle = widget.input?.style || {};

        // Create new input data from the field data
        const newInput = this.createWidgetInputFromData(widgetType, fieldData, displayComponent);

        // Merge with existing input, preserving style and other properties
        widget.input = {
          ...widget.input,
          ...newInput,
          style: { ...existingStyle, ...newInput.style }
        };
      }
    };

    // Update all canvas widgets
    updateWidgetData(this.canvasWidgets);

    this.messageService.add({
      severity: 'success',
      summary: 'Data Updated',
      detail: `Widget data updated from ${this.selectedSampleIndex === -1 ? 'original data' : 'sample data'}`,
      life: 2000
    });
  }

  /**
   * Fetches templates from the API based on appId and orgId
   */
  getTemplates(): void {
    if (!this.formConfig?.appId && !this.formConfig?.orgId) {
      return;
    }

    const payload = {
      ...(this.formConfig?.appId && { appId: this.formConfig.appId }),
      ...(this.formConfig?.orgId && { orgId: this.formConfig.orgId }),
      ...(this.formConfig?.reportType && { templateType: this.formConfig.reportType })
    };

    this.pageAdminService.getTemplates(payload).subscribe({
      next: (res: any) => {
        this.templates = [];
        if (Array.isArray(res?.templates)) {
          // Filter for templates with saveType === 'Template'
          for (const item of res.templates) {
            if (item.saveType === 'template') {
              this.templates.push(item);
              console.log(this.templates);
            }
          }
        }
      },
      error: (err) => {
        console.error('Error fetching templates:', err);
      },
    });
  }

  /**
   * Gets border color for template based on template type
   */
  getTemplateBorderColor(template: any): string {
    if (!template?.templateType) {
      return '#e0e0e0'; // Default gray color
    }

    const typeColors: { [key: string]: string } = {
      'Card Design': '#2196F3',      // Blue
      'Report': '#4CAF50',            // Green
      'Dashboard': '#FF9800',         // Orange
      'Form': '#9C27B0',              // Purple
      'Default': '#7eefed'            // Cyan
    };

    return typeColors[template.templateType] || typeColors['Default'];
  }

  /**
   * Loads a template and converts it to DesignerWidget format
   * Appends widgets to existing canvas instead of replacing them
   */
  loadTemplate(templateData: any): void {
    const templateId = templateData.templateId;
    this.pageAdminService.getTemplateByID(templateId).subscribe({
      next: (res: any) => {
        const IDTData = res.template;

        // Don't clear existing canvas - we'll append to it
        // this.canvasWidgets = [];
        this.selectedWidget = null;

        // Handle canvas dimensions for Card Design (only if canvas is empty)
        if (IDTData.templateType === 'Card Design' && this.canvasWidgets.length === 0) {
          if (IDTData.templateWidth) {
            this.canvasWidth = parseInt(IDTData.templateWidth) || 1200;
          }
          if (IDTData.templateHeight) {
            this.canvasMinHeightPx = parseInt(IDTData.templateHeight) || 800;
            this.canvasHeightPx = this.canvasMinHeightPx;
          }
        }

        let newWidgets: DesignerWidget[] = [];

        // Check if template has designObject structure (from page-designer)
        if (IDTData.designObject?.widgets) {
          // Template was saved from page-designer, use widgets directly
          newWidgets = this.convertDesignerWidgets(IDTData.designObject.widgets);
        } else if (IDTData.children) {
          // Template was saved from page-builder (GridStack format), convert it
          newWidgets = this.convertGridStackToDesignerWidgets(IDTData.children);
        } else if (IDTData.templateObj?.designObject?.widgets) {
          // Template has nested designObject
          newWidgets = this.convertDesignerWidgets(IDTData.templateObj.designObject.widgets);
        } else if (IDTData.templateObj?.children) {
          // Template has nested children (GridStack)
          newWidgets = this.convertGridStackToDesignerWidgets(IDTData.templateObj.children);
        }

        // Generate new unique IDs and update zIndex for new widgets
        const currentMaxZIndex = this.canvasWidgets.length > 0
          ? Math.max(...this.canvasWidgets.map(w => w.position.zIndex || 0))
          : 0;

        // Position new widgets using findAvailablePosition to avoid overlaps
        newWidgets.forEach((widget, index) => {
          // Generate new unique ID
          widget.id = `w-${Date.now()}-${Math.floor(Math.random() * 10000)}-${index}`;

          // Update zIndex to be after existing widgets
          widget.position.zIndex = currentMaxZIndex + index + 1;

          // Find available position for this widget
          const widgetWidth = widget.position.w || 0.25;
          const widgetHeight = widget.position.h || 0.15;
          const availablePosition = this.findAvailablePosition(widgetWidth, widgetHeight);

          // Update widget position to available position
          widget.position.x = availablePosition.x;
          widget.position.y = availablePosition.y;
        });

        // Append new widgets to existing canvas widgets
        this.canvasWidgets = [...this.canvasWidgets, ...newWidgets];

        // Update canvas height after loading widgets
        this.updateCanvasHeight();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Template loaded successfully. Added ${newWidgets.length} widget(s)`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error loading template:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load template',
          life: 3000
        });
      },
    });
  }

  /**
   * Converts GridStack widget format to DesignerWidget format
   */
  private convertGridStackToDesignerWidgets(gridStackWidgets: any[]): DesignerWidget[] {
    if (!Array.isArray(gridStackWidgets) || gridStackWidgets.length === 0) {
      return [];
    }

    // Calculate total grid height (find max y + h)
    const GRID_COLUMNS = 24; // GridStack uses 24 columns
    let maxGridY = 0;
    gridStackWidgets.forEach((widget: any) => {
      const bottomY = (widget.y || 0) + (widget.h || 1);
      maxGridY = Math.max(maxGridY, bottomY);
    });
    const totalGridRows = Math.max(maxGridY, 10); // Minimum 10 rows

    const designerWidgets: DesignerWidget[] = [];

    gridStackWidgets.forEach((gridWidget: any) => {
      // Convert GridStack coordinates to relative 0-1 coordinates
      const x = (gridWidget.x || 0) / GRID_COLUMNS;
      const y = (gridWidget.y || 0) / totalGridRows;
      const w = (gridWidget.w || 4) / GRID_COLUMNS;
      const h = (gridWidget.h || 4) / totalGridRows;

      // Map selector to widget type
      const widgetType = this.getWidgetTypeFromSelector(gridWidget.selector);

      // Create DesignerWidget
      const designerWidget: DesignerWidget = {
        id: gridWidget.id || `w-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        label: this.getWidgetLabelFromType(widgetType),
        type: widgetType,
        selector: gridWidget.selector || '',
        position: {
          x: Math.max(0, Math.min(x, 0.95)),
          y: Math.max(0, y),
          w: Math.max(0.05, Math.min(w, 1)),
          h: Math.max(0.05, Math.min(h, 1)),
          zIndex: designerWidgets.length + 1,
        },
        input: gridWidget.input || {},
      };

      // Handle section widgets with children (nested widgets)
      if (gridWidget.selector === 'app-section' && gridWidget.subGrid?.children) {
        designerWidget.children = this.convertGridStackToDesignerWidgets(gridWidget.subGrid.children);
      }

      designerWidgets.push(designerWidget);
    });

    return designerWidgets;
  }

  /**
   * Converts DesignerWidget format (for templates saved from page-designer)
   */
  private convertDesignerWidgets(widgets: any[]): DesignerWidget[] {
    if (!Array.isArray(widgets)) {
      return [];
    }

    return widgets.map((widget: any) => {
      const designerWidget: DesignerWidget = {
        id: widget.id || `w-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        label: widget.label || 'Widget',
        type: widget.type || '',
        selector: widget.selector || '',
        position: {
          x: widget.position?.x ?? 0.05,
          y: widget.position?.y ?? 0.05,
          w: widget.position?.w ?? 0.25,
          h: widget.position?.h ?? 0.15,
          zIndex: widget.position?.zIndex ?? 1,
        },
        input: widget.input || {},
        parentId: widget.parentId,
      };

      if (widget.children && Array.isArray(widget.children)) {
        designerWidget.children = this.convertDesignerWidgets(widget.children);
      }
      if (widget.rows && Array.isArray(widget.rows)) {
        designerWidget.rows = widget.rows.map((row: any[], ri: number) => {
          const converted = Array.isArray(row) ? this.convertDesignerWidgets(row) : [];
          converted.forEach((w: DesignerWidget) => { w.rowIndex = ri; });
          return converted;
        });
      }

      return designerWidget;
    });
  }

  /**
   * Maps selector to widget type
   */
  private getWidgetTypeFromSelector(selector: string): string {
    const selectorToTypeMap: Record<string, string> = {
      'app-pie-chart': 'pie-chart',
      'app-donut': 'donut-chart',
      'app-polar-area': 'polar',
      'app-radar': 'radar',
      'app-bar-chart': 'bar-chart',
      'app-line': 'line',
      'app-horizontal-bar': 'hbar',
      'app-sv-bar': 'svbar',
      'app-sh-bar': 'shbar',
      'app-apexspline': 'apex-line-chart',
      'app-label': 'label',
      'app-paragraph': 'paragraph',
      'app-input-text': 'input-text',
      'app-text-area': 'text-area',
      'app-checkbox': 'checkbox',
      'app-date-picker': 'date-picker',
      'app-dropdown': 'dropdown',
      'app-radio-button': 'radio-button',
      'app-file-upload': 'file-upload',
      'app-button': 'btn',
      'app-icon-button': 'btn-icon',
      'app-dynamic-table': 'primeng-dynamic-table',
      'app-static-table': 'static-table',
      'app-image': 'image',
      'app-video': 'video',
      'app-map': 'map',
      'app-tag': 'tag',
      'app-date-tag': 'date-tag',
      'app-location-tag': 'location-tag',
      'app-spacer': 'spacer',
      'app-divider': 'divider',
      'app-speed-guage': 'guage',
      'app-section': 'section',
      'app-designer-section-container': 'section',
      'app-designer-iterator-container': 'iterator',
    };

    return selectorToTypeMap[selector] || selector.replace('app-', '');
  }

  /**
   * Gets widget label from type
   */
  private getWidgetLabelFromType(type: string): string {
    const typeLabels: Record<string, string> = {
      'input-text': 'Input Field',
      'bar-chart': 'Bar Chart',
      'donut-chart': 'Donut Chart',
      'pie-chart': 'Pie Chart',
      'apex-line-chart': 'Line Chart',
      'image': 'Image',
      'label': 'Label',
      'paragraph': 'Paragraph',
      'section': 'Section',
    };

    return typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  /**
   * Opens a JSON editor dialog to add new sample data
   */
  openSampleDataEditor(): void {
    // Create a template based on the first sample or original data structure
    let templateData: any = {};

    if (this.sampleDataArray.length > 0) {
      // Use first sample as template
      templateData = { ...this.sampleDataArray[0] };
    } else if (this.lastDataMappingJson) {
      // Use original data structure as template
      const originalData = this.lastDataMappingJson.data || this.lastDataMappingJson.dataObject;
      if (originalData) {
        const rootKeys = Object.keys(originalData);
        if (rootKeys.length === 1 && typeof originalData[rootKeys[0]] === 'object') {
          // If data has a root key (like "employee"), use the nested object as template
          templateData = { ...originalData[rootKeys[0]] };
        } else {
          templateData = { ...originalData };
        }
      }
    }

    this.sampleDataEditorRef = this.dialogService.open(CodeEditorComponent, {
      width: '70vw',
      height: '60vh',
      data: templateData,
      header: 'Add New Sample Data',
      closable: true,
      modal: true
    });

    this.sampleDataEditorRef.onClose.subscribe((result: any) => {
      if (result && result.status === true && result.code) {
        try {
          const newSampleData = JSON.parse(result.code);

          // Validate that it's an object
          if (typeof newSampleData !== 'object' || Array.isArray(newSampleData)) {
            this.messageService.add({
              severity: 'error',
              summary: 'Invalid Format',
              detail: 'Sample data must be a JSON object, not an array',
              life: 3000
            });
            return;
          }

          // Now prompt for metadata (name and description)
          setTimeout(() => {
            const metadataRef = this.dialogService.open(SampleDataMetadataComponent, {
              header: 'Sample Data Metadata',
              width: '30rem',
              modal: true,
              closable: true,
              baseZIndex: 10001 // Ensure it appears above the code editor
            });

            metadataRef.onClose.subscribe((metadata: any) => {
              if (!metadata) {
                // User cancelled metadata dialog, don't add the sample data
                this.messageService.add({
                  severity: 'info',
                  summary: 'Cancelled',
                  detail: 'Sample data creation cancelled',
                  life: 2000
                });
                return;
              }

              // Add metadata to the sample data
              const sampleWithMetadata = {
                ...newSampleData,
                metadata: {
                  name: metadata.name,
                  description: metadata.description || ''
                }
              };

              // Add to sample data array
              this.sampleDataArray.push(sampleWithMetadata);

              // Update dropdown options
              this.sampleDataOptions = [
                { label: 'Original Data', value: -1 }
              ];
              this.sampleDataArray.forEach((sample, index) => {
                // Use metadata name if available, otherwise fallback to name/id or index
                const displayName = sample.metadata?.name ||
                  sample.name ||
                  sample.id ||
                  `Sample ${index + 1}`;
                this.sampleDataOptions.push({
                  label: displayName,
                  value: index
                });
              });

              // Update lastDataMappingJson to persist the new sample
              if (this.lastDataMappingJson) {
                this.lastDataMappingJson.sampleData = [...this.sampleDataArray];
              }

              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'New sample data added successfully',
                life: 3000
              });

              // Optionally switch to the newly added sample
              this.selectedSampleIndex = this.sampleDataArray.length - 1;
              this.onSampleDataChange();
            });
          }, 100); // Small delay to ensure code editor dialog is fully closed
        } catch (error: any) {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid JSON',
            detail: error?.message || 'Unable to parse JSON',
            life: 3000
          });
        }
      }
    });
  }
}

export interface DesignerWidget {
  id: string;
  label: string;
  type: string;
  selector: string;
  position: {
    x: number; // 0..1 (relative to parent canvas or section)
    y: number; // 0..1 (relative to parent canvas or section)
    w: number; // 0..1 (relative to parent canvas or section)
    h: number; // 0..1 (relative to parent canvas or section)
    zIndex?: number;
  };
  input: any;
  children?: DesignerWidget[]; // Nested widgets (for section widgets)
  rows?: DesignerWidget[][]; // Rows of widgets (for iterator/repeater - each row is a copy of the template)
  parentId?: string; // ID of parent section/iterator widget (if nested)
  _refreshKey?: number; // Used to force Angular to recreate widgets when updating live data
  rowIndex?: number; // Which row this widget belongs to (when parent is iterator)
  attributeId?: string;
  frequency?: string;
  dataMapping?: { // Data mapping: widget input prop → entity/instance attribute
    [propKey: string]: {
      type: string;       // 'Entity' | 'Instance'
      typeName: any;      // Selected entity/instance object {id, name}
      attribute: string;  // Attribute ID
      attributeName: string; // Attribute display name
    }
  };
}

export interface DesignerPage {
  version: string;
  timestamp: string;
  canvas: {
    width: number;
    heightPx: number;
    minHeightPx: number;
    styles: any;
  };
  widgets: DesignerWidget[];
}


