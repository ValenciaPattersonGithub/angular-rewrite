import { TestBed } from '@angular/core/testing';

import { AppointmentStatusEnum } from "./appointment-status-enum";
import { AppointmentStatus } from "./appointment-status";

import { AppointmentStatusService } from './appointment-status.service';
import { AppointmentStatusDataService } from "./appointment-status-data.service";


describe('AppointmentStatusService', () => {
    let service: AppointmentStatusService;

    //const mockStaticDataSerivce: any = {
    const mockStatuses: AppointmentStatus[] = [
        new AppointmentStatus(0, 'Unconfirmed', 'fas fa-question', false, true),
        new AppointmentStatus(1, 'Reminder Sent', 'far fa-bell', false, true),
        new AppointmentStatus(2, 'Confirmed', 'far fa-check', true, true),
        new AppointmentStatus(6, 'In Reception', 'far fa-watch', false, true),
        new AppointmentStatus(3, 'Completed', 'far fa-calendar-check', false, false),
        new AppointmentStatus(4, 'In Treatment', 'fas fa-user-md', false, true),
        new AppointmentStatus(5, 'Ready for Check out', 'far fa-shopping-cart', false, true),
        new AppointmentStatus(9, 'Late', 'fas fa-exclamation', false, false),
        new AppointmentStatus(10, 'Check out', 'fas fa-share', false, false),
        new AppointmentStatus(11, 'Start Appointment', 'fas fa-thumbs-up', true, false),
        new AppointmentStatus(12, 'Unschedule', null, false, false),
        new AppointmentStatus(13, 'Add to Clipboard', null, false, false)
    ];

    const mockAppointmentStatusDataService: AppointmentStatusDataService = {
        appointmentStatuses: mockStatuses,               
        getAppointmentStatusesForPatientGrid: (): AppointmentStatus[] => {
            mockStatuses.push(new AppointmentStatus(98, 'Missed', null, false, true));       
            mockStatuses.push(new AppointmentStatus(99, 'Cancelled', null, false, true));
            return mockStatuses;
        },
    }

    const appointmentStatusService: AppointmentStatusService = new AppointmentStatusService(mockAppointmentStatusDataService);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: AppointmentStatusService, useValue: appointmentStatusService },
                { provide: AppointmentStatusDataService, useValue: mockAppointmentStatusDataService }
            ]
        });
        service = TestBed.get(AppointmentStatusService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('appointmentStatuses collection is populated with items when the object is created.', () => {
        const list = service.appointmentStatuses;
        expect(list.length).toEqual(12);
    });

    it('lateStatus is set with an AppointmentStatus of Late when the object is created', () => {
        const original = new AppointmentStatus(9, 'Late', 'fas fa-exclamation', false,false);
        const result = service.lateStatus;
        expect(result).toEqual(original);
        expect(result.description).toEqual('Late');
    });

    it('unconfirmedStatus is set with an AppointmentStatus of Unconfirmed when the object is created', () => {
        const original = new AppointmentStatus(0, 'Unconfirmed', 'fas fa-question', false,true);
        const result = service.unconfirmedStatus;
        expect(result).toEqual(original);
        expect(result.description).toEqual('Unconfirmed');
    });

    it('findStatusByEnumValue returns null when id is null', () => {
        const expected = null;
        const result = service.findStatusByEnumValue(null);
        expect(result).toEqual(expected);
    });

    it('findStatusByEnumValue returns null when appointmentStatus is not found', () => {
        const expected = null;
        const result = service.findStatusByEnumValue(25);
        expect(result).toEqual(expected);
    });

    it('findStatusByEnumValue returns appointmentStatus object when given a valid value', () => {
        const expected = new AppointmentStatus(1, 'Reminder Sent', 'far fa-bell', false, true);
        const result = service.findStatusByEnumValue(1);
        expect(result).toEqual(expected);
    });

    it('findStatusIndexByEnumValue returns null when id is null', () => {
        const expected = null;
        const result = service.findStatusIndexByEnumValue(null);
        expect(result).toEqual(expected);
    });

    it('findStatusIndexByEnumValue returns null when appointmentStatus is not found', () => {
        const expected = null;
        const result = service.findStatusIndexByEnumValue(25);
        expect(result).toEqual(expected);
    });

    it('findStatusIndexByEnumValue returns appointmentStatus index when given a valid value', () => {
        const expected = 1;
        const result = service.findStatusIndexByEnumValue(1);
        expect(result).toEqual(expected);
    });

    it('findStatusIndexByEnumValueFromModifiedList returns null when id is null', () => {
        const expected = null;
        const list = service.appointmentStatuses;
        const result = service.findStatusIndexByEnumValueFromModifiedList(null,list);
        expect(result).toEqual(expected);
    });

    it('findStatusIndexByEnumValueFromModifiedList returns null when statusList is not found', () => {
        const expected = null;
        const list = service.appointmentStatuses;
        const result = service.findStatusIndexByEnumValueFromModifiedList(25,list);
        expect(result).toEqual(expected);
    });

    it('findStatusIndexByEnumValueFromModifiedList returns statusList index when given a valid value', () => {
        const expected = 1;
        const list = service.appointmentStatuses;
        const result = service.findStatusIndexByEnumValueFromModifiedList(1, list);
        expect(result).toEqual(expected);
    });

    it('findStatusByDescription returns null when description is null', () => {
        const expected = null;
        const result = service.findStatusByDescription(null);
        expect(result).toEqual(expected);
    });

    it('findStatusByDescription returns null when appointmentStatus is not found', () => {
        const expected = null;
        const result = service.findStatusByDescription(25);
        expect(result).toEqual(expected);
    });

    it('findStatusByDescription returns appointmentStatus index when given a valid value', () => {
        const expected = new AppointmentStatus(1, 'Reminder Sent', 'far fa-bell', false, true);
        const result = service.findStatusByDescription('Reminder Sent');
        expect(result).toEqual(expected);
    });

    it('getStatuses returns list of AppointmentStatuse', () => {
        const list = service.appointmentStatuses;
        const result = service.getStatuses();
        expect(list.length).toEqual(result.length);
    });

    it('getLateStatus returns late AppointmentStutus object', () => {
        const expected: AppointmentStatus = new AppointmentStatus(9, 'Late', 'fas fa-exclamation', false, false);
        const result = service.getLateStatus();
        expect(result).toEqual(expected);
    });

    it('getUnconfirmedStatus returns unconfirmed AppointmentStutus object', () => {
        const expected: AppointmentStatus = new AppointmentStatus(0, 'Unconfirmed', 'fas fa-question', false, true);
        const result = service.getUnconfirmedStatus();
        expect(result).toEqual(expected);
    });

    it('isLateAppointment returns false when you pass in a null status', () => {
        const paramOne = { Name: 'Test' };
        const result = service.isLateAppointment(paramOne, null);
        expect(result).toEqual(false);
    });

    it('isLateAppointment returns false when you pass in a null appointment', () => {
        const paramTwo = { id: 1 };
        const result = service.isLateAppointment(null, paramTwo);
        expect(result).toEqual(false);
    });

    // This condition existed in the code before the migration but I am not entirely sure how to have an appointment with the Name as Lunch.
    it('isLateAppointment returns false when you pass in an appointment where the name is equal to Lunch', () => {
        const paramOne = { Name: 'Lunch' };
        const paramTwo = { id: 1 };
        const result = service.isLateAppointment(paramOne, paramTwo);
        expect(result).toEqual(false);
    });

    it('isLateAppointment returns false when you pass in completed status', () => {
        const paramOne = { Name: 'Test' };
        const paramTwo = { id: 3 };
        const result = service.isLateAppointment(paramOne, paramTwo);
        expect(result).toEqual(false);
    });

    it('isLateAppointment returns false when appointment StartTime is in the future and the status is one of the late statuses', () => {
        const paramOne = {
            Name: 'Test',
            StartTime: new Date().setHours(new Date().getHours() + 1)
        };
        const paramTwo = { id: 1 };
        const result = service.isLateAppointment(paramOne, paramTwo);
        expect(result).toEqual(false);
    });

    it('isLateAppointment returns false when appointment StartTime is in the past and the status is not one of the late statuses', () => {
        const paramOne = {
            Name: 'Test',
            StartTime: new Date().setHours(new Date().getHours() - 2) // 2 hours ago
        };
        const paramTwo = { id: 3 };
        const result = service.isLateAppointment(paramOne, paramTwo);
        expect(result).toEqual(false);
    });


    it('isLateAppointment returns true when appointment StartTime is in the past and the status is one of the late statuses', () => {
        const paramOne = {
            Name: 'Test',
            StartTime: new Date().setHours(new Date().getHours() - 2) // 2 hours ago
        };
        const paramTwo = { id: 1 };
        const result = service.isLateAppointment(paramOne, paramTwo);
        expect(result).toEqual(true);
    });

    it('setAppointmentStatus returns unconfirmed status values when provided status is null', () => {
        const expected = {
            Status: 0,
            OriginalStatus: 0,
            StatusIcon: 'fas fa-question'
        };
        const appointment = {
            Status: null
        };
        const result = service.setAppointmentStatus(appointment);
        expect(result).toEqual(expected);
    });

    it('setAppointmentStatus returns late status values when provided status and StartTime make it possible to be late', () => {
        var date = new Date().setHours(new Date().getHours() - 2);

        const expected = {
            AppointmentId: '11A27490-B650-4353-83B5-00062C109B59',
            Status: 9,
            Name: 'Test',
            StartTime: date, // 2 hours ago
            OriginalStatus: 2,
            StatusIcon: 'fas fa-exclamation'
        };
        const appointment = {
            AppointmentId: '11A27490-B650-4353-83B5-00062C109B59',
            Status: 2,
            Name: 'Test',
            StartTime: date // 2 hours ago
        };
        const result = service.setAppointmentStatus(appointment);
        expect(result).toEqual(expected);
    });

    it('setAppointmentStatus returns normal status values when provided status and StartTime make it possible to be late but the appointment does not have an appointmentId', () => {
        var date = new Date().setHours(new Date().getHours() - 2);

        const expected = {
            Status: 0,
            Name: 'Test',
            StartTime: date, // 2 hours ago
            OriginalStatus: 0,
            StatusIcon: 'fas fa-question'
        };
        const appointment = {
            Status: 0,
            Name: 'Test',
            StartTime: date // 2 hours ago
        };
        const result = service.setAppointmentStatus(appointment);
        expect(result).toEqual(expected);
    });

    it('setAppointmentStatus returns provided status values when provided status and StartTime cannot turn the status late', () => {
        var date = new Date().setHours(new Date().getHours() + 2);

        const expected = {
            Status: 2,
            Name: 'Test',
            StartTime: date, // 2 hours ago
            OriginalStatus: 2,
            StatusIcon: 'far fa-check'
        };
        const appointment = {
            Status: 2,
            Name: 'Test',
            StartTime: date // 2 hours ago
        };
        const result = service.setAppointmentStatus(appointment);
        expect(result).toEqual(expected);
    });
});
