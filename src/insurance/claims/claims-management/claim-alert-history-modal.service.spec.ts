import { TestBed } from '@angular/core/testing';
import { ClaimAlertHistoryModalService } from './claim-alert-history-modal.service';
import { Overlay } from '@angular/cdk/overlay';

describe('ClaimAlertHistoryModalService', () => {
  let service: ClaimAlertHistoryModalService;
  let mockInjector = {}
  beforeEach( () => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [],
      providers: [ClaimAlertHistoryModalService,
        Overlay,         
        { provide: '$injector', useValue: mockInjector },  ],
    });    
    service = TestBed.inject(ClaimAlertHistoryModalService);    
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


