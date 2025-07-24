import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';
@Pipe({
  name: 'toDisplayTime'
})
export class ToDisplayTimePipe implements PipeTransform {

  transform(date: any, ...args: any[]): any {
       // Displays H:MM am/pm
   if (!date) {
        return '';
    } else {
      const local = moment.utc(date).toDate();
      return moment(local).format('h:mm a');
    }
  }

}
