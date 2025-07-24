import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ReportsHelper } from '../reports-helper';
declare var angular: angular.IAngularStatic;

@Component({
    selector: 'treatment-plan-performance-migration',
    templateUrl: './treatment-plan-performance-migration.component.html',
    styleUrls: ['./treatment-plan-performance-migration.component.scss']
})
export class TreatmentPlanPerformanceMigrationComponent implements OnInit {
    @Input() data: any;
    reportData: any = [];
    isDataLoaded = false;
    ofcLocation = '';
    @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;

    constructor(public reportsHelper: ReportsHelper) { }

    ngOnInit(): void {
    }

    ngOnChanges() {
        this.refreshData();
    }

    refreshData() {
        if (this.data && this.data.Patients && this.data.Patients.length > 0) {
            this.isDataLoaded = true;
            this.reportData = [];
            var element = {};
            for (var i = 0; i < this.data.Patients.length; i++) {
                for (var j = 0; j < this.data.Patients[i].TreatmentPlans.length; j++) {
                    element = angular.copy(this.data.Patients[i].TreatmentPlans[j]);
                    if (j == 0) {
                        element['IsFirstTP'] = true;
                        element['Patient'] = this.data.Patients[i].Patient;

                        /*element['isPatientChanged'] = true;*/
                    }
                    for (var k = 0; k < this.data.Patients[i].TreatmentPlans[j].Stages.length; k++) {

                        if (k == 0)
                            element['isFirstStage'] = true;
                        else
                            element = {};
                        element['Stage'] = "Stage " + this.data.Patients[i].TreatmentPlans[j].Stages[k].Stage;
                        element['StageChanged'] = true;
                        for (var l = 0; l < this.data.Patients[i].TreatmentPlans[j].Stages[k].Services.length; l++) {
                            if (l == 0)
                                element['isFirstService'] = true;
                            else
                                element = angular.copy(this.data.Patients[i].TreatmentPlans[j]);
                            element['ServiceDescription'] = this.data.Patients[i].TreatmentPlans[j].Stages[k].Services[l].Description;
                            element['ServiceToothArea'] = this.data.Patients[i].TreatmentPlans[j].Stages[k].Services[l].ToothArea;
                            element['ServiceLocation'] = this.data.Patients[i].TreatmentPlans[j].Stages[k].Services[l].Location;
                            element['ServiceProvider'] = this.data.Patients[i].TreatmentPlans[j].Stages[k].Services[l].Provider;
                            element['ServiceCodeStatus'] = this.data.Patients[i].TreatmentPlans[j].Stages[k].Services[l].ServiceCodeStatus;
                            element['ServiceFee'] = this.data.Patients[i].TreatmentPlans[j].Stages[k].Services[l].Fee;
                            element['ServiceAllowedAmount'] = this.data.Patients[i].TreatmentPlans[j].Stages[k].Services[l].AllowedAmount;
                            element['ServiceAppointmentDate'] = this.data.Patients[i].TreatmentPlans[j].Stages[k].Services[l].AppointmentDate;
                            this.reportData.push(element);
                        }
                    }
                }
                element = { 'TotalProposed': this.data.Patients[i].TotalProposed, 'IsTotalProposed': true, 'TotalAllowedAmtProposed': this.data.Patients[i].TotalAllowedAmtProposed };
                this.reportData.push(element);
                element = { 'TotalAccepted': this.data.Patients[i].TotalAccepted, 'IsTotalAccepted': true, 'TotalAllowedAmtAccepted': this.data.Patients[i].TotalAllowedAmtAccepted };
                this.reportData.push(element);
                element = { 'TotalCompleted': this.data.Patients[i].TotalCompleted, 'IsTotalCompleted': true, 'TotalAllowedAmtCompleted': this.data.Patients[i].TotalAllowedAmtCompleted };
                this.reportData.push(element);
                element = { 'TotalReferred': this.data.Patients[i].TotalReferred, 'IsTotalReferred': true, 'TotalAllowedAmtReferred': this.data.Patients[i].TotalAllowedAmtReferred };
                this.reportData.push(element);
                element = { 'TotalReferredCompleted': this.data.Patients[i].TotalReferredCompleted, 'IsTotalReferredCompleted': true, 'TotalAllowedAmtReferredCompleted': this.data.Patients[i].TotalAllowedAmtReferredCompleted };
                this.reportData.push(element);
                element = { 'TotalRejected': this.data.Patients[i].TotalRejected, 'IsTotalRejected': true, 'TotalAllowedAmtRejected': this.data.Patients[i].TotalAllowedAmtRejected };
                this.reportData.push(element);
            }
            element = { 'TotalProposed': this.data.TotalProposed, 'IsFinalTotalProposed': true, 'TotalAllowedAmtProposed': this.data.TotalAllowedAmtProposed };
            this.reportData.push(element);
            element = { 'TotalAccepted': this.data.TotalAccepted, 'IsFinalTotalAccepted': true, 'TotalAllowedAmtAccepted': this.data.TotalAllowedAmtAccepted };
            this.reportData.push(element);
            element = { 'TotalCompleted': this.data.TotalCompleted, 'IsFinalTotalCompleted': true, 'TotalAllowedAmtCompleted': this.data.TotalAllowedAmtCompleted };
            this.reportData.push(element);
            element = { 'TotalReferred': this.data.TotalReferred, 'IsFinalTotalReferred': true, 'TotalAllowedAmtReferred': this.data.TotalAllowedAmtReferred };
            this.reportData.push(element);
            element = { 'TotalReferredCompleted': this.data.TotalReferredCompleted, 'IsFinalTotalReferredCompleted': true, 'TotalAllowedAmtReferredCompleted': this.data.TotalAllowedAmtReferredCompleted };
            this.reportData.push(element)
            element = { 'TotalRejected': this.data.TotalRejected, 'IsFinalTotalRejected': true, 'TotalAllowedAmtRejected': this.data.TotalAllowedAmtRejected };
            this.reportData.push(element);
        }
    }
}
