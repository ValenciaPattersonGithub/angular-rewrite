import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { PreventiveCareItems } from 'src/business-center/practice-settings/clinical/preventive-care-setup/preventive-care.model';
import { PreventiveServices, ServiceCodeModel } from 'src/business-center/service-code/service-code-model';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { MicroServiceApiService } from 'src/security/providers';
@Injectable({
    providedIn: 'root'
})
export class PreventiveCareService {

    private fetchFromPracticesApi = false;
    private baseUrl = '';
    preventiveCareItems: PreventiveCareItems[] = [];
    hasAccessForServiceCode = { Create: false, Delete: false, Edit: false, View: false };
    hasAccessForServiceType = { Create: false, Delete: false, Edit: false, View: false };
    hasAccessForServiceTypeCreate = false;
    hasAccessForServiceTypeEdit = false;
    hasAccessForServiceTypeView = false;
    hasAccessForServiceCodeCreate = false;
    hasAccessForServiceCodeDelete = false;
    hasAccessForServiceCodeView = false;

    constructor(
        private httpClient: HttpClient,
        @Inject('SoarConfig') private soarConfig,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('localize') private localize,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('patSecurityService') private patSecurityService,
        private microServiceApis: MicroServiceApiService,
        featureFlagService: FeatureFlagService) {
        featureFlagService.getOnce$(FuseFlag.UsePracticeApiForPreventiveServiceTypes)
            .subscribe(value => {
                this.fetchFromPracticesApi = value;
                this.baseUrl = this.fetchFromPracticesApi
                    ? `${String(this.microServiceApis.getPracticesUrl())}/api/v1/preventiveServiceTypes`
                    : `${String(this.soarConfig.domainUrl)}/PreventiveServiceTypes`;
            })
    }

    serviceTypeAuthCreateAccess = (): boolean => {
        this.hasAccessForServiceTypeCreate = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bprsvc-add');
        return this.hasAccessForServiceTypeCreate;
    };

    serviceTypeAuthEditAccess = (): boolean => {
        this.hasAccessForServiceTypeEdit = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bprsvc-edit');
        return this.hasAccessForServiceTypeEdit;
    };

    serviceTypeAuthViewAccess = (): boolean => {
        this.hasAccessForServiceTypeView = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bprsvc-view');
        return this.hasAccessForServiceTypeView;
    };

    accessForServiceType = () => {
        if (this.serviceTypeAuthViewAccess()) {
            this.hasAccessForServiceType.Create = this.serviceTypeAuthCreateAccess();
            this.hasAccessForServiceType.Edit = this.serviceTypeAuthEditAccess();
            this.hasAccessForServiceType.View = true;
        }
        return this.hasAccessForServiceType;
    };

    serviceCodeAuthCreateAccess = (): boolean => {
        this.hasAccessForServiceCodeCreate = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bprsvc-asvcs');
        return this.hasAccessForServiceCodeCreate;
    };

    serviceCodeAuthDeleteAccess = (): boolean => {
        this.hasAccessForServiceCodeDelete = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bprsvc-dsvcs');
        return this.hasAccessForServiceCodeDelete;
    };

    serviceCodeAuthViewAccess = (): boolean => {
        this.hasAccessForServiceCodeView = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bprsvc-vsvcs');
        return this.hasAccessForServiceCodeView;
    };

    accessForServiceCode = () => {
        if (this.serviceCodeAuthViewAccess()){
            this.hasAccessForServiceCode.Create = this.serviceCodeAuthCreateAccess();
            this.hasAccessForServiceCode.Delete = this.serviceCodeAuthDeleteAccess();
            this.hasAccessForServiceCode.View = true;
        }
        return this.hasAccessForServiceCode;
    };

    prevCareItems = (): Promise<PreventiveCareItems[]> => {
        return new Promise((resolve, reject) => {
            if (this.hasAccessForServiceType?.View) {
                if (this.fetchFromPracticesApi) {
                    const url = this.baseUrl;
                    this.httpClient.get<SoarResponse<PreventiveCareItems[]>>(url)
                   .toPromise()
                        .then(data => {
                            this.preventiveCareItems = data.Value;
                            resolve(this.preventiveCareItems);
                        })
                        .catch(err => {
                            this.toastrFactory.error(this.localize.getLocalizedString('Failed to load list of {0}. Refresh the page to try again.', ['Preventive Care Items']), this.localize.getLocalizedString('Server Error'));
                            reject(err);
                        });
                } else {
                    this.preventiveCareItems = this.referenceDataService.get(this.referenceDataService.entityNames.preventiveServiceTypes);
                    resolve(this.preventiveCareItems);
                }
            } else {
                resolve([]); 
            }
        })
    };

    AddPreventiveServices = (preventiveServiceTypeId, selectedCodes): Promise<PreventiveServices> => {
        return new Promise((resolve, reject) => {
            const url = `${this.baseUrl}/${String(preventiveServiceTypeId)}/services`;
            this.httpClient.post(url, selectedCodes)
                .toPromise()
                .then(res => {
                    this.toastrFactory.success(this.localize.getLocalizedString('{0} has been added.', ['Preventive Care Services']), this.localize.getLocalizedString('Success'));
                    resolve(res);
                }, err => {
                    this.toastrFactory.error(this.localize.getLocalizedString('Failed to add the list of {0}. Refresh the page to try again.', ['Preventive Care Services']), this.localize.getLocalizedString('Server Error'));
                    reject(err);
                })
        });
    };

    GetPreventiveServicesForServiceType = (preventiveServiceTypeId) => {
        return new Promise((resolve, reject) => {
            const url = `${this.baseUrl}/${String(preventiveServiceTypeId)}/services`;
            this.httpClient.get<PreventiveServices[]>(url)
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => {
                    this.toastrFactory.error(this.localize.getLocalizedString('Failed to load the list of {0}. Refresh the page to try again.', ['Preventive Care Services']), this.localize.getLocalizedString('Server Error'));
                    reject(err);
                })
        });
    };

    GetPreventiveServicesForServiceCode = (serviceCodeId) => {
        return new Promise((resolve, reject) => {
            const url = `${this.baseUrl}/services/${String(serviceCodeId)}`;
            this.httpClient.get<ServiceCodeModel[]>(url)
                .toPromise()
                .then(res => {
                    resolve(res);
                }, err => {
                    this.toastrFactory.error(this.localize.getLocalizedString('Failed to load the list of {0}. Refresh the page to try again.', ['Preventive Care Services']), this.localize.getLocalizedString('Server Error'));
                    reject(err);
                })
        });
    };

    UpdatePreventiveService = (preventiveServiceType) => {
        return new Promise((resolve, reject) => {
            const url = this.baseUrl;
            this.httpClient.put(url, preventiveServiceType)
                .toPromise()
                .then(res => {
                    this.toastrFactory.success(this.localize.getLocalizedString('{0} has been updated.', ['Preventive Care Service Type']), this.localize.getLocalizedString('Success'));
                    resolve(res);
                }, err => {
                    this.toastrFactory.error(this.
                        localize.getLocalizedString('Failed to update the {0}. Refresh the page to try again.', ['Preventive Care Service Type']), this.localize.getLocalizedString('Server Error'));
                    reject(err);
                })
        });
    };

    RemovePreventiveServiceById = (preventiveServiceTypeId, preventiveServiceId) => {
        return new Promise((resolve, reject) => {
            const url = `${this.baseUrl}/${String(preventiveServiceTypeId)}/services/${String(preventiveServiceId)}`;
            this.httpClient.delete(url)
                .toPromise()
                .then(res => {
                    this.toastrFactory.success(this.localize.getLocalizedString('{0} has been removed.', ['Preventive Care Service']), this.localize.getLocalizedString('Success'));
                    resolve(res);
                }, err => {
                    this.toastrFactory.error(this.localize.getLocalizedString('Failed to remove {0}. ', ['Preventive Care Service']), this.localize.getLocalizedString('Server Error'));
                    reject(err);
                })
        });
    };

}