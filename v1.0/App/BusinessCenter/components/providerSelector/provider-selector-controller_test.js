describe('Controller: ProviderSelectorController', function () {
  var ctrl, scope, patientLandingFactory, referenceDataService;
  var locationService, timeout, rootScope, showOnScheduleFactory;

  // list returned from preferredProviders filter
  var mockPreferredProvidersList = [
    {
      ProviderId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
      UserId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
      Name: 'Bob Jones',
      IsPreferred: false,
      UserLocationSetup: [{ LocationId: 2, ProviderTypeId: 1 }],
    },
    {
      ProviderId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
      UserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
      Name: 'Sid Jones',
      IsPreferred: false,
      UserLocationSetup: [{ LocationId: 2, ProviderTypeId: 1 }],
    },
    {
      ProviderId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
      UserId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
      Name: 'Larry Jones',
      IsPreferred: false,
      UserLocationSetup: [{ LocationId: 2, ProviderTypeId: 3 }],
    },
    {
      ProviderId: 'eedf5827-6735-4832-9d20-99758df70a8b',
      UserId: 'eedf5827-6735-4832-9d20-99758df70a8b',
      Name: 'Pat Jones',
      IsPreferred: false,
      UserLocationSetup: [{ LocationId: 2, ProviderTypeId: 1 }],
    },
    {
      ProviderId: '517ce215-b71b-408f-8b20-62a4c1386f77',
      UserId: '517ce215-b71b-408f-8b20-62a4c1386f77',
      Name: 'Sylvia Jones',
      IsPreferred: false,
      UserLocationSetup: [{ LocationId: 2, ProviderTypeId: 2 }],
    },
  ];

  var mockProviderList = [
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

  var currentLocation = { id: 2 };

  //

  var providersWithLocation2 = [];
  var providersWithLocation3 = [];
  beforeEach(function () {
    for (let index = 0; index < mockProviderList.length; index++) {
      mockProviderList[index].Locations = [];
      // add location 1 to all
      var userLocationSetup = {
        UserId: mockProviderList[index].UserId,
        IsActive: true,
        LocationId: 1,
        ProviderTypeId: 1,
        ProviderOnClaimsRelationship: 1,
        ProviderOnClaimsId: null,
        Color: '#7f7f7f',
        ProviderQualifierType: 2,
      };
      mockProviderList[index].Locations.push(userLocationSetup);
      if (index in [1, 2, 3, 4, 9, 10]) {
        // add location 2
        userLocationSetup = {
          UserId: mockProviderList[index].UserId,
          IsActive: true,
          LocationId: 2,
          ProviderTypeId: 2,
          ProviderOnClaimsRelationship: 1,
          ProviderOnClaimsId: null,
          Color: '#7f7f7f',
          ProviderQualifierType: 1,
        };
        mockProviderList[index].Locations.push(userLocationSetup);
        providersWithLocation2.push(mockProviderList[index]);
      }
      if (index in [5, 6, 7, 8]) {
        // add location 3
        userLocationSetup = {
          UserId: mockProviderList[index].UserId,
          IsActive: true,
          LocationId: 3,
          ProviderTypeId: 2,
          ProviderOnClaimsRelationship: 1,
          ProviderOnClaimsId: null,
          Color: '#7f7f7f',
          ProviderQualifierType: 1,
        };
        mockProviderList[index].Locations.push(userLocationSetup);
        providersWithLocation3.push(mockProviderList[index]);
      }
    }
  });

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      locationService = {
        getCurrentLocation: jasmine
          .createSpy()
          .and.returnValue(currentLocation),
      };
      $provide.value('locationService', locationService);

      // UsersFactory provider
      patientLandingFactory = {
        setPreferredProvider: jasmine.createSpy(),
      };
      $provide.value('PatientLandingFactory', patientLandingFactory);

      showOnScheduleFactory = {};
      $provide.value('ProviderShowOnScheduleFactory', showOnScheduleFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $timeout) {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    timeout = $timeout;

    referenceDataService = {
      get: jasmine
        .createSpy('referenceDataService.get')
        .and.returnValue(mockProviderList),
      entityNames: {},
    };

    ctrl = $controller('ProviderSelectorController', {
      $scope: scope,
      referenceDataService: referenceDataService,
    });
  }));

  describe('ctrl.addDynamicColumnsToProviders function ->', function () {
    var allProviderList;
    beforeEach(function () {
      allProviderList = _.cloneDeep(mockProviderList);
    });

    it('should add FullName, Name, and ProviderId to list if not there', function () {
      allProviderList[0].Name = '';
      allProviderList[0].FullName = '';
      allProviderList[0].ProviderId = '';
      allProviderList[0].FirstName = 'Bob';
      allProviderList[0].LastName = 'Smith';
      allProviderList[0].UserId = '1234';
      ctrl.addDynamicColumnsToProviders(allProviderList);
      allProviderList[0].Name = 'Bob Smith';
      allProviderList[0].FullName = 'Bob Smith';
      allProviderList[0].ProviderId = '1234';
    });

    it('should not add FullName, Name, and ProviderId to list if already there', function () {
      allProviderList[0].Name = 'Larry David';
      allProviderList[0].FullName = 'Larry David';
      allProviderList[0].ProviderId = '12345';
      allProviderList[0].FirstName = 'Bob';
      allProviderList[0].LastName = 'Smith';
      allProviderList[0].UserId = '1234';
      ctrl.addDynamicColumnsToProviders(allProviderList);
      allProviderList[0].Name = 'Larry David';
      allProviderList[0].FullName = 'Larry David';
      allProviderList[0].ProviderId = '12345';
    });
  });

  describe('ctrl.loadProvidersByLocation function ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'filterProviders');
      spyOn(ctrl, 'addDynamicColumnsToProviders');
      ctrl.allProvidersList = [];
      scope.filterByLocationId = null;
      showOnScheduleFactory.getAll = jasmine
        .createSpy()
        .and.returnValue({ then: function () {} });
    });

    describe('when scope.filterShowOnSchedule is true ->', function () {
      beforeEach(function () {
        scope.filterShowOnSchedule = true;
        ctrl.showOnSchedulePromise = null;
      });

      it('should call showOnScheduleFactory.getAll and set ctrl.showOnSchedulePromise', function () {
        ctrl.loadProvidersByLocation();

        expect(showOnScheduleFactory.getAll).toHaveBeenCalled();
        expect(ctrl.showOnSchedulePromise).not.toBeNull();
      });

      describe('showOnScheduleFactory callback ->', function () {
        var resValue;
        beforeEach(function () {
          resValue = 'res.Value';

          showOnScheduleFactory.getAll = jasmine.createSpy().and.returnValue({
            then: function (success) {
              success({ Value: resValue });
            },
          });
        });

        it('should set ctrl.showOnScheduleExceptions', function () {
          ctrl.loadProvidersByLocation();

          expect(ctrl.showOnScheduleExceptions).toBe(resValue);
        });
      });
    });

    describe('when scope.filterShowOnSchedule is not true ->', function () {
      beforeEach(function () {
        scope.filterShowOnSchedule = false;
        ctrl.showOnSchedulePromise = null;
      });

      it('should not call showOnScheduleFactory or set ctrl.showOnSchedulePromise', function () {
        ctrl.loadProvidersByLocation();

        expect(showOnScheduleFactory.getAll).not.toHaveBeenCalled();
        expect(ctrl.showOnSchedulePromise).toBeNull();
      });
    });

    it('should call locationService.getCurrentLocation', function () {
      ctrl.loadProvidersByLocation();
      expect(locationService.getCurrentLocation).toHaveBeenCalled();
    });

    it('should call referenceDataService.get and set ctrl.allProvidersList', function () {
      ctrl.allProvidersList = null;
      referenceDataService.get.calls.reset();
      referenceDataService.entityNames.users = 'users';

      ctrl.loadProvidersByLocation();

      expect(referenceDataService.get).toHaveBeenCalledWith('users');
      expect(ctrl.allProvidersList).toBe(mockProviderList);
    });

    it('should call ctrl.addDynamicColumnsToProvider', function () {
      ctrl.loadProvidersByLocation();
      expect(ctrl.addDynamicColumnsToProviders).toHaveBeenCalledWith(
        mockProviderList
      );
    });

    describe('when scope.filterShowOnSchedule is true and ctrl.showOnSchedulePromise is defined ->', function () {
      var promise = { then: jasmine.createSpy() };
      beforeEach(function () {
        scope.filterShowOnSchedule = true;
        showOnScheduleFactory.getAll = function () {
          return {
            then: function () {
              return promise;
            },
          };
        };
        scope.providers = null;
        ctrl.allProvidersList = 'allProvidersList';
      });
    });

    it('should call ctrl.filterProviders when scope.filterShowOnSchedule is not true', function () {
      scope.filterShowOnSchedule = false;

      ctrl.loadProvidersByLocation();

      expect(ctrl.filterProviders).toHaveBeenCalled();
    });

    it('should call ctrl.filterProviders when ctrl.showOnSchedulePromise is null', function () {
      scope.filterShowOnSchedule = true;

      ctrl.loadProvidersByLocation();

      expect(ctrl.filterProviders).toHaveBeenCalled();
    });
  });

  describe('ctrl.filterProviders function ->', function () {
    var provList = [
      {
        ProviderId: '1234',
        UserId: '1234',
        FirstName: 'Bob',
        LastName: 'Jones',
        Name: 'Bob Jones',
        IsPreferred: false,
        IsActive: false,
      },
      {
        ProviderId: '1235',
        UserId: '1235',
        FirstName: 'Sid',
        LastName: 'Jones',
        Name: 'Sid Jones',
        IsPreferred: false,
        IsActive: true,
      },
      {
        ProviderId: '1236',
        UserId: '1236',
        FirstName: 'Larry',
        LastName: 'Jones',
        Name: 'Larry Jones',
        IsPreferred: false,
        IsActive: true,
      },
      {
        ProviderId: '1237',
        UserId: '1237',
        FirstName: 'Pat',
        LastName: 'Jones',
        Name: 'Pat Jones',
        IsPreferred: false,
        IsActive: true,
      },
      {
        ProviderId: '1238',
        UserId: '1238',
        FirstName: 'Sylvia',
        LastName: 'Jones',
        Name: 'Sylvia Jones',
        IsPreferred: false,
        IsActive: true,
      },
    ];
    beforeEach(function () {
      ctrl.filterProviderList = jasmine.createSpy().and.returnValue(provList);
      ctrl.setSelectedProvider = jasmine.createSpy();
    });

    it('should set filterByLocationId to currentLocation.id if $scope.filterByLocationId is null', function () {
      scope.filterByLocationId = null;
      var filterByLocationId = currentLocation.id;
      ctrl.filterProviders();
      expect(ctrl.filterProviderList).toHaveBeenCalledWith(
        ctrl.allProvidersList,
        [filterByLocationId]
      );
    });

    it('should set filterByLocationId to  $scope.filterByLocationId if $scope.filterByLocationId is not null', function () {
      scope.filterByLocationId = 'notnull';
      var filterByLocationId = scope.filterByLocationId;
      ctrl.filterProviders();
      expect(ctrl.filterProviderList).toHaveBeenCalledWith(
        ctrl.allProvidersList,
        [filterByLocationId]
      );
    });

    it('should set filterByLocationIds to  scope.filterByMultipleLocations when it is set', function () {
      scope.filterByMultipleLocations = ['test1', 'test2'];
      var filterByLocationId = scope.filterByMultipleLocations;
      ctrl.filterProviders();
      expect(ctrl.filterProviderList).toHaveBeenCalledWith(
        ctrl.allProvidersList,
        filterByLocationId
      );
    });

    it('should call ctrl.filterProviderList', function () {
      ctrl.filterProviders();
      expect(ctrl.filterProviderList).toHaveBeenCalled();
    });

    it('should set scope.providers and scope.providersLoaded', function () {
      scope.patientInfo = {
        PatientLocations: [
          {
            LocationId: currentLocation.id,
          },
        ],
      };
      scope.providers = null;
      scope.providersLoaded = false;
      ctrl.filterProviders();
      expect(scope.providers).toEqual(provList);
    });

    it('should not wait on ctrl.showOnSchedulePromise if it exists and scope.filterShowOnSchedule is false', function () {
      scope.filterByLocationId = 1;
      scope.filterShowOnSchedule = false;
      ctrl.showOnSchedulePromise = { then: jasmine.createSpy() };
      ctrl.filterProviders();
      expect(ctrl.showOnSchedulePromise.then).not.toHaveBeenCalledWith(
        scope.providers
      );
    });

    it('should wait on ctrl.showOnSchedulePromise if it exists and scope.filterShowOnSchedule is true', function () {
      scope.filterByLocationId = 1;
      scope.filterShowOnSchedule = true;
      ctrl.showOnSchedulePromise = { then: jasmine.createSpy() };
      ctrl.filterProviders();
      expect(ctrl.showOnSchedulePromise.then).toHaveBeenCalledWith(
        scope.providers
      );
    });

    it('should order providers by IsActive then Name', function () {
      scope.patientInfo = {
        PatientLocations: [
          {
            LocationId: currentLocation.id,
          },
        ],
      };

      scope.filterByLocationId = 1;
      scope.filterShowOnSchedule = true;
      ctrl.showOnSchedulePromise = { then: jasmine.createSpy() };
      ctrl.filterProviders();
      expect(scope.providers[0].Name).toEqual('Bob Jones');
      expect(scope.providers[0].IsActive).toEqual(false);

      expect(scope.providers[1].Name).toEqual('Sid Jones');
      expect(scope.providers[1].IsActive).toEqual(true);

      expect(scope.providers[2].Name).toEqual('Larry Jones');
      expect(scope.providers[2].IsActive).toEqual(true);

      expect(scope.providers[3].Name).toEqual('Pat Jones');
      expect(scope.providers[3].IsActive).toEqual(true);

      expect(scope.providers[4].Name).toEqual('Sylvia Jones');
      expect(scope.providers[4].IsActive).toEqual(true);
    });
  });

  describe('patCore:initlocation broadcast listener -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'loadProvidersByLocation');
    });

    it('should call ctrl.loadProvidersByLocation if $scope.filterByLocationId is null', function () {
      scope.filterByLocationId = null;
      ctrl.showOnSchedulePromise = 'promise';
      ctrl.showOnScheduleExceptions = 'exceptions';
      rootScope.$broadcast('patCore:initlocation');
      expect(ctrl.loadProvidersByLocation).toHaveBeenCalled();
      expect(ctrl.showOnSchedulePromise).toBeNull();
      expect(ctrl.showOnScheduleExceptions).toBeNull();
    });

    it('should not call ctrl.loadProvidersByLocation if $scope.filterByLocationId is not null', function () {
      scope.filterByLocationId = 'notnull';
      ctrl.showOnSchedulePromise = 'promise';
      ctrl.showOnScheduleExceptions = 'exceptions';
      rootScope.$broadcast('patCore:initlocation');
      expect(ctrl.loadProvidersByLocation).not.toHaveBeenCalled();
      expect(ctrl.showOnSchedulePromise).not.toBeNull();
      expect(ctrl.showOnScheduleExceptions).not.toBeNull();
    });
  });

  describe('ctrl.init function ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'loadProvidersByLocation');
    });

    it('should load providerList if not passed to directive', function () {
      ctrl.init();
      expect(ctrl.loadProvidersByLocation).toHaveBeenCalled();
    });
  });

  describe('filterByLocationId watch - >', function () {
    it('should call ctrl.loadProvidersByLocation to filter the providers by filterByLocationId', function () {
      spyOn(ctrl, 'loadProvidersByLocation');
      ctrl.showOnSchedulePromise = 'promise';
      ctrl.showOnScheduleExceptions = 'exceptions';
      scope.filterByLocationId = 1234;
      scope.$apply();
      scope.filterByLocationId = 1235;
      scope.$apply();
      expect(ctrl.loadProvidersByLocation).toHaveBeenCalled();
      expect(ctrl.showOnSchedulePromise).toBeNull();
      expect(ctrl.showOnScheduleExceptions).toBeNull();
    });

    it('should not call ctrl.loadProvidersByLocation to filter the providers by filterByLocationId if value of filterByLocationId is same when parsed', function () {
      spyOn(ctrl, 'loadProvidersByLocation');
      ctrl.showOnSchedulePromise = 'promise';
      ctrl.showOnScheduleExceptions = 'exceptions';
      scope.filterByLocationId = 1234;
      scope.$apply();
      scope.filterByLocationId = '1234';
      scope.$apply();
      expect(ctrl.loadProvidersByLocation).not.toHaveBeenCalled();
      expect(ctrl.showOnSchedulePromise).not.toBeNull();
      expect(ctrl.showOnScheduleExceptions).not.toBeNull();
    });
  });

  describe('filterByMultipleLocations watch - >', function () {
    it('should call ctrl.loadProvidersByLocation to filter the providers by filterByMultipleLocations', function () {
      spyOn(ctrl, 'loadProvidersByLocation');
      ctrl.showOnSchedulePromise = 'promise';
      ctrl.showOnScheduleExceptions = 'exceptions';
      scope.filterByMultipleLocations = 1234;
      scope.$apply();
      scope.filterByMultipleLocations = 1235;
      scope.$apply();
      expect(ctrl.loadProvidersByLocation).toHaveBeenCalled();
      expect(ctrl.showOnSchedulePromise).toBeNull();
      expect(ctrl.showOnScheduleExceptions).toBeNull();
    });

    it('should not call ctrl.loadProvidersByLocation to filter the providers by filterByMultipleLocations if value of filterByMultipleLocations is same when parsed', function () {
      spyOn(ctrl, 'loadProvidersByLocation');
      ctrl.showOnSchedulePromise = 'promise';
      ctrl.showOnScheduleExceptions = 'exceptions';
      scope.filterByMultipleLocations = '1234';
      scope.$apply();
      scope.filterByMultipleLocations = '1234';
      scope.$apply();
      expect(ctrl.loadProvidersByLocation).not.toHaveBeenCalled();
      expect(ctrl.showOnSchedulePromise).not.toBeNull();
      expect(ctrl.showOnScheduleExceptions).not.toBeNull();
    });
  });

  describe('ctrl.filterProvidersByUserLocations function ->', function () {
    var allProvidersList = [];
    beforeEach(function () {
      allProvidersList = _.cloneDeep(mockProviderList);
    });

    it('should filter the providerList to only providers with userLocationSetup records in the filterByLocationId location', function () {
      scope.filterByLocationId = 2;
      var filteredProviderList = ctrl.filterProvidersByUserLocations(
        allProvidersList,
        scope.filterByLocationId
      );
      for (let index = 0; index < filteredProviderList.length; index++) {
        expect(filteredProviderList[index]).toEqual(
          providersWithLocation2[index]
        );
      }
    });

    it('should filter the providerList to only providers with userLocationSetup records in the filterByLocationId location', function () {
      ctrl.currentLocation = { id: 3 };
      var filteredProviderList = ctrl.filterProvidersByUserLocations(
        allProvidersList,
        scope.filterByLocationId
      );
      for (let index = 0; index < filteredProviderList.length; index++) {
        expect(filteredProviderList[index]).toEqual(
          providersWithLocation2[index]
        );
      }
    });

    it('should set provider.IsActive based on Locations.IsActive', function () {
      ctrl.currentLocation = { id: 3 };
      scope.filterByLocationId = 3;
      // set the userLocationSetup.IsActive = false on all location 3 userLocationSetups
      _.forEach(allProvidersList, function (provider) {
        _.forEach(provider.Locations, function (userLocationSetup) {
          if (userLocationSetup.LocationId === 3) {
            userLocationSetup.IsActive = false;
          } else {
            userLocationSetup.IsActive = true;
          }
        });
      });
      // filter for location 2
      var filteredProviderList = ctrl.filterProvidersByUserLocations(
        allProvidersList,
        2
      );
      _.forEach(filteredProviderList, function (provider) {
        expect(provider.IsActive).toEqual(true);
      });
      // filter for location 3
      filteredProviderList = ctrl.filterProvidersByUserLocations(
        allProvidersList,
        3
      );
      _.forEach(filteredProviderList, function (provider) {
        expect(provider.IsActive).toEqual(false);
      });
    });
  });

  describe('ctrl.addExceptionProvider function ->', function () {
    var filteredProviderList = [];
    beforeEach(function () {
      ctrl.allProvidersList = _.cloneDeep(mockProviderList);
      ctrl.currentLocation = { id: 2 };
      filteredProviderList = ctrl.filterProvidersByUserLocations(
        ctrl.allProvidersList
      );
    });

    it(
      'should not add provider passed as exceptionProviderId to the list even if not in the filteredProviderList ' +
        'and if it is not in the ctrl.allProvidersList',
      function () {
        // exceptionProviderId is not in either list
        scope.exceptionProviderId = '3398f3b4-b261-4c9b-aa13-59bf0127f4888';
        // filtered list to only providers that were in location 2
        for (let index = 0; index < filteredProviderList.length; index++) {
          expect(filteredProviderList[index]).toEqual(
            providersWithLocation2[index]
          );
        }
        // provider is in allProvidersList list
        var providerInAllProvidersList = _.find(
          ctrl.allProvidersList,
          function (provider) {
            return provider.UserId === scope.exceptionProviderId;
          }
        );
        expect(providerInAllProvidersList).toEqual(undefined);

        // provider is not in filtered list
        var providerInFilteredProviderList = _.find(
          filteredProviderList,
          function (provider) {
            return provider.UserId === scope.exceptionProviderId;
          }
        );
        expect(providerInFilteredProviderList).toBe(undefined);

        // provider should be in filteredList
        ctrl.addExceptionProvider(filteredProviderList);

        // provider is not in filtered list
        providerInFilteredProviderList = _.find(
          filteredProviderList,
          function (provider) {
            return provider.UserId === scope.exceptionProviderId;
          }
        );
        expect(providerInFilteredProviderList).toBe(undefined);
      }
    );

    it(
      'should add provider passed as exceptionProviderId to the list even if not in the filteredProviderList ' +
        'if it is in the ctrl.allProvidersList',
      function () {
        // exceptionProviderId is provider with userLocationSetup in locations 1 and 3
        scope.exceptionProviderId = '3398f3b4-b261-4c9b-aa13-59bf0127f488';
        // filter list to only providers that were in location 2
        ctrl.currentLocation = { id: 2 };
        var filteredProviderList = ctrl.filterProvidersByUserLocations(
          ctrl.allProvidersList
        );
        for (let index = 0; index < filteredProviderList.length; index++) {
          expect(filteredProviderList[index]).toEqual(
            providersWithLocation2[index]
          );
        }
        // provider is not in filtered list
        var providerInFilteredProviderList = _.find(
          filteredProviderList,
          function (provider) {
            return provider.UserId === scope.exceptionProviderId;
          }
        );
        expect(providerInFilteredProviderList).toBe(undefined);

        //
        ctrl.addExceptionProvider(filteredProviderList);

        // provider should now be in the filtered list
        providerInFilteredProviderList = _.find(
          filteredProviderList,
          function (provider) {
            return provider.UserId === scope.exceptionProviderId;
          }
        );
        expect(providerInFilteredProviderList.UserId).toBe(
          scope.exceptionProviderId
        );
      }
    );
  });

  describe('ctrl.filterByProviderType function ->', function () {
    var filteredProviderList = [];
    beforeEach(function () {
      filteredProviderList = _.cloneDeep(mockPreferredProvidersList);
    });

    it('should filter the list by scope.providerTypeIds', function () {
      expect(filteredProviderList.length).toBe(5);
      expect(filteredProviderList[0].UserLocationSetup[0].ProviderTypeId).toBe(
        1
      );
      expect(filteredProviderList[1].UserLocationSetup[0].ProviderTypeId).toBe(
        1
      );
      expect(filteredProviderList[2].UserLocationSetup[0].ProviderTypeId).toBe(
        3
      );
      expect(filteredProviderList[3].UserLocationSetup[0].ProviderTypeId).toBe(
        1
      );
      expect(filteredProviderList[4].UserLocationSetup[0].ProviderTypeId).toBe(
        2
      );
      scope.providerTypeIds = [1, 2];
      filteredProviderList = ctrl.filterByProviderType(filteredProviderList);
      expect(filteredProviderList.length).toBe(4);
    });

    it('should not filter the list by scope.providerTypeIds if null or undefined', function () {
      expect(filteredProviderList.length).toBe(5);
      scope.providerTypeIds = undefined;
      filteredProviderList = ctrl.filterByProviderType(filteredProviderList);
      expect(filteredProviderList.length).toBe(5);
    });
  });

  describe('ctrl.addOptionsForExaminingDentist function ->', function () {
    it('should add options to the examinedentist when scope.optionsForExaminingDentist exists and not undefined', function () {
      var filteredProviderList = [];
      spyOn(ctrl, 'addOptionsForExaminingDentist').and.callFake(function () {
        return filteredProviderList;
      });
      scope.optionsForExaminingDentist = null;
      ctrl.addOptionsForExaminingDentist(mockProviderList);
      expect(mockProviderList.length).toBe(16);
    });

    it('should not add options to the examinedentist when scope.optionsForExaminingDentist not exists ', function () {
      spyOn(ctrl, 'addOptionsForExaminingDentist').and.callFake(function () {});
      var ProviderList = [
        {
          UserId: '1',
          IsActive: true,
        },
        {
          UserId: '1',
          IsActive: true,
        },
        {
          UserId: '1',
          IsActive: true,
        },
      ];
      ctrl.addOptionsForExaminingDentist(ProviderList);
      scope.optionsForExaminingDentist = undefined;
      expect(ProviderList.length).toBe(3);
    });
  });

  describe('ctrl.filterProviderListForOnlyActive function ->', function () {
    var filteredProviderList = [];
    beforeEach(function () {
      ctrl.allProvidersList = _.cloneDeep(mockProviderList);
      ctrl.currentLocation = { id: 2 };
      filteredProviderList = ctrl.filterProvidersByUserLocations(
        ctrl.allProvidersList,
        [2]
      );
      _.forEach(filteredProviderList, function (provider) {
        provider.IsActive = true;
      });
    });

    it('should filter the providerList for only providers who are active if onlyActive is true ', function () {
      scope.onlyActive = true;
      var inactiveProvider = filteredProviderList[0];
      inactiveProvider.IsActive = false;
      var filteredList =
        ctrl.filterProviderListForOnlyActive(filteredProviderList);
      expect(filteredList.length).toBe(filteredProviderList.length - 1);
      expect(filteredList).not.toContain(inactiveProvider);
    });

    it('should not filter the providerList for only providers who are active if onlyActive is false ', function () {
      scope.onlyActive = false;
      var inactiveProvider = filteredProviderList[0];
      inactiveProvider.IsActive = false;
      var filteredList =
        ctrl.filterProviderListForOnlyActive(filteredProviderList);
      expect(filteredList.length).toBe(filteredProviderList.length);
      expect(filteredList).toContain(inactiveProvider);
    });

    it('should filter the providerList for only providers who are active plus selectedProvider if onlyActive is true and selectedProvider is not empty ', function () {
      scope.onlyActive = true;
      var inactiveProvider = filteredProviderList[0];
      scope.selectedProvider = filteredProviderList[0].UserId;
      inactiveProvider.IsActive = false;
      var filteredList =
        ctrl.filterProviderListForOnlyActive(filteredProviderList);
      expect(filteredList.length).toBe(filteredProviderList.length);
      expect(filteredList).toContain(inactiveProvider);
    });
  });

  describe('ctrl.filterProviderListForShowOnSchedule function ->', function () {
    it('should return providerList when scope.filterShowOnSchedule is not true', function () {
      scope.filterShowOnSchedule = false;

      var returnValue =
        ctrl.filterProviderListForShowOnSchedule('providerList');

      expect(returnValue).toBe('providerList');
    });

    it('should return correct results when scope.filterShowOnSchedule is true', function () {
      scope.filterShowOnSchedule = true;
      var filterByLocationId = 'locationId';

      var providers = [
        // dentist with no exception
        { UserId: 1, UserLocationSetup: { ProviderTypeId: 1 } },
        // dentist with true exception
        { UserId: 2, UserLocationSetup: { ProviderTypeId: 1 } },
        // dentist with false exception
        { UserId: 3, UserLocationSetup: { ProviderTypeId: 1 } },
        // hygienist with no exception
        { UserId: 4, UserLocationSetup: { ProviderTypeId: 2 } },
        // hygienist with true exception
        { UserId: 5, UserLocationSetup: { ProviderTypeId: 2 } },
        // hygienist with false exception
        { UserId: 6, UserLocationSetup: { ProviderTypeId: 2 } },
        // other with no exception
        { UserId: 7, UserLocationSetup: { ProviderTypeId: 3 } },
        // other with true exception
        { UserId: 8, UserLocationSetup: { ProviderTypeId: 3 } },
        // other with false exception
        { UserId: 9, UserLocationSetup: { ProviderTypeId: 3 } },
      ];
      ctrl.showOnScheduleExceptions = [
        // dentist with no exception
        { UserId: 1, LocationId: 'other', ShowOnSchedule: false },
        // dentist with true exception
        { UserId: 2, LocationId: filterByLocationId, ShowOnSchedule: true },
        // dentist with false exception
        { UserId: 3, LocationId: filterByLocationId, ShowOnSchedule: false },
        // hygienist with no exception
        { UserId: 4, LocationId: 'other', ShowOnSchedule: false },
        // hygienist with true exception
        { UserId: 5, LocationId: filterByLocationId, ShowOnSchedule: true },
        // hygienist with false exception
        { UserId: 6, LocationId: filterByLocationId, ShowOnSchedule: false },
        // other with no exception
        { UserId: 7, LocationId: 'other', ShowOnSchedule: true },
        // other with true exception
        { UserId: 8, LocationId: filterByLocationId, ShowOnSchedule: true },
        // other with false exception
        { UserId: 9, LocationId: filterByLocationId, ShowOnSchedule: false },
      ];

      var result = ctrl.filterProviderListForShowOnSchedule(
        providers,
        filterByLocationId
      );

      expect(result.length).toBe(5);
    });
  });

  describe('ctrl.filterProviderList function ->', function () {
    var filteredProviderList = [];
    var filterByLocationId = currentLocation.id;
    beforeEach(function () {
      scope.filterByLocationId = 2;
      ctrl.allProvidersList = _.cloneDeep(mockProviderList);
      ctrl.currentLocation = { id: 2 };
      filteredProviderList = ctrl.filterProvidersByUserLocations(
        ctrl.allProvidersList
      );
      spyOn(ctrl, 'filterProvidersByUserLocations').and.callFake(function () {
        return filteredProviderList;
      });
      spyOn(ctrl, 'filterProviderListForOnlyActive').and.callFake(function () {
        return filteredProviderList;
      });
      spyOn(ctrl, 'filterProviderListForShowOnSchedule').and.returnValue(
        filteredProviderList
      );
      spyOn(ctrl, 'setPreferredProviders').and.callFake(function () {
        return filteredProviderList;
      });
      spyOn(ctrl, 'addExceptionProvider').and.callFake(function () {
        return filteredProviderList;
      });
      spyOn(ctrl, 'defaultSelectedProvider').and.callFake(function () {});
      spyOn(ctrl, 'sortProviderListForClinicalNotes').and.callFake(function () {
        return filteredProviderList;
      });
    });

    it('should call ctrl.filterProvidersByUserLocations ', function () {
      ctrl.filterProviderList(ctrl.allProvidersList, filterByLocationId);
      expect(ctrl.filterProvidersByUserLocations).toHaveBeenCalledWith(
        ctrl.allProvidersList,
        scope.filterByLocationId
      );
    });

    it('should call ctrl.filterProviderListForOnlyActive ', function () {
      ctrl.filterProviderList(ctrl.allProvidersList, filterByLocationId);
      expect(ctrl.filterProviderListForOnlyActive).toHaveBeenCalledWith(
        filteredProviderList
      );
    });

    it('should call ctrl.setPreferredProviders ', function () {
      ctrl.filterProviderList(ctrl.allProvidersList, filterByLocationId);
      expect(ctrl.setPreferredProviders).toHaveBeenCalledWith(
        filteredProviderList,
        scope.filterByLocationId
      );
    });

    it('should call ctrl.defaultSelectedProvider ', function () {
      ctrl.filterProviderList(ctrl.allProvidersList, filterByLocationId);
      expect(ctrl.defaultSelectedProvider).toHaveBeenCalledWith(
        filteredProviderList
      );
    });

    it('should call ctrl.addExceptionProvider ', function () {
      ctrl.filterProviderList(ctrl.allProvidersList, filterByLocationId);
      expect(ctrl.addExceptionProvider).toHaveBeenCalledWith(
        filteredProviderList
      );
    });

    it('should call ctrl.sortProviderListForClinicalNotes when sortForClinicalNotes is true and exceptionProviderId is not provided', function () {
      scope.sortForClinicalNotes = true;
      scope.exceptionProviderId = undefined;
      ctrl.filterProviderList(ctrl.allProvidersList, filterByLocationId);
      expect(ctrl.sortProviderListForClinicalNotes).toHaveBeenCalledWith(
        filteredProviderList
      );
    });

    it('should not call ctrl.sortProviderListForClinicalNotes when sortForClinicalNotes is false', function () {
      scope.sortForClinicalNotes = false;
      scope.exceptionProviderId = 'test';
      ctrl.filterProviderList(ctrl.allProvidersList, filterByLocationId);
      expect(ctrl.sortProviderListForClinicalNotes).not.toHaveBeenCalledWith(
        filteredProviderList
      );
    });

    it('should not call ctrl.sortProviderListForClinicalNotes when exceptionProviderId is set', function () {
      scope.sortForClinicalNotes = true;
      scope.exceptionProviderId = 'test';
      ctrl.filterProviderList(ctrl.allProvidersList, filterByLocationId);
      expect(ctrl.sortProviderListForClinicalNotes).not.toHaveBeenCalledWith(
        filteredProviderList
      );
    });
  });

  describe('ctrl.defaultsSelectedProvider function ->', function () {
    var filteredProviderList = [];
    beforeEach(function () {
      filteredProviderList = _.cloneDeep(mockPreferredProvidersList);
      scope.patientInfo = { PreferredDentist: null };
    });

    it('should do nothing if scope.selectedProvider is already set', function () {
      scope.selectedProvider = '1234';
      ctrl.defaultSelectedProvider(filteredProviderList);
      expect(scope.selectedProvider).toEqual('1234');
    });

    it('should do nothing if scope.setPreferred is undefined or false', function () {
      scope.selectedProvider = '';
      scope.setPreferred = false;
      ctrl.defaultSelectedProvider(filteredProviderList);
      expect(scope.selectedProvider).toEqual('');
    });

    it(
      'should set scope.selectedProvider to either patientInfo.Profile.PreferredDentist' +
        'if scope.setPreferred is true and patientInfo.Profile.PreferredDentist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 1 has been passed to directive ',
      function () {
        scope.selectedProvider = '';
        scope.setPreferred = true;
        scope.usuallyPerformedBy = 1;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 3;
        scope.patientInfo = {
          Profile: {
            PreferredDentist: mockPreferredProvidersList[0].ProviderId,
          },
        };

        ctrl.defaultSelectedProvider(filteredProviderList);
        timeout.flush(0);
        expect(scope.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should set scope.selectedProvider to either patientInfo.Profile.PreferredHygienist' +
        'if scope.setPreferred is true and patientInfo.Profile.PreferredHygienist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 2 has been passed to directive ',
      function () {
        scope.selectedProvider = '';
        scope.setPreferred = true;
        scope.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 3;
        scope.patientInfo = {
          Profile: {
            PreferredHygienist: mockPreferredProvidersList[0].ProviderId,
          },
        };

        ctrl.defaultSelectedProvider(filteredProviderList);
        timeout.flush(0);
        expect(scope.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should set scope.selectedProvider to patientInfo.PreferredDentist' +
        'if scope.setPreferred is true and patientInfo.PreferredDentist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 1 has been passed to directive ',
      function () {
        scope.selectedProvider = '';
        scope.setPreferred = true;
        scope.usuallyPerformedBy = 1;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 3;
        scope.patientInfo = {
          PreferredDentist: mockPreferredProvidersList[0].ProviderId,
        };

        ctrl.defaultSelectedProvider(filteredProviderList);
        timeout.flush(0);
        expect(scope.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should set scope.selectedProvider to patientInfo.PreferredHygienist' +
        'if scope.setPreferred is true and patientInfo.PreferredHygienist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 2 has been passed to directive ',
      function () {
        scope.selectedProvider = '';
        scope.setPreferred = true;
        scope.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 3;
        scope.patientInfo = {
          PreferredHygienist: mockPreferredProvidersList[0].ProviderId,
        };

        ctrl.defaultSelectedProvider(filteredProviderList);
        timeout.flush(0);
        expect(scope.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should not set scope.selectedProvider to provider who has provider.IsPreferred set to true and ProviderTypeId is not 4' +
        ' if selectedProvider is undefined and scope.setPreferred is true and patientInfo.PreferredDentist is not in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 1 has been passed to directive ',
      function () {
        scope.selectedProvider = '';
        scope.setPreferred = true;
        scope.usuallyPerformedBy = 1;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 3;
        scope.patientInfo.PreferredDentist = '1234';
        ctrl.defaultSelectedProvider(filteredProviderList);
        timeout.flush(0);
        expect(scope.selectedProvider).toEqual('');
      }
    );

    it(
      'should set scope.selectedProvider to provider who has provider.IsPreferred set to true and ProviderTypeId = 2 ' +
        ' if selectedProvider is undefined and scope.setPreferred is true and patientInfo.PreferredHygienist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 2 has been passed to directive ',
      function () {
        scope.selectedProvider = '';
        scope.setPreferred = true;
        scope.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 2;
        scope.patientInfo.PreferredHygienist =
          mockPreferredProvidersList[0].ProviderId;
        ctrl.defaultSelectedProvider(filteredProviderList);
        timeout.flush(0);
        expect(scope.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should set scope.selectedProvider to provider who has provider.IsPreferred set to true and ProviderTypeId = 2 ' +
        ' if selectedProvider is undefined and scope.setPreferred is true and patientInfo.PreferredHygienist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 2 has been passed to directive ',
      function () {
        scope.selectedProvider = '';
        scope.setPreferred = true;
        scope.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 2;
        scope.patientInfo.PreferredHygienist =
          mockPreferredProvidersList[0].ProviderId;
        ctrl.defaultSelectedProvider(filteredProviderList);
        timeout.flush(0);
        expect(scope.selectedProvider).toEqual(
          mockPreferredProvidersList[0].ProviderId
        );
      }
    );

    it(
      'should set scope.selectedProvider to provider who has provider.IsPreferred set to true and ProviderTypeId = 2 ' +
        ' if selectedProvider is undefined and scope.setPreferred is true and patientInfo.PreferredHygienist is in list' +
        ' and patient has a preferredProvider and scope.usuallyPerformedBy = 2 has been passed to directive ',
      function () {
        scope.selectedProvider = '';
        scope.setPreferred = true;
        scope.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 2;
        scope.patientInfo.PreferredDentist = '1234';
        ctrl.defaultSelectedProvider(filteredProviderList);
        timeout.flush(0);
        expect(scope.selectedProvider).toEqual('');
      }
    );

    it(
      'should not set scope.selectedProvider if selectedProvider is undefined and scope.setPreferred is true and patientInfo is not available' +
        ' ',
      function () {
        scope.selectedProvider = '';
        scope.setPreferred = true;
        scope.usuallyPerformedBy = 2;
        filteredProviderList[0].IsPreferred = true;
        filteredProviderList[0].UserLocationSetup.ProviderTypeId = 2;
        scope.patientInfo = 'undefined';
        ctrl.defaultSelectedProvider(filteredProviderList);
        timeout.flush(0);
        expect(scope.selectedProvider).toEqual('');
      }
    );
  });

  describe('ctrl.defaultsSelectedProvider function ->', function () {
    var filteredProviderList = [];
    beforeEach(function () {
      filteredProviderList = _.cloneDeep(mockPreferredProvidersList);
      scope.patientInfo = { PreferredDentist: null };
    });

    it('should order list with dentists at the top in alpha order, then other providers below in alpha', function () {
      var expectedSortedProviderList = [
        {
          ProviderId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
          UserId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
          Name: 'Bob Jones',
          IsPreferred: false,
          UserLocationSetup: [{ LocationId: 2, ProviderTypeId: 1 }],
        },
        {
          ProviderId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
          UserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
          Name: 'Sid Jones',
          IsPreferred: false,
          UserLocationSetup: [{ LocationId: 2, ProviderTypeId: 1 }],
        },
        {
          ProviderId: 'eedf5827-6735-4832-9d20-99758df70a8b',
          UserId: 'eedf5827-6735-4832-9d20-99758df70a8b',
          Name: 'Pat Jones',
          IsPreferred: false,
          UserLocationSetup: [{ LocationId: 2, ProviderTypeId: 1 }],
        },
        {
          ProviderId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
          UserId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
          Name: 'Larry Jones',
          IsPreferred: false,
          UserLocationSetup: [{ LocationId: 2, ProviderTypeId: 3 }],
        },
        {
          ProviderId: '517ce215-b71b-408f-8b20-62a4c1386f77',
          UserId: '517ce215-b71b-408f-8b20-62a4c1386f77',
          Name: 'Sylvia Jones',
          IsPreferred: false,
          UserLocationSetup: [{ LocationId: 2, ProviderTypeId: 2 }],
        },
      ];

      var result = ctrl.sortProviderListForClinicalNotes(filteredProviderList);
      expect(result).toEqual(expectedSortedProviderList);
    });
  });
});
