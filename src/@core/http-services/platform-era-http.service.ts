import { HttpClient, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { FullEraDto } from "src/@core/models/era/full-era/full-era-dto";
import { CoreModule } from "../core.module";
import { SoarResponse } from "../models/core/soar-response";


@Injectable({
    providedIn: CoreModule
})
export class PlatformEraHttpService {

    constructor(
        @Inject('SoarConfig') private soarConfig: any,
        private httpClient: HttpClient
    ) { }

    requestFullEra(args: {practiceId: number, eraId: string}): Observable<FullEraDto> {
        return this.httpClient.get<FullEraDto>(`${this.soarConfig.eraApiUrl}/api/v1/practices/${args.practiceId}/eras/${args.eraId}`); 
    }
}
