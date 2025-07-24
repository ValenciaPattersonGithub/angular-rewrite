import { TestBed } from '@angular/core/testing';

import { AppointmentTimeService } from "./appointment-time.service";

import { LocationTimeService } from "../../../practices/common/providers/location-time.service";

import { Timezone } from "../../../practices/common/models/timezone";
import { TimezoneDataService } from "../../../practices/common/providers/timezone-data.service";

// angular barrel (using index.ts files export which allows us to have truncated path)
import { RoomsService } from '../../../practices/providers';
describe('AppointmentTimeService', () => {
    let service: AppointmentTimeService;

    const mockTimezoneDataService: TimezoneDataService = new TimezoneDataService();
    const mockLocationTimeService: LocationTimeService = new LocationTimeService(mockTimezoneDataService);

    const mockAppointmentTimeService: AppointmentTimeService = new AppointmentTimeService(mockLocationTimeService);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: AppointmentTimeService, useValue: mockAppointmentTimeService },
                { provide: LocationTimeService, useValue: mockLocationTimeService },
                { provide: TimezoneDataService, useValue: mockTimezoneDataService }
            ]
        });
        service = TestBed.get(AppointmentTimeService);
    }
    );

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

});
