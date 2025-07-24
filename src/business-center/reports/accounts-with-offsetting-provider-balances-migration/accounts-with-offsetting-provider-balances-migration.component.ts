import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'accounts-with-offsetting-provider-balances-migration',
    templateUrl: './accounts-with-offsetting-provider-balances-migration.component.html',
    styleUrls: ['./accounts-with-offsetting-provider-balances-migration.component.scss']
})

export class AccountWithOffsettingProviderBalancesMigrationComponent implements OnInit {
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
