import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'carrier-migration',
    templateUrl: './carrier-migration.component.html',
    styleUrls: ['./carrier-migration.component.scss']
})
export class CarrierMigrationComponent implements OnInit {
    @Input() data: any;
    isDataLoaded = false;
    showFilterMessage = true;
    setFiltersMessage = "Select filters to begin.";
    noResultsMessage = "No Data Matches Report Criteria.";
    shownoResultsMessage = false;
    private _data$ = new BehaviorSubject<any>(null);
    public reportData$: Observable<any>;

    constructor(private translate: TranslateService) { }

    ngOnInit(): void {
        this.reportData$ = this._data$.pipe(
            map(data => CarrierMigrationComponent.refreshData(data)),
            tap(() => this.isDataLoaded = true),
            shareReplay(1)
        );
    }


    public static refreshData(data) {  
        return data;
    }

    ngOnChanges(changes: SimpleChanges) {
        this.isDataLoaded = false;
        this._data$.next(changes["data"].currentValue);
        if (this.data?.carriers?.length === 0) {
            this.shownoResultsMessage = true;
            this.showFilterMessage = false;
        }
        if (this.data?.carriers?.length > 0) {
            this.showFilterMessage = false;
            this.shownoResultsMessage = false;
        }
    }

}
