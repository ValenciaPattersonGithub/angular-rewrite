import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TeamMemberIdentifierService } from './team-member-identifier.service';

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

let mockTeamMemberIdentifier ={ DataTag: 'AAAAAAALtDw=', DateDeleted: null, DateModified: new Date(), Description: 'Test', MasterUserIdentifierId: '16ca7326-0ae7-4f0f-be7d-16428b431c3b', Qualifier: 3, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' };

let mockSave = [
  {
    ExtendedStatusCode: null,
    Value: {
        MasterUserIdentifierId: 285,
        Description: "newid",
        DateDeleted: null,
        Qualifier: null,
        DataTag: "AAAAAAAmJuA=",
        UserModified: "00000000-0000-0000-0000-000000000000",
        DateModified: "0001-01-01T00:00:00"
    },
    Count: null,
    InvalidProperties: null
}
]

describe('TeamMemberIdentifierService', () => {
  let service: TeamMemberIdentifierService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeamMemberIdentifierService,
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: 'patSecurityService', useValue: mockPatSecurityService }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TeamMemberIdentifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  
  describe('get ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/masteruseridentifiers';
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
        res => expect(res).toEqual(mockTeamMemberIdentifier),
        error => fail
      );

      // Service should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(mockTeamMemberIdentifier);
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

  describe('teamMemberIdentifier ->', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/masteruseridentifiers';
    })

    it('should be OK returning no messages', () => {
      service.teamMemberIdentifier().then(
        res => expect(res).toEqual([]),
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      req.flush([]); 
    });

    it('should call teamMemberIdentifier and return an array of additional identifier', () => {
      service.teamMemberIdentifier().then(
        res => expect(res).toEqual(mockTeamMemberIdentifier),
        error => fail
      );

      // Service should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(mockTeamMemberIdentifier);
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.teamMemberIdentifier().then(
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
      url = mockSoarConfig.domainUrl + '/masteruseridentifiers';
    })

    it('should save a data and return it', () => {
      service.save(mockTeamMemberIdentifier).then(
        res => expect(res).toEqual(mockSave),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      req.flush(mockSave); 
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.save(mockTeamMemberIdentifier).then(
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
      url = mockSoarConfig.domainUrl + '/masteruseridentifiers';
    })
    it('should update a defaultMessages and return it', () => {
      service.update(mockTeamMemberIdentifier).then(
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

      service.update(mockTeamMemberIdentifier).then(
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

  //delete()
  describe('DELETE', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/masteruseridentifiers/' + mockTeamMemberIdentifier.MasterUserIdentifierId;
    })
    it('hould delete a message and return it', () => {
      let mockDeleteId =  mockTeamMemberIdentifier.MasterUserIdentifierId;
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
      let mockDeleteId =  mockTeamMemberIdentifier.MasterUserIdentifierId;
      url = mockSoarConfig.domainUrl + '/masteruseridentifiers/' + mockTeamMemberIdentifier.MasterUserIdentifierId;
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
