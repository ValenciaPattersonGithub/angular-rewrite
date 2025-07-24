import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { GridsterItem } from 'angular-gridster2';
import { SeriesData } from 'src/@shared/widget/simple-half-donut/simple-half-donut';
import { locationList } from 'src/business-center/practice-settings/billing/bank-accounts/bank-account';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import { DashboardWidgetStatus } from '../../services/dashboard-widget';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { ReceivablesWidget, WidgetCommon } from '../../services/dashboard-widget';

@Component({
  selector: 'receivables-half-donut-widget',
  templateUrl: './receivables-half-donut-widget.component.html',
  styleUrls: ['./receivables-half-donut-widget.component.scss']
})
export class ReceivablesHalfDonutWidgetComponent implements OnInit {
  @Input() data: GridsterItem;
  receivablesData: SeriesData[];
  errorMessage = '';
  chartType = this.translate.instant('half-donut');
  locationOptions: locationList[] = [];
  selectedLocation = { LocationId: 0 };
  isReceivables = false;
  //dropdown data
  selectedType = ReceivablesWidget.DisplayType_All;
  selectedDisplayType = ReceivablesWidget.DisplayType_All;
  displayTypeOptions = [
    { name: this.translate.instant("All"), value: ReceivablesWidget.DisplayType_All },
    { name: this.translate.instant("Patient Only"), value: ReceivablesWidget.DisplayType_Patient_Only },
    { name: this.translate.instant("Insurance Only"), value: ReceivablesWidget.DisplayType_Insurance_Only }
  ];
  loadingStatus: DashboardWidgetStatus;
  subscriptions: Subscription[] = [];
  featureFlagSubscription: Subscription;
  subscription: Subscription;
  launchDarklyStatus = false;
  @Output() loadingComplete = new EventEmitter<DashboardWidgetStatus>();

  constructor(
    private dashboardWidgetService: DashboardWidgetService,
    @Inject('locationService') private locationService,
    @Inject('$rootScope') private $rootScope,
    @Inject('toastrFactory') private toastrFactory,
    private translate: TranslateService,
    private featureFlagService: FeatureFlagService ) { }

  ngOnInit(): void {
    this.loadingStatus = { itemId: this.data?.ItemId, loading: WidgetInitStatus.Loaded, errorMessage: '' };
    this.isReceivables = true;
    this.selectedType = ReceivablesWidget.DisplayType_All;
    this.selectedDisplayType = ReceivablesWidget.DisplayType_All;
    this.selectedLocation.LocationId = this.locationService.getCurrentLocation()?.id;
    this.processInitMode(this.data?.initMode);
    this.$rootScope.$on('locationsUpdated', () => {
      this.loadData(this.selectedType);
    });
  }

  processInitMode = (mode) => {
    if (mode == WidgetInitStatus?.Loaded) {  
      this.receivablesData = this.data?.initData?.Data[this.data?.initData?.DefaultFilter]?.SeriesData;
    }
    else if (mode == WidgetInitStatus?.ToLoad) {
      this.loadData(this.selectedType);
    }
    else if (mode == WidgetInitStatus.Loading) {
      this.loadingStatus.loading = WidgetInitStatus.Loading;
      this.loadingComplete.emit(this.loadingStatus);
    }
  }

  // gets the report via POST
  loadData = (amountType) => {
    this.loadingStatus.loading = WidgetInitStatus.Loading;
    this.loadingComplete.emit(this.loadingStatus);
    const firstLocationId = this.selectedLocation?.LocationId ? this.selectedLocation?.LocationId : this.dashboardWidgetService.emptyGuId;
    const filters = {
      LocationIds: firstLocationId,
      DateOption: null,
      ProviderIds: null,
      AmountType: amountType
    }
    if (window.location.href == WidgetCommon.PracticeAtAGlanceURL) {
      this.subscription = this.dashboardWidgetService.getWidgetData(ReceivablesWidget.ReceivablesUrl, filters).subscribe((res) => {
        if (res && res?.Value) {
          this.receivablesData = res?.Value?.SeriesData;
        }
        this.loadingStatus.loading = WidgetInitStatus.Loaded;
        this.loadingComplete.emit(this.loadingStatus);
      }, () => {
        this.loadingStatus.loading = WidgetInitStatus.error;
        this.loadingComplete.emit(this.loadingStatus);
        this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
      });
      this.subscriptions?.push(this.subscription);
    } else {
      this.featureFlagSubscription = this.featureFlagService.getOnce$(FuseFlag.DashboardReceivablesWidgetMvp).subscribe((value) => {
        this.launchDarklyStatus = value;
      });
      this.subscriptions?.push(this.featureFlagSubscription);
      filters["LaunchDarklyStatus"] = this.launchDarklyStatus;
      this.subscription = this.dashboardWidgetService.getWidgetData(ReceivablesWidget.UserDashboardReceivablesUrl, filters).subscribe((res) => {
        if (res && res?.Value) {
          this.receivablesData = res?.Value?.SeriesData;
        }
        this.loadingStatus.loading = WidgetInitStatus.Loaded;
        this.loadingComplete.emit(this.loadingStatus);
      }, () => {
        this.loadingStatus.loading = WidgetInitStatus.error;
        this.loadingComplete.emit(this.loadingStatus);
        this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
      });
      this.subscriptions?.push(this.subscription);
    }
  }

  filterChanged = (type) => {
    this.selectedType = type;
    this.loadData(type);
  }

  ngOnDestroy() {
    this.subscriptions?.forEach(subscription => subscription?.unsubscribe());    
  }

}
