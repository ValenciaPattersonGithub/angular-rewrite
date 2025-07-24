describe('ProviderHoursController tests ->', function () {
  var ctrl, scope;
  var locationService,
    locations,
    rooms,
    practiceSettings,
    listHelper,
    timeout,
    scheduleServices;
  var providers, providerRoomOccurences, timeZoneFactory;
  var providerTypes, idealDayTemplatesFactory, toastrFactory, modalFactory;
  var providerShowOnScheduleFactory, referenceDataService, practicesApiService;

  locations = [
    {
      LocationId: 4,
      NameLine1: 'Alaska',
      NameLine2: null,
      NameAbbreviation: 'Alaska',
      ImageFile: null,
      LogoFile: null,
      Website: null,
      Timezone: 'Alaskan Standard Time',
      DeactivationTimeUtc: null,
      AddressLine1: '44 Red Rover Ln.',
      AddressLine2: null,
      City: 'Anchorage',
      State: 'AK',
      ZipCode: '56121',
      Email: 'alaska@gmail.com',
      PrimaryPhone: null,
      SecondaryPhone: null,
      Fax: null,
      TaxId: null,
      TypeTwoNpi: null,
      TaxonomyId: null,
      LicenseNumber: null,
      ProviderTaxRate: null,
      SalesAndUseTaxRate: null,
      DefaultFinanceCharge: null,
      AccountsOverDue: null,
      MinimumFinanceCharge: null,
      Rooms: [],
      AdditionalIdentifiers: [],
      MasterLocationAdditionalIdentifiers: [],
      MerchantId: '',
      IsPaymentGatewayEnabled: false,
      DisplayCardsOnEstatement: false,
      AcceptMasterCardOnEstatement: false,
      AcceptDiscoverOnEstatement: false,
      AcceptVisaOnEstatement: false,
      AcceptAmericanExpressOnEstatement: false,
      IncludeCvvCodeOnEstatement: false,
      RemitAddressSource: 0,
      RemitOtherLocationId: null,
      RemitToNameLine1: null,
      RemitToNameLine2: null,
      RemitToAddressLine1: null,
      RemitToAddressLine2: null,
      RemitToCity: null,
      RemitToState: null,
      RemitToZipCode: null,
      RemitToPrimaryPhone: null,
      InsuranceRemittanceAddressSource: 0,
      InsuranceRemittanceOtherLocationId: null,
      InsuranceRemittanceNameLine1: null,
      InsuranceRemittanceNameLine2: null,
      InsuranceRemittanceAddressLine1: null,
      InsuranceRemittanceAddressLine2: null,
      InsuranceRemittanceCity: null,
      InsuranceRemittanceState: null,
      InsuranceRemittanceZipCode: null,
      InsuranceRemittancePrimaryPhone: null,
      InsuranceRemittanceTaxId: null,
      InsuranceRemittanceTypeTwoNpi: null,
      InsuranceRemittanceLicenseNumber: null,
      FeeListId: null,
      DataTag: 'AAAAAAAGYyo=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-12-08T14:43:13.2736154',
    },
    {
      LocationId: 2,
      NameLine1: "Bailey's Harbor",
      NameLine2: null,
      NameAbbreviation: "Bailey's Harbor",
      ImageFile: null,
      LogoFile: null,
      Website: null,
      Timezone: 'Central Standard Time',
      DeactivationTimeUtc: null,
      AddressLine1: '653 Main Street',
      AddressLine2: null,
      City: "Bailey's Harbor",
      State: 'WI',
      ZipCode: '25212',
      Email: 'bhd@gmail.com',
      PrimaryPhone: '3147178369',
      SecondaryPhone: null,
      Fax: '3147179369',
      TaxId: '555555555',
      TypeTwoNpi: '2522252222',
      TaxonomyId: 2,
      LicenseNumber: '252222552',
      ProviderTaxRate: null,
      SalesAndUseTaxRate: null,
      DefaultFinanceCharge: null,
      AccountsOverDue: null,
      MinimumFinanceCharge: null,
      Rooms: [],
      AdditionalIdentifiers: [],
      MasterLocationAdditionalIdentifiers: [],
      MerchantId: '',
      IsPaymentGatewayEnabled: false,
      DisplayCardsOnEstatement: false,
      AcceptMasterCardOnEstatement: false,
      AcceptDiscoverOnEstatement: false,
      AcceptVisaOnEstatement: false,
      AcceptAmericanExpressOnEstatement: false,
      IncludeCvvCodeOnEstatement: false,
      RemitAddressSource: 0,
      RemitOtherLocationId: null,
      RemitToNameLine1: null,
      RemitToNameLine2: null,
      RemitToAddressLine1: null,
      RemitToAddressLine2: null,
      RemitToCity: null,
      RemitToState: null,
      RemitToZipCode: null,
      RemitToPrimaryPhone: null,
      InsuranceRemittanceAddressSource: 0,
      InsuranceRemittanceOtherLocationId: null,
      InsuranceRemittanceNameLine1: null,
      InsuranceRemittanceNameLine2: null,
      InsuranceRemittanceAddressLine1: null,
      InsuranceRemittanceAddressLine2: null,
      InsuranceRemittanceCity: null,
      InsuranceRemittanceState: null,
      InsuranceRemittanceZipCode: null,
      InsuranceRemittancePrimaryPhone: null,
      InsuranceRemittanceTaxId: null,
      InsuranceRemittanceTypeTwoNpi: null,
      InsuranceRemittanceLicenseNumber: null,
      FeeListId: 5,
      DataTag: 'AAAAAAAGYg4=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-12-07T16:56:28.8704788',
    },
    {
      LocationId: 3,
      NameLine1: 'Fish Creek',
      NameLine2: null,
      NameAbbreviation: 'Fish Creek',
      ImageFile: null,
      LogoFile: null,
      Website: null,
      Timezone: 'Eastern Standard Time',
      DeactivationTimeUtc: null,
      AddressLine1: '5 Elm',
      AddressLine2: null,
      City: 'Fish Creak',
      State: 'WI',
      ZipCode: '63123',
      Email: 'fish@creek.com',
      PrimaryPhone: null,
      SecondaryPhone: null,
      Fax: null,
      TaxId: null,
      TypeTwoNpi: null,
      TaxonomyId: null,
      LicenseNumber: null,
      ProviderTaxRate: null,
      SalesAndUseTaxRate: null,
      DefaultFinanceCharge: null,
      AccountsOverDue: null,
      MinimumFinanceCharge: null,
      Rooms: [],
      AdditionalIdentifiers: [],
      MasterLocationAdditionalIdentifiers: [],
      MerchantId: '',
      IsPaymentGatewayEnabled: false,
      DisplayCardsOnEstatement: false,
      AcceptMasterCardOnEstatement: false,
      AcceptDiscoverOnEstatement: false,
      AcceptVisaOnEstatement: false,
      AcceptAmericanExpressOnEstatement: false,
      IncludeCvvCodeOnEstatement: false,
      RemitAddressSource: 0,
      RemitOtherLocationId: null,
      RemitToNameLine1: null,
      RemitToNameLine2: null,
      RemitToAddressLine1: null,
      RemitToAddressLine2: null,
      RemitToCity: null,
      RemitToState: null,
      RemitToZipCode: null,
      RemitToPrimaryPhone: null,
      InsuranceRemittanceAddressSource: 0,
      InsuranceRemittanceOtherLocationId: null,
      InsuranceRemittanceNameLine1: null,
      InsuranceRemittanceNameLine2: null,
      InsuranceRemittanceAddressLine1: null,
      InsuranceRemittanceAddressLine2: null,
      InsuranceRemittanceCity: null,
      InsuranceRemittanceState: null,
      InsuranceRemittanceZipCode: null,
      InsuranceRemittancePrimaryPhone: null,
      InsuranceRemittanceTaxId: null,
      InsuranceRemittanceTypeTwoNpi: null,
      InsuranceRemittanceLicenseNumber: null,
      FeeListId: 10006,
      DataTag: 'AAAAAAAGYg8=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-12-07T16:56:49.8060525',
    },
    {
      LocationId: 1,
      NameLine1: 'Default Practice - MB',
      NameLine2: null,
      NameAbbreviation: 'Practice',
      ImageFile: null,
      LogoFile: null,
      Website: null,
      Timezone: 'Central Standard Time',
      DeactivationTimeUtc: null,
      AddressLine1: 'Address Line 1',
      AddressLine2: null,
      City: 'City',
      State: 'MN',
      ZipCode: '55000',
      Email: 'email@fusepatterson.com',
      PrimaryPhone: null,
      SecondaryPhone: null,
      Fax: null,
      TaxId: null,
      TypeTwoNpi: null,
      TaxonomyId: null,
      LicenseNumber: null,
      ProviderTaxRate: null,
      SalesAndUseTaxRate: null,
      DefaultFinanceCharge: null,
      AccountsOverDue: null,
      MinimumFinanceCharge: null,
      Rooms: [],
      AdditionalIdentifiers: [],
      MasterLocationAdditionalIdentifiers: [],
      MerchantId: null,
      IsPaymentGatewayEnabled: false,
      DisplayCardsOnEstatement: false,
      AcceptMasterCardOnEstatement: false,
      AcceptDiscoverOnEstatement: false,
      AcceptVisaOnEstatement: false,
      AcceptAmericanExpressOnEstatement: false,
      IncludeCvvCodeOnEstatement: false,
      RemitAddressSource: 0,
      RemitOtherLocationId: null,
      RemitToNameLine1: null,
      RemitToNameLine2: null,
      RemitToAddressLine1: null,
      RemitToAddressLine2: null,
      RemitToCity: null,
      RemitToState: null,
      RemitToZipCode: null,
      RemitToPrimaryPhone: null,
      InsuranceRemittanceAddressSource: 0,
      InsuranceRemittanceOtherLocationId: null,
      InsuranceRemittanceNameLine1: null,
      InsuranceRemittanceNameLine2: null,
      InsuranceRemittanceAddressLine1: null,
      InsuranceRemittanceAddressLine2: null,
      InsuranceRemittanceCity: null,
      InsuranceRemittanceState: null,
      InsuranceRemittanceZipCode: null,
      InsuranceRemittancePrimaryPhone: null,
      InsuranceRemittanceTaxId: null,
      InsuranceRemittanceTypeTwoNpi: null,
      InsuranceRemittanceLicenseNumber: null,
      FeeListId: 2,
      DataTag: 'AAAAAAAAxdc=',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2017-05-12T17:26:51.7315075',
    },
  ];
  rooms = {
    ExtendedStatusCode: null,
    data: [
      {
        RoomId: 'efb0677d-d05d-435c-a96d-1483268e0210',
        LocationId: 2,
        Name: "Room 2 - Bailey's Harbor",
        ObjectState: null,
        FailedMessage: null,
        DataTag: 'AAAAAAAGYfk=',
        UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
        DateModified: '2017-12-07T16:53:56.920284',
      },
      {
        RoomId: '1f82bed5-477a-4193-b024-9007ecfcd4b2',
        LocationId: 2,
        Name: "Room 4 - Bailey's Harbor",
        ObjectState: null,
        FailedMessage: null,
        DataTag: 'AAAAAAAGYfs=',
        UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
        DateModified: '2017-12-07T16:54:10.903833',
      },
      {
        RoomId: '53bc3b52-d959-4b57-8c5e-dbd19797889f',
        LocationId: 2,
        Name: "Room 1 - Bailey's Harbor",
        ObjectState: null,
        FailedMessage: null,
        DataTag: 'AAAAAAAGYfg=',
        UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
        DateModified: '2017-12-07T16:53:42.8950305',
      },
      {
        RoomId: 'd46bcc5b-5135-42c3-8581-f7a25a28c942',
        LocationId: 2,
        Name: "Room 3 - Bailey's Harbor",
        ObjectState: null,
        FailedMessage: null,
        DataTag: 'AAAAAAAGYfo=',
        UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
        DateModified: '2017-12-07T16:54:04.2558815',
      },
    ],
    Count: null,
    InvalidProperties: null,
  };
  practiceSettings = {
    SettingsName: 'SOAR',
    DefaultTimeIncrement: 15,
    IsProvisioned: true,
    IsEStatementEnabled: false,
    DataTag: 'AAAAAAAAD1g=',
    UserModified: '00000000-0000-0000-0000-000000000000',
    DateModified: '2017-05-12T17:27:22.7502714',
  };

  var mockIdealDayTemplates = [];
  for (var i = 0; i < 5; i++) {
    var idealDayTemplateDto = {
      IdealDayTemplateId: i.toString(),
      Name: 'TemplateName' + i,
      Details: [],
    };
    mockIdealDayTemplates.push(idealDayTemplateDto);
  }

  providers = [
    {
      UserId: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      ShowOnSchedule: false,
      FirstName: 'Practice',
      MiddleName: null,
      LastName: 'Admin',
      PreferredName: null,
      SuffixName: null,
      DateOfBirth: null,
      UserName: 'marybeth.swift@pattcom.onmicrosoft.com',
      UserCode: 'ADMPR1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'marybeth.swift@pattcom.onmicrosoft.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      LocationId: 1,
      ProviderTypeId: 1,
      ProviderOnClaimsRelationship: 1,
      ProviderOnClaimsId: null,
      RxUserType: 0,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: null,
      Roles: null,
      DataTag: 'AAAAAAADW9o=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-09-14T20:50:25.7365156',
    },
    {
      UserId: 'ce8e99b8-874f-e711-baa0-8086f2269c78',
      FirstName: 'Martin',
      MiddleName: 'V',
      LastName: 'Nostrand',
      PreferredName: null,
      SuffixName: null,
      DateOfBirth: null,
      UserName: 'nos@fuse.com',
      UserCode: 'NOSMA1',
      Color: '#a349a4',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'nos@gmail.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: 1,
      JobTitle: null,
      LocationId: 4,
      ProviderTypeId: 1,
      ProviderOnClaimsRelationship: 1,
      ProviderOnClaimsId: null,
      RxUserType: 0,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: 'DDS - Fish Creek',
      Roles: null,
      DataTag: 'AAAAAAAGYhA=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-12-07T16:57:56.259032',
    },
    {
      UserId: '8167d5d4-fb80-e711-bab2-8086f2269c78',
      FirstName: 'Glen',
      MiddleName: null,
      LastName: 'Engleman',
      PreferredName: 'G',
      SuffixName: null,
      DateOfBirth: null,
      UserName: 'glen@pattcom.onmicrosoft.com',
      UserCode: 'ENGGL1',
      Color: '#ff7f27',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'glen@gmail.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      LocationId: 4,
      ProviderTypeId: 1,
      ProviderOnClaimsRelationship: 1,
      ProviderOnClaimsId: null,
      RxUserType: 0,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: "DDS - Baliey's Harbo",
      Roles: null,
      DataTag: 'AAAAAAAGYe8=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-12-07T16:44:57.2482359',
    },
    {
      UserId: '028f7d87-428f-e711-bab8-8086f2269c78',
      FirstName: 'Assoc',
      MiddleName: null,
      LastName: 'Dentist',
      PreferredName: null,
      SuffixName: null,
      DateOfBirth: null,
      UserName: 'dsvdsv@sdadds.net',
      UserCode: 'DENAS1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'fff@gffg.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      LocationId: 4,
      ProviderTypeId: 1,
      ProviderOnClaimsRelationship: 1,
      ProviderOnClaimsId: null,
      RxUserType: 0,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: null,
      Roles: null,
      DataTag: 'AAAAAAAD0UM=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-09-21T15:14:51.8417336',
    },
    {
      UserId: 'b2bbd90d-498f-e711-bab8-8086f2269c78',
      FirstName: 'Fred',
      MiddleName: null,
      LastName: 'Flintstone',
      PreferredName: null,
      SuffixName: null,
      DateOfBirth: null,
      UserName: 'dcs@kjnji.com',
      UserCode: 'FLIFR1',
      Color: '#b5e61d',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'eds@ygv.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      LocationId: 1,
      ProviderTypeId: 1,
      ProviderOnClaimsRelationship: 1,
      ProviderOnClaimsId: null,
      RxUserType: 0,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: 'DDS - Default Practi',
      Roles: null,
      DataTag: 'AAAAAAAGYhs=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-12-07T17:04:32.9819288',
    },
    {
      UserId: '4354e264-498f-e711-bab8-8086f2269c78',
      FirstName: 'Barry',
      MiddleName: null,
      LastName: 'Manilow',
      PreferredName: null,
      SuffixName: null,
      DateOfBirth: null,
      UserName: '32@gvv.com',
      UserCode: 'MANBA1',
      Color: '#880015',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'hvdgv@cfjin.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      LocationId: 1,
      ProviderTypeId: 1,
      ProviderOnClaimsRelationship: 1,
      ProviderOnClaimsId: null,
      RxUserType: 0,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: "DDS - Bailey's Harbo",
      Roles: null,
      DataTag: 'AAAAAAAGYho=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-12-07T17:03:11.3646274',
    },
    {
      UserId: '0315fa2f-1fad-e711-bac8-8086f2269c78',
      FirstName: 'Henry',
      MiddleName: null,
      LastName: 'Franklinschmook',
      PreferredName: null,
      SuffixName: null,
      DateOfBirth: '1967-10-06T05:00:00',
      UserName: 'h@f.com',
      UserCode: 'FRAHE1',
      Color: '#b97a57',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'f@h.com',
      Address: {
        AddressLine1: '8 Roosevelt Dr.',
        AddressLine2: null,
        City: 'Sunset Hills',
        State: 'MO',
        ZipCode: '63127',
      },
      DepartmentId: null,
      JobTitle: null,
      LocationId: 1,
      ProviderTypeId: 1,
      ProviderOnClaimsRelationship: 1,
      ProviderOnClaimsId: null,
      RxUserType: 0,
      TaxId: null,
      FederalLicense: null,
      DeaNumber: null,
      NpiTypeOne: null,
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: null,
      AnesthesiaId: null,
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: 'DDS - Fish Creek',
      Roles: null,
      DataTag: 'AAAAAAAGYhg=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-12-07T17:02:09.9435485',
    },
  ];
  providerRoomOccurences = {
    ExtendedStatusCode: null,
    Value: [
      {
        ProviderRoomOccurrenceId: 10049,
        UserId: 'ce8e99b8-874f-e711-baa0-8086f2269c78',
        LocationId: 2,
        RoomId: '53bc3b52-d959-4b57-8c5e-dbd19797889f',
        StartTime: '2017-12-13T14:00:00',
        EndTime: '2017-12-13T23:00:00',
        ProviderRoomSetupId: 10049,
        LunchStartTime: '2017-12-13T17:00:00',
        LunchEndTime: '2017-12-13T18:00:00',
        DataTag: 'AAAAAAAGgqE=',
        UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
        DateModified: '2017-12-13T14:14:11.5672462',
        IdealDayTemplateId: null,
      },
      {
        ProviderRoomOccurrenceId: 10050,
        UserId: '8167d5d4-fb80-e711-bab2-8086f2269c78',
        LocationId: 2,
        RoomId: 'efb0677d-d05d-435c-a96d-1483268e0210',
        StartTime: '2017-12-13T14:00:00',
        EndTime: '2017-12-13T23:00:00',
        ProviderRoomSetupId: null,
        LunchStartTime: null,
        LunchEndTime: null,
        DataTag: 'AAAAAAAGgqM=',
        UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
        DateModified: '2017-12-13T14:15:02.20945',
        IdealDayTemplateId: '2',
      },
    ],
    Count: null,
    InvalidProperties: null,
  };
  providerTypes = {
    ExtendedStatusCode: null,
    Value: [
      { Id: 1, Name: 'Dentist', Order: 2 },
      { Id: 2, Name: 'Hygienist', Order: 3 },
      { Id: 3, Name: 'Assistant', Order: 4 },
      { Id: 4, Name: 'Not a Provider', Order: 1 },
      { Id: 5, Name: 'Other', Order: 5 },
    ],
    Count: null,
    InvalidProperties: null,
  };

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      scheduleServices = {
        Dtos: {
          TreatmentRooms: {
            get: jasmine.createSpy().and.returnValue(rooms),
          },
        },
        ProviderRoomOccurrences: {
          delete: jasmine.createSpy().and.returnValue([]),
          get: jasmine.createSpy().and.returnValue([]),
          update: jasmine.createSpy().and.returnValue([]),
        },
        ProviderRoomSetup: {
          delete: jasmine.createSpy().and.returnValue([]),
          get: jasmine.createSpy().and.returnValue([]),
          save: jasmine.createSpy().and.returnValue([]),
          update: jasmine.createSpy().and.returnValue([]),
        },
      };
      $provide.value('ScheduleServices', scheduleServices);

      locationService = {
        getCurrentLocation: jasmine
          .createSpy()
          .and.returnValue({
            timezone: 'Eastern Standard Time',
            name: '6 Lemp',
            id: 4,
          }),
      };
      $provide.value('locationService', locationService);

      providerShowOnScheduleFactory = {
        access: jasmine.createSpy().and.returnValue({
          Edit: true,
          Create: true,
        }),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        providerShowOnScheduleExceptionDto: jasmine
          .createSpy()
          .and.returnValue({}),
      };
      $provide.value(
        'ProviderShowOnScheduleFactory',
        providerShowOnScheduleFactory
      );

      idealDayTemplatesFactory = {
        access: jasmine.createSpy().and.returnValue({
          View: true,
          Create: true,
        }),
        PracticeSettings: jasmine.createSpy().and.returnValue(practiceSettings),
        get: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(mockIdealDayTemplates),
        }),
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(mockIdealDayTemplates[0]),
        }),
        observeTemplates: jasmine.createSpy().and.returnValue({}),
        IdealDayTemplateDto: jasmine
          .createSpy()
          .and.returnValue({ Value: mockIdealDayTemplates }),
      };
      $provide.value('IdealDayTemplatesFactory', idealDayTemplatesFactory);

      referenceDataService = {
        get: jasmine.createSpy().and.returnValue({}),
        entityNames: {
          appointmentTypes: 'appointmentTypes',
          practiceSettings: 'practiceSettings',
          locations: 'locations',
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      timeZoneFactory = {
        ConvertDateTZ: jasmine
          .createSpy()
          .and.returnValue('converted_date_object'),
        GetTimeZoneAbbr: jasmine.createSpy().and.returnValue('AKST'),
      };
      $provide.value('TimeZoneFactory', timeZoneFactory);

      toastrFactory = {
        success: jasmine.createSpy(),
        error: jasmine.createSpy(),
      };
      $provide.value('toastrFactory', toastrFactory);

      modalFactory = {
        Modal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        ModalOnTop: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('ModalFactory', modalFactory);

      practicesApiService = {
        getRoomsByLocationId: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        getRoomsForLocation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PracticesApiService', practicesApiService);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    listHelper = $injector.get('ListHelper');
    timeout = $injector.get('$timeout');

    ctrl = $controller('ProviderHoursController', {
      $scope: scope,
      locations: locations,
      rooms: rooms,
      practiceSettings: practiceSettings,
      providers: providers,
      ListHelper: listHelper,
      PatSharedServices: {},
      providerRoomOccurences: providerRoomOccurences,
      providerTypes: providerTypes,
    });
    ctrl.$onInit();
  }));

  describe('$onInit function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setCurrentLocation');
      spyOn(ctrl, 'addPropertiesToRooms');
      spyOn(ctrl, 'createSchedulerOptions');
      spyOn(ctrl, 'scrollToStartTime');
      spyOn(ctrl, 'showNoRoomsMessage');
      spyOn(ctrl, 'updateTimezoneDisplay');
      spyOn(ctrl, 'prepProvidersList');
      spyOn(ctrl, 'setupOccurencesForSchedule');
      spyOn(ctrl, 'getIdealDayTemplates');
    });

    it('should call initial functions', function () {
      ctrl.$onInit();
      expect(ctrl.today).toEqual(moment().startOf('day'));
      expect(ctrl.locations).toBe(locations);
      expect(ctrl.setCurrentLocation).toHaveBeenCalled();
      expect(ctrl.rooms).toBe(rooms.data);
      expect(ctrl.addPropertiesToRooms).toHaveBeenCalled();
      expect(ctrl.minorTickCount).toBe(4);
      expect(ctrl.minMillDiffToAllowLunch).toBe(1800000);
      expect(ctrl.createSchedulerOptions).toHaveBeenCalled();
      expect(ctrl.scrollToStartTime).toHaveBeenCalled();
      expect(ctrl.showNoRoomsMessage).toHaveBeenCalled();
      expect(ctrl.updateTimezoneDisplay).toHaveBeenCalled();
      expect(scope.providers).toEqual([]);
      expect(ctrl.providerTypes).toEqual(providerTypes.Value);
      expect(ctrl.prepProvidersList).toHaveBeenCalled();
      expect(ctrl.providerRoomOccurences).toEqual(providerRoomOccurences.Value);
      expect(ctrl.setupOccurencesForSchedule).toHaveBeenCalled();
      expect(ctrl.getIdealDayTemplates).toHaveBeenCalled();
    });
  });

  describe('providerFilterString watch -> ', function () {
    it('should filter the providers list based on search criteria', function () {
      expect(scope.providers[0].FirstName).toBe('Assoc');
      expect(scope.providers[0].LastName).toBe('Dentist');
      expect(scope.providers[1].FirstName).toBe('Glen');
      expect(scope.providers[1].LastName).toBe('Engleman');
      expect(scope.providers[2].FirstName).toBe('Martin');
      expect(scope.providers[2].LastName).toBe('Nostrand');

      //
      scope.providerFilterString = '';
      scope.$apply();
      expect(scope.providers.length).toBe(3);
      //
      scope.providerFilterString = undefined;
      scope.$apply();
      expect(scope.providers.length).toBe(3);
      //
      scope.providerFilterString = 'ma';
      scope.$apply();
      expect(scope.providers.length).toBe(2);
      //
      scope.providerFilterString = 'x';
      scope.$apply();
      expect(scope.providers.length).toBe(0);
      //
      scope.providerFilterString = 'GL';
      scope.$apply();
      expect(scope.providers.length).toBe(1);
      //
      scope.providerFilterString = 'i';
      scope.$apply();
      expect(scope.providers.length).toBe(2);
    });
  });

  describe('setupOccurencesForSchedule function -> ', function () {
    beforeEach(function () {
      scope.scheduler = {
        setDataSource: jasmine.createSpy(),
        view: function () {
          return {
            content: {
              find: function () {
                return [];
              },
            },
          };
        },
      };
    });

    it('should set provider, color, and title on event object', function () {
      ctrl.setupOccurencesForSchedule();
      timeout.flush();
      expect(ctrl.providerRoomOccurences[0].$$Provider).toEqual(
        scope.providers[2]
      );
      expect(ctrl.providerRoomOccurences[1].$$Provider).toEqual(
        scope.providers[1]
      );
      expect(ctrl.providerRoomOccurences[0].color).toEqual('#a349a4');
      expect(ctrl.providerRoomOccurences[1].color).toEqual('#ff7f27');
      expect(ctrl.providerRoomOccurences[0].title).toEqual(
        'Martin Nostrand, DDS - Fish Creek'
      );
      expect(ctrl.providerRoomOccurences[1].title).toEqual(
        "Glen Engleman, DDS - Baliey's Harbo"
      );
    });

    it('should set start and end time', function () {
      ctrl.setupOccurencesForSchedule();
      timeout.flush();
      expect(ctrl.providerRoomOccurences[0].start).toEqual(
        'converted_date_object'
      );
      expect(ctrl.providerRoomOccurences[0].end).toEqual(
        'converted_date_object'
      );
    });

    it('should set lunch start and end time', function () {
      ctrl.setupOccurencesForSchedule();
      timeout.flush();
      expect(ctrl.providerRoomOccurences[0].lunchStart).toEqual(
        'converted_date_object'
      );
      expect(ctrl.providerRoomOccurences[0].lunchEnd).toEqual(
        'converted_date_object'
      );
    });

    it('should set IdealDayTemplateId on event object', function () {
      ctrl.setupOccurencesForSchedule();
      timeout.flush();
      expect(ctrl.providerRoomOccurences[0].IdealDayTemplateId).toEqual(null);
      expect(ctrl.providerRoomOccurences[1].IdealDayTemplateId).toEqual('2');
    });

    it('should set recurrenceRule on event object based on truthiness of ProviderRoomSetupId', function () {
      ctrl.setupOccurencesForSchedule();
      timeout.flush();
      expect(ctrl.providerRoomOccurences[0].recurrenceRule).toEqual('_');
      expect(ctrl.providerRoomOccurences[1].recurrenceRule).toEqual(null);
    });

    it('should call scheduler.setDataSource', function () {
      ctrl.setupOccurencesForSchedule();
      timeout.flush();
      expect(scope.scheduler.setDataSource).toHaveBeenCalled();
    });
  });

  describe('prepProvidersList function -> ', function () {
    it('should only add providers to list if they are in either the location or practice role lists', function () {
      ctrl.prepProvidersList();
      expect(scope.providers.length).toBe(3);
    });
  });

  describe('addPropertiesToRooms function -> ', function () {
    beforeEach(function () {
      ctrl.rooms = rooms.data;
    });

    it('should set text and value properties for kendo', function () {
      ctrl.addPropertiesToRooms();
      expect(ctrl.rooms[0].text).toBe(ctrl.rooms[0].Name);
      expect(ctrl.rooms[0].value).toBe(ctrl.rooms[0].RoomId);
      expect(ctrl.rooms[1].text).toBe(ctrl.rooms[1].Name);
      expect(ctrl.rooms[1].value).toBe(ctrl.rooms[1].RoomId);
    });
  });

  describe('refreshRooms function -> ', function () {
    beforeEach(function () {
      scope.scheduler = {
        refresh: function () {},
        resources: [{ name: 'Rooms', dataSource: { data: function () {} } }],
        view: function () {},
      };
    });

    it('should call functions for refreshing rooms if Rooms resource is set', function () {
      spyOn(scope.scheduler, 'refresh');
      spyOn(scope.scheduler, 'view').and.returnValue({ name: 'day' });
      spyOn(ctrl, 'updateTimezoneDisplay');
      ctrl.refreshRooms();
      expect(scope.scheduler.refresh).toHaveBeenCalled();
      expect(scope.scheduler.view).toHaveBeenCalledWith('day');
      expect(ctrl.updateTimezoneDisplay).toHaveBeenCalled();
    });

    it('should not call functions for refreshing rooms if Rooms resource is undefined', function () {
      scope.scheduler.resources[0].name = 'googlimoogli';
      spyOn(scope.scheduler, 'refresh');
      spyOn(scope.scheduler, 'view').and.returnValue({ name: 'day' });
      spyOn(ctrl, 'updateTimezoneDisplay');
      ctrl.refreshRooms();
      expect(scope.scheduler.refresh).not.toHaveBeenCalled();
      expect(scope.scheduler.view).not.toHaveBeenCalledWith('day');
      expect(ctrl.updateTimezoneDisplay).not.toHaveBeenCalled();
    });
  });

  describe('updateTimezoneDisplay function -> ', function () {
    beforeEach(function () {
      var element = {
        data: jasmine.createSpy().and.returnValue({}),
      };
      spyOn(angular, 'element').and.returnValue(element);
      scope.scheduler = {
        setDataSource: function () {},
        view: function () {
          return {
            content: {
              find: function () {
                return [];
              },
            },
          };
        },
      };
    });

    it('should call angular.element', function () {
      ctrl.updateTimezoneDisplay();
      timeout.flush();
      expect(angular.element).toHaveBeenCalled();
    });
  });

  describe('showNoRoomsMessage function -> ', function () {
    beforeEach(function () {
      var element = {
        data: jasmine.createSpy().and.returnValue({}),
      };
      spyOn(angular, 'element').and.returnValue(element);
      scope.scheduler = {
        setDataSource: function () {},
        view: function () {
          return {
            content: {
              find: function () {
                return [];
              },
            },
          };
        },
      };
    });

    it('should call angular.element', function () {
      ctrl.showNoRoomsMessage();
      timeout.flush();
      expect(angular.element).toHaveBeenCalled();
    });
  });

  describe('getRoomsForLocation function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'addPropertiesToRooms');
      spyOn(ctrl, 'refreshRooms');
      spyOn(ctrl, 'showNoRoomsMessage');
    });

    //it('should call scheduleServices.Dtos.TreatmentRooms.get', function () {
    //    ctrl.getRoomsForLocation(ctrl.locations[1].LocationId);
    //    expect(scheduleServices.Dtos.TreatmentRooms.get).toHaveBeenCalled();
    //});

    it('should call functions and set rooms if response is valid', function () {
      scope.currentLocation.id = ctrl.locations[1].LocationId;
      ctrl.getRoomsForLocation().success({ data: [{ RoomId: '237' }] });
      expect(ctrl.rooms).toEqual([{ RoomId: '237' }]);
      expect(ctrl.addPropertiesToRooms).toHaveBeenCalled();
      expect(ctrl.refreshRooms).toHaveBeenCalled();
      expect(ctrl.showNoRoomsMessage).toHaveBeenCalled();
    });

    it('should not call functions if response is invalid', function () {
      scope.currentLocation.id = ctrl.locations[1].LocationId;
      ctrl.getRoomsForLocation();
      expect(ctrl.addPropertiesToRooms).not.toHaveBeenCalled();
      expect(ctrl.refreshRooms).not.toHaveBeenCalled();
      expect(ctrl.showNoRoomsMessage).not.toHaveBeenCalled();
    });

    it('should call toastrFactory.error', function () {
      scope.currentLocation.id = ctrl.locations[1].LocationId;
      ctrl.getRoomsForLocation(ctrl.locations[1].LocationId).failure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getProviderRoomOccurences function -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setupOccurencesForSchedule');
    });

    it('should call scheduleServices.ProviderRoomOccurrences.get', function () {
      ctrl.getProviderRoomOccurences();
      expect(scheduleServices.ProviderRoomOccurrences.get).toHaveBeenCalled();
    });

    it('should call setupOccurencesForSchedule and set providerRoomOccurences if response is valid', function () {
      ctrl
        .getProviderRoomOccurences()
        .success({ Value: [{ Color: '#800000' }] });
      expect(ctrl.providerRoomOccurences).toEqual([{ Color: '#800000' }]);
      expect(ctrl.setupOccurencesForSchedule).toHaveBeenCalled();
    });

    it('should not call setupOccurencesForSchedule if response is invalid', function () {
      ctrl.getProviderRoomOccurences().success(null);
      expect(ctrl.setupOccurencesForSchedule).not.toHaveBeenCalled();
    });

    it('should call toastrFactory.error', function () {
      ctrl.getRoomsForLocation(ctrl.locations[1].LocationId).failure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('setCurrentLocation function -> ', function () {
    it('should set $scope.currentLocation', function () {
      spyOn(ctrl, 'getRoomsForLocation');
      ctrl.setCurrentLocation();
      expect(scope.currentLocation.timezone).toEqual('Alaskan Standard Time');
      expect(scope.currentLocation.timezoneAbbrev).toEqual('AKST');
    });
  });

  describe('patCore:initlocation broadcast listener -> ', function () {
    it('should call functions', function () {
      spyOn(ctrl, 'setCurrentLocation');
      spyOn(ctrl, 'prepProvidersList');
      spyOn(ctrl, 'getRoomsForLocation');
      spyOn(ctrl, 'getProviderRoomOccurences');
      scope.$broadcast('patCore:initlocation');
      expect(ctrl.setCurrentLocation).toHaveBeenCalled();
      expect(ctrl.prepProvidersList).toHaveBeenCalled();
      expect(ctrl.getRoomsForLocation).toHaveBeenCalled();
      expect(ctrl.getProviderRoomOccurences).toHaveBeenCalled();
    });
  });

  describe('checkForEnoughTimeForLunch function -> ', function () {
    beforeEach(function () {
      ctrl.startDateTimePicker = {
        value: function () {
          return new Date();
        },
      };
      ctrl.endDateTimePicker = {
        value: function () {
          return new Date();
        },
      };
      ctrl.startLunchTimePicker = { enable: jasmine.createSpy() };
      ctrl.endLunchTimePicker = { enable: jasmine.createSpy() };
    });

    it('should call enable with false if dates are too close to each other', function () {
      ctrl.checkForEnoughTimeForLunch();
      expect(ctrl.startLunchTimePicker.enable).toHaveBeenCalledWith(false);
    });
  });

  describe('makeModsForStartEndTime function -> ', function () {
    var e = {};

    beforeEach(function () {
      e = {
        container: {
          first: jasmine.createSpy().and.returnValue({}),
          find: jasmine.createSpy().and.returnValue({
            css: jasmine.createSpy(),
            find: jasmine.createSpy().and.returnValue({
              css: jasmine.createSpy(),
              data: jasmine.createSpy().and.returnValue({
                bind: jasmine.createSpy(),
                setOptions: jasmine.createSpy(),
                value: jasmine.createSpy().and.returnValue('value'),
              }),
            }),
            prop: jasmine.createSpy(),
          }),
        },
        event: {
          end: new Date(),
          start: new Date(),
        },
      };
    });

    it('should make modifications to the kendo default start and end time pickers', function () {
      ctrl.makeModsForStartEndTime(e);
      expect(e.container.find).toHaveBeenCalled();
      expect(ctrl.startDateTimePicker.setOptions).toHaveBeenCalled();
      expect(ctrl.startDateTimePicker.bind).toHaveBeenCalled();
      expect(ctrl.endDateTimePicker.setOptions).toHaveBeenCalled();
      expect(ctrl.endDateTimePicker.bind).toHaveBeenCalled();
      expect(ctrl.startDateTimePicker.value).toHaveBeenCalledWith('value');
      expect(ctrl.endDateTimePicker.value).toHaveBeenCalledWith('value');
    });
  });

  describe('addLunchControls function -> ', function () {
    var e = {};

    beforeEach(function () {
      e = {
        container: {
          find: jasmine.createSpy().and.returnValue({
            after: jasmine.createSpy().and.returnValue({}),
          }),
        },
        event: {
          end: new Date(),
          start: new Date(),
        },
      };
      ctrl.endDateTimePicker = {
        value: jasmine.createSpy().and.returnValue({
          getDate: function () {},
          getMonth: function () {},
          getFullYear: function () {},
        }),
      };
    });

    it('should add lunch start and end time pickers', function () {
      ctrl.addLunchControls(e);
      expect(e.container.find).toHaveBeenCalled();
    });
  });

  describe('makeModsForBothTypes function -> ', function () {
    var e = {};

    beforeEach(function () {
      spyOn(ctrl, 'makeModsForStartEndTime');
      spyOn(ctrl, 'addLunchControls');
      spyOn(ctrl, 'addIdealDaysDropdown');
      spyOn(ctrl, 'addProvidersDropdown');
      e = {
        container: {
          find: jasmine.createSpy().and.returnValue({
            addClass: jasmine.createSpy(),
            kendoDropDownList: jasmine.createSpy().and.returnValue({}),
            first: jasmine.createSpy().and.returnValue({
              before: jasmine.createSpy(),
            }),
            hide: jasmine.createSpy().and.returnValue({}),
            before: jasmine.createSpy().and.returnValue({}),
            css: jasmine.createSpy(),
            find: jasmine.createSpy().and.returnValue({
              data: jasmine.createSpy().and.returnValue({
                bind: jasmine.createSpy(),
                enable: jasmine.createSpy(),
                optionLabel: {
                  remove: jasmine.createSpy(),
                },
                span: [
                  {
                    innerText: '',
                  },
                ],
                wrapper: {
                  attr: function () {},
                },
              }),
            }),
            parent: jasmine.createSpy().and.returnValue({
              remove: jasmine.createSpy().and.returnValue({}),
              hide: jasmine.createSpy().and.returnValue({}),
            }),
            prop: jasmine.createSpy(),
            remove: jasmine.createSpy().and.returnValue({
              remove: jasmine.createSpy().and.returnValue({}),
            }),
          }),
          prev: jasmine.createSpy().and.returnValue({
            find: jasmine.createSpy().and.returnValue({
              text: jasmine.createSpy().and.returnValue({}),
              attr: function () {},
            }),
          }),
        },
        event: {
          $$Provider: {},
          RoomId: '237',
        },
      };
    });

    it('should make generic modifications for both types of events', function () {
      ctrl.makeModsForBothTypes(e);
      expect(e.container.find).toHaveBeenCalled();
      expect(ctrl.makeModsForStartEndTime).toHaveBeenCalled();
      expect(ctrl.addLunchControls).toHaveBeenCalled();
      expect(ctrl.addIdealDaysDropdown).toHaveBeenCalledWith(e);
    });

    it('should call addProvidersDropdown ', function () {
      ctrl.makeModsForBothTypes(e);
      expect(ctrl.addProvidersDropdown).toHaveBeenCalledWith(e);
    });

    it('should hide providerDropdown if we already have a $$Provider', function () {
      e.event.$$Provider = { UserId: 'abc' };
      ctrl.makeModsForBothTypes(e);
      expect(
        e.container.find('label[for=providers_template]').parent().hide
      ).toHaveBeenCalled();
    });

    it('should set title based on whether we have a $$Provider', function () {
      ctrl.makeModsForBothTypes(e);
      expect(
        e.container.prev().find('.k-window-title').text
      ).toHaveBeenCalled();
    });

    it('should hide providerDropdown if we already have a $$Provider', function () {
      e.event.$$Provider = { UserId: 'abc' };
      ctrl.makeModsForBothTypes(e);
      expect(
        e.container.find('label[for=providers_template]').parent().hide
      ).toHaveBeenCalled();
    });
  });

  describe('makeModsForOccurence function -> ', function () {
    var e = {};

    beforeEach(function () {
      e = {
        container: {
          find: jasmine.createSpy().and.returnValue({
            find: jasmine.createSpy().and.returnValue({
              data: jasmine.createSpy().and.returnValue({
                enable: jasmine.createSpy(),
                span: [{}],
              }),
            }),
          }),
        },
      };
      ctrl.recurrenceDropdown = {
        enable: jasmine.createSpy(),
      };
    });

    it('should make modification for single occurrences', function () {
      ctrl.makeModsForOccurence(e);
      expect(ctrl.recurrenceDropdown.enable).toHaveBeenCalledWith(false);
    });
  });

  describe('weeklySeries function -> ', function () {
    var e = {};

    beforeEach(function () {
      e = {
        container: {
          find: jasmine.createSpy().and.returnValue({
            css: jasmine.createSpy(),
            find: jasmine.createSpy().and.returnValue({
              data: jasmine.createSpy().and.returnValue({
                max: jasmine.createSpy(),
              }),
            }),
            last: jasmine.createSpy().and.returnValue({
              before: jasmine.createSpy(),
            }),
            on: jasmine.createSpy(),
            removeClass: jasmine.createSpy(),
            each: function () {},
          }),
        },
      };
    });

    it('should make modification for weekly series', function () {
      ctrl.weeklySeries(e);
      expect(e.container.find).toHaveBeenCalled();
    });
  });

  describe('monthlySeries function -> ', function () {
    var e = {};

    beforeEach(function () {
      e = {
        container: {
          find: jasmine.createSpy().and.returnValue({
            remove: jasmine.createSpy().and.returnValue({}),
          }),
        },
      };
    });

    it('should make modification for monthly series', function () {
      ctrl.monthlySeries(e);
      expect(e.container.find).toHaveBeenCalled();
    });
  });

  describe('updateValuesForSeriesUpdate function -> ', function () {
    var e = {};

    beforeEach(function () {
      e = {
        container: {
          find: jasmine.createSpy().and.returnValue({
            css: jasmine.createSpy(),
            find: jasmine.createSpy().and.returnValue({
              data: jasmine.createSpy().and.returnValue({
                max: jasmine.createSpy(),
              }),
            }),
            last: jasmine.createSpy().and.returnValue({
              before: jasmine.createSpy(),
            }),
            on: jasmine.createSpy(),
            removeClass: jasmine.createSpy(),
          }),
        },
        event: {
          $$RecurrenceSetup: {
            FrequencyTypeId: 1,
          },
        },
      };
      ctrl.numericTextBoxWeeks = { value: jasmine.createSpy() };
      ctrl.numericTextBoxEndsAfter = {
        enable: jasmine.createSpy(),
        value: jasmine.createSpy(),
      };
      ctrl.datePickerEndsOn = {
        enable: jasmine.createSpy(),
        value: jasmine.createSpy(),
      };
    });

    it('should call e.container.find to look for checkbox values', function () {
      ctrl.updateValuesForSeriesUpdate(e);
      expect(e.container.find).toHaveBeenCalled();
    });

    it('should set value and enable appropriate element when e.event.$$RecurrenceSetup.Count is truthy', function () {
      e.event.$$RecurrenceSetup.Count = 23;
      ctrl.updateValuesForSeriesUpdate(e);
      expect(ctrl.numericTextBoxEndsAfter.value).toHaveBeenCalled();
      expect(ctrl.numericTextBoxEndsAfter.enable).toHaveBeenCalled();
      expect(ctrl.datePickerEndsOn.value).not.toHaveBeenCalled();
      expect(ctrl.datePickerEndsOn.enable).not.toHaveBeenCalled();
    });

    it('should set value and enable appropriate element when e.event.$$RecurrenceSetup.EndDate is truthy', function () {
      e.event.$$RecurrenceSetup.EndDate = new Date();
      ctrl.updateValuesForSeriesUpdate(e);
      expect(ctrl.datePickerEndsOn.value).toHaveBeenCalled();
      expect(ctrl.datePickerEndsOn.enable).toHaveBeenCalled();
      expect(ctrl.numericTextBoxEndsAfter.value).not.toHaveBeenCalled();
      expect(ctrl.numericTextBoxEndsAfter.enable).not.toHaveBeenCalled();
    });
  });

  describe('makeModsForSeries function -> ', function () {
    var e = {};

    beforeEach(function () {
      ctrl.recurrenceDropdown = {
        bind: jasmine.createSpy(),
        dataSource: {
          data: jasmine.createSpy(),
          remove: jasmine.createSpy(),
        },
        enable: jasmine.createSpy(),
      };
      e = {
        event: {
          ProviderRoomSetupId: 42,
        },
      };
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue({});
    });

    it('should make modification for series', function () {
      ctrl.makeModsForSeries(e);
      expect(ctrl.recurrenceDropdown.bind).toHaveBeenCalled();
    });

    it('should call scheduleServices.ProviderRoomOccurrences.get if ctrl.recurringEnabled && e.event.ProviderRoomSetupId are both truthy', function () {
      ctrl.recurringEnabled = true;
      ctrl.makeModsForSeries(e);
      expect(scheduleServices.ProviderRoomSetup.get).toHaveBeenCalled();
    });

    it('should not call scheduleServices.ProviderRoomOccurrences.get if ctrl.recurringEnabled is falsy', function () {
      ctrl.recurringEnabled = false;
      ctrl.makeModsForSeries(e);
      expect(scheduleServices.ProviderRoomSetup.get).not.toHaveBeenCalled();
    });

    it('should not call scheduleServices.ProviderRoomOccurrences.get if e.event.ProviderRoomSetupId is falsy', function () {
      e.event.ProviderRoomSetupId = null;
      ctrl.recurringEnabled = true;
      ctrl.makeModsForSeries(e);
      expect(scheduleServices.ProviderRoomSetup.get).not.toHaveBeenCalled();
    });
  });

  describe('customizeNativeEventContainer function -> ', function () {
    var e = {};

    beforeEach(function () {
      e = { container: {} };
      ctrl.recurrenceDropdown = {
        enable: jasmine.createSpy(),
      };
      spyOn(ctrl, 'makeModsForStartEndTime');
      spyOn(ctrl, 'makeModsForBothTypes');
      spyOn(ctrl, 'makeModsForOccurence');
      spyOn(ctrl, 'makeModsForSeries');
    });

    it('should call makeModsForBothTypes with event param', function () {
      ctrl.customizeNativeEventContainer(e);
      expect(ctrl.makeModsForBothTypes).toHaveBeenCalledWith(e);
    });

    it('should call makeModsForSingleOccurence if recurring param is false', function () {
      ctrl.recurringEnabled = false;
      ctrl.customizeNativeEventContainer(e);
      expect(ctrl.makeModsForOccurence).toHaveBeenCalledWith(e);
    });

    it('should call makeModsForSeries if recurring param is true', function () {
      ctrl.recurringEnabled = true;
      ctrl.customizeNativeEventContainer(e);
      expect(ctrl.makeModsForSeries).toHaveBeenCalledWith(e);
    });
  });

  describe('createRecurrenceSetupDto function -> ', function () {
    var e = {};
    var format;

    beforeEach(function () {
      e = {
        container: {
          find: jasmine
            .createSpy()
            .and.returnValue([{}, {}, {}, {}, {}, {}, {}]),
        },
        event: { recurrenceRule: '', start: new Date('12-08-2001') },
      };
      format = 'YYYY-MM-DD[T]HH:mm:ss[.00Z]';
      ctrl.startsOnDatePicker = {
        value: function () {
          return new Date('10-22-2004');
        },
      };
      ctrl.numericTextBoxWeeks = {
        value: function () {
          return 30;
        },
      };
    });

    it('should create DTO and set FrequencyTypeId to 0 and StartDate to e.event.start if FREQ=WEEKLY is not in recurrenceRule', function () {
      expect(ctrl.createRecurrenceSetupDto(e, format)).toEqual({
        FrequencyTypeId: 0,
        StartDate: moment(e.event.start).format(format),
      });
    });

    it('should create DTO and set FrequencyTypeId and Interval to 1 and StartDate to startsOnDatePicker.value() if FREQ=WEEKLY is in recurrenceRule', function () {
      e.event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO';
      expect(ctrl.createRecurrenceSetupDto(e, format)).toEqual({
        FrequencyTypeId: 1,
        Interval: 1,
        StartDate: moment(ctrl.startsOnDatePicker.value()).format(format),
        RepeatOnSunday: false,
        RepeatOnMonday: true,
        RepeatOnTuesday: false,
        RepeatOnWednesday: false,
        RepeatOnThursday: false,
        RepeatOnFriday: false,
        RepeatOnSaturday: false,
      });
    });

    it('should create DTO and set booleans for days appropriately', function () {
      e.event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
      expect(ctrl.createRecurrenceSetupDto(e, format).RepeatOnSunday).toBe(
        false
      );
      expect(ctrl.createRecurrenceSetupDto(e, format).RepeatOnMonday).toBe(
        true
      );
      expect(ctrl.createRecurrenceSetupDto(e, format).RepeatOnTuesday).toBe(
        true
      );
      expect(ctrl.createRecurrenceSetupDto(e, format).RepeatOnWednesday).toBe(
        true
      );
      expect(ctrl.createRecurrenceSetupDto(e, format).RepeatOnThursday).toBe(
        true
      );
      expect(ctrl.createRecurrenceSetupDto(e, format).RepeatOnFriday).toBe(
        true
      );
      expect(ctrl.createRecurrenceSetupDto(e, format).RepeatOnSaturday).toBe(
        false
      );
      e.event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=su';
      expect(ctrl.createRecurrenceSetupDto(e, format).RepeatOnSunday).toBe(
        false
      );
      e.event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=Mo';
      expect(ctrl.createRecurrenceSetupDto(e, format).RepeatOnMonday).toBe(
        false
      );
    });

    it('should create DTO and set Count to COUNT= value', function () {
      e.event.recurrenceRule = 'FREQ=WEEKLY;COUNT=4;BYDAY=SU,TH';
      expect(ctrl.createRecurrenceSetupDto(e, format).Count).toBe('4');
      e.event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=SU,TH';
      expect(ctrl.createRecurrenceSetupDto(e, format).Count).toBeUndefined();
    });

    it('should create DTO and set Interval to INTERVAL= value', function () {
      e.event.recurrenceRule = 'FREQ=WEEKLY;INTERVAL=30;BYDAY=FR';
      expect(ctrl.createRecurrenceSetupDto(e, format).Interval).toBe('30');
      e.event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=FR';
      expect(ctrl.createRecurrenceSetupDto(e, format).Interval).toBe(1); // default
    });

    it('should create DTO and set EndDate to UNTIL= value', function () {
      e.event.recurrenceRule =
        'FREQ=WEEKLY;UNTIL=20171220T090000Z;BYDAY=MO,TU,WE';
      expect(ctrl.createRecurrenceSetupDto(e, format).EndDate).toBe(
        moment('20171220T090000Z').endOf('day').format(format)
      );
      e.event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO,TU,WE';
      expect(ctrl.createRecurrenceSetupDto(e, format).EndDate).toBeUndefined();
    });

    it("should get into 'edit' part of this function when e.event.ProviderRoomSetupId && e.event.$$RecurrenceSetup are truthy", function () {
      e.event.ProviderRoomSetupId = 42;
      e.event.$$RecurrenceSetup = { FrequencyTypeId: 1 };
      e.event.recurrenceRule = '';
      ctrl.createRecurrenceSetupDto(e, format);
      expect(e.container.find).toHaveBeenCalled();
      e.event.recurrenceRule = '_';
      ctrl.createRecurrenceSetupDto(e, format);
      expect(e.container.find).toHaveBeenCalled();
    });

    it('should create DTO for edit', function () {
      e.event.ProviderRoomSetupId = 42;
      e.event.$$RecurrenceSetup = { FrequencyTypeId: 1 };
      e.event.recurrenceRule = '_';
      expect(ctrl.createRecurrenceSetupDto(e, format)).toEqual({
        Count: null,
        DataTag: undefined,
        EndDate: null,
        FrequencyTypeId: 1,
        Interval: 30,
        RepeatOnSunday: undefined,
        RepeatOnMonday: undefined,
        RepeatOnTuesday: undefined,
        RepeatOnWednesday: undefined,
        RepeatOnThursday: undefined,
        RepeatOnFriday: undefined,
        RepeatOnSaturday: undefined,
        StartDate: '2004-10-22T00:00:00.00Z',
      });
    });
  });

  describe('createProviderRoomSetupDto function -> ', function () {
    var e = {};

    beforeEach(function () {
      e = {
        container: {},
        event: {
          $$Provider: {},
          RoomId: '237',
          start: new Date('12-27-1963'),
          end: new Date('10-22-2004'),
          ProviderRoomSetupId: 2,
          DataTag: 'AOK76D00',
        },
      };
      ctrl.startDateTimePicker = {
        value: function () {
          return new Date('12-27-1963');
        },
      };
      ctrl.endDateTimePicker = {
        value: function () {
          return new Date('10-22-2004');
        },
      };
      ctrl.startLunchTimePicker = {
        value: function () {
          return new Date('10-06-1967');
        },
      };
      ctrl.endLunchTimePicker = {
        value: function () {
          return new Date('12-08-2001');
        },
      };
      ctrl.idealDaysTemplateDropDownList = {
        value: function () {
          return '42';
        },
      };
      ctrl.roomDropdown = {
        value: function () {
          return '237';
        },
      };
    });

    //it('should create DTO for event', function () {
    //    expect(ctrl.createProviderRoomSetupDto(e)).toEqual({
    //        EndTime: '2004-10-22T00:00:00.00Z', $$ProviderId: undefined, IdealDayTemplateId: '42', LocationId: 4, LunchEndTime: '2001-12-08T00:00:00.00Z', LunchStartTime: '1967-10-06T00:00:00.00Z', RecurrenceSetup: Object({ FrequencyTypeId: 0, StartDate: '1963-12-27T00:00:00.00Z' }), RoomId: '237', StartTime: '1963-12-27T00:00:00.00Z', UserId: undefined, ProviderRoomSetupId: 2, DataTag: 'AOK76D00'
    //    });
    //});

    //it('should create DTO for event will nulls for start and end lunch and IdealDayTemplateId, if they have no values set', function () {
    //    ctrl.startLunchTimePicker = { value: function () { return null; } };
    //    ctrl.endLunchTimePicker = { value: function () { return null; } };
    //    ctrl.idealDaysTemplateDropDownList = { value: function () { return null; } };
    //    expect(ctrl.createProviderRoomSetupDto(e)).toEqual({
    //        EndTime: '2004-10-22T00:00:00.00Z', $$ProviderId: undefined, IdealDayTemplateId: null, LocationId: 4, LunchEndTime: null, LunchStartTime: null, RecurrenceSetup: Object({ FrequencyTypeId: 0, StartDate: '1963-12-27T00:00:00.00Z' }), RoomId: '237', StartTime: '1963-12-27T00:00:00.00Z', UserId: undefined, ProviderRoomSetupId: 2, DataTag: 'AOK76D00'
    //    });
    //});
  });

  describe('createProviderRoomOccurrenceDto function -> ', function () {
    var e = {};

    beforeEach(function () {
      e = {
        container: {},
        event: {
          $$Provider: { UserId: '2' },
          RoomId: '237',
          DataTag: 'D6G%V^',
        },
      };
      ctrl.startDateTimePicker = {
        value: function () {
          return new Date('12-27-1963');
        },
      };
      ctrl.endDateTimePicker = {
        value: function () {
          return new Date('10-22-2004');
        },
      };
      ctrl.startLunchTimePicker = {
        value: function () {
          return new Date('10-06-1967');
        },
      };
      ctrl.endLunchTimePicker = {
        value: function () {
          return new Date('12-08-2001');
        },
      };
      ctrl.idealDaysTemplateDropDownList = {
        value: function () {
          return '42';
        },
      };
      ctrl.roomDropdown = {
        value: function () {
          return '237';
        },
      };
    });

    //it('should create DTO for event', function () {
    //    expect(ctrl.createProviderRoomOccurrenceDto(e)).toEqual({
    //        DataTag: 'D6G%V^', $$ProviderId: undefined, EndTime: '2004-10-22T05:00:00.00Z', IdealDayTemplateId: '42', LocationId: 4, LunchEndTime: '2001-12-08T06:00:00.00Z', LunchStartTime: '1967-10-06T05:00:00.00Z', ProviderRoomOccurrenceId: undefined, RoomId: '237', StartTime: '1963-12-27T06:00:00.00Z', UserId: '2'
    //    });
    //});

    //it('should create DTO for event will nulls for start and end lunch and IdealDayTemplateId, if they have no values set', function () {
    //    ctrl.startLunchTimePicker = { value: function () { return null; } };
    //    ctrl.endLunchTimePicker = { value: function () { return null; } };
    //    ctrl.idealDaysTemplateDropDownList = { value: function () { return null; } };
    //    expect(ctrl.createProviderRoomOccurrenceDto(e)).toEqual({
    //        DataTag: 'D6G%V^', $$ProviderId: undefined, EndTime: '2004-10-22T05:00:00.00Z', IdealDayTemplateId: null, LocationId: 4, LunchEndTime: null, LunchStartTime: null, ProviderRoomOccurrenceId: undefined, RoomId: '237', StartTime: '1963-12-27T06:00:00.00Z', UserId: '2'
    //    });
    //});
  });

  describe('save function -> ', function () {
    var e = {};

    beforeEach(function () {
      spyOn(ctrl, 'getProviderRoomOccurences');
      e = { container: {}, event: { $$Provider: {} } };
      ctrl.startDateTimePicker = {
        value: function () {
          return new Date();
        },
      };
      ctrl.endDateTimePicker = {
        value: function () {
          return new Date();
        },
      };
      ctrl.startLunchTimePicker = {
        value: function () {
          return new Date();
        },
      };
      ctrl.endLunchTimePicker = {
        value: function () {
          return new Date();
        },
      };
      ctrl.idealDaysTemplateDropDownList = {
        value: function () {
          return null;
        },
      };
      ctrl.roomDropdown = {
        value: function () {
          return null;
        },
      };
    });

    it('should call scheduleServices.ProviderRoomSetup.save if there is no ProviderRoomSetupId', function () {
      ctrl.save(e);
      expect(scheduleServices.ProviderRoomSetup.save).toHaveBeenCalled();
    });

    it('should call scheduleServices.ProviderRoomOccurrences.update if there is a ProviderRoomSetupId', function () {
      e.event.ProviderRoomOccurrenceId = '404';
      ctrl.save(e);
      expect(
        scheduleServices.ProviderRoomOccurrences.update
      ).toHaveBeenCalled();
    });

    it('should call toastrFactory.success and getProviderRoomOccurences if response is valid', function () {
      ctrl.save(e).success({ Value: {} });
      expect(toastrFactory.success).toHaveBeenCalledWith(
        'Provider Hours have been saved',
        'Success'
      );
      expect(ctrl.getProviderRoomOccurences).toHaveBeenCalled();
    });

    it('should not call toastrFactory.success if response is invalid', function () {
      ctrl.save(e).success(null);
      expect(toastrFactory.success).not.toHaveBeenCalled();
    });

    it('should call toastrFactory.error and getProviderRoomOccurences', function () {
      ctrl.save(e).failure();
      expect(toastrFactory.error).toHaveBeenCalledWith(
        'Failed to save the {0}. Please try again.',
        'Error'
      );
      expect(ctrl.getProviderRoomOccurences).toHaveBeenCalled();
    });
  });

  describe('isValid function -> ', function () {
    var e = {};

    beforeEach(function () {
      e = {
        container: {},
        event: { recurrenceRule: '', $$Provider: { UserId: 'abc' } },
      };
      // set default lunch times
      ctrl.startDateTimePicker = {
        value: function () {
          return new Date('12-08-2001');
        },
      };
      ctrl.endDateTimePicker = {
        value: function () {
          return new Date('12-08-2001').setHours(
            new Date('12-08-2001').getHours() + 3
          );
        },
      };
      ctrl.startLunchTimePicker = {
        value: function () {
          return new Date('12-08-2001').setHours(
            new Date('12-08-2001').getHours() + 1
          );
        },
      };
      ctrl.endLunchTimePicker = {
        value: function () {
          return new Date('12-08-2001').setHours(
            new Date('12-08-2001').getHours() + 2
          );
        },
      };
    });

    it('should return false if lunch start is not within start and end range', function () {
      ctrl.startLunchTimePicker = {
        value: function () {
          return new Date('12-08-2001').setHours(
            new Date('12-08-2001').getHours() + 3
          );
        },
      };
      ctrl.endLunchTimePicker = {
        value: function () {
          return new Date('12-08-2001').setHours(
            new Date('12-08-2001').getHours() + 4
          );
        },
      };
      expect(ctrl.isValid(e)).toBe(false);
    });

    it('should return false if lunch end is not within start and end range', function () {
      ctrl.startLunchTimePicker = {
        value: function () {
          return new Date('12-08-2001').setHours(
            new Date('12-08-2001').getHours() + 2
          );
        },
      };
      ctrl.endLunchTimePicker = {
        value: function () {
          return new Date('12-08-2001').setHours(
            new Date('12-08-2001').getHours() + 4
          );
        },
      };
      expect(ctrl.isValid(e)).toBe(false);
    });

    it('should return true if dates are far enough apart', function () {
      expect(ctrl.isValid(e)).toBe(true);
    });

    it('should return false if dates are too close', function () {
      ctrl.endDateTimePicker = {
        value: function () {
          return new Date('12-08-2001');
        },
      };
      expect(ctrl.isValid(e)).toBe(false);
    });

    it('should return true if there is no recurrenceRule', function () {
      expect(ctrl.isValid(e)).toBe(true);
    });

    it('should return true if a weekday is selected', function () {
      e.event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=WE';
      expect(ctrl.isValid(e)).toBe(true);
      e.event.recurrenceRule = 'FREQ=WEEKLY;COUNT=1;BYDAY=WE';
      expect(ctrl.isValid(e)).toBe(true);
      e.event.recurrenceRule =
        'FREQ=WEEKLY;UNTIL=20171220T090000Z;BYDAY=MO,TU,WE';
      expect(ctrl.isValid(e)).toBe(true);
    });

    it('should return false if no weekday is selected', function () {
      e.event.recurrenceRule = 'FREQ=WEEKLY;BYDAY=';
      expect(ctrl.isValid(e)).toBe(false);
    });

    it('should return false if there is no provider', function () {
      expect(ctrl.isValid(e)).toBe(true);
      e.event.$$Provider = null;
      expect(ctrl.isValid(e)).toBe(false);
    });
  });

  describe('delete function -> ', function () {
    var e = {};

    beforeEach(function () {
      spyOn(ctrl, 'getProviderRoomOccurences');
      e = { container: {}, event: { $$Provider: {} } };
      ctrl.startLunchTimePicker = {
        value: function () {
          return new Date();
        },
      };
      ctrl.endLunchTimePicker = {
        value: function () {
          return new Date();
        },
      };
      ctrl.idealDaysTemplateDropDownList = {
        value: function () {
          return null;
        },
      };
    });

    it('should call scheduleServices.ProviderRoomOccurrences.delete if deletingSeries is false', function () {
      ctrl.delete(e, false);
      expect(
        scheduleServices.ProviderRoomOccurrences.delete
      ).toHaveBeenCalled();
    });

    it('should call scheduleServices.ProviderRoomOccurrences.delete if deletingSeries is true', function () {
      ctrl.delete(e, true);
      expect(scheduleServices.ProviderRoomSetup.delete).toHaveBeenCalled();
    });

    it('should call toastrFactory.success and getProviderRoomOccurences', function () {
      ctrl.delete(e).success({ Value: {} });
      expect(toastrFactory.success).toHaveBeenCalledWith(
        'Provider Hours have been deleted',
        'Success'
      );
      expect(ctrl.getProviderRoomOccurences).toHaveBeenCalled();
    });

    it('should call toastrFactory.error and getProviderRoomOccurences', function () {
      ctrl.delete(e).failure();
      expect(toastrFactory.error).toHaveBeenCalledWith(
        'Failed to delete the {0}. Please try again.',
        'Error'
      );
      expect(ctrl.getProviderRoomOccurences).toHaveBeenCalled();
    });
  });

  describe('createSetupTypeModalInstance function -> ', function () {
    it('should create modal instance', function () {
      expect(ctrl.createSetupTypeModalInstance()).toBeTruthy();
      expect(modalFactory.Modal).toHaveBeenCalled();
    });
  });

  describe('createSchedulerOptions function -> ', function () {
    it('should return configuration object', function () {
      expect(ctrl.createSchedulerOptions()).toBeTruthy();
    });
  });

  describe('getEndDate function -> ', function () {
    it('should return current date plus nine hours if there is enough time in the day', function () {
      var startDate = moment('2001-12-08 09:00:00');
      expect(ctrl.getEndDate(startDate).getHours()).toEqual(18);
      startDate = moment('2001-12-08 14:00:00');
      expect(ctrl.getEndDate(startDate).getHours()).toEqual(23);
    });

    it('should return 11pm if there is not enough time in the day', function () {
      var startDate = moment('2001-12-08 15:00:00');
      expect(ctrl.getEndDate(startDate).getHours()).toEqual(23);
      startDate = moment('2001-12-08 22:00:00');
      expect(ctrl.getEndDate(startDate).getHours()).toEqual(23);
    });
  });

  describe('dropped function -> ', function () {
    var e = {};

    beforeEach(function () {
      e = {
        container: {},
        event: { $$Provider: {} },
        draggable: { currentTarget: [{ id: scope.providers[1].UserId }] },
      };
      scope.scheduler = {
        addEvent: jasmine.createSpy(),
        resources: [{ dataSource: { _data: [{}] } }],
        resourcesBySlot: function () {
          return 2;
        },
        setDataSource: function () {},
        slotByPosition: function () {
          return {
            content: {
              find: function () {
                return '';
              },
            },
          };
        },
        view: function () {
          return {
            content: {
              find: function () {
                return [];
              },
            },
          };
        },
      };
    });

    it('should call addEvent', function () {
      scope.dropped(e);
      expect(scope.scheduler.addEvent).toHaveBeenCalled();
    });
  });

  describe('getIdealDayTemplates function -> ', function () {
    it('should call idealDayTemplatesFactory.get if user has access', function () {
      spyOn(ctrl, 'viewIdealDaysTempatesAccess').and.returnValue(true);
      ctrl.getIdealDayTemplates();
      expect(idealDayTemplatesFactory.get).toHaveBeenCalled();
    });
  });

  describe('manageIdealDays function -> ', function () {
    it('should call openManageIdealDaysModal if user has access', function () {
      spyOn(ctrl, 'openManageIdealDaysModal');
      spyOn(ctrl, 'viewIdealDaysTempatesAccess').and.returnValue(true);
      scope.manageIdealDays();
      expect(ctrl.openManageIdealDaysModal).toHaveBeenCalled();
    });
  });

  describe('showProviderOccurrences function -> ', function () {
    it('should call openProviderOccurrencesModal if user has access', function () {
      spyOn(ctrl, 'openProviderOccurrencesModal');
      spyOn(ctrl, 'authProviderOccurrencesViewAccess').and.returnValue(true);
      scope.showProviderOccurrences();
      expect(ctrl.openProviderOccurrencesModal).toHaveBeenCalled();
    });
  });

  describe('updateTemplates function -> ', function () {
    it('should update templates list', function () {
      var templates = [{}, {}, {}];
      scope.idealDayTempates = [{}, {}];
      scope.updateTemplates(templates);
      expect(scope.idealDayTempates.length).toEqual(templates.length);
    });
  });

  describe('ctrl.successHandler function -> ', function () {
    it('should call ctrl.getProviderRoomOccurences', function () {
      spyOn(ctrl, 'getProviderRoomOccurences');
      ctrl.successHandler();
      expect(ctrl.getProviderRoomOccurences).toHaveBeenCalled();
    });
  });

  describe('scope.viewIdealDay function -> ', function () {
    it('should call idealDayTemplatesFactory.getById', function () {
      var e = {
        container: {},
        event: {
          $$Provider: {},
          RoomId: '237',
          start: new Date('12-27-1963'),
          end: new Date('10-22-2004'),
        },
      };
      var idealDayTemplateId = 1;
      scope.viewIdealDay(e, idealDayTemplateId);
      expect(idealDayTemplatesFactory.getById).toHaveBeenCalledWith(
        idealDayTemplateId
      );
    });
  });

  describe('ctrl.onProviderChange function -> ', function () {
    var e = {};
    beforeEach(function () {
      e = {
        container: {
          find: jasmine.createSpy().and.returnValue({
            text: jasmine.createSpy().and.returnValue({}),
            removeClass: jasmine.createSpy().and.returnValue({}),
          }),
          prev: jasmine.createSpy().and.returnValue({
            find: jasmine.createSpy().and.returnValue({
              text: jasmine.createSpy().and.returnValue({}),
            }),
          }),
        },
        event: { value: jasmine.createSpy().and.returnValue({}) },
      };
    });

    it('should set event.$$Provider', function () {
      var prov = scope.providers[0];
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue({ prov });
      ctrl.onProviderChange(e, prov.UserId);
      expect(e.event.color).toEqual(prov.color);
      expect(e.event.UserId).toEqual(prov.UserId);
    });
  });

  describe('scope.onDragStart function ->', function () {
    var prov = {};
    var e = {};
    beforeEach(function () {
      prov = {
        UserId: '09ffbd2f-3837-e711-b798-8056f25c3d57',
        $$ShowOnSchedule: true,
      };
      //e = {
      //    preventDefault: { value: jasmine.createSpy().and.returnValue({}) },
      //    currentTarget: { value: [{ id: '2' }] }
      //    //currentTarget: { value: jasmine.createSpy().and.returnValue([{}, {}]) }

      //};
      e = {
        container: {},
        preventDefault: jasmine.createSpy(),
        currentTarget: [{ id: scope.providers[0].UserId }],
      };
    });

    it('should disable event if provider.$$ShowOnSchedule is false', function () {
      prov.ShowOnSchedule = false;
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(prov);
      scope.onDragStart(e);
      expect(e.preventDefault).toHaveBeenCalled();
    });

    it('should not disable event if provider.$$ShowOnSchedule is true', function () {
      prov.ShowOnSchedule = true;
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue({ prov });
      scope.onDragStart(e);

      expect(e.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.findMatchingProvider function ->', function () {
    it('should return matching provider when provider exists', function () {
      var userId = 'userId';
      scope.providers = [{ UserId: userId }];

      var result = ctrl.findMatchingProvider({ UserId: userId });

      expect(result).toBe(scope.providers[0]);
    });

    it('should return null when provider does not exist', function () {
      scope.providers = [{ UserId: 'otherId' }];

      var result = ctrl.findMatchingProvider({ UserId: 'userId' });

      expect(result).toBeNull();
    });
  });

  describe('scope.toggleShowOnSchedule function ->', function () {
    var prov;
    beforeEach(function () {
      prov = {
        UserId: '09ffbd2f-3837-e711-b798-8056f25c3d57',
        ShowOnSchedule: true,
      };
    });

    it('should set ShowOnSchedule to true if provider.$$ShowOnSchedule was false', function () {
      prov.ShowOnSchedule = false;
      scope.toggleShowOnSchedule(prov);
      expect(providerShowOnScheduleFactory.save).toHaveBeenCalledWith(
        prov.UserId,
        { ShowOnSchedule: true }
      );
    });

    it('should set ShowOnSchedule to false if provider.$$ShowOnSchedule was true', function () {
      prov.ShowOnSchedule = true;
      scope.toggleShowOnSchedule(prov);
      expect(providerShowOnScheduleFactory.save).toHaveBeenCalledWith(
        prov.UserId,
        { ShowOnSchedule: false }
      );
    });

    it('should call providerShowOnScheduleFactory.save', function () {
      scope.toggleShowOnSchedule(prov);
      expect(providerShowOnScheduleFactory.save).toHaveBeenCalled();
    });
  });

  describe('ctrl.previousOccurrence function ->', function () {
    var startTime = new Date();
    beforeEach(function () {
      timeZoneFactory.ConvertDateTZ.and.callFake(function () {
        var param = arguments[0];
        if (param === startTime) {
          return startTime;
        }
        return param;
      });
    });

    it('should return false if startTime is before start of today', function () {
      expect(ctrl.previousOccurrence(startTime)).toBe(false);
    });

    it('should return true if startDate is after start of today', function () {
      startTime = startTime.setDate(startTime + 1);
      expect(ctrl.previousOccurrence(startTime)).toBe(false);
    });
  });
});
