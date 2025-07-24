import { Component, Input, OnInit, OnChanges, Inject, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { GridsterItem } from 'angular-gridster2';
import { GaugeChart, GaugeChartType, SeriesData } from 'src/@shared/widget/gauge/gauge-chart.model';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import { DashboardWidgetStatus } from '../../services/dashboard-widget';
import { TranslateService } from '@ngx-translate/core';
import { formatCurrencyIfNegPipe } from 'src/@shared/pipes/formatCurrencyNeg/format-currency-Neg.pipe';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { Subscription } from 'rxjs';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { NetGrossProductionGauge, WidgetCommon } from 'src/dashboard/widgets/services/dashboard-widget';

@Component({
  selector: 'net-gross-production-gauge-widget',
  templateUrl: './net-gross-production-gauge-widget.component.html',
  styleUrls: ['./net-gross-production-gauge-widget.component.scss']
})
export class NetGrossProductionGaugeWidgetComponent implements OnInit, OnChanges {
  @Input() data: GridsterItem;
  @Input() type: string;
  @Output() loadingComplete = new EventEmitter<DashboardWidgetStatus>();
  dateFilterOptions = [];
  allData = null;
  dateFilter = null;
  userData = null;
  widgetId = null;
  gaugeData: Array<SeriesData> = [];
  reportId = 21;
  dateOptions: Array<{ text: string, value: string }> = [];
  errorMessage = '';
  loadingStatus: DashboardWidgetStatus;
  subscriptions: Subscription[] = [];
  featureFlagSubscription: Subscription;

  // Property for accessing Enums
  public get GaugeChartType(): typeof GaugeChartType {
    return GaugeChartType;
  }

  public get NetGrossProductionGauge(): typeof NetGrossProductionGauge {
    return NetGrossProductionGauge;
  }

  constructor(
    private dashboardWidgetService: DashboardWidgetService,
    private translate: TranslateService,
    public formatCurrency: formatCurrencyIfNegPipe,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('ReportsFactory') private reportsFactory,
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

  ngOnInit(): void {
    this.loadingStatus = { itemId: this.data?.ItemId, loading: WidgetInitStatus.Loaded, errorMessage: '' };
    this.processInitMode(this.data?.initMode);
  }

  processInitMode = (mode) => {
    if (mode == WidgetInitStatus?.Loaded) {
      this.processData(this.data?.initData);
    } else if (mode == WidgetInitStatus?.ToLoad) {
      this.getWidgetData(null);
    }
  }

  getWidgetData = (dateOption) => {
    this.loadingStatus.loading = WidgetInitStatus.ToLoad;
    this.loadingComplete.emit(this.loadingStatus);

    const isGross = this.type == NetGrossProductionGauge.Gross;
    const gaugeURL = isGross ? NetGrossProductionGauge.GrossProductionURL : NetGrossProductionGauge.NetProductionURL;
    const dashboardURL = isGross ? NetGrossProductionGauge.UserDashboardGrossProductionURL : NetGrossProductionGauge.UserDashboardNetProductionURL;

    let launchDarklyStatus = false;
    const launchDarklyFlag = isGross ? FuseFlag.DashboardGrossProductionWidgetMvp : FuseFlag.DashboardNetProductionWidgetMvp;
    this.featureFlagSubscription = this.featureFlagService.getOnce$(launchDarklyFlag).subscribe((value) => {
        launchDarklyStatus = value;
    });
    this.subscriptions.push(this.featureFlagSubscription);

    const filterResult = {
        DateOption: dateOption,
        EndDate: undefined,
        LocationIds: null,
        ProviderIds: [this.userData?.UserId],
        StartDate: undefined,
        LaunchDarklyStatus: launchDarklyStatus
    };

    this.subscriptions.push(
        this.dashboardWidgetService.getWidgetData(window.location.href == WidgetCommon.PracticeAtAGlanceURL ? gaugeURL : dashboardURL, filterResult).subscribe(
            (res: SoarResponse<GaugeChart>) => {
              this.processData(res?.Value);
              this.loadingStatus.loading = WidgetInitStatus.Loaded;
              this.loadingComplete.emit(this.loadingStatus);
            },
            () => {
              this.loadingStatus.loading = WidgetInitStatus.error;
              this.loadingComplete.emit(this.loadingStatus);
              this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
            }
        )
    );
}

  processData = (data) => {
    this.allData = data?.Data;
    this.dateFilterOptions = data?.FilterList.map((key) => { return { Value: key } });
    this.dateFilter = data?.DefaultFilter;
    this.updateGauge(this.dateFilter);
  }

  updateGauge = (dateOption) => {
    if (!this.allData || !dateOption) {
      return;
    }
    const rangeData = this.allData[dateOption]?.SeriesData;
    let percent = 0;
    const productionData = rangeData?.filter(x => x.Category == NetGrossProductionGauge.Value);
    if (productionData?.Value) {
      percent = 100;
    }
    const category = this.formatCurrency?.transform(productionData?.Value);
    const holeData = {
      SeriesName: WidgetCommon._hole_,
      Category: category,
      label: `${percent}${'%' as string}`
    };
    rangeData?.push(holeData);
    this.gaugeData = rangeData;
  }

  //Gross Production Widget Drill Down(redirection to other tab) 
  drilldown = () => {
    const filter = this.dashboardWidgetService.GetReportFilterDto(this.data?.Locations, [this.data?.userData?.UserId], this.dateFilter);
    sessionStorage.setItem("dateType", this.dateFilter);
    this.reportsFactory.GetSpecificReports([this.reportId]).then((res) => {
      if (res && res?.Value) {
        const report = res?.Value[0];
        report.Route = '/BusinessCenter/' + `${report?.Route?.charAt(0).toUpperCase() as string}${report?.Route?.slice(1) as string}`;
        report.FilterProperties = report?.RequestBodyProperties;
        report.Amfa = this.reportsFactory.GetAmfaAbbrev(report?.ActionId);
        this.reportsFactory.OpenReportPageWithContext(report, report?.Route, filter);
      }
    })
  }

  dateFilterChanged = (filter) => {
    if (filter) {
      this.dateFilter = filter;
      this.getWidgetData(this.dateFilter);
    }
  }

  clickedOutside = (dropDownList: DropDownListComponent) => {
    this.dashboardWidgetService.clickedOutside(dropDownList)
  }

  ngOnDestroy() {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());    
  }
}
