import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpXhrBackend } from '@angular/common/http';

import { MfaSettingsService } from './mfa-settings.service';

describe('MfaSettingsService', () => {
  let service: MfaSettingsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MfaSettingsService,
        { provide: 'mfaPracticeSettingsUrl', useValue: 'http://test-url' },
        { provide: 'mfaManagementPracticeServiceUrl', useValue: 'http://test-management-url' }
      ]
    });
    
    service = TestBed.inject(MfaSettingsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
