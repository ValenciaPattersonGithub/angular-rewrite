import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'fee-schedule-analysis-by-carrier-migration',
    templateUrl: './fee-schedule-analysis-by-carrier-migration.component.html',
    styleUrls: ['./fee-schedule-analysis-by-carrier-migration.component.scss']
})

export class FeeScheduleAnalysisByCarrierMigrationComponent implements OnInit {
    @Input() data: any;
    reportData: any = [];
    isDataLoaded = false;
    constructor() { }

    ngOnInit(): void {
    }

    refreshData() {
        if (this.data) {
            this.isDataLoaded = true;
            this.reportData = this.data;
        }
    }

    ngOnChanges() {
        this.refreshData();
    }

}
