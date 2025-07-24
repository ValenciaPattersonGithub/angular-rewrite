import { TestBed } from '@angular/core/testing';
import { AdjustmentTypesService } from './adjustment-types.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { AdjustmentTypes } from 'src/business-center/practice-settings/adjustment-types/adjustment-types';
import { PatSharedService } from './pat-shared.service';

const mockSoarConfig = {
  insuranceSapiUrl: 'https://localhost:35440',
};

let url = '';

const mockAdjustmentType: SoarResponse<Array<AdjustmentTypes>> = {
  ExtendedStatusCode: null,
  Value:[{
    AdjustmentTypeId: "008f3d63-e341-4256-8959-f22186cb5056",
    DataTag: null,
    DateModified: "0001-01-01T00:00:00",
    Description: "4e151y6we94x3it09rc8",
    ImpactType: 3,
    IsActive: true,
    IsAdjustmentTypeAssociatedWithTransactions: false,
    IsDefaultTypeOnBenefitPlan: false,
    IsPositive: true,
    IsSystemType: false,
    UserModified: "00000000-0000-0000-0000-000000000000"
  }],
  InvalidProperties: null
}

const mockResponse : SoarResponse<AdjustmentTypes> = {
  ExtendedStatusCode: null,
  Value: 
      {
          AdjustmentTypeId: "008f3d63-e341-4256-8959-f22186cb5056",
          Description: "4e151y6we94x3it09rc8",
          IsActive: true,
          IsPositive: true,
          IsSystemType: false,
          ImpactType: 3,
          IsAdjustmentTypeAssociatedWithTransactions: false,
          IsDefaultTypeOnBenefitPlan: false,
          DataTag: null,
          UserModified: "00000000-0000-0000-0000-000000000000",
          DateModified: "0001-01-01T00:00:00"
      },
      InvalidProperties: null
}

const mockSearchParams = {};

const mockpatSharedService = {
  setParameter: jasmine.createSpy()
};

describe('AdjustmentTypesService', () => {
  let service: AdjustmentTypesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [AdjustmentTypesService, 
      { provide: 'SoarConfig', useValue: mockSoarConfig },
      { provide: PatSharedService, useValue: mockpatSharedService },
    ],
  });
  httpTestingController = TestBed.inject(HttpTestingController);
  service = TestBed.inject(AdjustmentTypesService);
});

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getList', () => {
    beforeEach(() => {
        url = mockSoarConfig.insuranceSapiUrl + '/adjustmenttypes';
    })
    it('should call getList and return an array of adjustmenttypes ', () => {
      service.get(mockSearchParams).then(
            res => expect(res).toEqual(mockAdjustmentType),
            error => fail(error)
        );
        const req = httpTestingController.expectOne(url);
        expect(req.request.method).toEqual('GET');
        req.flush(mockAdjustmentType);
    })
    it("should throw error with response body when server returns error other than 404", () => {
        const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
        const msg = 'Not found';
        service.get(mockSearchParams).then(
            res => fail(res),
            err => {
                expect(err.error).toEqual(msg)
                expect(err.message).toContain(mockErrorResponse.statusText)
            }
        );
        const req = httpTestingController.expectOne(url);

        // respond with a 404 and the error message in the body
        req.flush(msg, mockErrorResponse);
    });      
  })
  
  describe('create ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.insuranceSapiUrl + '/adjustmenttypes';
    })  
    it('should save a data and return it', () => {
      service.create(mockAdjustmentType[0]).then(
        res => expect(res as SoarResponse<AdjustmentTypes>).toEqual(mockResponse),
        error => fail(error)
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      req.flush(mockResponse);
    })
    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      service.create(mockAdjustmentType[0]).then(
        res => fail('expected to fail' + res),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);   
      
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

  describe('update ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.insuranceSapiUrl + '/adjustmenttypes';
    })
    it('should update a adjustmenttypes and return it', () => {
      service.update(mockAdjustmentType[0]).then(
        res => expect(res as SoarResponse<AdjustmentTypes>).toEqual(mockResponse),
        error => fail(error)
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      req.flush(mockResponse); 
    })
    it('should turn 404 error into adjustment type error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      service.update(mockAdjustmentType[0]).then(
        res => fail('expected to fail' + res),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    })
  })

  describe('deleteAdjustmentTypeById', () => {
    beforeEach(() => {
      url = mockSoarConfig.insuranceSapiUrl + '/adjustmenttypes/' + mockAdjustmentType.Value[0].AdjustmentTypeId;
    })
    it('hould delete a message and return it', () => {
      const mockDeleteId =   mockAdjustmentType.Value[0].AdjustmentTypeId;
      service.deleteAdjustmentTypeById(mockDeleteId).then(
        res => expect(res).toEqual(""),
        error => fail(error)
      );
      const req = httpTestingController.expectOne(url + "");
      expect(req.request.method).toEqual('DELETE');
      req.flush(""); 
    })
    it('should turn 404 error into error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      const mockDeleteId = mockAdjustmentType.Value[0].AdjustmentTypeId;
      url = mockSoarConfig.insuranceSapiUrl + '/adjustmenttypes/' + mockAdjustmentType.Value[0].AdjustmentTypeId;
      service.deleteAdjustmentTypeById(mockDeleteId).then(
        res => fail('expected to fail' + res),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url + "");

      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })

  describe('GetAllAdjustmentTypesWithOutCheckTransactions', () => {
    beforeEach(() => {
        url = mockSoarConfig.insuranceSapiUrl + '/adjustmenttypes';
    })
    it('should call getList and return an array of adjustment types ', () => {
      service.GetAllAdjustmentTypesWithOutCheckTransactions(mockSearchParams).then(
            res => expect(res).toEqual(mockAdjustmentType),
            error => fail(error)
        );
        const req = httpTestingController.expectOne(url);

        expect(req.request.method).toEqual('GET');
        req.flush(mockAdjustmentType);
    })
    it("should throw error with response body when server returns error other 404", () => {
        const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
        const msg = 'Not found';
        service.GetAllAdjustmentTypesWithOutCheckTransactions(mockSearchParams).then(
          res => fail('expected to fail' + res),
            err => {
                expect(err.error).toEqual(msg)
                expect(err.message).toContain(mockErrorResponse.statusText)
            }
        );
        const req = httpTestingController.expectOne(url);

        // respond with a 404 and the error message in the body
        req.flush(msg, mockErrorResponse);
    });      
  })

  describe('GetAdjustmentTypeAssociatedWithTransactions', () => {
    beforeEach(() => {
      url = mockSoarConfig.insuranceSapiUrl + '/adjustmenttypes/' + mockAdjustmentType.Value[0].AdjustmentTypeId;
    })
    it('should call getList and return array of adjustmenttypes ', () => {
      service.GetAdjustmentTypeAssociatedWithTransactions(mockAdjustmentType.Value[0].AdjustmentTypeId).then(
            res => expect(res).toEqual(mockAdjustmentType),
            error => fail(error)
        );
        const req = httpTestingController.expectOne(url);
        expect(req.request.method).toEqual('GET');
        req.flush(mockAdjustmentType);
    })
    it("should throw error with response when server returns error other than 404", () => {
        const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
        const msg = 'Not found';
        service.GetAdjustmentTypeAssociatedWithTransactions(mockAdjustmentType.Value[0].AdjustmentTypeId).then(
            res => fail('expected to fail' + res),
            err => {
                expect(err.error).toEqual(msg)
                expect(err.message).toContain(mockErrorResponse.statusText)
            }
        );
        const req = httpTestingController.expectOne(url);

        // respond with a 404 and the error message in the body
        req.flush(msg, mockErrorResponse);
    });      
  })

});