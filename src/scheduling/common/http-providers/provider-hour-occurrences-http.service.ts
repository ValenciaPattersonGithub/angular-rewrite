import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable} from "rxjs";
import { shareReplay, catchError, map, tap } from 'rxjs/operators';

import { MicroServiceApiService } from '../../../security/providers';

@Injectable()
export class ProviderHourOccurrencesHttpService {
    constructor(private http: HttpClient, private microServiceApis: MicroServiceApiService) {
    }
    
    getProviderHourOccurrences(dates, locationIds) {
        let params = new HttpParams();
        // handling Array
        dates.forEach(thisDate => {
            params = params.append('dates', thisDate);
        });
        // handling Array
        locationIds.forEach(id => {
            params = params.append('locationIds', id);
        });

        return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/providerroomoccurrences/forschedule/withidealdays', { params })
            .pipe(
                map(res => <any>res)
            ).toPromise();
    }
};
