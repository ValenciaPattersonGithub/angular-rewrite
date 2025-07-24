// service for pulling off transforms as we move logic out of the schedule for appointment formatting -- this is an initial idea.
import { Injectable, Inject } from '@angular/core';
import { DatePipe } from '@angular/common'; 
import { LocationTimeService } from '../providers/location-time.service';

@Injectable()
export class LocationsDisplayService {

    constructor(private locationTimeService: LocationTimeService, private datePipe: DatePipe) { }

    setLocationDisplayText(list, dateItem) {
        if (list) {
            for (let i = 0; i < list.length; i++) {
                list[i].timezoneInfo = this.locationTimeService.getTimezoneInfo(list[i].Timezone, dateItem);
                if (list[i].timezoneInfo !== null && list[i].timezoneInfo !== undefined) {

                    // need to figure out at some point if we want to display (ex CST or CDT) ... throughout the year this might confuse people
                    // I would guess most people would do not understand the differences since time is complicated to most people, 
                    // so we should think about it.
                    // the below comment line would be more accurate but would change the current implementation
                    //list[i].displayText = list[i].NameLine1 + ' (' + list[i].timezoneInfo.displayAbbr + ')';
                    list[i].displayText = list[i].NameLine1 + ' (' + list[i].timezoneInfo.abbr + ')';

                    if (list[i].DeactivationTimeUtc !== null && list[i].DeactivationTimeUtc !== undefined) {
                        list[i].displayText += ' - ' + this.formatDeactivationDate(list[i].DeactivationTimeUtc);
                    }
                }
                else {
                    // fall back to this value if timezone processing does not return the timezoneInfo
                    list[i].displayText = list[i].NameLine1 + ' (??)';
                }
            }
        }
        return list;
    }

    formatDeactivationDate(date) {
        return this.datePipe.transform(date, 'MM/dd/yyyy');
    }
}
