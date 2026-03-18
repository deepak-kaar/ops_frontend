import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';
import { WidgetService } from '../../../widget.service';

@Component({
  selector: 'app-pie-chart',
  standalone: false,
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.css'
})
export class PieChartComponent extends BaseWidget implements OnInit, OnChanges {
  data: any;
  @Input() labels: any[] = [];
  @Input() values: any[] = [];
  @Input() style: any;
  @Input() emitterId: any;
  @Input() id: any;
  @Input() inputOdt: any;
  options: any;
  plugins: any;

  constructor(private commonService: WidgetService) {
    super();
  }
  
  ngOnInit() {
    this.initializeChart();
    // Subscribe to changes in the 'dropdown' key
    this.commonService.getSubject(this.emitterId).subscribe((value) => {
      if (value) {
        this.fetchChartDataBasedOnDropdown(value);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update chart when style input changes
    if (changes['style'] && !changes['style'].firstChange) {
      this.initializeChart();
    }
  }

  private initializeChart(): void {
    const textColor = this.style?.color;

    this.data = {
      labels: this.labels,
      datasets: [
        {
          data: this.values,
          backgroundColor: this.style?.backgroundColors || [
            '#4CAF50',
            '#2196F3',
            '#FFEB3B',
          ],
          hoverBackgroundColor: this.style?.borderColors || this.style?.backgroundColors || [
            '#4CAF50',
            '#2196F3',
            '#FFEB3B',
          ],
        },
      ],
    };

    if (!this.plugins) {
      this.plugins = [
        {
          id: 'customCanvasBackgroundColor',
          beforeDraw: (chart: any, args: any, options: any) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color || '#ffffff';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          },
        },
        {
          id: 'idSetter',
          beforeInit(chart: any) {
            const canvas = chart.canvas;
            if (canvas) {
              canvas.id = chart.options.plugins.idSetter.id;
            }
          },
        },
      ];
    }

    this.options = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor,
            font: {
              weight: this.style?.fontWeight,
              family: this.style?.fontFamily,
              size: this.style?.fontSize,
            },
          },
        },
        customCanvasBackgroundColor: {
          color: this.style?.backgroundColor,
        },
        idSetter: {
          id: this.id,
        },
        tooltip: {
          backgroundColor: this.style?.tooltipBgColor,
          titleColor: this.style?.tooltipColor,
          bodyColor: this.style?.tooltipColor,
          footerColor: this.style?.tooltipColor,
          titleAlign: this.style?.textAlign,
          bodyAlign: this.style?.textAlign,
          footerAlign: this.style?.textAlign,
          titleFont: {
            family: this.style?.fontFamily,
            size: this.style?.fontSize,
            weight: this.style?.fontWeight,
          },
          bodyFont: {
            family: this.style?.fontFamily,
            size: this.style?.fontSize,
            weight: this.style?.fontWeight,
          },
          footerFont: {
            family: this.style?.fontFamily,
            size: this.style?.fontSize,
            weight: this.style?.fontWeight,
          },
          caretSize: 8,
          cornerRadius: 6,
          padding: 10,
        },
      },
    };
  }

  // Method to simulate API call and update chart data
  fetchChartDataBasedOnDropdown(value: any): void {
    //api call based on the instance id
    const payload = { entityOrInstanceId: value.id };
    this.commonService.getData(payload).subscribe({
      next: (res: any) => {
        this.data = {
          labels: res[this.inputOdt.labels.name],
          datasets: [
            {
              data: res[this.inputOdt.values.name],
              backgroundColor: this.style?.backgroundColors || [
                '#4CAF50',
                '#2196F3',
                '#FFEB3B',
              ],
              hoverBackgroundColor: this.style?.borderColors || this.style?.backgroundColors || [
                '#4CAF50',
                '#2196F3',
                '#FFEB3B',
              ],
            },
          ],
        };
      },
      error: (err: any) => { },
    });
  }
}

