import { TestBed } from '@angular/core/testing';

import { DiscountTypesService } from './discount-types.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { DiscountType } from 'src/business-center/practice-settings/billing/discount-types/discount-type';

const mockSoarConfig = {
  domainUrl: 'https://localhost:35440',
};

let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: (AccessCode) => {
        if (AccessCode == "soar-biz-bizloc-view" || AccessCode == "soar-biz-bsvct-add" || AccessCode == "soar-biz-bsvct-delete" || AccessCode == "soar-biz-bsvct-edit") {
            return true;
        }
        else {
            return false;
        }

    },
    generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
};

let url = "";

let mockDiscountTypes: SoarResponse<Array<DiscountType>> = {
  ExtendedStatusCode: null,
  Value: [{
    DataTag: "AAAAAAAoGXM=",
    DateModified: new Date(),
    DiscountName: "011",
    DiscountRate: 0.01,
    DiscountRateDisplay: "1.00",
    IsActive: true,
    MasterDiscountTypeId: "a4911f91-f932-438b-b53b-0f940a31fe0d",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
  },
  {
    DataTag: "AAAAAAAoGXM=",
    DateModified: new Date(),
    DiscountName: "01",
    DiscountRate: 0.03,
    DiscountRateDisplay: "3.00",
    IsActive: true,
    MasterDiscountTypeId: null,
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cy"
  }
],
  InvalidProperties: null
}

let mockSave: SoarResponse<DiscountType> = {
    ExtendedStatusCode: null,
    Value: { 
      MasterDiscountTypeId: "d85cceef-1ec1-4a4c-ad03-6e61d3f7a9ec",
      DiscountName: "012345",
      DiscountRate: 0.02,
      IsActive: true,
      DataTag: "AAAAAAAoLVU=",
      UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
      DateModified: new Date(),
    },
    InvalidProperties: null
}


describe('DiscountTypesService', () => {
  let service: DiscountTypesService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DiscountTypesService, 
          { provide: 'SoarConfig', useValue: mockSoarConfig },
          { provide: 'patSecurityService', useValue: mockPatSecurityService }
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DiscountTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/discounttypes';
    });
  
    it('should be OK returning no messages', () => {
      service.get().then(
        res => expect(res).toEqual({ Value: [], ExtendedStatusCode: null, InvalidProperties: null }),
        error => fail(error)
      );
      const req = httpTestingController.expectOne(url);
      req.flush({ Value: [], ExtendedStatusCode: null, InvalidProperties: null });
    });  

    it('should call get and return an array of discount types', () => {
      service.get().then(
        res => expect(res).toEqual(mockDiscountTypes),
        error => fail
      );
      // Service should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url); 
      expect(req.request.method).toEqual('GET');
      // Respond with the mock consent
      req.flush(mockDiscountTypes); 
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      service.get().then(
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


  describe('save ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/discounttypes';
    });
  
    it('should save a data and return it', () => {
      service.save(mockDiscountTypes[0]).then(
        res => expect(res).toEqual(mockSave),
        error => fail(error)
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      req.flush(mockSave);
    }); 

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      service.save(mockDiscountTypes[0]).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);      
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });
  });


  describe('update ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/discounttypes';
    })
    it('should update a defaultMessages and return it', () => {
      service.update(mockDiscountTypes[0]).then(
        res => expect(res).toEqual(mockSave),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      req.flush(mockSave); 
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.update(mockDiscountTypes[0]).then(
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


  describe('delete', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/discounttypes/' + mockDiscountTypes.Value[0].MasterDiscountTypeId;
    })
    it('hould delete a message and return it', () => {
      let mockDeleteId =  mockDiscountTypes.Value[0].MasterDiscountTypeId;
      service.delete(mockDeleteId).then(
        res => expect(res).toEqual(""),
        error => fail
      );
      const req = httpTestingController.expectOne(url + "");
      expect(req.request.method).toEqual('DELETE');
      req.flush(""); 
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      let mockDeleteId =  mockDiscountTypes.Value[0].MasterDiscountTypeId;
      url = mockSoarConfig.domainUrl + '/discounttypes/' + mockDiscountTypes.Value[0].MasterDiscountTypeId;
      service.delete(mockDeleteId).then(
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

  describe('patientsWithDiscount ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/discounttypes';
    });

    it('should be OK returning no messages', () => {
      service.patientsWithDiscount().then(
        res => expect(res).toEqual([]),
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      req.flush([]); 
    });

    it('should call teamMemberIdentifier and return an array of additional identifier', () => {
      service.patientsWithDiscount().then(
        res => expect(res).toEqual(mockDiscountTypes),
        error => fail
      );

      // Service should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(mockDiscountTypes);
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.patientsWithDiscount().then(
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

});