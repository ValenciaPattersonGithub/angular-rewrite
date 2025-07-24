import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PreventiveCareService } from './preventive-care.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { MicroServiceApiService } from 'src/security/providers';
import { of } from 'rxjs';

let featureFlagEnabled = false;
let url = '';
const mockSoarConfig = {
    get domainUrl() {
        return 'https://localhost:35440';
    },
};


const mockMicroServiceApis = {
    getPracticesUrl: jasmine.createSpy().and.returnValue(mockSoarConfig.domainUrl)
};

let mockPatCacheFactory = {
    GetCache: jasmine.createSpy(),
    ClearCache: jasmine.createSpy()
};

let mocktoastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};

let mocklocalize = {
    getLocalizedString: () => 'translated text'
};

const mockpatSecurityService = {
    IsAuthorizedByAbbreviation: (serviceAccessAuthorization) => {
        if (serviceAccessAuthorization == "soar-biz-bprsvc-add" || serviceAccessAuthorization == "soar-biz-bprsvc-edit" || serviceAccessAuthorization == "soar-biz-bprsvc-view" || serviceAccessAuthorization == "soar-biz-bprsvc-asvcs" || serviceAccessAuthorization == "soar-biz-bprsvc-dsvcs" || serviceAccessAuthorization == "soar-biz-bprsvc-vsvcs") {
            return true;
        }
        else {
            return false;
        }
    }
};

const mockPreventiveServiceTypes = [
    {
        ServiceTypeId: '00000000-0000-0000-0000-000000000001',
        IsSystemType: false,
        IsAssociatedWithServiceCode: false,
        Description: 'Service Type 1',
    },
    {
        ServiceTypeId: '00000000-0000-0000-0000-000000000002',
        IsSystemType: false,
        IsAssociatedWithServiceCode: false,
        Description: 'Service Type 2'
    },
    {
        ServiceTypeId: '00000000-0000-0000-0000-000000000001',
        IsSystemType: true,
        IsAssociatedWithServiceCode: true,
        Description: 'Service Type 3',
    },
    {
        ServiceTypeId: '00000000-0000-0000-0000-000000000001',
        IsSystemType: false,
        IsAssociatedWithServiceCode: true,
        Description: 'Service Type 3',
    },

];

let mockreferenceDataService = {
    get: jasmine.createSpy().and.returnValue([]),
    forceEntityExecution: jasmine.createSpy().and.returnValue([]),
    entityNames: {
        feeLists: PreventiveCareService,
        preventiveServiceTypes: mockPreventiveServiceTypes
    }
};

let mockResponse = [{
    DataTag: "DataTag",
    DateModified: "DateModified",
    FailedMessage: "FailedMessage",
    PreventiveServiceId: "1",
    PreventiveServiceTypeId: "6ec72852-f227-498a-b964-87c0966f0f88",
    ServiceCodeId: "1",
    UserModified: "",
    Description: "Description"
}]

let mockResPreventiveServices = {
    DataTag: "DataTag",
    DateModified: "DateModified",
    FailedMessage: "FailedMessage",
    PreventiveServiceId: "1",
    PreventiveServiceTypeId: "6ec72852-f227-498a-b964-87c0966f0f88",
    ServiceCodeId: "1",
    UserModified: "",
    Description: "Description"
}

describe('PreventiveCareService', () => {
    let service: PreventiveCareService;
    let httpTestingController: HttpTestingController;
    let baseUrl: string;
    beforeEach((() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [],
            providers: [PreventiveCareService,
                { provide: 'SoarConfig', useValue: mockSoarConfig },
                { provide: MicroServiceApiService, useValue: mockMicroServiceApis },
                { provide: 'PatCacheFactory', useValue: mockPatCacheFactory },
                { provide: 'toastrFactory', useValue: mocktoastrFactory },
                { provide: "localize", useValue: mocklocalize },
                { provide: "patSecurityService", useValue: mockpatSecurityService },
                { provide: "referenceDataService", useValue: mockreferenceDataService },
                {
                    provide: FeatureFlagService, useValue: {
                        getOnce$: jasmine.createSpy().and.returnValue(of(featureFlagEnabled))
                    }
                }
            ]
        });

        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(PreventiveCareService);
        baseUrl = featureFlagEnabled
            ? `${mockSoarConfig.domainUrl}/api/v1/preventiveServiceTypes`
            : `${mockSoarConfig.domainUrl}/PreventiveServiceTypes`;

    }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('serviceTypeAuthCreateAccess -->', () => {
        it('should return true for create access', () => {
            spyOn(mockpatSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            const result = service.serviceTypeAuthCreateAccess();
            expect(mockpatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-biz-bprsvc-add');
            expect(result).toBe(true);
        })
    })

    describe('serviceTypeAuthEditAccess -->', () => {
        it('should return true for delete access', () => {
            spyOn(mockpatSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            const result = service.serviceTypeAuthEditAccess();
            expect(mockpatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-biz-bprsvc-edit');
            expect(result).toBe(true);
        })
    })

    describe('serviceTypeAuthViewAccess -->', () => {
        it('should return true for authView access', () => {
            spyOn(mockpatSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            const result = service.serviceTypeAuthViewAccess();
            expect(mockpatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-biz-bprsvc-view');
            expect(result).toBe(true);
        })
    })

    describe('accessForServiceType -->', () => {
        it('should call serviceTypeAuthViewAccess for every authAccess check', () => {
            service.serviceTypeAuthViewAccess = jasmine.createSpy();
            service.accessForServiceType();
            expect(service.serviceTypeAuthViewAccess).toHaveBeenCalled();
        })
        it('should call serviceTypeAuthViewAccess for every authAccess check and return hasAccessForServiceType', () => {
            service.hasAccessForServiceType = { Create: false, Delete: false, Edit: false, View: false };
            service.hasAccessForServiceType.Create = false;
            service.hasAccessForServiceType.Edit = false;
            service.hasAccessForServiceType.View = false;
            service.accessForServiceType();
            expect(service.hasAccessForServiceType.Create).toBe(true);
            expect(service.hasAccessForServiceType.Edit).toBe(true);
            expect(service.hasAccessForServiceType.View).toBe(true);
        })
    })

    describe('serviceCodeAuthCreateAccess -->', () => {
        it('should return true for create access', () => {
            spyOn(mockpatSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            const result = service.serviceCodeAuthCreateAccess();
            expect(mockpatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-biz-bprsvc-asvcs');
            expect(result).toBe(true);
        })
    })

    describe('serviceCodeAuthDeleteAccess -->', () => {
        it('should return true for delete access', () => {
            spyOn(mockpatSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            const result = service.serviceCodeAuthDeleteAccess();
            expect(mockpatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-biz-bprsvc-dsvcs');
            expect(result).toBe(true);
        })
    })

    describe('serviceCodeAuthViewAccess -->', () => {
        it('should return true for authView access', () => {
            spyOn(mockpatSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            const result = service.serviceCodeAuthViewAccess();
            expect(mockpatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-biz-bprsvc-vsvcs');
            expect(result).toBe(true);
        })
    })

    describe('accessForServiceCode -->', () => {
        it('should call serviceCodeAuthViewAccess for every authAccess check', () => {
            service.serviceCodeAuthViewAccess = jasmine.createSpy();
            service.accessForServiceCode();
            expect(service.serviceCodeAuthViewAccess).toHaveBeenCalled();
        })
        it('should call serviceCodeAuthViewAccess for every authAccess check and return hasAccessForServiceCode', () => {
            service.hasAccessForServiceCode = { Create: false, Delete: false, Edit: false, View: false };
            service.hasAccessForServiceCode.Create = false;
            service.hasAccessForServiceCode.Delete = false;
            service.hasAccessForServiceCode.View = false;
            service.accessForServiceCode();
            expect(service.hasAccessForServiceCode.Create).toBe(true);
            expect(service.hasAccessForServiceCode.Delete).toBe(true);
            expect(service.hasAccessForServiceCode.View).toBe(true);
        })
    });

    describe('AddPreventiveServices ->', () => {
        beforeEach(() => {
            url = `${baseUrl}/${mockResponse[0].PreventiveServiceTypeId}/services`;
        })

        it('should add a data and return it', () => {
            service.hasAccessForServiceCode.Create = true;
            service.AddPreventiveServices(mockResponse[0].PreventiveServiceTypeId, mockResponse[0].ServiceCodeId).then(
                res => expect(res).toEqual(mockResPreventiveServices),
                error => fail
            );
            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toEqual('POST');
            req.flush(mockResPreventiveServices);
        });

        it('should turn 404 error into user-facing error', () => {
            service.hasAccessForServiceCode.Create = true;
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';

            service.AddPreventiveServices(mockResponse[0].PreventiveServiceTypeId, mockResponse[0].ServiceCodeId).then(
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(url);
            // respond with a 404 and the error message in the body
            req.flush(msg, mockErrorResponse);
        });
    });

    describe('GetPreventiveServicesForServiceType ->', () => {
        beforeEach(() => {
            url = `${baseUrl}/${mockResponse[0].PreventiveServiceTypeId}/services`;
        })

        it('should be OK returning no messages', () => {
            service.hasAccessForServiceCode.View = true;
            service.GetPreventiveServicesForServiceType(mockResponse[0].PreventiveServiceTypeId).then(
                res => expect(res).toEqual([]),
                error => fail
            );

            const req = httpTestingController.expectOne(url);
            req.flush([]);
        });

        it('should call get and return an array of preventive service type', () => {
            service.hasAccessForServiceCode.View = true;
            service.GetPreventiveServicesForServiceType(mockResponse[0].PreventiveServiceTypeId).then(
                res => expect(res).toEqual(mockPreventiveServiceTypes),
                error => fail
            );

            // Service should have made one request to GET consnt from expected URL
            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toEqual('GET');

            // Respond with the mock consent
            req.flush(mockPreventiveServiceTypes);
        });

        it("should throw error with response body when server returns error other than 404", () => {
            service.hasAccessForServiceCode.View = true;
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';

            service.GetPreventiveServicesForServiceType(mockResponse[0].PreventiveServiceTypeId).then(
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(url);
            // respond with a 404 and the error message in the body
            req.flush(msg, mockErrorResponse);
        });
    });

    describe('GetPreventiveServicesForServiceCode ->', () => {
        beforeEach(() => {
            url = `${baseUrl}/services/${mockResponse[0].ServiceCodeId}`;
        })

        it('should be OK returning no messages', () => {
            service.hasAccessForServiceCode.View = true;
            service.GetPreventiveServicesForServiceCode(mockResponse[0].ServiceCodeId).then(
                res => expect(res).toEqual([]),
                error => fail
            );

            const req = httpTestingController.expectOne(url);
            req.flush([]);
        });

        it('should call get and return an array of service codes', () => {
            service.hasAccessForServiceCode.View = true;
            service.GetPreventiveServicesForServiceCode(mockResponse[0].ServiceCodeId).then(
                res => expect(res).toEqual(mockPreventiveServiceTypes),
                error => fail
            );

            // Service should have made one request to GET consnt from expected URL
            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toEqual('GET');

            // Respond with the mock consent
            req.flush(mockPreventiveServiceTypes);
        });

        it("should throw error with response body when server returns error other than 404", () => {
            service.hasAccessForServiceCode.View = true;
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';

            service.GetPreventiveServicesForServiceCode(mockResponse[0].ServiceCodeId).then(
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(url);
            // respond with a 404 and the error message in the body
            req.flush(msg, mockErrorResponse);
        });
    });

    describe('UpdatePreventiveService ->', () => {
        beforeEach(() => {
            url = baseUrl;
        })
        it('should update a preventive service and return it', () => {
            service.hasAccessForServiceType.Edit = true;
            service.UpdatePreventiveService(mockPreventiveServiceTypes[0]).then(
                res => expect(res).toEqual(mockResponse),
                error => fail
            );
            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toEqual('PUT');
            req.flush(mockResponse);
        });

        it('should turn 404 error into user-facing error', () => {
            service.hasAccessForServiceType.Edit = true;
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';

            service.UpdatePreventiveService(mockPreventiveServiceTypes[0]).then(
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(url);
            // respond with a 404 and the error message in the body
            req.flush(msg, mockErrorResponse);
        });
    });

    describe('RemovePreventiveServiceById', () => {
        beforeEach(() => {
            url = `${baseUrl}/${mockResponse[0].PreventiveServiceTypeId}/services/${mockResponse[0].PreventiveServiceId}`;
        })
        it('should delete PreventiveService ById and return it', () => {
            service.hasAccessForServiceCode.Delete = true;
            service.RemovePreventiveServiceById(mockResponse[0].PreventiveServiceTypeId, mockResponse[0].ServiceCodeId).then(
                res => expect(res).toEqual(""),
                error => fail
            );
            const req = httpTestingController.expectOne(url + "");
            expect(req.request.method).toEqual('DELETE');
            req.flush("");
        });

        it('should turn 404 error into user-facing error', () => {
            service.hasAccessForServiceCode.Delete = true;
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';
            service.RemovePreventiveServiceById(mockResponse[0].PreventiveServiceTypeId, mockResponse[0].ServiceCodeId).then(
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(url + "");
            // respond with a 404 and the error message in the body
            req.flush(msg, mockErrorResponse);
        });
    });

});
