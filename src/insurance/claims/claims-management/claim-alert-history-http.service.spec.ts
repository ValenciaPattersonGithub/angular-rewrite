import { TestBed } from '@angular/core/testing';
import { ClaimAlertHistoryHttpService } from './claim-alert-history-http.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ClaimAlertHistoryHttpService', () => {
  let service: ClaimAlertHistoryHttpService;

  beforeEach(() => {    
    TestBed.configureTestingModule({
      // Import the HttpClient mocking services
      imports: [HttpClientTestingModule],
      providers: [ClaimAlertHistoryHttpService,
        { provide: 'SoarConfig', useValue: {} },
    ]
    });    
    service = TestBed.inject(ClaimAlertHistoryHttpService);    
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
