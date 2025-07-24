
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'enumAsString'
})
export class EnumAsStringPipe implements PipeTransform {

  constructor(private translate: TranslateService) { }

  transform(value: any, enumType: any): any {
    let transformedValue: any;
    if (enumType[value] === 'USMail') {
      transformedValue = this.translate.instant('US Mail');
    } else if (enumType[value] === 'OtherPatientCare') {
      transformedValue = this.translate.instant('Other Patient Care');
    } else if (enumType[value] === 1) {
      transformedValue = this.translate.instant('Male');
    } else if (enumType[value] === 2) {
      transformedValue = this.translate.instant('Female');
    } else if (enumType[value]) {
      transformedValue = this.translate.instant(enumType[value].split(/(?=[A-Z])/).join().replace(',', ' '));
    } else {
      transformedValue = 'N/A';
    }
    return transformedValue;
  }
}
