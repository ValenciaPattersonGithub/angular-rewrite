import { TestBed } from '@angular/core/testing';

import { SoarPatientBenefitPlanHttpService } from './soar-patient-benefit-plan-http.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SoarPatientBenefitPlanHttpService', () => {
  let service: SoarPatientBenefitPlanHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({

        imports: [HttpClientTestingModule],
        declarations: [],
        providers: [SoarPatientBenefitPlanHttpService,
            { provide: 'SoarConfig', useValue: {} },
        ]
    });
    service = TestBed.inject(SoarPatientBenefitPlanHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
