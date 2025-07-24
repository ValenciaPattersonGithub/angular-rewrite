import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import moment from 'moment';
import { GaugeFiltersTypes, GaugeReferralFiltersTypes } from 'src/@shared/widget/gauge/gauge-chart.model';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';

export enum WidgetInitStatus {
    ToLoad = 0,
    Loading = 1,
    Loaded = 2,
    error = 3
}

@Injectable()
export class DashboardWidgetService {

    public readonly emptyGuId = "00000000-0000-0000-0000-000000000000";

    constructor(@Inject('SoarConfig') private soarConfig, private httpClient: HttpClient
    ) { }
    /*
    getWidgetData
    */
    getWidgetData(widgetUrl, filterDto): Observable<any> {
        return this.httpClient.post(this.soarConfig.domainUrl + '/' + widgetUrl, filterDto);
    }

    //GetReportFilterDto for net-gross-production-gauge-widget
    GetReportFilterDto = (locationIds: number[], providerIds: string[], dateOption: string) => {
        const currentDate = moment();
        let startDate: Date = null;
        let endDate: Date = null;
        switch (dateOption) {
            case GaugeFiltersTypes.LastYear:
                startDate = moment(currentDate)
                    .add(-1, 'years')
                    .startOf('year')
                    .toDate();
                endDate = moment(currentDate)
                    .add(-1, 'years')
                    .endOf('year')
                    .startOf('day')
                    .toDate();
                break;
            case GaugeFiltersTypes.LastMonth:
                startDate = moment(currentDate)
                    .add(-1, 'months')
                    .startOf('month')
                    .toDate();
                endDate = moment(currentDate)
                    .add(-1, 'months')
                    .endOf('month')
                    .startOf('day')
                    .toDate();
                break;
            case GaugeFiltersTypes.YTD:
                startDate = moment(currentDate).startOf('year').toDate();
                endDate = moment(currentDate).startOf('day').toDate();
                break;
            case GaugeFiltersTypes.MTD:
                startDate = moment(currentDate).startOf('month').toDate();
                endDate = moment(currentDate).startOf('day').toDate();
                break;
            case GaugeFiltersTypes.Today:
                startDate = endDate = moment(currentDate).startOf('day').toDate();
                break;
            default:
                break;
        }
        if (providerIds) {
            return {
                PresetFilterDto: {
                    LocationIds: locationIds,
                    ProviderUserIds: providerIds,
                    StartDate: startDate,
                    EndDate: endDate,
                },
            };
        } else {
            return {
                PresetFilterDto: {
                    LocationIds: locationIds,
                    StartDate: startDate,
                    EndDate: endDate,
                },
            };
        }
    }


    //GetReportFilterDto for referral widget
    GetReferralReportFilterDto = (locationIds: number[], dateOption: string) => {
        const currentDate = moment();
        let startDate: Date = null;
        let endDate: Date = null;
        let additionalIdentifiers: string[] = [];
        additionalIdentifiers.push(this.emptyGuId);
        switch (dateOption) {
            case GaugeReferralFiltersTypes.LastYear:
                startDate = moment(currentDate)
                    .add(-1, 'years')
                    .startOf('year')
                    .toDate();
                endDate = moment(currentDate)
                    .add(-1, 'years')
                    .endOf('year')
                    .startOf('day')
                    .toDate();
                break;
            case GaugeReferralFiltersTypes.YTD:
                startDate = moment(currentDate).startOf('year').toDate();
                endDate = moment(currentDate).startOf('day').toDate();
                break;
            case GaugeReferralFiltersTypes.MTD:
                startDate = moment(currentDate).startOf('month').toDate();
                endDate = moment(currentDate).startOf('day').toDate();
                break;
            default:
                break;
        }
        return {
            PresetFilterDto: {
                LocationIds: locationIds,
                StartDate: startDate,
                EndDate: endDate,
                AdditionalIdentifiers: additionalIdentifiers
            },
        };
    }

    clickedOutside = (dropDownList) => {
        if ((dropDownList as DropDownListComponent)?.isOpen) {
            (dropDownList as DropDownListComponent)?.toggle(false);
        }
    }
}
