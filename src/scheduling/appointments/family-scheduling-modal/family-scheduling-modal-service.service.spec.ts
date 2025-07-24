import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FamilySchedulingModalServiceService } from './family-scheduling-modal-service.service';
import { MicroServiceApiService } from 'src/security/providers';

describe('FamilySchedulingModalServiceService', () => {
    let service: FamilySchedulingModalServiceService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: 'SoarConfig', useValue: {} },
                { provide: MicroServiceApiService, useValue: {} }
            ]
        });
        service = TestBed.inject(FamilySchedulingModalServiceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
