
import { Injectable, Inject } from '@angular/core';

// The purpose of this file is to get the defined API Urls for the application so that they can be used with HTTP requests.
// MICRO SERVICE URLs ONLY

@Injectable()
export class MicroServiceApiService {
    private enterpriseUrl: string;
    private stsApi: string;
    private domainApi: string;
    private claimApi: string;
    private eraApi: string;
    private fileApi: string;
    private rteApi: string;
    private rxApi: string;
    private schedulingApi: string;
    private practicesApi: string;
    private insuranceApi: string;
    private treatmentPlansApi: string;
    private serverlessSignalRApi: string;
    private reportingApi: string;
    private enterpriseApiUrl: string;
    private prescriptionsApiUrl: string;
    private blueImagingApiUrl: string;
    private clinicalApi: string;
    private sapiSchedulingApi: string;
    private insuranceSapi: string;

    constructor(@Inject('MicroServiceApiUrlConfig') private microServiceApiUrlConfig) {
        this.enterpriseUrl = microServiceApiUrlConfig[0].enterpriseApiUrl;
        this.stsApi = microServiceApiUrlConfig[0].stsApiUrl;
        this.domainApi = microServiceApiUrlConfig[0].domainApiUrl;
        this.claimApi = microServiceApiUrlConfig[0].claimApiUrl;
        this.eraApi = microServiceApiUrlConfig[0].eraApiUrl;
        this.fileApi = microServiceApiUrlConfig[0].fileApiUrl;
        this.rteApi = microServiceApiUrlConfig[0].rteApiUrl;
        this.rxApi = microServiceApiUrlConfig[0].rxApiUrl;
        this.schedulingApi = microServiceApiUrlConfig[0].schedulingApimUrl;
        this.practicesApi = microServiceApiUrlConfig[0].practicesApimUrl;
        this.insuranceApi = microServiceApiUrlConfig[0].insuranceApiUrl;
        this.treatmentPlansApi = microServiceApiUrlConfig[0].treatmentPlansApiUrl;
        this.serverlessSignalRApi = microServiceApiUrlConfig[0].serverlessSignalRApiUrl;
        this.reportingApi = microServiceApiUrlConfig[0].reportingApiUrl;
        this.enterpriseApiUrl = microServiceApiUrlConfig[0].pdcoEnterpriseApiUrl;
        this.prescriptionsApiUrl = microServiceApiUrlConfig[0].prescriptionsApiUrl;
        this.blueImagingApiUrl = microServiceApiUrlConfig[0].blueImagingApiUrl;
        this.blueImagingApiUrl = microServiceApiUrlConfig[0].blueImagingApiUrl;
        this.clinicalApi = microServiceApiUrlConfig[0].clinicalApiUrl;
        this.sapiSchedulingApi = microServiceApiUrlConfig[0].sapiSchedulingApiUrl;
        this.insuranceSapi = microServiceApiUrlConfig[0].insuranceSapiUrl;
    }

    getEnterpriseUrl() {
        return this.enterpriseUrl;
    }
    getStsUrl() {
        return this.stsApi;
    }
    getDomainUrl() {
        return this.domainApi;
    }
    getClaimUrl() {
        return this.claimApi;
    }
    getEraUrl() {
        return this.eraApi;
    }
    getFileUrl() {
        return this.fileApi;
    }
    getRteUrl() {
        return this.rteApi;
    }
    getRxUrl() {
        return this.rxApi;
    }
    getSchedulingUrl() {
        return this.schedulingApi;
    }
    getPracticesUrl() {
        return this.practicesApi;
    }
    getInsuranceUrl() {
        return this.insuranceApi;
    }
    getTreatmentPlansUrl() {
        return this.treatmentPlansApi;
    }
    getServerlessSignalRUrl() {
        return this.serverlessSignalRApi;
    }
    getReportingUrl() {
        return this.reportingApi;
    }
    getEnterpriseApiUrl() {
        return this.enterpriseApiUrl;
    }
    getPrescriptionsApiUrl() {
        return this.prescriptionsApiUrl;
    }
    getBlueImagingApiUrl() {
        return this.blueImagingApiUrl;
    }
    getClinicalApiUrl() {
        return this.clinicalApi;
    }
    getSapiSchedulingApi() {
        return this.sapiSchedulingApi;
    }
    getInsuranceSapiUrl() {
        return this.insuranceSapi;
    }
}