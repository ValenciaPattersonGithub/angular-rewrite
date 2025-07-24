import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConditionsService } from './conditions.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs';
import { MicroServiceApiService } from 'src/security/providers';

const mockSoarConfig = {
  domainUrl: 'https://localhost:35440',
};

const mockApiService = {
  getPracticesUrl: () => "http://localhost"
}

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

let mockConditions = [
  {
    Abbreviation: null,
    AffectedAreaId: 3,
    ConditionId: "c9d43cf6-cd51-4216-a1c8-6300763aecb9",
    DataTag: "AAAAAAAg/FQ=",
    DateModified: "2022-12-31T11:52:38.534119",
    Description: "Blunted Roots",
    DrawTypeId: "1013522d-e533-4aae-a226-3d1bcc95e9cb",
    IconName: "blunted_roots",
    IsDefault: true,
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
  },
  {

    Abbreviation: null,
    AffectedAreaId: 3,
    ConditionId: "d340cb25-6735-4a57-ae37-a8240633363f",
    DataTag: "AAAAAAAg/Fg=",
    DateModified: "2022-12-31T12:01:47.5373681",
    Description: "Abscess",
    DrawTypeId: "74281d3a-d274-4306-8873-86b0b4427f2a",
    IconName: "abscess",
    IsDefault: true,
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
  }
]

describe('ConditionsService', () => {
  let service: ConditionsService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConditionsService, 
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: MicroServiceApiService, useValue: mockApiService },
        { provide: FeatureFlagService, useValue: {
          getOnce$: jasmine.createSpy().and.returnValue(of(false))
        } }
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ConditionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/conditions/' + mockConditions[0].ConditionId;
    })

    it('should be OK returning no condition', () => {
      service.get(mockConditions[0].ConditionId).then(
        res => expect(res).toEqual({ Value: null }),
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      req.flush({ Value: null });
    });

    it('should call get and return the condition', () => {
      service.get(mockConditions[0].ConditionId).then(
        res => expect(res).toEqual({ Value: mockConditions[0] }),
        error => fail
      );

      // Service should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush({ Value: mockConditions[0] });
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.get(mockConditions[0].ConditionId).then(
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
      url = mockSoarConfig.domainUrl + '/conditions';
    })

    it('should save a condition', () => {
      service.save(mockConditions[0]).then(
        res => expect(res).toEqual(mockConditions[0]),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      req.flush(mockConditions[0]); 
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.save(mockConditions[0]).then(
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

  describe('update ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/conditions';
    })
    it('should update a condition and return it', () => {
      service.update(mockConditions[0]).then(
        res => expect(res).toEqual(mockConditions[0]),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      req.flush(mockConditions[0]); 
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.update(mockConditions[0]).then(
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

  describe('delete ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/conditions/' + mockConditions[0].ConditionId;
    })
    it('hould delete a condition and return it', () => {
      let mockDeleteId =  mockConditions[0].ConditionId;
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
      let mockDeleteId =  mockConditions[0].ConditionId;
      url = mockSoarConfig.domainUrl + '/conditions/' + mockConditions[0].ConditionId;
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
});
