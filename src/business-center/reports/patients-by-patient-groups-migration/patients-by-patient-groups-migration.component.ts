import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
declare var angular: angular.IAngularStatic;

@Component({
    selector: 'patients-by-patient-groups-migration',
    templateUrl: './patients-by-patient-groups-migration.component.html',
    styleUrls: ['./patients-by-patient-groups-migration.component.scss']
})
export class PatientsByPatientGroupsMigrationComponent implements OnInit {
    @Input() data: any;
    isDataLoaded = false;
    private _data$ = new BehaviorSubject<any>(null);
    public reportData$: Observable<any>;

    constructor(private translate: TranslateService) { }

    ngOnInit(): void {
        this.reportData$ = this._data$.pipe(
            map(data => PatientsByPatientGroupsMigrationComponent.refreshData(data)),
            tap(() => this.isDataLoaded = true),
            shareReplay(1)
        );
    }

    public static refreshData(data) { 
        if (data && data.patientGroups && data.patientGroups.length > 0) {
            const reportData = [];
            var element = {};
            
            for (var i = 0; i < data.patientGroups.length; i++) {
                element = {};
                element['patientGroupName'] = data.patientGroups[i].patientGroupName;
                element['patientCount'] = data.patientGroups[i].patientCount;
                element['totalBalance'] = data.patientGroups[i].totalBalance;
                element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
                element['IsHeader'] = true;
                reportData.push(element);                

                for (var j = 0; j < data.patientGroups[i].patients.length; j++) {
                    element = {}
                    element = angular.copy(data.patientGroups[i].patients[j]);
                    element["IsHeader"] = false;
                    element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
                    reportData.push(element);
                }

                element = {};
                element['patientCount'] = data.patientGroups[i].patientCount;
                element['totalBalance'] = data.patientGroups[i].totalBalance;
                element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
                element['IsFooter'] = true;
                element['footerPatientGroupName'] = data.patientGroups[i].patientGroupName;
                reportData.push(element); 
            }
            console.log(reportData);
            return reportData;
        }
        return [];

        //return data;
    }

    ngOnChanges(changes: SimpleChanges) {
        this.isDataLoaded = false;
        this._data$.next(changes["data"].currentValue);
    }

}
