import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PdfResponse, SoarResponse } from 'src/@core/models/core/soar-response';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})


export class ClaimsManagementHttpService {
      
  constructor(
        @Inject('SoarConfig') private soarConfig: any,
        private httpClient: HttpClient
    ) { } 
    refreshClaim(args: { claimId: string }): Observable<void> {
      if (!args.claimId) {
        throw new Error('claimId is required.');
      }
      return this.httpClient.put(
        `${this.soarConfig.insuranceSapiUrl}/insurance/claims/refresh/${args.claimId}`,
        null
      ).pipe(map(() => undefined));
    }
   
    getClaimPdf(args: { claimId: string }): Observable<PdfResponse> {
      if (!args.claimId) {
        throw new Error('claimId is required.');
      }      
      return this.httpClient.get(`${this.soarConfig.insuranceSapiUrl}/insurance/claims/pdf?claimCommondId=${args.claimId}`, {
        responseType: 'arraybuffer', // or 'blob'
        observe: 'response'
      }).pipe(
        map(response => ({
          data: response.body, // PDF binary data
          contentType: response.headers.get('Content-Type'), // e.g., 'application/pdf'
          status: response.status
        }) as PdfResponse)
      );
    }
  }

