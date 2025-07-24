import { Injectable, Inject } from '@angular/core';

import * as moment from 'moment-timezone';

import { Timezone } from "../models/timezone";
import { TimezoneDataService } from "../providers/timezone-data.service";

import isNil from 'lodash/isNil';

@Injectable()
export class LocationTimeService {
    timezones: Timezone[];
    dateFormat = 'YYYY-MM-DD HH:mm:ss';

    constructor(@Inject(TimezoneDataService) TimezoneDataService) {
        this.timezones = TimezoneDataService.timezones;


    }

    findTimezoneByValue(value: string) {
        if (this.timezones) {
            for (let i = 0; i < this.timezones.length; i++) {
                if (this.timezones[i]['value'] === value) {
                    return this.timezones[i];
                }
            }
        }
        return null;
    } 

    private getMomentTzObject(timezone: string, dateItem) {
        if (dateItem === null || dateItem === undefined) {
            return dateItem;
        }

        if (typeof dateItem === 'string' && !dateItem.toLowerCase().endsWith('z')) {
            dateItem += 'Z';
        }
        return moment.tz(dateItem, timezone);
    }

    translateUtcToLocationTime(location, date: Date) {
        let tzone = this.findTimezoneByValue(location.timezone);
        return moment(date).add(tzone.offset, 'h');
    }

    getTimezoneInfo(timezone, dateItem) {
        let res = this.findTimezoneByValue(timezone);
        if (res !== null && res !== undefined) {
            let momentObj = (dateItem === undefined || dateItem === null) ? moment() : moment(dateItem);
            let momentTzObj = this.getMomentTzObject(res.momentTz, momentObj.format('YYYY-MM-DD 23:59:59'));
            res.displayAbbr = momentTzObj.isDST() ? res.dstAbbr : res.abbr;
        }
        return res;
    }

    getTimeZoneAbbr = (timezone: string, dateItem: Date = null): string => {
        const res = this.getTimezoneInfo(timezone, dateItem);
        const timeZoneAbbr = res ? res?.displayAbbr : '';
        return timeZoneAbbr;
    }


    /**
     * Converts a given input date to UTC while keeping the local time.
     *
     * @param {moment.MomentInput | Date} inputDate - The input date to be converted.
     * @returns {Date | null} The UTC date with the local time, or null if the input is invalid.
     */
    toUTCDateKeepLocalTime = (inputDate: moment.MomentInput | Date): Date | null => {
        const momentInputDate = moment(inputDate);        
        if (momentInputDate.isValid()) {
            return momentInputDate.utc(true).toDate();
        }    
        return null;
    }
    


    convertDateTZ = (dateItem, timezone) => {
        if (!isNil(dateItem)) {
          let momentObj = this.convertToMomentTZ(dateItem, timezone);
          return momentObj?.toDate();
        }
        return dateItem;
    }

    convertToMomentTZ = (dateItem, timezone) => {
        const timeZoneUpper = 'Z';
        const timeZoneLower = 'z';
        
        if (isNil(dateItem)) {
          return dateItem;
        }
        let tz = this.getMomentTZ(timezone);
        if (typeof dateItem == 'string' && !dateItem?.toLowerCase()?.endsWith(timeZoneLower)) {
          dateItem += timeZoneUpper;
        }
        let dateMoment = moment(dateItem);
        let resultMoment = moment(dateMoment?.clone().tz(tz)?.format(this.dateFormat));
        return resultMoment;
      }

      getMomentTZ = (timezone) => {
        let tz = null;
        if (timezone && timezone.MomentTZ) {
          tz = timezone?.MomentTZ;
        } else if (typeof timezone == 'string' && (timezone?.indexOf('America/') > -1 || timezone?.indexOf('Pacific/') > -1)) {
          tz = timezone;
        } else {
          let tzInfo = this.getTimezoneInfo(timezone, this.dateFormat);
          tz = tzInfo?.momentTz;
        }
        return tz;
      }
}
