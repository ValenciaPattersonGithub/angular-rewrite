import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
declare var angular: angular.IAngularStatic;
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'benefit-plans-by-fee-schedule-migration',
    templateUrl: './benefit-plans-by-fee-schedule-migration.component.html',
    styleUrls: ['./benefit-plans-by-fee-schedule-migration.component.scss']
})
export class BenefitPlansByFeeScheduleMigrationComponent implements OnInit {
    @Input() data: any;
    reportData: any = [];
    isDataLoaded = false;
    constructor(private translate: TranslateService) { }

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