import { Pipe, PipeTransform } from '@angular/core';
import { anyChanged } from '@progress/kendo-angular-common';

// returns patient display name per best practices
@Pipe({
  name: 'bestPracticePatientName'
})
export class BestPracticePatientNamePipe implements PipeTransform {
  transform(patient: any ): any {
    let patientName = '';
    if (!patient) {
      return '';
    }

    // set preferredName
    const preferredName = patient.PreferredName ?  '(' + patient.PreferredName + ')' : '';
    // set middleName
    const middleName = patient.MiddleName ? patient.MiddleName.charAt(0) + '.' : '';
    // some dtos have patient.Suffix, some have SuffixName, handle
    const suffix = patient.Suffix ? patient.Suffix : patient.SuffixName ? patient.SuffixName : '';
    // concat name
    patientName = ([patient.FirstName, preferredName, middleName].filter((text) => {
       return text; }).join(' ')) + ' ' + [patient.LastName, suffix].filter((text) => text).join(', ');
    // remove trailing whitespace from the computed name.
    return patientName.trim();
  }

}
