import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LocationIdentifierService } from './location-identifier.service';

const mockSoarConfig = {
  domainUrl: 'https://localhost:35440',
};

let mockPatSecurityService = {
  IsAuthorizedByAbbreviation: (AccessCode) => {
    if (AccessCode == "soar-biz-ailoc-view" || AccessCode == "soar-biz-ailoc-manage") {
      return true;
    }
    else {
      return false;
    }

  },
  generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
};

let url = "";

let locationIdentifierList = { DataTag: 'AAAAAAALtDw=', DateDeleted: null, DateModified: null, Description: 'Test', MasterLocationIdentifierId: '16ca7326-0ae7-4f0f-be7d-16428b431c3b', Qualifier: 3, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' };

describe('LocationIdentifierService', () => {
  let service: LocationIdentifierService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LocationIdentifierService,
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: 'patSecurityService', useValue: mockPatSecurityService }
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(LocationIdentifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/locationidentifier';
    })

    it('should be OK returning no messages', () => {
      service.get().then(
        res => expect(res).toEqual([]),
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      req.flush([]);
    });

    it('should call get and return an array of additional identifier', () => {
      service.get().then(
        res => expect(res).toEqual(locationIdentifierList),
        error => fail
      );

      // Service should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(locationIdentifierList);
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

  describe('locationIdentifier ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/locationidentifier/' + locationIdentifierList.MasterLocationIdentifierId;
    })

    it('should be OK returning no messages', () => {
      service.locationIdentifier(locationIdentifierList.MasterLocationIdentifierId).then(
        res => expect(res).toEqual([]),
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      req.flush([]);
    });

    it('should call locationIdentifier and return an array of additional identifier', () => {
      service.locationIdentifier(locationIdentifierList.MasterLocationIdentifierId).then(
        res => expect(res).toEqual(locationIdentifierList),
        error => fail
      );

      // Service should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(locationIdentifierList);
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.locationIdentifier(locationIdentifierList.MasterLocationIdentifierId).then(
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
      url = mockSoarConfig.domainUrl + '/locationidentifier';
    })

    it('should save a additional identifier and return it', () => {
      service.save(locationIdentifierList).then(
        res => expect(res).toEqual(locationIdentifierList),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      req.flush(locationIdentifierList);
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.save(locationIdentifierList).then(
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
      url = mockSoarConfig.domainUrl + '/locationidentifier';
    })
    it('should update a additional identifier and return it', () => {
      service.update(locationIdentifierList).then(
        res => expect(res).toEqual(locationIdentifierList),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      req.flush(locationIdentifierList);
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.update(locationIdentifierList).then(
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
      url = mockSoarConfig.domainUrl + '/locationidentifier/' + locationIdentifierList.MasterLocationIdentifierId;
    })
    it('Should delete addiotional identifier and return it', () => {
      let mockDeleteId = locationIdentifierList.MasterLocationIdentifierId;
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
      let mockDeleteId = locationIdentifierList.MasterLocationIdentifierId;
      url = mockSoarConfig.domainUrl + '/locationidentifier/' + locationIdentifierList.MasterLocationIdentifierId;
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
