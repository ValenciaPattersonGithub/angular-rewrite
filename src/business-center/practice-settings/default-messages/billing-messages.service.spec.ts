import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BillingMessagesService } from './billing-messages.service';

let mockSoarConfig = {
  domainUrl: 'https://localhost:35440',
};
let mockMessageDto = [{
  DataTag: "AAAAAAAMyYM=",
  DateModified: "2022-08-12T12:31:16.2391585",
  InvoiceMessage: "testing",
  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
}]

let url = "";
describe('BillingMessagesService', () => {
  let service: BillingMessagesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: 'SoarConfig', useValue: mockSoarConfig }
      ]
    });

    service = TestBed.inject(BillingMessagesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/practicesettings/billingmessages';
    })

    it('should be OK returning no messages', () => {
      service.get().then(
        res => expect(res).toEqual([]),
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      req.flush([]); 
    });

    it('should call get and return an array of default-messages', () => {
      service.get().then(
        res => expect(res).toEqual(mockMessageDto),
        error => fail
      );

      // Service should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(mockMessageDto);
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
  })

  describe('save', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/practicesettings/billingmessages';
    })

    it('should save a data and return it', () => {
      service.save(mockMessageDto).then(
        res => expect(res).toEqual(mockMessageDto),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      req.flush(mockMessageDto); 
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.save(mockMessageDto).then(
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
      url = mockSoarConfig.domainUrl + '/practicesettings/billingmessages';
    })
    it('should update a defaultMessages and return it', () => {
      service.update(mockMessageDto).then(
        res => expect(res).toEqual(mockMessageDto),
        error => fail
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      req.flush(mockMessageDto); 
    });

    it('should turn 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.update(mockMessageDto).then(
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

  describe('DELETE', () => {
    beforeEach(() => {
      url = mockSoarConfig.domainUrl + '/accounts/accountstatementmessage/';
    })
    it('hould delete a message and return it', () => {
      let mockDeleteId = { accountStatementMessageId: 1 };
      service.deleteMessage(mockDeleteId).then(
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
      let mockDeleteId = { accountStatementMessageId: 1 };
      url = mockSoarConfig.domainUrl + '/accounts/accountstatementmessage/';
      service.deleteMessage(mockDeleteId).then(
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
});
