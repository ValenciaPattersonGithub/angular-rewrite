import { Component, Input, OnInit, Inject, EventEmitter, Output, OnDestroy } from '@angular/core';
import { GridsterItem } from 'angular-gridster2';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import { DashboardWidgetStatus } from '../../services/dashboard-widget';
import { SimpleHalfDonutChart } from 'src/@shared/widget/simple-half-donut/simple-half-donut';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'hygiene-retention-half-donut-widget',
  templateUrl: './hygiene-retention-half-donut-widget.component.html',
  styleUrls: ['./hygiene-retention-half-donut-widget.component.scss']
})
export class HygieneRetentionHalfDonutWidgetComponent implements OnInit, OnDestroy {

  @Input() data: GridsterItem;
  @Output() loadingComplete = new EventEmitter<DashboardWidgetStatus>();
  loadingStatus: DashboardWidgetStatus;
  hygieneRetentionData: SimpleHalfDonutChart;
  hygieneRetentionFilterTypes = "";
  subscription: Subscription;
  constructor(
    private dashboardWidgetService: DashboardWidgetService,
    private translate: TranslateService,
    @Inject('toastrFactory') private toastrFactory) { }

  ngOnInit(): void {
    this.loadingStatus = { itemId: this.data?.ItemId, loading: WidgetInitStatus.Loaded, errorMessage: '' };
    this.processInitMode(this.data?.initMode);
  }

  processInitMode = (mode: number) => {
    if (mode == WidgetInitStatus.Loaded) {
      this.processData(this.data?.initData);
    } else if (mode == WidgetInitStatus.ToLoad) {
      this.getWidgetData();
    }
  }

  getWidgetData = () => {
    this.loadingStatus.loading = WidgetInitStatus.ToLoad;
    this.loadingComplete.emit(this.loadingStatus);

    const hygieneRetentionFilterTypes = { LocationIds: this.data.Locations };

    if (window.location.href == '/BusinessCenter/PracticeAtAGlance') {
      this.subscription = this.dashboardWidgetService.getWidgetData("widgets/schedule/HygieneRetention", hygieneRetentionFilterTypes).subscribe(
        (res: SoarResponse<SimpleHalfDonutChart>) => {
          this.processData(res?.Value);
          this.loadingStatus.loading = WidgetInitStatus.Loaded;
          this.loadingComplete.emit(this.loadingStatus);
        },
        () => {
          this.loadingStatus.loading = WidgetInitStatus.error;
          this.loadingComplete.emit(this.loadingStatus);
          this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
        }
      );
    } else {
      this.subscription = this.dashboardWidgetService.getWidgetData("widgets/schedule/UserDashboardHygieneRetention", hygieneRetentionFilterTypes).subscribe(
        (res: SoarResponse<SimpleHalfDonutChart>) => {
          this.processData(res?.Value);
          this.loadingStatus.loading = WidgetInitStatus.Loaded;
          this.loadingComplete.emit(this.loadingStatus);
        },
        () => {
          this.loadingStatus.loading = WidgetInitStatus.error;
          this.loadingComplete.emit(this.loadingStatus);
          this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
        }
      );
    }
  }

  processData = (data) => {
    this.hygieneRetentionData = data;
    this.hygieneRetentionFilterTypes = data?.DefaultFilter;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
