import { TestBed } from '@angular/core/testing';
import { InformedConsentMessageService } from './informed-consent-message.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InformedConsentModel } from 'src/business-center/practice-settings/models/informed-consent.model';

describe('InformedConsentMessageService', () => {
  let service: InformedConsentMessageService;
  let httpTestingController: HttpTestingController;
  const mockSoarConfig = {
    domainUrl: 'https://localhost:35440',
  };

  let url = mockSoarConfig.domainUrl + '/practiceSettings/informedconsenttext';

  let mockLocalizeService = {
    getLocalizedString: () => 'translated text'
  };

  let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };

  let mockPatSecurityService = {
    generateMessage: jasmine.createSpy().and.returnValue(''),
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
  };

  let InformedConsentMessageDto: InformedConsentModel = {
    DataTag: "AAAAAACFqHU=",
    DateModified: "2016-11-11T18:17:08.1363535",
    Text: "Test Search",
    UserModified: "00000000-0000-0000-0000-000000000000"
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Import the HttpClient mocking services
      imports: [HttpClientTestingModule],
      // Provide the service-under-test
      providers: [InformedConsentMessageService,
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },

      ]
    });
    service = TestBed.inject(InformedConsentMessageService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInformedConsentMessage', () => {
    it('should call getInformedConsentMessage and return an object of InformedCosnentModel ', () => {
      service.getInformedConsentMessage().then(
        res => expect(res).toEqual(InformedConsentMessageDto),
        error => fail
      );

      // InformedConsentMessageService should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(InformedConsentMessageDto);
    });

    it("should throw error with response body when server returns error other than 404", () => {
      const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };
      const msg = 'Not found';

      service.getInformedConsentMessage().then(
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

  describe('access', () => {
    it('should call access', () => {
      service.access();
      expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalled();
    });
  });

  describe('deleteAccess', () => {
    it('should call deleteAccess', () => {
      service.deleteAccess();
      expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalled();
    });
  });

  describe('editAccess', () => {
    it('should call editAccess', () => {
      service.editAccess();
      expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalled();
    });
  });

  describe('viewAccess', () => {
    it('should call viewAccess', () => {
      service.viewAccess();
      expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalled();
    });
  });

  describe('save for updating existing details', () => {
    it('should update a InformedCosentMessage', () => {
      const msg = 'Success';
      let updateInformedConsentMessageDto =
      {
        DataTag: "AAAAAAAV23E",
        DateModified: "2016-11-11T18:17:08.1363535",
        Text: "Test Search",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      };

      service.save(updateInformedConsentMessageDto).then(
        res => expect(res).toEqual(InformedConsentMessageDto),
        error => fail
      );

      // InformedConsentMessageService should have made one request to POST InformedConsentText
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      // Respond with the mock consent
      req.flush(InformedConsentMessageDto);
    });

    it('should return 404 error into user-facing error', () => {
      const msg = 'Deliberate 404';
      const createInformedConsentTextDto =
      {
        DataTag: "AAAAAAAV23E",
        DateModified: "2022-10-21T03:11:16.2419421",
        Text: "Sample Text\npgwzqfsvhgzpwepcpjpxqvkijptcmbrldjvcrayvoahexbvefmatmoafqhixpxmoiqvgvrmqxwcwnelmxaubeaieiiedobytqjkwmmtsjabnxbmfyyzntmacpttdbgukgoafnyevmimebbocjjatvzgeythwhgztpvfxckezsuptubcgoxuitlfiejloicuuocplvgxxxuunspkyodjqugjdytgoaaxjkbkphmkamafdvbgkyifushvjjnmbciiosxrplnmwbnzkhcrwvoswxndmtsihbzwpkrkmbtrvbxhitfuceadalbbbpwfmxgrlelqvzdblhdxtkplxeasgjdnhpglbtvteldgveblmofqfrpcxibuqkevrtjksdbfljmaxnonhrmtnobpvczrlwmxfxwxgggpvbdyukxeccwpetebffssddddddddddjs",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
      };
      service.save(createInformedConsentTextDto).then(
        res => fail('expected to fail'),
        error => expect(error.message).toContain(msg)
      );

      const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
    });
  });

  describe('save for creating new details', () => {
    it('should create a InformedConsentMessage', () => {
      let createInformedConsentMessageDto =
      {
        DataTag: "AAAAAAAV23E",
        DateModified: "",
        Text: "Test Search",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      };

      service.save(createInformedConsentMessageDto).then(
        res => expect(res).toEqual(InformedConsentMessageDto),
        error => fail
      );

      // InformedConsentMessageService should have made one request to POST InformedConsentText
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      // Respond with the mock consent
      req.flush(InformedConsentMessageDto);
    });

    it('should return 404 error into user-facing error', () => {
      const msg = 'Deliberate 404';
      const createInformedConsentTextDto =
      {
        DataTag: "AAAAAAAV23E",
        DateModified: "",
        Text: "Sample Text",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
      };
      service.save(createInformedConsentTextDto).then(
        res => fail('expected to fail'),
        error => expect(error.message).toContain(msg)
      );

      const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
    });

  });
});
