import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { UserLoginTimePanelComponent } from './user-login-time-panel.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { By } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';
import { ExpectedConditions } from 'protractor';

describe('UserLoginTimePanelComponent', () => {
    let component: UserLoginTimePanelComponent;
    let fixture: ComponentFixture<UserLoginTimePanelComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [UserLoginTimePanelComponent]
        });
    });

    let mockUserServices = {
        UserLoginTimes: {
            get: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } })
        }
    };

    let mockPracticeService = {
        getCurrentPractice: jasmine.createSpy().and.returnValue({ id: 'testId' })
    };

    let mockLocationService= {
        getCurrentLocation: jasmine.createSpy().and.returnValue("location")
    };

    beforeEach(() => {
        component = new UserLoginTimePanelComponent(
            mockUserServices, mockPracticeService, mockLocationService
        );
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit ->', () => {
        beforeEach(() => {
            component.getUserLoginTime = jasmine.createSpy().and.returnValue(Promise.resolve('test'));
            component.setTimezone = jasmine.createSpy();
            component.showHideTimezone = jasmine.createSpy();
        });

        it('should set location, daysOfWeek, timezone', () => {
            component.user = { User: 1 };
            component.daysOfWeek = [
                { Text: 'M', Selected: false, Name: "Monday", Value: 1, StartTime: '', EndTime: '', IsValid: true }
            ];
            component.user = { UserId: 1 };                                    

            component.ngOnInit();

            expect(mockPracticeService.getCurrentPractice).toHaveBeenCalled();
            expect(component.daysOfWeek[0]).toEqual({ Text: 'M', Selected: false, Name: "Monday", Value: 1, StartTime: '08:00 AM', EndTime: '05:00 PM', IsValid: true });
            expect(component.location).toEqual("location");
            expect(component.timezone).toEqual("Central Standard Time");

            expect(component.getUserLoginTime).toHaveBeenCalledTimes(7);            
        });

        it('should not call gets when userId is not set and should set timezone', () => {
            component.user = { User: 1 };
            component.daysOfWeek = [
                { Text: 'M', Selected: false, Name: "Monday", Value: 1, StartTime: '', EndTime: '', IsValid: true }
            ];
            component.user = { UserId: "" };

            component.ngOnInit();

            expect(mockPracticeService.getCurrentPractice).toHaveBeenCalled();
            expect(component.daysOfWeek[0]).toEqual({ Text: 'M', Selected: false, Name: "Monday", Value: 1, StartTime: '08:00 AM', EndTime: '05:00 PM', IsValid: true });
            expect(component.location).toEqual("location");
            expect(component.timezone).toEqual("Central Standard Time");

            expect(component.getUserLoginTime).not.toHaveBeenCalled();
            expect(component.setTimezone).toHaveBeenCalled();
            expect(component.showHideTimezone).toHaveBeenCalled();
        });
    });

    describe('getUserLoginTime ->', () => {
        it('should call userServices.UserLoginTimes.get', () => {
            component.daysOfWeek = [
                { Text: 'M', Selected: false, Name: "Monday", Value: 1, StartTime: '', EndTime: '', IsValid: true },
                { Text: 'Tu', Selected: false, Name: "Tuesday", Value: 2, StartTime: '', EndTime: '', IsValid: true },
                { Text: 'W', Selected: false, Name: "Wednesday", Value: 3, StartTime: '', EndTime: '', IsValid: false }
            ];
            component.user = { UserId: 1 };
            component.setStartEndTimesOnDayOfWeek = jasmine.createSpy();
            
            component.getUserLoginTime(1, 'day');


            expect(mockUserServices.UserLoginTimes.get).toHaveBeenCalled();
        });

    });


    describe('processSavedLoginTime ->', () => {
        it('should set loginTimes and select daysOfWeek', () => {
            component.daysOfWeek = [
                { Text: 'M', Selected: false, Name: "Monday", Value: 1, StartTime: '', EndTime: '', IsValid: true },
                { Text: 'Tu', Selected: false, Name: "Tuesday", Value: 2, StartTime: '', EndTime: '', IsValid: true },
                { Text: 'W', Selected: false, Name: "Wednesday", Value: 3, StartTime: '', EndTime: '', IsValid: false }
            ];
            component.initialSelectedDays = [];
            component.loginTimes = []
            component.setStartEndTimesOnDayOfWeek = jasmine.createSpy();
            component.setIsDayDisabled = jasmine.createSpy();

            var dayOfWeek = { StartTime: 'NoUpdate', EndTime: 'NoUpdate' };
            component.processSavedLoginTime({ScheduleDay: 2});


            expect(component.daysOfWeek[1].Selected).toBe(true);
            expect(component.setStartEndTimesOnDayOfWeek).toHaveBeenCalled();
            expect(component.setIsDayDisabled).toHaveBeenCalled();
            expect(component.loginTimes).toEqual([{ ScheduleDay: 2, $State: 'Update' }]);
            expect(component.initialSelectedDays).toEqual([{ ScheduleDay: 2, $State: 'Update' }]);            
        });
        
    });


    describe('setTimezone ->', () => {
        it('should set timezone and loginTimes if initialSelectedDays contains values', () => {
            component.initialSelectedDays = [{ Timezone: 'timezone1' }, { Timezone: 'timezone2' }];
            component.loginTimes = [{ Timezone: 'NoUpdate' }, { Timezone: 'NoUpdate2' }]
            component.location = { timezone: 'locationTimezone' };          

            var dayOfWeek = { StartTime: 'NoUpdate', EndTime: 'NoUpdate' };
            component.setTimezone();
            
            expect(component.timezone).toEqual('timezone1');
            expect(component.loginTimes[0]).toEqual({ Timezone: 'timezone1' });
            expect(component.loginTimes[1]).toEqual({ Timezone: 'timezone1' });
        });

        it('should set timezone to location timezone', () => {
            component.initialSelectedDays = undefined;
            component.loginTimes = [{ Timezone: 'NoUpdate' }, { Timezone: 'NoUpdate2' }]
            component.location = { timezone: 'locationTimezone' };            

            var dayOfWeek = { StartTime: 'NoUpdate', EndTime: 'NoUpdate' };
            component.setTimezone();
            
            expect(component.timezone).toEqual('locationTimezone');
            expect(component.loginTimes[0]).toEqual({ Timezone: 'NoUpdate' });
            expect(component.loginTimes[1]).toEqual({ Timezone: 'NoUpdate2' });
        });
    });

    describe('setStartEndTimesOnDayOfWeek ->', () => {
        it('should call convertTimeObjectToString and set dayOfWeek times', () => {
            component.convertTimeObjectToString = jasmine.createSpy().and.returnValue({ StartTime: 'Start', EndTime: 'End' });

            var dayOfWeek = { StartTime: 'NoUpdate', EndTime: 'NoUpdate' };
            component.setStartEndTimesOnDayOfWeek(dayOfWeek, 'testLoginTime');

            expect(component.convertTimeObjectToString).toHaveBeenCalledWith('testLoginTime');
            expect(dayOfWeek.StartTime).toEqual('Start');
            expect(dayOfWeek.EndTime).toEqual('End');
        });
    });


    describe('setIsDayDisabled ->', () => {
        it('should call set IsDayDisabled true when StartTime equals EndTime', () => {
            var dayOfWeek = { Text: 'M', Selected: false, Name: "Monday", Value: 1, IsValid: true, StartTime: '08:00 AM', EndTime: '08:00 AM', IsDayDisabled: false }

            component.setIsDayDisabled(dayOfWeek);

            expect(dayOfWeek.IsDayDisabled).toEqual(true);
            expect(dayOfWeek.StartTime).toEqual('12:00 AM');
            expect(dayOfWeek.EndTime).toEqual('12:00 AM');
        });
    });


    describe('toggleIsDayDisabled ->', () => {
        it('should set start/end time on matching day to 12:00 AM when toggled on', () => {
            component.timezone = 'NoTimezone';
            component.loginTimes = [
                { ScheduleDay: 1, Timezone: 'NoUpdate', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 2, EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2 },
                { ScheduleDay: 2, Timezone: 'NoUpdate2', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 2, EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2 }
            ];

            component.convertStringTimesToObject = jasmine.createSpy().and.returnValue({ Hours: 5, Minutes: 6 });
            component.emitLoginTimes = jasmine.createSpy();

            var dayOfWeek = { Value: 1, StartTime: 'NoUpdate', EndTime: 'NoUpdate', IsDayDisabled: false };
            component.toggleIsDayDisabled({ currentTarget: { checked: true } }, dayOfWeek);


            expect(dayOfWeek).toEqual({ Value: 1, StartTime: '12:00 AM', EndTime: '12:00 AM', IsDayDisabled: true });
            expect(component.convertStringTimesToObject).toHaveBeenCalledWith('12:00 AM');
            expect(component.loginTimes[0]).toEqual({
                ScheduleDay: 1, Timezone: 'NoUpdate', StartTime24HourMilitaryTimeHour: 5, StartTime24HourMilitaryTimeMinute: 6,
                EndTime24HourMilitaryTimeHour: 5, EndTime24HourMilitaryTimeMinute: 6
            });
            expect(component.loginTimes[1]).toEqual({
                ScheduleDay: 2, Timezone: 'NoUpdate2', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 2,
                EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2
            });
            expect(component.emitLoginTimes).toHaveBeenCalled();
        });

        it('should set start/end time on matching day to 8-5 when toggled off', () => {
            component.timezone = 'NoTimezone';
            component.loginTimes = [
                { ScheduleDay: 1, Timezone: 'NoUpdate', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 2, EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2 },
                { ScheduleDay: 2, Timezone: 'NoUpdate2', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 2, EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2 }
            ];

            component.convertStringTimesToObject = jasmine.createSpy().and.returnValue({ Hours: 5, Minutes: 6 });
            component.emitLoginTimes = jasmine.createSpy();

            var dayOfWeek = { Value: 1, StartTime: 'NoUpdate', EndTime: 'NoUpdate', IsDayDisabled: true };
            component.toggleIsDayDisabled({ currentTarget: { checked: false } }, dayOfWeek);


            expect(dayOfWeek).toEqual({ Value: 1, StartTime: '08:00 AM', EndTime: '05:00 PM', IsDayDisabled: false });
            expect(component.convertStringTimesToObject).toHaveBeenCalled();            
            expect(component.loginTimes[0]).toEqual({
                ScheduleDay: 1, Timezone: 'NoUpdate', StartTime24HourMilitaryTimeHour: 5, StartTime24HourMilitaryTimeMinute: 6,
                EndTime24HourMilitaryTimeHour: 5, EndTime24HourMilitaryTimeMinute: 6
            });
            expect(component.loginTimes[1]).toEqual({
                ScheduleDay: 2, Timezone: 'NoUpdate2', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 2,
                EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2
            });
            expect(component.emitLoginTimes).toHaveBeenCalled();
        });
    });


    describe('dayToggled ->', () => {
        beforeEach(() => {
            component.emitLoginTimes = jasmine.createSpy();
            component.showHideTimezone = jasmine.createSpy();
            component.convertFromTimezoneToUtc = jasmine.createSpy().and.returnValue(25);
        });

        it('should set Selected to event boolean for day that is passed in', () => {           
            component.dayToggled(true, { Text: 'Tu', Selected: false, Name:"Tuesday" },);
            component.timezone = 'testTimezone';

            expect(component.daysOfWeek).toEqual([
                { Text: 'M', Selected: false, Name: "Monday", Value: 1, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false },
                { Text: 'Tu', Selected: true, Name: "Tuesday", Value: 2, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false  },
                { Text: 'W', Selected: false, Name: "Wednesday", Value: 3, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false },
                { Text: 'Th', Selected: false, Name: "Thursday", Value: 4, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false },
                { Text: 'F', Selected: false, Name: "Friday", Value: 5, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false },
                { Text: 'Sa', Selected: false, Name: "Saturday", Value: 6, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false },
                { Text: 'Su', Selected: false, Name: "Sunday", Value: 0, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false }]);
        });

        it('should set IsDayDisabled to false when day is toggled', () => {
            component.dayToggled(true, { Text: 'Tu', Selected: false, Name: "Tuesday", IsDayDisabled: true },);
            component.timezone = 'testTimezone';

            expect(component.daysOfWeek).toEqual([
                { Text: 'M', Selected: false, Name: "Monday", Value: 1, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false },
                { Text: 'Tu', Selected: true, Name: "Tuesday", Value: 2, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false },
                { Text: 'W', Selected: false, Name: "Wednesday", Value: 3, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false },
                { Text: 'Th', Selected: false, Name: "Thursday", Value: 4, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false },
                { Text: 'F', Selected: false, Name: "Friday", Value: 5, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false },
                { Text: 'Sa', Selected: false, Name: "Saturday", Value: 6, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false },
                { Text: 'Su', Selected: false, Name: "Sunday", Value: 0, IsValid: true, StartTime: '', EndTime: '', IsDayDisabled: false }]);
        });

        it('should update loginTimes when event is true and is part of initial days', () => {
            component.loginTimes = [{
                ScheduleDay: 2, Timezone: component.timezone,
                StartTime24HourMilitaryTimeHour: 9, StartTime24HourMilitaryTimeMinute: 0,
                EndTime24HourMilitaryTimeHour: 23, EndTime24HourMilitaryTimeMinute: 0,
                $State: "Delete"
            }];
            component.initialSelectedDays = [{ScheduleDay: 2}]

            component.dayToggled(true, { Text: 'Tu', Selected: false, Name: "Tuesday", Value: 2 });

            expect(component.loginTimes).toEqual([
                {
                    ScheduleDay: 2, Timezone: component.timezone,
                    StartTime24HourMilitaryTimeHour: 25, StartTime24HourMilitaryTimeMinute: 0,
                    EndTime24HourMilitaryTimeHour: 25, EndTime24HourMilitaryTimeMinute: 0,
                    $State: "Update"
                }]);
        });

        it('should add to loginTimes when event is true and not part of initial days', () => {
            component.loginTimes = [];
            
            component.dayToggled(true, { Text: 'Tu', Selected: false, Name: "Tuesday", Value: 2 });

            expect(component.loginTimes).toEqual([
                {
                    ScheduleDay: 2, Timezone: component.timezone,
                    StartTime24HourMilitaryTimeHour: 25, StartTime24HourMilitaryTimeMinute: 0,
                    EndTime24HourMilitaryTimeHour: 25, EndTime24HourMilitaryTimeMinute: 0,
                    $State: "Update"
                }]);
        });


        it('should update loginTimes when event is false and is part of initial days', () => {
            component.loginTimes = [{
                ScheduleDay: 2, Timezone: component.timezone,
                StartTime24HourMilitaryTimeHour: 9, StartTime24HourMilitaryTimeMinute: 0,
                EndTime24HourMilitaryTimeHour: 23, EndTime24HourMilitaryTimeMinute: 0,
                $State: "Update"
            }];
            component.initialSelectedDays = [{ ScheduleDay: 2 }]

            component.dayToggled(false, { Text: 'Tu', Selected: false, Name: "Tuesday", Value: 2 });

            expect(component.loginTimes).toEqual([
                {
                    ScheduleDay: 2, Timezone: component.timezone,
                    StartTime24HourMilitaryTimeHour: 9, StartTime24HourMilitaryTimeMinute: 0,
                    EndTime24HourMilitaryTimeHour: 23, EndTime24HourMilitaryTimeMinute: 0,
                    $State: "Delete"
                }]);
        });

        it('should remove from loginTimes when event is false and not part of initial days', () => {
            component.loginTimes = [{
                ScheduleDay: 2, Timezone: component.timezone,
                StartTime24HourMilitaryTimeHour: 9, StartTime24HourMilitaryTimeMinute: 0,
                EndTime24HourMilitaryTimeHour: 23, EndTime24HourMilitaryTimeMinute: 0,
                $State: "Update"
            }];

            component.dayToggled(false, { Text: 'Tu', Selected: false, Name: "Tuesday", Value: 2 });

            expect(component.loginTimes).toEqual([]);
        });


        it('should call showHideTimezone and emitLoginTimes', () => {
            component.loginTimes = [{
                ScheduleDay: 2, Timezone: component.timezone,
                StartTime24HourMilitaryTimeHour: 9, StartTime24HourMilitaryTimeMinute: 0,
                EndTime24HourMilitaryTimeHour: 23, EndTime24HourMilitaryTimeMinute: 0,
                $State: "Update"
            }];

            component.dayToggled(false, { Text: 'Tu', Selected: false, Name: "Tuesday", Value: 2 });

            expect(component.showHideTimezone).toHaveBeenCalled();
            expect(component.emitLoginTimes).toHaveBeenCalled();
        });

    });

    describe('showHideTimezone ->', () => {
        it('should set showTimezone to true when any of the days are selected', () => {
            component.showTimezone = false;
            component.daysOfWeek = [{ Selected: true }, { Selected: false }]

            component.showHideTimezone();

            expect(component.showTimezone).toBe(true);
        });

        it('should set showTimezone to false when none of the days are selected', () => {
            component.showTimezone = true;
            component.daysOfWeek = [{ Selected: false }, { Selected: false }]

            component.showHideTimezone();

            expect(component.showTimezone).toBe(false);
        });
    });

    describe('timezoneChange ->', () => {
        it('should set timezone and loginTimes and call emitLoginTimes', () => {
            component.timezone = 'NoTimezone';
            component.loginTimes = [
                { ScheduleDay: 1, StartTime24HourMilitaryTimeHour: 'oldstart', EndTime24HourMilitaryTimeHour: 'oldend', Timezone: 'NoUpdate' },
                { ScheduleDay: 2, StartTime24HourMilitaryTimeHour: 'oldstart', EndTime24HourMilitaryTimeHour: 'oldend', Timezone: 'NoUpdate2' }
            ];
            component.daysOfWeek = [
                { Text: 'M', Selected: false, Name: "Monday", Value: 1, StartTime: '', EndTime: '', IsValid: true },
                { Text: 'Tu', Selected: false, Name: "Tuesday", Value: 2, StartTime: '', EndTime: '', IsValid: true }
            ];

            component.convertStringTimesToObject = jasmine.createSpy().and.returnValue({ Hours: 1 });
            component.convertFromTimezoneToUtc = jasmine.createSpy().and.returnValue('newStartEndTime');
            component.emitLoginTimes = jasmine.createSpy();

            
            component.timezoneChange({ target: {value: 'newTimezone'}});

            expect(component.emitLoginTimes).toHaveBeenCalled();
            expect(component.timezone).toEqual('newTimezone');            
            expect(component.loginTimes[0]).toEqual({ ScheduleDay: 1, StartTime24HourMilitaryTimeHour: 'newStartEndTime', EndTime24HourMilitaryTimeHour: 'newStartEndTime', Timezone: 'newTimezone' });
            expect(component.loginTimes[1]).toEqual({ ScheduleDay: 2, StartTime24HourMilitaryTimeHour: 'newStartEndTime', EndTime24HourMilitaryTimeHour: 'newStartEndTime', Timezone: 'newTimezone' });
        });        
    });

    describe('startTimeChanged ->', () => {
        it('should set start time on matching day', () => {
            component.timezone = 'NoTimezone';
            component.loginTimes = [
                { ScheduleDay: 1, Timezone: 'NoUpdate', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 2},
                { ScheduleDay: 2, Timezone: 'NoUpdate2', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 2 }
            ];

            component.convertStringTimesToObject = jasmine.createSpy().and.returnValue({Hours: 5, Minutes: 6 });
            component.emitLoginTimes = jasmine.createSpy();

            var dayOfWeek = { StartTime: 'NoUpdate', EndTime: 'NoUpdate' };
            component.startTimeChanged({ target: { value: 'test' } }, {StartTime: 'testTime', Value: 1});

            expect(component.emitLoginTimes).toHaveBeenCalled();            
            expect(component.loginTimes[0]).toEqual({ ScheduleDay: 1, Timezone: 'NoUpdate', StartTime24HourMilitaryTimeHour: 5, StartTime24HourMilitaryTimeMinute: 6 });
            expect(component.loginTimes[1]).toEqual({ ScheduleDay: 2, Timezone: 'NoUpdate2', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 2 });
        });
    });


    describe('endTimeChanged ->', () => {
        it('should set end time on matching day', () => {
            component.timezone = 'NoTimezone';
            component.loginTimes = [
                { ScheduleDay: 1, Timezone: 'NoUpdate', EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2 },
                { ScheduleDay: 2, Timezone: 'NoUpdate2', EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2 }
            ];

            component.convertStringTimesToObject = jasmine.createSpy().and.returnValue({ Hours: 5, Minutes: 6 });
            component.emitLoginTimes = jasmine.createSpy();

            var dayOfWeek = { StartTime: 'NoUpdate', EndTime: 'NoUpdate' };
            component.endTimeChanged({ target: { value: 'test' } }, { EndTime: 'testTime', Value: 1 });

            expect(component.emitLoginTimes).toHaveBeenCalled();
            expect(component.loginTimes[0]).toEqual({ ScheduleDay: 1, Timezone: 'NoUpdate', EndTime24HourMilitaryTimeHour: 5, EndTime24HourMilitaryTimeMinute: 6 });
            expect(component.loginTimes[1]).toEqual({ ScheduleDay: 2, Timezone: 'NoUpdate2', EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2 });
        });
    });

    describe('emitLoginTimes ->', () => {
        it('should call validateLoginTimes and emit loginTimeChanged', () => {
            component.validateLoginTimes = jasmine.createSpy();
            component.loginTimeChanged.emit = jasmine.createSpy();
            component.loginTimes = ['test'];

            component.emitLoginTimes();

            expect(component.validateLoginTimes).toHaveBeenCalled();
            expect(component.loginTimeChanged.emit).toHaveBeenCalledWith(component.loginTimes);
        });
    });


    describe('validateLoginTimes ->', () => {
        it('should set IsValid for each loginTimes', () => {
            component.daysOfWeek = [
                { Text: 'M', Selected: false, Name: "Monday", Value: 1, StartTime: '', EndTime: '', IsValid: true },
                { Text: 'Tu', Selected: false, Name: "Tuesday", Value: 2, StartTime: '', EndTime: '', IsValid: true },
                { Text: 'W', Selected: false, Name: "Wednesday", Value: 3, StartTime: '', EndTime: '', IsValid: false },
                { Text: 'Th', Selected: false, Name: "Thursday", Value: 4, StartTime: '', EndTime: '', IsValid: false }
            ];
            component.timeZones = [{ value: 'Central Standard Time', standardOffset: -6 }];
            component.timezone = 'Central Standard Time';
            component.loginTimes = [
                //Start time hour before end time
                { ScheduleDay: 1, Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 3, StartTime24HourMilitaryTimeMinute: 2, EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2 },

                //Start time hour same as end time, minutes greater than end time minutes
                { ScheduleDay: 2, Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 4, EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2 },

                //Valid
                { ScheduleDay: 3, Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 4, EndTime24HourMilitaryTimeHour: 4, EndTime24HourMilitaryTimeMinute: 2 },

                //Start time UTC after End time UTC before (OK because it wraps to next day)
                { ScheduleDay: 4, Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 23, StartTime24HourMilitaryTimeMinute: 2, EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2 },
            ];           

            component.validateLoginTimes();

            expect(component.loginTimes[0]).toEqual(
                { ScheduleDay: 1, Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 3, StartTime24HourMilitaryTimeMinute: 2, EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2, IsValid: false });
            expect(component.loginTimes[1]).toEqual(
                { ScheduleDay: 2, Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 4, EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2, IsValid: false });
            expect(component.loginTimes[2]).toEqual(
                { ScheduleDay: 3, Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 2, StartTime24HourMilitaryTimeMinute: 4, EndTime24HourMilitaryTimeHour: 4, EndTime24HourMilitaryTimeMinute: 2, IsValid: true });
            expect(component.loginTimes[3]).toEqual(
                { ScheduleDay: 4, Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 23, StartTime24HourMilitaryTimeMinute: 2, EndTime24HourMilitaryTimeHour: 2, EndTime24HourMilitaryTimeMinute: 2, IsValid: true });

            expect(component.daysOfWeek[0].IsValid).toEqual(false);
            expect(component.daysOfWeek[1].IsValid).toEqual(false);
            expect(component.daysOfWeek[2].IsValid).toEqual(true);
            expect(component.daysOfWeek[3].IsValid).toEqual(true);
        });
    });




    describe('fillTimes ->', () => {
        it('should configure start and end times 97 times', () => {           
            component.fillTimes();

            expect(component.times.length).toEqual(96);
        });        
    });

    describe('createStartandEndTimes ->', () => {
        it('should create 48 times in times array', () => {           
            component.createStartandEndTimes("AM");

            expect(component.times.length).toEqual(48);
        });        
    });

    describe('addTime ->', () => {
        it('should add a time to times array', () => {           
             component.addTime("12:00 AM");
 
             expect(component.times[0]).toEqual({ text: '12:00 AM', value: '12:00 AM' });
         });        
     });

     describe('pad ->', () => {
        it('should pass a leading 0 to a 1 digit numbers', () => {           
             var result = component.pad(2);
 
             expect(result).toEqual("02");
         }); 
        it('should NOT pass a leading 0 to a 2 digit numbers', () => {           
            var result = component.pad(12);

            expect(result).toEqual("12");
        });          
     });

    describe('convertStringTimesToObject ->', () => {
        it('should set time for 12:00 PM', () => {
            var result = component.convertStringTimesToObject("12:00 PM");

            expect(result).toEqual({Hours: 12, Minutes: 0});
        });

        it('should set time for 1:45 PM', () => {
            var result = component.convertStringTimesToObject("01:45 PM");

            expect(result).toEqual({ Hours: 13, Minutes: 45 });
        });

        it('should set time for 12:45 AM', () => {
            var result = component.convertStringTimesToObject("12:45 AM");

            expect(result).toEqual({ Hours: 0, Minutes: 45 });
        });        
    });

    describe('convertTimeObjectToString ->', () => {
        it('should set time for 12:00 PM', () => {
            var result = component.convertTimeObjectToString(
                { Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 12, StartTime24HourMilitaryTimeMinute: 0, EndTime24HourMilitaryTimeHour: 12, EndTime24HourMilitaryTimeMinute: 0 });

            expect(result).toEqual({StartTime: "06:00 AM", EndTime: "06:00 AM"});
        });

        it('should set time for 1:45 PM', () => {
            var result = component.convertTimeObjectToString({ Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 13, StartTime24HourMilitaryTimeMinute: 45, EndTime24HourMilitaryTimeHour: 13, EndTime24HourMilitaryTimeMinute: 45 });

            
            expect(result).toEqual({ StartTime: "07:45 AM", EndTime: "07:45 AM" });
        });

        it('should set time for 12:45 AM', () => {
            var result = component.convertTimeObjectToString({ Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 0, StartTime24HourMilitaryTimeMinute: 45, EndTime24HourMilitaryTimeHour: 0, EndTime24HourMilitaryTimeMinute: 45 });

            expect(result).toEqual({ StartTime: "06:45 PM", EndTime: "06:45 PM" });
        });
    });


    describe('convertFromUtcToTimezone ->', () => {
        beforeEach(() => {
            component.emitLoginTimes = jasmine.createSpy();
            component.showHideTimezone = jasmine.createSpy();

            component.timeZones = [{ value: 'Central Standard Time', standardOffset: -6 }];
        });

        it('should return 0 hours when start/end time are 6 and offset is -6', () => {
            var result = component.convertFromUtcToTimezone(
                { Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 6, StartTime24HourMilitaryTimeMinute: 0, EndTime24HourMilitaryTimeHour: 6, EndTime24HourMilitaryTimeMinute: 0 });

            expect(result).toEqual({ StartHour: 0, EndHour: 0 });
        });

        it('should return 6 hours when start/end time are 12 and offset is -6', () => {
            var result = component.convertFromUtcToTimezone(
                { Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 12, StartTime24HourMilitaryTimeMinute: 0, EndTime24HourMilitaryTimeHour: 12, EndTime24HourMilitaryTimeMinute: 0 });

            expect(result).toEqual({ StartHour: 6, EndHour: 6 });
        });

        it('should return 7 hours when start/end time are 13 and offset is -6', () => {
            var result = component.convertFromUtcToTimezone({ Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 13, StartTime24HourMilitaryTimeMinute: 45, EndTime24HourMilitaryTimeHour: 13, EndTime24HourMilitaryTimeMinute: 45 });


            expect(result).toEqual({ StartHour: 7, EndHour: 7 });
        });

        it('should should return 18 hours when start/end time are 0 and offset is -6', () => {
            var result = component.convertFromUtcToTimezone({ Timezone: 'Central Standard Time', StartTime24HourMilitaryTimeHour: 0, StartTime24HourMilitaryTimeMinute: 45, EndTime24HourMilitaryTimeHour: 0, EndTime24HourMilitaryTimeMinute: 45 });

            expect(result).toEqual({ StartHour: 18, EndHour: 18 });
        });
    });

    describe('convertFromTimezoneToUtc ->', () => {
        beforeEach(() => {
            component.emitLoginTimes = jasmine.createSpy();
            component.showHideTimezone = jasmine.createSpy();

            component.timeZones = [{ value: 'Central Standard Time', standardOffset: -6 }];
            component.timezone = 'Central Standard Time';
        });


        it('should return 2 when hour is 20 and offset is -6', () => {
            var result = component.convertFromTimezoneToUtc(20);

            expect(result).toEqual(2);
        });        
    });


});
