import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Deferred } from 'jquery';

@Component({
    selector: 'user-login-time-panel',
    templateUrl: './user-login-time-panel.component.html',
    styleUrls: ['./user-login-time-panel.component.scss']
})
export class UserLoginTimePanelComponent implements OnInit {
    @Input() user: any;
    @Output() loginTimeChanged = new EventEmitter();
    title: string = 'Restrict Day and Time Access';
    description: string = 'Select days of the week to restrict user login time, non-selected days will allow all day access';    
    timeZoneLabel: string = 'Time Zone';
    workingHoursSection: string = 'Select Working Hours for Selected Days';
    toLabel: string = 'To';
    loginTimes: any[] = [];
    timezone: string;
    location: any;
    showTimezone: boolean;

    //TODO: Replace hard coded values with a call to API to get saved values
    daysOfWeek: any[] = [
        { Text: 'M', Selected: false, Name:"Monday", Value: 1, StartTime: '', EndTime: '', IsValid: true, IsDayDisabled: false },
        { Text: 'Tu', Selected: false, Name: "Tuesday", Value: 2, StartTime: '', EndTime: '', IsValid: true, IsDayDisabled: false },
        { Text: 'W', Selected: false, Name: "Wednesday", Value: 3, StartTime: '', EndTime: '', IsValid: true, IsDayDisabled: false },
        { Text: 'Th', Selected: false, Name: "Thursday", Value: 4, StartTime: '', EndTime: '', IsValid: true, IsDayDisabled: false },
        { Text: 'F', Selected: false, Name: "Friday", Value: 5, StartTime: '', EndTime: '', IsValid: true, IsDayDisabled: false },
        { Text: 'Sa', Selected: false, Name: "Saturday", Value: 6, StartTime: '', EndTime: '', IsValid: true, IsDayDisabled: false },
        { Text: 'Su', Selected: false, Name: "Sunday", Value: 0, StartTime: '', EndTime: '', IsValid: true, IsDayDisabled: false }];

    timeZones: any[] = [
        { text: 'Alaskan Time Zone', value: 'Alaskan Standard Time', standardOffset: -9 },
        { text: 'Central Time Zone', value: 'Central Standard Time', standardOffset: -6 },
        { text: 'Eastern Time Zone', value: 'Eastern Standard Time', standardOffset: -5 },
        { text: 'Hawaii-Aleutian Time Zone', value: 'Aleutian Standard Time', standardOffset: -10 },
        { text: 'Hawaii Standard Time Zone (Honolulu)', value: 'Hawaiian Standard Time', standardOffset: -10 },
        { text: 'Mountain Time Zone (Denver)', value: 'Mountain Standard Time', standardOffset: -7 },
        { text: 'Mountain Time Zone (Phoenix)', value: 'US Mountain Standard Time', standardOffset: -7 },
        { text: 'Pacific Time Zone', value: 'Pacific Standard Time', standardOffset: -8 }];

    times: any[] = [];
    initialSelectedDays: any[] = [];

    saveStates = {
        None: 'None',
        Update: 'Update',
        Delete: 'Delete',        
    };

    constructor(                        
        @Inject('UserServices') private userServices,
        @Inject('practiceService') private practiceService,
        @Inject('locationService') private locationService,
    ) { }

    ngOnInit(): void {
        this.location = this.locationService.getCurrentLocation();
        this.daysOfWeek.forEach(x => {
            x.StartTime = '08:00 AM';
            x.EndTime = '05:00 PM';
        });
        this.timezone = 'Central Standard Time';
        var practiceId = this.practiceService.getCurrentPractice().id;

        const promises = [];        

        this.fillTimes();

        if (this.user.UserId) {
            for (var x = 0; x < 7; ++x) {
                promises.push(this.getUserLoginTime(practiceId, x));
            }

            Promise.all(promises).then(([sunday, monday, tuesday, wednesday, thursday, friday, saturday]) => {
                this.processSavedLoginTime(sunday);
                this.processSavedLoginTime(monday);
                this.processSavedLoginTime(tuesday);
                this.processSavedLoginTime(wednesday);
                this.processSavedLoginTime(thursday);
                this.processSavedLoginTime(friday);
                this.processSavedLoginTime(saturday);

                this.setTimezone();
                this.showHideTimezone();
            });
        }
        else {
            this.setTimezone();
            this.showHideTimezone();
        }
    }

    getUserLoginTime(practiceId, day) {
        var promise = Deferred<any>();
        this.userServices.UserLoginTimes.get({ practiceId: practiceId, userId: this.user.UserId, day: day }).$promise.then(
                (success) => {                    

                promise.resolve(success.Result);
                },
                (error) => {
                    promise.resolve();
                }
        );

        return promise;
    }

    processSavedLoginTime(loginTime) {
        if (loginTime) {
            loginTime.$State = this.saveStates.Update;
            this.loginTimes.push(loginTime);
            this.initialSelectedDays.push(loginTime);

            var matchingDayOfWeek = this.daysOfWeek.find((day) => {
                return day.Value === loginTime.ScheduleDay;
            });

            if (matchingDayOfWeek) {
                matchingDayOfWeek.Selected = true;
                this.setStartEndTimesOnDayOfWeek(matchingDayOfWeek, loginTime);
                this.setIsDayDisabled(matchingDayOfWeek)

            }
        }       
    }


    setTimezone() {
        if (this.initialSelectedDays && this.initialSelectedDays.length > 0) {
            this.timezone = this.initialSelectedDays[0].Timezone;
            this.loginTimes.forEach(x => {
                x.Timezone = this.timezone;
            });
        }
        else {
            this.timezone = this.location.timezone
        }
    }

    setStartEndTimesOnDayOfWeek(dayOfWeek, loginTime) {
        var convertedTime = this.convertTimeObjectToString(loginTime);
        dayOfWeek.StartTime = convertedTime.StartTime;
        dayOfWeek.EndTime = convertedTime.EndTime;
    }

    setIsDayDisabled(dayOfWeek) {
        if (dayOfWeek.StartTime == dayOfWeek.EndTime) {
            dayOfWeek.IsDayDisabled = true;
            dayOfWeek.StartTime = '12:00 AM';
            dayOfWeek.EndTime = '12:00 AM';
        }          
    }

    toggleIsDayDisabled(event, dayOfWeek) {
        if (event.currentTarget.checked) {
            //Checkbox was checked
            dayOfWeek.StartTime = '12:00 AM';
            dayOfWeek.EndTime = '12:00 AM';
            dayOfWeek.IsDayDisabled = true;

            var loginTimeForDay = this.loginTimes.find(x => {
                return x.ScheduleDay == dayOfWeek.Value;
            });

            if (loginTimeForDay) {
                var convertedTime = this.convertStringTimesToObject('12:00 AM');
                var hoursInUtc = this.convertFromTimezoneToUtc(convertedTime.Hours);
                loginTimeForDay.StartTime24HourMilitaryTimeHour = hoursInUtc;
                loginTimeForDay.StartTime24HourMilitaryTimeMinute = convertedTime.Minutes;
                loginTimeForDay.EndTime24HourMilitaryTimeHour = hoursInUtc;
                loginTimeForDay.EndTime24HourMilitaryTimeMinute = convertedTime.Minutes;
            }
        }
        else {
            //Checkbox was unchecked
            dayOfWeek.StartTime = '08:00 AM';
            dayOfWeek.EndTime = '05:00 PM';
            dayOfWeek.IsDayDisabled = false;

            var loginTimeForDay = this.loginTimes.find(x => {
                return x.ScheduleDay == dayOfWeek.Value;
            });

            if (loginTimeForDay) {
                var convertedStartTime = this.convertStringTimesToObject(dayOfWeek.StartTime);
                loginTimeForDay.StartTime24HourMilitaryTimeHour = this.convertFromTimezoneToUtc(convertedStartTime.Hours);
                loginTimeForDay.StartTime24HourMilitaryTimeMinute = convertedStartTime.Minutes;

                var convertedEndTime = this.convertStringTimesToObject(dayOfWeek.EndTime);
                loginTimeForDay.EndTime24HourMilitaryTimeHour = this.convertFromTimezoneToUtc(convertedEndTime.Hours);
                loginTimeForDay.EndTime24HourMilitaryTimeMinute = convertedEndTime.Minutes;
            }
        }        
        this.emitLoginTimes();        
    }


    dayToggled(event, day) {
        var dayFromList = this.daysOfWeek.find((loopDay) => {
            return loopDay.Text === day.Text;
        });        

        if (dayFromList) {
            dayFromList.Selected = event;
            dayFromList.IsDayDisabled = false;
        }

        if (event) {
            //We just selected the day
            var matchingInitialDay = this.initialSelectedDays.find(x => {
                return x.ScheduleDay == day.Value;
            });

            if (matchingInitialDay) {
                //The day was part of the initial saved list, unselected, then reselected               
                this.loginTimes.forEach(x => {
                    if (x.ScheduleDay == day.Value) {
                        x.$State = this.saveStates.Update;
                        x.StartTime24HourMilitaryTimeHour = this.convertFromTimezoneToUtc(8);
                        x.StartTime24HourMilitaryTimeMinute = 0;
                        x.EndTime24HourMilitaryTimeHour = this.convertFromTimezoneToUtc(17);
                        x.EndTime24HourMilitaryTimeMinute = 0;
                    }
                });
            }
            else {
                this.loginTimes.push({
                    ScheduleDay: day.Value, Timezone: this.timezone,
                    StartTime24HourMilitaryTimeHour: this.convertFromTimezoneToUtc(8), StartTime24HourMilitaryTimeMinute: 0,
                    EndTime24HourMilitaryTimeHour: this.convertFromTimezoneToUtc(17), EndTime24HourMilitaryTimeMinute: 0,
                    $State: this.saveStates.Update
                })
            }

            var matchingDayOfWeek = this.daysOfWeek.find((dayValue) => {
                return dayValue.Value === day.Value;
            });

            if (matchingDayOfWeek) {
                matchingDayOfWeek.StartTime = '08:00 AM';
                matchingDayOfWeek.EndTime = '05:00 PM';
            }
            
            
        }
        else {
            //We just unselected the day            
            var matchingInitialDay = this.initialSelectedDays.find(x => {
                return x.ScheduleDay == day.Value;
            });

            if (matchingInitialDay) {
                //The deselected date was already saved, we need to delete it

                this.loginTimes.forEach(x => {
                    if (x.ScheduleDay == day.Value) {
                        x.$State = this.saveStates.Delete;
                    }
                });
            }
            else {
                //The deselected date wasn't ever saved, so just remove it from the loginTimes list

                var index = this.loginTimes.findIndex(x => {
                    return x.ScheduleDay == day.Value;
                });
                if (index >= 0) {
                    this.loginTimes.splice(index, 1)
                }                
            }       
        }

        this.showHideTimezone();

        this.emitLoginTimes();
    }

    showHideTimezone() {        
        var selectedDayOfWeek = this.daysOfWeek.findIndex(x => {
            return x.Selected == true;
        });

        if (selectedDayOfWeek >= 0) {
            this.showTimezone = true;
        }
        else {
            this.showTimezone = false;
        }
    }

    timezoneChange(event) {
        this.timezone = event.target.value;
        this.loginTimes.forEach(x => {
            x.Timezone = event.target.value;

            var dayOfWeek = this.daysOfWeek.find((day) => {
                return day.Value == x.ScheduleDay;
            });

            if (dayOfWeek) {
                //Apply the timezone change to the Start/End hours
                var convertedStartTime = this.convertStringTimesToObject(dayOfWeek.StartTime);
                x.StartTime24HourMilitaryTimeHour = this.convertFromTimezoneToUtc(convertedStartTime.Hours);

                var convertedEndTime = this.convertStringTimesToObject(dayOfWeek.EndTime);
                x.EndTime24HourMilitaryTimeHour = this.convertFromTimezoneToUtc(convertedEndTime.Hours);
            }            
        });

        this.emitLoginTimes();
    }

    startTimeChanged(event, dayOfWeek) {        
        dayOfWeek.StartTime = event.target.value;        

        var loginTimeForDay = this.loginTimes.find(x => {
            return x.ScheduleDay == dayOfWeek.Value;
        });

        if (loginTimeForDay) {
            var convertedTime = this.convertStringTimesToObject(event.target.value);
            loginTimeForDay.StartTime24HourMilitaryTimeHour = this.convertFromTimezoneToUtc(convertedTime.Hours);
            loginTimeForDay.StartTime24HourMilitaryTimeMinute = convertedTime.Minutes;
        }
        this.emitLoginTimes();
    }

    endTimeChanged(event, dayOfWeek) {        
        dayOfWeek.EndTime = event.target.value;        

        var loginTimeForDay = this.loginTimes.find(x => {
            return x.ScheduleDay == dayOfWeek.Value;
        });

        if (loginTimeForDay) {
            var convertedTime = this.convertStringTimesToObject(event.target.value);
            loginTimeForDay.EndTime24HourMilitaryTimeHour = this.convertFromTimezoneToUtc(convertedTime.Hours);
            loginTimeForDay.EndTime24HourMilitaryTimeMinute = convertedTime.Minutes;
        }

        this.emitLoginTimes();
    }

    emitLoginTimes()
    {
        // TODO: raise event to container to set value (myEvent.target.value) based upon control id (myEvent.srcElement.id) on DTO         
        this.validateLoginTimes();

        this.loginTimeChanged.emit(this.loginTimes)
    }
     
    validateLoginTimes() {
        this.loginTimes.forEach(x => {            
            var convertedTime = this.convertFromUtcToTimezone(x);
            if (convertedTime.StartHour > convertedTime.EndHour ||
                (convertedTime.StartHour == convertedTime.EndHour
                    && x.StartTime24HourMilitaryTimeMinute > x.EndTime24HourMilitaryTimeMinute)) {
                x.IsValid = false;

                var matchingDayOfWeek = this.daysOfWeek.find((day) => {
                    return day.Value === x.ScheduleDay;
                });
                matchingDayOfWeek.IsValid = false;
            }
            else {
                x.IsValid = true;

                var matchingDayOfWeek = this.daysOfWeek.find((day) => {
                    return day.Value === x.ScheduleDay;
                });
                matchingDayOfWeek.IsValid = true;
            }           
        });
    }

    fillTimes() {
        this.createStartandEndTimes('AM');
        this.createStartandEndTimes('PM');        
    }

    createStartandEndTimes(meridian: string) {
        for (var i = 0; i < 12; i++) {
            var hour = i == 0 ? 12 : i;

            for (var j = 0; j <= 45; j += 15) // 15 minute increments
            {
                var time = this.pad(hour) + ":" + this.pad(j) + ' ' + meridian;
                this.addTime(time);
            }
        }
    }

    addTime(time: string) {
        var obj = {};
        obj["text"] = time;
        obj["value"] = time;
        this.times.push(obj);
    }

    pad(num: number) {
        var s = String(num);
        while (s.length < 2) {s = "0" + s;}
        return s;
    }

    convertStringTimesToObject(time: string) {
        var hours: number = +time.substr(0, 2);
        var minutes: number = +time.substr(3, 2);
        var amPM = time.substr(6, 2);

        if (amPM == 'PM' && hours < 12) {
            hours = hours + 12;
        }
        else if (amPM == 'AM' && hours == 12) {
            hours = hours - 12;
        }

        return { Hours: hours, Minutes: minutes };
    }

    convertTimeObjectToString(time: any) {        
        var startHour = 0;        
        var endHour = 0;        

        var convertedTime = this.convertFromUtcToTimezone(time);

        if (convertedTime.StartHour > 12) {
            startHour = convertedTime.StartHour - 12;
        }
        else if (convertedTime.StartHour == 0) {
            startHour = 12;
        }
        else {
            startHour = convertedTime.StartHour;
        }

        if (convertedTime.EndHour > 12) {
            endHour = convertedTime.EndHour - 12;
        }
        else if (convertedTime.EndHour == 0) {
            endHour = 12;
        }
        else {
            endHour = convertedTime.EndHour;
        }

        var startTimeAMPMString = convertedTime.StartHour >= 12 ? 'PM' : 'AM'
        var endTimeAMPMString = convertedTime.EndHour >= 12 ? 'PM' : 'AM'

        var startTime = this.pad(startHour) + ":" + this.pad(time.StartTime24HourMilitaryTimeMinute) + ' ' + startTimeAMPMString;
        var endTime = this.pad(endHour) + ":" + this.pad(time.EndTime24HourMilitaryTimeMinute) + ' ' + endTimeAMPMString;

        return { StartTime: startTime, EndTime: endTime };
    }

    convertFromUtcToTimezone(time) {
        var timezoneOffset = 0;
        var timezone = this.timeZones.find((tz) => {
            return tz.value == time.Timezone;
        });

        if (timezone) {
            timezoneOffset = timezone.standardOffset;
        }

        var startHour = time.StartTime24HourMilitaryTimeHour + timezoneOffset;
        var endHour = time.EndTime24HourMilitaryTimeHour + timezoneOffset;

        if (startHour < 0) {        
            startHour = startHour + 24;
        }
        else if (startHour > 23) {
            startHour = startHour - 24;
        }

        if (endHour < 0) {
            endHour = endHour + 24;
        }
        else if (endHour > 23) {
            endHour = endHour - 24;
        }

        return { StartHour: startHour, EndHour: endHour };
    }

    convertFromTimezoneToUtc(hour) {        
        var timezoneOffset = 0;
        var timezone = this.timeZones.find((tz) => {
            return tz.value == this.timezone;
        });

        if (timezone) {
            timezoneOffset = timezone.standardOffset;
        }

        var startHour = hour - timezoneOffset;

        if (startHour < 0) {
            startHour = startHour + 24;
        }
        else if (startHour > 23) {
            startHour = startHour - 24;
        }

        return startHour;
    }

}
