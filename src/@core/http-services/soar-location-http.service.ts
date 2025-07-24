import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpParams } from "@angular/common/http";
import { CoreModule } from '../core.module';
import { SoarResponse } from '../models/core/soar-response';
import { LocationDto } from '../models/location/location-dto.model';


@Injectable({
    providedIn: CoreModule
})
export class SoarLocationHttpService {

    constructor(
        @Inject('SoarConfig') private soarConfig: any,
        private httpClient: HttpClient
    ) { }

    requestPermittedLocations(args: { actionId: string }): Observable<SoarResponse<LocationDto[]>> {
        let params = new HttpParams()
            .set("ActionId", args.actionId.toString());
        return this.httpClient.get<SoarResponse<LocationDto[]>>(`${this.soarConfig.domainUrl}/locations/`,{params});        
    }
}
