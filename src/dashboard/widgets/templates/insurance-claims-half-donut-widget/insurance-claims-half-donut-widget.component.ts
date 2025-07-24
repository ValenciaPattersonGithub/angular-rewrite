import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GridsterItem } from 'angular-gridster2';
import { DashboardWidgetService } from '../../services/dashboard-widget.service';
import { WidgetInitStatus } from '../../services/dashboard-widget.service';
import { locationList } from 'src/business-center/practice-settings/billing/bank-accounts/bank-account';
import { DashboardWidgetStatus } from '../../services/dashboard-widget';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { InsuranceClaims, WidgetCommon } from '../../services/dashboard-widget';

@Component({
  selector: 'insurance-claims-half-donut-widget',
  templateUrl: './insurance-claims-half-donut-widget.component.html',
  styleUrls: ['./insurance-claims-half-donut-widget.component.scss']
})
export class InsuranceClaimsHalfDonutWidgetComponent implements OnInit, OnDestroy {
  @Input() data: GridsterItem;
  displayTypeOptions = [];
  simpleHalfDonutFiltersTypes = "";
  simpleHalfDonutChartData = null;
  @Output() loadingComplete = new EventEmitter<DashboardWidgetStatus>();
  loadingStatus: DashboardWidgetStatus;
  dateOption = null;
  dateFilter = null;
  subscriptions: Subscription[] = [];
  launchDarklyStatus = false;

  constructor(
    private dashboardWidgetService: DashboardWidgetService,
    private translate: TranslateService,
    @Inject('toastrFactory') private toastrFactory,
    private featureFlagService: FeatureFlagService
    ) { }

  ngOnInit(): void {
    this.loadingStatus = {itemId: this.data?.ItemId, loading: WidgetInitStatus.Loaded, errorMessage: ''};
    this.processInitMode(this.data?.initMode);
  }

  processInitMode = (mode) => {
    if (mode == WidgetInitStatus?.Loaded) {
      const data = this.data?.initData;
      this.processData(data);
    } else if (mode == WidgetInitStatus?.ToLoad) {
           this.loadData();
      }
  }

   dateFilterChanged(type) {
    if (type !== null && type !== this.dateOption) {
      this.dateOption = type;
      this.loadData();   
    }
  }
  clickedOutside = (datedropdown: DropDownListComponent) => {
    this.dashboardWidgetService.clickedOutside(datedropdown)
  }

  loadData =() => {
    let subscription : Subscription;
    let featureFlagSubscription: Subscription;
    this.loadingStatus.loading = WidgetInitStatus.ToLoad;
    this.loadingComplete.emit(this.loadingStatus);
    const filterResult = {
      DateOption : this.dateOption,
      EndDate: undefined,
      LocationIds: this.data?.Locations,
      ProviderIds: null,
      StartDate: undefined,
      LaunchDarklyStatus: this.launchDarklyStatus
    };
    //Uncoverable branch for UT as assigning value to window?.location?.href redirects to Not Found and test cases execution gets terminated
    if (window?.location?.href == WidgetCommon.PracticeAtAGlanceURL) {
      subscription = this.dashboardWidgetService.getWidgetData(InsuranceClaims.InsuranceClaimsURL, filterResult)
        .subscribe((res) => {
          if (res && res?.Value) {
            this.processData(res?.Value);                  
          }  
          this.loadingStatus.loading = WidgetInitStatus.Loaded;
          this.loadingComplete.emit(this.loadingStatus);
        },
        () => {
          this.loadingStatus.loading = WidgetInitStatus.error;
          this.loadingComplete.emit(this.loadingStatus);
          this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
        }
      );      
      this.subscriptions.push(subscription);
    } else {
        featureFlagSubscription = this.featureFlagService.getOnce$(FuseFlag.DashboardInsuranceClaimsWidgetMvp).subscribe((value) => {
        this.launchDarklyStatus = value;
      });
      this.subscriptions.push(featureFlagSubscription);      
      filterResult.LaunchDarklyStatus = this.launchDarklyStatus;
      subscription = this.dashboardWidgetService.getWidgetData(InsuranceClaims.UserDashboardInsuranceClaimsURL, filterResult)
        .subscribe((res) => {
          if (res && res?.Value) {
            this.processData(res?.Value);                  
          }
          this.loadingStatus.loading = WidgetInitStatus.Loaded;
          this.loadingComplete.emit(this.loadingStatus);
        },
        () => {
          this.loadingStatus.loading = WidgetInitStatus.error;
          this.loadingComplete.emit(this.loadingStatus);
          this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
        }
      );
      this.subscriptions.push(subscription);
    }
  };

  processData(data) {
    this.displayTypeOptions = data?.FilterList.map((filter) => { return { Value: this.translate.instant(filter) } });
    this.dateFilter = data?.DefaultFilter;
    this.simpleHalfDonutFiltersTypes = "";
    this.simpleHalfDonutChartData = null;
    this.simpleHalfDonutFiltersTypes = this.dateFilter;
    const d = data;
    this.simpleHalfDonutChartData = d;
  }

  ngOnDestroy(): void {
    this.subscriptions?.forEach(subscription => subscription.unsubscribe());
  }
}
