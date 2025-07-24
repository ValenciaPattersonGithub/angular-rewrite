import { HttpClient, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { CoreModule } from "../core.module";
import { SoarResponse } from "../models/core/soar-response";
import { EraHeaderDto, EraPaymentDto } from "../models/era/soar-era-dtos.model";

export enum EraHeaderSortColumn {
    PayDate = 0,
    Carrier = 1,
    EraPayer = 2,
    PaymentNumber = 3,
    Amount = 4,
    Status = 5,
    IsAutoMatched = 6
}

export class RequestEraArgs {
    isProcessed?: boolean;
    selectedLocations: number[];
    sortOn: EraHeaderSortColumn = EraHeaderSortColumn.Amount;
    skip: number = 0;
    take: number = 1000;
    ascending: boolean = true;
}

@Injectable({
    providedIn: CoreModule
})
export class SoarEraHttpService {

    constructor(
        @Inject('SoarConfig') private soarConfig: any,
        private httpClient: HttpClient
    ) { }

    loadNewEras(): Observable<void> {
        return this.httpClient.post(`${this.soarConfig.insuranceSapiUrl}/accounts/eras/load`, null).pipe(map(_ => void 0));
    }

    requestEraList(args: RequestEraArgs): Observable<SoarResponse<EraHeaderDto[]>> {
        return this.httpClient.post<SoarResponse<EraHeaderDto[]>>(`${this.soarConfig.insuranceSapiUrl}/accounts/eras/v3`, args);
    }

    requestEraClaimPayments(args: { eraId: string }): Observable<SoarResponse<EraPaymentDto>> {
        return this.httpClient.get<SoarResponse<EraPaymentDto>>(`${this.soarConfig.insuranceSapiUrl}/insurance/eras/${args.eraId}/claimPayment`);
    }

    toggleIsProcessed(args: { eraId: number, isProcessed: boolean }): Observable<SoarResponse<EraHeaderDto>> {

        let params = new HttpParams()
            .set("isProcessed", args.isProcessed.toString());

        return this.httpClient.put<SoarResponse<EraHeaderDto>>(`${this.soarConfig.insuranceSapiUrl}/accounts/eras/${args.eraId}/toggleIsProcessed`, null, { params });
    }
}
