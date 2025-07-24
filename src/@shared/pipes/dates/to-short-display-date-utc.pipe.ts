import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';

@Pipe({
  name: 'toShortDisplayDateUtc'
})
export class ToShortDisplayDateUtcPipe implements PipeTransform {
  transform(date: string, ...args: any[]): any {
    return date ? moment.utc(date).format("MM/DD/YYYY") : '';
  }
}
