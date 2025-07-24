import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ServiceTypesService } from './service-types.service';
import { of } from 'rxjs';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { MicroServiceApiService } from 'src/security/providers';

const mockMicroServiceApis = {
  getPracticesUrl: () => 'https://localhost:35440'
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

const mockServiceType =
{
  ServiceTypeId: '00000000-0000-0000-0000-000000000001',
  IsSystemType: false,
  IsAssociatedWithServiceCode: false,
  Description: 'Service Type 1',
};

describe('ServiceTypesService', () => {
  let service: ServiceTypesService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let microServiceApiService: MicroServiceApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServiceTypesService,
        { provide: MicroServiceApiService, useValue: mockMicroServiceApis },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: FeatureFlagService, useValue: {
          getOnce$: jasmine.createSpy().and.returnValue(of(false))
        }},
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    microServiceApiService = TestBed.inject(MicroServiceApiService);

    service = new ServiceTypesService(httpClient, mockPatSecurityService, microServiceApiService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //UTs for ServiceTypesService methods starts here
  //save()
  describe('save', () => {
    let url = encodeURI(mockMicroServiceApis.getPracticesUrl() + '/api/v1/servicetypes');
    it('should create a ServiceType and return it', () => {

      const createServiceTypeDto =
        { ServiceTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false, IsAssociatedWithServiceCode: false, Description: 'Service Type 1' };

      service.save(createServiceTypeDto).then(
        res => expect(res).toEqual(mockServiceType),
        error => fail
      );

      // service should have made one request to GET ServiceType
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(mockServiceType);

      // Expect server to return the ServiceType after GET
      const expectedResponse = new HttpResponse(
        { status: 200, statusText: 'OK', body: mockServiceType });
      req.event(expectedResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Deliberate 404';
      const createServiceTypeDto =
        { ServiceTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false, IsAssociatedWithServiceCode: false, Description: 'Service Type 1' };

      service.save(createServiceTypeDto).then(
        res => fail('expected to fail'),
        error => expect(error.message).toContain(msg)
      );

      const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
    });

  });

  //update()
  describe('update', () => {
    let url = encodeURI(mockMicroServiceApis.getPracticesUrl() + '/api/v1/servicetypes');
    it('should update a ServiceType and return it', () => {

      const updateServiceTypeDto =
        { ServiceTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false, IsAssociatedWithServiceCode: false, Description: 'Service Type 1' };

      service.update(updateServiceTypeDto).then(
        res => expect(res).toEqual(updateServiceTypeDto),
        error => fail
      );

      // service should have made one request to PUT ServiceType
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual(updateServiceTypeDto);

      // Expect server to return the ServiceType after PUT
      const expectedResponse = new HttpResponse(
        { status: 200, statusText: 'OK', body: updateServiceTypeDto });
      req.event(expectedResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Deliberate 404';
      const updateServiceTypeDto =
        { ServiceTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false, IsAssociatedWithServiceCode: false, Description: 'Service Type 1' };

      service.update(updateServiceTypeDto).then(
        res => fail('expected to fail'),
        error => expect(error.message).toContain(msg)
      );

      const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
    });

  });

  //delete()
  describe('delete', () => {
    let url = encodeURI(mockMicroServiceApis.getPracticesUrl() + '/api/v1/servicetypes/' + mockServiceType.ServiceTypeId);
    it('should delete a ServiceType and return it', () => {

      service.delete(mockServiceType.ServiceTypeId).then(
        res => expect(res).toEqual(""),
        error => fail
      );

      // service should have made one request to DELETE ServiceType
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('DELETE');
      expect(req.request.body).toEqual(null);

      // Expect server to return the ServiceType after DELETE
      const expectedResponse = new HttpResponse(
        { status: 200, statusText: 'OK', body: "Deleted" });
      req.event(expectedResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Deliberate 404';

      service.delete(mockServiceType.ServiceTypeId).then(
        res => fail('expected to fail'),
        error => expect(error.message).toContain(msg)
      );

      const req = httpTestingController.expectOne(url);

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found Deliberate 404' });
    });
  });


});
//UTs for ServiceTypesService methods ends here