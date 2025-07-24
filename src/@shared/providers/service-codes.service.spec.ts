import { TestBed, fakeAsync } from '@angular/core/testing';

import { ServiceCodesService } from './service-codes.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ServiceCodeModel } from 'src/business-center/service-code/service-code-model';
import { SoarResponse } from 'src/@core/models/core/soar-response';

let ServiceCodeData: ServiceCodeModel[] = [{
AffectedAreaId: 3,
AffectedAreaName: null,
AmaDiagnosisCode: null,
CPT: null,
CdtCodeId: "44b086dc-8dfe-4a90-8843-02245f8343c8",
CdtCodeName: "D0180",
Code: "zzzzzzz1",
CompleteDescription: null,
Description: "comprehensive periodontal evaluation - new or established patient",
DisplayAs: "CompPerioEx",
DrawTypeDescription: null,
DrawTypeId: "41e5e465-d64e-4d37-976c-be1041df19ba",
IconName: "",
InactivationDate: null,
InactivationRemoveReferences: false,
IsActive: true,
IsEligibleForDiscount: false,
IsSwiftPickCode: false,
LastUsedDate: null,
LocationSpecificInfo: [{ServiceCodeId: "add61f6c-533d-4887-a641-93d654d3a0c4", LocationId: 5053276, Fee: 0, TaxableServiceTypeId: 1}],
Modifications: [],
Modifier: null,
Notes: null,
ServiceCodeId: "add61f6c-533d-4887-a641-93d654d3a0c4",
ServiceTypeDescription: null,
ServiceTypeId: "699faad8-b0a7-4548-a353-3f93f923720f",
SetsToothAsMissing: false,
SmartCode1Id: null,
SmartCode2Id: null,
SmartCode3Id: null,
SmartCode4Id: null,
SmartCode5Id: null,
SubmitOnInsurance: false,
SwiftPickServiceCodes: null,
TimesUsed: 0,
UseCodeForRangeOfTeeth: false,
UseSmartCodes: false,
UsuallyPerformedByProviderTypeId: 1,
UsuallyPerformedByProviderTypeName: null,
}];

let mockResponse : SoarResponse<ServiceCodeModel> = {
  ExtendedStatusCode: null,
  Value: 
      {
          ServiceCodeId: "add61f6c-533d-4887-a641-93d654d3a0c4",
          CdtCodeId: "44b086dc-8dfe-4a90-8843-02245f8343c8",
          CdtCodeName: "D0180",
          Code: "zzzzzzz1",
          Description: "comprehensive periodontal evaluation - new or established patient",
          CompleteDescription: null,
          ServiceTypeId: "699faad8-b0a7-4548-a353-3f93f923720f",
          ServiceTypeDescription: null,
          DisplayAs: "CompPerioEx",
          AffectedAreaId: 3,
          AffectedAreaName: null,
          UsuallyPerformedByProviderTypeId: 1,
          UsuallyPerformedByProviderTypeName: null,
          UseCodeForRangeOfTeeth: false,
          IsActive: true,
          IsEligibleForDiscount: false,
          Notes: null,
          SubmitOnInsurance: false,
          IsSwiftPickCode: false,
          SwiftPickServiceCodes: null,
          DrawTypeId: "41e5e465-d64e-4d37-976c-be1041df19ba",
          DrawTypeDescription: null,
          TimesUsed: 0,
          LastUsedDate: null,
          IconName: "",
          LocationSpecificInfo: [
              {
                  ServiceCodeId: "add61f6c-533d-4887-a641-93d654d3a0c4",
                  LocationId: 5053276,
                  Fee: 0.00,
                  TaxableServiceTypeId: 1
              },
          ],
              SetsToothAsMissing: false,
              InactivationDate: null,
              InactivationRemoveReferences: false,
              AmaDiagnosisCode: null,
              CPT: null,
              Modifier: null,
              Modifications: [],
              UseSmartCodes: false,
              SmartCode1Id: null,
              SmartCode2Id: null,
              SmartCode3Id: null,
              SmartCode4Id: null,
              SmartCode5Id: null,
          },
      InvalidProperties: null
  }
const mockSoarConfig = {
  domainUrl: 'https://localhost:35440',
};


let url = '';

let mockSearchParams = {
  search: "D0140",
  skip: 0,
  take: 1,
  sortBy: null,
  includeInactive: false
};

describe('ServiceCodesService', () => {
  let service: ServiceCodesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServiceCodesService,
        { provide: 'SoarConfig', useValue: mockSoarConfig }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ServiceCodesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('search', () => {
    beforeEach(() => {
        url = mockSoarConfig.domainUrl + '/servicecodes/search';
    })
    it('should be OK returning no cdtCodes', () => {
        service.search(mockSearchParams).then(
            res => expect(res).toEqual([]),
            error => fail
        );

        const req = httpTestingController.expectOne(url + "?search=D0140&skip=0&take=1&sortBy=null&includeInactive=false");
        req.flush([]); 
    });

    it('should call getList and return an array of ServiceCodeModelList on filter list', () => {
        service.search(mockSearchParams).then(
            res => expect(res).toEqual(ServiceCodeData),
            error => fail
        );

        const req = httpTestingController.expectOne(url + "?search=D0140&skip=0&take=1&sortBy=null&includeInactive=false");
        expect(req.request.method).toEqual('GET');

        // Respond with the mock consent
        req.flush(ServiceCodeData);
    });

    it("should throw error with response body when server returns error other than 404", () => {
        const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
        const msg = 'Not found';

        service.search(null).then(
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

    it("should throw error with response body when server returns error other than 400 with no parameters", () => {
        const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
        const msg = 'Invalid request parameters';
        service.search(null).then(
            res => fail('expected to fail'),
            err => {
                expect(err.error).toEqual(msg)
                expect(err.message).toContain(mockErrorResponse.statusText)
            } 
        );
        const req = httpTestingController.expectOne(url);
        // respond with a 400 and the error message in the body
        req.flush(msg, mockErrorResponse);
    });
  });

  describe('updateServiceCodes ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/servicecodes/array';
    })
    it('should update a defaultMessages and return it', () => {
      service.updateServiceCodes(ServiceCodeData[0]).then(
        res => expect(res).toEqual(mockResponse),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      req.flush(mockResponse); 
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.updateServiceCodes(ServiceCodeData[0]).then(
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

  describe('containingSwiftCodes', () => {
    it('should retrieve the list of Swift Pick Codes', () => {
      const serviceCodeId = { serviceCodeId: 'add61f6c-533d-4887-a641-93d654d3a0c4' };
    
      service.containingSwiftCodes(serviceCodeId)
        .then((res) => {
          expect(res).toEqual(ServiceCodeData);
    
          const url = mockSoarConfig.domainUrl + '/servicecodes/swiftpickcodes/' + serviceCodeId.serviceCodeId;
          const req = httpTestingController.expectOne(url);
          expect(req.request.method).toBe('GET');
          req.flush(ServiceCodeData);
        })
        .catch((err) => {
          fail(err);
        });
    });
    
    
  });  

  describe('checkServiceCodeUsage', () => {
    it('should retrieve the list of Service Codes', () => {
      const serviceCodeId = { serviceCodeId: 'add61f6c-533d-4887-a641-93d654d3a0c4' };
    
      service.checkForServiceCodeUsage(serviceCodeId)
        .then((res) => {
          expect(res).toEqual(ServiceCodeData);
    
          const url = mockSoarConfig.domainUrl + '/servicecodes/add61f6c-533d-4887-a641-93d654d3a0c4/usage';
          const req = httpTestingController.expectOne(url);
          expect(req.request.method).toBe('GET');
          req.flush(ServiceCodeData);
        })
        .catch((err) => {
          fail(err);
        });
    });
        
  });  
  
  describe('UpdateService', () => {
    it('should update service codes and show success toastr', fakeAsync(() => {
      const serviceCodes = ServiceCodeData;   
      spyOn(service, 'updateServiceCodes').and.returnValue(Promise.resolve(mockResponse));
      service.UpdateServiceCodes(serviceCodes);
      expect(service.updateServiceCodes).toHaveBeenCalledWith(serviceCodes);
    }));
  
    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      service.UpdateServiceCodes(null).then(
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

    it("should throw error with response body when server returns error other than 400 with no parameters", () => {
        const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
        const msg = 'Invalid request parameters';
        service.UpdateServiceCodes(null).then(
            res => fail('expected to fail'),
            err => {
                expect(err.error).toEqual(msg)
                expect(err.message).toContain(mockErrorResponse.statusText)
            } 
        );
        const req = httpTestingController.expectOne(url);
        // respond with a 400 and the error message in the body
        req.flush(msg, mockErrorResponse);
    });
  })

  describe('getSwiftCodesAttachedToServiceCode', () => {
    it('should retrieve swift codes attached to service code and resolve promise', fakeAsync(() => {
      const serviceCodeId = '123';   
      spyOn(service, 'containingSwiftCodes').and.returnValue(Promise.resolve(mockResponse));
      const promise = service.getSwiftCodesAttachedToServiceCode(serviceCodeId);
      expect(service.containingSwiftCodes).toHaveBeenCalledWith({ serviceCodeId: serviceCodeId });
      promise.then((res) => {
        expect(res).toEqual(mockResponse);
      }).catch(() => {
        fail('Promise should resolve');
      });
    }));
  
    it('should handle server error and reject promise', fakeAsync(() => {
      const serviceCodeId = '123';   
      spyOn(service, 'containingSwiftCodes').and.returnValue(Promise.reject());
      const promise = service.getSwiftCodesAttachedToServiceCode(serviceCodeId);
      expect(service.containingSwiftCodes).toHaveBeenCalledWith({ serviceCodeId: serviceCodeId });
      promise.then(() => {
        fail('Promise should reject');
      }).catch(() => {
      });
    }));
  })
  
  describe('checkForServiceCodeUsage', () => {
    it('should retrieve service codes attached to service code and resolve promise', fakeAsync(() => {
      const serviceCodeId = '123';   
      spyOn(service, 'checkServiceCodeUsage').and.returnValue(Promise.resolve(mockResponse));
      const promise = service.checkForServiceCodeUsage(serviceCodeId);
      expect(service.checkServiceCodeUsage).toHaveBeenCalledWith({ serviceCodeId: serviceCodeId });
      promise.then((res) => {
        expect(res).toEqual(mockResponse);
      }).catch(() => {
        fail('Promise should resolve');
      });
    }));
  
    it('should handle server error and reject promise', fakeAsync(() => {
      const serviceCodeId = '123';   
      spyOn(service, 'checkServiceCodeUsage').and.returnValue(Promise.reject());
      const promise = service.checkForServiceCodeUsage(serviceCodeId);
      expect(service.checkServiceCodeUsage).toHaveBeenCalledWith({ serviceCodeId: serviceCodeId });
      promise.then(() => {
        fail('Promise should reject');
      }).catch(() => {});
    }));
  })
 

  describe('CheckForAffectedAreaChanges -> ',  () => {
    let serviceTransationList;
    let codes;
    let setObjectState;

    beforeEach( () => {
        serviceTransationList = [
            {
                Code: 'D0120',
                ObjectState: 'None',
                Roots: null,
                RootSummaryInfo: null,
                ServiceCodeId: 'cd73b992-896b-4ce5-ab7b-9e11a8cec306',
                Surface: null,
                SurfaceSummaryInfo: null,
                Tooth: ''
            },
            {
                Code: 'D0160',
                ObjectState: 'None',
                Roots: null,
                RootSummaryInfo: null,
                ServiceCodeId: 'f472f6b3-b3d3-483a-a2cf-20d0e191b74b',
                Surface: 'D,F,L',
                SurfaceSummaryInfo: 'DFL',
                Tooth: '7',
            },
            {
                Code: 'D0170',
                ObjectState: 'None',
                Roots: null,
                RootSummaryInfo: null,
                ServiceCodeId: '252449e6-eabb-486c-b232-377f24cc78ae',
                Surface: null,
                SurfaceSummaryInfo: null,
                Tooth: '20'
            },
            {
                Code: 'D1353',
                ObjectState: 'None',
                Roots: 'D,M',
                RootSummaryInfo: 'DM',
                ServiceCodeId: '7a281999-525f-456c-923a-99fab272e05c',
                Surface: null,
                SurfaceSummaryInfo: null,
                Tooth: '32'
            }
        ];
        codes = [
            {
                AffectedAreaId: 1,
                ServiceCodeId: 'cd73b992-896b-4ce5-ab7b-9e11a8cec306'
            },
            {
                AffectedAreaId: 4,
                ServiceCodeId: 'f472f6b3-b3d3-483a-a2cf-20d0e191b74b'
            },
            {
                AffectedAreaId: 5,
                ServiceCodeId: '252449e6-eabb-486c-b232-377f24cc78ae'
            },
            {
                AffectedAreaId: 3,
                ServiceCodeId: '7a281999-525f-456c-923a-99fab272e05c'
            }
        ];

        setObjectState = [];

    });

    it('should return an empty list if nothing needs changed',  () => {
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, setObjectState)).toEqual([]);
    });

    it('should null-out all properties and not return code that has changed from surface to mouth',  () => {
        codes[1].AffectedAreaId = 1;
        expect(serviceTransationList[1].Roots).toBe(null);
        expect(serviceTransationList[1].RootSummaryInfo).toBe(null);
        expect(serviceTransationList[1].Surface).toBe('D,F,L');
        expect(serviceTransationList[1].SurfaceSummaryInfo).toBe('DFL');
        expect(serviceTransationList[1].Tooth).toBe('7');
        expect(serviceTransationList[1].ObjectState).toBe('None');
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, true)).toEqual([]);
        expect(serviceTransationList[1].Roots).toBe(null);
        expect(serviceTransationList[1].RootSummaryInfo).toBe(null);
        expect(serviceTransationList[1].Surface).toBe(null);
        expect(serviceTransationList[1].SurfaceSummaryInfo).toBe(null);
        expect(serviceTransationList[1].Tooth).toBe(null);
        expect(serviceTransationList[1].ObjectState).toBe('Update');
    });

    it('should null-out all properties and not return code that has changed from tooth to mouth',  () => {
        codes[2].AffectedAreaId = 1;
        expect(serviceTransationList[2].Roots).toBe(null);
        expect(serviceTransationList[2].RootSummaryInfo).toBe(null);
        expect(serviceTransationList[2].Surface).toBe(null);
        expect(serviceTransationList[2].SurfaceSummaryInfo).toBe(null);
        expect(serviceTransationList[2].Tooth).toBe('20');
        expect(serviceTransationList[2].ObjectState).toBe('None');
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, setObjectState)).toEqual([]);
        expect(serviceTransationList[2].Roots).toBe(null);
        expect(serviceTransationList[2].RootSummaryInfo).toBe(null);
        expect(serviceTransationList[2].Surface).toBe(null);
        expect(serviceTransationList[2].SurfaceSummaryInfo).toBe(null);
        expect(serviceTransationList[2].Tooth).toBe(null);
    });

    it('should null-out all properties and not return code that has changed from root to mouth',  () => {
        codes[3].AffectedAreaId = 1;
        expect(serviceTransationList[3].Roots).toBe('D,M');
        expect(serviceTransationList[3].RootSummaryInfo).toBe('DM');
        expect(serviceTransationList[3].Surface).toBe(null);
        expect(serviceTransationList[3].SurfaceSummaryInfo).toBe(null);
        expect(serviceTransationList[3].Tooth).toBe('32');
        expect(serviceTransationList[3].ObjectState).toBe('None');
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, true)).toEqual([]);
        expect(serviceTransationList[3].Roots).toBe(null);
        expect(serviceTransationList[3].RootSummaryInfo).toBe(null);
        expect(serviceTransationList[3].Surface).toBe(null);
        expect(serviceTransationList[3].SurfaceSummaryInfo).toBe(null);
        expect(serviceTransationList[3].Tooth).toBe(null);
        expect(serviceTransationList[3].ObjectState).toBe('Update');
    });

    it('should return code that has changed from mouth to root',  () => {
        codes[0].AffectedAreaId = 3;
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, setObjectState)).toEqual(['D0120']);
        expect(serviceTransationList[0].ObjectState).toBe('None');
    });

    it('should return code that has changed from surface to root',  () => {
        codes[1].AffectedAreaId = 3;
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, setObjectState)).toEqual(['D0160']);
        expect(serviceTransationList[1].ObjectState).toBe('None');
    });

    it('should return code that has changed from tooth to root',  () => {
        codes[2].AffectedAreaId = 3;
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, setObjectState)).toEqual(['D0170']);
        expect(serviceTransationList[2].ObjectState).toBe('None');
    });

    it('should return code that has changed from mouth to surface',  () => {
        codes[0].AffectedAreaId = 4;
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, setObjectState)).toEqual(['D0120']);
        expect(serviceTransationList[0].ObjectState).toBe('None');
    });

    it('should return code that has changed from tooth to surface',  () => {
        codes[2].AffectedAreaId = 4;
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, setObjectState)).toEqual(['D0170']);
        expect(serviceTransationList[2].ObjectState).toBe('None');
    });

    it('should return code that has changed from root to surface',  () => {
        codes[3].AffectedAreaId = 4;
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, setObjectState)).toEqual(['D1353']);
        expect(serviceTransationList[3].ObjectState).toBe('None');
    });

    it('should return code that has changed from mouth to tooth',  () => {
        codes[0].AffectedAreaId = 5;
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, setObjectState)).toEqual(['D0120']);
        expect(serviceTransationList[0].ObjectState).toBe('None');
    });

    it('should null-out Surface and not return code that has changed from surface to tooth',  () => {
        codes[1].AffectedAreaId = 5;
        expect(serviceTransationList[1].Surface).toBe('D,F,L');
        expect(serviceTransationList[1].SurfaceSummaryInfo).toBe('DFL');
        expect(serviceTransationList[1].ObjectState).toBe('None');
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, true)).toEqual([]);
        expect(serviceTransationList[1].Surface).toBe(null);
        expect(serviceTransationList[1].SurfaceSummaryInfo).toBe(null);
        expect(serviceTransationList[1].ObjectState).toBe('Update');
    });

    it('should null-out Roots and not return code that has changed from root to tooth',  () => {
        codes[3].AffectedAreaId = 5;
        expect(serviceTransationList[3].Roots).toBe('D,M');
        expect(serviceTransationList[3].RootSummaryInfo).toBe('DM');
        expect(serviceTransationList[3].ObjectState).toBe('None');
        expect(service.CheckForAffectedAreaChanges(serviceTransationList, codes, false)).toEqual([]);
        expect(serviceTransationList[3].Roots).toBe(null);
        expect(serviceTransationList[3].RootSummaryInfo).toBe(null);
        expect(serviceTransationList[3].ObjectState).toBe('None');
    });
});

});
