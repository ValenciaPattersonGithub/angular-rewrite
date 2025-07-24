import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CDTCodeModel } from '../../business-center/service-code/cdtcodepickermodel';
import { CdtCodeService } from './cdt-code.service';

const mockSoarConfig = {
    domainUrl: 'https://localhost:35440',
};
const mockLocalizeService = {
    getLocalizedString: () => 'translated text'
};
const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};
let CDTCodeData: CDTCodeModel[] = [{
    AffectedAreaId: 1,
    CdtCodeId: "3a19780a-cea2-41f0-9d02-946422a4f5f5",
    Code: "D0140",
    DataTag: "AAAAAACFqHU=",
    DateModified: "2016-11-11T18:17:08.1363535",
    Description: "limited oral evaluation - problem focused",
    DisplayAs: "LimEx",
    IconName: "D0140_limited_ora_evaluation_problem_focused",
    ServiceTypeId: "174a72df-c300-40ac-a6b8-96e8f7410e98",
    SubmitOnInsurance: true,
    TaxableServiceTypeId: 1,
    UserModified: "00000000-0000-0000-0000-000000000000"
}];
let url = "";
let mockSearchParams = {
    search: "D0140",
    skip: 0,
    take: 1,
    sortBy: null,
    includeInactive: false
};

describe('CdtCodeServiceService', () => {
    let service: CdtCodeService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: 'SoarConfig', useValue: mockSoarConfig },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory }
            ]
        });

        service = TestBed.inject(CdtCodeService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getList', () => {
        beforeEach(() => {
            url = mockSoarConfig.domainUrl + '/cdtcodes';
        })

        it('should be OK returning no cdtCodes', () => {
            service.getList().then(
                res => expect(res).toEqual([]),
                error => fail
            );

            const req = httpTestingController.expectOne(url);
            req.flush([]); // Respond with empty CDTCodes
        });

        it('should call getList and return an array of CDTModelList ', () => {
            service.getList().then(
                res => expect(res).toEqual(CDTCodeData),
                error => fail
            );

            // TreatmentConsentService should have made one request to GET consnt from expected URL
            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toEqual('GET');

            // Respond with the mock consent
            req.flush(CDTCodeData);
        });

        it("should throw error with response body when server returns error other than 404", () => {
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';

            service.getList().then(
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

    describe('search', () => {
        beforeEach(() => {
            url = mockSoarConfig.domainUrl + '/cdtcodes/search';
        })
        it('should be OK returning no cdtCodes', () => {
            service.search(mockSearchParams).then(
                res => expect(res).toEqual([]),
                error => fail
            );

            const req = httpTestingController.expectOne(url + "?search=D0140&skip=0&take=1&sortBy=null&includeInactive=false");
            req.flush([]); // Respond with empty CDTCodes
        });

        it('should call getList and return an array of CDTModelList on filter list', () => {
            service.search(mockSearchParams).then(
                res => expect(res).toEqual(CDTCodeData),
                error => fail
            );

            // TreatmentConsentService should have made one request to GET consnt from expected URL
            const req = httpTestingController.expectOne(url + "?search=D0140&skip=0&take=1&sortBy=null&includeInactive=false");
            expect(req.request.method).toEqual('GET');

            // Respond with the mock consent
            req.flush(CDTCodeData);
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

    describe('IsValid', () => {
        beforeEach(() => {
            url = mockSoarConfig.domainUrl + '/cdtcodes/IsValid';
        })
        it('should be OK returning no cdtCodes', () => {
            service.IsValid({ Code: "D0140" }).then(
                res => expect(res).toEqual([]),
                error => fail
            );

            const req = httpTestingController.expectOne(url + "?Code=D0140");
            req.flush([]); // Respond with empty CDTCodes
        });

        it('should call getList and return an array of CDTModelList on filter list', () => {
            service.IsValid({Code: "D0140"}).then(
                res => expect(res).toEqual(CDTCodeData),
                error => fail
            );

            // TreatmentConsentService should have made one request to GET consnt from expected URL
            const req = httpTestingController.expectOne(url + "?Code=D0140");
            expect(req.request.method).toEqual('GET');

            // Respond with the mock consent
            req.flush(CDTCodeData);
        });
        
        it("should throw error with response body when server returns error other than 404", () => {
            const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
            const msg = 'Not found';

            service.IsValid(null).then(
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
            service.IsValid(null).then(
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
});