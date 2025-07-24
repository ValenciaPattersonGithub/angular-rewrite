import { TestBed } from '@angular/core/testing';

import { FeeScheduleHttpService } from './fee-schedule-http.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FeeScheduleHttpService', () => {
  let service: FeeScheduleHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
        declarations: [],
        providers: [FeeScheduleHttpService,
            { provide: 'SoarConfig', useValue: {} },
        ]
    });
    service = TestBed.inject(FeeScheduleHttpService);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
