import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewChild, Inject } from '@angular/core';
import { ChartComponent, LegendItemVisualArgs, LegendTitle, SeriesItemComponent } from '@progress/kendo-angular-charts';
import { SeriesData, SimpleHalfDonutChart, SimpleHalfDonutFiltersTypes } from './simple-half-donut';
import { geometry, Layout, Rect, Group, Text } from '@progress/kendo-drawing';
import { formatCurrencyIfNegPipe } from 'src/@shared/pipes/formatCurrencyNeg/format-currency-Neg.pipe';
import { TranslateService } from '@ngx-translate/core';
import { SimpleHalfDonut, WidgetCommon } from 'src/dashboard/widgets/services/dashboard-widget';

@Component({
  selector: 'simple-half-donut',
  templateUrl: './simple-half-donut.component.html',
  styleUrls: ['./simple-half-donut.component.scss']
})
export class SimpleHalfDonutComponent implements OnChanges {
  @Input() simpleHalfDonutChartData: SimpleHalfDonutChart;
  @Input() simpleHalfDonutFiltersTypes: SimpleHalfDonutFiltersTypes;
  @Input() HalfDonutChartData: SeriesData[];
  @Input() chartType = this.translate.instant('simple-donut');
  @Input() isReceivables = false;
  @Input() isHygieneRetention = false;

  seriesData = [];
  hiddenHalfDonut = 0;
  seriesDataHalfDonut = [];
  public startAngle = 0;
  public animateChart = true;
  presetColors = ['#7FDE8E', '#FFB34C', '#FF674C', '#D25E59', '#30AFCD'];
  legendTitleReceivablesText: LegendTitle;
  size = 50;
  holeSize = 62;
  percentage = '';
  slicedChartData: SeriesData;
  spaceBtwLegend = 10;
  spaceBtwLegendRcvbl = 30;
  simpleDonutText = this.translate.instant('simple-donut');
  halfDonutText = this.translate.instant('half-donut');

  @ViewChild("chart") public chart: ChartComponent;
  @ViewChild("series") public series: SeriesItemComponent;
  resetDonut = true;

  constructor(private changeDetectorRef: ChangeDetectorRef,
    public formatCurrency: formatCurrencyIfNegPipe,
    private translate: TranslateService,
    @Inject('tabLauncher') private tabLauncher) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      // Half Donut
      const nvHD = changes?.HalfDonutChartData?.currentValue;
      const ovHD = changes?.HalfDonutChartData?.currentValue;
      if (nvHD && ovHD && nvHD?.length > 0)
        this.loadHalfDonut(); // Load Half Donut chart

      // Simple Half Donut
      if (changes && changes.simpleHalfDonutFiltersTypes) {
        this.resetDonut = false;
        this.changeDetectorRef.detectChanges()
        this.loadData()
      }
    }
  }

  loadHalfDonut = () => {
    let seriesData = this.HalfDonutChartData;
    if (this.isReceivables) {
      seriesData = this.HalfDonutChartData?.slice(0, this.HalfDonutChartData?.length - 1);
      this.slicedChartData = this.HalfDonutChartData[this.HalfDonutChartData?.length - 1];
      this.legendTitleReceivablesText = {
        text: `${this.slicedChartData?.Category}\n${this.formatCurrency?.transform(this.slicedChartData?.Value) as number}`,
        font: "12px 'Open Sans', sans-serif",
        padding: { bottom: 20, top: -100 },
        align: 'center'
      };
    }
    let index = 0;
    if (seriesData?.length > 0) {
      this.hiddenHalfDonut = 0;
      seriesData.forEach(e => { this.hiddenHalfDonut += Math.abs(e?.Value) });
      this.seriesDataHalfDonut = [];
      //to add the transparent half of the donut.
      this.seriesDataHalfDonut.push({
        kind: "",
        color: "transparent",
        share: null,
        value: this.hiddenHalfDonut
      });
      seriesData?.forEach(item => {
        if (item?.SeriesName == WidgetCommon._hole_) {
          this.seriesDataHalfDonut.push({
            kind: item?.Category,
            color: item?.Color ? item?.Color : '#111111',
            share: null,
            value: item?.Value
          });
        } else if (item?.Value > 0) {
          this.seriesDataHalfDonut.push({
            kind: item?.Category,
            color: item?.Color ? item?.Color : (index < this.presetColors?.length ? this.presetColors[index] : this.presetColors[0]), // use the first one if we cannot find a match.
            share: null,
            value: item?.Value
          });
        } else if (item?.Value < 0 && this.isReceivables) {
          const seriesPosValue = Number(item?.Value.toString().substring(1, item?.Value.toString().length));
          this.seriesDataHalfDonut.push({
            kind: item?.Category,
            color: item?.Color ? item?.Color : (index < this.presetColors?.length ? this.presetColors[index] : this.presetColors[0]),
            share: null,
            value: seriesPosValue
          });
        } else {
          this.seriesDataHalfDonut.push({
            kind: item?.Category,
            color: item?.Color ? item?.Color : (index < this.presetColors?.length ? this.presetColors[index] : this.presetColors[0]),
            share: null,
            value: 0
          });
        }
        index++;
      });
    }
  }

  loadData = () => {
    const colors = {
      'Unsubmitted': '#FF674C', 'Submitted': '#FFB34C', 'Alerts': '#D25E59', 'Paid': '#7FDE8E', 'Scheduled': '#AEB5BA',
      'Unscheduled': '#30AFCD'
    };
    const filteredSeriesData: Array<SeriesData> = this.simpleHalfDonutChartData?.Data[this.simpleHalfDonutFiltersTypes]?.SeriesData;
    if (filteredSeriesData?.length > 0) {
      this.seriesData = [];
      //to add the transparent half of the donut.
      this.simpleHalfDonutDummyData(filteredSeriesData);
      filteredSeriesData?.forEach(serialData => {
        this.seriesData?.push({
          kind: serialData?.Category,
          color: serialData?.Value > 0 ? colors[serialData?.Category] : '#111111',
          share: null,
          value: serialData?.Value
        });
      });
    }

    //Set Retention % Label
    if (filteredSeriesData?.length > 0 && this.isHygieneRetention) {
      this.size = 60;
      this.holeSize = 62;
      this.spaceBtwLegend = 30;
      let scheduled = 0;
      let totalPatients = 0;
      for (let index = 0; index < filteredSeriesData?.length; index++) {
        if (filteredSeriesData[index]?.Category?.toLowerCase() == SimpleHalfDonut.Scheduled) {
          scheduled = filteredSeriesData[index]?.Value; //Get scheduled count
        }
        totalPatients += filteredSeriesData[index]?.Value; //Get all types count
      }

      let retentionRate = 0;
      if (totalPatients > 0) {
        retentionRate = Math.round((scheduled * 100) / totalPatients);
      }

      this.legendTitleHalfDonut = {
        text: `${this.translate.instant('Retention') as string}\n${retentionRate}${this.translate.instant('%') as string}`,
        font: "13px 'Open Sans', sans-serif",
        padding: { bottom: 20, top: -100 },
        align: 'center'
      };

    }
    this.resetDonut = true;
    this.changeDetectorRef.detectChanges()
  }

  labelContent = (e): string => {
    // Hide Label for dummy Data
    if ((e?.value == this.hiddenHalfDonut && e?.category == "") || e?.dataItem?.value <= 0) {
      return ''
    }

    if (this.isHygieneRetention) {
      //add Patient As label with count
      const formattedValue = `${e?.value as string}\n${this.translate.instant('patients') as string}`
      return formattedValue
    }
    else {
      //add dollar symbol to the label
      const formattedCurrency = String(this.formatCurrency?.transform(e?.value)).replace(/\.00/g, '');
      return formattedCurrency
    }

  };

  public legendTitleHalfDonut: LegendTitle = {
    text: '',
    margin: {
      top: -100,
      bottom: 30
    },
  }

  simpleHalfDonutDummyData = (data) => {
    this.hiddenHalfDonut = 0;
    data.forEach(e => { this.hiddenHalfDonut += e.Value });
    this.seriesData.unshift({
      kind: "",
      color: "transparent",
      share: this.hiddenHalfDonut,
      value: this.hiddenHalfDonut
    });
  }

  labelContentHalfDonut = (e): string => {
    if (!e?.category) {
      return '';
    } else {
      const avg = this.loadPercentage(e?.value);
      let calculatedAvg = '';
      if (this.isReceivables && this.slicedChartData?.Value !== 0) {
        this.percentage = Number(Math.round(e?.percentage * 2 * 100))?.toFixed(0) + '%';
        return this.percentage;
      } else {
        this.percentage = '';
      }
      if (avg) {
        calculatedAvg = `${avg}%`;
      }
      return calculatedAvg;
    }
  }

  loadPercentage = (value): number => {
    if (value && value > 0) {
      let sum = 0.0;
      const chartData = this.isReceivables ? this.HalfDonutChartData?.slice(0, this.HalfDonutChartData?.length - 1) : this.HalfDonutChartData;
      chartData?.forEach(x => sum += x?.Value);
      const average = (value * 100) / sum;
      let avg = 0;
      const splittedVal = average?.toFixed(2)?.split('.')[1]
      if (Number(splittedVal) <= 50) {
        avg = Math.floor(average);
      } else {
        avg = Math.ceil(average);
      }
      return avg;
    }
  }

  visual = (e: LegendItemVisualArgs) => {
    const index = e?.pointIndex;
    const rect = new geometry.Rect([0, 0], [80, 99]);
    const layout = new Layout(rect, {
      spacing: 20,
      alignItems: 'center'
    });

    const overlay = new Rect(layout.bbox(), {
      fill: {
        color: '#fff',
        opacity: 0
      },
      stroke: {
        color: 'none'
      },
      cursor: 'pointer'
    });

    const label = new Text(e?.series?.data[index]?.kind, [0, 0], {
      fill: {
        color: '#aeb5ba'
      },
      font: e?.options?.labels?.font,
    });

    const formattedCurrency = this.formatCurrency?.transform(e?.series?.data[index]?.value);

    const marker = new Text(formattedCurrency, [0, 0], {
      fill: {
        color: e?.series?.data[index]?.color
      },
      font: e?.options?.labels?.font,
    });
    layout.append(label, marker);
    layout.reflow();
    const group = new Group().append(layout, overlay);
    return group;
  }

  public legendTitle: LegendTitle = {
    text: this.translate.instant('Days Outstanding'),
    font: '12px "Open Sans", sans-serif',
    padding: {
      bottom: 20,
      top: -100
    },
    align: 'center'
  }

  drilldown = (event) => {
    if (this.isReceivables && event) {
      const tabNames = ['balanceCurrent', 'balance30', 'balance60', 'balance90', 'inCollections'];
      let categoryIndex = null;
      const category = event?.category || event?.text;
      this.HalfDonutChartData?.forEach((value, key) => {
        if (value?.Category == category) {
          categoryIndex = key;
        }
      });
      if (category != null && categoryIndex != null) {
        const tabName = tabNames[categoryIndex];
        if (tabName) {
          const baseUrl = SimpleHalfDonut.baseUrl;
          this.tabLauncher.launchNewTab(baseUrl + tabName);
          if (event.preventDefault) {
            event.preventDefault();
          }
        }
      }
    }
  }

}