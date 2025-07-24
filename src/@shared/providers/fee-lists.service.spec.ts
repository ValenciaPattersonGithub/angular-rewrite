import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CreateFeeListDto, FeeListsService, UpdateFeeListDto } from './fee-lists.service';
import { AuthAccess } from '../models/auth-access.model';

describe('FeeListServiceCodeDto', () => {
    let service: FeeListsService;

    let mockSoarConfig = {
        insuranceSapiUrl: "http://localhost"
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
        IsAuthorizedByAbbreviation: (keyForAuthorization) => {
            if (keyForAuthorization == "soar-biz-feelst-add" || keyForAuthorization == "soar-biz-feelst-delete" || keyForAuthorization == "soar-biz-feelst-edit" || keyForAuthorization == "soar-biz-feelst-view") {
                return true;
            }
            else {
                return false;
            }
        }
    };
    let httpTestingController: HttpTestingController;

    beforeEach((() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [],
            providers: [FeeListsService,
                { provide: 'SoarConfig', useValue: mockSoarConfig },
                { provide: 'PatCacheFactory', useValue: mockPatCacheFactory },
                { provide: 'toastrFactory', useValue: mocktoastrFactory },
                { provide: "localize", useValue: mocklocalize },
                { provide: "patSecurityService", useValue: mockpatSecurityService },

            ]
        });
        service = TestBed.inject(FeeListsService);
        httpTestingController = TestBed.inject(HttpTestingController);
    }));

    describe('create -->', () => {
        it('should remove extra properties', () => {
            const input = {
                Name: "Test",
                ServiceCodes: [{
                    ServiceCodeId: "123",
                    NewFee: 10,
                    InvalidProperty: "test",
                    NewTaxableServiceTypeId: 2
                }],
                RandomProperty: "test"
            };

            const expected: CreateFeeListDto = {
                Name: "Test",
                ServiceCodes: [{
                    ServiceCodeId: "123",
                    NewFee: 10,
                    NewTaxableServiceTypeId: 2
                }],
            };

            service.create(input).subscribe();

            const req = httpTestingController.expectOne(`${mockSoarConfig.insuranceSapiUrl}/feelists`);
            expect(req.request.method).toBe("POST");
            let feeList = req.request.body;
            expect(Object.keys(feeList).sort()).toEqual(Object.keys(expected).sort());
            expect(Object.keys(feeList.ServiceCodes[0]).sort()).toEqual(Object.keys(expected.ServiceCodes[0]).sort());

            req.flush({});

            httpTestingController.verify();
        }); 

        it('should clear cache', () => {
            mockPatCacheFactory.GetCache = jasmine.createSpy().and.returnValue({});
            mockPatCacheFactory.ClearCache = jasmine.createSpy();

            const input = {
                Name: "Test",
                ServiceCodes: [{
                    ServiceCodeId: "123",
                    NewFee: 10,
                    InvalidProperty: "test",
                    NewTaxableServiceTypeId: 2
                }],
                RandomProperty: "test"
            };

            service.create(input).subscribe(() => {
              expect(mockPatCacheFactory.GetCache).toHaveBeenCalledWith("ServiceCodesService", 'aggressive', 60000, 60000);
              expect(mockPatCacheFactory.GetCache).toHaveBeenCalledWith("FeeListsService", 'aggressive', 60000, 60000);
              expect(mockPatCacheFactory.ClearCache).toHaveBeenCalledTimes(2);
            });

            const req = httpTestingController.expectOne(`${mockSoarConfig.insuranceSapiUrl}/feelists`);
            req.flush({});

            httpTestingController.verify();
        });

        it('should handle HTTP error', () => {
            let input = {
                Name: "Test",
                ServiceCodes: [{
                    ServiceCodeId: "123",
                    NewFee: 10,
                    InvalidProperty: "test",
                    NewTaxableServiceTypeId: 2
                }],
                RandomProperty: "test"
            };
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';
            service.create(input).subscribe(res =>
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(`${mockSoarConfig.insuranceSapiUrl}/feelists`);
            expect(req.request.method).toBe('POST');
            req.flush(msg, mockErrorResponse);
        });
    });

    describe('update -->', () => {        
        const input = {
            FeeListId: 100,
            DataTag: "Test",
            Name: "Test",
            ServiceCodes: [{
                FeeListServiceCodeId: 10,
                FeeListId: 100,
                DataTag: "Test",
                InvalidProp: "Test",
                ServiceCodeId: "123",
                NewFee: 10,
                NewTaxableServiceTypeId: 2
            }],
            RandomProperty: "test"
        };
        const saveAsDraft = false;
        it('should remove extra properties', () => {          
            const expected: UpdateFeeListDto = {
                FeeListId: 100,
                DataTag: "Test",
                Name: "Test",
                ServiceCodes: [{
                    FeeListServiceCodeId: 10,
                    FeeListId: 100,
                    DataTag: "Test",
                    ServiceCodeId: "123",
                    NewFee: 10,
                    NewTaxableServiceTypeId: 2
                }],
            };

            service.update(input, saveAsDraft).subscribe();

            const req = httpTestingController.expectOne(`${mockSoarConfig.insuranceSapiUrl}/feelists?saveAsDraft=${saveAsDraft}`);
            expect(req.request.method).toBe("PUT");
            let feeList = req.request.body;
            expect(Object.keys(feeList).sort()).toEqual(Object.keys(expected).sort());
            expect(Object.keys(feeList.ServiceCodes[0]).sort()).toEqual(Object.keys(expected.ServiceCodes[0]).sort());

            req.flush({});

            httpTestingController.verify();
        });

        it('should clear cache', () => {
            mockPatCacheFactory.GetCache = jasmine.createSpy().and.returnValue({});
            mockPatCacheFactory.ClearCache = jasmine.createSpy();

            const input = {
                Name: "Test",
                ServiceCodes: [{
                    ServiceCodeId: "123",
                    NewFee: 10,
                    InvalidProperty: "test",
                    NewTaxableServiceTypeId: 2
                }],
                RandomProperty: "test"
            };

            service.create(input).subscribe(() => {
                expect(mockPatCacheFactory.GetCache).toHaveBeenCalledWith("ServiceCodesService", 'aggressive', 60000, 60000);
                expect(mockPatCacheFactory.GetCache).toHaveBeenCalledWith("FeeListsService", 'aggressive', 60000, 60000);
                expect(mockPatCacheFactory.ClearCache).toHaveBeenCalledTimes(2);
            });

            const req = httpTestingController.expectOne(`${mockSoarConfig.insuranceSapiUrl}/feelists`);
            req.flush({});

            httpTestingController.verify();
        });

        it('should handle HTTP error', () => {
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';
            service.update(input, false).subscribe(res =>
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(`${mockSoarConfig.insuranceSapiUrl}/feelists?saveAsDraft=${saveAsDraft}`);
            expect(req.request.method).toBe('PUT');
            req.flush(msg, mockErrorResponse);
        });
    });

    describe('authCreateAccess -->', () => {
        it('should return true for create access', () => {
            let tempAuthAccess = service.authCreateAccess();
            expect(tempAuthAccess).toBe(true);
        })
    })

    describe('authDeleteAccess -->', () => {
        it('should return true for delete access', () => {
            let tempAuthAccess = service.authDeleteAccess();
            expect(tempAuthAccess).toBe(true);
        })
    })

    describe('authEditAccess -->', () => {
        it('should return true for edit access', () => {
            let tempAuthAccess = service.authEditAccess();
            expect(tempAuthAccess).toBe(true);
        })
    })

    describe('authViewAccess -->', () => {
        it('should return true for authView access', () => {
            let tempAuthAccess = service.authViewAccess();
            expect(tempAuthAccess).toBe(true);
        })
    })

    describe('authAccess -->', () => {
        it('should call authViewAccess for every authAccess check', () => {
            service.authViewAccess = jasmine.createSpy();
            service.authAccess();
            expect(service.authViewAccess).toHaveBeenCalled();
        })
        it('should call authViewAccess for every authAccess check and return hasAccess', () => {
            service.hasAccess = new AuthAccess();
            service.hasAccess.create = false;
            service.hasAccess.update = false;
            service.hasAccess.delete = false;
            service.authAccess();
            expect(service.hasAccess.create).toBe(true);
            expect(service.hasAccess.update).toBe(true);
            expect(service.hasAccess.delete).toBe(true);
        })
    })

    describe('validateName -->', () => {
        let url = "";
        beforeEach(() => {
            url = mockSoarConfig.insuranceSapiUrl + '/feelists/nameUniqueness';
        })
        let feeList = {
            DataTag: "Test",
            Name: "Test",
            FeeListId: 100,
            ServiceCodes: [{
                FeeListServiceCodeId: 10,
                FeeListId: 100,
                DataTag: "Test",
                InvalidProp: "Test",
                ServiceCodeId: "123",
                NewFee: 10,
                NewTaxableServiceTypeId: 2
            }],
            RandomProperty: "test"
        };
        it('should be OK returning no messages', () => {
            service.validateName(feeList).then(
                res => expect(res).toEqual([]),
                error => fail
            );

            const req = httpTestingController.expectOne(url + "?name=Test&excludeId=100");
            req.flush([]);
        });

        it('should call get and return feeList', () => {
            service.validateName(feeList).then(
                res => expect(res).toEqual(feeList),
                error => fail
            );

            // FeeListService should have made one request to GET feeList from expected URL
            const req = httpTestingController.expectOne(url + "?name=Test&excludeId=100");
            expect(req.request.method).toEqual('GET');

            // Respond with the mock consent
            req.flush(feeList);
        });

        it("should throw error with response body when server returns error other than 404", () => {
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';

            service.validateName(feeList).then(
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(url + "?name=Test&excludeId=100");
            // respond with a 404 and the error message in the body
            req.flush(msg, mockErrorResponse);
        });
    })

    describe('validateNameCreate -->', () => {
        let url = "";
        beforeEach(() => {
            url = mockSoarConfig.insuranceSapiUrl + '/feelists/nameUniqueness';
        })
        let feeList = {
            DataTag: "Test",
            Name: "Test",
            ServiceCodes: [{
                FeeListServiceCodeId: 10,
                DataTag: "Test",
                InvalidProp: "Test",
                ServiceCodeId: "123",
                NewFee: 10,
                NewTaxableServiceTypeId: 2
            }],
            RandomProperty: "test"
        };
        it('should be OK returning no data', () => {
            service.validateNameCreate(feeList).then(
                res => expect(res).toEqual([]),
                error => fail
            );

            const req = httpTestingController.expectOne(url + "?name=Test");
            req.flush([]);
        });

        it('should call get and return fee List data', () => {
            service.validateNameCreate(feeList).then(
                res => expect(res).toEqual(feeList),
                error => fail
            );

            // FeeListService should have made one request to GET feeList from expected URL
            const req = httpTestingController.expectOne(url + "?name=Test");
            expect(req.request.method).toEqual('GET');

            // Respond with the mock feeList
            req.flush(feeList);
        });

        it("should throw error with response body when server returns error other than 404", () => {
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';

            service.validateNameCreate(feeList).then(
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(url + "?name=Test");
            // respond with a 404 and the error message in the body
            req.flush(msg, mockErrorResponse);
        });
    })

    describe('filter -->', () => {
        let feeList;
        beforeEach(() => {
            feeList = {
                DataTag: "Test",
                Name: "Test",
                ServiceCodes: [{
                    FeeListServiceCodeId: 10,
                    DataTag: "Test",
                    InvalidProp: "Test",
                    ServiceCodeId: "123",
                    NewFee: 10,
                    Fee: 10,
                    NewTaxableServiceTypeId: 2,
                    TaxableServiceTypeId: 2,
                    $$Modified: true
                }],
                RandomProperty: "test"
            };
        })
        it('should return same feeList when same modified is true', () => {
            feeList.ServiceCodes[0].$$Modified = true;
            let resultFeeList = service.filter(feeList);
            expect(resultFeeList).toEqual(feeList);
        })
        it('should return same feeList when NewFee & Fee not equal', () => {
            feeList.ServiceCodes[0].$$Modified = true;
            feeList.ServiceCodes[0].NewFee = 11;
            let resultFeeList = service.filter(feeList);
            expect(resultFeeList).toEqual(feeList);
        })
        it('should return same feeList when NewTaxableServiceTypeId & TaxableServiceTypeId not equal', () => {
            feeList.ServiceCodes[0].NewTaxableServiceTypeId = 3;
            let resultFeeList = service.filter(feeList);
            expect(resultFeeList).toEqual(feeList);
        })
        it('should return splice record when modified is false, NewFee & Fee equal, NewTaxableServiceTypeId & TaxableServiceTypeId equal', () => {
            feeList.ServiceCodes[0].NewTaxableServiceTypeId = 3;
            feeList.ServiceCodes[0].TaxableServiceTypeId = 3;
            feeList.ServiceCodes[0].NewFee = 10;
            feeList.ServiceCodes[0].Fee = 10;
            feeList.ServiceCodes[0].$$Modified = false;
            let resultFeeList = service.filter(feeList);
            expect(resultFeeList.ServiceCodes?.length).toEqual(0);
        })
    })

    describe('save -->', () => {
        let feeList;
        beforeEach(() => {
            feeList = {
                DataTag: "Test",
                Name: "Test",
                ServiceCodes: [{
                    FeeListServiceCodeId: 10,
                    DataTag: "Test",
                    InvalidProp: "Test",
                    ServiceCodeId: "123",
                    NewFee: 10,
                    Fee: 10,
                    NewTaxableServiceTypeId: 2,
                    TaxableServiceTypeId: 2,
                    $$Modified: true
                }],
                RandomProperty: "test"
            };
        })

        it('should call create method when FeeListId does not exist', () => {
            service.create = jasmine.createSpy();
            service.save(feeList, false);
            expect(service.create).toHaveBeenCalled();
        })

        it('should call update method when FeeListId is exist', () => {
            feeList.FeeListId = 1;
            service.update = jasmine.createSpy();
            service.save(feeList, true);
            expect(service.update).toHaveBeenCalled();
        })
    })

    describe('deleteDraft -->', () => {
        let url = "";
        let feeList;
        beforeEach(() => {
            url = mockSoarConfig.insuranceSapiUrl + '/feelists/';
            feeList = {
                DataTag: "Test",
                Name: "Test",
                FeeListId: 1,
                ServiceCodes: [{
                    FeeListServiceCodeId: 10,
                    DataTag: "Test",
                    InvalidProp: "Test",
                    ServiceCodeId: "123",
                    NewFee: 10,
                    Fee: 10,
                    NewTaxableServiceTypeId: 2,
                    TaxableServiceTypeId: 2,
                    $$Modified: true,
                    FeeListId: 1
                }],
                RandomProperty: "test"
            };
        })
        it('should delete a feeListName and return it', () => {
            service.deleteDraft(feeList).then(
                res => expect(res).toEqual(""),
                error => fail
            );
            const req = httpTestingController.expectOne(url + "1?draftOnly=true");
            expect(req.request.method).toEqual('DELETE');
            req.flush("");
        });

        it('should turn 404 error into user-facing error', () => {
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';
            service.deleteDraft(feeList).then(
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(url + "1?draftOnly=true");
            // respond with a 404 and the error message in the body
            req.flush(msg, mockErrorResponse);
        });
    })

    describe('delete -->', () => {
        let url = "";
        let feeList;
        beforeEach(() => {
            url = mockSoarConfig.insuranceSapiUrl + '/feelists/';
            feeList = {
                DataTag: "Test",
                Name: "Test",
                FeeListId: 1,
                ServiceCodes: [{
                    FeeListServiceCodeId: 10,
                    DataTag: "Test",
                    InvalidProp: "Test",
                    ServiceCodeId: "123",
                    NewFee: 10,
                    Fee: 10,
                    NewTaxableServiceTypeId: 2,
                    TaxableServiceTypeId: 2,
                    $$Modified: true,
                    FeeListId: 1
                }],
                RandomProperty: "test"
            };
        })
        it('should delete a feeListName and return it', () => {
            service.delete(feeList).then(
                res => expect(res).toEqual(""),
                error => fail
            );
            const req = httpTestingController.expectOne(url + "1");
            expect(req.request.method).toEqual('DELETE');
            req.flush("");
        });

        it('should turn 404 error into user-facing error', () => {
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';
            service.delete(feeList).then(
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(url + "1");
            // respond with a 404 and the error message in the body
            req.flush(msg, mockErrorResponse);
        });
    })

    describe('get -->', () => {
        let url = "";
        let feeList;
        beforeEach(() => {
            url = mockSoarConfig.insuranceSapiUrl + '/feelists/locations';
            feeList = {
                DataTag: "Test",
                Name: "Test",
                FeeListId: 1,
                ServiceCodes: [{
                    FeeListServiceCodeId: 10,
                    DataTag: "Test",
                    InvalidProp: "Test",
                    ServiceCodeId: "123",
                    NewFee: 10,
                    Fee: 10,
                    NewTaxableServiceTypeId: 2,
                    TaxableServiceTypeId: 2,
                    $$Modified: true,
                    FeeListId: 1
                }],
                RandomProperty: "test"
            };
        })

        it('should call authViewAccess for every call', () => {
            service.authViewAccess = jasmine.createSpy();
            service.get();
            expect(service.authViewAccess).toHaveBeenCalled();
        })

        it('should return feeList from API', () => {
            service.get().subscribe(data => {
                expect(data).toEqual(feeList);
            });

            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toBe('GET');
            req.flush(feeList);
        });

        it('should handle HTTP error', () => {
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';
            service.get().subscribe(res =>
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            ); const req = httpTestingController.expectOne(url);
            expect(req.request.method).toBe('GET');
            req.flush(msg, mockErrorResponse);
        });
    })

    describe('getById -->', () => {
        let url = "";
        let feeList;
        beforeEach(() => {
            url = mockSoarConfig.insuranceSapiUrl + '/feelists';
            feeList = {
                DataTag: "Test",
                Name: "Test",
                FeeListId: 1,
                ServiceCodes: [{
                    FeeListServiceCodeId: 10,
                    DataTag: "Test",
                    InvalidProp: "Test",
                    ServiceCodeId: "123",
                    NewFee: 10,
                    Fee: 10,
                    NewTaxableServiceTypeId: 2,
                    TaxableServiceTypeId: 2,
                    $$Modified: true,
                    FeeListId: 1
                }],
                RandomProperty: "test"
            };
        })

        it('should call authViewAccess for every call', () => {
            service.authViewAccess = jasmine.createSpy();
            service.getById(feeList.FeeListId, true);
            expect(service.authViewAccess).toHaveBeenCalled();
        })

        it('should return feeList from API with forImport=true', () => {
            service.getById(feeList.FeeListId, true).subscribe(data => {
                expect(data).toEqual(feeList);
            });

            const req = httpTestingController.expectOne(url + "/" + feeList.FeeListId + "?forImport=true");
            expect(req.request.method).toBe('GET');
            req.flush(feeList);
        });

        it('should return feeList from API with forImport=false', () => {
            service.getById(feeList.FeeListId, false).subscribe(data => {
                expect(data).toEqual(feeList);
            });

            const req = httpTestingController.expectOne(url + "/" + feeList.FeeListId);
            expect(req.request.method).toBe('GET');
            req.flush(feeList);
        });

        it('should handle HTTP error', () => {
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';
            service.getById(feeList.FeeListId, false).subscribe(res =>
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(url + "/" + feeList.FeeListId);
            expect(req.request.method).toBe('GET');
            req.flush(msg, mockErrorResponse);
        });
    })

    describe('new -->', () => {
        let url = "";
        let feeList;
        beforeEach(() => {
            url = mockSoarConfig.insuranceSapiUrl + '/feelists/new';
            feeList = {
                DataTag: "Test",
                Name: "Test",
                FeeListId: 1,
                ServiceCodes: [{
                    FeeListServiceCodeId: 10,
                    DataTag: "Test",
                    InvalidProp: "Test",
                    ServiceCodeId: "123",
                    NewFee: 10,
                    Fee: 10,
                    NewTaxableServiceTypeId: 2,
                    TaxableServiceTypeId: 2,
                    $$Modified: true,
                    FeeListId: 1
                }],
                RandomProperty: "test"
            };
        })

        it('should call authCreateAccess for every call', () => {
            service.authCreateAccess = jasmine.createSpy();
            service.new();
            expect(service.authCreateAccess).toHaveBeenCalled();
        })

        it('should return feeList from API', () => {
            service.new().subscribe(data => {
                expect(data).toEqual(feeList);
            });
            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toBe('GET');
            req.flush(feeList);
        });

        it('should handle HTTP error', () => {
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';
            service.new().subscribe(res =>
                res => fail('expected to fail'),
                err => {
                    expect(err.error).toEqual(msg)
                    expect(err.message).toContain(mockErrorResponse.statusText)
                }
            );
            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toBe('GET');
            req.flush(msg, mockErrorResponse);
        });
    })   
});