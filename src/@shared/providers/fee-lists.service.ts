import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import keys from 'lodash/keys';
import assign from 'lodash/assign';
import pick from 'lodash/pick';

import cloneDeep from 'lodash/cloneDeep';
import { AuthAccess } from '../models/auth-access.model';

export class FeeListLocationDTO {
    FeeListId: number;
    Name: string;
    DraftDate: string;
    Locations?: Array<{ Key: number, Value: string }>;
}

export class FeeListDto {
    FeeListId: number;
    Name: string;
    PublishDate: Date;
    DraftDate: Date;
    ServiceCodes: FeeListServiceCodeDto[];
    DataTag: string;
}

export class FeeListServiceCodeDto {
    FeeListServiceCodeId: number;
    FeeListId: number;
    ServiceCodeId: string;
    CdtCodeId?: string;
    CdtCodeName: string;
    Code: string;
    Description: string;
    ServiceTypeId?: string;
    ServiceTypeDescription: string;
    Fee: number;
    TaxableServiceTypeId: TaxableServiceType;
    NewFee: number;
    NewTaxableServiceTypeId: TaxableServiceType;
    IsActive: boolean;
    InactivationDate?: Date;
    DataTag: string;
}

export enum TaxableServiceType {
    NotATaxableService = 1,
    Provider = 2,
    SalesAndUse = 3
}

export class CreateFeeListServiceCodeDto implements Pick<FeeListServiceCodeDto, 'ServiceCodeId' | 'NewFee' | 'NewTaxableServiceTypeId'> {
    ServiceCodeId: string = undefined;
    NewFee: number = 0;
    NewTaxableServiceTypeId: TaxableServiceType = TaxableServiceType.NotATaxableService;
}

export class CreateFeeListDto implements Pick<FeeListDto, 'Name'> {
    Name: string = '';
    ServiceCodes: CreateFeeListServiceCodeDto[] = [];

    static reduce(instance: CreateFeeListDto): CreateFeeListDto {
        const feeListKeysToPerserve = keys(new CreateFeeListDto());
        let reducedFeeList = new CreateFeeListDto();
        assign(reducedFeeList, pick(instance, feeListKeysToPerserve));
        if (reducedFeeList.ServiceCodes && reducedFeeList.ServiceCodes.length > 0) {
            const serviceCodeKeysToPerserve = keys(new CreateFeeListServiceCodeDto());
            reducedFeeList.ServiceCodes = reducedFeeList.ServiceCodes.map((serviceCode: CreateFeeListServiceCodeDto) => {
                let reducedServiceCode = new CreateFeeListServiceCodeDto();
                assign(reducedServiceCode, pick(serviceCode, serviceCodeKeysToPerserve));
                return reducedServiceCode;
            });
        }

        return reducedFeeList;
    }
}

export class UpdateFeeListServiceCodeDto implements Pick<FeeListServiceCodeDto, 'FeeListServiceCodeId' | 'NewFee' | 'NewTaxableServiceTypeId' | 'FeeListId' | 'ServiceCodeId' | 'DataTag'> {
    FeeListServiceCodeId: number = 0;
    FeeListId: number = 0;
    DataTag: string = '';
    ServiceCodeId: string = undefined;
    NewFee: number = 0;
    NewTaxableServiceTypeId: TaxableServiceType = TaxableServiceType.NotATaxableService;
}

export class UpdateFeeListDto implements Pick<FeeListDto, 'Name' | 'FeeListId' | 'DataTag'> {
    FeeListId: number = 0;
    Name: string = '';
    ServiceCodes: UpdateFeeListServiceCodeDto[] = [];
    DataTag: string = '';

    static reduce(instance: UpdateFeeListDto): UpdateFeeListDto {
        const feeListKeysToPerserve = keys(new UpdateFeeListDto());
        let reducedFeeList = new UpdateFeeListDto();
        assign(reducedFeeList, pick(instance, feeListKeysToPerserve));
        if (reducedFeeList.ServiceCodes && reducedFeeList.ServiceCodes.length > 0) {
            const serviceCodeKeysToPerserve = keys(new UpdateFeeListServiceCodeDto());
            reducedFeeList.ServiceCodes = reducedFeeList.ServiceCodes.map((serviceCode: UpdateFeeListServiceCodeDto) => {
                let reducedServiceCode = new UpdateFeeListServiceCodeDto();
                assign(reducedServiceCode, pick(serviceCode, serviceCodeKeysToPerserve));
                return reducedServiceCode;
            });
        }

        return reducedFeeList;
    }
}

@Injectable({
    providedIn: 'root'
})
export class FeeListsService {
    public hasAccess = new AuthAccess();
    constructor(
        @Inject('SoarConfig') private soarConfig,
        @Inject('PatCacheFactory') private cacheFactory,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('localize') private localize,
        @Inject('patSecurityService') private patSecurityService,
        private httpClient: HttpClient
    ) { }

    authCreateAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-feelst-add');
    };

    authDeleteAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-feelst-delete');
    };

    authEditAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-feelst-edit');
    };

    authViewAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-feelst-view');
    };

    authAccess = () => {
        if (!this.authViewAccess()) {
        } else {
            this.hasAccess.create = this.authCreateAccess();
            this.hasAccess.delete = this.authDeleteAccess();
            this.hasAccess.update = this.authEditAccess();
            this.hasAccess.view = true;
        }
        return this.hasAccess;
    };


    create(feeList: CreateFeeListDto): Observable<SoarResponse<FeeListDto>> {
        feeList = CreateFeeListDto.reduce(feeList);

        const url = `${this.soarConfig.insuranceSapiUrl}/feelists`;

        return this.httpClient.post<SoarResponse<FeeListDto>>(url, feeList).pipe(this.clearCache());
    }

    update(feeList: UpdateFeeListDto, saveAsDraft: boolean): Observable<SoarResponse<FeeListDto>> {
        feeList = UpdateFeeListDto.reduce(feeList);

        const url = `${this.soarConfig.insuranceSapiUrl}/feelists`;
        const params = new HttpParams()
            .set('saveAsDraft', saveAsDraft.toString());

        return this.httpClient.put<SoarResponse<FeeListDto>>(url, feeList, { params }).pipe(this.clearCache());
    }

    validateName = (feeList) => {
        if (this.authCreateAccess()) {
            return new Promise((resolve, reject) => {
                let url = encodeURI(this.soarConfig.insuranceSapiUrl + '/feelists/nameUniqueness');
                const params = new HttpParams()
                    .set('name', feeList?.Name)
                    .set('excludeId', feeList?.FeeListId);

                this.httpClient.get(url, { params })
                    .toPromise()
                    .then(res => {
                        resolve(res);
                    }, err => { // Error
                        this.toastrFactory.error(this.localize.getLocalizedString('Unable to check for duplicate fee list name.'), this.localize.getLocalizedString('server error'));
                        reject(err);
                    })
            });

        }
    };

    validateNameCreate = (feeList) => {
        if (this.authCreateAccess()) {
            return new Promise((resolve, reject) => {
                let url = encodeURI(this.soarConfig.insuranceSapiUrl + '/feelists/nameUniqueness');
                let params = new HttpParams()
                    .set('name', feeList?.Name);

             this.httpClient.get(url, { params })
                    .toPromise()
                    .then(res => {
                        resolve(res);
                    }, err => { // Error
                        this.toastrFactory.error(this.localize.getLocalizedString('Unable to check for duplicate fee list name.'), this.localize.getLocalizedString('server error'));
                        reject(err);
                    })
           });

        }
    };

    new(): Observable<SoarResponse<FeeListDto>> {
        if (this.authCreateAccess()) {
            let url = encodeURI(this.soarConfig.insuranceSapiUrl + '/feelists/new');
            let response = this.httpClient.get<SoarResponse<FeeListDto>>(url).pipe(this.clearCache());
            return response;
        }
    };


    filter = (feeList) => {
        let filteredFeeList = cloneDeep(feeList);
        for (let i = filteredFeeList.ServiceCodes.length - 1; i >= 0; i--) {
            if (!filteredFeeList.ServiceCodes[i].$$Modified && (filteredFeeList.ServiceCodes[i].NewFee == filteredFeeList.ServiceCodes[i].Fee) && (filteredFeeList.ServiceCodes[i].NewTaxableServiceTypeId == filteredFeeList.ServiceCodes[i].TaxableServiceTypeId)) {
                filteredFeeList.ServiceCodes.splice(i, 1);
            }
        }
        return filteredFeeList;
    };

    save = (feeList, saveAsDraft) => {
        if (feeList.FeeListId) {
            return this.update(feeList, saveAsDraft);
        } else {
            return this.create(feeList);
        }
    };


    deleteDraft = (feeList) => {
        if (this.authDeleteAccess) {
            let feeListName = feeList.Name;
            return new Promise((resolve, reject) => {
                let url = encodeURI(this.soarConfig.insuranceSapiUrl + '/feelists/' + feeList.FeeListId);
                let params = new HttpParams();
                if (feeList) {
                    // HttpParams is immutable; all mutation operations return a new instance.
                    params = params.set('draftOnly', 'true');
                }
                this.httpClient.delete(url, { params })
                    .toPromise()
                    .then(res => {
                        this.toastrFactory.success(this.localize.getLocalizedString('Delete successful.'),
                            this.localize.getLocalizedString('Success'));
                        resolve(res);
                    }, err => { // Error
                        this.toastrFactory.error(this.
                            localize.getLocalizedString('Failed to delete the {0}. Please try again.',
                                [feeListName]),
                            this.localize.getLocalizedString('Server Error'));
                        reject(err);
                    })
            })
        }
    };


    delete = (feeList) => {
        if (this.authDeleteAccess) {
            let feeListName = feeList?.Name;
            return new Promise((resolve, reject) => {
                if (feeList) {
                    let url = encodeURI(this.soarConfig.insuranceSapiUrl + '/feelists/' + feeList.FeeListId);
                    this.httpClient.delete(url)
                        .toPromise()
                        .then(res => {
                            this.toastrFactory.success(this.localize.getLocalizedString('Delete successful.'),
                                this.localize.getLocalizedString('Success'));
                            resolve(res);
                        }, err => { // Error
                            this.toastrFactory.error(this.
                                localize.getLocalizedString('Failed to delete the {0}. Please try again.',
                                    [feeListName]),
                                this.localize.getLocalizedString('Server Error'));
                            reject(err);
                        })
                }
            })
        }
    };

    getById(feeListId, forImport: boolean = false): Observable<SoarResponse<FeeListDto>> {
        if (this.authViewAccess()) {
            const url = `${this.soarConfig.insuranceSapiUrl}/feelists/` + feeListId;
            if (forImport == true) {
                const params = new HttpParams()
                    .set('forImport', forImport.toString());
                return this.httpClient.get(url, { params });
            } else {
                return this.httpClient.get(url);
            }
        };
    }

    get(): Observable<SoarResponse<FeeListLocationDTO[]>> {
        if (this.authViewAccess()) {
            let url = encodeURI(this.soarConfig.insuranceSapiUrl + '/feelists/locations');
            return this.httpClient.get<SoarResponse<FeeListLocationDTO[]>>(url);
        }
    };

    public clearCache(): OperatorFunction<SoarResponse<FeeListDto>, SoarResponse<FeeListDto>> {
        return map((feeListDto: SoarResponse<FeeListDto>) => {
            this.clearCacheFactoryCache('ServiceCodesService');
            this.clearCacheFactoryCache('FeeListsService');

            return feeListDto;
        });
    }

    private clearCacheFactoryCache(cacheName: string) {
        let cache = this.cacheFactory.GetCache(cacheName, 'aggressive', 60000, 60000);
        if (cache)
            this.cacheFactory.ClearCache(cache);
    }
}
