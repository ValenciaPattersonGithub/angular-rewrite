import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SsoDomainService } from './sso-domain.service';

describe('SsoDomainService', () => {
  let service: SsoDomainService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SsoDomainService,
        { provide: 'ssoDomainServiceUrl', useValue: 'https://test-iam-ssomgmt-svc.practicemgmt-test.pattersondevops.com' }
      ]
    });
    
    service = TestBed.inject(SsoDomainService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
