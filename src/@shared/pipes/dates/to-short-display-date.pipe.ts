import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';
@Pipe({
  name: 'toShortDisplayDate'
})
export class ToShortDisplayDatePipe implements PipeTransform {

  transform(date: string, ...args: any[]): any {
    if (!date) {
      return '';
    } else {
      return moment(date).format('MM/DD/YYYY');
    }

  }

}
