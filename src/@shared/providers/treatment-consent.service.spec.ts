import { HttpClient, HttpResponse } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { TreatmentConsentModel } from "src/business-center/practice-settings/models/treatment-consent.model";
import { TreatmentConsentService } from "./treatment-consent.service";

const mockSoarConfig = {
    domainUrl: 'https://localhost:35440',
};
let mockLocalizeService = {
    getLocalizedString: () => 'translated text'
};
let mockTreatmentConsentTextDto: TreatmentConsentModel = {
    DataTag: "AAAAAAAV23E",
    DateModified: "2022-10-21T03:11:16.2419421",
    Text: "Sample Text\npgwzqfsvhgzpwepcpjpxqvkijptcmbrldjvcrayvoahexbvefmatmoafqhixpxmoiqvgvrmqxwcwnelmxaubeaieiiedobytqjkwmmtsjabnxbmfyyzntmacpttdbgukgoafnyevmimebbocjjatvzgeythwhgztpvfxckezsuptubcgoxuitlfiejloicuuocplvgxxxuunspkyodjqugjdytgoaaxjkbkphmkamafdvbgkyifushvjjnmbciiosxrplnmwbnzkhcrwvoswxndmtsihbzwpkrkmbtrvbxhitfuceadalbbbpwfmxgrlelqvzdblhdxtkplxeasgjdnhpglbtvteldgveblmofqfrpcxibuqkevrtjksdbfljmaxnonhrmtnobpvczrlwmxfxwxgggpvbdyukxeccwpetebffssddddddddddjs",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
};
let mockPatSecurityService = {
    generateMessage: jasmine.createSpy().and.returnValue(''),
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
};

const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};

let url = mockSoarConfig.domainUrl + '/practiceSettings/treatmentConsentText';

describe('TreatmentConsentService (with mocks)', () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;
    let treatmentConsentService: TreatmentConsentService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            // Import the HttpClient mocking services
            imports: [HttpClientTestingModule],
            // Provide the service-under-test
            providers: [TreatmentConsentService,
                { provide: 'SoarConfig', useValue: mockSoarConfig },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },

            ]
        });

        // Inject the http, test controller, and service-under-test
        // as they will be referenced by each test.
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
        treatmentConsentService = new TreatmentConsentService(httpClient, mockSoarConfig, mockPatSecurityService, mockToastrFactory, mockLocalizeService);
    });

    afterEach(() => {
        // After every test, assert that there are no more pending requests.
        httpTestingController.verify();
    });


    /// TreatmentConsentService method tests begin ///
    describe('#getConsent', () => {

    it('should return expected consent (called once)', () => {
      treatmentConsentService.getConsent().then(
        res => { expect(res).toEqual(mockTreatmentConsentTextDto);
                    },
        error => fail
      );

            // TreatmentConsentService should have made one request to GET consnt from expected URL
            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(mockTreatmentConsentTextDto);      
    });

        it('should be OK returning no treatmentConsentText', () => {
            treatmentConsentService.getConsent().then(
                res => expect(res).toEqual([]),
                error => fail
            );

            const req = httpTestingController.expectOne(url);
            req.flush([]); // Respond with no treatmentConsentText
        });

        it('should turn 404 into a user-friendly error', () => {
            const msg = 'Deliberate 404';
            treatmentConsentService.getConsent().then(
                res => fail('expected to fail'),
                error => expect(error.message).toContain(msg)
            );


            const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
    });
  });


    describe('#createTreatmentConsent', () => {

        it('should create a treatmentConsentText and return it', () => {

            const createTreatmentConsentTextDto =
            {
                DataTag: "AAAAAAAV23E",
                DateModified: "2022-10-21T03:11:16.2419421",
                Text: "Sample Text\npgwzqfsvhgzpwepcpjpxqvkijptcmbrldjvcrayvoahexbvefmatmoafqhixpxmoiqvgvrmqxwcwnelmxaubeaieiiedobytqjkwmmtsjabnxbmfyyzntmacpttdbgukgoafnyevmimebbocjjatvzgeythwhgztpvfxckezsuptubcgoxuitlfiejloicuuocplvgxxxuunspkyodjqugjdytgoaaxjkbkphmkamafdvbgkyifushvjjnmbciiosxrplnmwbnzkhcrwvoswxndmtsihbzwpkrkmbtrvbxhitfuceadalbbbpwfmxgrlelqvzdblhdxtkplxeasgjdnhpglbtvteldgveblmofqfrpcxibuqkevrtjksdbfljmaxnonhrmtnobpvczrlwmxfxwxgggpvbdyukxeccwpetebffssddddddddddjs",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            };

            treatmentConsentService.createConsent(createTreatmentConsentTextDto).then(
                res => expect(res).toEqual(mockTreatmentConsentTextDto),
                error => fail
            );

            // TreatmentConsentService should have made one request to GET treatmentConsentText
            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toEqual('POST');
            expect(req.request.body).toEqual(mockTreatmentConsentTextDto);

        // Expect server to return the treatmentConsentText after GET
        const expectedResponse = new HttpResponse(
          { status: 200, statusText: 'OK', body: mockTreatmentConsentTextDto });
        req.event(expectedResponse);
       });

        it('should turn 404 error into user-facing error', () => {
            const msg = 'Deliberate 404';
            const createTreatmentConsentTextDto =
            {
                DataTag: "AAAAAAAV23E",
                DateModified: "2022-10-21T03:11:16.2419421",
                Text: "Sample Text\npgwzqfsvhgzpwepcpjpxqvkijptcmbrldjvcrayvoahexbvefmatmoafqhixpxmoiqvgvrmqxwcwnelmxaubeaieiiedobytqjkwmmtsjabnxbmfyyzntmacpttdbgukgoafnyevmimebbocjjatvzgeythwhgztpvfxckezsuptubcgoxuitlfiejloicuuocplvgxxxuunspkyodjqugjdytgoaaxjkbkphmkamafdvbgkyifushvjjnmbciiosxrplnmwbnzkhcrwvoswxndmtsihbzwpkrkmbtrvbxhitfuceadalbbbpwfmxgrlelqvzdblhdxtkplxeasgjdnhpglbtvteldgveblmofqfrpcxibuqkevrtjksdbfljmaxnonhrmtnobpvczrlwmxfxwxgggpvbdyukxeccwpetebffssddddddddddjs",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            };
            treatmentConsentService.createConsent(createTreatmentConsentTextDto).then(
                res => fail('expected to fail'),
                error => expect(error.message).toContain(msg)
            );

            const req = httpTestingController.expectOne(url);

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
      });

    });

    describe('#updateTreatmentConsent', () => {

        it('should update a treatmentConsentText and return it', () => {

            const updateTreatmentConsentTextDto =
            {
                DataTag: "AAAAAAAV23E",
                DateModified: "2022-10-21T03:11:16.2419421",
                Text: "Sample Text\npgwzqfsvhgzpwepcpjpxqvkijptcmbrldjvcrayvoahexbvefmatmoafqhixpxmoiqvgvrmqxwcwnelmxaubeaieiiedobytqjkwmmtsjabnxbmfyyzntmacpttdbgukgoafnyevmimebbocjjatvzgeythwhgztpvfxckezsuptubcgoxuitlfiejloicuuocplvgxxxuunspkyodjqugjdytgoaaxjkbkphmkamafdvbgkyifushvjjnmbciiosxrplnmwbnzkhcrwvoswxndmtsihbzwpkrkmbtrvbxhitfuceadalbbbpwfmxgrlelqvzdblhdxtkplxeasgjdnhpglbtvteldgveblmofqfrpcxibuqkevrtjksdbfljmaxnonhrmtnobpvczrlwmxfxwxgggpvbdyukxeccwpetebffssddddddddddjs",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            };

            treatmentConsentService.updateConsent(updateTreatmentConsentTextDto).then(
                res => expect(res).toEqual(updateTreatmentConsentTextDto),
                error => fail
            );

            // TreatmentConsentService should have made one request to PUT treatmentConsentText
            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toEqual('PUT');
            expect(req.request.body).toEqual(updateTreatmentConsentTextDto);

            // Expect server to return the treatmentConsentText after PUT
            const expectedResponse = new HttpResponse(
                { status: 200, statusText: 'OK', body: updateTreatmentConsentTextDto });
            req.event(expectedResponse);
        });

        it('should turn 404 error into user-facing error', () => {
            const msg = 'Deliberate 404';
            const updateTreatmentConsentTextDto =
            {
                DataTag: "AAAAAAAV23E",
                DateModified: "2022-10-21T03:11:16.2419421",
                Text: "Sample Text\npgwzqfsvhgzpwepcpjpxqvkijptcmbrldjvcrayvoahexbvefmatmoafqhixpxmoiqvgvrmqxwcwnelmxaubeaieiiedobytqjkwmmtsjabnxbmfyyzntmacpttdbgukgoafnyevmimebbocjjatvzgeythwhgztpvfxckezsuptubcgoxuitlfiejloicuuocplvgxxxuunspkyodjqugjdytgoaaxjkbkphmkamafdvbgkyifushvjjnmbciiosxrplnmwbnzkhcrwvoswxndmtsihbzwpkrkmbtrvbxhitfuceadalbbbpwfmxgrlelqvzdblhdxtkplxeasgjdnhpglbtvteldgveblmofqfrpcxibuqkevrtjksdbfljmaxnonhrmtnobpvczrlwmxfxwxgggpvbdyukxeccwpetebffssddddddddddjs",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            };
            treatmentConsentService.updateConsent(updateTreatmentConsentTextDto).then(
                res => fail('expected to fail'),
                error => expect(error.message).toContain(msg)
            );

            const req = httpTestingController.expectOne(url);

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
      });


    });

    describe('#deleteTreatmentConsent', () => {

        it('should delete a treatmentConsentText and return it', () => {

            treatmentConsentService.deleteConsent().then(
                res => expect(res).toEqual(""),
                error => fail
            );

            // TreatmentConsentService should have made one request to DELETE treatmentConsentText
            const req = httpTestingController.expectOne(url);
            expect(req.request.method).toEqual('DELETE');
            expect(req.request.body).toEqual(null);

            // Expect server to return the treatmentConsentText after DELETE
            const expectedResponse = new HttpResponse(
                { status: 200, statusText: 'OK', body: "Deleted" });
            req.event(expectedResponse);
        });

        it('should turn 404 error into user-facing error', () => {
            const msg = 'Deliberate 404';
            
            treatmentConsentService.deleteConsent().then(
                res => fail('expected to fail'),
                error => expect(error.message).toContain(msg)
            );

            const req = httpTestingController.expectOne(url);

        // respond with a 404 and the error message in the body
        req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
      });
    
    });
});

