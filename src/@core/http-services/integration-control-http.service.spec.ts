import { TestBed } from '@angular/core/testing';
import { IntegrationControlHttpService, RequestIntegrationControlsArgs } from './integration-control-http.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MicroServiceApiService } from '../../security/providers/micro-service-api.service';

describe('IntegrationControlHttpService', () => {
  let service: IntegrationControlHttpService;
  let mockMicroServiceApiService: Partial<MicroServiceApiService>;
  let requestCreds = new RequestIntegrationControlsArgs();
  requestCreds.locationId = 11;
  requestCreds.vendor = 'DentalXchange';
  requestCreds.feature = 'InsuranceServices' 

  
  beforeEach(() => {
    mockMicroServiceApiService = {
      getInsuranceUrl: jasmine.createSpy().and.returnValue('mockUrl')
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [IntegrationControlHttpService,
        { provide: MicroServiceApiService, useValue: mockMicroServiceApiService },
      ]
    });
    service = TestBed.inject(IntegrationControlHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
