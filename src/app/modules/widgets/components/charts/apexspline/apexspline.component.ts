import { Component, ElementRef, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseWidget } from 'gridstack/dist/angular';
import { WidgetService } from 'src/app/modules/widgets/widget.service';

@Component({
  selector: 'app-apexspline',
  standalone: false,
  templateUrl: './apexspline.component.html',
  styleUrl: './apexspline.component.css',
})
export class ApexsplineComponent extends BaseWidget implements OnChanges {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private chart: any;

  @Input() style: any;
  @Input() labels: any[] = [];
  @Input() values: any[] = [];
  @Input() emitterId: any;
  @Input() id: any;
  @Input() inputOdt: any;

  constructor(private commonService: WidgetService) {
    super();
  }

  ngOnInit() {
    if (this.emitterId) {
      this.commonService.getSubject(this.emitterId).subscribe((value) => {
        if (value) {
          this.fetchChartDataBasedOnDropdown(value);
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update chart when style input changes
    if (changes['style'] && !changes['style'].firstChange && this.chart) {
      this.updateChart();
    }
  }

  ngAfterViewInit() {
    this.loadApexCharts();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private loadApexCharts() {
    // Check if ApexCharts is already loaded
    if ((window as any).ApexCharts) {
      this.initChart();
      return;
    }

    // Dynamically load the script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
    script.async = true;
    script.onload = () => {
      this.initChart();
    };
    document.body.appendChild(script);
  }

  private buildOptions() {
    const textColor = this.style?.color;
    const fontFamily = this.style?.fontFamily;
    const fontSize = this.style?.fontSize;
    const fontWeight = this.style?.fontWeight;
    const gridColor = this.style?.gridColor || '#dfe7ef';
    const tooltipBgColor = this.style?.tooltipBgColor || '#000000';
    const tooltipColor = this.style?.tooltipColor || '#ffffff';
    const borderColor = this.style?.borderColor;
    const backgroundColor = this.style?.backgroundColor;
    const backgroundMode = this.style?.backgroundMode || 'transparent';

    // Component-specific series colors (from style.backgroundColors), independent of background color
    // If borderColor is provided, use it for the line color; otherwise use backgroundColors
    let seriesColors: string[];
    if (borderColor) {
      seriesColors = [borderColor];
    } else if (this.style?.backgroundColors && this.style.backgroundColors.length) {
      seriesColors = this.style.backgroundColors;
    } else {
      seriesColors = ['#0075ff', '#2cd9ff'];
    }

    const categories =
      this.labels && this.labels.length
        ? this.labels
        : [
            '2018-09-19T00:00:00.000Z',
            '2018-09-19T01:30:00.000Z',
            '2018-09-19T02:30:00.000Z',
            '2018-09-19T03:30:00.000Z',
            '2018-09-19T04:30:00.000Z',
            '2018-09-19T05:30:00.000Z',
            '2018-09-19T06:30:00.000Z',
          ];

    const values =
      this.values && this.values.length
        ? this.values
        : [31, 40, 28, 51, 42, 109, 100];

    // Determine chart background color
    let chartBackground = 'transparent';
    if (backgroundMode === 'color' && backgroundColor && backgroundColor !== 'transparent') {
      chartBackground = backgroundColor;
    } else if (backgroundMode === 'transparent') {
      chartBackground = 'transparent';
    }

    return {
      series: [
        {
          name: 'series1',
          data: values,
        },
      ],
      chart: {
        height: '100%',
        width: '100%',
        type: 'area',
        toolbar: {
          show: false,
        },
        background: chartBackground,
      },
      colors: seriesColors,
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100],
        },
      },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        type: 'category',
        categories,
        labels: {
          style: {
            colors: textColor,
            fontFamily,
            fontSize,
            fontWeight,
          },
        },
        axisBorder: {
          color: gridColor,
        },
        axisTicks: {
          color: gridColor,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: textColor,
            fontFamily,
            fontSize,
            fontWeight,
          },
        },
        axisBorder: {
          color: gridColor,
        },
      },
      tooltip: {
        theme: tooltipBgColor === '#000000' || !tooltipBgColor ? 'dark' : 'light',
        style: {
          fontFamily,
          fontSize,
          fontWeight,
        },
        x: {
          format: 'dd/MM/yy HH:mm',
        },
        fillSeriesColor: false,
        marker: {
          fillColors: seriesColors,
        },
      },
      legend: {
        labels: {
          colors: textColor,
          useSeriesColors: false,
        },
        fontFamily,
        fontSize,
        fontWeight,
      },
    };
  }

  private initChart() {
    if (!this.chartContainer) return;

    const ApexCharts = (window as any).ApexCharts;
    const options = this.buildOptions();

    this.chart = new ApexCharts(this.chartContainer.nativeElement, options);
    this.chart.render();
  }

  private updateChart() {
    if (this.chart) {
      const options = this.buildOptions();
      this.chart.updateOptions(options, true, true);
    } else if ((window as any).ApexCharts && this.chartContainer) {
      this.initChart();
    }
  }

  // Method to simulate API call and update chart data
  fetchChartDataBasedOnDropdown(value: any): void {
    const payload = { entityOrInstanceId: value.id };
    this.commonService.getData(payload).subscribe({
      next: (res: any) => {
        if (this.inputOdt?.labels?.name && this.inputOdt?.values?.name) {
          this.labels = res[this.inputOdt.labels.name] || [];
          this.values = res[this.inputOdt.values.name] || [];
          this.updateChart();
        }
      },
      error: (_err: any) => {},
    });
  }
}
