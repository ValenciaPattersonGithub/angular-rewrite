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

export class Rx2PatientAddress {
    Street1: string;
    Street2: string;
    City: string;
    State: string;
    PostalCode: string;
}

export class Rx2PatientPhoneNumber {
    Number: number;
    Type:  string;
    IsPrimary: boolean;
    isPrimaryForType: boolean;
}

export class Rx2Patient {
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Suffix: string;
    DateOfBirth: Date;
    Sex: string;
    EmailAddress: string;
    Address: Rx2PatientAddress;
    PhoneNumbers: Rx2PatientPhoneNumber[];
    WeightDecimal: number;
    WeightMetric: number;
    HeightDecimal: number;
    HeightMetric: number;
}
