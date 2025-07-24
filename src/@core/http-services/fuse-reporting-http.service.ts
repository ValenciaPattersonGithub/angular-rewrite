import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

export enum ReportRoute {
    PatientByBenefitPlans = "/api/v1/reports/locations/patients/benefit-plans",
    PatientsByFlagsBeta = "/api/v1/reports/master-patient-alerts/patients",
    PatientsByPatientGroupsBeta = "/api/v1/reports/patient-groups/patients",
    BenefitPlansByInsurancePaymentTypes = "/api/v1/reports/payment-types/benefit-plans",
    BenefitPlansByFeeScheduleBeta = "/api/v1/reports/benefit-plans",
    BenefitPlansByCarrierBeta = "/api/v1/reports/carriers/benefit-plans",
    NewPatientsSeenBeta = "/api/v1/reports/locations/service-transactions/patients/new",
    Carrier = "/api/v1/reports/carriers",
}

@Injectable({
    providedIn: 'root'
})
export class FuseReportingHttpService {

    private modal: any;
    
    constructor(
        @Inject('SoarConfig') private soarConfig: any,
        @Inject('$uibModal') private uibModal,
        private httpClient: HttpClient,
    ) { 
    }

    ngAfterContentInit() {
        this.modal = this.getLoadingModal();
    }

    //getReportData(queryDto: {[param: string]: string | readonly string[];}, reportName: "PatientsByBenefitPlanBeta"): Observable<any>;
    getReportData<T>(queryDto: { [param: string]: string | readonly string[]; }, reportName: keyof typeof ReportRoute): Observable<{ Value: T }> {
        this.modal = this.getLoadingModal();
        const url = this.soarConfig.fuseNewReportingApiUrl + ReportRoute[reportName];
        const params = new HttpParams({ fromObject: queryDto });
        return this.httpClient.get<{ Value: T }>(url, { params })
            .pipe(
                // Close loading modal when request completes (whether successful or with error)
                finalize(() => this.modal.close())
            );
    }

    getLoadingModal = () => {
        return this.uibModal.open({
          template:
            '<div>' +
            '  <i id="resolveLoadingSpinner" class="fa fa-spinner fa-4x fa-spin"></i><br/>' +
            '</div>',
          size: 'sm',
          windowClass: 'modal-loading',
          backdrop: 'static',
          keyboard: false,
        });
      };
}

