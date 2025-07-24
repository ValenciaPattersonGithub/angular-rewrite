describe('Controller: DebitTransactionController', function () {
  var scope,
    ctrl,
    toastrFactory,
    listHelper,
    localize,
    timeZoneFactoryMock,
    referenceDataServiceMock,
    timeout,
    featureFlagServiceMock,
    fuseFlagMock,
    staticData;


  var $q;

  var mockPositiveAdjustmentTypes = [
    {
      AdjustmentTypeId: 'e18dd181-9e6c-4707-8eb7-fa9cae6c653d',
      Description: 'Billing Charge',
      IsActive: true,
      IsPositive: true,
      IsSystemType: true,
      IsAdjustmentTypeAssociatedWithTransactions: false,
      DataTag:
        '{"Timestamp":"2015-09-29T14:44:54.5397849+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A44%3A54.5397849Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T14:44:23Z',
    },
    {
      AdjustmentTypeId: '2c1c5666-7a84-49e3-9f24-26927ed1f0db',
      Description: 'Finance Charge',
      IsActive: true,
      IsPositive: true,
      IsSystemType: true,
      IsAdjustmentTypeAssociatedWithTransactions: false,
      DataTag:
        '{"Timestamp":"2015-09-29T14:45:00.4851606+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A45%3A00.4851606Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T14:44:32Z',
    },
    {
      AdjustmentTypeId: 'cf6f778a-4032-45a0-a7c1-bfce7d000ea6',
      Description: 'Positive Adjustment 1',
      IsActive: true,
      IsPositive: true,
      IsSystemType: false,
      IsAdjustmentTypeAssociatedWithTransactions: false,
      DataTag:
        '{"Timestamp":"2015-09-29T14:54:05.3623682+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A54%3A05.3623682Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T14:54:03.971992Z',
    },
    {
      AdjustmentTypeId: '01afdfd9-d397-4ad1-8e28-934a31db42ff',
      Description: 'Positive Adjustment 2',
      IsActive: true,
      IsPositive: true,
      IsSystemType: false,
      IsAdjustmentTypeAssociatedWithTransactions: false,
      DataTag:
        '{"Timestamp":"2015-09-29T14:54:15.8437152+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A54%3A15.8437152Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T14:54:14.6887081Z',
    },
  ];

  var mockAllProviders = [
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

  var mockPatientInfo = {
    FirstName: 'First',
    LastName: 'Last',
    MiddleName: 'Middle',
    PreferredName: 'Preferred',
    Suffix: 'Suffix',
    PrefferedDentist: 3000,
    PreferredHygienist: 4000,
  };

  var mockInitialDebitTransactionDto = {
    DebitTransactionId: 201,
    Amount: 0,
  };

  staticData = {
    PaymentProviders: jasmine.createSpy('staticData.PaymentProviders').and.returnValue({ OpenEdge: 0, TransactionsUI: 1 }),
  };


  featureFlagServiceMock = {
    getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
  };

  fuseFlagMock = {};

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
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

  beforeEach(inject(function ($rootScope, $controller, $injector, _$q_) {
    $q = _$q_;
    scope = $rootScope.$new();

    referenceDataServiceMock.getData.and.callFake(function () {
      return $q.resolve([
        { LocationId: 1234, Timezone: 'Central Standard Time' },
        { LocationId: 1235, Timezone: 'Mountain Standard Time' },
      ]);
    });

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error'),
    };

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };
    //mock for data
    //As data for directive is not a part of controller and declared in directive only, create dummy data here
    scope.data = {
      PatientInfo: mockPatientInfo,
      AdjustmentTypes: mockPositiveAdjustmentTypes,
      Providers: mockAllProviders,
      DebitTransactionDto: mockInitialDebitTransactionDto,
      ErrorFlags: {
        hasError: false,
      },
    };

    //injecting required dependencies
    timeout = $injector.get('$timeout');
    listHelper = $injector.get('ListHelper');

    //creating controller
    ctrl = $controller('DebitTransactionController', {
      $scope: scope,
      localize: localize,
      toastrFactory: toastrFactory,
      $timeout: timeout,
      FeatureFlagService: featureFlagServiceMock,
      FuseFlag: fuseFlagMock,
      StaticData: staticData,
    });

    scope.$apply();
  }));

  //controller
  it('DebitTransactionController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  //processProvidersList
  describe('processProvidersList function ->', function () {
    it('processProvidersList should return list of providers with preferred dentist and hygienist at top, if the preferred providers exists and are active', function () {
      var allProviders = [
        {
          FirstName: 'Inactive',
          LastName: 'Provider',
          IsActive: false,
          ProfessionalDesignation: 'Designation1',
          UserId: 1,
        },
        {
          FirstName: 'NotA',
          LastName: 'Provider',
          IsActive: true,
          ProfessionalDesignation: 'Designation2',
          UserId: 2,
        },
        {
          FirstName: 'Active',
          LastName: 'Provider',
          IsActive: true,
          ProfessionalDesignation: 'Designation3',
          UserId: 3,
        },
        {
          FirstName: 'Preferred',
          LastName: 'Dentist',
          IsActive: true,
          ProfessionalDesignation: 'Designation4',
          UserId: 4,
        },
        {
          FirstName: 'Preferred',
          LastName: 'Hygienist',
          IsActive: true,
          ProfessionalDesignation: 'Designation5',
          UserId: 5,
        },
      ];
      spyOn(ctrl, 'getProvidersOtherThanNotAProvider').and.callFake(
        function () {
          //Returning final list of active providers after removing preferred, inactive and not a provider users
          var providersOtherThanNotAProvider = [allProviders[2]];
          return providersOtherThanNotAProvider;
        }
      );
      spyOn(ctrl, 'retrievePreferredDentistAndHygienist').and.callFake(
        function () {
          ctrl.preferredDentist = allProviders[3];
          ctrl.preferredHygienist = allProviders[4];
        }
      );
      spyOn(ctrl, 'getListOfInactiveProviders').and.callFake(function () {
        var inactiveProviders = [allProviders[0]];
        return inactiveProviders;
      });

      var result = ctrl.processProvidersList(allProviders);

      expect(result.length).toBe(4);
      expect(result[0].ProfessionalDesignation).toEqual('Designation4');
      expect(result[1].ProfessionalDesignation).toEqual('Designation5');
      expect(result[2].ProfessionalDesignation).toEqual('Designation3');
      expect(result[3].ProfessionalDesignation).toEqual('Designation1');
    });

    it('processProvidersList should return list of providers, if the preferred providers does not exists', function () {
      var allProviders = [
        {
          FirstName: 'Inactive',
          LastName: 'Provider',
          IsActive: false,
          UserId: 1,
        },
        { FirstName: 'NotA', LastName: 'Provider', IsActive: true, UserId: 2 },
        {
          FirstName: 'Active',
          LastName: 'Provider',
          IsActive: true,
          UserId: 3,
        },
      ];
      spyOn(ctrl, 'getProvidersOtherThanNotAProvider').and.callFake(
        function () {
          //Returning final list of active providers after removing preferred, inactive and not a provider users
          var providersOtherThanNotAProvider = [allProviders[2]];
          return providersOtherThanNotAProvider;
        }
      );
      spyOn(ctrl, 'retrievePreferredDentistAndHygienist').and.callFake(
        function () {
          ctrl.preferredDentist = null;
          ctrl.preferredHygienist = null;
        }
      );
      spyOn(ctrl, 'getListOfInactiveProviders').and.callFake(function () {
        var inactiveProviders = [allProviders[0]];
        return inactiveProviders;
      });

      var result = ctrl.processProvidersList(allProviders);

      expect(result.length).toBe(2);
      expect(result[0].FirstName).toEqual('Active');
      expect(result[1].FirstName).toEqual('Inactive');
    });

    it('processProvidersList should return list of providers, if the preferred providers are inactive', function () {
      var allProviders = [
        {
          FirstName: 'Active',
          LastName: 'Provider',
          IsActive: true,
          UserId: 3,
        },
        {
          FirstName: 'InactivePreferred',
          LastName: 'Dentist',
          IsActive: false,
          UserId: 4,
        },
        {
          FirstName: 'InactivePreferred',
          LastName: 'Hygienist',
          IsActive: false,
          UserId: 5,
        },
      ];
      spyOn(ctrl, 'getProvidersOtherThanNotAProvider').and.callFake(
        function () {
          //Returning final list of active providers after removing preferred, inactive and not a provider users
          var providersOtherThanNotAProvider = [allProviders[0]];
          return providersOtherThanNotAProvider;
        }
      );
      spyOn(ctrl, 'retrievePreferredDentistAndHygienist').and.callFake(
        function () {
          ctrl.preferredDentist = allProviders[1];
          ctrl.preferredHygienist = allProviders[2];
        }
      );
      spyOn(ctrl, 'getListOfInactiveProviders').and.callFake(function () {
        var inactiveProviders = [allProviders[1], allProviders[2]];
        return inactiveProviders;
      });

      var result = ctrl.processProvidersList(allProviders);

      expect(result.length).toBe(3);
      expect(result[0].LastName).toEqual('Provider');
      expect(result[1].LastName).toEqual('Dentist');
      expect(result[2].LastName).toEqual('Hygienist');
    });
  });

  //getProvidersOtherThanNotAProvider
  describe('getProvidersOtherThanNotAProvider function ->', function () {
    it('getProvidersOtherThanNotAProvider should return a list of providers other than not a provider type(provider type id 4)', function () {
      var allProviders = [
        { ProviderTypeId: 1 },
        { ProviderTypeId: 2 },
        { ProviderTypeId: 3 },
        { ProviderTypeId: 4 },
        { ProviderTypeId: 5 },
      ];

      var result = ctrl.getProvidersOtherThanNotAProvider(allProviders);

      expect(result.length).toBe(4);
      expect(result[0].ProviderTypeId).toBe(1);
      expect(result[1].ProviderTypeId).toBe(2);
      expect(result[2].ProviderTypeId).toBe(3);
      expect(result[3].ProviderTypeId).toBe(5);
    });

    it('getProvidersOtherThanNotAProvider should not add a provider to the returned list if provider type id is not set', function () {
      var allProviders = [{ ProviderTypeId: null }];

      var result = ctrl.getProvidersOtherThanNotAProvider(allProviders);

      expect(result.length).toBe(0);
    });
  });

  //retrievePreferredDentistAndHygienist
  describe('retrievePreferredDentistAndHygienist function ->', function () {
    it('retrievePreferredDentistAndHygienist should set preferredDentist and remove it from providersOtherThanNotAProvider when patient have a preferred dentist', function () {
      var allProviders = [
        { UserId: 1, Name: 'PreferredDentist' },
        { UserId: 2, Name: 'OtherProvider' },
      ];
      ctrl.providersOtherThanNotAProvider = allProviders;
      ctrl.patientInfo = {
        PreferredDentist: allProviders[0].UserId,
        PreferredHygienist: null,
      };
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(
        allProviders[0]
      );
      spyOn(listHelper, 'findIndexByFieldValue').and.returnValue(0);
      ctrl.preferredDentist = null;
      ctrl.preferredHygienist = null;

      ctrl.retrievePreferredDentistAndHygienist(allProviders);

      expect(ctrl.preferredDentist.UserId).toBe(1);
      expect(ctrl.preferredDentist.Name).toBe('PreferredDentist');
      expect(ctrl.preferredHygienist).toBeNull();
      expect(ctrl.providersOtherThanNotAProvider.length).toBe(1);
      expect(ctrl.providersOtherThanNotAProvider[0].UserId).toBe(2);
      expect(ctrl.providersOtherThanNotAProvider[0].Name).toBe('OtherProvider');
    });

    it('retrievePreferredDentistAndHygienist should set preferredHygienist and remove it from providersOtherThanNotAProvider when patient have a preferred hygienist', function () {
      var allProviders = [
        { UserId: 1, Name: 'PreferredHygienist' },
        { UserId: 2, Name: 'OtherProvider' },
      ];
      ctrl.providersOtherThanNotAProvider = allProviders;
      ctrl.patientInfo = {
        PreferredDentist: null,
        PreferredHygienist: allProviders[0].UserId,
      };
      spyOn(listHelper, 'findItemByFieldValue').and.returnValue(
        allProviders[0]
      );
      spyOn(listHelper, 'findIndexByFieldValue').and.returnValue(0);
      ctrl.preferredDentist = null;
      ctrl.preferredHygienist = null;

      ctrl.retrievePreferredDentistAndHygienist(allProviders);

      expect(ctrl.preferredHygienist.UserId).toBe(1);
      expect(ctrl.preferredHygienist.Name).toBe('PreferredHygienist');
      expect(ctrl.preferredDentist).toBeNull();
      expect(ctrl.providersOtherThanNotAProvider.length).toBe(1);
      expect(ctrl.providersOtherThanNotAProvider[0].UserId).toBe(2);
      expect(ctrl.providersOtherThanNotAProvider[0].Name).toBe('OtherProvider');
    });
  });

  //getListOfInactiveProviders
  describe('getListOfInactiveProviders function ->', function () {
    it('should give a list of inactive providers from the list of providers other than "Not a Provider" type when preferredDentist and preferredHygienist are present but both are active', function () {
      ctrl.providersOtherThanNotAProvider = angular.copy(mockAllProviders);
      ctrl.preferredDentist = { IsActive: true };
      ctrl.preferredHygienist = { IsActive: true };
      var result = ctrl.getListOfInactiveProviders();

      expect(result.length).not.toBeLessThan(0);
    });

    it('should give a list of inactive providers from the list of providers other than "Not a Provider" type when preferredDentist and preferredHygienist are present and both are inactive', function () {
      ctrl.providersOtherThanNotAProvider = angular.copy(mockAllProviders);
      ctrl.preferredDentist = { IsActive: false };
      ctrl.preferredHygienist = { IsActive: false };
      var result = ctrl.getListOfInactiveProviders();

      expect(result.length).not.toBeLessThan(0);
    });

    it('should give a list of inactive providers from the list of providers other than "Not a Provider" type when preferredDentist and preferredHygienist are null', function () {
      ctrl.providersOtherThanNotAProvider = angular.copy(mockAllProviders);
      ctrl.preferredDentist = null;
      ctrl.preferredHygienist = null;
      var result = ctrl.getListOfInactiveProviders();

      expect(result.length).not.toBeLessThan(0);
    });
  });

  //isPreferred
  describe('isPreferred function ->', function () {
    it('should return null when patientInfo is not available', function () {
      ctrl.patientInfo = null;
      var result = scope.isPreferred({ ProviderId: 1 });

      expect(result).toBe(null);
    });

    it('should return true when passed data is preferred dentist', function () {
      ctrl.patientInfo = {
        PreferredDentist: 1,
        PreferredHygienist: 2,
      };
      var result = scope.isPreferred({ ProviderId: 1 });
      expect(result).toBe(true);
    });

    it('should return true when passed data is preferred hygienist', function () {
      ctrl.patientInfo = {
        PreferredDentist: 1,
        PreferredHygienist: 2,
      };
      var result = scope.isPreferred({ ProviderId: 2 });
      expect(result).toBe(true);
    });

    it('should return false when passed data is neither a preferred dentist nor a preferred hygienist', function () {
      ctrl.patientInfo = {
        PreferredDentist: 1,
        PreferredHygienist: 2,
      };
      var result = scope.isPreferred({ ProviderId: 3 });
      expect(result).toBe(false);
    });
  });

  describe('ctrl.setDateEntered ->', function () {
    it('should add the days difference between displayDate and transactionDto.$$DateEntered to transaction.DateEntered', function () {
      var displayDate = '2021-02-19 14:05:35';
      var transactionDto = {
        DateEntered: '2021-02-19 14:05:35',
        $$DateEntered: '2021-02-18 14:05:35',
      };
      ctrl.setDateEntered(transactionDto, displayDate);
      expect(moment(transactionDto.DateEntered).toDate()).toEqual(
        moment('2021-02-18 14:05:35').toDate()
      );
    });

    it('should not change transactionDto.DateEntered if difference is less than one day', function () {
      var displayDate = '2021-02-19 14:05:35';
      var transactionDto = {
        DateEntered: '2021-02-19 14:05:35',
        $$DateEntered: '2021-02-19 16:05:35',
      };
      ctrl.setDateEntered(transactionDto, displayDate);
      expect(transactionDto.DateEntered).toEqual('2021-02-19 14:05:35');
    });
  });

  describe('ctrl.getLocationTimezone ->', function () {
    it('should return the correct timezone by users current location', function (done) {
      ctrl.getLocationTimezone().then(function (tz) {
        expect(tz).toEqual('Central Standard Time');
        done();
      });
      scope.$apply();
    });
  });

  describe('ctrl.setDatesByTimeZone ->', function () {
    it('should call ctrl.getLocationTimezone to get current users location timezone', function () {
      spyOn(ctrl, 'getLocationTimezone').and.returnValue(
        $q.resolve('Central Standard Time')
      );
      ctrl.now = '2021-02-19 14:05:35';
      ctrl.setDatesByTimeZone();
      scope.$apply();
      expect(ctrl.getLocationTimezone).toHaveBeenCalled();
    });

    it('should call timeZoneFactoryMock.ConvertDateToMomentTZ with todays date based on timezone ', function () {
      spyOn(ctrl, 'getLocationTimezone').and.returnValue(
        $q.resolve('Central Standard Time')
      );
      ctrl.now = '2021-02-19 14:05:35';
      ctrl.setDatesByTimeZone();
      scope.$apply();
      expect(timeZoneFactoryMock.ConvertDateToMomentTZ).toHaveBeenCalledWith(
        '2021-02-19 14:05:35',
        'Central Standard Time'
      );
    });
  });


});
