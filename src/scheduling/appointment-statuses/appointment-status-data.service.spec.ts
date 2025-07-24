import { TestBed } from '@angular/core/testing';

import { AppointmentStatusDataService } from './appointment-status-data.service';

describe('AppointmentStatusDataService', () => {
    let service: AppointmentStatusDataService;

    beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [AppointmentStatusDataService],
            });
            service = TestBed.get(AppointmentStatusDataService);
        }
    );

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // The point of this is to know when one is added to the list.
    it('appointmentStatuses collection should have 12 items in it.', () => {
        const list = service.appointmentStatuses;
        expect(list.length).toEqual(12);
    });

    it('appointmentStatus should have descriptionNoSpaces property where no spaces are present.', () => {
        const list = service.appointmentStatuses;
        expect('ReminderSent').toEqual(list[1].descriptionNoSpace);
    });

    describe('getAppointmentStatusesForPatientGrid', () => {
        it('should return 8 items in the list which has visibleInPatientGrid true', () => {
            const list = service.getAppointmentStatusesForPatientGrid();
            expect(list.length).toEqual(8);
        });
    });        
});
