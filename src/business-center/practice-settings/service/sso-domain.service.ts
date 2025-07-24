import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SsoDomainResponse {
  domainNames: string[];
  isSSOEnabled: false;
}

@Injectable({
  providedIn: 'root'
})

export class SsoDomainService {
    
  constructor(
    private httpClient: HttpClient,
    @Inject('ssoDomainServiceUrl') private ssoDomainServiceUrl: string,
  ) {}

  getSsoDomainList(practiceId: number): Observable<SsoDomainResponse> {
    const url = `${this.ssoDomainServiceUrl}/api/Domain?practiceId=${practiceId}`;

    return this.httpClient.get<SsoDomainResponse>(url).pipe(
      catchError(error => {
        console.error('Error fetching SSO domain:', error);
        return throwError(() => error);
      })
    );
  }
}
