export class Patient {

  patientId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  suffix: string;
  preferredName: string;
  sex: string;
  dateOfBirth: Date;
  isPatient: boolean;
  patientCode: string;
  isActive: boolean;
  directoryAllocationId: string;
  displayStatementAccountId: string;
  address: string;
  address1: string;
  email: string;
  phone: string;
  Value: any;
  type: string;

  constructor(data?: any) {
    if (data) {

      this.patientId = data.PatientId;
      this.firstName = data.FirstName;
      this.lastName = data.LastName;
      this.middleName = data.MiddleName;
      this.suffix = data.Suffix;
      this.preferredName = data.PreferredName;
      this.sex = data.Sex;
      this.dateOfBirth = new Date(data.DateOfBirth);
      this.isPatient = data.IsPatient;
      this.patientCode = data.PatientCode;
      this.isActive = data.IsActive;
      this.directoryAllocationId = data.DirectoryAllocationId;
      this.displayStatementAccountId = data.DisplayStatementAccountId;
      this.fullName = this.firstName + ' ' + this.lastName;
      this.type = "Patient";
      this.phone = data.Phone;
      this.email = data.Email;
      const addressParts = [data.Address1, data.Address2];
      this.address = addressParts.filter(Boolean).join(', ');
        this.address1 = `${data.City || ''}, ${data.State || ''} ${data.ZipCode || ''}`;
        if (this.address1 == ",  ") {
            this.address1 = "";
        }


    }
  }

}

export interface Practice {
  practiceAffiliateId: string;
  practiceId: number;
  name: string;
}

export interface Provider {
  firstName: string;
  lastName: string;
  middleName: string;
  practiceId: number;
  emailAddress: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  zipCode: number;
  state: string;
  providerAffiliateId: string;
  type: string;
  text: string;
  value: string;
  affiliateDetails: AffilateDetails
}

export interface ResponseItem {
  practice: Practice;
  provider: Provider;
}

export class PatientSearchParams {
  constructor(
    public searchFor: string = '',
    public skip: number = 0,
    public take: number = 45,
    public sortBy: string = 'LastName',
    public includeInactive: boolean = false
  ) { }
}

export interface AffilateDetails{
    phone: string;
    email: string;
    practiceName: string;
    address1: string;
    address2: string;
}

