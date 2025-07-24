import { TestBed } from '@angular/core/testing';
import { NewStandardService } from './new-standard.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

describe('NewStandardService', () => {
  let service: NewStandardService<{}>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };

  const apiUrl = 'https://TEST-Fuse-Service-2-api.practicemgmt-TEST.pattersondevops.com/servicecodes';

  const checkDuplicatesApiUrl = 'https://TEST-Fuse-Service-2-api.practicemgmt-TEST.pattersondevops.com/servicecodes/duplicates/00000000-0000-0000-0000-000000000000?Code=sds';
  const checkDuplicatesApiResponse = { Count: null, ExtendedStatusCode: null, InvalidProperties: null, Value: false };

  const saveAPIRes = {
    Count: null, ExtendedStatusCode: null, InvalidProperties: null,
    Value: {
      ServiceCodeId: 'bd52f77d-ec28-44b1-91a8-0b16365a0e35',
      CdtCodeId: null,
      CdtCodeName: null,
      Code: 'sds',
      Description: 'sdfsfd'
    }
  };

  const apiRequest = {
    AffectedAreaId: 0,
    AffectedAreaName: null,
    AmaDiagnosisCode: null,
    CPT: null,
    CdtCodeId: null,
    CdtCodeName: "",
    Code: "0108test",
    CompleteDescription: null,
    DataTag: "AAAAAAAsujw=",
    DateModified: "2023-08-24T08:16:57.9940383",
    Description: "0108-Desc",
    DisplayAs: "0108-Disd",
    DrawTypeDescription: null,
    DrawTypeId: null,
    IconName: "",
    InactivationDate: null,
    InactivationRemoveReferences: false,
    IsActive: true,
    IsEligibleForDiscount: false,
    IsSwiftPickCode: true,
    LastUsedDate: null,
    LocationSpecificInfo: null,
    Modifications: [],
    Modifier: null,
    Notes: null,
    PracticeId: 38638,
    ServiceCodeId: "9e0ce76f-ac4f-4263-8c28-22c4abcb3e6b",
    ServiceTypeDescription: "Swift Code",
    ServiceTypeId: null,
    SetsToothAsMissing: false,
    SmartCode1Id: null,
    SmartCode2Id: null,
    SmartCode3Id: null,
    SmartCode4Id: null,
    SmartCode5Id: null,
    SubmitOnInsurance: false,
    SwiftPickServiceCodes: [
      { ServiceCodeId: '88039605-ba6d-47cb-b9af-4a40e5ddfded', CdtCodeId: 'bd05d36e-465a-4bd3-9ce4-a2be65e6050f', CdtCodeName: 'D1110', Code: '01Aug22', Description: 'prophylaxis, adult.' },
      { ServiceCodeId: 'aefabd12-4490-4edc-8b54-1d8d8540e712', CdtCodeId: '63660ed5-6973-4731-9d53-6eea8fa3f592', CdtCodeName: 'D9985', Code: '040823', Description: 'Sales Tax_qor' }
    ]
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [

      ]
    })

    service = TestBed.inject(NewStandardService);
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    service = TestBed.inject(NewStandardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('load ->', () => {
    it('should load a data and return it', () => {
      service.load('bd52f77d-ec28-44b1-91a8-0b16365a0e35', apiUrl, 'ServiceCodeId').then(
        res => { expect(res).toEqual(false) },
        error => fail(error)
      );
      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toEqual('GET');
      req.flush(checkDuplicatesApiResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Not found';
      service.load('bd52f77d-ec28-44b1-91a8-0b16365a0e35', apiUrl, 'ServiceCodeId').then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(apiUrl);
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });

    it('should load a data and return it', () => {
      service.load('bd52f77d-ec28-44b1-91a8-0b16365a0e35', apiUrl, null).then(
        res => expect(res).toEqual(false),
        error => fail(error)
      );
      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toEqual('GET');
      req.flush(checkDuplicatesApiResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Not found';
      service.load('bd52f77d-ec28-44b1-91a8-0b16365a0e35', apiUrl, null).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(apiUrl);
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });

  });

  describe('save ->', () => {
    it('should save a data and return it', () => {
      service.save(apiRequest, apiUrl, 'Post').then(
        res => expect(res).toEqual(saveAPIRes.Value),
        error => fail(error)
      );
      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toEqual('POST');
      req.flush(saveAPIRes);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Not found';
      service.save(apiRequest, apiUrl, 'Post').then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(apiUrl);
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });
  });

  describe('Update ->', () => {
    it('Should update a data and return it', () => {
      service.save(apiRequest, apiUrl, 'Put').then(
        res => expect(res).toEqual(saveAPIRes.Value),
        error => fail(error)
      );
      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toEqual('PUT');
      req.flush(saveAPIRes);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Not found';
      service.save(apiRequest, apiUrl, 'put').then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(apiUrl);
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });
  });

  describe('Check Duplicates ->', () => {
    it('Should check duplicate service code and return it', () => {
      service.checkDuplicate(apiRequest, checkDuplicatesApiUrl).then(
        res => expect(res).toEqual(checkDuplicatesApiResponse),
        error => fail(error)
      );
      const req = httpTestingController.expectOne(checkDuplicatesApiUrl);
      expect(req.request.method).toEqual('GET');
      req.flush(checkDuplicatesApiResponse);
    });

    it('should turn 404 error into user-facing error', () => {

      const msg = 'Not found';
      service.checkDuplicate(apiRequest, checkDuplicatesApiUrl).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(checkDuplicatesApiUrl);
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });
  });

  describe('Delete ->', () => {
    it('Delete service code and return data', () => {
      service.delete(apiRequest, apiUrl, 'ServiceCodeId').then(
        res => expect(res).toEqual(saveAPIRes.Value),
        error => fail(error)
      );
      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toEqual('DELETE');
      req.flush(saveAPIRes);
    });

    it('should turn 404 error into user-facing error', () => {

      const msg = 'Not found';
      service.delete(apiRequest, apiUrl, 'ServiceCodeId').then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(apiUrl);
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });
  });

  describe('validate ->', () => {
    it('validate service code and return data', () => {
      const promise = service.validate(() => { }, apiRequest)
      promise.then((res) => {
        expect(res).not.toEqual(null);
      });
    });


  });

});
