import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BenefitPlanDto } from 'src/patient/common/models/benefit-plan-dto.model';
import { CoreModule } from '../core.module';
import { SoarResponse } from '../models/core/soar-response';
import { PatientBenefitPlanDto, PatientBenefitPlanLiteDto } from '../models/patient-benefit-plan-dtos.model';
import { BenefitPlanForAddInsuranceDto } from 'src/patient/common/models/benefit-plan-for-add-insurance-dto.model';

@Injectable({
    providedIn: CoreModule
})
export class SoarPatientBenefitPlanHttpService {

    constructor(
        @Inject('SoarConfig') private soarConfig: any,
        private httpClient: HttpClient
    ) { }
    
    requestActiveBenefitPlans(): Observable<SoarResponse<BenefitPlanDto[]>>  {
        return this.httpClient.get<SoarResponse<BenefitPlanDto[]>>(`${this.soarConfig.insuranceSapiUrl}/insurance/BenefitPlan/Active`);
    }

    requestBenefitPlansForAddInsurance(): Observable<SoarResponse<BenefitPlanForAddInsuranceDto[]>>  {
        return this.httpClient.get<SoarResponse<BenefitPlanForAddInsuranceDto[]>>(`${this.soarConfig.insuranceSapiUrl}/insurance/benefitPlansForAddInsurance`);
    }

    requestPatientBenefitPlans(args: { patientId: string }): Observable<SoarResponse<PatientBenefitPlanDto[]>>  {
        return this.httpClient.get<SoarResponse<PatientBenefitPlanDto[]>>(`${this.soarConfig.insuranceSapiUrl}/patients/${args.patientId}/benefitplan`);
    }

    requestPatientBenefitPlansMinimal(args: { patientId: string }): Observable<SoarResponse<PatientBenefitPlanLiteDto[]>>  {
        return this.httpClient.get<SoarResponse<PatientBenefitPlanLiteDto[]>>(`${this.soarConfig.insuranceSapiUrl}/patients/${args.patientId}/benefitplan/minimal`);
    }

    requestAvailablePolicyHolders(args: { accountId: string }): Observable<SoarResponse<any[]>>  {
        let params = new HttpParams()
            .set("accountId", args.accountId.toString());
        return this.httpClient.get<SoarResponse<any[]>>(`${this.soarConfig.insuranceSapiUrl}//patients/policyHolderBenefitPlan/AvailablePolicyHolders/`, {params});
    }

    // creates a list of patient benefit plans
    createPatientBenefitPlans(args: { patientId: string }, patientBenefitPlanDtos: PatientBenefitPlanDto[]): Observable<SoarResponse<PatientBenefitPlanDto[]>> {
        return this.httpClient.post<SoarResponse<PatientBenefitPlanDto[]>>(`${this.soarConfig.insuranceSapiUrl}/patients/${args.patientId}/benefitplan`, patientBenefitPlanDtos);
    }
}

