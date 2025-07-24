import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { CoreModule } from '../core.module';
import { SoarResponse } from '../models/core/soar-response';
import { Observable } from 'rxjs';
import { FeeScheduleDto } from 'src/insurance/fee-schedule/fee-schedule-dtos';



@Injectable({
    providedIn: CoreModule
})
/**
 * FeeScheduleHttpService is responsible for making HTTP requests related to fee schedules.
 * It uses the HttpClient to communicate with the backend API.
 */
export class FeeScheduleHttpService {

  constructor(
        @Inject('SoarConfig') private soarConfig: any,
        private httpClient: HttpClient
    ) { }
  
    requestFeeScheduleById(args: { feeScheduleId: string }): Observable<SoarResponse<FeeScheduleDto>>  {      
        return this.httpClient.get<SoarResponse<FeeScheduleDto>>(`${this.soarConfig.insuranceSapiUrl}/feeschedule/${args.feeScheduleId}`);
    }
    
    updateFeeSchedule(feeScheduleDto: FeeScheduleDto): Observable<SoarResponse<FeeScheduleDto>> {
        return this.httpClient.put<SoarResponse<FeeScheduleDto>>(`${this.soarConfig.insuranceSapiUrl}/feeschedule`, feeScheduleDto);        
    }

}

