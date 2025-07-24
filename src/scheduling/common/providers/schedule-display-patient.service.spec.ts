import { TestBed } from '@angular/core/testing';

import { ScheduleDisplayPatientService } from './schedule-display-patient.service';


describe('ScheduleDisplayPatientService', () => {
    let service: ScheduleDisplayPatientService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ScheduleDisplayPatientService]
        });
        service = TestBed.get(ScheduleDisplayPatientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('ifEmptyReturnNull should return null if string is null, undefined, or empty', () => {
        const resultOne = service.ifEmptyReturnNull(null);
        expect(resultOne).toEqual(null);

        const resultTwo = service.ifEmptyReturnNull(undefined);
        expect(resultTwo).toEqual(null);

        const resultThree = service.ifEmptyReturnNull('    ');
        expect(resultThree).toEqual(null);
    });

    it('ifEmptyReturnNull should return value if string not null, undefined, or empty', () => {
        let value = 'test';
        const result = service.ifEmptyReturnNull(value);
        expect(result).toEqual(value);
    });

    it('formatPatientNameForScheduleCard should return empty string if patient is null', () => {
        const result = service.formatPatientNameForScheduleCard(null);
        expect(result).toEqual('');
    });

    it('formatPatientNameForScheduleCard should return elements in order if all are present', () => {
        const patient = {
            FirstName: '1',
            PreferredName: '2',
            MiddleName: '3',
            LastName: '4',
            Suffix: '5'
        };
        const result = service.formatPatientNameForScheduleCard(patient);
        expect(result).toEqual('1 (2) 3 4 5');
    });

    it('formatPatientNameForSchedulePinnedAppointmentsArea should return empty string if patient is null', () => {
        const result = service.formatPatientNameForSchedulePinnedAppointmentsArea(null);
        expect(result).toEqual('');
    });

    it('formatPatientNameForSchedulePinnedAppointmentsArea should return elements in order if all are present', () => {
        const patient = {
            FirstName: '1',
            MiddleName: '2',
            LastName: '3',
            Suffix: '4',
            PreferredName: '5'
        };
        const result = service.formatPatientNameForSchedulePinnedAppointmentsArea(patient);
        expect(result).toEqual('1 2 3, 4 (5)');
    });

    it('calculatePatientAge should return 20 if date was created by removing 20 years from today', () => {
        const now = new Date();
        let twentyYearsAgo = now.setMonth(now.getMonth() - 240);
        let twentyYearsAgoDate = new Date(twentyYearsAgo);

        let month = (twentyYearsAgoDate.getMonth() + 1).toString();
        if (month.length == 1) {
            month = '0' + month;
        }

        let day = (twentyYearsAgoDate.getDate()).toString();
        if (day.length == 1) {
            day = '0' + day;
        }
        let twentyYearsAgoString = twentyYearsAgoDate.getFullYear() + "-" + month + "-" + day + "T00:00:00";
        const result = service.calculatePatientAge(twentyYearsAgoString);
        expect(result).toEqual(20);
    });

});