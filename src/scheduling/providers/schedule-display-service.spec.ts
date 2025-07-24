import { TestBed } from '@angular/core/testing';

import { ScheduleDisplayService } from './schedule-display.service';


describe('ScheduleDisplayService', () => {
    let service: ScheduleDisplayService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ScheduleDisplayService]
        });
        service = TestBed.get(ScheduleDisplayService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

});