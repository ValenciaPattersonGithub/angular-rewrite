import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CoreModule } from '../core.module';
import { SoarResponse } from '../models/core/soar-response';
import { TransactionHistoryPrintDto } from '../models/core/transaction-history/transaction-history.models';

export class RequestTransactionHistoryArgs {
    AccountId: string;
    FilterCriteria:any;
    SortCriteria:any;
    PageCount: number = 0;
    CurrentPage: number = 0;    
}

@Injectable({
    providedIn: CoreModule
})
export class SoarTransactionHistoryHttpService {

    constructor(
        @Inject('SoarConfig') private soarConfig: any,
        private httpClient: HttpClient
    ) { }
    
    requestTransactionHistory(args: RequestTransactionHistoryArgs): Observable<SoarResponse<TransactionHistoryPrintDto[]>> {
        return this.httpClient.post<SoarResponse<TransactionHistoryPrintDto[]>>(`${this.soarConfig.domainUrl}/TransactionHistory/${args.AccountId}`, args);
    }
}
