import { Component, Inject, OnInit, Input, ViewChild, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { DashboardWidgetService } from '../services/dashboard-widget.service';
import { GroupResult, groupBy } from '@progress/kendo-data-query';
import { ChartComponent, LegendItemVisualArgs } from '@progress/kendo-angular-charts';
import { Subscription } from 'rxjs';
import { DashboardWidgetStatus } from '../services/dashboard-widget';
import { ReferralManagementHttpService } from '../../../@core/http-services/referral-management-http.service';
import { GaugeReferralFiltersTypes } from '../../../@shared/widget/gauge/gauge-chart.model';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { CommonFormatterService } from '../../../@shared/filters/common-formatter.service';

declare let _: any;

@Component({
    selector: 'widget-bar',
    templateUrl: './bar-chart-widget.component.html',
    styleUrls: ['./bar-chart-widget.component.scss']
})

export class WidgetbarComponent implements OnInit, OnDestroy {
    constructor(
        @Inject('locationService') private locationService,
        @Inject('referenceDataService') private referenceDataService,
        private dashboardWidgetService: DashboardWidgetService,
        private referralManagementHttpService: ReferralManagementHttpService,
        @Inject('practiceService') private practiceService,
        @Inject('ReportsFactory') private reportsFactory,
        private translate: TranslateService,
        public commonFormatterService: CommonFormatterService,
        private cdr: ChangeDetectorRef
    ) {
        document.body.id = "bar-chart";
    }
    loader: boolean;
    @Input() widgetData;

    // Define data fields
    widgetDetailsData = [];
    detailSeries: any = [];
    dataRange: any;
    callMethods = true;
    totalValue: any;
    renderObj: any;
    widgetSpacing;
    widgetGap;
    optionVal;
    count = 0;
    claimsTotal;
    claimsLabel;
    seriesVisible = true;
    showDateRange: boolean = false;
    loadingStatus: DashboardWidgetStatus;
    defaultFilter: string;
    launchDarklyStatus: boolean = false;
    subscriptions: Subscription[] = [];
    featureFlagSubscription: Subscription;
    startDate: Date;
    endDate: Date;
    referralTotal = 0;
    dataFilterOptions = [];
    fromDate: string;
    toDate: string;
    placeHolderForDateRangePicker = this.translate.instant('Date Range');
    showBarChart: false;
    showButtons: false;

    @ViewChild('chart', { static: false })
    chart: ChartComponent;
    drildown(event) {
        // pendimg claims
        if (this.widgetData.ItemId === 14) {
            sessionStorage.setItem('pendingclaims', 'true');
        } else if (this.widgetData.ItemId === 26) {          // unSubmitted clailms
            if (event.dataItem.Category === 'unSubmitted') {   // unSubmitted
                sessionStorage.setItem('unSubmittedClaims', 'unSubmitted');
            } else {    // alerts
                sessionStorage.setItem('unSubmittedClaims', 'alerts');
            }
        } else if (this.widgetData.ItemId === 27) {  // predetermination
            if (event.dataItem.Category === 'unsubmitted') {   // unSubmitted
                sessionStorage.setItem('predetermination', 'unsubmitted');
            } else if (event.dataItem.Category === 'submitted') {   // submitted
                sessionStorage.setItem('predetermination', 'submitted');
            } else {    // alerts
                sessionStorage.setItem('predetermination', 'alerts');  // alerts
            }
        } else if (this.widgetData.ItemId === 29) { // statements
            if (event.dataItem.Category === 'NotProcessed') {
                sessionStorage.setItem('statements', 'NotProcessed');  // staements
            } else {
                sessionStorage.setItem('statements', 'Processed');  // staements
            }

        } else if (this.widgetData.ItemId === 30) {
            let dateType;
            if (this.optionVal == 1) dateType = "YTD"
            else if (this.optionVal == 2) dateType = "MTD";
            else if (this.optionVal == 3) dateType = "Last Year";
            else if (this.optionVal == 4) dateType = "Date Range";
            const filter = this.dashboardWidgetService.GetReferralReportFilterDto(this.widgetData?.Locations, dateType);
            if (dateType == "Date Range") {
                filter.PresetFilterDto.StartDate = new Date(this.fromDate);
                filter.PresetFilterDto.EndDate = new Date(this.toDate);
            }
            sessionStorage.setItem("dateType", dateType);
            if (event.dataItem.Category == 'ReferredIn') {
                this.reportsFactory.GetSpecificReports([120]).then((res) => {
                    if (res && res?.Value) {
                        const report = res?.Value[0];
                        report.Route = '/BusinessCenter/' + `${report?.Route?.charAt(0).toUpperCase() as string}${report?.Route?.slice(1) as string}`;
                        report.FilterProperties = report?.RequestBodyProperties;
                        report.Amfa = this.reportsFactory.GetAmfaAbbrev(report?.ActionId);
                        this.reportsFactory.OpenReportPageWithContext(report, report?.Route, filter);
                    }
                })
            } else if (event.dataItem.Category == 'ReferredOut') {
                this.reportsFactory.GetSpecificReports([233]).then((res) => {
                    if (res && res?.Value) {
                        const report = res?.Value[0];
                        report.Route = '/BusinessCenter/' + `${report?.Route?.charAt(0).toUpperCase() as string}${report?.Route?.slice(1) as string}`;
                        report.FilterProperties = report?.RequestBodyProperties;
                        report.Amfa = this.reportsFactory.GetAmfaAbbrev(report?.ActionId);
                        this.reportsFactory.OpenReportPageWithContext(report, report?.Route, filter);
                    }
                });
            }
        }
        if (this.callMethods) {
            if (this.widgetData.ItemId === 29) {
                window.open('#/BusinessCenter/Receivables/Statements/');
            } else if (this.widgetData.ItemId != 30) {
                window.open('#/BusinessCenter/Insurance/');
            }
            this.changeSessionValue();
        }
    }

    changeSessionValue() {
        sessionStorage.removeItem('unSubmittedClaims');
        sessionStorage.removeItem('statements');
        sessionStorage.removeItem('predetermination');
        sessionStorage.setItem('pendingclaims', 'false');
    }

    createFilterDto(dateOption, locations, providers, startDate, endDate) {
        let filters = {};
        filters['LocationIds'] = locations;
        filters['DateOption'] = dateOption;
        filters['ProviderIds'] = providers;
        filters['StartDate'] = startDate;
        filters['EndDate'] = endDate;
        filters['optionVal'] = this.optionVal;
        return filters;
    }

    ngOnInit() {
        this.dataFilterOptions = [
            { text: 'YTD', value: 1 },
            { text: 'MTD', value: 2 },
            { text: 'Last Year', value: 3 },
            { text: 'Date Range', value: 4 }
        ];
        if (this.callMethods) {
            if (this.widgetData.ItemId === 27 || this.widgetData.ItemId === 30) {
                this.optionVal = 2;
            } else {
                this.optionVal = 1;
            }
            this.setWidgetWidth();
            this.getWidgetDetails();
        }
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        if (document.body.attributes.getNamedItem("id")) {
            document.body.attributes.removeNamedItem("id");
        }
    }

    getDates() {
        var currentDate = new Date();
        var dates;
        if (this.optionVal == 1) {
            const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
            dates = {
                startDate: firstDayOfYear,
                endDate: currentDate
            };
        }
        else if (this.optionVal == 2) {

            var startDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
            );
            var endDate = new Date();
            dates = {
                startDate: startDate,
                endDate: endDate
            };
        }
        else if (this.optionVal == 3) {
            const firstDayOfYear = new Date(currentDate.getFullYear() - 1, 0, 1);
            const lastDayOfYear = new Date(currentDate.getFullYear() - 1, 11, 31);

            dates = {
                startDate: firstDayOfYear,
                endDate: lastDayOfYear
            };
        }
        else if (this.optionVal == 4) {
            dates = {
                startDate: this.fromDate,
                endDate: this.toDate
            };

        }

        return dates;
    }


    getWidgetDetails() {
        this.loader = true;
        const userLocation = this.locationService.getCurrentLocation();
        if (this.widgetData.ItemId === 30) {
            let currentPractice = this.practiceService.getCurrentPractice();
            var dates = this.getDates();
            var ref = {
                practiceId: currentPractice?.id,
                startDate: dates?.startDate?.toDateString(),
                endDate: dates?.endDate?.toDateString(),
                locationId: userLocation?.id
            };
            this.referralManagementHttpService.getReferralTotals(ref).subscribe(
                (res) => {
                    this.loader = false;
                    this.handleReferralGraphColorBars(res);
                    this.detailSeries = groupBy(this.widgetDetailsData, [{ field: 'Category' }]);
                    this.referralTotal = 0;
                    _.each(this.widgetDetailsData, (val) => {
                        this.referralTotal += val.roundedvalue;
                    });
                    this.totalValue = this.referralTotal;
                },
                (error) => {
                    this.loader = false;
                });

        }
        else {
            const filterResult = this.createFilterDto(null, [userLocation.id], null, null, null);
            this.dashboardWidgetService.getWidgetData(this.widgetData.RouteUrl, filterResult).subscribe((res: any) => {
                if (res.Value && res.Value.SeriesData) {
                    this.widgetDetailsData = res.Value.SeriesData || [];
                    this.totalValue = res.Value.TotalValue;
                    this.handleGraphColorBars();
                    this.detailSeries = groupBy(this.widgetDetailsData, [{ field: 'Category' }]);
                    if (this.widgetData.ItemId === 14) {
                        this.handleClaimsTotal();
                        this.claimsTotal = this.totalValue;
                        this.claimsLabel = 'Claims Total';
                    }
                }
                this.loader = false;
            });
        }
    }

    handleReferralGraphColorBars(res) {

        if (res) {
            var referralInTotals = {
                color: '#c35250',
                roundedvalue: res.referralInTotals,
                Category: 'ReferredIn',
                Label: res.referralInTotals,
                Count: "Referred in : " + res.referralInTotals
            }
            var referralOutTotals = {
                color: '#ffc831',
                roundedvalue: res.referralOutTotals,
                Category: 'ReferredOut',
                Label: res.referralOutTotals,
                Count: "Referred out : " + res.referralOutTotals
            }
            this.widgetDetailsData = [];
            this.widgetDetailsData.push(referralOutTotals);
            this.widgetDetailsData.push(referralInTotals);
        }
    }

    handleGraphColorBars() {
        this.widgetDetailsData.forEach((x) => {
            if (x.Category === '0-30 days' || x.Category === 'submitted' || x.Category === 'Processed') {
                x.color = '#80c217'; x.roundedvalue = Math.round(x.Value);
            } else if (x.Category === '31-60 days' || x.Category === 'unSubmitted' || x.Category === 'unsubmitted' || x.Category === 'NotProcessed') {
                x.color = '#ffc831'; x.roundedvalue = Math.round(x.Value);
            } else if (x.Category === '61-90 days') {
                x.color = '#f09400'; x.roundedvalue = Math.round(x.Value);
            } else if (x.Category === '> 90 days' || x.Category === 'alerts' || x.Category === 'Failed') {
                x.color = '#c35250'; x.roundedvalue = Math.round(x.Value);
            }
        });
    }

    handleClaimsTotal() {
        _.each(this.widgetDetailsData, (val) => {
            this.count += val.Value;
        });
    }
    setWidgetWidth() {
        if (this.widgetData.ItemId === 14) {
            this.widgetGap = .10;
            this.widgetSpacing = .20;
        } else if (this.widgetData.ItemId === 26) {
            this.widgetGap = 2;
            this.widgetSpacing = .20;
        } else if (this.widgetData.ItemId === 27 || this.widgetData.ItemId === 29 || this.widgetData.ItemId === 30) {
            this.widgetGap = 2;
            this.widgetSpacing = .20;
        }
    }
    callFromParent(value: any) {
        this.optionVal = value;
        this.getWidgetDetails();
    }

    onDataFilterChange(value: any) {
        this.optionVal = value;
        if (this.optionVal < 4) {
            this.getWidgetDetails();
        }
    }

    public labelContent = (e: any) => {
        if (this.widgetData.ItemId === 30)
            return e.dataItem.Label;
        else
            return '$' + e.dataItem.Label;
    }

    onSelectItem = (option: { text: string, value: string }) => {
        if (option?.text == GaugeReferralFiltersTypes.DateRange) {
            this.showDateRange = true;
        }
        else this.showDateRange = false;
    }
    getCustomPlaceHolder = (filter: string): string => {
        if (filter == GaugeReferralFiltersTypes.DateRange) {
            return this.placeHolderForDateRangePicker as string;
        }
        return filter;
    }


    onDateFilterChange = (dateType, date) => {
        if (dateType == 'fromDate') {
            this.fromDate = date;
        }
        else if (dateType == 'toDate') this.toDate = date;
    }

    onApplyFilter = (dateType, date) => {

        if (this.toDate && this.fromDate) {
            this.showDateRange = false;
            this.getWidgetDetails();
            this.placeHolderForDateRangePicker = `${moment(new Date(this.fromDate)).format(this.commonFormatterService.commonDateFormat)} - ${moment(new Date(this.toDate)).format(this.commonFormatterService.commonDateFormat)}`;
        } else {
            this.placeHolderForDateRangePicker = GaugeReferralFiltersTypes.DateRange;
        }
    }

    clear() {
        this.onDateFilterChange('fromDate', '');
        this.onDateFilterChange('toDate', '');

    }

    shouldDisplayChart() {
        return this.chart!=undefined;
    }

}
