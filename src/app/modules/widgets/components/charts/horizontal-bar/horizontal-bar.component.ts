import { Component, Input } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';
import { WidgetService } from 'src/app/modules/widgets/widget.service';

@Component({
  selector: 'app-horizontal-bar',
  standalone: false,
  templateUrl: './horizontal-bar.component.html',
  styleUrl: './horizontal-bar.component.css'
})
export class HorizontalBarComponent extends BaseWidget {
  data: any;
  @Input() style: any;
  @Input() labels: any[] = [];
  @Input() title: any[] = [];
  @Input() values: any[] = [];
  @Input() emitterId: any;
  @Input() id: any;
  @Input() inputOdt: any;
  plugins: any;
  options: any;

  constructor(private commonService: WidgetService) {
    super();
  }

  ngOnInit() {
    const surfaceBorder = this.style?.gridColor;

    this.data = {
      labels: this.labels,
      datasets: [
        {
          label: this.title,
          backgroundColor: this.style?.bgColor,
          borderColor: this.style?.borderColor,
          data: this.values,
        },
      ],
    };

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

    this.options = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
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
        legend: {
          labels: {
            color: this.style?.color,
            font: {
              weight: this.style?.fontWeight,
              family: this.style?.fontFamily,
              size: this.style?.fontSize,
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: this.style?.color,
            font: {
              weight: this.style?.fontWeight,
              family: this.style?.fontFamily,
              size: this.style?.fontSize,
            },
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: this.style?.color,
            font: {
              weight: this.style?.fontWeight,
              family: this.style?.fontFamily,
              size: this.style?.fontSize,
            },
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
    // Subscribe to changes in the 'dropdown' key
    this.commonService.getSubject(this.emitterId).subscribe((value) => {
      if (value) {
        this.fetchChartDataBasedOnDropdown(value);
      }
    });
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
              label: this.title,
              backgroundColor: this.style?.bgColor,
              borderColor: this.style?.borderColor,
              data: res[this.inputOdt.values.name],
            },
          ],
        };
      },
      error: (err: any) => { },
    });
  }
}
