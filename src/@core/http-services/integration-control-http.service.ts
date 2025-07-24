import { Injectable } from '@angular/core';
import { CoreModule } from 'src/@core/core.module';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { MicroServiceApiService } from 'src/security/providers/micro-service-api.service';
import { IntegrationControlDto, IntegrationControlPutDto } from '../models/integration-control.model';
import { SoarResponse } from '../models/core/soar-response';

export class RequestIntegrationControlsArgs {
  locationId: number;
  feature:string;
  vendor:string; 
}

@Injectable({
  providedIn: CoreModule
})

export class IntegrationControlHttpService {
  constructor(    
    private microServiceApis: MicroServiceApiService,
    private httpClient: HttpClient
) { }

  requestIntegrationControls(args: { locationId: number }): Observable<SoarResponse<IntegrationControlDto[]>> {
    return this.httpClient.get<SoarResponse<IntegrationControlDto[]>>(`${this.microServiceApis.getInsuranceUrl()}/api/v1/integration-control/locations/${args.locationId}`);
  }
  
  processIntegrationControls(args: { locationId: number }, integrationControlPutDto: IntegrationControlPutDto): Observable<SoarResponse<IntegrationControlPutDto>> {
    return this.httpClient.put<SoarResponse<IntegrationControlPutDto>>(`${this.microServiceApis.getInsuranceUrl()}/api/v1/integration-control/locations/${args.locationId}`, integrationControlPutDto);
  }

  deleteIntegrationControls(args: RequestIntegrationControlsArgs ): Observable<SoarResponse<IntegrationControlPutDto>> {
    return this.httpClient.delete<SoarResponse<IntegrationControlPutDto>>(`${this.microServiceApis.getInsuranceUrl()}/api/v1/integration-control/locations/${args.locationId}/features/${args.feature}/vendors/${args.vendor}`);
  }
}
 