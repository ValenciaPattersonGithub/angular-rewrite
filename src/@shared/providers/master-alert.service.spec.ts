import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MasterAlertService } from './master-alert.service';

const mockSoarConfig = {
  domainUrl: 'https://localhost:35440',
};
let mockLocalizeService = {
  getLocalizedString: () => 'translated text'
};
let mockPatSecurityService = {
  generateMessage: jasmine.createSpy().and.returnValue(''),
  IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
};

const mockToastrFactory = {
  success: jasmine.createSpy('toastrFactory.success'),
  error: jasmine.createSpy('toastrFactory.error')
};

let mockMasterAlertsList = [
  { MasterAlertId: '1', Description: 'AlertOne', SymbolId: '1' },
  { MasterAlertId: '2', Description: 'AlertTwo', SymbolId: '2' }
]

let mockMasterAlert =  { MasterAlertId: '1', Description: 'AlertOne', SymbolId: '1' }

var mockPatientsWithMasterAlerts = [{ PatientId: '1' }, { PatientId: '2' }, { PatientId: '3' }];

 
describe('MasterAlertsService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let service: MasterAlertService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MasterAlertService,
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = new MasterAlertService(httpClient, mockSoarConfig, mockPatSecurityService, mockToastrFactory, mockLocalizeService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });


  /// service method tests begin ///
  describe('#getConsent', () => {
    let url = mockSoarConfig.domainUrl + '/patientalerts';
    it('should return expected consent (called once)', () => {
      service.get().then(
        res => {
          expect(res).toEqual(mockMasterAlertsList);
        },
        error => fail
      );

      // service should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(mockMasterAlertsList);
    });

    it('should be OK returning no MasterAlert', () => {
      service.get().then(
        res => expect(res).toEqual([]),
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      req.flush([]); // Respond with no MasterAlert
    });

    it('should turn 404 into a user-friendly error', () => {
      const msg = 'Deliberate 404';
      service.get().then(
        res => fail('expected to fail'),
        error => expect(error.message).toContain(msg)
      );


      const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
    });
  });

  describe('#alertsWithPatients', () => {
    let url = encodeURI(mockSoarConfig.domainUrl + '/patientalerts/' + mockMasterAlert.MasterAlertId + '/patients');
    it('should return expected consent (called once)', () => {
      service.alertsWithPatients(mockMasterAlert.MasterAlertId).then(
        res => {
          expect(res).toEqual(mockPatientsWithMasterAlerts);
        },
        error => fail
      );

      // service should have made one request to GET consnt from expected URL
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock consent
      req.flush(mockPatientsWithMasterAlerts);
    });

    it('should be OK returning no MasterAlert', () => {
      service.alertsWithPatients(1).then(
        res => expect(res).toEqual([]),
        error => fail
      );

      const req = httpTestingController.expectOne(url);
      req.flush([]); // Respond with no MasterAlert
    });

    it('should turn 404 into a user-friendly error', () => {
      const msg = 'Deliberate 404';
      service.alertsWithPatients(mockMasterAlert.MasterAlertId).then(
        res => fail('expected to fail'),
        error => expect(error.message).toContain(msg)
      );


      const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
    });
  });

  describe('#createMasterAlert', () => {
    let url = encodeURI(mockSoarConfig.domainUrl + '/patientalerts');
    it('should create a MasterAlert and return it', () => {

      const createMasterAlertDto =
        { MasterAlertId: '1', Description: 'AlertOne', SymbolId: '1' };

      service.save(createMasterAlertDto).then(
        res => expect(res).toEqual(mockMasterAlert),
        error => fail
      );

      // service should have made one request to GET MasterAlert
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(mockMasterAlert);

      // Expect server to return the MasterAlert after GET
      const expectedResponse = new HttpResponse(
        { status: 200, statusText: 'OK', body: mockMasterAlert });
      req.event(expectedResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Deliberate 404';
      const createMasterAlertDto =
      { MasterAlertId: '1', Description: 'AlertOne', SymbolId: '1' };
      service.save(createMasterAlertDto).then(
        res => fail('expected to fail'),
        error => expect(error.message).toContain(msg)
      );

      const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
    });

  });

  describe('#updateMasterAlert', () => {
    let url = encodeURI(mockSoarConfig.domainUrl + '/patientalerts');
    it('should update a MasterAlert and return it', () => {

      const updateMasterAlertDto =
      { MasterAlertId: '1', Description: 'AlertOne', SymbolId: '1' };

      service.update(updateMasterAlertDto).then(
        res => expect(res).toEqual(updateMasterAlertDto),
        error => fail
      );

      // service should have made one request to PUT MasterAlert
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual(updateMasterAlertDto);

      // Expect server to return the MasterAlert after PUT
      const expectedResponse = new HttpResponse(
        { status: 200, statusText: 'OK', body: updateMasterAlertDto });
      req.event(expectedResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Deliberate 404';
      const updateMasterAlertDto =
      { MasterAlertId: '1', Description: 'AlertOne', SymbolId: '1' };

      service.update(updateMasterAlertDto).then(
        res => fail('expected to fail'),
        error => expect(error.message).toContain(msg)
      );

      const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
    });


  });

  describe('#deleteMasterAlert', () => {
    let url = encodeURI(mockSoarConfig.domainUrl + '/patientalerts/' + mockMasterAlert.MasterAlertId);
    it('should delete a MasterAlert and return it', () => {

      service.delete(mockMasterAlert.MasterAlertId).then(
        res => expect(res).toEqual(""),
        error => fail
      );

      // service should have made one request to DELETE MasterAlert
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('DELETE');
      expect(req.request.body).toEqual(null);

      // Expect server to return the MasterAlert after DELETE
      const expectedResponse = new HttpResponse(
        { status: 200, statusText: 'OK', body: "Deleted" });
      req.event(expectedResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Deliberate 404';

      service.delete(mockMasterAlert.MasterAlertId).then(
        res => fail('expected to fail'),
        error => expect(error.message).toContain(msg)
      );

      const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
    });
  });
});

