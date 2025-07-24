import { of } from "rxjs";

export const MockRepository = () => ({
    mockService: {
        getPatientAdditionalIdentifiers: (a: any) => of({}),
        get: (a: any) => { },
        entityNames: {
            users: [{ UserId: '12', FirstName: 'FN', LastName: 'LN' }],
            locations: [{ LocationId: 1, NameLine1: 'Location 1' }, { LocationId: 2, NameLine2: 'Location 2' }]
        },
        patientId: '4321',
        accountId: '1234',
        getPatientDiscountByPatientId: (a: any) => of({}),
        getPatientInfoByPatientId: (a: any) => of({}),
        getAdditionalInfoByPatientId: (a: any) => of({}),
        getPatientFlagsAndAlertsByPatientId: (a: any) => of({}),
        getPatientDashboardOverviewByPatientId: (a: any) => new Promise((resolve, reject) => { }),
        setPatientPreferredDentist: (a: any) => of({}),
        setPatientPreferredHygienist: (a: any) => of({}),
        getNextAppointmentStartTimeLocalized: (a: any) => { },
        patientDetail: of({}),
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message'),
        AlertIcons: () => { },
        getAllAccountMembersByAccountId: (a: any) => { },
        getRegistrationEvent: (a: any) => of({}),
        setRegistrationEvent: (a: any) => of({}),
        getPatientDentalRecord: (a: any) => of({}),
        getPatientReferrals: (a: any) => of({}),
        ConvertAppointmentDatesTZ: (a: any, b: any) => { },
        getCommunicationEvent: (a: any) => of({}),
        setCommunicationEvent: (a: any) => of({}),
        getAppointmentsByPatientId: (a: any, b: any) => of({}),
        getPatientBenefitPlans: (a: any) => of({}),
        show: (a: any) => { },
        close: () => { }
    },
    mockPatientAdditionalIdentifiersList: [{
        DataTag: null,
        DateModified: '0001-01-01T00:00:00',
        Description: 'Identifier 1',
        IsSpecifiedList: false,
        MasterPatientIdentifierId: 'd513efc6-90f5-4c54-8f4a-20bd73167be9',
        PatientId: '1234',
        PatientIdentifierId: '00000000-0000-0000-0000-000000000000',
        SpecifiedListValues: [],
        UserModified: '00000000-0000-0000-0000-000000000000'
    },
    {
        DataTag: null,
        DateModified: '0001-01-01T00:00:00',
        Description: 'Identifier 2',
        IsSpecifiedList: false,
        MasterPatientIdentifierId: '9bee7fad-820d-49d3-9b49-52f8e17e0bb1',
        PatientId: '1234',
        PatientIdentifierId: '00000000-0000-0000-0000-000000000000',
        SpecifiedListValues: [],
        UserModified: '00000000-0000-0000-0000-000000000000'

    }],
    mockPatientInfo: {
        AddressLine1: 'Address 1',
        AddressLine2: 'Address 2',
        City: 'Newyork',
        DateOfBirth: '1983-05-17T23:59:00',
        DisplayStatementAccountId: '1-41863',
        EmailAddress: '',
        Emails: [{ Email: 'test@gmail.com', IsPrimary: true, ReminderOK: true }],
        FirstName: 'Patient FN',
        IsActive: true,
        IsPatient: true,
        LastName: 'Patient LN',
        Locations: [],
        MiddleName: 'Patient MN',
        PatientCode: 'CODE',
        PersonAccountId: '91630d5f-4cf7-4baf-a96b-da71087fba07',
        PhoneNumber: null,
        PhoneNumbers: [{ PhoneNumber: '3344556677', IsPrimary: true, ReminderOK: true, Type: 'M' }],
        PhoneType: null,
        PreferredDentist: 'Dentist',
        PreferredHygienist: 'Hygienist',
        PreferredLocation: 1,
        PreferredName: '',
        PrefixName: '',
        ReceivesFinanceCharges: true,
        ReceivesStatements: true,
        ResponsibleFirstName: null,
        ResponsibleLastName: null,
        ResponsibleMiddleName: null,
        ResponsiblePersonId: 'fd1fec8a-d596-4a27-b0f0-31698fa86ce2',
        ResponsiblePersonName: 'Self',
        ResponsiblePreferredName: null,
        ResponsiblePrefixName: null,
        ResponsibleSuffix: null,
        Sex: 'M',
        SignatureOnFile: false,
        State: 'Test',
        Suffix: 'T',
        ZipCode: 'zipCode'
    },
    mockDentalOfficeRecord: {
        Address: {
            AddressLine1: 'Address 1',
            AddressLine2: 'Address 2',
            City: 'Newyork',
            ZipCode: 'zipCode',
            State: 'state'
        }
    },
    mockPatientReferrals: [
        {
            ReferralType: 1,
            SourceDescription1: 'Description 1',
            SourceDescription2: 'Description 2'
        },
        {
            ReferralType: 2,
            SourceDescription1: 'Description 1',
            SourceDescription2: 'Description 2'
        },
        {
            ReferralType: 0,
            SourceDescription1: 'Description 1',
            SourceDescription2: 'Description 2'
        }
    ],
    mockAdditionalInfo: {
        GroupDescription: [
            'Peaky Blinders Group',
            'Shelby Group'
        ]
    },
    mockDiscount: {
        DiscountName: 'Discount'
    },
    mockBenefitPlans: [
        {
            BenefitPlanId: 1234,

        }
    ]
});
