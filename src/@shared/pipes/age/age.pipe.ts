
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'age'
})
export class AgePipe implements PipeTransform {

  constructor() { }

  transform(value: Date): number {
    if (value) {
      const today = moment();
      const birthdate = moment(value);
      const years = today.diff(birthdate, 'years');
      const age: number = years;

      return age;
    }
  }
}
