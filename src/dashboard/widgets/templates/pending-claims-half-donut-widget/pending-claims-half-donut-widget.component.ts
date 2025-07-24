import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GridsterItem } from 'angular-gridster2';
import { WidgetInitStatus, DashboardWidgetService } from '../../services/dashboard-widget.service';
import { locationList } from 'src/business-center/practice-settings/billing/bank-accounts/bank-account';
import { SeriesData, SimpleHalfDonutFiltersTypes } from 'src/@shared/widget/simple-half-donut/simple-half-donut';
import { DashboardWidgetStatus } from '../../services/dashboard-widget';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { GaugeChart, GaugeFiltersTypes } from 'src/@shared/widget/gauge/gauge-chart.model';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { PendingClaims, WidgetCommon } from '../../services/dashboard-widget';
import { SoarResponse } from 'src/@core/models/core/soar-response';

@Component({
  selector: 'pending-claims-half-donut-widget',
  templateUrl: './pending-claims-half-donut-widget.component.html',
  styleUrls: ['./pending-claims-half-donut-widget.component.scss']
})
export class PendingClaimsHalfDonutWidgetComponent implements OnInit, OnDestroy {
  @Input() data: GridsterItem;
  pendingClaimsData: SeriesData[] = [];
  userContext = JSON.parse(sessionStorage.getItem('userContext'));
  selectedLocation = { LocationId: 0 };
  locationOptions: locationList[] = []
  simpleHalfDonutFiltersTypes: SimpleHalfDonutFiltersTypes = SimpleHalfDonutFiltersTypes.YTD;
  chartType = 'half-donut';
  errorMessage = '';
  subscriptions: Subscription[] = [];
  loadingStatus: DashboardWidgetStatus;
  @Output() loadingComplete = new EventEmitter<DashboardWidgetStatus>();
  launchDarklyStatus = false;

  constructor(   
    private translate: TranslateService,
    private dashboardWidgetService: DashboardWidgetService,
    @Inject('locationService') private locationService,
    @Inject('$rootScope') private $rootScope,
    @Inject('toastrFactory') private toastrFactory,
    private featureFlagService: FeatureFlagService
  ) { }

  ngOnInit(): void {
    this.loadingStatus = { itemId: this.data?.ItemId, loading: WidgetInitStatus.Loaded, errorMessage: '' };
    this.selectedLocation.LocationId = this.locationService.getCurrentLocation()?.id;
    this.processInitMode(this.data?.initMode);
    this.$rootScope.$on('locationsUpdated', () => {
      this.loadData();
    })
  }

  processInitMode = (mode) => {
    if (mode == WidgetInitStatus.Loaded) {
      this.pendingClaimsData = this.data?.initData?.Data[GaugeFiltersTypes.DateRange]?.SeriesData;
      this.addLegendTitle();
    }
    else if (mode == WidgetInitStatus.ToLoad) {
      this.loadData();
    }
  }

  // gets the report via POST
  loadData = () => {
    let subscription: Subscription;
    let featureFlagSubscription: Subscription;
    this.loadingStatus.loading = WidgetInitStatus.Loading;
    this.loadingComplete.emit(this.loadingStatus);
    const locationFilters = this.getLocationsForFilter();
    const filters = {
      LocationIds: locationFilters,
      ProviderIds: null,
      DateOption: null,
      LaunchDarklyStatus: this.launchDarklyStatus
    }
    //Uncoverable branch for UT as assigning value to window.location.href redirects to Not Found and test cases execution gets terminated 
    if (window.location.href == WidgetCommon.PracticeAtAGlanceURL) { 
      subscription =  this.dashboardWidgetService.getWidgetData(PendingClaims.PendingClaimsURL, filters)
        .subscribe((res: SoarResponse<GaugeChart>) => {
          if (res && res?.Value) {
            this.pendingClaimsData = res?.Value?.Data[GaugeFiltersTypes.DateRange]?.SeriesData;
            this.addLegendTitle();
          }
        this.loadingStatus.loading = WidgetInitStatus.Loaded;
        this.loadingComplete.emit(this.loadingStatus);
        }, () => {
        this.loadingStatus.loading = WidgetInitStatus.error;
        this.loadingComplete.emit(this.loadingStatus);      
        this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
        }
        );
        this.subscriptions.push(subscription);
    } else {
      featureFlagSubscription = this.featureFlagService.getOnce$(FuseFlag.DashboardPendingClaimsWidgetMvp).subscribe((value) => {
        this.launchDarklyStatus = value;
      });
      this.subscriptions.push(featureFlagSubscription);    
      filters.LaunchDarklyStatus = this.launchDarklyStatus;
      subscription = this.dashboardWidgetService.getWidgetData(PendingClaims.UserDashboardPendingClaimsURL, filters).subscribe(
        (res: SoarResponse<GaugeChart>) => {
          if (res && res?.Value) {
            this.pendingClaimsData = res?.Value?.Data[GaugeFiltersTypes.DateRange]?.SeriesData;
            this.addLegendTitle();
          }
          this.loadingStatus.loading = WidgetInitStatus.Loaded;
          this.loadingComplete.emit(this.loadingStatus);
        }, () => {
          this.loadingStatus.loading = WidgetInitStatus.error;
          this.loadingComplete.emit(this.loadingStatus);
        this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
        }
      );
      this.subscriptions.push(subscription);
    }
  }

  addLegendTitle = () => {
    this.pendingClaimsData?.push({
      SeriesName: WidgetCommon._hole_,
      Category: this.translate.instant('Days Outstanding'),
      Value: null
    });
  }

  getLocationsForFilter = () => {
    const locationLists: number[] = [];
    if (this.selectedLocation.LocationId != 0) {
      locationLists?.push(this.selectedLocation?.LocationId);
    }
    else {
      for (let x = 0; x < this.locationOptions?.length; x++) {
        locationLists?.push(this.locationOptions[x]?.value);
      }
    }
    return locationLists;
  }

  ngOnDestroy(): void {
    this.subscriptions?.forEach(subscription => subscription.unsubscribe());
  }
}
