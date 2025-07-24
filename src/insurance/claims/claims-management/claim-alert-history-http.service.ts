import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { EClaimEventDTO } from './claim-alert-history.models';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { CoreModule } from 'src/@core/core.module';

@Injectable({
  providedIn: CoreModule
})
export class ClaimAlertHistoryHttpService {

  constructor(
    @Inject('SoarConfig') private soarConfig: any,
      private httpClient: HttpClient
  ) { }
  
  // list of EClaimEventDTO (claim status) for a particular Claim
  requestEClaimEvents(args: { claimId: string }): Observable<SoarResponse<EClaimEventDTO[]>> {
    return this.httpClient.get<SoarResponse<EClaimEventDTO[]>>(    
      `${this.soarConfig.insuranceSapiUrl}/insurance/claims/eClaimEvents/${args.claimId}`);
  }
}
