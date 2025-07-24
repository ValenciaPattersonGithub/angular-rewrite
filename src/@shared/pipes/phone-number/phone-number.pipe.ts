// NOTE this is a direct copy of the tel filter from Fuse
// if logic is wrong there then this is too.
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneNumber'
})
export class PhoneNumberPipe implements PipeTransform {

  transform(phoneNumber: any): any {
    if (!phoneNumber) {
      return '';
    }
    let value = phoneNumber.toString().trim().replace(/^\+/, '');

    if (value.match(/[^0-9]/)) {
      return phoneNumber;
    }

    let country = '';
    let city = '';
    let phone = '';

    switch (value.length) {
      case 10: // +1PPP####### -> (PPP) ###-####
        country = '1';
        city = value.slice(0, 3);
        phone = value.slice(3);
        break;

      case 11: // +CPPP####### -> C (PPP) ###-####
        country = value[0];
        city = value.slice(1, 4);
        phone = value.slice(4);
        break;

      case 12: // +CCCPP####### -> CCC (PP) ###-####
        country = value.slice(0, 3);
        city = value.slice(3, 5);
        phone = value.slice(5);
        break;

      default:
        return phoneNumber;
    }

    if (country === '1') {
      country = '';
    }
    phone = phone.slice(0, 3) + '-' + phone.slice(3);
    return (country + ' (' + city + ') ' + phone).trim();
  }

}
