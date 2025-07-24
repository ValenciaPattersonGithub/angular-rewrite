import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs";
import { shareReplay, catchError, map, tap } from 'rxjs/operators';


import { MicroServiceApiService } from '../../security/providers';

@Injectable()
export class LocationHttpService {

    constructor(private http: HttpClient, private microServiceApis: MicroServiceApiService) {
    }

    // param example
    //getLocationsWithDetailsByPermission(permission) {
    //    let params = new HttpParams()
    //        .set('permission', permission);

    //    return this.http.get(this.microServiceApis.getPracticesUrl() + '/api/v1/locations/detailed', { params })
    //        .pipe(
    //            map(res => <any>res)
    //        ).toPromise();
    //}

    getLocationsWithDetailsByPermissionsObservable(permission) {
        return this.http.get(this.microServiceApis.getPracticesUrl() + '/api/v1/locations/detailed/' + permission)
            .pipe(
                map(res => <any>res)
            );
    }

};
