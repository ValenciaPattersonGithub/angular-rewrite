import { TestBed } from '@angular/core/testing';

import { PatientPerioService } from './patient-perio.service';


describe('PatientPerioService', () => {

    let service: PatientPerioService;


    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
            ],

        });
        service = TestBed.get(PatientPerioService);
    });


    it('should be created', () => {
        expect(service).toBeTruthy();
    });


    describe('setLoadPreviousOption', () => {


        it('should set loadPreviousExamReading to false', () => {
            service.loadPreviousExamReading = true;
            service.setLoadPreviousOption(false);
            expect(service.loadPreviousExamReading).toBe(false);
        });

        it('should set loadPreviousExamReading to true', () => {
            service.loadPreviousExamReading = false;
            service.setLoadPreviousOption(true);
            expect(service.loadPreviousExamReading).toBe(true);
        });        

    });
});


