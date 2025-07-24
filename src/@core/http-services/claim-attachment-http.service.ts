import { Inject, Injectable } from '@angular/core';
import { CoreModule } from 'src/@core/core.module';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import {EAttachmentFileTypesDto } from '../models/claim/attachment-document-type.model';

export class RequestClearingHouseArgs {
  locationId: number;
  vendor:string // ClearingHouseVendor.DentalXChange = 3
}

@Injectable({
  providedIn: CoreModule
})

export class ClaimAttachmentHttpService {

  constructor(
    @Inject('SoarConfig') private soarConfig: any,
    private httpClient: HttpClient
) { } 

  getAttachmentTypes(args:RequestClearingHouseArgs): Observable<EAttachmentFileTypesDto> {
    return this.httpClient.get<EAttachmentFileTypesDto>(`${this.soarConfig.claimApiUrl}/api/v2/locations/${args.locationId}/claim-attachment/vendor/${args.vendor}/documenttypes`);
  }
}

