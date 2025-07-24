import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpParams } from '@angular/common/http';
import { shareReplay, catchError, map, tap } from 'rxjs/operators';
import { MicroServiceApiService } from 'src/security/providers';
import { Observable, throwError } from 'rxjs';
import { BankAccountRequest, BankAccountResponse } from './bank-account';

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {

   constructor(private httpClient: HttpClient,
        @Inject('SoarConfig') private soarConfig) { }

    getBankAccounts = (filter: BankAccountRequest) : Observable<BankAccountResponse> =>{
        return this.httpClient.post<BankAccountResponse>(encodeURI(this.soarConfig.domainUrl + '/practice/BankAccounts'),filter)
    }
}
