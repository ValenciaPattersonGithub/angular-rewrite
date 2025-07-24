describe('Controller: CreditTransactionController', function () {
  var scope,
    ctrl,
    q,
    timeout,
    toastrFactory,
    listHelper,
    patientServices,
    mockCreditTransactionDto;
  var localize,
    scroll,
    data,
    element,
    controller,
    surfaceHelper,
    rootHelper,
    staticData,
    referenceDataServiceMock,
    locationServicesMock,
    featureFlagServiceMock,
    fuseFlagMock,
    timeZoneFactoryMock;

  const currencyTypes = {
    Value: [
      { Id: 1, Name: 'CASH' },
      { Id: 2, Name: 'CHECK' },
      { Id: 3, Name: 'CREDIT CARD' },
      { Id: 4, Name: 'DEBIT CARD' },
      { Id: 5, Name: 'OTHER' },
    ],
  };
  var currentLocation = {
    id: 1,
    name: "Chris's Location",
    timezone: 'Central Standard Time',
    practiceId: 1,
  };
  var location2 = {
    id: 2,
    name: "Chris's California Location",
    timezone: 'Pacific Standard Time',
    practiceId: 1,
  };

  // list of all provider
  var mockAllProvidersList = [
    {
      UserId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
      FirstName: 'RK Assist',
      MiddleName: null,
      LastName: 'Assitant',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'raks@pattcom.onmicrosoft.com',
      UserCode: 'ASSRK1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'rkas@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 3,
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
      ProfessionalDesignation: 'RK Assist Pat Soar C',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T11:50:18.2199196+00:00","RowVersion":"W/\\"datetime\'2015-09-30T11%3A50%3A18.2199196Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T11:50:16.9153383Z',
    },
    {
      UserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
      FirstName: 'Terra',
      MiddleName: 'D',
      LastName: 'Data',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'terradata123@pattcom.onmicrosoft.com',
      UserCode: 'DATTE1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'terra@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: 1,
      JobTitle: 'Dental surgeon',
      ProviderTypeId: 1,
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
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T14:26:13.9041626+00:00","RowVersion":"W/\\"datetime\'2015-09-30T14%3A26%3A13.9041626Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T14:26:12.1070625Z',
    },
    {
      UserId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
      FirstName: 'SHA',
      MiddleName: null,
      LastName: 'GOE',
      PreferredName: 'Shalini',
      DateOfBirth: null,
      UserName: 'shhh@pattcom.onmicrosoft.com',
      UserCode: 'GOESH1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'sss@test.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 4,
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
      ProfessionalDesignation: 'Den',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-28T15:55:14.6622633+00:00","RowVersion":"W/\\"datetime\'2015-09-28T15%3A55%3A14.6622633Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-28T15:55:12.9146859Z',
    },
    {
      UserId: 'eedf5827-6735-4832-9d20-99758df70a8b',
      FirstName: 'Inc Assist',
      MiddleName: '',
      LastName: 'Inactive',
      PreferredName: 'Inca',
      DateOfBirth: null,
      UserName: 'inca@pattcom.onmicrosoft.com',
      UserCode: 'INAIN1',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'inca@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 3,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: 'Assistant of the Pat',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T09:26:01.353604+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A01.353604Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T09:26:00.0431939Z',
    },
    {
      UserId: '517ce215-b71b-408f-8b20-62a4c1386f77',
      FirstName: 'Inc Dentist',
      MiddleName: '',
      LastName: 'Inactive',
      PreferredName: '',
      DateOfBirth: null,
      UserName: 'incden@pattcom.onmicrosoft.com',
      UserCode: 'INAIN2',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'incden@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 1,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: 'Dentist of the Pat C',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T09:26:22.6941851+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A22.6941851Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T09:26:21.6120902Z',
    },
    {
      UserId: 'cf0e2663-80f5-43ad-89d4-4416a6111521',
      FirstName: 'Inc Hygienist',
      MiddleName: '',
      LastName: 'Inactive',
      PreferredName: '',
      DateOfBirth: null,
      UserName: 'inchyg@pattcom.onmicrosoft.com',
      UserCode: 'INAIN3',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'inchyg@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 2,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: 'Hygienist of PAT Com',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T09:26:38.2970666+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A38.2970666Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T09:26:37.2170122Z',
    },
    {
      UserId: '444842d4-1e9e-4183-b290-a27a8a5f9351',
      FirstName: 'Inc Other',
      MiddleName: '',
      LastName: 'Inactive',
      PreferredName: '',
      DateOfBirth: null,
      UserName: 'incoth@pattcom.onmicrosoft.com',
      UserCode: 'INAIN4',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'incoth@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 5,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: 'Inactive Other of PA',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T09:26:57.6304013+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A57.6304013Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T09:26:56.2933199Z',
    },
    {
      UserId: '451b2356-6833-4e42-9681-e1bf042a9e5b',
      FirstName: 'RK Blank',
      MiddleName: null,
      LastName: 'RKbla',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'RKbla@pattcom.onmicrosoft.com',
      UserCode: 'RKBRK1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'RKbla@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: null,
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
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-29T08:43:12.3159591+00:00","RowVersion":"W/\\"datetime\'2015-09-29T08%3A43%3A12.3159591Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T08:43:11.5361316Z',
    },
    {
      UserId: '0fa21181-8d2e-454d-9dcd-ffb33f95bfa5',
      FirstName: 'RK Dentist',
      MiddleName: '',
      LastName: 'RKDen',
      PreferredName: '',
      DateOfBirth: null,
      UserName: 'RKDEN@pattcom.onmicrosoft.com',
      UserCode: 'RKDRK1',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'rkden@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 1,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: true,
      StatusChangeNote: null,
      ProfessionalDesignation: '',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T11:43:57.6941016+00:00","RowVersion":"W/\\"datetime\'2015-09-30T11%3A43%3A57.6941016Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T11:43:56.5618443Z',
    },
    {
      UserId: '227cf131-5210-4944-98cf-788c9f4f51f8',
      FirstName: 'RK Hygienist',
      MiddleName: '',
      LastName: 'Rkhyg',
      PreferredName: '',
      DateOfBirth: null,
      UserName: 'rkhyg@pattcom.onmicrosoft.com',
      UserCode: 'RKHRK1',
      Color: '#7F7F7F',
      ImageFile: '',
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'rkhyg@email.com',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
      },
      DepartmentId: null,
      JobTitle: '',
      ProviderTypeId: 2,
      TaxId: '',
      FederalLicense: '',
      DeaNumber: '',
      NpiTypeOne: '',
      PrimaryTaxonomyId: null,
      SecondaryTaxonomyId: null,
      StateLicense: '',
      AnesthesiaId: '',
      IsActive: false,
      StatusChangeNote: null,
      ProfessionalDesignation: '',
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T11:32:21.7375333+00:00","RowVersion":"W/\\"datetime\'2015-09-30T11%3A32%3A21.7375333Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T11:32:20.5137411Z',
    },
    {
      UserId: '29691744-6de7-4679-bb55-824a51d4df58',
      FirstName: 'RK NotP',
      MiddleName: null,
      LastName: 'Rknotp',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'Rknotp@pattcom.onmicrosoft.com',
      UserCode: 'RKNRK1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'Rknotp@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 4,
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
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-29T08:41:35.9948486+00:00","RowVersion":"W/\\"datetime\'2015-09-29T08%3A41%3A35.9948486Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T08:41:34.9463004Z',
    },
    {
      UserId: '3398f3b4-b261-4c9b-aa13-59bf0127f488',
      FirstName: 'RK Other',
      MiddleName: '',
      LastName: 'RKOther',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'RKOther@pattcom.onmicrosoft.com',
      UserCode: 'RKORK1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'RKOther@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 5,
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
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-29T08:39:45.049056+00:00","RowVersion":"W/\\"datetime\'2015-09-29T08%3A39%3A45.049056Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T08:39:44.0458392Z',
    },
    {
      UserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
      FirstName: 'Mary Beth',
      MiddleName: '',
      LastName: 'Swift',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'marybeth.swift@pattcom.onmicrosoft.com',
      UserCode: 'SWIMA1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'User@TenantInfo.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: 1,
      JobTitle: null,
      ProviderTypeId: 1,
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
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-25T05:35:52.9058232+00:00","RowVersion":"W/\\"datetime\'2015-09-25T05%3A35%3A52.9058232Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-25T05:35:51.577119Z',
    },
    {
      UserId: 'ffbf6738-06a9-4438-b6b0-ceac9ad78fd1',
      FirstName: 'Hour',
      MiddleName: null,
      LastName: 'Test',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'hourtest123@pattcom.onmicrosoft.com',
      UserCode: 'TESHO1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'hourtest@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 4,
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
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T06:43:15.7153229+00:00","RowVersion":"W/\\"datetime\'2015-09-30T06%3A43%3A15.7153229Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T06:43:14.3781493Z',
    },
    {
      UserId: '81f90124-b912-49f8-b5f2-092156cf7800',
      FirstName: 'Aaron',
      MiddleName: 'T',
      LastName: 'Tester',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'AaronTester@pattcom.onmicrosoft.com',
      UserCode: 'TESAA1',
      Color: '#7F7F7F',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'sadgasd@asdfg.dsaf',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: null,
      JobTitle: null,
      ProviderTypeId: 4,
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
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-29T16:56:07.5504077+00:00","RowVersion":"W/\\"datetime\'2015-09-29T16%3A56%3A07.5504077Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T16:56:05.8548252Z',
    },
    {
      UserId: '3a9e0fb7-74f2-4ab3-859b-afbe3d19ffb8',
      FirstName: 'Harry',
      MiddleName: null,
      LastName: 'User',
      PreferredName: null,
      DateOfBirth: null,
      UserName: 'HarryUser@pattcom.onmicrosoft.com',
      UserCode: 'USEHA1',
      Color: '#00a2e8',
      ImageFile: null,
      EmployeeStartDate: null,
      EmployeeEndDate: null,
      Email: 'Harry@email.com',
      Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
      },
      DepartmentId: 1,
      JobTitle: 'Dentist',
      ProviderTypeId: 1,
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
      Locations: null,
      DataTag:
        '{"Timestamp":"2015-09-30T12:44:35.9872305+00:00","RowVersion":"W/\\"datetime\'2015-09-30T12%3A44%3A35.9872305Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-30T12:44:34.0898085Z',
    },
  ];

  var mockServiceAndDebitTransactionDtos = [
    {
      DebitTransactionId: '10403293-1821-4f97-a2cd-62b28faf76b6',
      AccountMemberId: '5c21b1d0-d612-4db8-ad09-862d839015d0',
      LocationId: 4,
      AdjustmentTypeId: 'cbd804fd-a75a-47b7-8448-894a13b3aa41',
      EncounterId: '00000000-0000-0000-0000-000000000000',
      Amount: 20,
      AdjustmentAmount: '100',
      DateEntered: '2016-02-09T10:14:51.363Z',
      Description: '+ve adjustment',
      EnteredByUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
      Note: '',
      TransactionTypeId: 5,
      ProviderUserId: 'ab6ec3e1-2587-46db-80a5-a1badf5fdd30',
      Balance: 20,
      DataTag:
        '{"Timestamp":"2016-02-09T10:14:53.307+00:00","RowVersion":"W/\\"datetime\'2016-02-09T10%3A14%3A53.307Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2016-02-09T10:14:51.9859001Z',
      AgingDate: '2016-02-09T10:14:51.363Z',
      Fee: '20',
      RecordIndex: '10',
      PatientName: 'Testcase A.',
      UnixTimeStamp: '1454956200',
    },
  ];

  var mockCreditTransactionDto1 = {
    CreditTransactionId: 'a5edf3ab-e9c5-4350-aacf-dc04ab47f2d2',
    LocationId: 4,
    AccountId: 'bc6436b5-2237-4158-9e13-64e3ae9c157d',
    AccountMemberId: '5c21b1d0-d612-4db8-ad09-862d839015d0',
    AdjustmentTypeId: null,
    Amount: 10,
    ClaimId: null,
    DateEntered: '2016-02-08T13:32:20.506Z',
    Description: 'CESS',
    PaymentTypePromptValue: null,
    EnteredByUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
    Note: null,
    PaymentTypeId: null,
    TransactionTypeId: 2,
    CreditTransactionDetails: [
      {
        CreditTransactionDetailId: 'e44430d4-8d7a-492f-a705-75f2b544a4b8',
        AccountMemberId: '5c21b1d0-d612-4db8-ad09-862d839015d0',
        Amount: -10,
        AppliedToServiceTransationId: null,
        CreditTransactionId: 'a5edf3ab-e9c5-4350-aacf-dc04ab47f2d2',
        DateEntered: '2016-02-08T13:32:20.506Z',
        EncounterId: null,
        AppliedToDebitTransactionId: null,
        IsDeleted: false,
        DataTag:
          '{"Timestamp":"2016-02-09T09:32:22.733+00:00","RowVersion":"W/\\"datetime\'2016-02-09T09%3A32%3A22.733Z\'\\""}',
        UserModified: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        DateModified: '2016-02-09T09:32:21.6516429Z',
        ObjectState: null,
        ProviderUserId: 'ab6ec3e1-2587-46db-80a5-a1badf5fdd30',
      },
    ],
    IsDeleted: false,
    DataTag:
      '{"Timestamp":"2016-02-09T09:32:22.783+00:00","RowVersion":"W/\\"datetime\'2016-02-09T09%3A32%3A22.783Z\'\\""}',
    UserModified: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
    DateModified: '2016-02-09T09:32:21.1692025Z',
    ProviderUserId: 'ab6ec3e1-2587-46db-80a5-a1badf5fdd30',
    TransactionType: '- Adjustment',
    UnassignedAmount: 10,
  };

  // list of payment types
  var mockPaymentTypesList = [
    {
      PaymentTypeId: '00000000-0000-0000-0000-000000000001',
      IsSystemType: false,
      Description: 'PaymentType1',
      Prompt: 'Prompt Text',
    },
    {
      PaymentTypeId: '00000000-0000-0000-0000-000000000002',
      IsSystemType: false,
      Description: 'PaymentType2',
    },
  ];

  //mock for listHelper service
  listHelper = {
    totalUnassignedAmountFilterValue: jasmine
      .createSpy('listHelper.totalUnassignedAmountFilter')
      .and.returnValue(11),
    totalFilterValue: jasmine
      .createSpy('listHelper.totalFilter')
      .and.returnValue(5),
  };

  //mock for surfaceHelper
  surfaceHelper = {
    surfaceCSVStringToSurfaceString: jasmine
      .createSpy('SurfaceHelper.surfaceCSVStringToSurfaceString')
      .and.returnValue('MB'),
  };

  rootHelper = {
    setValidSelectedRoots: jasmine
      .createSpy('rootHelper.setValidSelectedRoots')
      .and.returnValue('BP'),
  };

  staticData = {
    TeethDefinitions: jasmine
      .createSpy('staticData.setValidSelectedRoots')
      .and.returnValue({
        then: jasmine.createSpy(),
      }),
    CurrencyTypes: jasmine.createSpy('staticData.CurrencyTypes').and.returnValue({ then: jasmine.createSpy().and.returnValue(currencyTypes) }),
    PaymentProviders: jasmine.createSpy('staticData.PaymentProviders').and.returnValue({ OpOpenEdge: 0, TransactionsUI: 1 }),
  };

  locationServicesMock = {
    getLocgetPaymentDevicesByLocationAsyncations: {}
  };

  featureFlagServiceMock = {
    getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
  };

  fuseFlagMock = {};

  // mock of credit transaction dto
  mockCreditTransactionDto = {
    CreditTransactionId: '00000000-0000-0000-0000-000000000000',
    // current location id
    LocationId: 0,
    // This should have some valid account id, If not payment will not get added.
    AccountId: 1,
    AdjustmentTypeId: null,
    Amount: 0,
    ClaimId: null,
    DateEntered: new Date(),
    ValidDate: true,
    Description: null,
    // PromptTitle property is used at client side only. This property is used to display payment type prompt label on UI.
    PromptTitle: null,
    // user's patient-id
    EnteredByUserId: '00000000-0000-0000-0000-000000000000',
    Note: '',
    PaymentTypeId: null,
    // Allowed transaction type id's are 2 - Account Payment, 3 - Insurance Payment, 4 - Negative Adjustment.
    TransactionTypeId: 4,
    CreditTransactionDetails: [],
    PaymentTypePromptValue: null,
    // Set default adjustment distribution strategy
    AssignedAdjustmentTypeId: 1,
  };

  beforeEach(
    module('Soar.Patient', function ($provide) {
      referenceDataServiceMock = {
        getData: jasmine.createSpy(),
        entityNames: {
          locations: 'locations',
        },
      };
      $provide.value('referenceDataService', referenceDataServiceMock);

      timeZoneFactoryMock = {
        ConvertDateToMomentTZ: jasmine
          .createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
          .and.callFake(function (date) {
            return moment(date);
          }),
      };
      $provide.value('TimeZoneFactory', timeZoneFactoryMock);

      var userLocation = '{"id": "1234"}';
      sessionStorage.setItem('userLocation', userLocation);
    })
  );

  // function to create controller instance
  function createController() {
    ctrl = controller('CreditTransactionController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      localize: localize,
      PatientServices: patientServices,
      LocationServices: locationServicesMock,
      FeatureFlagService: featureFlagServiceMock,
      FuseFlag: fuseFlagMock,
      SurfaceHelper: surfaceHelper,
      RootHelper: rootHelper,
      StaticData: staticData,
    });
  }

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    scope = $rootScope.$new();
    controller = $controller;
    q = $q;

    referenceDataServiceMock.getData.and.callFake(function () {
      return $q.resolve([
        { LocationId: 1234, Timezone: 'Central Standard Time' },
        { LocationId: 1235, Timezone: 'Mountain Standard Time' },
      ]);
    });

    scope.data = {
      PatientInfo: {
        FirstName: 'First',
        LastName: 'Last',
        MiddleName: 'Middle',
        PreferredName: 'Preferred',
        Suffix: 'Suffix',
        PrefferedDentist: 3000,
        PreferredHygienist: 4000,
        PersonAccount: {
          PersonAccountMember: {
            AccountId: 1,
            AccountMemberId: 2,
          },
        },
      },
      amountFocused: {
        disableApply: true,
      },
      PaymentTypes: mockPaymentTypesList,
      Providers: mockAllProvidersList,
      CreditTransactionDto: mockCreditTransactionDto,
      UnassignedAmount: 0,
      ServiceAndDebitTransactionDtos: [],
      SelectedAdjustmentTypeIndex: 2,
      ErrorFlags: {
        hasError: false,
        providerMissing: false,
      },
      IsTransactionOnEncounter: false,
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error'),
    };

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    //mock for patientServices
    patientServices = {
      CreditTransactions: {
        create: jasmine
          .createSpy('patientServices.CreditTransactions.create')
          .and.returnValue(''),
        creditDistribution: jasmine
          .createSpy('patientServices.CreditTransactions.creditDistribution')
          .and.returnValue(''),
        creditDistributionForAccount: jasmine
          .createSpy(
            'patientServices.CreditTransactions.creditDistributionForAccount'
          )
          .and.returnValue(''),
        creditDistributionForSelectedServiceTransactions: jasmine
          .createSpy(
            'patientServices.CredtiTransactions.creditDistributionForSelectedServiceTransactions'
          )
          .and.returnValue(''),
      },
      ServiceTransactions: {
        getServiceTransactionsByAccountMemberId: jasmine
          .createSpy(
            'patientServices.ServiceTransactions.getServiceTransactionsByAccountMemberId'
          )
          .and.returnValue(''),
      },
    };

    sessionStorage.setItem('userLocation', JSON.stringify(currentLocation));

    //creating controller
    createController();

    //injecting required dependencies
    timeout = $injector.get('$timeout');
    listHelper = $injector.get('ListHelper');

    //angular element mock
    scroll = {
      scrollIntoViewIfNeeded: jasmine.createSpy(),
    };

    data = {
      Id: 5000,
      value: jasmine.createSpy().and.returnValue(1),
      text: jasmine.createSpy().and.returnValue('a'),
      focus: jasmine.createSpy(),
    };

    element = {
      data: jasmine.createSpy().and.returnValue(data),
      focus: jasmine.createSpy(),
      prop: jasmine.createSpy(),
      find: jasmine.createSpy().and.returnValue(data),
      removeClass: jasmine.createSpy(),
      get: jasmine.createSpy().and.returnValue(scroll),
    };
    spyOn(angular, 'element').and.returnValue(element);

    scope.$apply();
  }));

  //controller
  it('CreditTransactionController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('writeOffDetails function->', function () {
    beforeEach(function () {
      scope.data.CreditTransactionDto.IsFeeScheduleWriteOff = true;
      scope.data.IsView = true;
      scope.data.ServiceAndDebitTransactionDtos = mockServiceAndDebitTransactionDtos;
    });

    it('should not set writeOffDetails when is not view', function () {

      scope.data.UnappliedTransaction = {
        CreditTransactionDetails: [
          {
            IsDeleted: true,
            EncounterId: '12345',
            Amount: -60,
          }
        ]
      };

      ctrl.setWriteOffDetails();
      expect(scope.writeOffDetails.length).toEqual(0);
    });

    it('should set writeOffDetails correctly', function () {
      scope.data.UnappliedTransaction = {
        CreditTransactionDetails: [
          {
            IsDeleted: true,
            EncounterId: '12345',
            Amount: -60,
          },
          {
            EncounterId: '00000000-0000-0000-0000-000000000000',
            IsDeleted: false,
            Amount: -30,
            AppliedToServiceTransationId: '00000000-0000-0000-0000-100000000000'
          }
        ]
      };

      ctrl.setWriteOffDetails();
      expect(scope.writeOffDetails.length).toEqual(1);
      expect(scope.writeOffDetails[0].AccountMemberId).toEqual(mockServiceAndDebitTransactionDtos[0].AccountMemberId);
    });
  });

  //isPreferred
  describe('isPreferred function->', function () {
    it('should return false when patientInfo is not available', function () {
      scope.data.PatientInfo = null;
      var result = ctrl.isPreferred({ ProviderId: 1 });

      expect(result).toBe(null);
    });

    it('should return true when passed data is preferred dentist', function () {
      scope.data.PatientInfo = {
        PreferredDentist: 1,
        PreferredHygienist: 2,
      };
      var result = ctrl.isPreferred({ ProviderId: 1 });
      expect(result).toBe(true);
    });

    it('should return true when passed data is preferred hygienist', function () {
      scope.data.PatientInfo = {
        PreferredDentist: 1,
        PreferredHygienist: 2,
      };
      var result = ctrl.isPreferred({ ProviderId: 2 });
      expect(result).toBe(true);
    });
  });

  //providerOnChange
  describe('providerOnChange function ->', function () {
    it('Should not set HasUnappliedAmountAdjusted value to false if IsAdjustmentOnUnappliedAmount is false', function () {
      scope.data.IsAdjustmentOnUnappliedAmount = false;
      scope.providerOnChange();

      expect(scope.data.HasUnappliedAmountAdjusted).not.toEqual(true);
    });
    it('Should not set HasUnappliedAmountAdjusted value to true if IsAdjustmentOnUnappliedAmount is true', function () {
      scope.data.IsAdjustmentOnUnappliedAmount = true;
      scope.providerOnChange();

      expect(scope.data.HasUnappliedAmountAdjusted).toEqual(true);
    });
  });

  //assignmentTypesChange
  describe('assignmentTypesChange function ->', function () {
    it('should handle change event on assignment types input field by setting value when typed input is valid and selected assignment type is Oldest balance first and amount field is not changed', function () {
      var assignmentTypeSelected = {
        AssignmentTypeId: 1,
        AssignmentTypeName: 'Oldest Balance First',
      };
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(
        assignmentTypeSelected
      );
      ctrl.reloadAmount = scope.data.CreditTransactionDto.Amount;
      scope.assignmentTypesChange();

      expect(scope.data.ServiceAndDebitTransactionDtos).toEqual(
        ctrl.reloadServiceAndDebitTransactionDtos
      );
      expect(scope.data.UnassignedAmount).toEqual(ctrl.reloadunassignedAmount);
      expect(scope.data.HasValidationError).toBe(false);
    });

    it('should handle change event on assignment types input field by doing nothing when assignmentTypes are null', function () {
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(null);
      scope.assignmentTypes = null;
      scope.assignmentTypesChange();

      expect(scope.providerMissing).not.toEqual(false);
    });

    it('should call autoDistributeAdjustmentCallSetup to get distribution when typed input is valid and amount field is changed and assignment type is Oldest Balance First', function () {
      var assignmentTypeSelected = {
        AssignmentTypeId: 1,
        AssignmentTypeName: 'Oldest Balance First',
      };
      scope.data.CreditTransactionDto.Amount = 1;
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(
        assignmentTypeSelected
      );
      spyOn(ctrl, 'autoDistributeAdjustmentCallSetup');
      ctrl.reloadAmount = scope.data.CreditTransactionDto.Amount + 1;

      scope.assignmentTypesChange();
      expect(ctrl.autoDistributeAdjustmentCallSetup).toHaveBeenCalled();
      expect(scope.data.HasValidationError).toBe(false);
    });

    it('should call autoDistributeFeeScheduleAdjustment to get distribution when typed input is valid and amount field is changed and assignment type is Oldest Balance First and this is a fee schedule adjustment', function () {
      var assignmentTypeSelected = {
        AssignmentTypeId: 1,
        AssignmentTypeName: 'Oldest Balance First',
      };
      scope.data.CreditTransactionDto.Amount = 1;
      scope.data.IsFeeScheduleAdjustment = true;
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(
        assignmentTypeSelected
      );
      spyOn(ctrl, 'autoDistributeFeeScheduleAdjustment');
      spyOn(ctrl, 'autoDistributeAdjustmentCallSetup');
      ctrl.reloadAmount = scope.data.CreditTransactionDto.Amount + 1;

      scope.assignmentTypesChange();
      expect(ctrl.autoDistributeAdjustmentCallSetup).not.toHaveBeenCalled();
      expect(ctrl.autoDistributeFeeScheduleAdjustment).toHaveBeenCalled();
      expect(scope.data.HasValidationError).toBe(false);
    });

    it('should not call autoDistributeAdjustmentCallSetup to get distribution when typed input is not valid', function () {
      var assignmentTypeSelected = {
        AssignmentTypeId: 1,
        AssignmentTypeName: 'Oldest Balance First',
      };
      scope.data.CreditTransactionDto.Amount = 0;
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(
        assignmentTypeSelected
      );
      spyOn(ctrl, 'autoDistributeAdjustmentCallSetup');
      ctrl.reloadAmount = scope.data.CreditTransactionDto.Amount + 1;

      scope.assignmentTypesChange();
      expect(ctrl.autoDistributeAdjustmentCallSetup).not.toHaveBeenCalled();
      expect(scope.data.HasValidationError).toBe(false);
    });

    it('should handle change event on assignment types input field by calling clearNegativeDistribution when typed input is valid and selected assignment type is Manually and amount field is not changed', function () {
      var assignmentTypeSelected = {
        AssignmentTypeId: 2,
        AssignmentTypeName: 'Manually',
      };
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(
        assignmentTypeSelected
      );
      spyOn(ctrl, 'clearNegativeDistribution');
      scope.assignmentTypesChange();

      expect(ctrl.dataHasChanged).toEqual(true);
      expect(ctrl.clearNegativeDistribution).toHaveBeenCalled();
    });
  });

  //setAssignedAdjustmentType
  describe('setAssignedAdjustmentType function->', function () {
    it('should set AssignedAdjustmentType to 2 when flag is set true and this is not a fee schedule adjustment', function () {
      var distributedTransactionData = { AdjustmentAmount: 10 };
      scope.setAssignedAdjustmentType(distributedTransactionData, true);
      expect(scope.data.CreditTransactionDto.AssignedAdjustmentTypeId).toEqual(
        2
      );
    });

    it('should not set AssignedAdjustmentType to 2 when flag is set true and this is not a fee schedule adjustment', function () {
      scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 1;
      var distributedTransactionData = { AdjustmentAmount: 10 };
      scope.data.IsFeeScheduleAdjustment = true;
      scope.setAssignedAdjustmentType(distributedTransactionData, true);
      expect(scope.data.CreditTransactionDto.AssignedAdjustmentTypeId).toEqual(
        1
      );
    });
  });

  //negativeAdjustmentAmountOnBlur
  describe('negativeAdjustmentAmountOnBlur function->', function () {
    it('should clear variables and flags if amount is 0 and IsEditOperation is false', function () {
      scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 1;
      ctrl.reloadAmount = 1;
      ctrl.reloadunassignedAmount = 1;

      scope.negativeAdjustmentAmountOnBlur();

      expect(ctrl.reloadServiceTransactionDtos).toEqual(
        ctrl.initialServiceTransactionDtos
      );
      expect(ctrl.reloadAmount).toEqual(0);
      expect(ctrl.reloadunassignedAmount).toEqual(0);
    });

    it('should clear variables and flags if amount is null and IsEditOperation is false', function () {
      scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 1;
      ctrl.reloadAmount = 1;
      ctrl.reloadunassignedAmount = 1;
      scope.data.CreditTransactionDto.Amount = null;

      scope.negativeAdjustmentAmountOnBlur();

      expect(ctrl.reloadServiceTransactionDtos).toEqual(
        ctrl.initialServiceTransactionDtos
      );
      expect(ctrl.reloadAmount).toEqual(0);
      expect(ctrl.reloadunassignedAmount).toEqual(0);
    });

    it('should call autoDistributeAdjustmentCallSetup when amount is valid, changed and IsEditOperation is false', function () {
      scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 1;
      ctrl.reloadAmount = 1;
      ctrl.reloadunassignedAmount = 1;
      scope.data.CreditTransactionDto.Amount = 10;
      spyOn(ctrl, 'autoDistributeAdjustmentCallSetup');

      scope.negativeAdjustmentAmountOnBlur();

      expect(ctrl.autoDistributeAdjustmentCallSetup).toHaveBeenCalled();
    });

    it('should not call autoDistributeAdjustmentCallSetup when amount is valid, unchanged and IsEditOperation is false', function () {
      scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 1;
      ctrl.reloadAmount = 10;
      ctrl.reloadunassignedAmount = 1;
      scope.data.CreditTransactionDto.Amount = 10;
      spyOn(ctrl, 'autoDistributeAdjustmentCallSetup');

      scope.negativeAdjustmentAmountOnBlur();

      expect(ctrl.autoDistributeAdjustmentCallSetup).not.toHaveBeenCalled();
    });

    it('should not call autoDistributeAdjustmentCallSetup, when assignedAdjustmentTypeId is 1, amount is null and IsEditOperation is false', function () {
      scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 1;
      spyOn(ctrl, 'clearNegativeDistribution');
      scope.data.CreditTransactionDto.Amount = null;
      ctrl.reloadAmount = 0;
      spyOn(ctrl, 'autoDistributeAdjustmentCallSetup');

      scope.negativeAdjustmentAmountOnBlur();
      expect(ctrl.clearNegativeDistribution).toHaveBeenCalled();
      expect(ctrl.autoDistributeAdjustmentCallSetup).not.toHaveBeenCalled();
    });

    it('should clear and call distribution logic service method, when assignedAdjustmentTypeId is not equal to 1 and IsEditOperation is false', function () {
      scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 2;
      spyOn(ctrl, 'clearNegativeDistribution');

      scope.negativeAdjustmentAmountOnBlur();
      expect(ctrl.clearNegativeDistribution).toHaveBeenCalled();

      expect(
        patientServices.CreditTransactions.creditDistribution
      ).not.toHaveBeenCalled();
    });

    it('should clear flag when AssignedAdjustmentTypeId == 1, amount == 0 IsEditOperation is false', function () {
      scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 1;
      scope.data.CreditTransactionDto.Amount = -1;
      ctrl.reloadAmount = 10;
      spyOn(ctrl, 'clearNegativeDistribution');

      scope.negativeAdjustmentAmountOnBlur();

      expect(scope.data.UnassignedAmount).toEqual(0);
      expect(ctrl.reloadAmount).toEqual(0);
    });

    it('should not call processAmountChange if IsEditOperation is true and CreditTransactionDto amount is equal to initialAmount', function () {
      scope.data.IsEditOperation = true;
      scope.data.CreditTransactionDto.Amount = 1;
      ctrl.initialAmount = 1;
      spyOn(ctrl, 'processAmountChange');

      scope.negativeAdjustmentAmountOnBlur();

      expect(ctrl.processAmountChange).not.toHaveBeenCalled();
    });

    it('should call processAmountChange and set initialAmount as CreditTransactionDto Amount if IsEditOperation is true and CreditTransactionDto amount is not equal to initialAmount', function () {
      scope.data.IsEditOperation = true;
      scope.data.CreditTransactionDto.Amount = 1;
      scope.data.CreditTransactionDto;
      ctrl.initialAmount = 2;
      spyOn(ctrl, 'processAmountChange');

      scope.negativeAdjustmentAmountOnBlur();

      expect(ctrl.processAmountChange).toHaveBeenCalled();
      expect(ctrl.initialAmount).toEqual(
        scope.data.CreditTransactionDto.Amount
      );
    });
  });

  //clearNegativeDistribution
  it('clearNegativeDistribution should clear negative adjustment distribution & set HasValidationError to false', function () {
    scope.data.ServiceAndDebitTransactionDtos = [
      { AdjustmentAmount: 10 },
      { AdjustmentAmount: 20 },
    ];
    scope.data.UnassignedAmount = 30;

    ctrl.clearNegativeDistribution();

    expect(scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount).toBe(
      0
    );
    expect(scope.data.ServiceAndDebitTransactionDtos[1].AdjustmentAmount).toBe(
      0
    );
    expect(scope.data.UnassignedAmount).toBe(0);
    expect(scope.data.HasValidationError).toBe(false);
  });

  //recalculateUnassignedAmount
  it('recalculateUnassignedAmount should re-calculate unassigned amount when assignedAdjustmentTypeId is 2', function () {
    scope.ServiceAndDebitTransactionDtos = [
      { AdjustmentAmount: 10 },
      { AdjustmentAmount: 20 },
    ];
    scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 2;

    scope.recalculateUnassignedAmount({ AdjustmentAmount: 10 });

    expect(scope.data.UnassignedAmount).toBeDefined();
  });

  it('recalculateUnassignedAmount should not re-calculate unassigned amount when this is a fee schedule adjustment', function () {
    scope.ServiceAndDebitTransactionDtos = [
      { AdjustmentAmount: 10.0 },
      { AdjustmentAmount: 20.0 },
    ];
    scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 1;
    scope.data.CreditTransactionDto.Amount = 20.0;
    scope.data.IsFeeScheduleAdjustment = true;

    scope.recalculateUnassignedAmount();

    expect(scope.data.UnassignedAmount).toEqual(0);
    expect(scope.AmountAndServicesMisMatch).toBe(true);
  });

  it('recalculateUnassignedAmount should not re-calculate unassigned amount when assignedAdjustmentTypeId is 1', function () {
    scope.ServiceAndDebitTransactionDtos = [
      { AdjustmentAmount: 10 },
      { AdjustmentAmount: 20 },
    ];
    scope.data.CreditTransactionDto.AssignedAdjustmentTypeId = 1;
    scope.data.UnassignedAmount = undefined;

    scope.recalculateUnassignedAmount({ AdjustmentAmount: 10 });

    expect(scope.data.UnassignedAmount).not.toBeDefined();
  });

  it('recalculateUnassignedAmount should re-calculate unassigned amount when hasAccountMemberChanged is true', function () {
    scope.data.hasAccountMemberChanged = true;
    scope.data.UnappliedTransaction = {};
    scope.data.CreditTransactionDto = mockCreditTransactionDto1;
    scope.data.ServiceAndDebitTransactionDtos = mockServiceAndDebitTransactionDtos;
    scope.data.UnappliedTransaction.UnassignedAmount = 10;
    ctrl.reloadunassignedAmount = 10;
    var distributedTransactionData = { AdjustmentAmount: 10 };
    scope.recalculateUnassignedAmount(distributedTransactionData);
    expect(scope.totalAdjustmentAmount).toEqual(0);
  });

  it('recalculateUnassignedAmount should re-calculate unassigned amount when IsChangingAdjustmentOrPayment is true', function () {
    scope.data.IsChangingAdjustmentOrPayment = true;
    scope.data.UnappliedTransaction = {};
    scope.data.CreditTransactionDto = mockCreditTransactionDto1;
    scope.data.CreditTransactionDto.Amount = 15;
    scope.data.CreditTransactionDto.Balance = 0;

    scope.data.CreditTransactionDto.CreditTransactionDetails[0].Amount = -15;
    var distributedTransactionData = { AdjustmentAmount: 15 };
    scope.data.ServiceAndDebitTransactionDtos = mockServiceAndDebitTransactionDtos;
    ctrl.initialServiceAndDebitTransactionDtos = [
      {
        DebitTransactionId: '10403293-1821-4f97-a2cd-62b28faf76b6',
        AccountMemberId: '5c21b1d0-d612-4db8-ad09-862d839015d0',
        LocationId: 4,
        AdjustmentTypeId: 'cbd804fd-a75a-47b7-8448-894a13b3aa41',
        AdjustmentAmount: '101',
        EncounterId: '00000000-0000-0000-0000-000000000000',
        Amount: 20,
        DateEntered: '2016-02-09T10:14:51.363Z',
        Description: '+ve adjustment',
        EnteredByUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        Note: '',
        TransactionTypeId: 5,
        ProviderUserId: 'ab6ec3e1-2587-46db-80a5-a1badf5fdd30',
        Balance: 20,
        DataTag:
          '{"Timestamp":"2016-02-09T10:14:53.307+00:00","RowVersion":"W/\\"datetime\'2016-02-09T10%3A14%3A53.307Z\'\\""}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2016-02-09T10:14:51.9859001Z',
        AgingDate: '2016-02-09T10:14:51.363Z',
        Fee: '20',
        RecordIndex: '10',
        PatientName: 'Testcase A.',
        UnixTimeStamp: '1454956200',
      },
    ];
    scope.data.ServiceAndDebitTransactionDtos.AdjustmentAmount = 1;
    scope.data.ServiceAndDebitTransactionDtos.Amount = 14;
    scope.data.ServiceAndDebitTransactionDtos.Balance = 15;
    ctrl.reloadunassignedAmount = 19;
    scope.recalculateUnassignedAmount(distributedTransactionData);
    expect(scope.data.HasUnappliedAmountAdjusted).toBe(true);
  });
  it('should set HasUnappliedAmountAdjusted to false if original distribution is applied when IsChangingAdjustmentOrPayment is true', function () {
    // HasUnappliedAmountAdjusted will disable the apply button when false
    scope.data.IsChangingAdjustmentOrPayment = true;
    var distributedTransactionData = { AdjustmentAmount: 15 };
    scope.data.HasUnappliedAmountAdjusted = true;
    scope.data.ServiceAndDebitTransactionDtos = mockServiceAndDebitTransactionDtos;
    ctrl.initialServiceAndDebitTransactionDtos = mockServiceAndDebitTransactionDtos;
    scope.recalculateUnassignedAmount(distributedTransactionData);
    expect(scope.data.HasUnappliedAmountAdjusted).toBe(false);
  });
  it('recalculateUnassignedAmount should throw error when IsChangingAdjustmentOrPayment is true and total distribute amount is greater then credit transaction amount', function () {
    scope.data.IsChangingAdjustmentOrPayment = true;
    scope.data.UnappliedTransaction = {};
    scope.data.CreditTransactionDto = mockCreditTransactionDto1;
    scope.data.CreditTransactionDto.Amount = 15;
    scope.data.CreditTransactionDto.Balance = 0;
    scope.data.CreditTransactionDto.CreditTransactionDetails[0].Amount = -15;
    scope.data.ServiceAndDebitTransactionDtos = mockServiceAndDebitTransactionDtos;
    scope.data.ServiceAndDebitTransactionDtos.AdjustmentAmount = 2;
    scope.totalAdjustmentAmount = 2;
    scope.data.ServiceAndDebitTransactionDtos.Amount = 15;
    scope.data.ServiceAndDebitTransactionDtos.Balance = 15;

    ctrl.initialServiceAndDebitTransactionDtos = [
      {
        DebitTransactionId: '10403293-1821-4f97-a2cd-62b28faf76b6',
        AccountMemberId: '5c21b1d0-d612-4db8-ad09-862d839015d0',
        LocationId: 4,
        AdjustmentTypeId: 'cbd804fd-a75a-47b7-8448-894a13b3aa41',
        AdjustmentAmount: '101',
        EncounterId: '00000000-0000-0000-0000-000000000000',
        Amount: 20,
        DateEntered: '2016-02-09T10:14:51.363Z',
        Description: '+ve adjustment',
        EnteredByUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        Note: '',
        TransactionTypeId: 5,
        ProviderUserId: 'ab6ec3e1-2587-46db-80a5-a1badf5fdd30',
        Balance: 20,
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2016-02-09T10:14:51.9859001Z',
        AgingDate: '2016-02-09T10:14:51.363Z',
        Fee: '20',
        RecordIndex: '10',
        PatientName: 'Testcase A.',
        UnixTimeStamp: '1454956200',
      },
    ];
    var distributedTransactionData = { AdjustmentAmount: 10 };
    ctrl.reloadunassignedAmount = 19;
    scope.recalculateUnassignedAmount(distributedTransactionData);
    expect(scope.throwError).toBe(true);
    expect(scope.data.HasUnappliedAmountAdjusted).toBe(true);
  });

  //autoDistributeAdjustmentCallSetup
  it('should call server to get auto-distribution for selected services inside particular encounter when IsTransactionOnEncounter is false and IsTransactionOnAllPendingEncounters is true', function () {
    ctrl.distributionParams = {};
    scope.data.IsTransactionOnEncounter = false;
    scope.data.IsTransactionOnAllPendingEncounters = true;
    ctrl.autoDistributeAdjustmentCallSetup();

    expect(
      patientServices.CreditTransactions
        .creditDistributionForSelectedServiceTransactions
    ).toHaveBeenCalled();
  });

  //autoDistributeFeeScheduleAdjustment
  it('should redistribute amounts to services and check if amount is too much to distribute', function () {
    scope.data.CreditTransactionDto.Amount = 50;
    scope.data.ServiceAndDebitTransactionDtos = [
      { TotalAdjEstimate: 20 },
      { TotalAdjEstimate: 10 },
      { TotalAdjEstimate: 20 },
    ];
    ctrl.autoDistributeFeeScheduleAdjustment();
    expect(
      scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount
    ).toEqual(20);
    expect(
      scope.data.ServiceAndDebitTransactionDtos[1].AdjustmentAmount
    ).toEqual(10);
    expect(
      scope.data.ServiceAndDebitTransactionDtos[2].AdjustmentAmount
    ).toEqual(20);
    expect(scope.AmountAndServicesMisMatch).toEqual(false);
  });

  it('should redistribute amounts to services and check if amount is too much to distribute', function () {
    scope.data.CreditTransactionDto.Amount = 50;
    scope.data.ServiceAndDebitTransactionDtos = [
      { TotalAdjEstimate: 20 },
      { TotalAdjEstimate: 10 },
      { TotalAdjEstimate: 10 },
    ];
    ctrl.autoDistributeFeeScheduleAdjustment();
    expect(
      scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount
    ).toEqual(20);
    expect(
      scope.data.ServiceAndDebitTransactionDtos[1].AdjustmentAmount
    ).toEqual(10);
    expect(
      scope.data.ServiceAndDebitTransactionDtos[2].AdjustmentAmount
    ).toEqual(10);
    expect(scope.AmountAndServicesMisMatch).toEqual(true);
  });

  //getPatientPortion
  it('should return patient portion as 0 when fee and tax is not present in service transaction', function () {
    var serviceTransaction = {};
    var result = scope.getPatientPortion(serviceTransaction);
    expect(result).toBe(0);
  });

  it('should return patient portion as 52 when fee is 100, tax is 12 and EstInsurance is 60 in service transaction', function () {
    var serviceTransaction = {
      Fee: 100,
      Tax: 12.0,
      InsuranceEstimates: [{ EstInsurance: 60 }],
      TotalEstInsurance: 60,
    };
    var result = scope.getPatientPortion(serviceTransaction);
    expect(result).toBe(52);
  });
  //autoCreditDistributionSuccess
  it('autoCreditDistributionSuccess should set AdjustmentAmount of service transactions if a distribution is made for the service', function () {
    var successResponse = {
      Value: [
        { AppliedToServiceTransationId: 1, Amount: 10 },
        { AppliedToDebitTransactionId: 1, Amount: 10 },
      ],
    };
    scope.serviceTransactionDtos = [{ ServiceTransactionId: 1 }];
    spyOn(listHelper, 'findItemByFieldValue').and.returnValue(
      scope.serviceTransactionDtos[0]
    );

    ctrl.autoCreditDistributionSuccess(successResponse);

    expect(scope.serviceTransactionDtos[0].AdjustmentAmount).toBe(10);
  });

  it('autoCreditDistributionSuccess should not set AdjustmentAmount of service transactions if a distribution is made for the service but service is not found in serviceAndDebitTransactionDtos', function () {
    var successResponse = {
      Value: [
        { AppliedToServiceTransationId: 1, Amount: 10 },
        { AppliedToDebitTransactionId: 1, Amount: 10 },
      ],
    };
    scope.serviceTransactionDtos = [{ ServiceTransactionId: 1 }];
    spyOn(listHelper, 'findItemByFieldValue').and.returnValue(null);

    ctrl.autoCreditDistributionSuccess(successResponse);

    expect(scope.serviceTransactionDtos[0].AdjustmentAmount).toBeUndefined();
  });

  it('autoCreditDistributionSuccess should set unassigned amount if a distribution is not applied to any service', function () {
    var successResponse = {
      Value: [{ AppliedToServiceTransationId: null, Amount: 10 }],
    };
    scope.serviceTransactionDtos = [{ ServiceTransactionId: 1 }];

    ctrl.autoCreditDistributionSuccess(successResponse);

    expect(scope.data.UnassignedAmount).toBe(10);
  });

  //autoCreditDistributionFailure
  it('autoCreditDistributionFailure should call toastrFactory.error and clear negative adjustment distribution', function () {
    spyOn(ctrl, 'clearNegativeDistribution');

    ctrl.autoCreditDistributionFailure();

    expect(toastrFactory.error).toHaveBeenCalled();
    expect(ctrl.clearNegativeDistribution).toHaveBeenCalled();
    expect(scope.data.CreditTransactionDto.Amount).toBe(0);
  });

  //setPaymentDescription
  describe('setPaymentDescription function->', function () {
    it('setPaymentDescription should show prompt and set creditTransactionDto.PromptTitle to value if paymentTypePromptValue provided', function () {
      var value = 'Prompt Value';
      ctrl.setPaymentDescription(value);
      expect(scope.data.CreditTransactionDto.PromptTitle).toEqual(value);
      expect(scope.hidePrompt).toBe(false);
    });

    it('setPaymentDescription should hide prompt and set creditTransactionDto.PromptTitle to value if paymentTypePromptValue provided', function () {
      ctrl.setPaymentDescription(null);
      expect(scope.data.CreditTransactionDto.PromptTitle).toEqual(null);
      expect(scope.hidePrompt).toBe(true);
    });
  });

  //paymentTypeOnChange
  describe('paymentTypeOnChange function->', function () {
    beforeEach(function () {
      scope.CurrencyTypes = { Cash: 1, Check: 2, CreditCard: 3, DebitCard: 4 };
    });

    it('paymentTypeOnChange should call setPaymentDescription if payment type exists', function () {
      scope.paymentTypes = [
        { Description: 'Description Text', Prompt: 'Prompt Text' },
      ];
      spyOn(ctrl, 'setPaymentDescription');
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue({
        Description: 'Description Text',
        Prompt: 'Prompt Text',
      });

      scope.paymentTypeOnChange();
      expect(ctrl.setPaymentDescription).toHaveBeenCalledWith('Prompt Text');
    });

    it('paymentTypeOnChange should call setPaymentDescription and set creditTransactionDto.PaymentTypeId to null if payment type does not exists', function () {
      scope.paymentTypes = [
        { Description: 'Description Text', Prompt: 'Prompt Text' },
      ];
      spyOn(ctrl, 'setPaymentDescription');
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(null);

      scope.paymentTypeOnChange();
      expect(scope.showPaymentCardReaders).toBe(false);
      expect(ctrl.setPaymentDescription).toHaveBeenCalledWith(null);
    });

    it('paymentTypeOnChange should call setPaymentDescription and set showPaymentCardReaders if selected credit card payment type exists and there are card readers', function () {
      scope.paymentTypes = [
        { Description: 'Description Text', Prompt: 'Prompt Text' },
      ];
      scope.cardReaders = [
        { DeviceFriendlyName: 'Payment card reader', PartnerDeviceId: 1 },
      ];
      ctrl.showPaymentProvider = true;
      spyOn(ctrl, 'setPaymentDescription');
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue({         
        Description: 'Description Text',
        Prompt: 'Prompt Text 1',
        CurrencyType: scope.CurrencyTypes.CreditCard
      });

      scope.paymentTypeOnChange();
      expect(ctrl.setPaymentDescription).toHaveBeenCalledWith('Prompt Text 1');
    });

    it('paymentTypeOnChange should call setPaymentDescription and set showPaymentCardReaders if selected debit card payment type exists and there are card readers', function () {
      scope.paymentTypes = [
        { Description: 'Description Text', Prompt: 'Prompt Text' },
      ];
      scope.cardReaders = [
        { DeviceFriendlyName: 'Payment card reader', PartnerDeviceId: 1 },
      ];
      ctrl.showPaymentProvider = true;
      spyOn(ctrl, 'setPaymentDescription');
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue({         
        Description: 'Description Text',
        Prompt: 'Prompt Text 2',
        CurrencyType: scope.CurrencyTypes.DebitCard
      });

      scope.paymentTypeOnChange();
      expect(ctrl.setPaymentDescription).toHaveBeenCalledWith('Prompt Text 2');
    });
  });

  //scrollServiceAmountInputIntoView
  describe('scrollServiceAmountInputIntoView  function->', function () {
    it("should handle scroll functionality on service-transactions list's amount input field ", function () {
      scope.scrollServiceAmountInputIntoView(1);
      expect(angular.element).toHaveBeenCalled();
    });
  });

  //Watcher for data.UnappliedTransaction.UnassignedAmount
  describe('watcher data.UnappliedTransaction.UnassignedAmount ->', function () {
    it('should change value of UnassignedAmount, reloadunassignedAmount and totalAdjustmentAmount when unassignment of unappliedtransactiono is changed', function () {
      scope.data.UnappliedTransaction = {};
      scope.data.UnappliedTransaction.UnassignedAmount = 10;
      scope.data.ServiceAndDebitTransactionDtos = mockServiceAndDebitTransactionDtos;

      scope.$apply();

      expect(scope.data.UnassignedAmount).toEqual(
        scope.data.UnappliedTransaction.UnassignedAmount
      );
      expect(ctrl.reloadunassignedAmount).toEqual(
        scope.data.UnappliedTransaction.UnassignedAmount
      );

      scope.data.UnappliedTransaction.UnassignedAmount = 11;
      scope.data.ServiceAndDebitTransactionDtos = mockServiceAndDebitTransactionDtos;

      scope.$apply();

      expect(scope.data.UnassignedAmount).toEqual(
        scope.data.UnappliedTransaction.UnassignedAmount
      );
      expect(ctrl.reloadunassignedAmount).toEqual(
        scope.data.UnappliedTransaction.UnassignedAmount
      );
    });
  });

  //getProviderName
  describe('getProviderName function ->', function () {
    it('getProviderName should call findItemByFieldValue function of listHelper having valid provider found', function () {
      var provider = { UserCode: 'test' };
      var providerUserId = 2;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(provider);

      var result = scope.getProviderName(providerUserId);

      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
      expect(result).toEqual(provider.UserCode);
    });

    it('getProviderName should call findItemByFieldValue function of listHelper with provider not found', function () {
      var providerUserId = 2;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);

      var result = scope.getProviderName(providerUserId);

      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
      expect(result).toEqual('');
    });
  });

  describe('ctrl.setServiceArea function ->', function () {
    it('should set the area property to surface if one is present', function () {
      scope.data.ServiceAndDebitTransactionDtos = [{ Surface: 'M' }];
      ctrl.setServiceArea();

      expect(scope.data.ServiceAndDebitTransactionDtos[0].$$area).toBeDefined();
      expect(scope.data.ServiceAndDebitTransactionDtos[0].$$area).toBe('M');
    });

    it('should set the area property to surface if more than one surface is present', function () {
      scope.data.ServiceAndDebitTransactionDtos = [{ Surface: 'M,B' }];
      ctrl.setServiceArea();

      expect(scope.data.ServiceAndDebitTransactionDtos[0].$$area).toBeDefined();
      expect(scope.data.ServiceAndDebitTransactionDtos[0].$$area).toBe('MB');
    });

    it('should set the area property to surface if one is present and SurfaceSummaryInfo is set', function () {
      scope.data.ServiceAndDebitTransactionDtos = [
        { Surface: 'M', SurfaceSummaryInfo: 'MBF5' },
      ];
      ctrl.setServiceArea();

      expect(scope.data.ServiceAndDebitTransactionDtos[0].$$area).toBeDefined();
      expect(scope.data.ServiceAndDebitTransactionDtos[0].$$area).toBe('MBF5');
    });

    it('should set the area property to root if one is present', function () {
      scope.data.ServiceAndDebitTransactionDtos = [{ Roots: 'L,R,D' }];
      ctrl.setServiceArea(scope.data.ServiceAndDebitTransactionDtos[0]);

      expect(scope.data.ServiceAndDebitTransactionDtos[0].$$area).toBe('LRD');
    });

    it('should set the area property to root if one is present and RootSummaryInfo is set', function () {
      scope.data.ServiceAndDebitTransactionDtos = [
        { Roots: 'M', RootSummaryInfo: 'ABC' },
      ];
      ctrl.setServiceArea();

      expect(scope.data.ServiceAndDebitTransactionDtos[0].$$area).toBeDefined();
      expect(scope.data.ServiceAndDebitTransactionDtos[0].$$area).toBe('ABC');
    });

    it('should set the area property to empty if no root or surface is present', function () {
      scope.data.ServiceAndDebitTransactionDtos = [{ Root: '' }];
      ctrl.setServiceArea();

      expect(scope.data.ServiceAndDebitTransactionDtos[0].$$area).toBeDefined();
      expect(scope.data.ServiceAndDebitTransactionDtos[0].$$area).toBe('');
    });
  });

  //validateServiceCodeSurface function test
  describe('setServiceSurfaceInfo function --> ', function () {
    var serviceTransaction = {};

    it('should return false when serviceTransaction is undefined', function () {
      var returnValue = ctrl.setServiceSurfaceInfo(undefined);

      expect(returnValue).toBe(undefined);
    });

    it('should return false when serviceTransaction.Tooth is undefined', function () {
      serviceTransaction = { Tooth: undefined };

      var returnValue = ctrl.setServiceSurfaceInfo(serviceTransaction);

      expect(returnValue).toBe('');
    });

    it('should return correct SurfaceSummaryInfo when serviceTransaction.Tooth is valid and serviceTransaction.Surface is valid', function () {
      serviceTransaction = { Tooth: '1', Surface: 'M' };

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ USNumber: '1', ToothId: 1 });

      var returnValue = ctrl.setServiceSurfaceInfo(serviceTransaction);

      expect(returnValue).toBe('M');
    });

    it('should return correct SurfaceSummaryInfo when serviceTransaction.Tooth is valid and serviceTransaction.Surface is valid with more than one surface', function () {
      serviceTransaction = { Tooth: '1', Surface: 'M,B' };

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ USNumber: '1', ToothId: 1 });

      var returnValue = ctrl.setServiceSurfaceInfo(serviceTransaction);

      expect(returnValue).toBe('MB');
    });
  });

  // NOTE new tests for specific behavior for bug 464228
  // IsChangingAdjustmentOrPayment indicates Change Distribution
  describe('recalculateUnassignedAmount where scope.data.IsChangingAdjustmentOrPayment is true ->', function () {
    var distributedTransactionData;
    beforeEach(function () {
      scope.data = {
        ServiceAndDebitTransactionDtos: [
          {
            AdjustmentAmount: 50,
            Amount: 50,
            TotalEstInsurance: 0,
            TotalAdjEstimate: 0,
            TotalInsurancePaidAmount: 0,
            AdjustmentTypeId: '1234',
          },
          {
            AdjustmentAmount: 50,
            Amount: 50,
            TotalEstInsurance: 0,
            TotalAdjEstimate: 0,
            TotalInsurancePaidAmount: 0,
            AdjustmentTypeId: '1234',
          },
          {
            AdjustmentAmount: 50,
            Amount: 50,
            TotalEstInsurance: 0,
            TotalAdjEstimate: 0,
            TotalInsurancePaidAmount: 0,
            AdjustmentTypeId: '1237',
          },
        ],
        CreditTransactionDto: { AssignedAdjustmentTypeId: 1 },
        IsChangingAdjustmentOrPayment: true,
        HasValidationError: false,
      };
      distributedTransactionData = { AdjustmentAmount: 10 };
    });

    it(
      'recalculateUnassignedAmount set scope.data.HasValidationError to true if ' +
        'any service.AdjustmentAmount > service.Balance',
      function () {
        scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount = 26;
        scope.data.ServiceAndDebitTransactionDtos[0].Balance = 25;
        scope.recalculateUnassignedAmount(distributedTransactionData);
        expect(scope.data.HasValidationError).toBe(true);
      }
    );

    it(
      'recalculateUnassignedAmount set scope.data.HasValidationError to false if ' +
        'all service.AdjustmentAmount < service.Balance' +
        'and scope.data.HasValidationError is false',
      function () {
        scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount = 25;
        scope.data.ServiceAndDebitTransactionDtos[0].Balance = 25;
        scope.recalculateUnassignedAmount(distributedTransactionData);
        expect(scope.data.HasValidationError).toBe(false);
      }
    );

    it(
      'recalculateUnassignedAmount set scope.data.HasValidationError to true if ' +
        'any service.AdjustmentAmount > service.TotalUnpaidBalance',
      function () {
        scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount = 26;
        scope.data.ServiceAndDebitTransactionDtos[0].TotalUnpaidBalance = 25;
        scope.recalculateUnassignedAmount(distributedTransactionData);
        expect(scope.data.HasValidationError).toBe(true);
      }
    );

    it(
      'recalculateUnassignedAmount set scope.data.HasValidationError to false if ' +
        'all service.AdjustmentAmount < service.TotalUnpaidBalance' +
        'and scope.data.HasValidationError is false',
      function () {
        scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount = 25;
        scope.data.ServiceAndDebitTransactionDtos[0].TotalUnpaidBalance = 25;
        scope.recalculateUnassignedAmount(distributedTransactionData);
        expect(scope.data.HasValidationError).toBe(false);
      }
    );

    it(
      'recalculateUnassignedAmount set scope.data.HasValidationError to true if ' +
        'any service.AdjustmentAmount > service.Balance',
      function () {
        scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount = 26;
        scope.data.ServiceAndDebitTransactionDtos[0].Balance = 25;
        scope.recalculateUnassignedAmount(distributedTransactionData);
        expect(scope.data.HasValidationError).toBe(true);
      }
    );

    it(
      'recalculateUnassignedAmount set scope.data.HasValidationError to false if ' +
        'all service.AdjustmentAmount < service.Balance' +
        'and scope.data.HasValidationError is false',
      function () {
        scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount = 25;
        scope.data.ServiceAndDebitTransactionDtos[0].Balance = 25;
        scope.recalculateUnassignedAmount(distributedTransactionData);
        expect(scope.data.HasValidationError).toBe(false);
      }
    );

    it("recalculateUnassignedAmount should leave scope.data.HasValidationError as true if another service's transaction.AdjustmentAmount is less than or equal to transaction.Balance", function () {
      scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount = 26;
      scope.data.ServiceAndDebitTransactionDtos[0].Balance = 25;
      scope.data.HasValidationError = true;

      scope.data.ServiceAndDebitTransactionDtos[1].AdjustmentAmount = 25;
      scope.data.ServiceAndDebitTransactionDtos[1].Balance = 25;
      scope.recalculateUnassignedAmount(distributedTransactionData);
      expect(scope.data.HasValidationError).toBe(true);
    });
  });

  describe('recalculateUnassignedAmount when scope.data.IsAdjustmentOnUnappliedAmount is true ->', function () {
    var distributedTransactionData;
    beforeEach(function () {
      distributedTransactionData = {
        AdjustmentAmount: 10,
        IsForClosingClaim: true,
        IsFeeScheduleAdjustment: false,
        TotalUnpaidBalance: 80.0,
      };
      scope.data = {
        IsForClosingClaim: false,
        UnappliedTransaction: { UnassignedAmount: 90 },
        IsFeeScheduleAdjustment: false,
        IsAdjustmentOnUnappliedAmount: true,
        HasValidationError: false,
        ServiceAndDebitTransactionDtos: [
          {
            AdjustmentAmount: 50,
            TotalUnpaidBalance: 50,
            AdjustmentTypeId: '1234',
            TransactionTypeId: 5,
            Balance: 45,
          },
          {
            AdjustmentAmount: 50,
            TotalUnpaidBalance: 50,
            AdjustmentTypeId: '1234',
          },
          {
            AdjustmentAmount: 50,
            TotalUnpaidBalance: 50,
            AdjustmentTypeId: '1237',
          },
        ],
        CreditTransactionDto: { AssignedAdjustmentTypeId: 1 },
        IsChangingAdjustmentOrPayment: false,
      };
    });

    it('should set scope.data.HasValidationError to true if this is for DebitTransaction and transaction.AdjustmentAmount is more than transaction.Balance', function () {
      distributedTransactionData.IsForClosingClaim = false;
      scope.data.ServiceAndDebitTransactionDtos = [
        {
          AdjustmentAmount: 50,
          TotalUnpaidBalance: 50,
          AdjustmentTypeId: '1234',
          TransactionTypeId: 5,
          Balance: 45,
        },
        {
          AdjustmentAmount: 50,
          TotalUnpaidBalance: 50,
          AdjustmentTypeId: '1234',
        },
        {
          AdjustmentAmount: 50,
          TotalUnpaidBalance: 50,
          AdjustmentTypeId: '1237',
        },
      ];
      var count = 0;
      scope.recalculateUnassignedAmount(distributedTransactionData);
      scope.data.ServiceAndDebitTransactionDtos.forEach(function (transaction) {
        if (
          transaction.AdjustmentAmount > transaction.Balance &&
          transaction.TransactionTypeId === 5
        ) {
          expect(transaction.AdjustmentMoreThanBalanceError).toBe(true);
          expect(scope.data.HasValidationError).toBe(true);
          count += 1;
        }
      });
      expect(count).toEqual(1);
    });

    it(
      'should not set scope.data.HasValidationError to true if ' +
        'this is for DebitTransaction and transaction.AdjustmentAmount is less than or equal transaction.Balance',
      function () {
        distributedTransactionData.IsForClosingClaim = false;
        var count = 0;
        scope.data.ServiceAndDebitTransactionDtos = [
          {
            AdjustmentAmount: 45,
            TotalUnpaidBalance: 50,
            AdjustmentTypeId: '1234',
            TransactionTypeId: 5,
            Balance: 45,
          },
          {
            AdjustmentAmount: 50,
            TotalUnpaidBalance: 50,
            AdjustmentTypeId: '1234',
          },
          {
            AdjustmentAmount: 50,
            TotalUnpaidBalance: 50,
            AdjustmentTypeId: '1237',
          },
        ];
        scope.recalculateUnassignedAmount(distributedTransactionData);
        scope.data.ServiceAndDebitTransactionDtos.forEach(function (
          transaction
        ) {
          if (
            transaction.AdjustmentAmount >= transaction.Balance &&
            transaction.TransactionTypeId === 5
          ) {
            expect(transaction.AdjustmentMoreThanBalanceError).toBe(false);
            expect(scope.data.HasValidationError).toBe(false);
            count += 1;
          }
        });
        expect(count).toEqual(1);
      }
    );
  });

  describe('recalculateUnassignedAmount when distribution IsForClosingClaim ->', function () {
    var distributedTransactionData;
    beforeEach(function () {
      distributedTransactionData = {
        AdjustmentAmount: 10,
        IsForClosingClaim: true,
        IsFeeScheduleAdjustment: false,
        TotalUnpaidBalance: 80.0,
      };
      spyOn(ctrl, 'validateDistributionForClosedClaim');
      scope.data.IsFeeScheduleAdjustment = false;
    });

    it('should call validateDistribution if distributedTransactionData.IsForClosingClaim is true', function () {
      scope.recalculateUnassignedAmount(distributedTransactionData);
      expect(ctrl.validateDistributionForClosedClaim).toHaveBeenCalled();
    });

    it('should not call validateDistribution if distributedTransactionData.IsForClosingClaim is false', function () {
      distributedTransactionData.IsForClosingClaim = false;
      scope.recalculateUnassignedAmount(distributedTransactionData);
      expect(ctrl.validateDistributionForClosedClaim).not.toHaveBeenCalled();
    });
  });

  describe('validateDistributionForClosedClaim  ->', function () {
    beforeEach(function () {
      scope.totalAdjustmentAmount = 100;
      scope.data = {
        ServiceAndDebitTransactionDtos: [
          {
            AdjustmentAmount: 50,
            TotalUnpaidBalance: 50,
            AdjustmentTypeId: '1234',
          },
          {
            AdjustmentAmount: 50,
            TotalUnpaidBalance: 50,
            AdjustmentTypeId: '1234',
          },
          {
            AdjustmentAmount: 50,
            TotalUnpaidBalance: 50,
            AdjustmentTypeId: '1237',
          },
        ],
        CreditTransactionDto: { AssignedAdjustmentTypeId: 1 },
        IsChangingAdjustmentOrPayment: true,
        HasValidationError: false,
      };
    });

    it('should set scope.data.HasValidationError to true if scope.totalAdjustmentAmount greater than scope.data.CreditTransactionDto.Amount', function () {
      scope.totalAdjustmentAmount = 100;
      scope.data.CreditTransactionDto.Amount = 50;
      ctrl.validateDistributionForClosedClaim();
      expect(scope.data.HasValidationError).toBe(true);
    });

    it(
      'should set scope.data.HasValidationError to false if scope.totalAdjustmentAmount is not greater than scope.data.CreditTransactionDto.Amount' +
        'and no scope.data.ServiceTransactionDtos have AdjustmentAmount more than TotalUnpaidBalance',
      function () {
        scope.totalAdjustmentAmount = 100;
        scope.data.CreditTransactionDto.Amount = 100;
        ctrl.validateDistributionForClosedClaim();
        expect(scope.data.HasValidationError).toBe(false);
      }
    );

    it(
      'should set scope.data.HasValidationError to true if scope.totalAdjustmentAmount is not greater than scope.data.CreditTransactionDto.Amount' +
        'but at least one scope.data.ServiceTransactionDtos have AdjustmentAmount more than TotalUnpaidBalance',
      function () {
        scope.totalAdjustmentAmount = 100;
        scope.data.CreditTransactionDto.Amount = 100;
        scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount = 75.0;
        ctrl.validateDistributionForClosedClaim();
        expect(scope.data.HasValidationError).toBe(true);
      }
    );

    it(
      'should set scope.data.service.HasValidationError to true if scope.totalAdjustmentAmount is not greater than scope.data.CreditTransactionDto.Amount' +
        'but at least one scope.data.ServiceTransactionDtos have AdjustmentAmount more than TotalUnpaidBalance',
      function () {
        scope.totalAdjustmentAmount = 100;
        scope.data.CreditTransactionDto.Amount = 100;
        scope.data.ServiceAndDebitTransactionDtos[0].AdjustmentAmount = 75.0;
        ctrl.validateDistributionForClosedClaim();
        expect(
          scope.data.ServiceAndDebitTransactionDtos[0].HasValidationError
        ).toBe(true);
        expect(
          scope.data.ServiceAndDebitTransactionDtos[0].ValidationErrorMessage
        ).toBe('Cannot assign more than the charge / allowed amount.');
      }
    );
  });

  describe('ctrl.loadPaymentTypes ->', function () {
    beforeEach(function () {
      scope.data = { PaymentTypes: [] };
      scope.data.PaymentTypes = [
        {
          PaymentTypeId: '1234',
          IsSystemType: false,
          Description: 'PaymentType1',
          PaymentTypeCategory: 1,
        },
        {
          PaymentTypeId: '2345',
          IsSystemType: false,
          Description: 'PaymentType4',
          PaymentTypeCategory: 1,
        },
        {
          PaymentTypeId: '3456',
          IsSystemType: false,
          Description: 'PaymentType2',
          PaymentTypeCategory: 1,
        },
        {
          PaymentTypeId: '4567',
          IsSystemType: true,
          Description: 'Vendor Payment',
          PaymentTypeCategory: 1,
        },
        {
          PaymentTypeId: '5678',
          IsSystemType: true,
          Description: 'PaymentType5',
          PaymentTypeCategory: 2,
        },
      ];
    });

    it('should filter list to remove Vendor Payment from paymentTypes list ', function () {
      scope.paymentTypes = ctrl.loadPaymentTypes(scope.data.PaymentTypes);
      var vendorPaymentType = scope.paymentTypes.find(
        paymentType => paymentType.Description === 'Vendor Payment'
      );
      expect(vendorPaymentType).toBe(undefined);
    });

    it('should sort paymentTypes list ', function () {
      scope.paymentTypes = ctrl.loadPaymentTypes(scope.data.PaymentTypes);
      expect(scope.paymentTypes[0].Description).toBe('PaymentType1');
      expect(scope.paymentTypes[1].Description).toBe('PaymentType2');
      expect(scope.paymentTypes[2].Description).toBe('PaymentType4');
    });

    it('should filter list to remove PaymentCategory 2 payment types ', function () {
      scope.paymentTypes = ctrl.loadPaymentTypes(scope.data.PaymentTypes);
      var insurancePaymentType = scope.paymentTypes.find(
        paymentType => paymentType.PaymentTypeCategory === 2
      );
      expect(insurancePaymentType).toBe(undefined);
    });

    it('should return empty list if paymentTypes is null or undefined ', function () {
      scope.data = {};
      scope.paymentTypes = ctrl.loadPaymentTypes(scope.data.PaymentTypes);
      expect(scope.paymentTypes).toEqual([]);
    });
  });

  describe('ctrl.loadPaymentDevices ->', function () {
    beforeEach(function () {
      let mockPaymentDevices = [
        { PartnerDeviceId: 1, DeviceFriendlyName: 'Payment Card Reader 1' }
      ];
      locationServicesMock.getPaymentDevicesByLocationAsync = jasmine.createSpy().and.returnValue({
        $promise: { then: function (callback) {
            callback({ Value: mockPaymentDevices });
          },
        }
      });
    });

    it('should not get payment devices when location payment gateway is not enabled', function () {
      ctrl.showPaymentProvider = true;
      ctrl.loadPaymentDevices({ LocationId: 1, IsPaymentGatewayEnabled: false, PaymentProvider: scope.PaymentProviders.TransactionsUI });

      expect(locationServicesMock.getPaymentDevicesByLocationAsync).not.toHaveBeenCalled();
      expect(ctrl.showPaymentProvider).toBe(false);
    });

    it('should not get payment devices when location payment provider not GPI', function () {
      ctrl.showPaymentProvider = true;
      ctrl.loadPaymentDevices({ LocationId: 1, IsPaymentGatewayEnabled: true, PaymentProvider: scope.PaymentProviders.OpOpenEdge });

      expect(locationServicesMock.getPaymentDevicesByLocationAsync).not.toHaveBeenCalled();
      expect(ctrl.showPaymentProvider).toBe(false);
    });

    it('should return card readers when location payment gateway is on and provider is GPI', function () {
      const location = { LocationId: 1, IsPaymentGatewayEnabled: true, PaymentProvider: scope.PaymentProviders.TransactionsUI };
      ctrl.showPaymentProvider = true;
      ctrl.loadPaymentDevices(location);

      expect(scope.cardReaders.length).toBe(1);
    });
  });

  describe('watcher for showPaymentCardReaders ->', function () {
    it('should reset selected card reader when showPaymentCardReaders is switched off from on', function () {
      scope.selectedCardReader = 1001;
      scope.showPaymentCardReaders = true;
      scope.$apply();
      scope.paymentTypes = [
        { Description: 'Description Text', Prompt: 'Prompt Text' },
      ];
      scope.CurrencyTypes = { Check: 2 };
      spyOn(ctrl, 'setPaymentDescription');
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue({         
        Description: 'Description Text',
        Prompt: 'Prompt Text',
        CurrencyType: scope.CurrencyTypes.Check
      });

      scope.paymentTypeOnChange();
      scope.$apply();

      expect(ctrl.setPaymentDescription).toHaveBeenCalledWith('Prompt Text');
      expect(scope.selectedCardReader).toBeNull();
    });
  });

  describe('preselectCardReaders ->', function () {

    it('should preselect card reader if it is the only one available', function () {
      scope.showPaymentCardReaders = true;
      scope.cardReaders = [
        { DeviceFriendlyName: 'Payment card reader', PartnerDeviceId: 1 },
      ];
      ctrl.preselectCardReaders();
      expect(scope.selectedCardReader).toBe(1);
    });

    it('should not preselect card reader if there are multiple card readers available', function () {
      scope.showPaymentCardReaders = true;
      scope.cardReaders = [
        { DeviceFriendlyName: 'Payment card reader', PartnerDeviceId: 1 },
        { DeviceFriendlyName: 'Payment card reader 2', PartnerDeviceId: 2 },
      ];
      ctrl.preselectCardReaders();
      expect(scope.selectedCardReader).toBeNull();
    });

    it('should not preselect card reader if does not show payment card readers', function () {
      scope.showPaymentCardReaders = false;
      scope.cardReaders = [
        { DeviceFriendlyName: 'Payment card reader', PartnerDeviceId: 1 },
        { DeviceFriendlyName: 'Payment card reader 2', PartnerDeviceId: 2 },
      ];
      ctrl.preselectCardReaders();
      expect(scope.selectedCardReader).toBeNull();
    });
  });

  describe('ctrl.loadCurrencyTypes ->', function () {
    it('should load currency types when data is in correct format', function () {

      ctrl.loadCurrencyTypes(currencyTypes);

      expect(scope.CurrencyTypes.Cash).toBe(1);
      expect(scope.CurrencyTypes.Check).toBe(2);
      expect(scope.CurrencyTypes.CreditCard).toBe(3);
      expect(scope.CurrencyTypes.DebitCard).toBe(4);
      expect(scope.CurrencyTypes.Other).toBe(5);
    });
  });
});
