import { Component, Input, OnInit } from '@angular/core';
declare var angular: angular.IAngularStatic;

@Component({
    selector: 'unassigned-unapplied-credits-migration',
    templateUrl: './unassigned-unapplied-credits-migration.component.html',
    styleUrls: ['./unassigned-unapplied-credits-migration.component.scss']
})
export class UnassignedUnappliedCreditsMigrationComponent implements OnInit {
    @Input() data: any;
    reportData: any = [];
    isDataLoaded = false;
    constructor() { }

    ngOnInit(): void {
    }

    refreshData() {
        if (this.data && this.data.ResponsiblePersonDetails && this.data.ResponsiblePersonDetails.length > 0) {
            this.isDataLoaded = false;
            this.reportData = [];
            var element = {};
            var subHeader = false;
            for (var i = 0; i < this.data.ResponsiblePersonDetails.length; i++) {
                element = {};
                element['ResponsiblePerson'] = this.data.ResponsiblePersonDetails[i].ResponsiblePerson;
                element['AccountBalance'] = this.data.ResponsiblePersonDetails[i].AccountBalance;
                element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
                element['IsHeader'] = true;
                this.reportData.push(element);
                subHeader = true;
                

                for (var j = 0; j < this.data.ResponsiblePersonDetails[i].TransactionDetails.length; j++) {

                    element = {}
                    element = angular.copy(this.data.ResponsiblePersonDetails[i].TransactionDetails[j]);
                    element["IsSubHeader"] = subHeader;
                    element["IsData"] = true;
                    element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
                    this.reportData.push(element);
                    subHeader = false;
                }
            }

            this.data.totalRecords = this.reportData.length;
            this.isDataLoaded = true;
        }
    }

    ngOnChanges() {
        this.refreshData();
    }

}
