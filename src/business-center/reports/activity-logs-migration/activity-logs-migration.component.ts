import { Component, OnInit, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: 'activity-logs-migration',
    templateUrl: './activity-logs-migration.component.html',
    styleUrls: ['./activity-logs-migration.component.scss']
})
export class ActivityLogsMigrationComponent implements OnInit {
    @Input() data: any;
    reportData: any = [];
    isDataLoaded = false;
    constructor(private translate: TranslateService) { }

    ngOnInit(): void {
    }

    refreshData() {
        if (this.data && this.data.ActivityEvents && this.data.ActivityEvents.length>0) {
            this.isDataLoaded = true;
            this.reportData = this.data;
        }
    }

    ngOnChanges() {
        this.refreshData();
    }

    
}