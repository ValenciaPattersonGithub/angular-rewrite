import { TestBed } from '@angular/core/testing';
import { FeeScheduleUpdateModalService } from './fee-schedule-update-modal.service';
import { Overlay } from '@angular/cdk/overlay';

describe('FeeScheduleUpdateModalService', () => {
  let service: FeeScheduleUpdateModalService;
    let mockInjector = {}
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [],
        declarations: [],
        providers: [ 
            FeeScheduleUpdateModalService, 
            Overlay,         
            { provide: '$injector', useValue: mockInjector },            
        ]
    })    
    service = TestBed.inject(FeeScheduleUpdateModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
