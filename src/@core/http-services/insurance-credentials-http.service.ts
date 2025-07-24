import { Inject, Injectable } from '@angular/core';
import { CoreModule } from 'src/@core/core.module';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { InsuranceCredentialsDto } from '../models/integration-control.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export class RequestCredentialArgs {
  locationId: number;
  vendor:string;
}

@Injectable({
  providedIn: CoreModule
})

export class InsuranceCredentialsHttpService {

  constructor(
    @Inject('SoarConfig') private soarConfig: any,
    private httpClient: HttpClient
) { }

  requestInsuranceCredentials(args: RequestCredentialArgs): Observable<InsuranceCredentialsDto | unknown> {
    return this.httpClient.get<InsuranceCredentialsDto>(`${this.soarConfig.claimApiUrl}/api/v2/locations/${args.locationId}/claim-attachment/vendor/${args.vendor}/configuration`)
      .pipe(
        catchError((error) => {
          if (error.status === 404)
            return of(null);

          throw error; // Re-throw other errors
        })
      );
  }

  processInsuranceCredentialsDto(args:RequestCredentialArgs, credentials: InsuranceCredentialsDto): Observable<SoarResponse<InsuranceCredentialsDto>> {
    return this.httpClient.post<SoarResponse<InsuranceCredentialsDto>>(`${this.soarConfig.claimApiUrl}/api/v2/locations/${args.locationId}/claim-attachment/vendor/${args.vendor}/configuration`, credentials);
  }
}


