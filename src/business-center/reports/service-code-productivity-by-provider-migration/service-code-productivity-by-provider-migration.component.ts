import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'service-code-productivity-by-provider-migration',
    templateUrl: './service-code-productivity-by-provider-migration.component.html',
    styleUrls: ['./service-code-productivity-by-provider-migration.component.scss']
})
export class ServiceCodeProductivityByProviderMigrationComponent implements OnInit {
    @Input() data: any;
    reportData: any = [];
    isDataLoaded = false;
    constructor() { }

    ngOnInit(): void {
    }

    refreshData() {
        if (this.data) {
            if (!this.data.isSummaryView)
                this.data.isSummaryView = false;
            
            this.isDataLoaded = true;
            this.reportData = this.data;
        }
    }

    ngOnChanges() {
        this.refreshData();
    }
}
