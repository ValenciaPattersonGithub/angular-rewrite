import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { downgradeComponent } from '@angular/upgrade/static';
declare var angular: angular.IAngularStatic;

@Component({
    selector: 'benefit-plans-by-insurance-payment-type-migration',
    templateUrl: './benefit-plans-by-insurance-payment-type-migration.component.html',
    styleUrls: ['./benefit-plans-by-insurance-payment-type-migration.component.scss']
})
export class BenefitPlansByInsurancePaymentTypeMigrationComponent implements OnInit {
    @Input() data: any;
    isDataLoaded = false;
    private _data$ = new BehaviorSubject<any>(null);
    public reportData$: Observable<any>;

    constructor(private translate: TranslateService) { }

    ngOnInit(): void {
        this.reportData$ = this._data$.pipe(
            map(data => BenefitPlansByInsurancePaymentTypeMigrationComponent.refreshData(data)),
            tap(() => this.isDataLoaded = true),
            shareReplay(1)
        );
    }

    public static refreshData(data) {

        if (data && data.paymentTypes) {
            data.paymentTypes = data.paymentTypes.filter(s => s.benefitPlans.length > 0);
            if (data.paymentTypes.length > 0) {
                const reportData = [];
                var element = {};

                for (var i = 0; i < data.paymentTypes.length; i++) {
                    element = {};
                    element['description'] = data.paymentTypes[i].description;
                    element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
                    element['IsHeader'] = true;
                    reportData.push(element);

                    for (var j = 0; j < data.paymentTypes[i].benefitPlans.length; j++) {
                        element = {}
                        element = angular.copy(data.paymentTypes[i].benefitPlans[j]);
                        element["IsHeader"] = false;
                        element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
                        reportData.push(element);
                    }
                }
                return reportData;
            }
        }
        return [];

        //return data;
    }

    ngOnChanges(changes: SimpleChanges) {
        this.isDataLoaded = false;
        this._data$.next(changes["data"].currentValue);
    }

}
