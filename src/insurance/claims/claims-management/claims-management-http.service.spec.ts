import { TestBed } from '@angular/core/testing';

import { ClaimsManagementHttpService } from './claims-management-http.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ClaimsManagementHttpService', () => {
  let service: ClaimsManagementHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
        declarations: [],
        providers: [
            { provide: 'SoarConfig', useValue: {} },
        ]
    });
    service = TestBed.inject(ClaimsManagementHttpService);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
