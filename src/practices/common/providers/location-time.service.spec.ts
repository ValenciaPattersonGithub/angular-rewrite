import { TestBed } from '@angular/core/testing';
import { LocationTimeService } from "./location-time.service";
import { TimezoneDataService } from "../providers/timezone-data.service";
import * as moment from 'moment-timezone';

describe('LocationTimeService', () => {
    let service: LocationTimeService;

    const mockTimezoneDataService: TimezoneDataService = new TimezoneDataService();
    const mockLocationTimeService: LocationTimeService = new LocationTimeService(mockTimezoneDataService);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: LocationTimeService, useValue: mockLocationTimeService },
                { provide: TimezoneDataService, useValue: mockTimezoneDataService }
            ]
        });
        service = TestBed.get(LocationTimeService);
    }
    );

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getTimeZoneAbbr', () => {
        it('should return timezone abbreviation', () => {
            const timezone = 'America/New_York';
            const dateItem = new Date();
            const mockResult = { displayAbbr: 'EST' };

            spyOn(service, 'getTimezoneInfo').and.returnValue(mockResult);

            const result = service.getTimeZoneAbbr(timezone, dateItem);

            expect(service.getTimezoneInfo).toHaveBeenCalledWith(timezone, dateItem);
            expect(result).toEqual('EST');
        });

        it('should return empty string if getTimezoneInfo returns null', () => {
            const timezone = 'America/New_York';
            const dateItem = new Date();

            spyOn(service, 'getTimezoneInfo').and.returnValue(null);

            const result = service.getTimeZoneAbbr(timezone, dateItem);

            expect(service.getTimezoneInfo).toHaveBeenCalledWith(timezone, dateItem);
            expect(result).toEqual('');
        });

    })

    describe('toUTCDateKeepLocalTime', () => {
        it('should convert input date to UTC while keeping local time', () => {
            const inputDate = new Date(2022, 0, 9, 12, 34, 56); // Year, Month, Day, Hour, Minute, Second            
            const result = service.toUTCDateKeepLocalTime(inputDate);
            // Additional checks for date/time parts with consideration for timezone offset
            expect(result?.getUTCFullYear()).toEqual(2022);
            expect(result?.getUTCMonth()).toEqual(0); 
            expect(result?.getUTCDate()).toEqual(9);
            expect(result?.getUTCHours()).toEqual(12);
            expect(result?.getUTCMinutes()).toEqual(34);
            expect(result?.getUTCSeconds()).toEqual(56);

            
            const inputDate4 = new Date('2022-01-09T18:34:56'); // CST -6 timezone offset
            const result4 = service.toUTCDateKeepLocalTime(inputDate4);
            expect(result4?.getUTCFullYear()).toEqual(2022);
            expect(result4?.getUTCMonth()).toEqual(0);  
            expect(result4?.getUTCDate()).toEqual(9);
            expect(result4?.getUTCHours()).toEqual(18); 
            expect(result4?.getUTCMinutes()).toEqual(34);
            expect(result4?.getUTCSeconds()).toEqual(56);
            
        });
    
        it('should return null for invalid input', () => {
            const invalidInput = null;
            const result = service.toUTCDateKeepLocalTime(invalidInput);
            expect(result).toBeNull();
        });

        it('should return null for invalid date input', () => {
            const invalidDateString = 'this is not a date';
            const result = service.toUTCDateKeepLocalTime(invalidDateString);
            expect(result).toBeNull();
        });
    });
    
    
});
