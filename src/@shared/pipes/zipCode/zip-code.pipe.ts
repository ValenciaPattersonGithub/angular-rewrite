import {  Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'zipCode',
  pure: false
})

export class ZipCodePipe implements PipeTransform {
  transform(zipCode: any): any {
    if (zipCode && zipCode.length > 5) {
      return zipCode.slice(0, 5) + '-' + zipCode.slice(5, 9);
    } else {
      return zipCode;
    }
  }
}

