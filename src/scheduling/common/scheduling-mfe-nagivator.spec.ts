import { TestBed } from '@angular/core/testing';
import { SchedulingMFENavigator } from './scheduling-mfe-navigator';
import { Sanitizer, SecurityContext } from '@angular/core';
import { AppointmentData } from './appointment-data';

describe('SchedulingMFENavigator', () => {
  let service: SchedulingMFENavigator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SchedulingMFENavigator,
        {
          provide: Sanitizer,
          useValue: {
            sanitize: (_: SecurityContext, path: string) => path,
          },
        },
        {
          provide: 'tabLauncher',
          useValue: {
            launchNewTab: (_: string) => {},
          },
        },
      ],
    });

    service = TestBed.inject(SchedulingMFENavigator);
    spyOn(service, 'navigateToPath').and.callFake((path: string) => {});
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('navigateToAppointmentModal passing id should add publicRecordId to query string', () => {
    service.navigateToAppointmentModal({
      id: 'bananas',
    } as AppointmentData);
    expect(service.navigateToPath).toHaveBeenCalledWith('#/schedule/v2/appointment?publicRecordId=bananas', false);
  });

  it('navigateToAppointmentModal passing appointmentTypeId should add appointmentTypeId to query string', () => {
    service.navigateToAppointmentModal({
      appointmentTypeId: 'bananas',
    } as AppointmentData);
    expect(service.navigateToPath).toHaveBeenCalledWith('#/schedule/v2/appointment?appointmentTypeId=bananas', false);
  });

  it('navigateToAppointmentModal passing id should add locationId to query string', () => {
    service.navigateToAppointmentModal({
      locationId: '123',
    } as AppointmentData);
    expect(service.navigateToPath).toHaveBeenCalledWith('#/schedule/v2/appointment?locationId=123', false);
  });

  it('navigateToAppointmentModal passing id should add patientId to query string', () => {
    service.navigateToAppointmentModal({
      patientId: 'bananas',
    } as AppointmentData);
    expect(service.navigateToPath).toHaveBeenCalledWith('#/schedule/v2/appointment?patientId=bananas', false);
  });
});
