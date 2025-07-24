import { TestBed } from '@angular/core/testing';

import { AddPatientBenefitPlansModalService } from './add-patient-benefit-plans-modal.service';
import { Overlay } from '@angular/cdk/overlay';

describe('AddPatientBenefitPlansModalService', () => {
  let service: AddPatientBenefitPlansModalService;
  let mockInjector = {}
  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [],
        declarations: [],
        providers: [ 
            AddPatientBenefitPlansModalService, 
            Overlay,         
            { provide: '$injector', useValue: mockInjector },            
        ]
    })    
    service = TestBed.inject(AddPatientBenefitPlansModalService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
