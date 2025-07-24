import { TestBed } from '@angular/core/testing';
import { PaymentTypesService } from './payment-types.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentTypes } from 'src/business-center/payment-types/payment-types.model';

const mockSoarConfig = {
  domainUrl: 'https://localhost:35440',
};

let url = "";

const mockPaymentTypeData: PaymentTypes[] = [{
  PaymentTypeId: "8e59c941-dd99-4470-8a42-42d65f62896e",
  IsSystemType: false,
  Description: "Acc_pay_check",
  Prompt: "",
  CurrencyTypeId: 2,
  CurrencyTypeName: "CHECK",
  IsActive: true,
  IsUsedInCreditTransactions: true,
  IsDefaultTypeOnBenefitPlan: false,
  PaymentTypeCategory: 1,
  DataTag: "AAAAAAAstNc=",
  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
  DateModified: "2023-08-23T11:09:13.2331083"
}];

const mockPatSecurityService = {
  IsAuthorizedByAbbreviation: jasmine.createSpy("patSecurityService.IsAuthorizedByAbbreviation").and.returnValue(true)
};

describe('PaymentTypesService', () => {
  let service: PaymentTypesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: 'patSecurityService', useValue: mockPatSecurityService }
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PaymentTypesService);
    mockPatSecurityService.IsAuthorizedByAbbreviation.and.returnValue(true);
    url = mockSoarConfig.domainUrl + '/paymenttypes'
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe("getAllPaymentTypes -->", () => {
    it('should call getAllPaymentTypes and return OK if no data', () => {
      service.getAllPaymentTypes().then(
        (res) => expect(res).toEqual([]),
        (error) => fail(`${error}-expected to fail`),
      )
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush([]);
    })

    it('should call getAllPaymentTypes and return data', () => {
      service.getAllPaymentTypes().then(
        (res) => expect(res).toEqual(mockPaymentTypeData),
        (error) => fail(`${error}-expected to fail`),
      )
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(mockPaymentTypeData);
    })

    it('should throw error with response body when server returns error other than 404', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      service.getAllPaymentTypes().then(
        res => fail(`${res}-expected to fail`),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    })

    it('should not call getAllPaymentTypes if no access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation.and.returnValue(false);
      const result = service.getAllPaymentTypes();
      expect(result).toBe(undefined);
    })
  })

  describe('update -->', () => {
    it('should call update paymenttypes and return it', () => {
      service.update(mockPaymentTypeData[0]).then(
        res => expect(res).toEqual(mockPaymentTypeData[0]),
        (error) => fail(`${error}-expected to fail`),
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      req.flush(mockPaymentTypeData[0]);
    });

    it('should call update and return 404 error into user-facing error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      service.update(mockPaymentTypeData[0]).then(
        res => fail(`${res}expected to fail`),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    });

    it('should not call update if no access', () => {
      const result = service.update(null);
      expect(result).toBe(undefined);
    })
  })

  describe('deletePaymentTypeById -->', () => {
    const mockDeleteId = "1";

    it('should call deletePaymentTypeById and return paymenttypes', () => {
      service.deletePaymentTypeById(mockDeleteId).then(
        res => expect(res).toEqual(""),
        error => fail(`${error}-expected to fail`),
      );
      const req = httpTestingController.expectOne(url + "/" + mockDeleteId);
      expect(req.request.method).toEqual('DELETE');
      req.flush("");
    })

    it('should call deletePaymentTypeById and return 404 error while deleting payment type', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      service.deletePaymentTypeById(mockDeleteId).then(
        res => fail(`${res}-expected to fail`),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      )
      const req = httpTestingController.expectOne(url + "/" + mockDeleteId);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    })

    it('should not call deletePaymentTypeById if no access', () => {
      const result = service.deletePaymentTypeById(null);
      expect(result).toBe(undefined);
    })
  })

  describe('save -->', () => {
    it('should call save a data and return it', () => {
      service.save(mockPaymentTypeData[0]).then(
        res => expect(res).toEqual(mockPaymentTypeData[0]),
        error => fail(`${error}-expected to fail`),
      );
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      req.flush(mockPaymentTypeData[0]);
    })

    it('should call save turn 404 error while saving payment types', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.save(mockPaymentTypeData[0]).then(
        res => fail(`${res}-expected to fail`),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      )
      const req = httpTestingController.expectOne(url);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    })

    it('should not call save if no access', () => {
      const result = service.save(null);
      expect(result).toBe(undefined);
    })
  })

  describe("getAllPaymentTypesMinimal -->", () => {
    beforeEach(() => {
      url = url + "/minimal";
    })

    it('should call getAllPaymentTypesMinimal return OK if no data', () => {
      service.getAllPaymentTypesMinimal(true, 1).then(
        (res) => expect(res).toEqual([]),
        (error) => fail(`${error}-expected to fail`),
      )

      const req = httpTestingController.expectOne(url + "?isActive=true&paymentTypeCategory=1");
      expect(req.request.method).toEqual('GET');
      req.flush([]);
    })

    it('should call getAllPaymentTypesMinimal and return data', () => {
      service.getAllPaymentTypesMinimal(true, 1).then(
        (res) => expect(res).toEqual(mockPaymentTypeData),
        (error) => fail(`${error}-expected to fail`),
      )

      const req = httpTestingController.expectOne(url + "?isActive=true&paymentTypeCategory=1");
      expect(req.request.method).toEqual('GET');
      req.flush(mockPaymentTypeData);
    })

    it('should call getAllPaymentTypesMinimal and return 404 error while', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';
      service.getAllPaymentTypesMinimal(true, 1).then(
        res => fail(`${res}-expected to fail`),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      )
      const req = httpTestingController.expectOne(url + "?isActive=true&paymentTypeCategory=1");
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    })

    it('should not call getAllPaymentTypesMinimal if no access', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation.and.returnValue(false);
      const result = service.getAllPaymentTypesMinimal(true, 1);
      expect(result).toBe(undefined);
    })
  })

  describe("getPaymentTypeById", () => {
    const PaymentTypeById = "1";

    it('should call getPaymentTypeById return OK if no data', () => {
      service.getPaymentTypeById(PaymentTypeById).then(
        (res) => expect(res).toEqual([]),
        (error) => fail(`${error}-expected to fail`),
      )
      const req = httpTestingController.expectOne(url + "/" + PaymentTypeById);
      expect(req.request.method).toEqual('GET');
      req.flush([]);
    })

    it('should call getPaymentTypeById and return data', () => {
      service.getPaymentTypeById(PaymentTypeById).then(
        (res) => expect(res).toEqual(mockPaymentTypeData),
        (error) => fail(`${error}-expected to fail`),
      )
      const req = httpTestingController.expectOne(url + "/" + PaymentTypeById);
      expect(req.request.method).toEqual('GET');
      req.flush(mockPaymentTypeData);
    })

    it('should call getPaymentTypeById and return 404 error', () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.getPaymentTypeById(PaymentTypeById).then(
        res => fail(`${res}-expected to fail`),
        err => {
          expect(err.error).toEqual(msg)
          expect(err.message).toContain(mockErrorResponse.statusText)
        }
      );
      const req = httpTestingController.expectOne(url + "/" + PaymentTypeById);
      // respond with a 404 and the error message in the body
      req.flush(msg, mockErrorResponse);
    })

    it('should not return promise getPaymentTypeById if no access', () => {
      const result = service.getPaymentTypeById(null);
      expect(result).toBe(undefined);
    })
  })

});
