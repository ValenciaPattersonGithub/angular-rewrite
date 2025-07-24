import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AccountStatementMessagesService } from './account-statement-messages.service';

let mockSoarConfig = {
  domainUrl: 'https://localhost:35440',
};

let messageData = {
  Name: "name", Message: "message",
  AccountStatementMessageId: null,
  DataTag: null,
  DateModified: null,
  UserModified: null
};
let url = "";

describe('AccountStatementMessagesService', () => {
  let service: AccountStatementMessagesService;
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: 'SoarConfig', useValue: mockSoarConfig }
      ]
    });

    service = TestBed.inject(AccountStatementMessagesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/accounts/accountstatementmessage';
    })

    it('should be OK returning no messages', () => {
      service.all().then(
        res => expect(res).toEqual([]),
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      req.flush([]); 
    });

    it('should call get and return an array of account-messages', () => {
      service.all().then(
        res => expect(res).toEqual(messageData),
        error => fail
      );

      // TreatmentConsentService should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(messageData);
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.all().then(
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
  })

  describe('save', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/accounts/accountstatementmessage';
    })

    it('should save a Account Messages and return it', () => {
      service.save(messageData).then(
        res => expect(res).toEqual(messageData),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      req.flush(messageData); 
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.save(messageData).then(
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
  })

  describe('update', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/accounts/accountstatementmessage';
    })
    it('should update a Account Messages and return it', () => {
      service.update(messageData).then(
        res => expect(res).toEqual(messageData),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      req.flush(messageData); 
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.update(messageData).then(
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
  })

  describe('getDuplicate', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/accounts/accountstatementmessage/duplicates';
    })
    let msgKey = {name:"message"};
    it('should be OK returning no messages', () => {
      service.getDuplicate(msgKey).then(
        res => expect(res).toEqual([]),
        error => fail
      );

      const req = httpTestingController.expectOne(url + "?name=message");
      req.flush([]); 
    });

    it('should call get and return an array of account-messages', () => {
      service.getDuplicate(msgKey).then(
        res => expect(res).toEqual(messageData),
        error => fail
      );

      // TreatmentConsentService should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url + "?name=message");
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(messageData);
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.getDuplicate(msgKey).then(
        res => fail('expected to fail'),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url + "?name=message");
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });
  })  
});
