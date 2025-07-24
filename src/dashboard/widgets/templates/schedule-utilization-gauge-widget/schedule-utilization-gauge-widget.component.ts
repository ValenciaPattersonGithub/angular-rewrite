import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { GridsterItem } from 'angular-gridster2';
import { GaugeChart, GaugeChartType, GaugeFiltersTypes, GaugeSerialCategory, SeriesData } from 'src/@shared/widget/gauge/gauge-chart.model';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DashboardWidgetStatus } from '../../services/dashboard-widget';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { CommonFormatterService } from 'src/@shared/filters/common-formatter.service';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { Subscription } from 'rxjs';
import { ScheduleUtilization, WidgetCommon } from '../../services/dashboard-widget';
@Component({
  selector: 'schedule-utilization-gauge-widget',
  templateUrl: './schedule-utilization-gauge-widget.component.html',
  styleUrls: ['./schedule-utilization-gauge-widget.component.scss']
})
export class ScheduleUtilizationGaugeWidgetComponent implements OnInit {

  public scheduleUtilizationForm: FormGroup;
  @Input() data: GridsterItem;
  @Input() type: string;
  @Output() loadingComplete = new EventEmitter<DashboardWidgetStatus>();
  dataFilterOptions = [];
  allData = null;
  userData = null;
  widgetId: string = null;
  gaugeData: Array<SeriesData> = [];
  loadingStatus: DashboardWidgetStatus;
  schedUtilFromDate: Date;
  schedUtilToDate: Date;
  showPopOver = false;
  placeHolderForDateRangePicker = this.translate.instant('Date Range');
  defaultFilter: string;
  launchDarklyStatus = false;
  subscriptions: Subscription[] = [];
  featureFlagSubscription: Subscription;
  subscription: Subscription;

  // Property for accessing Enums
  public get GaugeChartType(): typeof GaugeChartType {
    return GaugeChartType;
  }

  constructor(
    private dashboardWidgetService: DashboardWidgetService,
    private translate: TranslateService,
    public fb: FormBuilder,
    public commonFormatterService:CommonFormatterService,
    private featureFlagService: FeatureFlagService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.data) {
      const nv = changes?.data?.currentValue;
      const ov = changes?.data?.previousValue;
      if (nv && nv != ov) {
        this.userData = nv?.userData;
        this.widgetId = nv?.ItemId;
      }
    }
  }
  clickedOutside = (datedropdown: DropDownListComponent) => {
    this.dashboardWidgetService.clickedOutside(datedropdown)
  }

  ngOnInit(): void {
    this.scheduleUtilizationForm = this.fb?.group({
      currentSelectedDataFilter: ['', '']
    });

    this.loadingStatus = { itemId: this.data?.ItemId, loading: WidgetInitStatus.Loaded, errorMessage: '' };
    this.processInitMode(this.data?.initMode);
  }

  processInitMode = (mode) => {
    if (mode == WidgetInitStatus?.Loaded) {
      this.defaultFilter = this.data?.initData;
      this.processData(this.data?.initData);
    } else if (mode == WidgetInitStatus?.ToLoad) {
      this.getWidgetData(null);
    }
  }

  getWidgetData = (filterType: string) => {
    this.loadingStatus.loading = WidgetInitStatus.ToLoad;
    this.loadingComplete.emit(this.loadingStatus);
    this.featureFlagSubscription = this.featureFlagService.getOnce$(FuseFlag.DashboardScheduleUtilizationWidgetMvp).subscribe((value) => {
      this.launchDarklyStatus = value;
    });
    this.subscriptions.push(this.featureFlagSubscription);

    const filters = {
      DateOption: filterType,
      LocationIds: this.data?.Locations,
      ProviderIds: [],
      StartDate: this.schedUtilFromDate,
      EndDate: this.schedUtilToDate,
      LaunchDarklyStatus: this.launchDarklyStatus
    }

    this.subscription = this.dashboardWidgetService.getWidgetData(ScheduleUtilization.ScheduleUtilizationURL, filters)
      .subscribe((res: SoarResponse<GaugeChart>) => {
        this.loadingStatus.loading = WidgetInitStatus.Loaded;
        this.loadingComplete.emit(this.loadingStatus);
        this.processData(res?.Value);
      },
        () => {
          this.loadingStatus.loading = WidgetInitStatus.error;
          this.loadingComplete.emit(this.loadingStatus);
        }
      );
      this.subscriptions?.push(this.subscription);
  }

  processData = (data: GaugeChart) => {
    this.allData = data?.Data;
    this.dataFilterOptions = data?.FilterList.map((key) => { return { text: key, value: key } });
    this.scheduleUtilizationForm?.controls?.currentSelectedDataFilter.setValue(data?.DefaultFilter);
    this.updateGauge(data?.DefaultFilter);
  }

  updateGauge = (filterType: string) => {
    if (!this.allData || filterType == "") {
      return;
    }
    const rangeData = this.allData[filterType]?.SeriesData;
    let percent = 0;

    let totalMinutesBooked = 0;
    let totalMinutesAvailable = 0;

    rangeData.forEach(serialData => {
      if (serialData?.Category == GaugeSerialCategory.TotalMinutesBooked) {
        totalMinutesBooked = Number(serialData?.Value);
      }
      if (serialData?.Category == GaugeSerialCategory.TotalMinutesAvailable) {
        totalMinutesAvailable = Number(serialData?.Value);
      }
    });
    const total = totalMinutesBooked + totalMinutesAvailable;
    if (total && totalMinutesBooked) {
      percent = Number((100 * totalMinutesBooked / total).toFixed(1));
    }
    const holeData = {
      SeriesName: WidgetCommon._hole_,
      Category: ScheduleUtilization.Booked,
      Value: percent
    };
    rangeData?.push(holeData);
    this.gaugeData = rangeData;
  }

  onDataFilterChange = (filter: string) => {
    this.showPopOver = false;
    if (filter == GaugeFiltersTypes.DateRange) {
      this.showPopOver = true;
      this.placeHolderForDateRangePicker = GaugeFiltersTypes.DateRange;
    } else {
      this.getWidgetData(filter);
    }
  }

  onApplyFilter = (dateOption: { startDate: Date, endDate: Date }) =>{    
    this.schedUtilFromDate = dateOption?.startDate;
    this.schedUtilToDate = dateOption?.endDate;
    if (dateOption?.startDate && dateOption?.endDate) {  
      this.showPopOver = false;    
      this.getWidgetData(
        GaugeFiltersTypes.DateRange
      );
      this.placeHolderForDateRangePicker = `${moment(this.schedUtilFromDate).format(this.commonFormatterService.commonDateFormat)} to ${moment(this.schedUtilToDate).format(this.commonFormatterService.commonDateFormat)}`;
    } else { 
      this.placeHolderForDateRangePicker = GaugeFiltersTypes.DateRange;
    }
  }

  onDateFilterChange = (dateOption: { startDate: Date, endDate: Date }) => {       
    this.showPopOver = false;
    this.schedUtilFromDate = dateOption?.startDate;
    this.schedUtilToDate = dateOption?.endDate;
    if (dateOption?.startDate && dateOption?.endDate) {         
      this.getWidgetData(
        GaugeFiltersTypes.DateRange
      );
      this.placeHolderForDateRangePicker = `${moment(this.schedUtilFromDate).format(this.commonFormatterService.commonDateFormat)} to ${moment(this.schedUtilToDate).format(this.commonFormatterService.commonDateFormat)}`;
    } else { 
      this.placeHolderForDateRangePicker = GaugeFiltersTypes.DateRange;
    }
  }

  onSelectItem = (option: { text: string, value: string }) => {
    if (option?.text == GaugeFiltersTypes.DateRange) {
      this.showPopOver = true;
    }
  }
  getCustomPlaceHolder = (filter: string): string => {
    if (filter == GaugeFiltersTypes.DateRange) {
      return this.placeHolderForDateRangePicker as string;
    }
    return filter;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());    
  }

}