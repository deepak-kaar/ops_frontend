import { Component, ElementRef, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CanvasConfigComponent } from 'src/app/modules/page-administrator/components/dialogs/canvas-config/canvas-config.component';
import { Router } from '@angular/router';
import { Widget } from 'src/app/modules/page-administrator/interfaces/page-administrator';
import { PageAdministratorService } from 'src/app/modules/page-administrator/page-administrator.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GridStackOptions } from 'gridstack';
import {
  GridstackComponent,
  NgGridStackOptions,
} from 'gridstack/dist/angular';
import { MenuItem, MessageService, TreeNode } from 'primeng/api';
import { CodeEditorComponent } from 'src/app/modules/page-administrator/components/dialogs/code-editor/code-editor.component';
import { FrequencyConfigComponent } from '../../components/dialogs/frequency-config/frequency-config.component';
import { ImageUploadComponent } from '../../components/dialogs/image-upload/image-upload.component';
import { TextInputComponent } from '../../components/dialogs/text-input/text-input.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { TemplateConfirmationComponent } from '../../components/dialogs/template-confirmation/template-confirmation.component';
import { breakPointForToastComponent } from 'src/app/core/utils/breakpoint-utils';
import { LlmChatboxComponent } from '../../components/dialogs/llm-chatbox/llm-chatbox.component';
import { SampleDataMetadataComponent } from '../../components/dialogs/sample-data-metadata/sample-data-metadata.component';

type WidgetType = 'section' | 'input-text' | 'dropdown' | 'text-area' | 'label' | 'paragraph' |
  'radio-button' | 'date-picker' | 'file-upload' | 'checkbox' | 'btn' | 'btn-icon' |
  'primeng-dynamic-table' | 'pie-chart' | 'donut-chart' | 'polar' | 'radar' | 'bar-chart' |
  'line' | 'hbar' | 'svbar' | 'shbar' | 'image' | 'video' | 'map' | 'tag' | 'date-tag' | 'location-tag' | 'divider' | 'guage' |
  'apex-pie-chart' | 'apex-bar-chart' | 'apex-line-chart' | 'apex-area-chart' | 'apex-donut-chart';

@Component({
  selector: 'app-page-builder',
  standalone: false,
  templateUrl: './page-builder.component.html',
  styleUrl: './page-builder.component.css',
  encapsulation: ViewEncapsulation.None
})

export class PageBuilderComponent implements OnInit {

  private baseStyles = { style: {} };
  private defaultChartDims = { w: 4, h: 4 };
  private commonMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  protected dividerTypes = ['solid', 'dashed', 'dotted'];
  protected dividerLayouts = ['vertical', 'horizontal'];
  templates: any;
  colWidth: number = 1;
  colSpan: number = 1;
  payload: any;
  colorHex = '#ffffff';
  alphaPercent = 20;

  /**
     * @property {[key: string]: any;} breakPointForToastComponent - Defines the screen breakpoint at which toast notifications should adjust their behavior or appearance.
     */
  breakPointForToastComponent: { [key: string]: any; } = breakPointForToastComponent;

  private createSimpleInput(extras = {}): any {
    return { ...this.baseStyles, ...extras };
  }

  private createMirroredInputs(extras = {}): { input: any, inputOdt: any } {
    return {
      input: this.createSimpleInput(extras),
      inputOdt: this.createSimpleInput(extras)
    };
  }

  // Base configurations for different widget types
  private WIDGET_CONFIGS: Record<WidgetType, (id: string) => any> = {
    'section': id => ({
      w: 12,
      h: 4,
      selector: 'app-section',
      ...this.createMirroredInputs(),
      subGridOpts: {
        cellHeight: 50,
        column: 24,
        acceptWidgets: true,
        margin: 2,
        subGridDynamic: true,
        float: true
      }
    }),
    'input-text': id => ({
      ...this.defaultChartDims,
      w: 4,
      h: 1,
      selector: 'app-input-text',
      ...this.createMirroredInputs({ value: '' })
    }),
    'dropdown': id => ({
      w: 3,
      h: 1,
      selector: 'app-dropdown',
      ...this.createMirroredInputs({
        data: Array(5).fill(0).map((_, i) => ({ name: `Value${i + 1}`, code: `V${i + 1}` })),
        optionValue: '',
        optionLabel: '',
        value: ''
      })
    }),
    'text-area': id => ({
      w: 5,
      h: 2,
      selector: 'app-text-area',
      ...this.createMirroredInputs({ value: '' })
    }),
    'label': id => ({
      minW: 2,
      minH: 1,
      selector: 'app-label',
      input: { label: 'Label', style: { paddingLeft: 10 } },
      inputOdt: { label: '', style: { paddingLeft: 10 } }
    }),
    'paragraph': id => ({
      w: 2,
      h: 1,
      selector: 'app-paragraph',
      ...this.createMirroredInputs({ content: 'content', style: { paddingLeft: 10 } })
    }),
    'radio-button': id => ({
      w: 5,
      h: 1,
      selector: 'app-radio-button',
      input: { label1: 'Label', checked: 'yes', label2: 'Label', style: {} },
      inputOdt: { label1: 'Label', label2: 'Label', checked: true, style: {} }
    }),
    'date-picker': id => ({
      w: 4,
      h: 1,
      selector: 'app-date-picker',
      ...this.createMirroredInputs({ style: { buttonBar: false }, date: '' })
    }),
    'file-upload': id => ({
      w: 9,
      h: 3,
      selector: 'app-file-upload',
      ...this.createMirroredInputs({ file: '' })
    }),
    'checkbox': id => ({
      w: 1,
      h: 1,
      selector: 'app-checkbox',
      ...this.createMirroredInputs({ checked: false })
    }),
    'btn': id => ({
      w: 3,
      h: 1,
      selector: 'app-button',
      input: { buttonLabel: 'Button', style: {} },
      inputOdt: { buttonLabel: 'Button', style: { backgroundColor: '#00A3E0', border: 'none' } }
    }),
    'btn-icon': id => ({
      w: 1,
      h: 1,
      selector: 'app-icon-button',
      ...this.createMirroredInputs({ icon: 'pi pi-user' })
    }),
    'primeng-dynamic-table': id => {
      const attributes = Array(5).fill(0).map((_, i) => ({ attributeName: `Column${i + 1}` }));
      const products = Array(2).fill(0).map(() =>
        attributes.reduce((obj, attr) => ({ ...obj, [attr.attributeName]: attr.attributeName }), {})
      );
      return {
        x: 0,
        w: 12,
        h: 6,
        selector: 'app-dynamic-table',
        ...this.createMirroredInputs({
          dataSets: { attributes, products },
          cols: ['Q1', 'Q2', 'Q3'],
          rows: [540, 325, 702]
        })
      };
    },
    'pie-chart': id => ({
      ...this.defaultChartDims,
      selector: 'app-pie-chart',
      ...this.createMirroredInputs({ labels: ['A', 'B', 'C'], values: [540, 300, 400] })
    }),
    'donut-chart': id => ({
      ...this.defaultChartDims,
      selector: 'app-donut',
      ...this.createMirroredInputs({ labels: ['A', 'B', 'C'], values: [100, 200, 300] })
    }),
    'polar': id => ({
      ...this.defaultChartDims,
      selector: 'app-polar-area',
      input: { style: {}, labels: ['Green', 'Yellow', 'Blue'], values: [11, 16, 7, 3, 14], title: 'Title' },
      inputOdt: { style: {}, labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'], values: [11, 16, 7, 3, 14], title: 'Title' }
    }),
    'radar': id => ({
      ...this.defaultChartDims,
      selector: 'app-radar',
      ...this.createMirroredInputs({
        labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
        values: [65, 59, 90, 81, 56, 55, 40],
        title: 'Title'
      })
    }),
    'bar-chart': id => ({
      ...this.defaultChartDims,
      selector: 'app-bar-chart',
      ...this.createMirroredInputs({
        labels: ['Q1', 'Q2', 'Q3'],
        values: [540, 325, 702],
        title: 'Title'
      })
    }),
    'line': id => ({
      ...this.defaultChartDims,
      selector: 'app-line',
      ...this.createMirroredInputs({
        labels: this.commonMonths,
        values: [65, 59, 80, 81, 56, 55, 40],
        title: 'Titile'
      })
    }),
    'hbar': id => ({
      ...this.defaultChartDims,
      selector: 'app-horizontal-bar',
      ...this.createMirroredInputs({
        labels: this.commonMonths,
        values: [65, 59, 80, 81, 56, 55, 40],
        title: 'Titile'
      })
    }),
    'svbar': id => ({
      ...this.defaultChartDims,
      selector: 'app-sv-bar',
      ...this.createMirroredInputs({
        labels: this.commonMonths,
        values1: [50, 25, 12, 48, 90, 76, 42],
        title1: 'Titile1',
        values2: [21, 84, 24, 75, 37, 65, 34],
        title2: 'Titile2'
      })
    }),
    'shbar': id => ({
      ...this.defaultChartDims,
      selector: 'app-sh-bar',
      ...this.createMirroredInputs({
        labels: this.commonMonths,
        values1: [50, 25, 12, 48, 90, 76, 42],
        title1: 'Titile1',
        values2: [21, 84, 24, 75, 37, 65, 34],
        title2: 'Titile2'
      })
    }),
    'image': id => ({
      ...this.defaultChartDims,
      selector: 'app-image',
      input: { style: {}, src: '/assets/images/svgs/no-image.svg', alterateText: 'Image' },
      inputOdt: { style: {}, src: 'images/svg/page-builder/no-image.svg', alterateText: 'Image' }
    }),
    'video': id => ({
      ...this.defaultChartDims,
      selector: 'app-video',
      ...this.createMirroredInputs({
        videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'images/svg/page-builder/video.svg'
      })
    }),
    'map': id => ({
      ...this.defaultChartDims,
      selector: 'app-map',
      ...this.createMirroredInputs({ src: 'https://www.google.com/maps/embed?pb=!…' })
    }),
    'tag': id => {
      const baseTagStyle = {
        width: '100%', height: '100%', padding: '5px', 'border-radius': '8px'
      };
      return {
        w: 2,
        h: 1,
        selector: 'app-tag',
        input: { value: 'Event Status', style: { ...baseTagStyle, backgroundColor: '#F2FFD6', color: '#83BD01' } },
        inputOdt: { value: 'Event Status', style: { ...baseTagStyle, 'background-color': '#F2FFD6', color: '#83BD01' } }
      };
    },
    'date-tag': id => {
      const tagStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#EAD6F3',
        color: '#643278',
        borderRadius: '8px',
        padding: '5px'
      };
      return {
        w: 2,
        h: 1,
        selector: 'app-date-tag',
        ...this.createMirroredInputs({ style: tagStyle, date: 'Date' })
      };
    },
    'location-tag': id => {
      const tagStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#F2FFD6',
        color: '#83BD01',
        borderRadius: '8px',
        padding: '5px'
      };
      return {
        w: 3,
        h: 1,
        selector: 'app-location-tag',
        ...this.createMirroredInputs({ style: tagStyle, location: 'Location' })
      };
    },
    'divider': id => {
      const tagStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#F2FFD6',
        color: '#83BD01',
        borderRadius: '8px',
        padding: '5px',
        dividerType: 'solid',
        dividerLayout: 'horizontal'
      };
      return {
        w: 3,
        h: 1,
        selector: 'app-divider',
        ...this.createMirroredInputs({ style: tagStyle })
      };
    },
    'guage': id => {
      const tagStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#F2FFD6',
        color: '#83BD01',
        borderRadius: '8px',
        padding: '5px',
        dividerType: 'solid',
        dividerLayout: 'horizontal'
      };
      return {
        w: 3,
        h: 1,
        selector: 'app-speed-guage',
        ...this.createMirroredInputs({ style: tagStyle, speed: 23 })
      };
    },
    'apex-pie-chart': id => ({
      ...this.defaultChartDims,
      selector: 'app-apex-pie-chart',
      ...this.createMirroredInputs({ labels: ['A', 'B', 'C'], values: [540, 300, 400] })
    }),
    'apex-bar-chart': id => ({
      ...this.defaultChartDims,
      selector: 'app-apex-bar-chart',
      ...this.createMirroredInputs({
        labels: ['Q1', 'Q2', 'Q3'],
        values: [540, 325, 702],
        title: 'Title'
      })
    }),
    'apex-line-chart': id => ({
      ...this.defaultChartDims,
      selector: 'app-apexspline',
      ...this.createMirroredInputs({
        labels: this.commonMonths,
        values: [65, 59, 80, 81, 56, 55, 40],
        title: 'Title'
      })
    }),
    'apex-area-chart': id => ({
      ...this.defaultChartDims,
      selector: 'app-apex-area-chart',
      ...this.createMirroredInputs({
        labels: this.commonMonths,
        values: [65, 59, 80, 81, 56, 55, 40],
        title: 'Title'
      })
    }),
    'apex-donut-chart': id => ({
      ...this.defaultChartDims,
      selector: 'app-apex-donut-chart',
      ...this.createMirroredInputs({ labels: ['A', 'B', 'C'], values: [100, 200, 300] })
    })
  };
  private displayComponentWidgetMap: Record<string, WidgetType> = {
    'input text': 'input-text',
    'input-field': 'input-text',
    'text': 'input-text',
    'dropdown': 'dropdown',
    'radio button': 'radio-button',
    'checkbox': 'checkbox',
    'date picker': 'date-picker',
    'text area': 'text-area',
    'paragraph': 'paragraph',
    'label': 'label',
    'image': 'image',
    'video': 'video',
    'map': 'map',
    'tag': 'tag',
    'date tag': 'date-tag',
    'location tag': 'location-tag',
    'button': 'btn',
    'icon button': 'btn-icon',
    // Chart widgets
    'pie-chart': 'pie-chart',
    'pie chart': 'pie-chart',
    'donut-chart': 'donut-chart',
    'donut chart': 'donut-chart',
    'donut': 'donut-chart',
    'polar': 'polar',
    'polar-area': 'polar',
    'polar area': 'polar',
    'radar': 'radar',
    'radar-chart': 'radar',
    'radar chart': 'radar',
    'bar-chart': 'bar-chart',
    'bar chart': 'bar-chart',
    'bar': 'bar-chart',
    'line': 'line',
    'line-chart': 'line',
    'line chart': 'line',
    'hbar': 'hbar',
    'horizontal-bar': 'hbar',
    'horizontal bar': 'hbar',
    'horizontal-bar-chart': 'hbar',
    'svbar': 'svbar',
    'stacked-vertical-bar': 'svbar',
    'stacked vertical bar': 'svbar',
    'stacked-vertical-bar-chart': 'svbar',
    'shbar': 'shbar',
    'stacked-horizontal-bar': 'shbar',
    'stacked horizontal bar': 'shbar',
    'stacked-horizontal-bar-chart': 'shbar',
    // Table widgets
    'table': 'primeng-dynamic-table',
    'dynamic-table': 'primeng-dynamic-table',
    'dynamic table': 'primeng-dynamic-table',
    // Other widgets
    'section': 'section',
    'divider': 'divider',
    'guage': 'guage',
    'gauge': 'guage',
    'speed-guage': 'guage',
    'speed gauge': 'guage',
    // ApexCharts widgets
    'apex-pie-chart': 'apex-pie-chart',
    'apex pie chart': 'apex-pie-chart',
    'apex-pie': 'apex-pie-chart',
    'apex-bar-chart': 'apex-bar-chart',
    'apex bar chart': 'apex-bar-chart',
    'apex-bar': 'apex-bar-chart',
    'apex-line-chart': 'apex-line-chart',
    'apex line chart': 'apex-line-chart',
    'apex-line': 'apex-line-chart',
    'apex-area-chart': 'apex-area-chart',
    'apex area chart': 'apex-area-chart',
    'apex-area': 'apex-area-chart',
    'apex-donut-chart': 'apex-donut-chart',
    'apex donut chart': 'apex-donut-chart',
    'apex-donut': 'apex-donut-chart'
  };

  @ViewChild(GridstackComponent) gridComp?: GridstackComponent;
  showUi: boolean = false;
  formConfig: { appId: string, orgId: string, reportType: string } | any;
  configRef!: DynamicDialogRef;
  codeRef!: DynamicDialogRef;
  llmRef!: DynamicDialogRef;
  sidebarState: string = 'collapse';
  borderStyles = ['solid', 'dotted', 'dashed', 'groove'];
  tempActions: string[] = [
    'Widgets',
    'Templates',
    'Entity / Instance'
  ]
  tabValue = 0;
  selectedWidget: any
  widgetOptions: string[] = ["Styles", "Data Mapping"]
  decorationOptions: any[] = [
    {
      icon: '/assets/images/svgs/underlined.svg',
      decoration: 'Underline',
    },
    {
      icon: '/assets/images/svgs/strikethrough.svg',
      decoration: 'Strike',
    },
  ];
  selectedBtn!: string;
  selectedOpt!: string;
  tabs!: Widget[];
  sidePanelWidth: number = 200;
  canvasWidth = '';
  canvasHeight = '';
  canvasType = '';
  counter = 0;
  selectedWidget1: any;

  highlightedWidget: any;
  modifiedWidget: any;
  widgetStyles: any = {
    backgroundColor: '',
    // Background enhancements
    backgroundMode: 'color', // 'color' | 'image' | 'gradient'
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
    textAlign: 'Left',
    textDecoration: '',
    raised: false,
    rounded: false,
    text: false,
    outlined: false,
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
    buttonBar: false,
    selectionRange: false,
    month: false,
    year: false,
    paddingLeft: '10',
    paddingRight: '0',
    paddingTop: '0',
    paddingBottom: '0',
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderRightStyle: 'solid',
    borderTopWidth: '0',
    borderBottomWidth: '0',
    borderLeftWidth: '0',
    borderRightWidth: '0',
    borderTopColor: 'black',
    borderBottomColor: 'black',
    borderLeftColor: 'black',
    borderRightColor: 'black',
    dividerType: 'solid',
    dividerLayout: 'horizontal'
  };

  private _gridOptions: GridStackOptions = {
    column: 24,
    margin: 2,
    float: true,
    minRow: 1,
    cellHeight: 50,
    subGridDynamic: true,
    subGridOpts: {
      cellHeight: 50,
      column: 24,
      acceptWidgets: true,
      margin: 2,
      subGridDynamic: true,
      float: true
    }
  };
  fontFamilies: any[] = [];
  fontWeights: any[] = [];
  justifyOptions: any = [];
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
  serializedData: any;
  codeEditorState: any = {};
  textEl: any;
  
  // Sample data management
  sampleDataArray: any[] = [];
  sampleDataOptions: any[] = [];
  selectedSampleIndex: number = -1;

  static_text: string = '';
  availableProducts: any[] | undefined;
  selectedProducts: any[] = [];
  draggedAttribute: any | undefined | null;
  selectedCountry: any;
  entityList: any[] = [];
  selectedAttributes: any;
  selectedAttributesObj: { name: string; attributes: string[] }[] | undefined;
  entityDetails: any[] = [];
  rawEntityData: any[] = [];
  rawInstanceData: any[] = [];
  entityInstanceTree: TreeNode[] = [];
  selectedTreeNode: TreeNode | null = null;
  private treeNodeUid = 0;
  selectedAttributeNode?: TreeNode | null = null;
  attributeComponentOptions: any[] = [];
  selectedAttributeComponent: any = null;
  attributeValuePreview: string = '';
  inputProps: any[] = [];
  templateId: any;
  isShowUi: boolean = false;
  containerStyle: any;
  dropZones: any[] = [];
  droppedItemsByProp: { [key: string]: any[] } = {};
  eventId: string = '';
  eventList: any;
  attributes: any[] = []
  entityId: string = '';
  screenType: string = '';
  activeTabIndex: any;
  isShowAttr: boolean = true;
  // New variable to store selected widget
  selectedEmitter: any = {};

  // New variable to store the available widgets (this should come from an API)
  emitterList: any[] = [];

  emitterListWidgetSpecific: any[] = [];
  ref: DynamicDialogRef | undefined;
  staticList = [
    {
      id: '1',
      name: 'Text',
      type: 'Static',
    },
    {
      id: '2',
      name: 'Image',
      type: 'Static',
    },
    {
      id: '3',
      name: 'Custom Array',
      type: 'Static'
    }
  ];

  public get gridOptions(): GridStackOptions {
    return this._gridOptions;
  }
  public set gridOptions(value: GridStackOptions) {
    this._gridOptions = value;
  }
  gridOptionsFull: NgGridStackOptions = {
    ...this.gridOptions,
  };
  gridStyle: any = {};
  items: MenuItem[];
  items1: MenuItem[];


  constructor(private dialogService: DialogService,
    private router: Router,
    private pageAdminService: PageAdministratorService,
    public sanitizer: DomSanitizer,
    private messageService: MessageService,
    private renderer: Renderer2, private el: ElementRef,
    private spinner: NgxSpinnerService) {
    this.items = [
      {
        label: 'Save as Draft',
        command: () => {
          this.save();
        }
      },
      {
        label: 'Save as Template',
        command: () => {
          this.saveTemplate();
        }
      },
      {
        label: 'Save',
        command: () => {
          this.saveGrid();
        }
      },
    ];

    this.items1 = [
      {
        label: 'Code Editor',
        command: () => {
          this.openCodeEditor();
        }
      },
      {
        label: 'LLM Generated',
        command: () => {
          this.openLlmEditor();
        }
      },
    ];
    this.formConfig = this.router.getCurrentNavigation()?.extras.state;
    this.payload = {
      ...(this.formConfig?.appId && { appId: this.formConfig?.appId }),
      ...(this.formConfig?.orgId && { orgId: this.formConfig?.orgId })
    };
  }


  ngOnInit() {
    this.fontFamilies = this.pageAdminService.getFonts();
    this.fontWeights = this.pageAdminService.getWeights();
    this.justifyOptions = this.pageAdminService.getJustfyOptions();
    if (!this.formConfig?.reportType || !this.formConfig?.appId) {
      this.openConfigDiaglog();
    }
    else if (this.formConfig?.reportType === 'Card Design') {
      this.openConfigDiaglog();
    }
    else {
      this.getDatas();
      this.showUi = true;
    }
    this.selectedBtn = this.tempActions[0];
    this.selectedOpt = this.widgetOptions[0];
  }

  getDatas() {
    this.getEntityData();
    this.getInstanceData();
    this.getAttrList();
    this.getTemplates();
    this.getWidgets();
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
        this.getDatas();
        this.showUi = true;
        if (config?.canvasWidth && config?.canvasHeight) {
          this.canvasWidth = config.canvasWidth;
          this.canvasHeight = config.canvasHeight;
          this.canvasType = config.canvasType;
          this.centerGridZone();
        } else {
          this.gridStyle = {};
        }
      }
      else {
        this.router.navigateByUrl('/pageAdmin/pageManager')
      }
    });
  }

  getWidgets() {
    this.tabs = this.pageAdminService.getAllWidgtes()
  }

  centerGridZone() {

    // this.gridStyle = {
    //   position: 'absolute',
    //   'margin-top': `${verticalMargin}px`,
    //   'margin-left': `${horizontalMargin}px`,
    //   'margin-right': `${horizontalMargin}px`,
    //   width: `${this.canvasWidth}px`,
    //   height: `${this.canvasHeight}px`,
    // };

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const gridWidth = parseInt(this.canvasWidth);
    const gridHeight = parseInt(this.canvasHeight);

    const horizontalMargin = Math.max(
      (viewportWidth - this.sidePanelWidth - gridWidth) / 2,
      0
    );

    console.log(horizontalMargin);
    const verticalMargin = Math.max((viewportHeight - gridHeight) / 2, 0);

    this.gridStyle = {
      width: `${this.canvasWidth}px`,
      height: `${this.canvasHeight}px`,
      // display: 'flex',
      // justifyContent: 'center',
      // alignItems: 'center',
      margin: 'auto',
      marginTop: `${verticalMargin}px`
    };

  }

  onTabClick() {
  }

  addWidget(type: string, event: any, widgetName: string): void {
    if (this.highlightedWidget?.selector === 'app-section') {
      if (!this.isWidgetType(widgetName)) {
        console.warn(`Unknown widget type: ${widgetName}`);
        return;
      }

      let customW = 24 / this.colWidth;
      const gridStackItemId = this.generateId();
      this.selectedWidget = {
        id: gridStackItemId,
        ...this.WIDGET_CONFIGS[widgetName](gridStackItemId),
        w: customW
      };
      this.highlightedWidget?.subGrid?.addWidget(this.selectedWidget);
    }
    else {
      if (!this.isWidgetType(widgetName)) {
        return;
      }

      const gridStackItemId = this.generateId();
      let customW = this.colSpan === 1 ? 24 : 12;
      this.selectedWidget = {
        id: gridStackItemId,
        ...this.WIDGET_CONFIGS[widgetName](gridStackItemId),
        w: customW
      };
      this.gridComp?.grid?.addWidget(this.selectedWidget);
    }
  }

  // Type guard to check if a string is a valid WidgetType
  private isWidgetType(value: string): value is WidgetType {
    return Object.keys(this.WIDGET_CONFIGS).includes(value);
  }


  clearGrid() {
    if (!this.gridComp) return;
    this.gridComp.grid?.removeAll();
  }

  deleteWidget() {
    if (this.highlightedWidget) {
      const isAppSection = this.highlightedWidget?.grid.parentGridNode?.selector === 'app-section';
      const grid = isAppSection
        ? this.highlightedWidget.grid.parentGridNode.subGrid
        : this.gridComp?.grid;
      grid.removeWidget(this.highlightedWidget?.el);
      this.highlightedWidget = undefined
    }
  }

  saveGrid() {
    this.serializedData =
      (this.gridComp?.grid?.save(false, true) as GridStackOptions) || ''; // no content, full options
    this.codeEditorState = {
      ...this.codeEditorState,
      design_object: this.serializedData
    };
    // if (this.textEl)
    //   this.textEl.nativeElement.value = JSON.stringify(
    //     this.serializedData,
    //     null,
    //     '  '
    //   );
    console.log('Page-designdata: ', this.serializedData);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Template saved locally you can preview it',
      life: 5000,
    });
  }

  private refreshSerializedData(): any {
    this.serializedData =
      (this.gridComp?.grid?.save(false, true) as GridStackOptions) || {};
    return this.serializedData;
  }

  private buildEditorPayload(): any {
    const latestDesign = this.refreshSerializedData();
    const payload: any = {
      ...this.codeEditorState,
      ...(latestDesign ? { design_object: latestDesign } : {})
    };

    // Include dataObject if it exists
    if (this.codeEditorState?.dataObject) {
      payload.dataObject = this.codeEditorState.dataObject;
    }

    // Include data if it exists
    if (this.codeEditorState?.data) {
      payload.data = this.codeEditorState.data;
    }

    // Include displayComponent if it exists
    if (this.codeEditorState?.displayComponent) {
      payload.displayComponent = this.codeEditorState.displayComponent;
    }

    this.codeEditorState = payload;
    return payload;
  }

  private applyDesignObject(fullPayload: any): void {
    // Check if it's a simple format (only displayComponent) or full format (with design_object)
    if (fullPayload?.displayComponent && !fullPayload?.design_object) {
      // Generate design_object from displayComponent mapping
      const generatedDesign = this.generateDesignFromDisplayComponent(fullPayload);
      if (generatedDesign) {
        fullPayload.design_object = generatedDesign.design_object;
        fullPayload.dataObject = generatedDesign.dataObject;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid Format',
          detail: 'Unable to generate design from displayComponent mapping.'
        });
        return;
      }
    }

    const designObject = fullPayload?.design_object;
    if (!designObject) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Design',
        detail: 'Design object is missing in the provided JSON.'
      });
      return;
    }

    const { children = [], ...gridOptions } = designObject;
    this.gridOptionsFull = {
      ...this.gridOptions,
      ...gridOptions
    };

    const loadChildren = () => {
      if (!this.gridComp?.grid) {
        setTimeout(loadChildren, 0);
        return;
      }
      this.clearGrid();
      children.forEach((child: any) => {
        const widget = { ...child };
        // Bind data to widget if linkedField exists
        // Use selected sample data if available, otherwise use original data
        let dataToUse = fullPayload?.data || fullPayload?.dataObject;
        
        if (this.selectedSampleIndex >= 0 && this.sampleDataArray[this.selectedSampleIndex]) {
          const selectedSample = this.sampleDataArray[this.selectedSampleIndex];
          // Exclude metadata when using sample data for rendering
          const { metadata, ...sampleWithoutMetadata } = selectedSample;
          
          // Wrap in root key if original had one
          const originalData = fullPayload?.data || fullPayload?.dataObject;
          const rootKeys = Object.keys(originalData || {});
          const singleRootKey = rootKeys.length === 1 && originalData && typeof originalData[rootKeys[0]] === 'object'
            ? rootKeys[0]
            : null;
          
          if (singleRootKey) {
            dataToUse = { [singleRootKey]: sampleWithoutMetadata };
          } else {
            dataToUse = sampleWithoutMetadata;
          }
        }
        
        if (widget.linkedField && dataToUse) {
          const dataValue = this.getDataValue(dataToUse, widget.linkedField);
          if (dataValue !== undefined && widget.input) {
            // Update the input value based on widget type
            if (widget.selector === 'app-input-text' || widget.selector === 'app-text-area') {
              widget.input.value = dataValue;
              widget.inputOdt = widget.inputOdt || {};
              widget.inputOdt.value = dataValue;
            } else if (widget.selector === 'app-label') {
              widget.input.label = dataValue;
            } else if (widget.selector === 'app-paragraph') {
              widget.input.content = dataValue;
            }
            // Add more widget types as needed
          }
        }
        this.gridComp?.grid?.addWidget(widget);
      });
      this.serializedData = designObject;
      this.codeEditorState = {
        ...this.codeEditorState,
        ...fullPayload,
        design_object: designObject
      };
    };

    loadChildren();
  }

  /**
   * Gets data value from nested data object based on linkedField
   * Supports paths like "employee.name" or direct field names
   */
  private getDataValue(data: any, linkedField: string): any {
    if (!data || !linkedField) return undefined;

    // Try to find the value in nested structure
    // First, try to find a matching key at any level
    const findValue = (obj: any, field: string): any => {
      if (!obj || typeof obj !== 'object') return undefined;

      // Direct match
      if (obj[field] !== undefined) {
        return obj[field];
      }

      // Search in nested objects
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (typeof value === 'object' && value !== null) {
            const nestedValue = findValue(value, field);
            if (nestedValue !== undefined) {
              return nestedValue;
            }
          }
        }
      }

      return undefined;
    };

    return findValue(data, linkedField);
  }

  /**
   * Generates design_object and dataObject from displayComponent mapping
   * @param payload - Payload containing displayComponent and optional data
   * @returns Object containing design_object and dataObject
   */
  private generateDesignFromDisplayComponent(payload: any): { design_object: any, dataObject: any } | null {
    if (!payload?.displayComponent || typeof payload.displayComponent !== 'object') {
      return null;
    }

    const displayComponent = payload.displayComponent;
    const data = payload?.data || {};
    const children: any[] = [];
    const dataObject: any = {};
    let yPosition = 0;

    // Iterate through each field in displayComponent
    Object.keys(displayComponent).forEach((fieldName) => {
      const componentName = displayComponent[fieldName];
      if (!componentName) return;

      // Normalize component name (lowercase, handle variations)
      const normalizedName = componentName.toLowerCase().trim();

      // Map display component to widget type
      const widgetType = this.displayComponentWidgetMap[normalizedName] ||
        (this.isWidgetType(normalizedName) ? normalizedName as WidgetType : null);

      if (!widgetType || !this.WIDGET_CONFIGS[widgetType]) {
        console.warn(`Unknown display component: ${componentName} for field: ${fieldName}`);
        return;
      }

      // Generate widget ID
      const widgetId = this.generateId();

      // Get base widget configuration
      const baseWidget = this.WIDGET_CONFIGS[widgetType](widgetId);

      // Get data value for this field
      const dataValue = this.getDataValue(data, fieldName);

      // Create widget with proper positioning
      const widget: any = {
        id: widgetId,
        type: 'dynamic',
        linkedComponent: componentName,
        linkedField: fieldName,
        w: baseWidget.w || 24,
        x: 0,
        y: yPosition,
        selector: baseWidget.selector,
        input: { ...baseWidget.input },
        inputOdt: { ...baseWidget.inputOdt }
      };

      // Apply data value to widget based on type
      this.applyDataToWidget(widget, dataValue, widgetType);

      // Create dataObject entry (all input properties except style)
      dataObject[fieldName] = this.extractDataObjectFromWidget(widget.input, widgetType);

      children.push(widget);
      yPosition += (baseWidget.h || 1);
    });

    // Build design_object with grid options
    const design_object = {
      column: 24,
      margin: 2,
      float: true,
      minRow: 1,
      subGridDynamic: true,
      subGridOpts: {
        cellHeight: 50,
        column: 24,
        acceptWidgets: true,
        margin: 2,
        subGridDynamic: true,
        float: true
      },
      animate: false,
      cellHeight: 50,
      children: children
    };

    return { design_object, dataObject };
  }

  /**
   * Applies data value to widget input based on widget type
   */
  private applyDataToWidget(widget: any, dataValue: any, widgetType: WidgetType): void {
    if (dataValue === undefined || dataValue === null) return;

    switch (widgetType) {
      case 'input-text':
      case 'text-area':
        widget.input.value = dataValue;
        widget.inputOdt.value = dataValue;
        break;
      case 'label':
        widget.input.label = dataValue;
        widget.inputOdt.label = dataValue;
        break;
      case 'paragraph':
        widget.input.content = dataValue;
        widget.inputOdt.content = dataValue;
        break;
      case 'image':
        widget.input.src = typeof dataValue === 'string' ? dataValue : widget.input.src;
        widget.inputOdt.src = typeof dataValue === 'string' ? dataValue : widget.inputOdt.src;
        break;
      case 'video':
        widget.input.videoSrc = typeof dataValue === 'string' ? dataValue : widget.input.videoSrc;
        widget.inputOdt.videoSrc = typeof dataValue === 'string' ? dataValue : widget.inputOdt.videoSrc;
        break;
      case 'tag':
        widget.input.value = dataValue;
        widget.inputOdt.value = dataValue;
        break;
      case 'date-tag':
        widget.input.date = dataValue;
        widget.inputOdt.date = dataValue;
        break;
      case 'location-tag':
        widget.input.location = dataValue;
        widget.inputOdt.location = dataValue;
        break;
      case 'date-picker':
        widget.input.date = dataValue;
        widget.inputOdt.date = dataValue;
        break;
      case 'checkbox':
        widget.input.checked = Boolean(dataValue);
        widget.inputOdt.checked = Boolean(dataValue);
        break;
      case 'btn':
        widget.input.buttonLabel = dataValue;
        widget.inputOdt.buttonLabel = dataValue;
        break;
      case 'btn-icon':
        widget.input.icon = typeof dataValue === 'string' ? dataValue : widget.input.icon;
        widget.inputOdt.icon = typeof dataValue === 'string' ? dataValue : widget.inputOdt.icon;
        break;
      // Chart widgets - handle structured data
      case 'pie-chart':
      case 'donut-chart':
        if (typeof dataValue === 'object' && dataValue !== null) {
          if (dataValue.labels) widget.input.labels = dataValue.labels;
          if (dataValue.values) widget.input.values = dataValue.values;
          if (dataValue.labels) widget.inputOdt.labels = dataValue.labels;
          if (dataValue.values) widget.inputOdt.values = dataValue.values;
        }
        break;
      case 'polar':
        if (typeof dataValue === 'object' && dataValue !== null) {
          if (dataValue.labels) widget.input.labels = dataValue.labels;
          if (dataValue.values) widget.input.values = dataValue.values;
          if (dataValue.title) widget.input.title = dataValue.title;
          if (dataValue.labels) widget.inputOdt.labels = dataValue.labels;
          if (dataValue.values) widget.inputOdt.values = dataValue.values;
          if (dataValue.title) widget.inputOdt.title = dataValue.title;
        }
        break;
      case 'radar':
        if (typeof dataValue === 'object' && dataValue !== null) {
          if (dataValue.labels) widget.input.labels = dataValue.labels;
          if (dataValue.values) widget.input.values = dataValue.values;
          if (dataValue.title) widget.input.title = dataValue.title;
          if (dataValue.labels) widget.inputOdt.labels = dataValue.labels;
          if (dataValue.values) widget.inputOdt.values = dataValue.values;
          if (dataValue.title) widget.inputOdt.title = dataValue.title;
        }
        break;
      case 'bar-chart':
        if (typeof dataValue === 'object' && dataValue !== null) {
          if (dataValue.labels) widget.input.labels = dataValue.labels;
          if (dataValue.values) widget.input.values = dataValue.values;
          if (dataValue.title) widget.input.title = dataValue.title;
          if (dataValue.labels) widget.inputOdt.labels = dataValue.labels;
          if (dataValue.values) widget.inputOdt.values = dataValue.values;
          if (dataValue.title) widget.inputOdt.title = dataValue.title;
        }
        break;
      case 'line':
        if (typeof dataValue === 'object' && dataValue !== null) {
          if (dataValue.labels) widget.input.labels = dataValue.labels;
          if (dataValue.values) widget.input.values = dataValue.values;
          if (dataValue.title) widget.input.title = dataValue.title;
          if (dataValue.labels) widget.inputOdt.labels = dataValue.labels;
          if (dataValue.values) widget.inputOdt.values = dataValue.values;
          if (dataValue.title) widget.inputOdt.title = dataValue.title;
        }
        break;
      case 'hbar':
        if (typeof dataValue === 'object' && dataValue !== null) {
          if (dataValue.labels) widget.input.labels = dataValue.labels;
          if (dataValue.values) widget.input.values = dataValue.values;
          if (dataValue.title) widget.input.title = dataValue.title;
          if (dataValue.labels) widget.inputOdt.labels = dataValue.labels;
          if (dataValue.values) widget.inputOdt.values = dataValue.values;
          if (dataValue.title) widget.inputOdt.title = dataValue.title;
        }
        break;
      case 'svbar':
      case 'shbar':
        if (typeof dataValue === 'object' && dataValue !== null) {
          if (dataValue.labels) widget.input.labels = dataValue.labels;
          if (dataValue.values1) widget.input.values1 = dataValue.values1;
          if (dataValue.values2) widget.input.values2 = dataValue.values2;
          if (dataValue.title1) widget.input.title1 = dataValue.title1;
          if (dataValue.title2) widget.input.title2 = dataValue.title2;
          if (dataValue.labels) widget.inputOdt.labels = dataValue.labels;
          if (dataValue.values1) widget.inputOdt.values1 = dataValue.values1;
          if (dataValue.values2) widget.inputOdt.values2 = dataValue.values2;
          if (dataValue.title1) widget.inputOdt.title1 = dataValue.title1;
          if (dataValue.title2) widget.inputOdt.title2 = dataValue.title2;
        }
        break;
      case 'primeng-dynamic-table':
        if (typeof dataValue === 'object' && dataValue !== null) {
          if (dataValue.dataSets) widget.input.dataSets = dataValue.dataSets;
          if (dataValue.cols) widget.input.cols = dataValue.cols;
          if (dataValue.rows) widget.input.rows = dataValue.rows;
          if (dataValue.dataSets) widget.inputOdt.dataSets = dataValue.dataSets;
          if (dataValue.cols) widget.inputOdt.cols = dataValue.cols;
          if (dataValue.rows) widget.inputOdt.rows = dataValue.rows;
        }
        break;
      default:
        // For other types, try to set value if it exists
        if (widget.input && 'value' in widget.input) {
          widget.input.value = dataValue;
        }
        if (widget.inputOdt && 'value' in widget.inputOdt) {
          widget.inputOdt.value = dataValue;
        }
        break;
    }
  }

  /**
   * Extracts dataObject from widget input (all properties except style)
   */
  private extractDataObjectFromWidget(input: any, widgetType: WidgetType): any {
    if (!input) return {};

    const dataObject: any = {};

    // Copy all properties except 'style'
    Object.keys(input).forEach((key) => {
      if (key !== 'style') {
        dataObject[key] = input[key];
      }
    });

    return dataObject;
  }


  generateRGBA() {
    const hex = this.colorHex;
    const opacity = this.alphaPercent / 100;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Update the actual CSS property
    this.widgetStyles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    this.onStyleChange();
  }

  /**
   * Opens the image upload dialog and sets the selected image
   * as the background image URL for the current context (canvas or widget).
   */
  openBackgroundImageUpload(): void {
    this.ref = this.dialogService.open(ImageUploadComponent, {
      header: 'Upload Background Image',
      width: '50vw',
      modal: true,
      closable: true,
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        // Assuming dialog returns a URL or path string
        this.widgetStyles.backgroundImageUrl = data;
        this.widgetStyles.backgroundMode = 'image';
        this.onStyleChange();
      }
    });
  }


  /**
   * Handles style changes and updates the widget accordingly.
   * @returns - returns nothing (i.e void)
   */
  onStyleChange(): void {
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

    if (!this.highlightedWidget) {
      const item = this.el.nativeElement.querySelector(`.grid-zone`);
      if (item) {
        this.renderer.setStyle(item, 'background-color', this.widgetStyles.backgroundColor);
        this.renderer.setStyle(item, 'background-image', backgroundImage || 'none');
        this.renderer.setStyle(item, 'background-size', this.widgetStyles.backgroundSize);
        this.renderer.setStyle(item, 'background-position', this.widgetStyles.backgroundPosition);
        this.renderer.setStyle(item, 'background-repeat', this.widgetStyles.backgroundRepeat);
      }
    } else {
      // Create modified widget with essential properties
      this.modifiedWidget = {
        id: this.highlightedWidget.id,
        w: this.highlightedWidget.w,
        h: this.highlightedWidget.h,
        y: this.highlightedWidget.y,
        x: this.highlightedWidget.x,
        selector: this.highlightedWidget.selector,
        input: this.highlightedWidget.input,
        inputOdt: this.highlightedWidget.inputOdt,
        grid: this.highlightedWidget?.grid,
        subGrid: this.highlightedWidget?.subGrid,
        subGridOpts: this.highlightedWidget?.subGridOpts
      };

      console.log(this.widgetStyles);
      // Apply styles
      const inputStyle = this.modifiedWidget.input.style || {};
      this.modifiedWidget.input.style = inputStyle;
      Object.entries(this.widgetStyles).forEach(([key, value]) => {
        inputStyle[key] = value === false ? false : value || inputStyle[key];
      });

      // Remove old widget and add new one
      const isAppSection = this.highlightedWidget?.grid.parentGridNode?.selector === 'app-section';
      const grid = isAppSection
        ? this.highlightedWidget.grid.parentGridNode.subGrid
        : this.gridComp?.grid;

      grid?.removeWidget(this.highlightedWidget.el);
      this.highlightedWidget = undefined;
      const newWidget = grid?.addWidget(this.modifiedWidget);
      if (this.modifiedWidget?.selector === 'app-section') {
        const item = this.el.nativeElement.querySelector(`.grid-stack-item[gs-id="${this.modifiedWidget.id}"].grid-stack-sub-grid`);
        if (item) {
          this.renderer.setStyle(item, 'border-top-style', this.widgetStyles.borderTopStyle);
          this.renderer.setStyle(item, 'border-bottom-style', this.widgetStyles.borderBottomStyle);
          this.renderer.setStyle(item, 'border-right-style', this.widgetStyles.borderRightStyle);
          this.renderer.setStyle(item, 'border-left-style', this.widgetStyles?.borderLeftStyle);
          this.renderer.setStyle(item, 'border-top-color', this.widgetStyles?.borderTopColor);
          this.renderer.setStyle(item, 'border-bottom-color', this.widgetStyles?.borderBottomColor);
          this.renderer.setStyle(item, 'border-right-color', this.widgetStyles?.borderRightColor);
          this.renderer.setStyle(item, 'border-left-color', this.widgetStyles?.borderLeftColor);
          this.renderer.setStyle(item, 'border-top-width', this.widgetStyles?.borderTopWidth + 'px');
          this.renderer.setStyle(item, 'border-bottom-width', this.widgetStyles?.borderBottomWidth + 'px');
          this.renderer.setStyle(item, 'border-right-width', this.widgetStyles?.borderRightWidth + 'px');
          this.renderer.setStyle(item, 'border-left-width', this.widgetStyles?.borderLeftWidth + 'px');
          this.renderer.setStyle(item, 'border-top-left-radius', this.widgetStyles?.borderTopLeftRadius + 'px');
          this.renderer.setStyle(item, 'border-top-right-radius', this.widgetStyles?.borderTopRightRadius + 'px');
          this.renderer.setStyle(item, 'border-bottom-left-radius', this.widgetStyles?.borderBottomLeftRadius + 'px');
          this.renderer.setStyle(item, 'border-bottom-right-radius', this.widgetStyles?.borderBottomRightRadius + 'px');
          this.renderer.setStyle(item, 'background-color', this.widgetStyles.backgroundColor);
          this.renderer.setStyle(item, 'background-image', backgroundImage || 'none');
          this.renderer.setStyle(item, 'background-size', this.widgetStyles.backgroundSize);
          this.renderer.setStyle(item, 'background-position', this.widgetStyles.backgroundPosition);
          this.renderer.setStyle(item, 'background-repeat', this.widgetStyles.backgroundRepeat);
        }
      }

      // Find the widget node
      const widgetId = newWidget?.getAttribute('gs-id');
      this.highlightedWidget = this.gridComp?.grid?.engine.nodes.find(
        node => node.id === widgetId
      ) || newWidget?.gridstackNode;

      // Handle selection toggling
      if (newWidget) {
        if (this.selectedWidget1 === newWidget) {
          newWidget.classList.remove('selected');
          this.selectedWidget1 = null;
          this.highlightedWidget = undefined;
        } else {
          if (this.selectedWidget1) this.selectedWidget1.classList.remove('selected');
          this.selectedWidget1 = newWidget;
          newWidget.classList.add('selected');
        }
      }
    }
  }

  /**
   * Resets the widget styles to default values.
   * @returns - returns nothing (i.e void)
   *
   */
  resetStyles(): void {
    this.widgetStyles = {
      backgroundColor: '',
      backgroundMode: 'color',
      backgroundImageUrl: '',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      gradientType: 'linear',
      gradientAngle: 90,
      gradientStartColor: '#2196F3',
      gradientEndColor: '#4CAF50',
      fontFamily: '',
      fontSize: 14,
      fontWeight: '',
      color: '',
      textAlign: 'Left',
      textDecoration: '',
      raised: false,
      rounded: false,
      buttonBar: false,
      selectionRange: false,
      month: false,
      year: false,
      text: false,
      outlined: false,
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
      paddingLeft: 10,
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
      borderTopWidth: '0',
      borderBottomWidth: '0',
      borderLeftWidth: '0',
      borderRightWidth: '0',
      borderTopColor: 'black',
      borderBottomColor: 'black',
      borderLeftColor: 'black',
      borderRightColor: 'black',
      dividerType: 'solid',
      dividerLayout: 'horizontal'
    };
  }

  /**
  * Checks the widget type belongs to the listed chart types
  * @returns {boolean} - returns True or false based on the widget
  */
  isChartWidget(): boolean {
    const chartTypes = [
      'app-pie-chart',
      'app-donut',
      'app-bar-chart',
      'app-polar-area',
      'app-primeng-hbar',
      'app-line',
      'app-radar',
      'app-sv-bar',
      'app-apex-pie-chart',
      'app-apex-bar-chart',
      // Apex line uses ApexsplineComponent selector
      'app-apexspline',
      'app-apex-area-chart',
      'app-apex-donut-chart',
    ];
    return chartTypes.includes(this.highlightedWidget?.selector);
  }


  /**
   * Checks the widget type belongs to the listed grid chart types
   * @returns {boolean} - returns True or false based on the widget
   */
  isGridChart(): boolean {
    const chartTypes = [
      'app-primeng-bar-chart',
      'app-polar-area',
      'app-horizontal-bar',
      'app-line',
      'app-radar',
      'app-sv-bar',
      'app-apex-bar-chart',
      // Apex line uses ApexsplineComponent selector
      'app-apexspline',
      'app-apex-area-chart',
    ];
    return chartTypes.includes(this.highlightedWidget?.selector);
  }

  /**
   * Generates an unique Id for widget to be added in the grid
   * @returns {string} - returns Unique Id for the widget
   */
  generateId(): string {
    this.counter += 1;
    return `grid-item-${this.counter}`;
  }

  openCodeEditor() {
    const editorPayload = this.buildEditorPayload();
    console.log('Page-designdata: ', editorPayload?.design_object);
    this.codeRef = this.dialogService.open(CodeEditorComponent, {
      width: '70vw',
      height: '50vw',
      data: editorPayload,
      header: 'Code Editor',
      closable: true,
      modal: true
    })
    this.codeRef.onClose.subscribe((config: any) => {
      if (config && config.status === true) {
        try {
          const parsed = JSON.parse(config.code);
          
          // Check if this is widget generation mode (has data/dataObject + displayComponent)
          if (config.shouldGenerateWidgets && config.widgetData) {
            // Store sample data if present
            if (parsed.sampleData && Array.isArray(parsed.sampleData)) {
              this.sampleDataArray = parsed.sampleData;
              this.updateSampleDataOptions();
            }
            
            // Apply the design object
            this.codeEditorState = parsed;
            this.applyDesignObject(parsed);
          } else {
            // Normal mode - just apply the parsed design
            // Also check for sample data in normal mode
            if (parsed.sampleData && Array.isArray(parsed.sampleData)) {
              this.sampleDataArray = parsed.sampleData;
              this.updateSampleDataOptions();
            }
            
            this.codeEditorState = parsed;
            this.applyDesignObject(parsed);
          }
        } catch (error: any) {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid JSON',
            detail: error?.message || 'Unable to parse editor content.'
          });
        }
      }
    });
  }

  openLlmEditor() {
    this.llmRef = this.dialogService.open(LlmChatboxComponent, {
      width: '90vw',
      height: '90vw',
      data: this.serializedData,
      header: 'LLM Chat Box',
      closable: true,
      modal: true,
      maximizable: true
    })
    // this.codeRef.onClose.subscribe((config: any) => {
    //   if (config && config.status === true) {
    //     console.log(JSON.parse(config.code))
    //     this.clearGrid();
    //     this.gridOptionsFull = JSON.parse(config.code)
    //   }
    // });
  }

  saveTemplate() {
    this.openConfirmationDialog('Template');

  }
  save() {
    this.openConfirmationDialog('Draft');
  }

  getTemplates(): any {
    this.spinner.show();
    this.pageAdminService.getIdt(this.payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.templates = [];
        if (Array.isArray(res?.idtList)) {
          for (const item of res.idtList) {
            if (item.saveType === 'Template') {
              this.templates.push(item);
            }
          }
        }
      },
      error: (err) => {
        this.spinner.hide();
      },
    });
  }

  getTemplateBorderColor(template: any): string {
    if (!template?.templateType) {
      return '#e0e0e0'; // Default gray color
    }

    const typeColors: { [key: string]: string } = {
      'Card Design': '#2196F3',      // Blue
      'Report': '#4CAF50',            // Green
      'Dashboard': '#FF9800',         // Orange
      'Form': '#9C27B0',              // Purple
      'Default': '#7eefed'            // Gray
    };

    return typeColors[template.templateType] || typeColors['Default'];
  }

  loadTemplate(templateData: any) {
    this.spinner.show();
    const templateId = templateData.templateId;
    this.pageAdminService.getTemplateByID(templateId).subscribe({
      next: (res: any) => {
        this.clearGrid();
        this.spinner.hide();
        const IDTData = res.template;
        if (IDTData.templateType === 'Card Design') {
          this.canvasWidth = IDTData.templateWidth;
          this.canvasHeight = IDTData.templateHeight;
          this.centerGridZone();
        } else {
          this.gridStyle = {};
        }
        IDTData.children?.forEach((child: any) => {
          this.gridComp?.grid?.addWidget({ ...child });
        });
      },
      error: (err) => {
        this.spinner.hide();
      },
    });
  }


  // Mapping

  onTabChange(event: number) {
    if (event === 2) {
      this.isShowAttr = false;
    } else {
      this.isShowAttr = true;
    }
  }

  onWidgetClick(event: any) {
    const clickedWidget = event.target.closest('.grid-stack-item');
    if (clickedWidget) {
      const widgetId = clickedWidget.getAttribute('gs-id');
      let widget = this.gridComp?.grid?.engine.nodes.find(
        (node: any) => node.id === widgetId
      );
      if (!widget) {
        widget = clickedWidget?.gridstackNode;
      }
      this.highlightedWidget = widget;
      // Hydrate style panel from selected widget's existing style
      if (this.highlightedWidget?.input?.style) {
        this.widgetStyles = {
          ...this.widgetStyles,
          ...this.highlightedWidget.input.style
        };
      }
      const { style1, ...rest1 } = this.highlightedWidget.inputOdt;
      Object.entries(rest1).forEach(([key, value]) => {
        const arrName = key + '-' + this.highlightedWidget.OdtId
        if (!this.droppedItemsByProp[arrName]) {
          this.droppedItemsByProp[arrName] = [];
        }

        const isDuplicate = this.droppedItemsByProp[arrName].some(
          (existingValue) =>
            JSON.stringify(existingValue) === JSON.stringify(value)
        );

        if (
          !isDuplicate &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          this.droppedItemsByProp[arrName].push(value);
        }
      });

      //Emitter Mapping
      // this.emitterListWidgetSpecific = this.emitterList.filter(
      //   (item: any) => item.emitterId !== this.highlightedWidget.OdtId
      // );
      // this.selectedEmitter = this.emitterListWidgetSpecific.find(
      //   (item: any) => item.emitterId === res.emitterId
      // );

      const { style, ...rest } = this.highlightedWidget.input;
      const selector = this.highlightedWidget.selector
      this.inputProps = Object.keys(rest).map((key) => ({
        key: key,
        name: key + '-' + this.highlightedWidget.OdtId,
        type: Array.isArray(rest[key]) ? 'array' : typeof rest[key],
        displayName: this.camelToPascalSpace(key),
        selector: selector
      }));
      this.dropZones = this.inputProps.map(() => []);

      if (clickedWidget) {
        // Toggle selection: if it's already selected, deselect it, else select it
        if (this.selectedWidget1 === clickedWidget) {
          this.selectedWidget1.classList.remove('selected');
          this.selectedWidget1 = null;
          this.highlightedWidget = undefined;
        } else {
          // Deselect the previous widget
          if (this.selectedWidget1) {
            this.selectedWidget1.classList.remove('selected');
          }
          // Select the new widget
          this.selectedWidget1 = clickedWidget;
          this.selectedWidget1.classList.add('selected');
        }
      }

    }
  }

  dragStart(attribute: any) {
    this.draggedAttribute = attribute;
  }

  drop(prop: any, event: any) {
    if (this.draggedAttribute) {
      const draggedItem = this.draggedAttribute;

      if (draggedItem.type === 'Static') {
        if (prop.selector === 'app-primeng-dropdown' && prop.key === 'data') {
          this.showText(draggedItem, 'create', prop);
        }
        if (prop.type !== 'array') {
          if (draggedItem.name === 'Text') {
            this.showText(draggedItem, 'create', prop);
          } else if (draggedItem.name === 'Image') {
            this.showImage(draggedItem, 'create', prop);
          }
        }
      }
      else if (draggedItem.type === 'Attribute') {
        if (draggedItem.timeSeries) {
          this.showFrequency(draggedItem, 'create', prop);
        }
        else {
          if ((prop.type === 'string' && this.droppedItemsByProp[prop.name].length === 0 && draggedItem?.dataType != 'Array') || (prop.type === 'array' && draggedItem?.dataType === 'Array')) {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.type === 'boolean' && this.droppedItemsByProp[prop.name].length === 0 && draggedItem?.dataType != 'boolean') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.selector === 'app-primeng-dropdown') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.selector === 'app-primeng-sbar') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `You can't map an more than one attribute directly to input type ${prop.type}`,
            });
          }
        }

      }
      else if (draggedItem.type === 'Entity' || draggedItem.type === 'List') {
        if (prop.type === 'array') {
          this.droppedItemsByProp[prop.name].push(draggedItem);
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            this.draggedAttribute
          );
        }
        else if (prop.selector === 'app-primeng-dynamic-table') {
          this.droppedItemsByProp[prop.name].push(draggedItem);
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            this.draggedAttribute
          );
        }
        else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `You can't map an entity directly to input type ${prop.type}`,
          });
        }
      }
      else if (draggedItem.type === 'Event') {
        if (prop.type === 'string') {
          this.droppedItemsByProp[prop.name].push(draggedItem);
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            this.draggedAttribute
          );
        }
        else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `You can't map an event info directly to input type ${prop.type}`,
          });
        }
      }
    }
  }

  dragEnd() {
    this.draggedAttribute = null;
  }

  findIndex(product: any) {
    let index = -1;
    for (let i = 0; i < (this.entityDetails as any[]).length; i++) {
      if (
        product.attributeId === (this.entityDetails as any[])[i].attributeId
      ) {
        index = i;
        break;
      }
    }
    return index;
  }

  getEntityData() {
    this.pageAdminService.getEntityList(this.payload).subscribe({
      next: (res: any) => {
        const entityAttributes = res?.Entity_Attributes || [];
        this.rawEntityData = entityAttributes;
        this.entityList = entityAttributes.map((item: any) => ({
          id: item.entityId,
          name: item.entityName,
          type: 'Entity',
        }));
        this.rebuildEntityInstanceTree();
      },
      error: (err) => { },
    });
  }

  getInstanceData() {
    this.pageAdminService.getInstanceList(this.payload).subscribe({
      next: (res: any) => {
        this.rawInstanceData = res?.Instances || [];
        this.rebuildEntityInstanceTree();
      },
      error: (err) => { },
    });
  }

  onTreeNodeSelect(event: any): void {
    if (!event?.node) {
      return;
    }
    this.loadNodeAttributes(event.node);
    if (event.node.type === 'attribute') {
      this.handleAttributeSelection(event.node);
    } else {
      this.resetAttributeSelection();
    }
  }

  onTreeNodeExpand(event: any): void {
    if (!event?.node) {
      return;
    }
    this.loadNodeAttributes(event.node);
  }

  private rebuildEntityInstanceTree(): void {
    if (!this.rawEntityData?.length && !this.rawInstanceData?.length) {
      this.entityInstanceTree = [];
      return;
    }

    const groupedInstances = this.groupInstancesByEntity(this.rawInstanceData);
    const nodes: TreeNode[] = [];

    if (this.rawEntityData?.length) {
      this.rawEntityData.forEach((entity: any) =>
        nodes.push(this.createEntityNode(entity, groupedInstances))
      );
    }

    Object.keys(groupedInstances).forEach((key) => {
      const instances = groupedInstances[key];
      if (!instances || !instances.length) {
        return;
      }
      const label =
        instances[0]?.entityName ||
        instances[0]?.entityLookupName ||
        'Unassigned Entity';
      nodes.push({
        key: this.generateTreeNodeKey('entity', key),
        label,
        data: { type: 'entity', entity: null },
        type: 'entity',
        children: instances.map((instance: any) =>
          this.createInstanceNode(instance, key)
        ),
      });
    });

    this.entityInstanceTree = nodes;
  }

  private loadNodeAttributes(node: TreeNode): void {
    if (!node || node.data?.loading || node.data?.attributesLoaded) {
      return;
    }
    if (node.type === 'entity') {
      this.spinner.show();
      const entityId = this.getEntityKey(node.data?.entity);
      if (!entityId) {
        return;
      }
      this.setNodeLoadingState(node, true);
      // this.pageAdminService.getEntityDetailsById(entityId).subscribe({
      //   next: (res: any) => {
      //     this.spinner.hide();
      //     const attributes = res?.attributes || [];
      //     node.children = this.createAttributeNodes(attributes, node.key || '');
      //     node.leaf = !node.children.length;
      //     this.setNodeAttributesLoaded(node);
      //     this.refreshTree();
      //   },
      //   error: () => {
      //     this.spinner.hide();
      //     this.setNodeLoadingState(node, false);
      //   },
      // });
    } else if (node.type === 'instance') {
      this.spinner.show();
      const instanceId = this.getInstanceId(node.data?.instance);
      if (!instanceId) {
        return;
      }
      this.setNodeLoadingState(node, true);
      this.pageAdminService.getInstanceDetailsById(instanceId).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          const attributes = res?.attributes || [];
          node.children = this.createAttributeNodes(attributes, node.key || '');
          node.leaf = !node.children.length;
          this.setNodeAttributesLoaded(node);
          this.refreshTree();
        },
        error: () => {
          this.spinner.hide();
          this.setNodeLoadingState(node, false);
        },
      });
    }
    this.spinner.hide();
  }

  private createEntityNode(entity: any, groupedInstances: Record<string, any[]>): TreeNode {
    const entityKey = this.getEntityKey(entity);
    const entityNameKey = this.getEntityNameKey(entity);
    const nodeKey = this.generateTreeNodeKey('entity', entityKey || entityNameKey || entity?.entityName);
    const matchedInstances = this.resolveInstancesForEntity(groupedInstances, entityKey, entityNameKey);
    const attributeNodes = matchedInstances.length
      ? []
      : this.createAttributeNodes(this.extractAttributes(entity), nodeKey);

    const children = matchedInstances.length
      ? matchedInstances.map((instance: any) => this.createInstanceNode(instance, nodeKey))
      : attributeNodes;
    const hasAttributes = attributeNodes.length > 0;

    return {
      key: nodeKey,
      label: entity?.entityName || entity?.name || 'Entity',
      data: { type: 'entity', entity, attributesLoaded: hasAttributes },
      type: 'entity',
      children,
      leaf: false
    };
  }

  private createInstanceNode(instance: any, parentKey: string): TreeNode {
    const instanceKey = this.generateTreeNodeKey('instance', instance?.instanceId || instance?.id);
    const attributeNodes = this.createAttributeNodes(this.extractAttributes(instance), instanceKey);
    const hasAttributes = attributeNodes.length > 0;
    return {
      key: instanceKey,
      label: instance?.instanceName || instance?.name || 'Instance',
      data: { type: 'instance', instance, attributesLoaded: hasAttributes },
      type: 'instance',
      children: attributeNodes,
      leaf: false
    };
  }

  private createAttributeNode(attribute: any, parentKey: string): TreeNode {
    const attributeKey = this.generateTreeNodeKey(
      'attribute',
      attribute?.attributeId || attribute?.id || attribute?.attributeName || attribute?.name
    );
    return {
      key: attributeKey,
      label: attribute?.attributeName || attribute?.name || 'Attribute',
      data: { type: 'attribute', attribute },
      type: 'attribute',
      leaf: true
    };
  }

  private createAttributeNodes(attributes: any[], parentKey: string): TreeNode[] {
    if (!Array.isArray(attributes) || !attributes.length) {
      return [];
    }
    return attributes.map((attr: any) => this.createAttributeNode(attr, parentKey));
  }

  onAttributeComponentChange(component: any): void {
    if (!this.selectedAttributeNode?.data?.attribute) {
      return;
    }
    this.selectedAttributeComponent = component;
    this.renderAttributeComponent(this.selectedAttributeNode.data.attribute, component);
  }

  onAttributeDropdownChange(event: any): void {
    const component = event?.value;
    this.onAttributeComponentChange(component);
  }

  private renderAttributeComponent(attribute: any, component: any): void {
    if (!component) {
      return;
    }
    const widgetKey = this.resolveWidgetKey(component);
    if (!widgetKey || !this.isWidgetType(widgetKey)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Unsupported Component',
        detail: `No widget mapping found for ${component?.name || 'component'}.`
      });
      return;
    }
    const widget = this.buildWidgetFromDisplayComponent(widgetKey, attribute);
    if (widget) {
      const element = this.gridComp?.grid?.addWidget(widget);
      if (element?.gridstackNode) {
        this.highlightedWidget = element.gridstackNode;
      }
    }
  }

  private buildWidgetFromDisplayComponent(widgetType: WidgetType, attribute: any): any {
    const widgetId = this.generateId();
    const widgetConfig = {
      id: widgetId,
      ...this.WIDGET_CONFIGS[widgetType](widgetId),
      w: this.colSpan === 1 ? 24 : 12
    };
    this.applyAttributeValueToWidget(widgetConfig, attribute);
    return widgetConfig;
  }

  private applyAttributeValueToWidget(widgetConfig: any, attribute: any): void {
    const value = this.extractAttributeValue(attribute);
    if (!value) {
      return;
    }
    switch (widgetConfig.selector) {
      case 'app-image':
        widgetConfig.input = { ...(widgetConfig.input || {}), src: value };
        widgetConfig.inputOdt = { ...(widgetConfig.inputOdt || {}), src: value };
        break;
      case 'app-input-text':
      case 'app-text-area':
        widgetConfig.input = { ...(widgetConfig.input || {}), value };
        widgetConfig.inputOdt = { ...(widgetConfig.inputOdt || {}), value };
        break;
      case 'app-label':
        widgetConfig.input = { ...(widgetConfig.input || {}), label: value };
        break;
      case 'app-paragraph':
        widgetConfig.input = { ...(widgetConfig.input || {}), content: value };
        break;
      case 'app-video':
        widgetConfig.input = { ...(widgetConfig.input || {}), videoSrc: value };
        widgetConfig.inputOdt = { ...(widgetConfig.inputOdt || {}), videoSrc: value };
        break;
      default:
        if (widgetConfig.input) {
          widgetConfig.input.value = value;
        }
        break;
    }
    widgetConfig.attributeMeta = {
      ...(widgetConfig.attributeMeta || {}),
      attributeId: attribute?.attributeId,
      attributeName: attribute?.attributeName
    };
  }

  private resolveWidgetKey(component: any): WidgetType | null {
    if (!component) {
      return null;
    }
    const normalizedName = (component.name || '').trim().toLowerCase();
    const mapped = this.displayComponentWidgetMap[normalizedName];
    return mapped || (this.isWidgetType(normalizedName) ? (normalizedName as WidgetType) : null);
  }

  private normalizeDisplayComponents(components: any): any[] {
    if (!components) {
      return [];
    }
    if (Array.isArray(components)) {
      return components;
    }
    return [components];
  }

  private extractAttributeValue(attribute: any): string {
    if (!attribute) {
      return '';
    }
    return attribute?.value ?? attribute?.content ?? attribute?.defaultValue ?? attribute?.sampleValue ?? '';
  }

  private extractAttributes(source: any): any[] {
    if (!source) {
      return [];
    }
    if (Array.isArray(source)) {
      return source;
    }
    const candidates = [source.attributes, source.attributeList, source.attrList, source.attrs];
    for (const candidate of candidates) {
      if (Array.isArray(candidate) && candidate.length) {
        return candidate;
      }
    }
    return [];
  }

  private groupInstancesByEntity(instances: any[] = []): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    instances?.forEach((instance: any) => {
      const key = this.getInstanceEntityKey(instance) || '__unassigned__';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(instance);
    });
    return grouped;
  }

  private getEntityKey(entity: any): string {
    return entity?.entityId || entity?.id || entity?.entityLookupId || '';
  }

  private getEntityNameKey(entity: any): string {
    return entity?.entityName ? entity.entityName.toLowerCase() : '';
  }

  private getInstanceEntityKey(instance: any): string {
    if (!instance) {
      return '';
    }
    return (
      instance?.entityLookupId ||
      instance?.entityId ||
      instance?.entity?.entityId ||
      (instance?.entityName ? instance.entityName.toLowerCase() : '')
    );
  }

  private resolveInstancesForEntity(grouped: Record<string, any[]>, ...keys: (string | undefined)[]): any[] {
    for (const key of keys) {
      if (key && grouped[key]?.length) {
        const data = grouped[key];
        delete grouped[key];
        return data;
      }
    }
    return [];
  }

  private generateTreeNodeKey(prefix: string, candidate?: string): string {
    if (candidate) {
      return `${prefix}-${candidate}`;
    }
    this.treeNodeUid += 1;
    return `${prefix}-${this.treeNodeUid}`;
  }

  private getInstanceId(instance: any): string {
    return instance?.instanceId || instance?.id || instance?.entityOrInstanceId || '';
  }

  private setNodeLoadingState(node: TreeNode, isLoading: boolean): void {
    node.loading = isLoading;
    node.data = { ...(node.data || {}), loading: isLoading };
  }

  private setNodeAttributesLoaded(node: TreeNode): void {
    node.data = { ...(node.data || {}), attributesLoaded: true, loading: false };
    node.loading = false;
  }

  private refreshTree(): void {
    this.entityInstanceTree = [...this.entityInstanceTree];
  }

  /**
   * Handles the change event for the dropdown and fetches entity details by ID.
   * Sets the `isShowAttribute` flag to true and assigns the attributes of the fetched entity to `entityDetails`.
   * Logs the response or error using the logger service.
   *
   * @param {DropdownChangeEvent} event - The dropdown change event containing the selected entity's details.
   * @returns {void}
   */
  getAttributes(entityId: any): void {
    if (entityId) {
      this.pageAdminService.getEntityDetailsById(entityId).subscribe({
        next: (res: any) => {
          this.entityDetails = res.attributes.map((item: any) => ({
            id: item.attributeId,
            name: item.attributeName,
            type: 'Attribute',
            dataType: item?.dataPointID?.dataType,
            timeSeries: item?.timeSeries
          }));
        },
        error: (err) => {

        },
      });
    }
  }

  private handleAttributeSelection(node: TreeNode): void {
    this.selectedAttributeNode = node;
    const attribute = node.data?.attribute;
    const components = this.normalizeDisplayComponents(attribute?.displayComponent);
    this.attributeComponentOptions = components;
    this.attributeValuePreview = this.extractAttributeValue(attribute) || '';
    if (components.length > 0) {
      this.selectedAttributeComponent = components[0];
      this.renderAttributeComponent(attribute, this.selectedAttributeComponent);
    } else {
      this.selectedAttributeComponent = null;
    }
  }

  private resetAttributeSelection(): void {
    this.selectedAttributeNode = null;
    this.attributeComponentOptions = [];
    this.selectedAttributeComponent = null;
    this.attributeValuePreview = '';
  }
  getAttrList() {
    this.pageAdminService.getAttrList(this.payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        console.log(res);
        this.attributes = res[0].attributes
      },
      error: (err) => {
        this.spinner.hide();
      },
    });
  }


  updateODTMapping(odtId: string, inputObjType: string, attributeId: any) {

    this.modifiedWidget = {
      id: this.highlightedWidget.id,
      w: this.highlightedWidget.w,
      h: this.highlightedWidget.h,
      y: this.highlightedWidget.y,
      x: this.highlightedWidget.x,
      selector: this.highlightedWidget.selector,
      input: this.highlightedWidget.input,
      inputOdt: this.highlightedWidget.inputOdt,
    };

    if (this.modifiedWidget.input.hasOwnProperty(inputObjType)) {
      this.modifiedWidget.input[inputObjType] = attributeId?.content;
    }

    const isAppSection = this.highlightedWidget?.grid.parentGridNode?.selector === 'app-section';
    const grid = isAppSection
      ? this.highlightedWidget.grid.parentGridNode.subGrid
      : this.gridComp?.grid;


    grid?.removeWidget(this.highlightedWidget.el);
    this.highlightedWidget = undefined;
    grid?.addWidget(this.modifiedWidget);


    console.log(this.modifiedWidget, attributeId);
    const payload = {
      odtId: odtId,
      inputObjType: inputObjType,
      value: attributeId,
    };
    this.spinner.show();
    this.spinner.hide();
    // this.pageAdminService.postWidgetMapping(payload).subscribe({
    //   next: (res: any) => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Success',
    //       detail: `Mapped Successfully`,
    //     });
    //     this.spinner.hide();
    //   },
    //   error: (err) => {
    //     this.spinner.hide();
    //   },
    // });
  }

  selectEntity: any;
  removeItem(propName: string, itemToRemove: any) {
    this.droppedItemsByProp[propName] = this.droppedItemsByProp[
      propName
    ].filter((item) => item.entityName !== itemToRemove.entityName);
  }

  camelToPascalSpace(input: string): string {
    if (!/[A-Z]/.test(input.slice(1))) {
      return input.charAt(0).toUpperCase() + input.slice(1);
    }
    return input
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }


  // Handle widget selection
  onEmitterValueChange(event: any) {
    const selectedWidget = event.value;
    console.log(selectedWidget);
    if (this.highlightedWidget) {
      // API call to create a new instance of the selected widget
      this.createWidgetInstance(
        this.highlightedWidget.OdtId,
        selectedWidget.emitterId
      );
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Please select a widget to map the emitter`,
      });
    }
  }

  // Create a new instance of the selected widget
  createWidgetInstance(widgetId: string, emitterId: string) {
    const payload = {
      odtId: widgetId,
      emitterId: emitterId, // Assuming the templateId is relevant for the new widget
      // Include other necessary data for widget creation
    };

    this.spinner.show();
    this.pageAdminService.updateEmitterMapping(payload).subscribe({
      next: (res: any) => {
        // Handle success: Log or show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Widget emitter created successfully!`,
        });
        this.spinner.hide();
      },
      error: (err) => {
        // Handle error: Show error message
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to map widget emitter`,
        });
        this.spinner.hide();
      },
    });
  }
  deleteWidgetInstance() {
    const payload = {
      odtId: this.highlightedWidget.OdtId,
      emitterId: '', // Assum  ing the templateId is relevant for the new widget
      // Include other necessary data for widget creation
    };

    this.spinner.show();
    this.pageAdminService.updateEmitterMapping(payload).subscribe({
      next: (res: any) => {
        // Handle success: Log or show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Widget emitter created successfully!`,
        });
        this.spinner.hide();
      },
      error: (err) => {
        // Handle error: Show error message
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to map widget emitter`,
        });
        this.spinner.hide();
      },
    });
  }


  showText(draggedItem: any, type: any, prop?: any,) {
    if (type === 'create') {
      this.ref = this.dialogService.open(TextInputComponent, {
        header: 'Provide an Input',
        width: '25rem',
        modal: true,
        closable: true,
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      });

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          if (prop.selector === 'app-primeng-dropdown' && prop.key === 'data') {
            const res = this.validateInput(data);
            if (res) {
              draggedItem.content = res;
              this.droppedItemsByProp[prop.name].push(draggedItem);
              this.updateODTMapping(
                this.highlightedWidget.OdtId,
                prop.key,
                draggedItem
              );
            }
          }
          else {
            draggedItem.content = data;
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
        }
      });
    }
    else {
      this.ref = this.dialogService.open(TextInputComponent, {
        data: draggedItem.content,
        header: 'Provide an Input',
        width: '25rem',
        modal: true,
        closable: true,
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      });

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          draggedItem.content = data;
          const index = this.droppedItemsByProp[prop.name].findIndex(item => item.name === draggedItem.name);

          if (index !== -1) {
            this.droppedItemsByProp[prop.name][index] = draggedItem;
          } else {
            this.droppedItemsByProp[prop.name].push(draggedItem);
          }
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            draggedItem
          );
        }
      });
    }

  }

  showImage(draggedItem: any, type: any, prop: any) {
    if (type === 'create') {
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
        if (data) {
          draggedItem.content = data;
          this.droppedItemsByProp[prop.name].push(draggedItem);
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            draggedItem
          );
        }
      });
    } else {
      this.ref = this.dialogService.open(ImageUploadComponent, {
        data: draggedItem.content,
        header: 'Upload Image',
        width: '25rem',
        modal: true,
        closable: true,
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      });

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          draggedItem.content = data;
          const index = this.droppedItemsByProp[prop.name].findIndex(item => item.name === draggedItem.name);

          if (index !== -1) {
            // Replace the existing object
            this.droppedItemsByProp[prop.name][index] = draggedItem;
          } else {
            // Add it if it doesn't exist
            this.droppedItemsByProp[prop.name].push(draggedItem);
          }
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            draggedItem
          );
        }
      });
    }
  }


  showFrequency(draggedItem: any, type: any, prop: any) {
    if (type === 'create') {
      this.ref = this.dialogService.open(FrequencyConfigComponent, {
        header: 'Choose Frequency',
        width: '25rem',
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      });
      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          draggedItem.frequency = data;
          console.log(draggedItem);
          if ((prop.type === 'string' && this.droppedItemsByProp[prop.name].length === 0 && draggedItem?.dataType != 'Array') || (prop.type === 'array' && draggedItem?.dataType === 'Array')) {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.type === 'boolean' && this.droppedItemsByProp[prop.name].length === 0 && draggedItem?.dataType != 'boolean') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.selector === 'app-primeng-dropdown') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else if (prop.selector === 'app-primeng-sbar') {
            this.droppedItemsByProp[prop.name].push(draggedItem);
            this.updateODTMapping(
              this.highlightedWidget.OdtId,
              prop.key,
              draggedItem
            );
          }
          else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `You can't map an more than one attribute directly to input type ${prop.type}`,
            });
          }
        }
      });
    } else {
      this.ref = this.dialogService.open(FrequencyConfigComponent, {
        data: draggedItem.content,
        header: 'Upload Image',
        width: '25rem',
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
        },
      });

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          draggedItem.content = data;
          const index = this.droppedItemsByProp[prop.name].findIndex(item => item.name === draggedItem.name);
          if (index !== -1) {
            // Replace the existing object
            this.droppedItemsByProp[prop.name][index] = draggedItem;
          } else {
            // Add it if it doesn't exist
            this.droppedItemsByProp[prop.name].push(draggedItem);
          }
          this.updateODTMapping(
            this.highlightedWidget.OdtId,
            prop.key,
            draggedItem
          );
        }
      });
    }
  }


  onStaticClick(dropedItem: any, prop: any) {
    if (dropedItem.type === 'Static') {
      if (dropedItem.name === 'Text') {
        this.showText(dropedItem, 'update', prop)
      }
      else if (dropedItem.name === 'Custom Array') {
        dropedItem.content = JSON.stringify(dropedItem?.content, null, 2);
        this.showText(dropedItem, 'update', prop)
      }
      else if (dropedItem.name === 'Image') {
        this.showImage(dropedItem, 'update', prop);
      }
    }
  }

  validateInput(userInput: any) {
    try {
      const parsedData = JSON.parse(userInput);
      if (!Array.isArray(parsedData)) {
        throw new Error('Input is not an array!');
      }
      if (parsedData.every(item => typeof item === 'string')) {
      } else if (parsedData.every(item => typeof item === 'number')) {
      } else if (parsedData.every(item => typeof item === 'object' && item.name && item.Value)) {
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Misformatted Array`,
        });
      }
      console.log('Valid Data:', parsedData);
      return parsedData
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Json Syntax Error',
        detail: `${error}`,
      });
      return null;
    }
  }

  openConfirmationDialog(saveType: string) {
    this.ref = this.dialogService.open(TemplateConfirmationComponent, {
      data: saveType,
      modal: true,
      header: 'Save Page',
      closable: true
    })
    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.spinner.show();
        // this.serializedData =
        //   (this.gridComp?.grid?.save(false, true) as GridStackOptions) || '';
        // console.log(this.serializedData);
        // const payload = {
        //   templateName: data.pageName,
        //   templateDescription: data.pageDescription,
        //   templateWidth: this.canvasWidth,
        //   templateHeight: this.canvasHeight,
        //   saveType: data.saveType,
        //   templateType: this.formConfig?.reportType,
        //   appId: this.formConfig?.appId,
        //   orgId: this.formConfig?.orgId,
        //   templateObj: this.serializedData,
        //   "activeIdtVersion": "Parent",
        //   "activeOdtVersion": "Parent",
        //   "visble": false,
        //   "sharable": false,
        //   "confidentialType": false,
        //   "allowCopyContent": false,
        //   "allowEditContent": false,
        //   "isActive": false,
        // }
        const editorPayload = this.buildEditorPayload();
        
        // Include sample data with metadata if available
        const payloadWithSampleData = {
          ...editorPayload,
          ...(this.sampleDataArray.length > 0 && { sampleData: this.sampleDataArray })
        };
        
        const payload = {
          pageData: payloadWithSampleData,
          templateName: data.pageName,
          templateDescription: data.pageDescription,
          templateWidth: this.canvasWidth,
          templateHeight: this.canvasHeight,
          saveType: data.saveType,
          templateType: this.formConfig?.reportType,
          appId: this.formConfig?.appId,
          orgId: this.formConfig?.orgId,
        };

        this.pageAdminService.savePage(payload).subscribe({
          next: (res: any) => {
            this.spinner.hide();
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Page Saved Successfully' })
          },
          error: (err) => {
            this.spinner.hide();
          }
        })
      }
    })
  }

  preview() {
    this.router.navigate(['/globalRenderer/preview'], { state: { pageData: this.serializedData } });
  }

  /**
   * Opens dialog to add new sample data with metadata
   */
  openSampleDataEditor(): void {
    // Create template based on existing data or first sample
    let templateData: any = {};
    
    if (this.sampleDataArray.length > 0) {
      // Use first sample as template (exclude metadata)
      const firstSample = this.sampleDataArray[0];
      const { metadata: _, ...sampleWithoutMetadata } = firstSample;
      templateData = { ...sampleWithoutMetadata };
    } else if (this.codeEditorState?.dataObject || this.codeEditorState?.data) {
      // Use original dataObject structure as template
      const originalData = this.codeEditorState?.dataObject || this.codeEditorState?.data;
      const rootKeys = Object.keys(originalData || {});
      if (rootKeys.length === 1 && typeof originalData[rootKeys[0]] === 'object') {
        templateData = { ...originalData[rootKeys[0]] };
      } else {
        templateData = { ...originalData };
      }
    }

    // First open code editor to enter sample data
    const codeEditorRef = this.dialogService.open(CodeEditorComponent, {
      width: '70vw',
      height: '60vh',
      data: templateData, // Just pass the template data, no flag needed
      header: 'Add New Sample Data',
      closable: true,
      modal: true
    });

    codeEditorRef.onClose.subscribe((result: any) => {
      // Only process if result exists and has status true with code
      if (!result) {
        return; // User cancelled or closed without saving
      }

      if (!result.status || result.status !== true) {
        return;
      }

      if (!result.code || !result.code.trim()) {
        return;
      }

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

        // IMPORTANT: Always open metadata dialog after code editor saves
        // This ensures name and description are captured
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
          this.updateSampleDataOptions();

          // Update codeEditorState to persist the new sample
          if (this.codeEditorState) {
            this.codeEditorState.sampleData = [...this.sampleDataArray];
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'New sample data added successfully',
            life: 3000
          });
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
    });
  }

  /**
   * Updates sample data dropdown options
   */
  private updateSampleDataOptions(): void {
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
  }

  /**
   * Handles sample data selection change
   */
  onSampleDataChange(): void {
    // This will be implemented when rendering with sample data is needed
    // For now, just store the selection
  }
}
