import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InsuranceCredentialsHttpService, RequestCredentialArgs } from './insurance-credentials-http.service';

describe('insuranceCredentialsHttpService', () => {

  let service: InsuranceCredentialsHttpService;

  let requestCreds = new RequestCredentialArgs();
  requestCreds.locationId = 11;
  requestCreds.vendor = 'DentalXChange'; 

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
        providers: [InsuranceCredentialsHttpService,
          { provide: 'SoarConfig', useValue: {} },
      ]
    });
      service = TestBed.inject(InsuranceCredentialsHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
