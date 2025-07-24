import { Component, Input, OnChanges, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { GaugeChartConfigurations } from './gauge-chart-configurations.modal';
import { GaugeChartColors, GaugeChartType, GaugeFiltersTypes, GaugeSerialCategory, SeriesData, SeriesNameTypes } from './gauge-chart.model';

@Component({
  selector: 'gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss']
})
export class GaugeComponent implements OnChanges {

  @Input() gaugeChartData: Array<SeriesData>;
  @Input() gaugeChartType: GaugeChartType;
  @Input() gaugeFiltersTypes: GaugeFiltersTypes;
  @Output() drilldown = new EventEmitter();

  public get GaugeChartType(): typeof GaugeChartType {
    return GaugeChartType;
  }

  configSettings: GaugeChartConfigurations = new GaugeChartConfigurations();
  gaugeValue = 0.00;
  booked: string;
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.gaugeChartData) {
      const nv = changes?.gaugeChartData?.currentValue;
      const ov = changes?.gaugeChartData?.previousValue;
      if (nv && nv != ov) {
        this.loadData();
      }
    }
  }

  loadData = () => {
    if (this.gaugeChartType == GaugeChartType.GrossProduction || this.gaugeChartType == GaugeChartType.NetProduction || this.gaugeChartType == GaugeChartType.ScheduleUtilization) {
      this.configSettings.startAngle = -45;
      this.configSettings.endAngle = 225;
      this.configSettings.rangeLineCap = GaugeChartColors.rangeLineCap;
      this.configSettings.showLabels = true;
      this.configSettings.value = 100;
      this.configSettings.colors = [{ from: 0, to: 100, color: GaugeChartColors.GrossNetProductionColor, opacity: 1 }]

      this.configSettings.rangePlaceholderColor = GaugeChartColors.NoDataColor;
      const serialData: Array<SeriesData> = this.gaugeChartData;
      if (serialData?.length > 0) {
        serialData.forEach(serialData => {
          if (this.gaugeChartType == GaugeChartType.GrossProduction || this.gaugeChartType == GaugeChartType.NetProduction) {
            if (serialData?.Category == GaugeSerialCategory?.Value) {
              this.gaugeValue = serialData?.Value;
            }
          }
          else if (this.gaugeChartType == GaugeChartType.ScheduleUtilization) {
            this.configSettings.rangePlaceholderColor = GaugeChartColors.ScheduleColor;
            if (serialData?.SeriesName == SeriesNameTypes?._hole_) {
              this.gaugeValue = serialData?.Value;
              this.booked = serialData?.Category;
            }
          }
        });
      }
    }
    if (this.gaugeValue) {
      this.configSettings.value = (this.gaugeChartType == GaugeChartType.ScheduleUtilization) ? this.gaugeValue : 100;
    } else {
      this.configSettings.value = 0;
    }
  }

  onClick = () => {
    this.drilldown.emit();
  }
}
