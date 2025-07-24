import { RxPatient } from 'src/patient/patient-chart/patient-rx/models/patient-rx.model';

export class RxEnterpriseResponse {
    enterpriseID: number;
    vendorEnterpriseID: string;
}

export class RxEnterpriseRequest {
    name: string;
    fullName: string;
    address: RxAddress;
    phoneNumbers: RxPhoneNumber[];

    constructor(rxLocation: LegacyRxLocation) {
        this.name = rxLocation.Name,
        this.address = {
            street1: rxLocation.Address1,
            street2: rxLocation.Address2,
            city: rxLocation.City,
            state: rxLocation.State,
            postalCode: rxLocation.PostalCode
        },
        this.phoneNumbers = [];

        if (rxLocation.Phone) {
            this.phoneNumbers.push({
                isPrimary: true,
                isPrimaryForType: true,
                type: RxPhoneNumberType.Home,
                number: parseInt(rxLocation.Phone)
            });
        }

        if (rxLocation.Fax) {
            this.phoneNumbers.push({
                isPrimary: false,
                isPrimaryForType: true,
                type: RxPhoneNumberType.Fax,
                number: parseInt(rxLocation.Fax)
            });
        }
    }
}

export class LegacyRxLocation {
    Address1: string;
    Address2: string;
    City: string;
    Fax: string;
    Name: string;
    Phone: string;
    PostalCode: string;
    State: string;
}

export class RxAddress {
    street1: string;
    street2: string;
    city: string;
    state: string;
    postalCode: string;
}

export class RxPhoneNumber {
    number: number;
    type: number;
    isPrimary: boolean;
    isPrimaryForType: boolean;
}

export enum RxPhoneNumberType {
    Unknown = 0,
    Beeper = 1,
    Cell = 2,
    Fax = 3,
    Home = 4,
    Work = 5,
    Night = 6
}

export class RxUserRequest {
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    dateOfBirth: Date;
    emailAddress: string;
    address: RxAddress;
    deaNumbers: string[];
    npiNumber: string;
    phoneNumbers: RxPhoneNumber[];
    clinicianRoleTypes: number[];
    isEPCSRequested: boolean;

    constructor(rxUser: LegacyRxUser, rxSettings: RxSettings) {
        this.firstName = rxUser.FirstName;
        this.middleName = rxUser.MiddleName;
        this.lastName = rxUser.LastName;
        this.suffix = rxUser.Suffix;
        this.dateOfBirth = rxUser.DateOfBirth;
        this.emailAddress = rxUser.Email;

        this.address = {
            street1: rxUser.Address1,
            street2: rxUser.Address2,
            city: rxUser.City,
            state: rxUser.State,
            postalCode: rxUser.PostalCode
        };

        this.deaNumbers = rxUser.DEANumber ? [rxUser.DEANumber] : [];
        this.npiNumber = rxUser.NPINumber;

        this.phoneNumbers = [];
        if (rxUser.Phone) {
            this.phoneNumbers.push({
                isPrimary: true,
                isPrimaryForType: true,
                type: RxPhoneNumberType.Home,
                number: parseInt(rxUser.Phone)
            });
        }
        if (rxUser.Fax) {
            this.phoneNumbers.push({
                isPrimary: false,
                isPrimaryForType: true,
                type: RxPhoneNumberType.Fax,
                number: parseInt(rxUser.Fax)
            });
        }

        this.clinicianRoleTypes = rxSettings.roles.map(r => r.value);
        this.isEPCSRequested = rxSettings.isEPCSRequested;
    }
}

export class LegacyRxUser {
    UserId: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Suffix: string;
    Gender: string;
    Address1: string;
    Address2: string;
    City: string;
    State: string;
    PostalCode: string;
    ApplicationId: number;
    DEANumber: string;
    DateOfBirth: Date;
    Email: string;
    Fax: string;
    NPINumber: string;
    Phone: string;
    LocationIds: number[];
}

export class RxSettings {
    roles: { text: string, value: number }[];
    locations: { text: string, value: { legacyId: number, enterpriseId: number } }[];
    isEPCSRequested: boolean;
}

export class RxPatientRequest {
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    dateOfBirth: Date;
    sex: number;
    emailAddress: string;
    address: RxAddress;
    phoneNumbers: RxPhoneNumber[];
    weightDecimal: number;
    weightMetric: number;

    constructor(rxPatient: RxPatient) {
        this.firstName = rxPatient.FirstName;
        this.middleName = rxPatient.MiddleName;
        this.lastName = rxPatient.LastName;
        this.suffix = rxPatient.Suffix;
        this.dateOfBirth = rxPatient.DateOfBirth;
        switch (rxPatient.Gender) {
            case 'Male':
                this.sex = 1;
                break;
            case 'Female':
                this.sex = 2;
                break;
            default:
                this.sex = 0;
                break;
        }
        this.emailAddress = rxPatient.Email;

        this.address = {
            street1: rxPatient.Address1,
            street2: rxPatient.Address2,
            city: rxPatient.City,
            state: rxPatient.State,
            postalCode: rxPatient.PostalCode
        };

        this.phoneNumbers = [];
        if (rxPatient.Phone) {
            const phone: RxPhoneNumber = {
                isPrimary: true,
                isPrimaryForType: true,
                type: RxPhoneNumberType.Unknown,
                number: parseInt(rxPatient.Phone)
            };
            switch (rxPatient.PhoneType) {
                case 'Work':
                    phone.type = RxPhoneNumberType.Work;
                    break;
                case 'Cell':
                    phone.type = RxPhoneNumberType.Cell;
                    break;
                case 'Home':
                    phone.type = RxPhoneNumberType.Home;
                    break;
            }
            this.phoneNumbers.push(phone);
        }

        this.weightDecimal = rxPatient.Weight;
        this.weightMetric = 1; // necessary for now since we don't track weight
    }
}

    // JSON FORMAT EXPTECTED
    // {
    //   "firstName": "string",
    //   "middleName": "string",
    //   "lastName": "string",
    //   "suffix": "string",
    //   "dateOfBirth": "2021-08-03T14:46:17.616Z",
    //   "sex": 0,
    //   "emailAddress": "user@example.com",
    //   "address": {
    //     "street1": "string",
    //     "street2": "string",
    //     "city": "string",
    //     "state": "string",
    //     "postalCode": "string"
    //   },
    //   "phoneNumbers": [
    //     {
    //       "number": 0,
    //       "type": 0,
    //       "isPrimary": true,
    //       "isPrimaryForType": true
    //     }
    //   ],
    //   "weightDecimal": 0,
    //   "weightMetric": 0,
    //   "heightDecimal": 0,
    //   "heightMetric": 0
    // }

export class Rx2PatientRequest {
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    dateOfBirth: Date;
    sex: number;
    emailAddress: string;
    address: RxAddress;
    phoneNumbers: RxPhoneNumber[];
    weightDecimal: number;
    weightMetric: number;
    heightDecimal: number;
    heightMetric: number

    constructor(rxPatient: RxPatient) {
        this.firstName = rxPatient.FirstName;
        this.middleName = rxPatient.MiddleName;
        this.lastName = rxPatient.LastName;
        this.suffix = rxPatient.Suffix;
        this.dateOfBirth = rxPatient.DateOfBirth;
        switch (rxPatient.Gender) {
            case 'Male':
                this.sex = 1;
                break;
            case 'Female':
                this.sex = 2;
                break;
            default:
                this.sex = 0;
                break;
        }
        this.emailAddress = rxPatient.Email;

        this.address = {
            street1: rxPatient.Address1,
            street2: rxPatient.Address2,
            city: rxPatient.City,
            state: rxPatient.State,
            postalCode: rxPatient.PostalCode
        };

        this.phoneNumbers = [];
        if (rxPatient.Phone) {
            const phone: RxPhoneNumber = {
                isPrimary: true,
                isPrimaryForType: true,
                type: RxPhoneNumberType.Unknown,
                number: parseInt(rxPatient.Phone)
            };
            switch (rxPatient.PhoneType) {
                case 'Work':
                    phone.type = RxPhoneNumberType.Work;
                    break;
                case 'Cell':
                    phone.type = RxPhoneNumberType.Cell;
                    break;
                case 'Home':
                    phone.type = RxPhoneNumberType.Home;
                    break;
            }
            this.phoneNumbers.push(phone);
        }

        this.weightDecimal = rxPatient.Weight;
        this.weightMetric = 1; // indicates weight in lbs.
        this.heightDecimal = rxPatient.Height;
        this.heightMetric = 1; // indicates height in inches.
    }
}


export class RxMedicationResponse {
    id?: string;
    legacyVendorPrescriptionId?: number;
    prescriptionId: number;
    prescriberUserID: string;
    writtenDate: string;
    displayName: string;
    noSubstitutions: boolean;
    strength: string;
    dispenseUnitDescription: string;
    quantity: string;
    comment: string;
    directions: string;
    refills: string;
    pharmacyNotes: string;
    status: string;
}

export class RxMedication {
    RxMapId?: string;
    ExternalMedicationId?: number;
    PrescriberUserId: string;
    DateWritten: string;
    DisplayName: string;
    NoSubstitution: boolean;
    Strength: string;
    DispenseUnits: string;
    Quantity: string;
    Notes: string;
    Refills: string;
    PharmacyNotes: string;
    PrescriptionStatus: string;

    constructor(response: RxMedicationResponse) {
        this.RxMapId = response.id;
        this.ExternalMedicationId = response.id ? response.legacyVendorPrescriptionId : response.prescriptionId;
        this.PrescriberUserId = response.prescriberUserID;
        this.DateWritten = response.writtenDate;
        this.DisplayName = response.displayName;
        this.NoSubstitution = response.noSubstitutions;
        if (response.strength != null && response.strength != undefined) {
            this.Strength = response.strength;
        }
        if (response.dispenseUnitDescription != null && response.dispenseUnitDescription != undefined) {
            this.DispenseUnits = response.dispenseUnitDescription;
        }
        this.Quantity = response.quantity;
        this.Notes = response.directions;
        this.Refills = response.refills;
        this.PharmacyNotes = response.pharmacyNotes;
        this.PrescriptionStatus = response.status;
    }
}

export class RxNotificationsResponse {
    refillRequestsTotalCount: number;
    transactionErrorsTotalCount: number;
    pendingPrescriptionsTotalCount: number;
    pendingRxChangeTotalCount: number;
    counts: {
        enterpriseID: number;
        notificationCountsUrl: string
    }[];
}

export class RxNotifications {
    RefillRequestsTotalCount: number;
    TransactionErrorsTotalCount: number;
    PendingPrescriptionsTotalCount: number;
    PendingRxChangeTotalCount: number;
    Counts: {
        EnterpriseId: number;
        NotificationCountsUrl: string
    }[];

    constructor(response: RxNotificationsResponse) {
        this.RefillRequestsTotalCount = response.refillRequestsTotalCount;
        this.TransactionErrorsTotalCount = response.transactionErrorsTotalCount;
        this.PendingPrescriptionsTotalCount = response.pendingPrescriptionsTotalCount;
        this.PendingRxChangeTotalCount = response.pendingRxChangeTotalCount;
        if (response.counts) {
            this.Counts = response.counts.map(n => ({ EnterpriseId: n.enterpriseID, NotificationCountsUrl: n.notificationCountsUrl }));
        }
    }
}
