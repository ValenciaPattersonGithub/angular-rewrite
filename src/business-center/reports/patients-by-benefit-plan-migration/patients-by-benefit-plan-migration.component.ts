import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { InsurancePriority } from 'src/patient/common/models/enums/insurance-priority.enum';
declare var angular: angular.IAngularStatic;
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'patients-by-benefit-plan-migration',
    templateUrl: './patients-by-benefit-plan-migration.component.html',
    styleUrls: ['./patients-by-benefit-plan-migration.component.scss']
})
export class PatientsByBenefitPlanMigrationComponent implements OnInit {
    @Input() data: any;
    isDataLoaded = false;
    private _data$ = new BehaviorSubject<any>(null);
    public reportData$: Observable<any>;

    constructor(private translate: TranslateService) { }

    ngOnInit(): void {
        var priorityList: Array<{ text: string, value: number }> = [
            { text: this.translate.instant('Primary'), value: InsurancePriority.Primary },
            { text: this.translate.instant('Secondary'), value: InsurancePriority.Secondary },
            { text: this.translate.instant('3rd Supplemental'), value: InsurancePriority.ThirdSupplemental },
            { text: this.translate.instant('4th Supplemental'), value: InsurancePriority.FourthSupplemental },
            { text: this.translate.instant('5th Supplemental'), value: InsurancePriority.FifthSupplemental },
            { text: this.translate.instant('6th Supplemental'), value: InsurancePriority.SixthSupplemental }
        ];

        this.reportData$ = this._data$.pipe(
            map(data => PatientsByBenefitPlanMigrationComponent.refreshData(data, priorityList)), 
            tap(() => this.isDataLoaded = true),
            shareReplay(1)
        );
    }

    public static refreshData(data, priorityList) {
        if (data && data.benefitPatientBenefitPlans && data.benefitPatientBenefitPlans.length > 0) {
            const reportData = [];
            var element = {};
            
            for (var i = 0; i < data.benefitPatientBenefitPlans.length; i++) {
                element = {};
                element['benefitPlanName'] = data.benefitPatientBenefitPlans[i].benefitPlanName;
                element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
                element['IsHeader'] = true;
                reportData.push(element);                

                for (var j = 0; j < data.benefitPatientBenefitPlans[i].patientBenefitPlans.length; j++) {
                    element = {}
                    element = angular.copy(data.benefitPatientBenefitPlans[i].patientBenefitPlans[j]);
                    element["priority"] = priorityList[element["priority"]]["text"];
                    element["IsHeader"] = false;
                    element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
                    reportData.push(element);
                }
            }
            
            return reportData;
        }
        return [];
    }

    ngOnChanges(changes: SimpleChanges) {
        this.isDataLoaded = false;            
        this._data$.next(changes["data"].currentValue);
    }

}
