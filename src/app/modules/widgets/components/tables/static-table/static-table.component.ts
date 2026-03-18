import { Component, Input } from '@angular/core';
import { BaseWidget, NgCompInputs } from 'gridstack/dist/angular';
import { WidgetService } from '../../../widget.service';

@Component({
  selector: 'app-static-table',
  standalone: false,
  templateUrl: './static-table.component.html',
  styleUrl: './static-table.component.css'
})
export class StaticTableComponent extends BaseWidget {


  @Input() dataSets: any;
  @Input() style: any;
  @Input() emitterId: any;
  @Input() id: any;

  public override serialize(): NgCompInputs | undefined {
    return this.dataSets || this.style
      ? { dataSets: this.dataSets, style: this.style }
      : undefined;
  }

  constructor(private commonService: WidgetService) {
    super();
  }

  attributes = [
    { attributeName: 'Column1' },
    { attributeName: 'Column2' },
    { attributeName: 'Column3' },
    { attributeName: 'Column4' },
    { attributeName: 'Column5' },
  ];

  products = [
    { 'Column1': 'Column1', Column2: 'Column2', Column3: 'Column3', Column4: 'Column4', Column5: 'Column5' },
    { 'Column1': 'Column1', Column2: 'Column2', Column3: 'Column3', Column4: 'Column4', Column5: 'Column5' },
  ];

  customers: any[] = [];
  representatives: any[] = [];
  statuses: any[] = [];
  loading: boolean = true;
  selectedCustomers!: any[];
  activityValues: number[] = [0, 100];
  value: any;

  // ngOnInit() {
  //   console.log(this.dataSets.attributes);
  //   console.log(this.dataSets.products);
  //   this.dataSets.attributes.sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);;
  //   this.commonService.getSubject(this.emitterId).subscribe((value) => {
  //     if (value) {
  //       this.fetchDataBasedOnDropdown(value);
  //     }
  //   });
  // }
  fetchDataBasedOnDropdown(value: any) {
    const payload = { entityOrInstanceId: value.id, type: 'Table' };
    this.commonService.getData(payload).subscribe({
      next: (res: any) => {
        this.dataSets = res.dataSets
      },
      error: (err: any) => { },
    });
  }

  /**
   * Evaluates conditional styles for a cell based on its value
   * @param column - The column definition (attribute) that may contain cellConditionalStyles
   * @param cellValue - The actual value in the cell
   * @returns Object with CSS styles to apply (includes border by default)
   */
  getCellStyle(column: any, cellValue: any): any {
    const baseStyle: any = {
      border: '1px solid rgb(182,207,230)'
    };

    // If column doesn't have conditional styles, return base style
    if (!column?.cellConditionalStyles || !Array.isArray(column.cellConditionalStyles)) {
      return baseStyle;
    }

    // Evaluate each condition in order (first match wins)
    for (const styleRule of column.cellConditionalStyles) {
      if (this.evaluateCondition(styleRule.condition, cellValue)) {
        // Merge conditional styles with base style
        const conditionalStyle = this.convertToCssStyle(styleRule.style);
        return { ...baseStyle, ...conditionalStyle };
      }
    }

    // No condition matched, return base style
    return baseStyle;
  }

  /**
   * Evaluates a condition against a cell value
   * @param condition - The condition object with operator and value
   * @param cellValue - The cell value to check
   * @returns true if condition matches, false otherwise
   */
  private evaluateCondition(condition: any, cellValue: any): boolean {
    if (!condition || !condition.operator) {
      return false;
    }

    const operator = condition.operator;
    const compareValue = condition.value;

    // Convert cell value to appropriate type for comparison
    const cellVal = this.convertValue(cellValue);
    const compareVal = this.convertValue(compareValue);

    switch (operator) {
      case '>':
        return cellVal > compareVal;
      case '<':
        return cellVal < compareVal;
      case '>=':
        return cellVal >= compareVal;
      case '<=':
        return cellVal <= compareVal;
      case '==':
      case '===':
        return cellVal === compareVal;
      case '!=':
      case '!==':
        return cellVal !== compareVal;
      case 'contains':
        // For string/array contains
        if (typeof cellVal === 'string' && typeof compareVal === 'string') {
          return cellVal.toLowerCase().includes(compareVal.toLowerCase());
        }
        if (Array.isArray(cellVal)) {
          return cellVal.includes(compareVal);
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Converts a value to number if possible, otherwise returns as-is
   */
  private convertValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }
    // Try to convert to number if it's a numeric string
    if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
      return Number(value);
    }
    return value;
  }

  /**
   * Converts a style object from camelCase to CSS kebab-case format
   * Example: { backgroundColor: 'red', fontWeight: 'bold' } 
   *          => { 'background-color': 'red', 'font-weight': 'bold' }
   */
  private convertToCssStyle(styleObj: any): any {
    if (!styleObj || typeof styleObj !== 'object') {
      return {};
    }

    const cssStyle: any = {};
    for (const [key, value] of Object.entries(styleObj)) {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssStyle[cssKey] = value;
    }

    return cssStyle;
  }


  ngOnInit() {
    this.customers = [{
      id: 1000,
      name: 'James Butt',
      country: {
        name: 'Algeria',
        code: 'dz'
      },
      company: 'Benton, John B Jr',
      date: '2015-09-13',
      status: 'unqualified',
      verified: true,
      activity: 17,
      representative: {
        name: 'Ioni Bowcher',
        image: 'ionibowcher.png'
      },
      balance: 70663
    },];

    this.representatives = [
      { name: 'Amy Elsner', image: 'amyelsner.png' },
      { name: 'Anna Fali', image: 'annafali.png' },
      { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
      { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
      { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
      { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
      { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
      { name: 'Onyama Limba', image: 'onyamalimba.png' },
      { name: 'Stephen Shaw', image: 'stephenshaw.png' },
      { name: 'Xuxue Feng', image: 'xuxuefeng.png' }
    ];

    this.statuses = [
      { label: 'Unqualified', value: 'unqualified' },
      { label: 'Qualified', value: 'qualified' },
      { label: 'New', value: 'new' },
      { label: 'Negotiation', value: 'negotiation' },
      { label: 'Renewal', value: 'renewal' },
      { label: 'Proposal', value: 'proposal' }
    ];
  }

  getSeverity(status: string): any {
    switch (status) {
      case 'unqualified':
        return 'danger';

      case 'qualified':
        return 'success';

      case 'new':
        return 'info';

      case 'negotiation':
        return 'warn';

      case 'renewal':
        return null;
    }
  }
}
