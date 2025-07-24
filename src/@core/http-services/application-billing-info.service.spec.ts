import { MicroServiceApiService } from 'src/security/providers';
import { ApplicationBillingInfoService } from './application-billing-info.service';
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('ApplicationBillingInfoService', () => {
  let service: ApplicationBillingInfoService;
  let microServiceApiService: Partial<MicroServiceApiService>;
  let practiceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    practiceService = {
      getCurrentPractice: jasmine.createSpy().and.returnValue({ id: '1' }),
    };
    microServiceApiService = {
      getEnterpriseUrl: jasmine.createSpy().and.returnValue('mockUrl'),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApplicationBillingInfoService,
        { provide: 'practiceService', useValue: practiceService },
        { provide: MicroServiceApiService, useValue: microServiceApiService },
      ],
    });

    service = TestBed.inject(ApplicationBillingInfoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return data from API', () => {
    const mockData = {
      Result: {
        ApplicationBillingInfoId: 1,
        ApplicationId: 2,
        BillingModel: 2
      },
    };

    service.applicationBilling$.subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('mockUrl/api/applicationBillingInfo/2/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
