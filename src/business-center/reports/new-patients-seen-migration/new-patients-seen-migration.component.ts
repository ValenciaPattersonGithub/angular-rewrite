import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'new-patients-seen-migration',
    templateUrl: './new-patients-seen-migration.component.html',
    styleUrls: ['./new-patients-seen-migration.component.scss']
})
export class NewPatientsSeenMigrationComponent implements OnInit {
    @Input() data: any;
    isDataLoaded = false;
    private _data$ = new BehaviorSubject<any>(null);
    public reportData$: Observable<any>;

    constructor(private translate: TranslateService) { }

    ngOnInit(): void {
        this.reportData$ = this._data$.pipe(
            map(data => NewPatientsSeenMigrationComponent.refreshData(data)),
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
    }

}
