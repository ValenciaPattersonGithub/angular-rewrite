import { Injectable, Inject } from '@angular/core';
import { RxPatient } from '../models/patient-rx.model';
import { AuthAccess } from '../../../../@shared/models/auth-access.model';
import { ZipCodePipe } from '../../../../@shared/pipes/zipCode/zip-code.pipe';
import { isNullOrUndefined } from 'util';

@Injectable()
export class PatientRxService {
  constructor(
    @Inject('patSecurityService') private patSecurityService,
    @Inject('practiceService') private practiceService,
    @Inject('locationService') private locationService,
    private zipCode: ZipCodePipe
  ) {}
  //#region authentication
  authCreateAccess() {
    return this.patSecurityService.IsAuthorizedByAbbreviation(
      'rxapi-rx-rxpat-create'
    );
  }
  authViewAccess() {
    return this.patSecurityService.IsAuthorizedByAbbreviation(
      'soar-clin-clinrx-view'
    );
  }
  getAuthAccess() {
    const authAccess = new AuthAccess();
    if (this.authViewAccess()) {
      authAccess.create = this.authCreateAccess();
      authAccess.view = true;
    }
    return authAccess;
  }

  validatePatient(patient) {
    if (patient) {
      if (!patient.FirstName || patient.FirstName === '') {
        return false;
      }
      if (!patient.LastName || patient.LastName === '') {
        return false;
      }
      if (!patient.Address1 || patient.Address1 === '') {
        return false;
      }
      if (!patient.DateOfBirth) {
        return false;
      }
      if (!patient.Phone || patient.Phone === '') {
        return false;
      }
      if (!patient.PhoneType || patient.PhoneType === '') {
        return false;
      }
      if (!patient.City || patient.City === '') {
        return false;
      }
      if (!patient.State || patient.State === '') {
        return false;
      }
      if (!patient.PostalCode || patient.PostalCode === '') {
        return false;
      }
      if (
        !patient.Gender ||
        patient.Gender === '' ||
        patient.Gender.trim() === '' ||
        patient.Gender.toLowerCase() === 'unknown'
      ) {
        return false;
      }
      return true;
    }
    return false;
  }
  validationMessage(patient) {
    const requirmentsList = [];

    if (patient) {
      if (!patient.FirstName || patient.FirstName === '') {
        requirmentsList.push({ info: 'FirstName' });
      }
      if (!patient.LastName || patient.LastName === '') {
        requirmentsList.push({ info: 'LastName' });
      }
      if (!patient.Address1 || patient.Address1 === '') {
        requirmentsList.push({ info: 'Address1' });
      }
      if (!patient.DateOfBirth) {
        requirmentsList.push({ info: 'Date of birth' });
      }
      if (!patient.Phone || patient.Phone === '') {
        requirmentsList.push({ info: 'Phone' });
      }
      if (!patient.PhoneType || patient.PhoneType === '') {
        requirmentsList.push({ info: 'Phone type' });
      }
      if (!patient.City || patient.City === '') {
        requirmentsList.push({ info: 'City' });
      }
      if (!patient.State || patient.State === '') {
        requirmentsList.push({ info: 'State' });
      }
      if (!patient.PostalCode || patient.PostalCode === '') {
        requirmentsList.push({ info: 'Zip code' });
      }
      if (
        !patient.Gender ||
        patient.Gender === '' ||
        patient.Gender.trim() === '' ||
        patient.Gender.toLowerCase() === 'unknown'
      ) {
        requirmentsList.push({ info: 'Gender' });
      }
    }
    return requirmentsList;
  }
  createRxPatient(patient) {
    const userContext = JSON.parse(sessionStorage.getItem('userContext'));
    const applicationId = userContext.Result.Application.ApplicationId;
    const userId = userContext.Result.User.UserId;
    // format the phone number TODO modify to pipe
    const formattedZipCode = this.zipCode.transform(patient.ZipCode);

    // set height in inches
    const height = parseInt(patient.HeightFeet * 12 + patient.HeightInches);
    const heightMetric = 1;

    // set weight to lbs
    const weight = parseInt(patient.Weight);
    const weightMetric = 1;

    // set email
    let email = null;
    if (
      !patient.EmailAddresses ||
      patient.EmailAddresses.length == 0 ||
      patient.EmailAddresses[0].Email === ''
    ) {
      email = null;
    } else {
      email = patient.EmailAddresses[0].Email;
    }
    // set gender
    let gender = 'Unknown';
    switch (patient.Sex) {
      case 'M':
        gender = 'Male';
        break;
      case 'F':
        gender = 'Female';
        break;
      default:
        gender = 'Unknown';
        break;
    }
    // set phone number and type
    let phoneType = '';
    let phoneNumber = '';
    if (patient.Phones && patient.Phones.length > 0) {
      // find the primary phone
      const primaryPhone = patient.Phones.find(
        phone => phone.IsPrimary === true
      );
      if (primaryPhone) {
        phoneType = this.convertPhoneType(patient.Phones[0].Type);
        phoneNumber = patient.Phones[0].PhoneNumber;
      }
    }

    const rxPatient = new RxPatient();
    rxPatient.PatientId = patient.PatientId;
    rxPatient.Prefix = this.truncateField(patient.Prefix, 10);
    rxPatient.FirstName = this.truncateField(patient.FirstName, 35);
    rxPatient.MiddleName = this.truncateField(patient.MiddleName, 35);
    rxPatient.LastName = this.truncateField(patient.LastName, 35);
    rxPatient.Suffix = this.truncateField(patient.Suffix, 10);
    rxPatient.DateOfBirth = patient.DateOfBirth;
    rxPatient.Gender = gender;
    rxPatient.PhoneType = this.truncateField(phoneType, 50);
    rxPatient.UserId = userId;
    rxPatient.MRN = '';
    rxPatient.Email = email;
    rxPatient.ApplicationId = applicationId;
    rxPatient.Address1 = this.truncateField(patient.AddressLine1, 35);
    rxPatient.Address2 = this.truncateField(patient.AddressLine2, 35);
    rxPatient.City = this.truncateField(patient.City, 35);
    rxPatient.State = this.truncateField(patient.State, 20);
    rxPatient.PostalCode = this.truncateField(formattedZipCode, 10);
    rxPatient.Phone = this.truncateField(phoneNumber, 25);
    rxPatient.Height = height;
    rxPatient.HeightMetric = heightMetric;
    rxPatient.Weight = weight;
    rxPatient.WeightMetric = weightMetric;

    return rxPatient;
  }

  truncateField(field: string, length: number) {
    var returnString = !isNullOrUndefined(field)
      ? field.substr(0, length)
      : field;
    return returnString;
  }

  // todo when we have http client stategy in place
  // migrate logic from patient-rx-factory
  // savePatient(){
  // }

  // getMedications(){
  // }

  convertPhoneType(type) {
    if (!type || type === '') {
      return type;
    }
    switch (type) {
      case 'Work':
        return 'Work';
      case 'Mobile':
        return 'Cell';
      case 'Home':
      default:
        return 'Home';
    }
  }
}
