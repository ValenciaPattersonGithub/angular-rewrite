
describe('PatientAdjustmentController ->', function () {
  var scope,
    ctrl,
    q,
    timeout,
    toastrFactory,
    listHelper,
    dataForModal,
    currentPatient,
    patientServices,
    paymentTypesService,
    filter,
    patSecurityService,
    rootScope;
  var localize,
    userServices,
    adjustmentTypesService,
    modalInstance,
    modalFactory,
    modalFactoryDeferred,
    data,
    element,
    controller,
    shareData,
    claimsService,
    businessCenterServices;
  var referenceDataService,
    financialService,
    timeZoneFactory,
    mockWaitOverlayService;
  var mockAdjustmentTypeList = [
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
      AdjustmentTypeId: 'ecae78ec-4278-4287-8728-21b6e861066e',
      Description: 'Negative Adjustment 1',
      IsActive: true,
      IsPositive: false,
      IsSystemType: false,
      IsAdjustmentTypeAssociatedWithTransactions: true,
      DataTag:
        '{"Timestamp":"2015-09-29T14:55:24.3365128+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A55%3A24.3365128Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T14:55:22.9189097Z',
    },
    {
      AdjustmentTypeId: 'f5e5dc20-ce71-4a5c-8bb6-ada9fa053e60',
      Description: 'Negative Adjustment 2',
      IsActive: true,
      IsPositive: false,
      IsSystemType: false,
      IsAdjustmentTypeAssociatedWithTransactions: true,
      DataTag:
        '{"Timestamp":"2015-09-29T14:55:31.5904456+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A55%3A31.5904456Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T14:55:30.4858203Z',
    },
    {
      AdjustmentTypeId: '607093a1-2f1c-432f-aeac-b6e8fe67094d',
      Description: 'Negative Adjustment 3',
      IsActive: false,
      IsPositive: false,
      IsSystemType: false,
      IsAdjustmentTypeAssociatedWithTransactions: false,
      DataTag:
        '{"Timestamp":"2015-09-29T14:55:48.1595729+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A55%3A48.1595729Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T14:55:46.8804392Z',
    },
    {
      AdjustmentTypeId: '8d9f7bb2-7a63-4c84-afbc-5b7a7acea977',
      Description: 'Negative Adjustment 4',
      IsActive: true,
      IsPositive: false,
      IsSystemType: false,
      IsAdjustmentTypeAssociatedWithTransactions: false,
      DataTag:
        '{"Timestamp":"2015-09-29T14:55:54.9014411+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A55%3A54.9014411Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T14:55:53.7132868Z',
    },
    {
      AdjustmentTypeId: '3a0af9b3-4db7-4e22-bc40-8a776dca0bb3',
      Description: 'Negative Adjustment 5',
      IsActive: false,
      IsPositive: false,
      IsSystemType: false,
      IsAdjustmentTypeAssociatedWithTransactions: false,
      DataTag:
        '{"Timestamp":"2015-09-29T14:56:08.2131486+00:00","RowVersion":"W/\\"datetime\'2015-09-29T14%3A56%3A08.2131486Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-09-29T14:56:07.0064726Z',
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

  //mock claimsService
  mockWaitOverlayService = {
    open: jasmine.createSpy(),
  };

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

  var mockTransactionsList = [
    {
      CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
      LocationId: 14601,
      AccountId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
      AdjustmentTypeId: null,
      Amount: -20.11,
      ClaimId: null,
      DateEntered: '2015-10-05T11:45:20.614Z',
      Description: '1234',
      PaymentTypePromptValue: null,
      EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
      Note: null,
      PaymentTypeId: '2f9dc9c9-8294-4395-93d1-49a904d2d070',
      TransactionTypeId: 2,
      CreditTransactionDetails: [
        {
          CreditTransactionDetailId: '46ee5116-ad4f-41c8-b8ff-01d6843cce5d',
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: -5.05,
          AppliedToServiceTransationId: '7f323705-a62c-4129-8681-3756119e6e4b',
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          DateEntered: '2015-10-05T11:45:20.614Z',
          EncounterId: '6a9fb40e-649b-4022-9e26-fbabcf61aa55',
          ProviderUserId: 'cf0e2663-80f5-43ad-89d4-4416a6111521',
          AppliedToDebitTransactionId: null,
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T11:45:41.6659051Z',
        },
        {
          CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: -9,
          AppliedToServiceTransationId: null,
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          DateEntered: '2015-10-05T11:45:20.614Z',
          EncounterId: null,
          ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
          AppliedToDebitTransactionId: null,
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T11:45:40.6944316Z',
        },
        {
          CreditTransactionDetailId: 'ad8829b1-74c8-41d6-929b-89c924f36cea',
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: -6.06,
          AppliedToServiceTransationId: 'cd0326d1-aebf-4ee5-9b7a-b63efa01054a',
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          DateEntered: '2015-10-05T11:45:20.614Z',
          EncounterId: '6a9fb40e-649b-4022-9e26-fbabcf61aa55',
          ProviderUserId: '517ce215-b71b-408f-8b20-62a4c1386f77',
          AppliedToDebitTransactionId: null,
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T11:45:40.2187017Z',
        },
      ],
      IsDeleted: false,
      DataTag:
        '{"Timestamp":"2015-10-05T11:45:43.290382+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.290382Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-10-05T11:45:39.8280813Z',
      UnassignedAmount: -9,
    },
    {
      CreditTransactionId: '8566173a-c7ef-425c-bf12-42b0511b1809',
      LocationId: 14601,
      AccountId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
      AdjustmentTypeId: 'e7ca533c-6710-4002-8d97-8f7c1f38195b',
      Amount: -10,
      ClaimId: null,
      DateEntered: '2015-10-05T12:50:01.008Z',
      Description: 'Adjust negative - Test',
      PaymentTypePromptValue: null,
      EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
      Note: 'Test',
      PaymentTypeId: null,
      TransactionTypeId: 4,
      CreditTransactionDetails: [
        {
          CreditTransactionDetailId: '8af20291-9bf8-410b-86af-fbd09a1c1bad',
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: -10,
          AppliedToServiceTransationId: null,
          CreditTransactionId: '8566173a-c7ef-425c-bf12-42b0511b1809',
          DateEntered: '2015-10-05T12:50:01.008Z',
          EncounterId: null,
          ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
          AppliedToDebitTransactionId: null,
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T12:50:37.6285473+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A50%3A37.6285473Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T12:50:36.8912707Z',
        },
      ],
      IsDeleted: false,
      DataTag:
        '{"Timestamp":"2015-10-05T12:50:38.2660068+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A50%3A38.2660068Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '2015-10-05T12:50:33.495256Z',
      UnassignedAmount: -10,
    },
  ];
  
  const currencyTypes = {
    Value: [
      { Id: 1, Name: 'CASH' },
      { Id: 2, Name: 'CHECK' },
      { Id: 3, Name: 'CREDIT CARD' },
      { Id: 4, Name: 'DEBIT CARD' },
      { Id: 5, Name: 'OTHER' },
    ],
  };
  var staticData = {
    CurrencyTypes: jasmine.createSpy('staticData.CurrencyTypes').and.returnValue({ then: jasmine.createSpy().and.returnValue(currencyTypes) }),
    PaymentProviders: jasmine.createSpy('staticData.PaymentProviders').and.returnValue({ OpenEdge: 0, TransactionsUI: 1 }),
  };
  var window;
  var paymentGatewayService;
 
  var $sce;
  function createController() {
    ctrl = controller('PatientAdjustmentController', {
      $scope: scope,
      $rootScope:rootScope,
      $uibModalInstance: modalInstance,
      toastrFactory: toastrFactory,
      ModalFactory: modalFactory,
      localize: localize,
      PatientServices: patientServices,
      DataForModal: dataForModal,
      CurrentPatient: currentPatient,
      UserServices: userServices,
      NewAdjustmentTypesService: adjustmentTypesService,
      PaymentTypesService: paymentTypesService,
      patSecurityService: patSecurityService,
      ListHelper: listHelper,
      ShareData: shareData,
      ClaimsService: claimsService,
      BusinessCenterServices: businessCenterServices,
      SaveStates: { Delete: 'Delete' },
      FinancialService: financialService,
      TimeZoneFactory: timeZoneFactory,
      WaitOverlayService: mockWaitOverlayService,
      StaticData: staticData,
      $window: window,
      PaymentGatewayService:paymentGatewayService,
      $sce: $sce  
     });

    spyOn(scope, 'disableApply');
    spyOn(scope, 'clearPaypageModal');
    scope.$apply();
  }

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          locations: 'locations',
        },
      };

      $provide.value('referenceDataService', referenceDataService);
      
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $q, _$window_, _$sce_) {
    rootScope=$rootScope;
    scope = $rootScope.$new();
    controller = $controller;
    window = _$window_;
    q = $q;
    $sce = _$sce_;
    referenceDataService.getData.and.returnValue(
      $q.resolve([
        { LocationId: 14601, IsPaymentGatewayEnabled: true },
        { LocationId: '101', IsPaymentGatewayEnabled: true },
      ])
    );

    //mock for modalInstance
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };
    var userLocation = '{"id": "101"}';
    sessionStorage.setItem('userLocation', userLocation);
    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error'),
    };

    //mock of ModalFactory
    modalFactory = {
      ConfirmModal: jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      LoadingModal: jasmine
        .createSpy('modalFactory.LoadingModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      LoadingModalWithoutTemplate: jasmine
        .createSpy('modalFactory.LoadingModalWithoutTemplate')
        .and.returnValue(q.resolve(1)),
      // .and.callFake(function () {
      //     modalFactoryDeferred = q.defer();
      //     modalFactoryDeferred.resolve(1);
      //     return {
      //         result: modalFactoryDeferred.promise,
      //         then: function () { }
      //     };
      // })
    };

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    //mock for patientServices
    patientServices = {
      DebitTransaction: {
        createDebitTransaction: jasmine
          .createSpy('patientServices.DebitTransaction.createDebitTransaction')
          .and.returnValue(''),
        getDebitTransactionsByAccountMemberId: jasmine
          .createSpy(
            'patientServices.DebitTransaction.getDebitTransactionsByAccountMemberId'
          )
          .and.returnValue(''),
        getDebitTransactionsByAccountId: jasmine
          .createSpy(
            'patientServices.DebitTransaction.getDebitTransactionsByAccountId'
          )
          .and.returnValue(''),
      },
      CreditTransactions: {
        create: jasmine
          .createSpy('patientServices.CreditTransactions.create')
          .and.returnValue(''),
        update: jasmine
          .createSpy('patientServices.CreditTransactions.update')
          .and.returnValue(''),
        creditDistribution: jasmine
          .createSpy('patientServices.CreditTransactions.creditDistribution')
          .and.returnValue(''),
        applyUnappliedCreditTransaction: jasmine
          .createSpy(
            'patientServices.CreditTransactions.applyUnappliedCreditTransaction'
          )
          .and.returnValue(''),
        payPageRequest: jasmine.createSpy().and.callFake(() => {
            return {
                $promise: {
                    then: (res, error) => {
                        res({ Value: { PaymentGatewayTransactionId: 4713,PaypageUrl: "https://web.test.paygateway.com/paypage/v1/sales/123"} });
                    },
            },
        };
    }),
      },
      ServiceTransactions: {
        getServiceTransactionsByAccountMemberId: jasmine
          .createSpy(
            'patientServices.ServiceTransactions.getServiceTransactionsByAccountMemberId'
          )
          .and.returnValue(''),
      },
      Account: {
        getByPersonId: jasmine.createSpy().and.returnValue(''),
        getAllAccountMembersByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
        getAccountMembersDetailByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
      },
      Patients: {
        get: jasmine.createSpy(),
      },

    
    };

    paymentGatewayService = {
      createPaymentProviderCreditOrDebitPayment: jasmine.createSpy('createPaymentProviderCreditOrDebitPayment').and.callFake(() => {
        return {
          $promise: {
          then: (res, error) => {
              res( { Value: { PaymentGatewayTransactionId: 4713} });
              error({});
          }
          },
      };
      }),

      completeCreditTransaction: jasmine.createSpy('completeCreditTransaction')
    };

    //mock claimsService
    claimsService = {
      getClaimEntityByClaimId: jasmine.createSpy(),
    };

    //mock businessCenterServices
    businessCenterServices = {
      BenefitPlan: {
        get: jasmine.createSpy('get').and.returnValue({
          $promise: {
            then: function () {},
          },
        }),
      },
    };

    //mock for userServices
    userServices = {
      Users: {
        get: jasmine.createSpy('userServices.Users.get').and.returnValue(''),
      },
    };

    //mock for adjustmentTypesService
    adjustmentTypesService = {
      get: jasmine.createSpy('adjustmentTypesService.get').and.returnValue(''),
    };

    //mock for paymentTypesService
    paymentTypesService = {
      get: jasmine.createSpy('paymentTypesService.get').and.returnValue(''),
    };

    //mock for patSecurityService
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
      generateMessage: jasmine
        .createSpy('patSecurityService.generateMessage')
        .and.returnValue(''),
    };

    //mock for listHelper service
    var mockCreditTransactionDetailsForDisplay = [
      {
        AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
        AppliedToServiceTransactionId: 'ead11976-2c09-4691-a32b-a6bd3f19b0b1',
        Balance: 0,
        CreditTransactionDetailId: '82211431-4cbf-4dbb-88f2-ceb10896c41e',
        Amount: -1,
        CreditTransactionId: 'b5bca4ff-bf00-4b1c-9b8b-e4a17e54cf52',
        AdjustmentAmount: 0,
      },
    ];

    listHelper = {
      findItemsByFieldValue: jasmine
        .createSpy('listHelper.findItemsByFieldValue')
        .and.returnValue(mockCreditTransactionDetailsForDisplay),
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({}),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0),
    };

    // mock of credit transaction dto
    var mockCreditTransactionDto = {
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
    //mock for shareData
    shareData = {
      accountMembersDetail: null,
    };

    //mock for financialService
    financialService = {
      calculateAccountAndInsuranceBalances: jasmine
        .createSpy('financialService.calculateAccountAndInsuranceBalnaces')
        .and.returnValue(0),
    };

    //mock for dataForModal
    dataForModal = {
      AccountMembersList: {
        Value: [
          {
            AccountMemberId: 1000,
            PersonId: 101,
          },
        ],
      },
      AccountMembersDetail: {
        Value: [{ PatientId: 101, FirstName: 'John', LastName: 'Doe' }],
      },

      PatientAccountDetails: {
        AccountId: 1000,
        AccountMemberId: 2000,
      },
      DefaultSelectedIndex: 1,
      CurrentPatient: {
        Value: {
          FirstName: 'First',
          LastName: 'Last',
          MiddleName: 'Middle',
          PreferredName: 'Preferred',
          Suffix: 'Suffix',
          PrefferedDentist: 3000,
          PreferredHygienist: 4000,
          PersonAccount: {
            AccountId: 1000,
            PersonAccountMember: {
              AccountMemberId: 2000,
            },
          },
        },
      },
      AllProviders: mockAllProvidersList,
      PaymentTypes: {
        Value: mockPaymentTypesList,
      },
      AdjustmentTypes: {
        Value: mockAdjustmentTypeList,
      },
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
      UnappliedTransactions: mockTransactionsList,
      NegativeAdjustmentData: {},
    };

    timeZoneFactory = {
      ConvertDateToMomentTZ: jasmine
        .createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
        .and.callFake(function (date) {
          return moment(date);
        }),
      ConvertDateTZString: jasmine
        .createSpy('timeZoneFactory.ConvertDateTZString')
        .and.callFake(function (date) {
          return date;
        }),
    };
    //creating controller
    createController();

    //injecting required dependencies
    timeout = $injector.get('$timeout');
    //listHelper = $injector.get('ListHelper');
    filter = $injector.get('$filter');

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
      get: jasmine.createSpy(),
      val: jasmine.createSpy(),
    };
    spyOn(angular, 'element').and.returnValue(element);
  }));

  //controller
  it('PatientAdjustmentController : should check if controller exists when dataForModal.DefaultSelectedIndex == 1', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  it('PatientAdjustmentController : should check if controller exists when dataForModal.DefaultSelectedIndex == 2', function () {
    //mock for dataForModal
    dataForModal = {
      PatientAccountDetails: {
        AccountId: 1000,
        AccountMemberId: 2000,
      },

      DefaultSelectedIndex: 2,
      CurrentPatient: {
        Value: {
          FirstName: 'First',
          LastName: 'Last',
          MiddleName: 'Middle',
          PreferredName: 'Preferred',
          Suffix: 'Suffix',
          PrefferedDentist: 3000,
          PreferredHygienist: 4000,
          PersonAccount: {
            AccountId: 1000,
            PersonAccountMember: {
              AccountMemberId: 2000,
            },
          },
        },
      },
      AllProviders: mockAllProvidersList,
      PaymentTypes: {
        Value: mockPaymentTypesList,
      },
      AdjustmentTypes: {
        Value: mockAdjustmentTypeList,
      },
    };
    createController();

    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  //authAddAccountPaymentAccess
  describe('authAddAccountPaymentAccess function ->', function () {
    it('should call patSecurityService.IsAuthorizedByAbbreviation service method', function () {
      ctrl.authAddAccountPaymentAccess();

      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(ctrl.soarAuthAddAccountPaymentKey);
    });
  });

  //authAddCreditTransactionAccess
  describe('authAddCreditTransactionAccess function ->', function () {
    it('should call patSecurityService.IsAuthorizedByAbbreviation service method', function () {
      ctrl.authAddCreditTransactionAccess();

      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(ctrl.soarAuthAddCreditAdjustmentKey);
    });
  });

  //authAddDebitTransactionAccess
  describe('authAddDebitTransactionAccess function ->', function () {
    it('should call patSecurityService.IsAuthorizedByAbbreviation service method', function () {
      ctrl.authAddDebitTransactionAccess();

      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(ctrl.soarAuthAddDebitTransactionKey);
    });
  });

  //notifyNotAuthorized
  describe('notifyNotAuthorized function ->', function () {
    it('should throw error message when access is not present', function () {
      var authMessageKey = 'Auth key';

      ctrl.notifyNotAuthorized(authMessageKey);

      expect(toastrFactory.error).toHaveBeenCalled();
      expect(_$location_.path).toHaveBeenCalledWith('/');
    });
  });

  //authAccess
  describe('authAccess function ->', function () {
    it('should call notifyNotAuthorized to throw error when debit adjustment add access is not present for selectedOption 0', function () {
      var selectedOption = 0;
      spyOn(ctrl, 'authAddDebitTransactionAccess').and.returnValue(false);
      spyOn(ctrl, 'notifyNotAuthorized');

      ctrl.authAccess(selectedOption);

      expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
      expect(scope.soarAuthPaymentOrAdjustmentAccessKey).toEqual(
        ctrl.soarAuthAddDebitTransactionKey
      );
    });

    it('should not call notifyNotAuthorized to throw error when debit adjustment add access is present for selectedOption 0', function () {
      var selectedOption = 0;
      spyOn(ctrl, 'authAddDebitTransactionAccess').and.returnValue(true);
      spyOn(ctrl, 'notifyNotAuthorized');

      ctrl.authAccess(selectedOption);

      expect(ctrl.notifyNotAuthorized).not.toHaveBeenCalled();
      expect(scope.soarAuthPaymentOrAdjustmentAccessKey).toEqual(
        ctrl.soarAuthAddDebitTransactionKey
      );
    });

    it('should call notifyNotAuthorized to throw error when credit adjustment add access is not present for selectedOption 1', function () {
      var selectedOption = 1;
      spyOn(ctrl, 'authAddCreditTransactionAccess').and.returnValue(false);
      spyOn(ctrl, 'notifyNotAuthorized');

      ctrl.authAccess(selectedOption);

      expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
      expect(scope.soarAuthPaymentOrAdjustmentAccessKey).toEqual(
        ctrl.soarAuthAddCreditAdjustmentKey
      );
    });

    it('should not call notifyNotAuthorized to throw error when credit adjustment add access is present for selectedOption 1', function () {
      var selectedOption = 1;
      spyOn(ctrl, 'authAddCreditTransactionAccess').and.returnValue(true);
      spyOn(ctrl, 'notifyNotAuthorized');

      ctrl.authAccess(selectedOption);

      expect(ctrl.notifyNotAuthorized).not.toHaveBeenCalled();
      expect(scope.soarAuthPaymentOrAdjustmentAccessKey).toEqual(
        ctrl.soarAuthAddCreditAdjustmentKey
      );
    });

    it('should call notifyNotAuthorized to throw error when account payment add access is not present for selectedOption 2', function () {
      var selectedOption = 2;
      spyOn(ctrl, 'authAddAccountPaymentAccess').and.returnValue(false);
      spyOn(ctrl, 'notifyNotAuthorized');

      ctrl.authAccess(selectedOption);

      expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
      expect(scope.soarAuthPaymentOrAdjustmentAccessKey).toEqual(
        ctrl.soarAuthAddAccountPaymentKey
      );
    });

    it('should not call notifyNotAuthorized to throw error when account payment add access is present for selectedOption 2', function () {
      var selectedOption = 2;
      spyOn(ctrl, 'authAddAccountPaymentAccess').and.returnValue(true);
      spyOn(ctrl, 'notifyNotAuthorized');

      ctrl.authAccess(selectedOption);

      expect(ctrl.notifyNotAuthorized).not.toHaveBeenCalled();
      expect(scope.soarAuthPaymentOrAdjustmentAccessKey).toEqual(
        ctrl.soarAuthAddAccountPaymentKey
      );
    });

    it('should call notifyNotAuthorized to throw error when credit transaction add access is not present for selectedOption other than 0, 1 or 2', function () {
      var selectedOption = 10;
      spyOn(ctrl, 'authAddCreditTransactionAccess').and.returnValue(false);
      spyOn(ctrl, 'notifyNotAuthorized');

      ctrl.authAccess(selectedOption);

      expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
      expect(scope.soarAuthPaymentOrAdjustmentAccessKey).toEqual(
        ctrl.soarAuthAddCreditAdjustmentKey
      );
    });

    it('should not call notifyNotAuthorized to throw error when credit transaction add access is present for selectedOption other than 0, 1 or 2', function () {
      var selectedOption = 10;
      spyOn(ctrl, 'authAddCreditTransactionAccess').and.returnValue(true);
      spyOn(ctrl, 'notifyNotAuthorized');

      ctrl.authAccess(selectedOption);

      expect(ctrl.notifyNotAuthorized).not.toHaveBeenCalled();
      expect(scope.soarAuthPaymentOrAdjustmentAccessKey).toEqual(
        ctrl.soarAuthAddCreditAdjustmentKey
      );
    });
  });

  //getServiceTransactionsByAccountMemberIdSuccess
  describe('getServiceTransactionsByAccountMemberIdSuccess function ->', function () {
    it("should filter out greater than 0 balance serviceTransactionDtos with successResponse's value and process the data", function () {
      scope.serviceTransactions = [];
      var successResponse = {
        Value: [
          { Id: 1, Balance: 10 },
          { Id: 2, Balance: 0 },
        ],
      };

      ctrl.getServiceTransactionsByAccountMemberIdSuccess(successResponse);

      expect(scope.serviceTransactions.length).toBe(2);
      expect(scope.serviceTransactions[0].Id).toBe(1);
      expect(scope.serviceTransactions[0].Balance).toBe(10);
    });
  });

  //In clase of negative adjustment during closing claim getServiceTransactionsByAccountMemberIdSuccess should work properly
  describe('In clase of negative adjustment during closing claim: getServiceTransactionsByAccountMemberIdSuccess function ->', function () {
    it("In clase of negative adjustment during closing claim: function should filter out greater than 0 balance serviceTransactionDtos from successResponse's value having ids same as the service transactions ids of selected claims", function () {
      //mock for dataForModal
      dataForModal = {
        PatientAccountDetails: {
          AccountId: 1000,
          AccountMemberId: 2000,
        },

        DefaultSelectedIndex: 2,
        CurrentPatient: {
          Value: {
            FirstName: 'First',
            LastName: 'Last',
            MiddleName: 'Middle',
            PreferredName: 'Preferred',
            Suffix: 'Suffix',
            PrefferedDentist: 3000,
            PreferredHygienist: 4000,
            PersonAccount: {
              AccountId: 1000,
              PersonAccountMember: {
                AccountMemberId: 2000,
              },
            },
          },
        },
        AllProviders: mockAllProvidersList,
        PaymentTypes: {
          Value: mockPaymentTypesList,
        },
        AdjustmentTypes: {
          Value: mockAdjustmentTypeList,
        },
      };

      //data for modal having additional properites in case of closing claim
      dataForModal.serviceTransactionData = {
        serviceTransactions: [1],
        isForCloseClaim: true,
        unPaidAmout: 475,
      };
      createController();
      scope.serviceTransactions = [];
      var successResponse = {
        Value: [
          { ServiceTransactionId: 1, Balance: 10 },
          { ServiceTransactionId: 2, Balance: 0 },
        ],
      };

      ctrl.getServiceTransactionsByAccountMemberIdSuccess(successResponse);

      expect(scope.serviceTransactions.length).toBe(1);
      expect(scope.serviceTransactions[0].ServiceTransactionId).toBe(1);
      expect(scope.serviceTransactions[0].Balance).toBe(10);
    });
  });

  //getServiceTransactionsByAccountMemberIdFailure
  describe('getServiceTransactionsByAccountMemberIdFailure function ->', function () {
    it('should call toastrFactory.error', function () {
      var errorResponse = {};
      scope.dataForCreditTransaction = { ServiceAndDebitTransactionDtos: [] };
      ctrl.getServiceTransactionsByAccountMemberIdFailure(errorResponse);

      expect(toastrFactory.error).toHaveBeenCalled();
      expect(
        scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.length
      ).toBe(0);
    });
  });

  //getDebitTransactionsByAccountMemberIdSuccess
  describe('getDebitTransactionsByAccountMemberIdSuccess function->', function () {
    it("should filter out debitTransactionDtos with greater than 0 balance and transaction type id equal to 5 or 6 with successResponse's value and process the data", function () {
      scope.debitTransactionDtos = [];
      var successResponse = {
        Value: [
          { Id: 1, Balance: 10, TransactionTypeId: 5 },
          { Id: 1, Balance: 0, TransactionTypeId: 6 },
          { Id: 1, Balance: 20, TransactionTypeId: 8 },
        ],
      };

      ctrl.getDebitTransactionsByAccountMemberIdSuccess(successResponse);

      expect(scope.debitTransactions.length).toBe(2);
    });

    it("should filter out debitTransactionDtos with greater than 0 balance and transaction type id equal to 5 with successResponse's value when there is no debit transaction with balance greater than 0 and process the data", function () {
      scope.debitTransactionDtos = [];
      var successResponse = {
        Value: [{ Id: 1, Balance: 0, TransactionTypeId: 5 }],
      };

      ctrl.getDebitTransactionsByAccountMemberIdSuccess(successResponse);

      expect(scope.debitTransactions.length).toBe(1);
    });
  });

  //getDebitTransactionsByAccountMemberIdFailure
  describe('getDebitTransactionsByAccountMemberIdFailure function->', function () {
    it('should call toastrFactory.error', function () {
      var errorResponse = {};

      ctrl.getDebitTransactionsByAccountMemberIdFailure(errorResponse);

      expect(toastrFactory.error).toHaveBeenCalled();
      expect(scope.debitTransactions.length).toBe(0);
    });
  });

  //processServiceTransactionData
  describe('processServiceTransactionData function ->', function () {
    it('should set patient name and adjustment amount for each service transaction', function () {
      scope.serviceAndDebitTransactionDtos = [
        { Id: 1, DateEntered: new Date(), PatientName: '' },
        { Id: 2, DateEntered: new Date(), PatientName: '' },
      ];
      ctrl.patientInfo = { FirstName: 'First', LastName: 'Last' };

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(ctrl.patientInfo);
      ctrl.processServiceTransactionData();
      expect(scope.serviceAndDebitTransactionDtos.length).toBe(2);
      expect(scope.serviceAndDebitTransactionDtos[0].PatientName).toBe(
        'First L.'
      );
      expect(scope.serviceAndDebitTransactionDtos[0].AdjustmentAmount).toBe(0);
      expect(scope.serviceAndDebitTransactionDtos[0].UnixTimeStamp).toBe(
        moment(
          new Date(
            moment(scope.serviceAndDebitTransactionDtos[0].DateEntered).format(
              'MM/DD/YYYY'
            )
          )
        ).unix()
      );
      expect(scope.serviceAndDebitTransactionDtos[1].PatientName).toBe(
        'First L.'
      );
      expect(scope.serviceAndDebitTransactionDtos[1].AdjustmentAmount).toBe(0);
      expect(scope.serviceAndDebitTransactionDtos[1].UnixTimeStamp).toBe(
        moment(
          new Date(
            moment(scope.serviceAndDebitTransactionDtos[1].DateEntered).format(
              'MM/DD/YYYY'
            )
          )
        ).unix()
      );
    });

    /**
     * This test case is for the scenario when account detail is present in shareData. The implementation needed to change
     * to not use the data from shareData, because it will not be correct in the case of bulk payment or ERA use. The share
     * data is only loaded from the Account Summary page for a patient and never cleared. After that if the user tries to
     * go to the bulk insurance payments page it will incorrectly use the shareData and not be able to find the patient name.
     * I have left this test case in place to demonstrate that it will no longer use the shareData going forward and to document
     * the change in behavior.
     */
    it('should set patient name for each service transaction when account detail is present is shareData', function () {
      shareData.accountMembersDetail = [{ accountMemberId: 200 }];
      scope.serviceAndDebitTransactionDtos = [
        {
          Id: 1,
          DateEntered: new Date(),
          PatientName: '',
          AccountMemberId: 100,
        },
        {
          Id: 2,
          DateEntered: new Date(),
          PatientName: '',
          AccountMemberId: 100,
        },
      ];
      dataForModal.AccountMembersList.Value = [
        { AccountMemberId: 100, PersonId: 100 },
      ];
      dataForModal.AccountMembersDetail.Value = [
        { PatientId: 100, FirstName: 'First', LastName: 'Last' },
      ];

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.callFake(function (list, fieldName, fieldValue) {
          return list.find(function (item) {
            return item[fieldName] === fieldValue;
          });
        });
      ctrl.processServiceTransactionData();
      expect(scope.serviceAndDebitTransactionDtos.length).toBe(2);
      expect(scope.serviceAndDebitTransactionDtos[0].PatientName).toBe(
        'First L.'
      );
      expect(scope.serviceAndDebitTransactionDtos[0].AdjustmentAmount).toBe(0);
      expect(scope.serviceAndDebitTransactionDtos[0].UnixTimeStamp).toBe(
        moment(
          new Date(
            moment(scope.serviceAndDebitTransactionDtos[0].DateEntered).format(
              'MM/DD/YYYY'
            )
          )
        ).unix()
      );
      expect(scope.serviceAndDebitTransactionDtos[1].PatientName).toBe(
        'First L.'
      );
      expect(scope.serviceAndDebitTransactionDtos[1].AdjustmentAmount).toBe(0);
      expect(scope.serviceAndDebitTransactionDtos[1].UnixTimeStamp).toBe(
        moment(
          new Date(
            moment(scope.serviceAndDebitTransactionDtos[1].DateEntered).format(
              'MM/DD/YYYY'
            )
          )
        ).unix()
      );
    });
  });

  describe('buildTransactionForDisplay function->', function () {
    it('should return updated transaction in serviceAndDebitTransactionDtos with updated AjustmentAmount and Balance When isChangingAdjustmentOrPayment is true and current transaction balance greater than zero', function () {
      ctrl.serviceAndDebitTransactionDtos = [];
      var transaction = {
        AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
        Amount: 15,
        Balance: 14,
        EncounterId: '27d96ad3-6290-4731-ae9f-50bbfd124fe5',
        EnteredByUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        ServiceTransactionId: 'ead11976-2c09-4691-a32b-a6bd3f19b0b1',
      };

      ctrl.currentUnappliedTransaction = {
        Amount: 15,
        Balance: 0,
        AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
        UnassignedAmount: 14,
        transactionTypeId: 4,
      };

      ctrl.currentUnappliedTransaction.CreditTransactionDetails = [];
      ctrl.currentUnappliedTransaction.CreditTransactionDetails = [
        {
          AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
          Amount: -14,
          CreditTransactionDetailId: 'b0eb5fce-9255-4867-822e-90edcce456a8',
          CreditTransactionId: 'b5bca4ff-bf00-4b1c-9b8b-e4a17e54cf52',
        },
        {
          AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
          Amount: -1,
          CreditTransactionDetailId: '82211431-4cbf-4dbb-88f2-ceb10896c41e',
          CreditTransactionId: 'b5bca4ff-bf00-4b1c-9b8b-e4a17e54cf52',
          AppliedToServiceTransactionId: 'ead11976-2c09-4691-a32b-a6bd3f19b0b1',
        },
      ];
      scope.isChangingAdjustmentOrPayment = true;

      ctrl.buildTransactionForDisplay(transaction, true);

      expect(ctrl.serviceAndDebitTransactionDtos.length).toBe(1);
      expect(ctrl.serviceAndDebitTransactionDtos[0].AdjustmentAmount).toBe(1);
      expect(ctrl.serviceAndDebitTransactionDtos[0].Balance).toBe(15);
    });

    it('should return updated transaction in serviceAndDebitTransactionDtos When isChangingAdjustmentOrPayment is false and current transaction balance greater than zero', function () {
      ctrl.serviceAndDebitTransactionDtos = [];
      var transaction = {
        AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
        Amount: 15,
        Balance: 14,
        EncounterId: '27d96ad3-6290-4731-ae9f-50bbfd124fe5',
        EnteredByUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        ServiceTransactionId: 'ead11976-2c09-4691-a32b-a6bd3f19b0b1',
      };

      ctrl.currentUnappliedTransaction = {
        Amount: 15,
        Balance: 0,
        AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
        UnassignedAmount: 14,
        transactionTypeId: 4,
      };

      ctrl.currentUnappliedTransaction.CreditTransactionDetails = [];
      ctrl.currentUnappliedTransaction.CreditTransactionDetails = [
        {
          AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
          Amount: -14,
          CreditTransactionDetailId: 'b0eb5fce-9255-4867-822e-90edcce456a8',
          CreditTransactionId: 'b5bca4ff-bf00-4b1c-9b8b-e4a17e54cf52',
        },
        {
          AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
          Amount: -1,
          CreditTransactionDetailId: '82211431-4cbf-4dbb-88f2-ceb10896c41e',
          CreditTransactionId: 'b5bca4ff-bf00-4b1c-9b8b-e4a17e54cf52',
          AppliedToServiceTransactionId: 'ead11976-2c09-4691-a32b-a6bd3f19b0b1',
        },
      ];
      scope.isChangingAdjustmentOrPayment = false;
      ctrl.buildTransactionForDisplay(transaction, true);

      expect(ctrl.serviceAndDebitTransactionDtos.length).toBe(1);
      expect(ctrl.serviceAndDebitTransactionDtos[0]).toEqual(transaction);
    });

    it('should return updated transaction in serviceAndDebitTransactionDtos When isChangingAdjustmentOrPayment is true  and current transaction balance is -2', function () {
      ctrl.serviceAndDebitTransactionDtos = [];
      var transaction = {
        AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
        Amount: 15,
        Balance: -2,
        EncounterId: '27d96ad3-6290-4731-ae9f-50bbfd124fe5',
        EnteredByUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        ServiceTransactionId: 'ead11976-2c09-4691-a32b-a6bd3f19b0b1',
      };

      ctrl.currentUnappliedTransaction = {
        Amount: 15,
        Balance: 0,
        AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
        UnassignedAmount: 14,
        transactionTypeId: 4,
      };

      ctrl.currentUnappliedTransaction.CreditTransactionDetails = [];
      ctrl.currentUnappliedTransaction.CreditTransactionDetails = [
        {
          AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
          Amount: -14,
          CreditTransactionDetailId: 'b0eb5fce-9255-4867-822e-90edcce456a8',
          CreditTransactionId: 'b5bca4ff-bf00-4b1c-9b8b-e4a17e54cf52',
        },
        {
          AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
          Amount: -1,
          CreditTransactionDetailId: '82211431-4cbf-4dbb-88f2-ceb10896c41e',
          CreditTransactionId: 'b5bca4ff-bf00-4b1c-9b8b-e4a17e54cf52',
          AppliedToServiceTransactionId: 'ead11976-2c09-4691-a32b-a6bd3f19b0b1',
        },
      ];
      scope.isChangingAdjustmentOrPayment = true;

      ctrl.buildTransactionForDisplay(transaction, true);

      expect(ctrl.serviceAndDebitTransactionDtos.length).toBe(1);
      expect(ctrl.serviceAndDebitTransactionDtos[0].AdjustmentAmount).toBe(1);
      expect(ctrl.serviceAndDebitTransactionDtos[0].Balance).toBe(-1);
    });

    it('should not return updated transaction in serviceAndDebitTransactionDtos When isChangingAdjustmentOrPayment is false  and current transaction balance is less than zero', function () {
      ctrl.serviceAndDebitTransactionDtos = [];
      var transaction = {
        AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
        Amount: 15,
        Balance: -2,
        EncounterId: '27d96ad3-6290-4731-ae9f-50bbfd124fe5',
        EnteredByUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        ServiceTransactionId: 'ead11976-2c09-4691-a32b-a6bd3f19b0b1',
      };

      ctrl.currentUnappliedTransaction = {
        Amount: 15,
        Balance: 0,
        AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
        UnassignedAmount: 14,
        transactionTypeId: 4,
      };

      ctrl.currentUnappliedTransaction.CreditTransactionDetails = [];
      ctrl.currentUnappliedTransaction.CreditTransactionDetails = [
        {
          AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
          Amount: -14,
          CreditTransactionDetailId: 'b0eb5fce-9255-4867-822e-90edcce456a8',
          CreditTransactionId: 'b5bca4ff-bf00-4b1c-9b8b-e4a17e54cf52',
        },
        {
          AccountMemberId: 'a71ef97a-5dc3-416a-abd5-36e32a5e129d',
          Amount: -1,
          CreditTransactionDetailId: '82211431-4cbf-4dbb-88f2-ceb10896c41e',
          CreditTransactionId: 'b5bca4ff-bf00-4b1c-9b8b-e4a17e54cf52',
          AppliedToServiceTransactionId: 'ead11976-2c09-4691-a32b-a6bd3f19b0b1',
        },
      ];
      scope.isChangingAdjustmentOrPayment = false;

      ctrl.buildTransactionForDisplay(transaction, true);

      expect(ctrl.serviceAndDebitTransactionDtos.length).toBe(0);
    });
  });

  //mergeServiceTransactionsAndDebitTransaction
  describe('mergeServiceTransactionsAndDebitTransaction  function->', function () {
    it('mergeServiceTransactionsAndDebitTransaction should merge all service transactions and debit transactions when dataForModel.TransactionList is null', function () {
      scope.serviceAndDebitTransactionDtos = [];
      scope.serviceTransactions = [
        { ServiceTransactionId: 1, Balance: 0 },
        { ServiceTransactionId: 2, Balance: 10 },
      ];
      scope.debitTransactions = [
        { DebitTransactionId: 11, Balance: 0 },
        { DebitTransactionId: 12, Balance: 10 },
      ];

      spyOn(ctrl, 'processServiceTransactionData');

      scope.existingAdjustmentData = null;

      ctrl.mergeServiceTransactionsAndDebitTransaction();
      scope.$apply();

      expect(ctrl.processServiceTransactionData).toHaveBeenCalled();
      expect(scope.serviceAndDebitTransactionDtos.length).toBe(2);
      expect(ctrl.initialServiceAndDebitTransactionDtos).toEqual(
        scope.serviceAndDebitTransactionDtos
      );
      expect(scope.serviceAndDebitTransactionDtos).toEqual(
        scope.serviceAndDebitTransactionDtos
      );
    });

    it('mergeServiceTransactionsAndDebitTransaction should merge all service transactions and debit transactions with credit transaction when dataForModel.TransactionList is null', function () {
      scope.serviceAndDebitTransactionDtos = [];
      scope.serviceTransactions = [
        { ServiceTransactionId: 1, Balance: 0 },
        { ServiceTransactionId: 2, Balance: 10 },
      ];
      scope.debitTransactions = [
        { DebitTransactionId: 11, Balance: 0 },
        { DebitTransactionId: 12, Balance: 10 },
      ];

      scope.isAdjustmentOnUnappliedAmount = true;
      ctrl.currentUnappliedTransaction = [
        {
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          LocationId: 14601,
          AccountId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
          AdjustmentTypeId: null,
          Amount: -12,
          ClaimId: null,
          DateEntered: '2015-10-05T11:45:20.614Z',
          Description: '1234',
          PaymentTypePromptValue: null,
          EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
          Note: null,
          PaymentTypeId: '2f9dc9c9-8294-4395-93d1-49a904d2d070',
          TransactionTypeId: 2,
          CreditTransactionDetails: [
            {
              CreditTransactionDetailId: '46ee5116-ad4f-41c8-b8ff-01d6843cce5d',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -3,
              AppliedToServiceTransationId:
                '7f323705-a62c-4129-8681-3756119e6e4b',
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: '6a9fb40e-649b-4022-9e26-fbabcf61aa55',
              ProviderUserId: 'cf0e2663-80f5-43ad-89d4-4416a6111521',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:41.6659051Z',
            },
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -5,
              AppliedToServiceTransationId:
                'aff1a7db-598c-4f8b-8a57-95d0b2340cff',
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: '6a9fb40e-649b-4022-9e26-fbabcf61aa55',
              ProviderUserId: '517ce215-b71b-408f-8b20-62a4c1386f77',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            {
              CreditTransactionDetailId: 'ad8829b1-74c8-41d6-929b-89c924f36cea',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -4,
              AppliedToServiceTransationId:
                'cd0326d1-aebf-4ee5-9b7a-b63efa01054a',
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: '6a9fb40e-649b-4022-9e26-fbabcf61aa55',
              ProviderUserId: '517ce215-b71b-408f-8b20-62a4c1386f77',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.2187017Z',
            },
          ],
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T11:45:43.290382+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.290382Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T11:45:39.8280813Z',
        },
        {
          CreditTransactionId: '8566173a-c7ef-425c-bf12-42b0511b1809',
          LocationId: 14601,
          AccountId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
          AdjustmentTypeId: 'e7ca533c-6710-4002-8d97-8f7c1f38195b',
          Amount: -30,
          ClaimId: null,
          DateEntered: '2015-10-05T12:50:01.008Z',
          Description: 'Adjust negative - Test',
          PaymentTypePromptValue: null,
          EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
          Note: 'Test',
          PaymentTypeId: null,
          TransactionTypeId: 4,
          CreditTransactionDetails: [
            {
              CreditTransactionDetailId: '8af20291-9bf8-410b-86af-fbd09a1c1bad',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -4,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '8566173a-c7ef-425c-bf12-42b0511b1809',
              DateEntered: '2015-10-05T12:50:01.008Z',
              EncounterId: null,
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T12:50:37.6285473+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A50%3A37.6285473Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T12:50:36.8912707Z',
            },
            {
              CreditTransactionDetailId: 'a3583db3-77c0-499c-9fd8-b365c95908a8',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -26,
              AppliedToServiceTransationId:
                'cbfa6103-4cf9-42a1-9fd5-58d95e3da743',
              CreditTransactionId: '8566173a-c7ef-425c-bf12-42b0511b1809',
              DateEntered: '2015-10-05T12:50:01.008Z',
              EncounterId: 'aba3255d-c041-4661-84af-5cfb2b2af1fe',
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T12:50:37.6285473+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A50%3A37.6285473Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T12:50:34.7108459Z',
            },
          ],
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T12:50:38.2660068+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A50%3A38.2660068Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T12:50:33.495256Z',
        },
      ];

      spyOn(ctrl, 'processServiceTransactionData');

      scope.existingAdjustmentData = null;

      ctrl.mergeServiceTransactionsAndDebitTransaction();
      scope.$apply();

      expect(ctrl.processServiceTransactionData).toHaveBeenCalled();
      expect(scope.serviceAndDebitTransactionDtos.length).toBe(2);
      expect(ctrl.initialServiceAndDebitTransactionDtos).toEqual(
        scope.serviceAndDebitTransactionDtos
      );
      expect(scope.serviceAndDebitTransactionDtos).toEqual(
        scope.serviceAndDebitTransactionDtos
      );
    });

    it('mergeServiceTransactionsAndDebitTransaction should merge all service transactions of a particular encounter when dataForModel.TransactionList is not null', function () {
      listHelper.findItemByFieldValue.and.returnValue(null);
      scope.serviceAndDebitTransactionDtos = [];
      //mock for dataForModal
      dataForModal = {
        AccountMembersList: {
          Value: [],
        },
        AccountMembersDetail: {
          Value: [],
        },
        PatientAccountDetails: {
          AccountId: 1000,
          AccountMemberId: 2000,
        },
        DefaultSelectedIndex: 2,
        CurrentPatient: {
          Value: {
            FirstName: 'First',
            LastName: 'Last',
            MiddleName: 'Middle',
            PreferredName: 'Preferred',
            Suffix: 'Suffix',
            PrefferedDentist: 3000,
            PreferredHygienist: 4000,
            PersonAccount: {
              AccountId: 1000,
              PersonAccountMember: {
                AccountMemberId: 2000,
              },
            },
          },
        },
        TransactionList: [
          { ServiceTransactionId: 1, Balance: 0 },
          { ServiceTransactionId: 2, Balance: 10 },
        ],
        AllProviders: mockAllProvidersList,
        PaymentTypes: {
          Value: mockPaymentTypesList,
        },
        AdjustmentTypes: {
          Value: mockAdjustmentTypeList,
        },
      };
      createController();

      spyOn(ctrl, 'processServiceTransactionData');

      scope.existingAdjustmentData = null;

      ctrl.mergeServiceTransactionsAndDebitTransaction();
      scope.$apply();

      expect(ctrl.processServiceTransactionData).toHaveBeenCalled();
      expect(scope.serviceAndDebitTransactionDtos.length).toBe(1);
      expect(ctrl.initialServiceAndDebitTransactionDtos).toEqual(
        scope.serviceAndDebitTransactionDtos
      );
      expect(
        scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos
      ).toEqual(scope.serviceAndDebitTransactionDtos);
    });

    it('mergeServiceTransactionsAndDebitTransaction should Merge service transactions and debit transactions for distribution and calculate service adjustment amount', function () {
      scope.serviceAndDebitTransactionDtos = [];
      scope.serviceTransactions = [
        { ServiceTransactionId: 1, Balance: 0 },
        { ServiceTransactionId: 2, Balance: 10 },
      ];
      scope.debitTransactions = [
        { DebitTransactionId: 11, Balance: 0 },
        { DebitTransactionId: 12, Balance: 10 },
      ];

      var testServiceTransaction = scope.serviceTransactions[0]; // test for one service

      scope.existingAdjustmentData.CreditTransactionDto = {};
      scope.existingAdjustmentData.CreditTransactionDto.CreditTransactionDetails = [
        {
          AppliedToServiceTransationId:
            testServiceTransaction.ServiceTransactionId,
        },
      ];

      spyOn(ctrl, 'processServiceTransactionData');

      ctrl.mergeServiceTransactionsAndDebitTransaction();
      scope.$apply();

      expect(ctrl.processServiceTransactionData).toHaveBeenCalled();
      expect(scope.serviceAndDebitTransactionDtos.length).toBe(2);
      expect(ctrl.initialServiceAndDebitTransactionDtos).toEqual(
        scope.serviceAndDebitTransactionDtos
      );
      expect(scope.serviceAndDebitTransactionDtos).toEqual(
        scope.serviceAndDebitTransactionDtos
      );

      expect(scope.existingAdjustmentData.CreditTransactionDto).not.toBeNull();
      expect(
        scope.existingAdjustmentData.CreditTransactionDto
          .CreditTransactionDetails.length
      ).toBeGreaterThan(0);

      expect(scope.serviceAndDebitTransactionDtos[0].AdjustmentAmount).toBe(-1); // -1 is the mocked amount from listhelper
    });

    it('mergeServiceTransactionsAndDebitTransaction should not return updated transaction in serviceAndDebitTransactionDtos when current transaction balance is less than zero', function () {
      scope.serviceAndDebitTransactionDtos = [];
      scope.serviceTransactions = [{ ServiceTransactionId: 1, Balance: -15 }];

      var testServiceTransaction = scope.serviceTransactions[0];

      scope.existingAdjustmentData.CreditTransactionDto = {};
      scope.existingAdjustmentData.CreditTransactionDto.CreditTransactionDetails = [
        {
          AppliedToServiceTransationId:
            testServiceTransaction.ServiceTransactionId,
        },
      ];

      spyOn(ctrl, 'processServiceTransactionData');

      ctrl.mergeServiceTransactionsAndDebitTransaction();
      scope.$apply();

      expect(ctrl.processServiceTransactionData).toHaveBeenCalled();
      expect(scope.serviceAndDebitTransactionDtos.length).toBe(0);
    });
  });

  //$on broadcast patCore:initlocation
  describe('$on broadcast function ->', function () {
    it('should handle broadcast event, and sets location data for debit transaction and credit transaction', function () {
      var userLocation = '{"Id": "101"}';
      ctrl.location = null;
      scope.dataForDebitTransaction = {
        DebitTransactionDto: { LocationId: null },
      };
      scope.dataForCreditTransaction = {
        CreditTransactionDto: { LocationId: null },
      };
      sessionStorage.setItem('userLocation', userLocation);
      scope.$broadcast('patCore:initlocation');
      expect(ctrl.location).toEqual(
        JSON.parse(sessionStorage.getItem('userLocation'))
      );
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto.LocationId
      ).toEqual(ctrl.location.id);
      expect(
        scope.dataForDebitTransaction.DebitTransactionDto.LocationId
      ).toEqual(ctrl.location.id);
    });
  });

  //prepareCreditTransactionDetailList
  it('prepareCreditTransactionDetailList should return credit transaction detail for service transaction having non-zero adjustment amount', function () {
    scope.dataForCreditTransaction.UnassignedAmount = 0;
    scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
      {
        AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
        AdjustmentAmount: 10,
        DebitTransactionId: 100,
        EncounterId: 200,
        ProviderUserId: 300,
        TransactionTypeId: 5,
      },
      {
        AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
        AdjustmentAmount: 10,
        ServiceTransactionId: 200,
        EncounterId: 200,
        ProviderUserId: 300,
        TransactionTypeId: 2,
      },
      {
        AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
        AdjustmentAmount: 0,
        ServiceTransactionId: 150,
        EncounterId: 200,
        ProviderUserId: 300,
        TransactionTypeId: 2,
      },
    ];
    scope.creditTransactionDto = { DateEntered: '02/05/1992' };
    scope.dataForCreditTransaction.CreditTransactionDto = {
      CreditTransactionId: 'CF0DBCB3-0009-461D-91DC-AF7E4D735450',
    };
    var result = ctrl.prepareCreditTransactionDetailList();

    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    expect(result.length).toBe(2);
    expect(result[0].AccountMemberId).toBe(
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos[0]
        .AccountMemberId
    );
    expect(result[0].Amount).toBe(
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos[0]
        .AdjustmentAmount
    );
    expect(result[0].AppliedToDebitTransactionId).toBe(
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos[0]
        .DebitTransactionId
    );
    expect(result[1].AppliedToServiceTransationId).toBe(
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos[1]
        .ServiceTransactionId
    );
    expect(result[1].EncounterId).toBe(
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos[1]
        .EncounterId
    );
    expect(result[0].ProviderUserId).toBe(
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos[0]
        .ProviderUserId
    );
  });

  it('prepareCreditTransactionDetailList should not return credit transaction detail for service transaction having zero adjustment amount', function () {
    scope.dataForCreditTransaction.UnassignedAmount = 0;
    scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
      { AdjustmentAmount: 0 },
    ];
    scope.$apply();
    var result = ctrl.prepareCreditTransactionDetailList();

    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    expect(result.length).toBe(0);
  });

  it('prepareCreditTransactionDetailList should return credit transaction detail for service transaction having greater than zero adjustment amount', function () {
    scope.dataForCreditTransaction.CreditTransactionDto = {
      CreditTransactionId: 'CF0DBCB3-0009-461D-91DC-AF7E4D735450',
    };
    scope.dataForCreditTransaction.UnassignedAmount = 10;
    scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
      {
        AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
        AdjustmentAmount: 10,
        DebitTransactionId: 100,
        EncounterId: 200,
        ProviderUserId: 300,
        TransactionTypeId: 5,
      },
      {
        AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
        AdjustmentAmount: 10,
        ServiceTransactionId: 200,
        EncounterId: 200,
        ProviderUserId: 300,
        TransactionTypeId: 2,
      },
    ];
    scope.accountMembersOptions = [
      { personId: 0, patientDetailedName: 'All Account Members' },
      { personId: 1, patientDetailedName: 'View2' },
      {
        personId: 3,
        patientDetailedName: 'View3',
        accountMemberId: ctrl.patientAccountInfo.AccountMemberId,
        responsiblePersonId: 3,
      },
    ];
    scope.$apply();
    var result = ctrl.prepareCreditTransactionDetailList();

    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    // expect(result.length).toBe(filteredServiceTransactions.length);
  });

  //prepareUnappliedCreditTransactionDetailList
  describe('prepareUnappliedCreditTransactionDetailListForApplying ->', function () {
    it('prepareUnappliedCreditTransactionDetailListForApplying should return credit transaction detail for service transaction having unassigned amount is zero', function () {
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);

      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: null,
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: null,
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: null,
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
      ];

      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.Amount = 0;
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          Amount: -20,
          AppliedToServiceTransationId: 'a40fe5a6-d51d-42cf-ad58-b8bb9400396b',
          CreditTransactionDetailId: 'f38db593-9a4d-4229-97c9-795006854c2a',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          EncounterId: 'f8431f18-f40c-4c03-aa5e-1e5bc337bf5a',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
        },
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          Amount: -10,
          AppliedToServiceTransationId: 'e8a5450f-1a61-482a-ad50-b48296b0203c',
          CreditTransactionDetailId: 'dfb9ec76-c199-4990-8819-c4fbab13404d',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          EncounterId: 'f8431f18-f40c-4c03-aa5e-1e5bc337bf5a',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
        },
      ];

      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.Amount = 30;
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.UnassignedAmount = 0;

      scope.creditTransactionDto = { DateEntered: '02/05/1992' };

      ctrl.prepareUnappliedCreditTransactionDetailListForApplying();
      expect(scope.dataForCreditTransaction.CreditTransactionDto.Amount).toBe(
        0
      );
    });

    it('prepareUnappliedCreditTransactionDetailList should return credit transaction detail for service transaction having unassigned amount is greater than zero ', function () {
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: null,
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: null,
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: null,
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
      ];
      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.Amount = -10;

      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountId,
          Amount: -20,
          AppliedToServiceTransationId: 'a40fe5a6-d51d-42cf-ad58-b8bb9400396b',
          CreditTransactionDetailId: 'f38db593-9a4d-4229-97c9-795006854c2a',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          EncounterId: 'f8431f18-f40c-4c03-aa5e-1e5bc337bf5a',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountId,
          Amount: -10,
          AppliedToServiceTransationId: 'e8a5450f-1a61-482a-ad50-b48296b0203c',
          CreditTransactionDetailId: 'dfb9ec76-c199-4990-8819-c4fbab13404d',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          EncounterId: 'f8431f18-f40c-4c03-aa5e-1e5bc337bf5a',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
        },
      ];
      scope.accountMembersOptions = [
        { personId: 0, patientDetailedName: 'All Account Members' },
        { personId: 1, patientDetailedName: 'View2' },
        {
          personId: 3,
          patientDetailedName: 'View3',
          accountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          responsiblePersonId: 3,
        },
      ];

      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.Amount = 50;
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.UnassignedAmount = 20;

      scope.creditTransactionDto = { DateEntered: '02/05/1992' };
      scope.dataForCreditTransaction.Amount = 40;
      scope.dataForCreditTransaction.UnassignedAmount = 1;

      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(1);

      ctrl.prepareUnappliedCreditTransactionDetailListForApplying();

      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails[1].AccountMemberId
      ).toBe(ctrl.patientAccountInfo.AccountId);
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails[1].Amount
      ).toBe(-10);
    });

    it('prepareUnappliedCreditTransactionDetailList should return credit transaction for service transaction having unassigned amount is less than zero ', function () {
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: 'e8a5450f-1a61-482a-ad50-b48296b0203c',
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: 'a40fe5a6-d51d-42cf-ad58-b8bb9400396b',
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: null,
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
      ];

      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.Amount = 0;
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          Amount: -20,
          AppliedToServiceTransationId: 'a40fe5a6-d51d-42cf-ad58-b8bb9400396b',
          CreditTransactionDetailId: 'f38db593-9a4d-4229-97c9-795006854c2a',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          EncounterId: 'f8431f18-f40c-4c03-aa5e-1e5bc337bf5a',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
          IsDeleted: false,
        },
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          Amount: -10,
          AppliedToServiceTransationId: 'e8a5450f-1a61-482a-ad50-b48296b0203c',
          CreditTransactionDetailId: 'dfb9ec76-c199-4990-8819-c4fbab13404d',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          EncounterId: 'f8431f18-f40c-4c03-aa5e-1e5bc337bf5a',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
          IsDeleted: false,
        },
      ];

      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.Amount = 50;
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.UnassignedAmount = 20;

      scope.creditTransactionDto = { DateEntered: '02/05/1992' };
      scope.dataForCreditTransaction.Amount = 40;
      scope.dataForCreditTransaction.UnassignedAmount = -1;

      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(1);
      ctrl.prepareUnappliedCreditTransactionDetailListForApplying();

      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails[1].ObjectState
      ).toEqual('Delete');
      expect(scope.dataForCreditTransaction.CreditTransactionDto.Amount).toBe(
        0
      );
    });

    it('prepareUnappliedCreditTransactionDetailList should return credit transaction for service transaction having unassigned amount is greater than zero ', function () {
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0);

      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: null,
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: null,
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: null,
          EncounterId: null,
          ProviderUserId: 300,
          TransactionTypeId: 4,
        },
      ];

      scope.dataForCreditTransaction.CreditTransactionDto = {
        Amount: 30,
        Balance: 0,
        AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
        CreditTransactionDetailId: 'f38db593-9a4d-4229-97c9-795006854c2a',
        CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
        PaymentTypeId: '6bad97fe-462e-45aa-89ff-0c81a7eb7bbf',
        EncounterId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
      };
      scope.dataForCreditTransaction.CreditTransactionDto.Amount = -10;
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          Amount: -40,
          AppliedToServiceTransationId: null,
          CreditTransactionDetailId: '46ee5116-ad4f-41c8-b8ff-01d6843cce5d',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          //EncounterId: "f8431f18-f40c-4c03-aa5e-1e5bc337bf5a",
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
        },
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          Amount: -10,
          AppliedToServiceTransationId: 'e8a5450f-1a61-482a-ad50-b48296b0203c',
          CreditTransactionDetailId: 'dfb9ec76-c199-4990-8819-c4fbab13404d',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          //EncounterId: "f8431f18-f40c-4c03-aa5e-1e5bc337bf5a",
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
        },
      ];

      dataForModal.unappliedCreditTransactionDetailId =
        '46ee5116-ad4f-41c8-b8ff-01d6843cce5d';

      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.Amount = 50;
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.UnassignedAmount = 20;

      scope.creditTransactionDto = { DateEntered: '02/05/1992' };
      scope.dataForCreditTransaction.Amount = 40;

      ctrl.prepareUnappliedCreditTransactionDetailListForApplying();
      expect(scope.dataForCreditTransaction.CreditTransactionDto.Amount).toBe(
        -10
      );
    });
  });
  //prepareChangedCreditTransactionDetailList
  describe('prepareChangedCreditTransactionDetailList ->', function () {
    it('prepareChangedCreditTransactionDetailList should return updated CreditTransactionDetails list when unassigned amount greater then zero and without any unapplied amount ', function () {
      scope.dataForCreditTransaction = {
        UnassignedAmount: 6,
        HasUnappliedAmountAdjusted: true,
        IsChangeAdjustmentOrPayment: true,
      };
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          AdjustmentAmount: 8,
          Balance: 10,
          Amount: 10,
          ServiceTransactionId: 'e8a5450f-1a61-482a-ad50-b48296b0203c',
          EncounterId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          TransactionTypeId: 1,
          Fee: 10,
        },
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          AdjustmentAmount: 16,
          Balance: 20,
          Amount: 20,
          ServiceTransactionId: 'a40fe5a6-d51d-42cf-ad58-b8bb9400396b',
          EncounterId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          TransactionTypeId: 1,
          Fee: 20,
        },
      ];
      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          Amount: -20,
          AppliedToServiceTransationId: 'a40fe5a6-d51d-42cf-ad58-b8bb9400396b',
          CreditTransactionDetailId: 'f38db593-9a4d-4229-97c9-795006854c2a',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          EncounterId: 'f8431f18-f40c-4c03-aa5e-1e5bc337bf5a',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
        },
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          Amount: -10,
          AppliedToServiceTransationId: 'e8a5450f-1a61-482a-ad50-b48296b0203c',
          CreditTransactionDetailId: 'dfb9ec76-c199-4990-8819-c4fbab13404d',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          EncounterId: 'f8431f18-f40c-4c03-aa5e-1e5bc337bf5a',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
        },
      ];

      scope.accountMembersOptions = [
        { personId: 0, patientDetailedName: 'All Account Members' },
        { personId: 1, patientDetailedName: 'View2' },
        {
          personId: 3,
          patientDetailedName: 'View3',
          accountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          responsiblePersonId: 3,
        },
      ];
      ctrl.prepareChangedCreditTransactionDetailList();
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails.length
      ).toBe(5);
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto.AccountId
      ).toBe(1000);
    });

    it('prepareChangedCreditTransactionDetailList should return updated CreditTransactionDetails list when unassigned amount greater then zero and with unapplied amount ', function () {
      scope.dataForCreditTransaction = {
        UnassignedAmount: 3,
        HasUnappliedAmountAdjusted: true,
        IsChangeAdjustmentOrPayment: true,
      };
      scope.dataForCreditTransaction.UnappliedTransaction = {
        Amount: 30,
        Balance: 0,
        UnassignedAmount: 2,
        CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
        SelectAdjustmentTypeIndex: -1,
        CrediTransactionDetails: [
          {
            CreditTransactionDetailId: 'ea576b56-3779-4447-b0dc-5ecb140168ab',
            CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
            Amount: -2,
            AppliedToServiceTransationId: null,
            AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          },
          {
            CreditTransactionDetailId: 'b5bed5d3-a080-400b-9eb5-025e1e19019d',
            CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
            Amount: -8,
            AppliedToServiceTransationId:
              'e8a5450f-1a61-482a-ad50-b48296b0203c',
            AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          },
          {
            CreditTransactionDetailId: '66c2f854-7531-45e7-9739-c089e4ea63d8',
            CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
            Amount: -20,
            AppliedToServiceTransationId:
              'a40fe5a6-d51d-42cf-ad58-b8bb9400396b',
            AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          },
        ],
      };
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          AdjustmentAmount: 7,
          Balance: 10,
          Amount: 10,
          ServiceTransactionId: 'e8a5450f-1a61-482a-ad50-b48296b0203c',
          EncounterId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          TransactionTypeId: 1,
          Fee: 10,
          ObjectState: 'None',
        },
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          AdjustmentAmount: 20,
          Balance: 20,
          Amount: 20,
          ServiceTransactionId: 'a40fe5a6-d51d-42cf-ad58-b8bb9400396b',
          EncounterId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          TransactionTypeId: 1,
          Fee: 20,
          ObjectState: 'None',
        },
      ];
      scope.dataForCreditTransaction.CreditTransactionDto = {
        Amount: 30,
        Balance: 0,
        AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
        CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
        PaymentTypeId: '6bad97fe-462e-45aa-89ff-0c81a7eb7bbf',
        EncounterId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
      };
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          Amount: -20,
          CreditTransactionDetailId: 'f38db593-9a4d-4229-97c9-795006854c2a',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
        },
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          Amount: -8,
          CreditTransactionDetailId: 'b5bed5d3-a080-400b-9eb5-025e1e19019d',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
        },
        {
          AccountMemberId: 'a0dc5150-0a8a-46d8-9155-da4f3c28033d',
          Amount: -2,
          CreditTransactionDetailId: 'ea576b56-3779-4447-b0dc-5ecb140168ab',
          CreditTransactionId: '63be9677-96b3-4c4a-8dbf-888a7b16a553',
          ProviderUserId: '7369f2a2-b18f-4e22-a5c5-b3f976ab2483',
          ObjectState: null,
        },
      ];
      scope.accountMembersOptions = [
        { personId: 0, patientDetailedName: 'All Account Members' },
        { personId: 1, patientDetailedName: 'View2' },
        {
          personId: 3,
          patientDetailedName: 'View3',
          accountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          responsiblePersonId: 3,
        },
      ];
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(1);
      ctrl.prepareChangedCreditTransactionDetailList();

      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails[1].AccountMemberId
      ).toBe('a0dc5150-0a8a-46d8-9155-da4f3c28033d');
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails[1].Amount
      ).toBe(8);
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails[1].ProviderUserId
      ).toBe('7369f2a2-b18f-4e22-a5c5-b3f976ab2483');
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails[1].ObjectState
      ).toEqual('Delete');

      expect(
        scope.dataForCreditTransaction.CreditTransactionDto.AccountId
      ).toBe(1000);
    });
  });
  //adjustmentTypeOptionClicked
  describe('adjustmentTypeOptionClicked function ->', function () {
    it('should handle change event on assignment type when passed option is null', function () {
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(null);
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);

      scope.adjustmentTypes = angular.copy(mockAdjustmentTypeList);

      scope.dataForCreditTransaction = {
        SelectedAdjustmentTypeIndex: 0,
        CreditTransactionDto: { PaymentTypeId: 1 },
      };

      // spyOn(ctrl, 'setTransactionDto');
      spyOn(ctrl, 'setCreditTransactionData');

      scope.adjustmentTypeOptionClicked();
      // scope.adjustmentTypeOptionClicked();
      scope.$apply();

      expect(scope.selectedAdjustmentType).toEqual(
        scope.adjustmentTypeOptions[scope.defaultAdjustmentTypeOptionIndex].name
      );
    });

    it('should handle change event on assignment type when passed option is null and findIndexByFieldValue return 2', function () {
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(2);
      scope.adjustmentTypes = angular.copy(mockAdjustmentTypeList);

      scope.dataForCreditTransaction = {
        SelectedAdjustmentTypeIndex: 0,
        CreditTransactionDto: { PaymentTypeId: 1 },
      };

      // spyOn(ctrl, 'setTransactionDto');
      spyOn(ctrl, 'setCreditTransactionData');

      scope.adjustmentTypeOptionClicked();
      scope.$apply();
      timeout.flush(500);

      expect(scope.selectedAdjustmentType).toEqual(
        scope.adjustmentTypeOptions[scope.defaultAdjustmentTypeOptionIndex].name
      );
    });

    it('should handle change event on assignment type when valid option is passed', function () {
      scope.adjustmentTypeOptions = [
        { name: 'option 0' },
        { name: 'option 1' },
      ];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.adjustmentTypeOptions[1]);
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(1);
      scope.adjustmentTypes = angular.copy(mockAdjustmentTypeList);

      scope.adjustmentTypeOptionClicked(scope.adjustmentTypeOptions[1]);
      scope.$apply();
      timeout.flush(500);
      expect(scope.selectedAdjustmentType).toEqual(
        scope.adjustmentTypeOptions[scope.defaultAdjustmentTypeOptionIndex].name
      );
    });

    it('should handle change event on assignment type when valid option is passed and dataForCreditTransaction.SelectedAdjustmentTypeIndex is not equal to selectedTypeIndex and selectedTypeIndex is 1', function () {
      scope.adjustmentTypeOptions = [
        { name: 'option 0' },
        { name: 'option 1' },
      ];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.adjustmentTypeOptions[1]);
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(1);

      scope.adjustmentTypes = angular.copy(mockAdjustmentTypeList);
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 0;

      scope.adjustmentTypeOptionClicked(scope.adjustmentTypeOptions[1]);
      scope.$apply();
      timeout.flush(500);
      expect(scope.selectedAdjustmentType).toEqual(
        scope.adjustmentTypeOptions[scope.defaultAdjustmentTypeOptionIndex].name
      );
    });

    it('should handle change event on assignment type when valid option is passed and dataForCreditTransaction.SelectedAdjustmentTypeIndex is not equal to selectedTypeIndex and selectedTypeIndex is 3', function () {
      scope.adjustmentTypeOptions = [
        { name: 'option 0' },
        { name: 'option 1' },
      ];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.adjustmentTypeOptions[1]);
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(3);

      scope.adjustmentTypes = angular.copy(mockAdjustmentTypeList);
      scope.dataForCreditTransaction = {
        SelectedAdjustmentTypeIndex: 0,
        CreditTransactionDto: { PaymentTypeId: 1 },
      };

      // spyOn(ctrl, 'setTransactionDto');
      spyOn(ctrl, 'setCreditTransactionData');

      scope.adjustmentTypeOptionClicked(scope.adjustmentTypeOptions[1]);
      scope.$apply();
      timeout.flush(500);
      expect(scope.selectedAdjustmentType).toEqual(
        scope.adjustmentTypeOptions[scope.defaultAdjustmentTypeOptionIndex].name
      );
      expect(
        angular.element('#inpNegativeAdjustmentAmount').focus
      ).toHaveBeenCalled();
    });

    it('should re-filter services and debits based on the chosen account member', function () {
      scope.adjustmentTypeOptions = [
        { name: 'Account Payment' },
        { name: 'Negative Adjustment' },
      ];
      scope.selectedAdjustmentTypeIndex = scope.adjustmentTypeOptions[0];
      scope.initialServiceAndDebitTransactionDtos = [
        { AccountMemberId: 1 },
        { AccountMemberId: 2 },
      ];
      scope.currentAccountMemberId = 2;
      scope.dataForCreditTransaction = {
        SelectedAdjustmentTypeIndex: 0,
        CreditTransactionDto: { PaymentTypeId: 1 },
        ServiceAndDebitTransactionDtos:
          scope.initialServiceAndDebitTransactionDtos,
      };
      scope.existingAdjustmentData = angular.copy(
        scope.dataForCreditTransaction
      );

      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.callFake(function (list, field, value) {
          for (var i = 0; i < list.length; i++) {
            if (list[i][field] === value) return i;
          }
        });

      scope.adjustmentTypeOptionClicked(scope.adjustmentTypeOptions[1]);
      scope.$apply();
      timeout.flush(500);
      expect(
        scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.length
      ).toBe(1);
    });
  });

  //applyAdjustment
  describe('continueAdjustment function ->', function () {
    it('should show error when data is not valid', function () {
      scope.applyingAdjustment = false;
      scope.selectedAdjustmentTypeIndex = 0;
      spyOn(ctrl, 'validateAdjustment').and.returnValue(false);
      ctrl.continueAdjustment()();
      expect(scope.dataForDebitTransaction.ErrorFlags.hasError).toBe(true);
    });

    it('should call ctrl.setDateEntered if valid and scope.applyingAdjustment is true', function () {
      spyOn(ctrl, 'setDateEntered');
      scope.applyingAdjustment = false;
      scope.selectedAdjustmentTypeIndex = 0;
      spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
      ctrl.continueAdjustment()(null, 0);
      expect(ctrl.setDateEntered).toHaveBeenCalledWith(
        scope.debitTransactionDto,
        ctrl.displayDate
      );
    });

    it('should apply positive adjustment when data is valid and selectedAdjustmentTypeIndex == 0', function () {
      scope.selectedAdjustmentTypeIndex = 0;
      spyOn(ctrl, 'validateAdjustment').and.returnValue(true);

      ctrl.continueAdjustment()();

      expect(
        patientServices.DebitTransaction.createDebitTransaction
      ).toHaveBeenCalled();
      expect(scope.dataForDebitTransaction.ErrorFlags.hasError).toBe(false);
      expect(scope.applyingAdjustment).toBe(true);
    });

    it('should not apply adjustment when data is valid but applyingAdjustment is true', function () {
      scope.selectedAdjustmentTypeIndex = 0;

      scope.applyingAdjustment = true;
      spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
      ctrl.continueAdjustment()();

      expect(
        patientServices.DebitTransaction.createDebitTransaction
      ).not.toHaveBeenCalled();
      expect(scope.hasError).not.toBe(false);
      expect(scope.applyingAdjustment).toBe(true);
    });

    it('should call ctrl.postNegativeAdjustment to apply negative adjustment when data is valid and dataForCreditTransaction.SelectedAdjustmentTypeIndex == 1 and dataForCreditTransaction.UnassignedAmount is not more than 0', function () {
      // scope.applyingAdjustment = false;
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          DateEntered: '01/01/2000',
          ValidDate: false,
          AdjustmentTypeId: '1',
          ProviderUserId: '10',
          Amount: 0,
        },
        SelectedAdjustmentTypeIndex: 1,
      };

      //scope.dataForCreditTransaction = { UnassignedAmount: 0 };
      spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
      spyOn(ctrl, 'postNegativeAdjustment').and.returnValue(function () {});
      ctrl.continueAdjustment()();

      expect(ctrl.postNegativeAdjustment).toHaveBeenCalled();
    });

    it('should throw confirmation modal before applying account payment when data is valid and dataForCreditTransaction.SelectedAdjustmentTypeIndex == 2 and dataForCreditTransaction.UnassignedAmount is more than 0', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 2;
      scope.dataForCreditTransaction.CreditTransactionDto = {
        TransactionTypeId: 4,
      };
      scope.selectedAdjustmentTypeIndex = 2;
      scope.dataForCreditTransaction.UnassignedAmount = 2;

      spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
      spyOn(ctrl, 'postNegativeAdjustment').and.returnValue(function () {});
      ctrl.continueAdjustment()();
      expect(ctrl.postNegativeAdjustment).toHaveBeenCalled();
    });

    it('should throw confirmation modal before applying account payment when data is valid and dataForCreditTransaction.SelectedAdjustmentTypeIndex == -1 and dataForCreditTransaction.UnassignedAmount is more than 0', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = -1;
      scope.dataForCreditTransaction.CreditTransactionDto = {
        TransactionTypeId: 4,
      };
      scope.selectedAdjustmentTypeIndex = -1;
      scope.dataForCreditTransaction.UnassignedAmount = 2;

      spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
      ctrl.continueAdjustment()();
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });

    it('should throw confirmation modal before applying account payment when data is valid and dataForCreditTransaction.SelectedAdjustmentTypeIndex == -1 and dataForCreditTransaction.UnassignedAmount is equal to 0', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = -1;
      scope.selectedAdjustmentTypeIndex = -1;
      scope.dataForCreditTransaction.UnassignedAmount = 0;
      scope.isAdjustmentOnUnappliedAmount = 1;
      spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
      spyOn(ctrl, 'prepareUnappliedCreditTransactionDetailListForApplying');

      ctrl.continueAdjustment()();
      expect(ctrl.validateAdjustment).toHaveBeenCalled();

      expect(
        ctrl.prepareUnappliedCreditTransactionDetailListForApplying
      ).toHaveBeenCalled();
    });
    it('should throw confirmation modal before applying account payment when data is valid and dataForCreditTransaction.SelectedAdjustmentTypeIndex == -1 and dataForCreditTransaction.UnassignedAmount is equal to 0', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = -1;
      scope.selectedAdjustmentTypeIndex = -1;
      scope.dataForCreditTransaction.UnassignedAmount = 10;
      scope.isAdjustmentOnUnappliedAmount = 1;
      spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
      spyOn(ctrl, 'notifyUserAboutAccountCredit');
      ctrl.continueAdjustment()();
      expect(ctrl.validateAdjustment).toHaveBeenCalled();

      expect(ctrl.notifyUserAboutAccountCredit).toHaveBeenCalled();
    });

    it('should call postNegativeAdjustment to apply negative adjustment when data is valid and dataForCreditTransaction.SelectedAdjustmentTypeIndex == 1 and dataForCreditTransaction.UnassignedAmount is more than 0', function () {
      // scope.applyingAdjustment = false;
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          DateEntered: '01/01/2000',
          ValidDate: false,
          Amount: 1000,
          AdjustmentTypeId: '1',
          ProviderUserId: '10',
          UnassignedAmount: 30,
        },
        SelectedAdjustmentTypeIndex: 1,
      };

      spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
      spyOn(ctrl, 'postNegativeAdjustment').and.returnValue(function () {});
      spyOn(ctrl, 'notifyUserAboutAccountCredit');

      ctrl.continueAdjustment()();

      expect(ctrl.postNegativeAdjustment).toHaveBeenCalled();
      // expect(scope.hasError).toBe(false);
    });

    it('should call changePaymentOrAdjustment when SelectedAdjustmentTypeIndex is not equal to (1,2 and) 0 and isAdjustmentOnUnappliedAmount is false with UnassignedAmount is less then zero.', function () {
      scope.selectedAdjustmentTypeIndex = -1;
      scope.isAdjustmentOnUnappliedAmount = false;
      scope.applyingAdjustment = false;
      scope.dataForCreditTransaction.UnassignedAmount = -1;
      spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
      spyOn(ctrl, 'changePaymentOrAdjustment');
      ctrl.continueAdjustment()();
      expect(ctrl.changePaymentOrAdjustment).toHaveBeenCalled();
    });
    it('should call changePaymentOrAdjustment when SelectedAdjustmentTypeIndex is not equal to (1,2 and) 0 and isAdjustmentOnUnappliedAmount is false with UnassignedAmount is greater then zero.', function () {
      scope.selectedAdjustmentTypeIndex = -1;
      scope.isAdjustmentOnUnappliedAmount = false;
      scope.applyingAdjustment = false;
      scope.dataForCreditTransaction.UnassignedAmount = 1;
      spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
      spyOn(ctrl, 'changePaymentOrAdjustment');
      spyOn(ctrl, 'notifyUserAboutAccountCredit');
      ctrl.continueAdjustment()();

      expect(ctrl.notifyUserAboutAccountCredit).toHaveBeenCalled();
    });
  });

  describe('changePaymentOrAdjustment function ->', function () {
    it("should call credit-transaction's update service", function () {
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          CreditTransactionDetails: [],
        },
      };
      spyOn(ctrl, 'prepareChangedCreditTransactionDetailList').and.returnValue([
        { id: 1 },
        { id: 2 },
      ]);

      ctrl.changePaymentOrAdjustment();

      expect(ctrl.prepareChangedCreditTransactionDetailList).toHaveBeenCalled();
      expect(patientServices.CreditTransactions.update).toHaveBeenCalled();
      expect(scope.applyingAdjustment).toBe(true);
    });
  });

  //postNegativeAdjustment
  describe('postNegativeAdjustment function ->', function () {
    it(' call setDateEntered', function () {
      spyOn(ctrl, 'setDateEntered');
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          CreditTransactionDetails: [],
        },
      };
      spyOn(ctrl, 'prepareCreditTransactionDetailList').and.returnValue([
        { id: 1 },
        { id: 2 },
      ]);

      ctrl.postNegativeAdjustment()();

      expect(ctrl.setDateEntered).toHaveBeenCalledWith(
        scope.dataForCreditTransaction.CreditTransactionDto,
        ctrl.displayDate
      );
    });

    it(" postNegativeAdjustment should call credit-transaction's create service", function () {
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          CreditTransactionDetails: [],
        },
      };
      spyOn(ctrl, 'prepareCreditTransactionDetailList').and.returnValue([
        { id: 1 },
        { id: 2 },
      ]);

      ctrl.postNegativeAdjustment()();

      expect(ctrl.prepareCreditTransactionDetailList).toHaveBeenCalled();
      expect(patientServices.CreditTransactions.create).toHaveBeenCalled();
      expect(scope.applyingAdjustment).toBe(true);
    });

    it("postNegativeAdjustment should not call credit-transaction's create service when isPrepareDataAction is true", function () {
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          CreditTransactionDetails: [],
        },
      };
      scope.applyingAdjustment = true;
      scope.isPrepareDataAction = true;
      scope.filteredAdjustmentTypes = [];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.adjustmentTypeOptions[1]);

      ctrl.postNegativeAdjustment()();

      expect(scope.applyingAdjustment).toBe(true);
      expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
      expect(patientServices.CreditTransactions.create).not.toHaveBeenCalled();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('postNegativeAdjustment should update CreditTransactionDetail.DateEntered if CreditTransaction.DateEntered has changed', function () {
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          DateEntered: '2021-08-16 14:00:56.3229415',
          CreditTransactionDetails: [
            { DateEntered: '2021-08-26 14:00:56.3229415' },
          ],
        },
        ServiceAndDebitTransactionDtos: [],
      };
      var serviceTransactionDetail = {
        AccountMemberId: '111',
        AdjustmentAmount: 10,
        ProviderUserId: '123',
        EncounterId: '12',
        TransactionTypeId: 5,
        DataTag: 'abc',
      };
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos.push(
        serviceTransactionDetail
      );
      scope.applyingAdjustment = true;
      scope.isPrepareDataAction = true;
      scope.filteredAdjustmentTypes = [];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.adjustmentTypeOptions[1]);

      ctrl.postNegativeAdjustment()();
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails[0].DateEntered
      ).toEqual(
        scope.dataForCreditTransaction.CreditTransactionDto.DateEntered
      );
    });

    it('postNegativeAdjustment should set IsAllAccountMembersSelected properly with a single account member id', function () {
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          CreditTransactionDetails: [
            { AccountMemberId: 1 },
            { AccountMemberId: 1 },
          ],
        },
      };
      ctrl.defaultSelectedAccountMemberId = 0;
      spyOn(ctrl, 'prepareCreditTransactionDetailList').and.returnValue([
        { AccountMemberId: 1 },
        { AccountMemberId: 1 },
      ]);

      ctrl.postNegativeAdjustment()();

      expect(patientServices.CreditTransactions.create).toHaveBeenCalled();
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .IsAllAccountMembersSelected
      ).toBe(false);
    });

    it('postNegativeAdjustment should set IsAllAccountMembersSelected properly with multiple account member id', function () {
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          CreditTransactionDetails: [
            { AccountMemberId: 1 },
            { AccountmemberId: 2 },
          ],
        },
      };
      spyOn(ctrl, 'prepareCreditTransactionDetailList').and.returnValue([
        { AccountMemberId: 1 },
        { AccountmemberId: 2 },
      ]);

      ctrl.postNegativeAdjustment()();

      expect(patientServices.CreditTransactions.create).toHaveBeenCalled();
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .IsAllAccountMembersSelected
      ).toBe(true);
    });
  });

  //applyTransactionSuccess
  describe('applyTransactionSuccess function ->', function () {
    it('should call toastrFactory.success and close the modalInstance when dataForCreditTransaction.SelectedAdjustmentTypeIndex is equal to 1', function () {
      var successResponse = {
        Value: {},
      };
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;

      ctrl.applyTransactionSuccess(successResponse);
      scope.$apply();
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(modalInstance.close).toHaveBeenCalled();
      expect(scope.applyingAdjustment).toBe(false);
    });

    it('should call toastrFactory.success and close the modalInstance when dataForCreditTransaction.SelectedAdjustmentTypeIndex is equal to 2', function () {
      var successResponse = {
        Value: {},
      };
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 2;

      ctrl.applyTransactionSuccess(successResponse);
      scope.$apply();
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(modalInstance.close).toHaveBeenCalled();
      expect(scope.applyingAdjustment).toBe(false);
    });

    it('should call proceedToNextAdjustment when dataForCreditTransaction.SelectedAdjustmentTypeIndex is equal to 2 and UnappliedTransactionsList.lenght is greater then zero ', function () {
      var successResponse = {
        Value: {},
      };
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 2;
      scope.applyingAdjustment = false;
      scope.isAdjustmentOnUnappliedAmount = true;
      scope.currentUnappliedTransactionIndex = 0;
      scope.UnappliedTransactionsList = [];
      spyOn(ctrl, 'proceedToNextAdjustment').and.returnValue(q.resolve());
      scope.UnappliedTransactionsList.length = 1;
      ctrl.applyTransactionSuccess(successResponse);
      scope.$apply();
      expect(ctrl.proceedToNextAdjustment).toHaveBeenCalled();
    });

    it('should call toastrFactory.success and close the modalInstance when dataForCreditTransaction.SelectedAdjustmentTypeIndex is equal to 2 and UnappliedTransactionsList.lenght is zero ', function () {
      var successResponse = {
        Value: {},
      };
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 2;
      scope.applyingAdjustment = false;
      scope.isAdjustmentOnUnappliedAmount = true;
      scope.currentUnappliedTransactionIndex = 0;
      scope.UnappliedTransactionsList = [];
      spyOn(ctrl, 'proceedToNextAdjustment').and.returnValue(q.resolve());
      scope.UnappliedTransactionsList.length = 0;
      ctrl.applyTransactionSuccess(successResponse);
      scope.$apply();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should call toastrFactory.success and close the modalInstance when dataForCreditTransaction.SelectedAdjustmentTypeIndex is equal to -1 (not 0,1 and 2) and UnappliedTransactionsList.lenght is zero ', function () {
      var successResponse = {
        Value: { LocationId: 3 },
      };
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = -1;
      scope.isAdjustmentOnUnappliedAmount = false;
      scope.currentUnappliedTransactionIndex = 0;
      scope.UnappliedTransactionsList = [];
      spyOn(ctrl, 'proceedToNextAdjustment').and.returnValue(q.resolve());
      scope.UnappliedTransactionsList.length = 0;
      ctrl.applyTransactionSuccess(successResponse);
      scope.$apply();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });

  //applyTransactionFailure
  describe('applyTransactionFailure function ->', function () {
    it('applyTransactionFailure should call toastrFactory.error when dataForCreditTransaction.SelectedAdjustmentTypeIndex is equal to 2', function () {
      var errorResponse = {};
      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          ObjectState: 'Add',
        },
        {
          ObjectState: 'Add',
        },
      ];

      scope.selectedAdjustmentTypeIndex = 2;

      ctrl.applyTransactionFailure(errorResponse);
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(scope.applyingAdjustment).toBe(false);
    });

    it('should remove any CreditTransactionDetails that have an ObjectState of Add', function () {
      var errorResponse = {};
      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          ObjectState: 'Delete',
        },
        {
          ObjectState: 'None',
        },
        {
          ObjectState: 'Add',
        },
        {
          ObjectState: 'Add',
        },
      ];

      ctrl.applyTransactionFailure(errorResponse);
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails.length == 2
      );
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails[0].ObjectState == 'Delete'
      );
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .CreditTransactionDetails[0].ObjectState == 'None'
      );
    });

    it('applyTransactionFailure should call toastrFactory.error when dataForCreditTransaction.SelectedAdjustmentTypeIndex is equal to 2', function () {
      var errorResponse = { status: 404 };
      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          ObjectState: 'Add',
        },
        {
          ObjectState: 'Add',
        },
      ];

      scope.selectedAdjustmentTypeIndex = 2;

      ctrl.applyTransactionFailure(errorResponse);

      expect(toastrFactory.error).toHaveBeenCalled();
      expect(scope.applyingAdjustment).toBe(false);
      expect(ctrl.failureMessageString).toEqual('applying payment');
    });

    it('applyTransactionFailure should call toastrFactory.error when dataForCreditTransaction.SelectedAdjustmentTypeIndex is equal to 4', function () {
      var errorResponse = { status: 404 };
      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          ObjectState: 'Add',
        },
        {
          ObjectState: 'Add',
        },
      ];

      scope.selectedAdjustmentTypeIndex = 4;

      ctrl.applyTransactionFailure(errorResponse);

      expect(toastrFactory.error).toHaveBeenCalled();
      expect(scope.applyingAdjustment).toBe(false);
      expect(ctrl.failureMessageString).toEqual('applying adjustment');
    });

    it('should handle conflict(409) error and set applyingAdjustment to false.', function () {
      var errorResponse = { status: 409 };
      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          ObjectState: 'Add',
        },
        {
          ObjectState: 'Add',
        },
      ];

      ctrl.applyTransactionFailure(errorResponse);
      expect(scope.applyingAdjustment).toBe(false);
    });
  });

  //cancelAdjustmentModal
  describe('cancelAdjustmentModal function ->', function () {
    it('cancelAdjustmentModal should set dataHasChanged to true when credit transaction is changed for negative adjustment for the first time, and call modalFactory.CancelModal', function () {
      ctrl.dataHasChanged = false;
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      ctrl.initialCreditTransactionDto = { Value: 'Old value' };
      scope.creditTransactionDto = { Value: 'New value' };

      scope.cancelAdjustmentModal();

      expect(ctrl.dataHasChanged).toBe(true);
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });

    it('cancelAdjustmentModal should set dataHasChanged to true when credit transaction is changed for patient payment for the first time, and call modalFactory.CancelModal', function () {
      ctrl.dataHasChanged = false;
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 2;
      ctrl.initialCreditTransactionDto = { Value: 'Old value' };
      scope.creditTransactionDto = { Value: 'New value' };

      scope.cancelAdjustmentModal();

      expect(ctrl.dataHasChanged).toBe(true);
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });

    it('cancelAdjustmentModal should set dataHasChanged to true when debit transaction is changed for negative adjustment for the first time, and call modalFactory.CancelModal', function () {
      ctrl.dataHasChanged = false;
      scope.selectedAdjustmentTypeIndex = 0;
      ctrl.initialDebitTransactionDto = { Value: 'Old value' };
      scope.debitTransactionDto = { Value: 'New value' };

      scope.cancelAdjustmentModal();

      expect(ctrl.dataHasChanged).toBe(true);
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });

    it('cancelAdjustmentModal should not set dataHasChanged to true when no changes are made to initial credit transaction for negative adjustment, and call modalInstance.dismiss', function () {
      ctrl.dataHasChanged = false;
      scope.selectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.AssignedAdjustmentTypeId = 1;
      ctrl.initialCreditTransactionDto =
        scope.dataForCreditTransaction.CreditTransactionDto;
      scope.cancelAdjustmentModal();

      expect(ctrl.dataHasChanged).toBe(false);
      expect(modalInstance.dismiss).toHaveBeenCalled();
    });

    it('cancelAdjustmentModal should not set dataHasChanged to true when no changes are made to initial debit transaction for negative adjustment, and call modalInstance.dismiss', function () {
      ctrl.dataHasChanged = false;
      scope.selectedAdjustmentTypeIndex = 0;
      ctrl.initialDebitTransactionDto = { Value: 'Initial value' };
      scope.dataForDebitTransaction.DebitTransactionDto = {
        Value: 'Initial value',
      };

      scope.cancelAdjustmentModal();

      expect(ctrl.dataHasChanged).toBe(false);
      expect(modalInstance.dismiss).toHaveBeenCalled();
    });
  });

  describe('ctrl.validateAdjustment ->', function () {
    //validateAdjustment
    it('validateAdjustment should focus on negative adjustment date when dataForCreditTransaction.SelectedAdjustmentTypeIndex is 1 and credit transaction date is invalid', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.UnassignedAmount = 0;
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: undefined,
        ValidDate: false,
        Amount: 1000,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };

      var result = ctrl.validateAdjustment();

      expect(result).toBe(false);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).toHaveBeenCalledWith(
        '#inpNegativeAdjustmentDate'
      );
      expect(
        angular.element('#inpNegativeAdjustmentDate').find
      ).toHaveBeenCalledWith('input');
      expect(
        angular.element('#inpNegativeAdjustmentDate').find('input').focus
      ).toHaveBeenCalled();
    });

    it('validateAdjustment should focus on negative adjustment amount when dataForCreditTransaction.SelectedAdjustmentTypeIndex is 1 and credit transaction amount is invalid', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.UnassignedAmount = 0;
      scope.dataForCreditTransaction.DateEntered = '07/02/2010';
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: -50,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };

      var result = ctrl.validateAdjustment();

      expect(result).toBe(false);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).toHaveBeenCalledWith(
        '#inpNegativeAdjustmentAmount'
      );
      expect(
        angular.element('#inpNegativeAdjustmentAmount').focus
      ).toHaveBeenCalled();
    });

    it('validateAdjustment should focus on negative adjustment amount when dataForCreditTransaction.SelectedAdjustmentTypeIndex is 1 and dataForCreditTransaction.ServiceAndDebitTransactionDtos has service transaction with balance less than adjustment amount and credit transaction amount is invalid', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.UnassignedAmount = 0;
      scope.dataForCreditTransaction.DateEntered = '07/02/2010';
      scope.creditTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: -50,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: '07/02/2010',
      };

      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
        {
          DateEntered: '07/02/2010',
          AccountMemberId: 1,
          AdjustmentAmount: 10,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 10,
          Fee: 100,
        },
        {
          DateEntered: '07/02/2010',
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 30,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 20,
          Fee: 100,
        },
      ];
      var result = ctrl.validateAdjustment();

      expect(result).toBe(false);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).toHaveBeenCalledWith(
        '#inpNegativeAdjustmentDate'
      );
    });

    it("validateAdjustment should focus on negative adjustment's adjustment type when dataForCreditTransaction.SelectedAdjustmentTypeIndex is 1 and adjustment type is invalid", function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.UnassignedAmount = 0;
      scope.dataForCreditTransaction.DateEntered = '07/02/2010';
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: 1000,
        AdjustmentTypeId: null,
        ProviderUserId: '10',
      };

      var result = ctrl.validateAdjustment();

      expect(result).toBe(false);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).toHaveBeenCalledWith(
        '#lstNegativeAdjustmentTypeSelector'
      );
      expect(
        angular.element('#lstNegativeAdjustmentTypeSelector').find
      ).toHaveBeenCalled();
    });

    it('validateAdjustment should return true for valid data when dataForCreditTransaction.SelectedAdjustmentTypeIndex is 1 and unassigned amount is 0', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.UnassignedAmount = 0;
      scope.dataForCreditTransaction.DateEntered = '07/02/2010';
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: 1000,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };

      var result = ctrl.validateAdjustment();

      expect(result).toBe(true);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).not.toHaveBeenCalled();
    });

    it('validateAdjustment should return false for invalid data when dataForCreditTransaction.SelectedAdjustmentTypeIndex is 1 and unassigned amount is more than 0 but extra amount is adjusted over serviceTransaction', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.UnassignedAmount = 100;
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: 1000,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };
      scope.serviceTransactionDtos = [
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 10,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 30,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 20,
        },
      ];
      scope.dataForCreditTransaction.UnassignedAmount = -1;
      var result = ctrl.validateAdjustment();
      timeout.flush(1);

      expect(result).toBe(false);
    });

    it('validateAdjustment should return false for invalid data when dataForCreditTransaction.SelectedAdjustmentTypeIndex is 1 and unassigned amount is less than 0 ', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.UnassignedAmount = -1;
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: 1000,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };
      scope.serviceTransactionDtos = [];
      scope.dataForCreditTransaction.UnassignedAmount = -1;
      var result = ctrl.validateAdjustment();
      timeout.flush(1);

      expect(result).toBe(false);
    });

    it('validateAdjustment should return true for valid data when selectedAdjustmentTypeIndex is 1 and unassigned amount is more than 0', function () {
      scope.selectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.UnassignedAmount = 100;
      scope.dataForCreditTransaction.DateEntered = '07/02/2010';
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: 1000,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 10,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 20,
        },
      ];
      var result = ctrl.validateAdjustment();

      expect(result).toBe(true);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).not.toHaveBeenCalled();
    });

    it('validateAdjustment should return false for invalid data when dataForCreditTransaction.SelectedAdjustmentTypeIndex is 2 and payment type is invalid', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 2;
      scope.dataForCreditTransaction.UnassignedAmount = 100;
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: 1000,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
        PaymentTypeId: '',
      };
      scope.serviceTransactionDtos = [
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 10,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 10,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 20,
        },
      ];

      var result = ctrl.validateAdjustment();
      expect(result).toBe(false);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).toHaveBeenCalled();
    });

    it('validateAdjustment should return true for valid data when dataForCreditTransaction.SelectedAdjustmentTypeIndex is 1 and more amount than balance is paid over a service-transaction', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.UnassignedAmount = 100;
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: 1000,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          DateEntered: 1,
          AdjustmentAmount: 10,
          Fee: 10,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 10,
        },
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          AdjustmentAmount: 30,
          Fee: 10,
          DateEntered: 2,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 20,
        },
      ];

      var result = ctrl.validateAdjustment();
      expect(result).toBe(true);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).not.toHaveBeenCalled();
    });

    it('validateAdjustment should return true for valid data when dataForCreditTransaction.SelectedAdjustmentTypeIndex is 1 and adjustment amount equals remaining balance over a service-transaction', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.UnassignedAmount = 100;
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: 1000,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          DateEntered: 1,
          AdjustmentAmount: 30,
          Fee: 10,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 10,
          UnixTimeStamp: new Date(),
          Amount: 39.99906,
          InsuranceEstimates: [{ PaidAmount: 10.00005 }],
        },
      ];
      scope.isForCloseClaim = true;
      scope.selectedAdjustmentTypeIndex = 1;
      var result = ctrl.validateAdjustment();
      expect(result).toBe(true);
    });

    it('validateAdjustment should return false for valid data when dataForCreditTransaction.SelectedAdjustmentTypeIndex is 1 and adjustment amount is greater than remaining balance over a service-transaction', function () {
      scope.dataForCreditTransaction.SelectedAdjustmentTypeIndex = 1;
      scope.dataForCreditTransaction.UnassignedAmount = 100;
      scope.dataForCreditTransaction.CreditTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: 1000,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };
      scope.dataForCreditTransaction.ServiceAndDebitTransactionDtos = [
        {
          AccountMemberId: ctrl.patientAccountInfo.AccountMemberId,
          DateEntered: 1,
          AdjustmentAmount: 30,
          Fee: 10,
          ServiceTransactionId: 100,
          EncounterId: 200,
          ProviderUserId: 300,
          Balance: 10,
          UnixTimeStamp: new Date(),
          Amount: 39.99406,
          InsuranceEstimates: [{ PaidAmount: 10.00005 }],
        },
      ];
      scope.isForCloseClaim = true;
      scope.selectedAdjustmentTypeIndex = 1;
      var result = ctrl.validateAdjustment();
      expect(result).toBe(false);
    });

    it('validateAdjustment should focus on positive adjustment date when selectedAdjustmentTypeIndex is 0 and debit transaction date is invalid', function () {
      scope.selectedAdjustmentTypeIndex = 0;
      scope.debitTransactionDto = {
        DateEntered: undefined,
        ValidDate: false,
        Amount: 1000,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };

      var result = ctrl.validateAdjustment();

      expect(result).toBe(false);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).toHaveBeenCalledWith(
        '#inpPositiveAdjustmentDate'
      );
      expect(
        angular.element('#inpPositiveAdjustmentDate').find
      ).toHaveBeenCalledWith('input');
      expect(
        angular.element('#inpPositiveAdjustmentDate').find('input').focus
      ).toHaveBeenCalled();
    });

    it("validateAdjustment should focus on positive adjustment's adjustment type when selectedAdjustmentTypeIndex is 0 and adjustment type is invalid", function () {
      scope.selectedAdjustmentTypeIndex = 0;
      scope.debitTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: 1000,
        AdjustmentTypeId: null,
        ProviderUserId: '10',
      };

      var result = ctrl.validateAdjustment();

      expect(result).toBe(false);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).toHaveBeenCalledWith(
        '#lstPositiveAdjustmentTypeSelector'
      );
    });

    it('validateAdjustment should focus on positive adjustment amount when selectedAdjustmentTypeIndex is 0 and debit transaction amount is invalid', function () {
      scope.selectedAdjustmentTypeIndex = 0;
      scope.debitTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: -50,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };

      var result = ctrl.validateAdjustment();

      expect(result).toBe(false);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).toHaveBeenCalledWith('#inpAmount');
      expect(angular.element('#inpAmount').focus).toHaveBeenCalled();
    });

    it('validateAdjustment should return true for valid data when selectedAdjustmentTypeIndex is 0', function () {
      scope.selectedAdjustmentTypeIndex = 0;
      scope.debitTransactionDto = {
        DateEntered: '07/02/2010',
        ValidDate: true,
        Amount: 1000,
        AdjustmentTypeId: '1',
        ProviderUserId: '10',
      };
      var result = ctrl.validateAdjustment();

      expect(result).toBe(true);
      expect(angular.element).not.toHaveBeenCalled();
      timeout.flush(1);
      expect(angular.element).not.toHaveBeenCalled();
    });

    it(
      'validateAdjustment should return false when selectedAdjustmentTypeIndex is not 0,1, or 2 ' +
        ' and isChangingAdjustmentOrPayment is true (indicates redistribution) and any service.AdjustmentAmount is more than the service.TotalUnpaidBalance',
      function () {
        scope.dataForCreditTransaction = {
          HasValidationError: false,
          ServiceAndDebitTransactionDtos: [
            {
              AdjustmentAmount: 100,
              ServiceTransactionId: 100,
              TotalUnpaidBalance: 80,
            },
          ],
        };
        scope.selectedAdjustmentTypeIndex = -1;
        scope.isChangingAdjustmentOrPayment = true;
        expect(ctrl.validateAdjustment()).toBe(false);
        expect(scope.dataForCreditTransaction.HasValidationError).toBe(true);
      }
    );

    it(
      'validateAdjustment should return true when selectedAdjustmentTypeIndex is not 0,1, or 2 ' +
        ' and isChangingAdjustmentOrPayment is true (indicates redistribution) and any service.AdjustmentAmount is less than the service.TotalUnpaidBalance',
      function () {
        scope.selectedAdjustmentTypeIndex = -1;
        scope.isChangingAdjustmentOrPayment = true;
        scope.dataForCreditTransaction = {
          HasValidationError: false,
          ServiceAndDebitTransactionDtos: [
            {
              AdjustmentAmount: 79,
              ServiceTransactionId: 100,
              TotalUnpaidBalance: 80,
            },
          ],
        };
        expect(ctrl.validateAdjustment()).toBe(true);
        expect(scope.dataForCreditTransaction.HasValidationError).toBe(false);
      }
    );
  });

  //adjustmentCallSetup
  describe('adjustmentCallSetup function ->', function () {
    it('adjustmentCallSetup should return list of services to be returned when dataForModal.TransactionList is not null', function () {
      //mock for dataForModal
      dataForModal = {
        PatientAccountDetails: {
          AccountId: 1000,
          AccountMemberId: 2000,
        },
        DefaultSelectedIndex: 2,
        CurrentPatient: {
          Value: {
            FirstName: 'First',
            LastName: 'Last',
            MiddleName: 'Middle',
            PreferredName: 'Preferred',
            Suffix: 'Suffix',
            PrefferedDentist: 3000,
            PreferredHygienist: 4000,
            PersonAccount: {
              AccountId: 1000,
              PersonAccountMember: {
                AccountMemberId: 2000,
              },
            },
          },
        },
        TransactionList: [{ EncounterId: 1 }],
        AllProviders: mockAllProvidersList,
        PaymentTypes: {
          Value: mockPaymentTypesList,
        },
        AdjustmentTypes: {
          Value: mockAdjustmentTypeList,
        },
      };
      createController();
      var result = ctrl.adjustmentCallSetup(1);

      expect(result.length).toBe(0);
      expect(dataForModal.TransactionList.length).toEqual(1);
    });

    it('adjustmentCallSetup should return list of services to be returned when dataForModal.TransactionList is not null and isAdjustmentOnUnappliedAmount is false', function () {
      //mock for dataForModal
      dataForModal = {
        PatientAccountDetails: {
          AccountId: 1000,
          AccountMemberId: 2000,
        },
        DefaultSelectedIndex: 2,
        CurrentPatient: {
          Value: {
            FirstName: 'First',
            LastName: 'Last',
            MiddleName: 'Middle',
            PreferredName: 'Preferred',
            Suffix: 'Suffix',
            PrefferedDentist: 3000,
            PreferredHygienist: 4000,
            PersonAccount: {
              AccountId: 1000,
              PersonAccountMember: {
                AccountMemberId: 2000,
              },
            },
          },
        },
        TransactionList: [{ EncounterId: 1 }],
        AllProviders: mockAllProvidersList,
        PaymentTypes: {
          Value: mockPaymentTypesList,
        },
        AdjustmentTypes: {
          Value: mockAdjustmentTypeList,
        },
      };
      scope.isAdjustmentOnUnappliedAmount = false;
      createController();
      var result = ctrl.adjustmentCallSetup(1);

      expect(result.length).toBe(0);
      expect(dataForModal.TransactionList.length).toEqual(1);
    });

    it('adjustmentCallSetup should return list of services to be returned when dataForModal.TransactionList is not null and isAdjustmentOnUnappliedAmount is true', function () {
      //mock for dataForModal
      dataForModal = {
        PatientAccountDetails: {
          AccountId: 1000,
          AccountMemberId: 2000,
        },
        DefaultSelectedIndex: 2,
        CurrentPatient: {
          Value: {
            FirstName: 'First',
            LastName: 'Last',
            MiddleName: 'Middle',
            PreferredName: 'Preferred',
            Suffix: 'Suffix',
            PrefferedDentist: 3000,
            PreferredHygienist: 4000,
            PersonAccount: {
              AccountId: 1000,
              PersonAccountMember: {
                AccountMemberId: 2000,
              },
            },
          },
        },
        TransactionList: [{ EncounterId: 1 }],
        AllProviders: mockAllProvidersList,
        PaymentTypes: {
          Value: mockPaymentTypesList,
        },
        AdjustmentTypes: {
          Value: mockAdjustmentTypeList,
        },
      };
      scope.isAdjustmentOnUnappliedAmount = true;
      createController();
      var result = ctrl.adjustmentCallSetup(1);

      expect(result.length).toBe(0);
      expect(dataForModal.TransactionList.length).toEqual(1);
    });

    it('adjustmentCallSetup should return list of services to be returned when dataForModal.TransactionList is null', function () {
      var result = ctrl.adjustmentCallSetup(1);

      expect(result.length).not.toBe(0);
      expect(result.length).toBe(2);
      expect(dataForModal.TransactionList).not.toBeDefined();
    });

    it('adjustmentCallSetup should return calls to get services and debits when isForCloseClaim is false', function () {
      //mock for dataForModal
      dataForModal = {
        PatientAccountDetails: {
          AccountId: 1000,
          AccountMemberId: 2000,
        },
        DefaultSelectedIndex: 2,
        CurrentPatient: {
          Value: {
            FirstName: 'First',
            LastName: 'Last',
            MiddleName: 'Middle',
            PreferredName: 'Preferred',
            Suffix: 'Suffix',
            PrefferedDentist: 3000,
            PreferredHygienist: 4000,
            PersonAccount: {
              AccountId: 1000,
              PersonAccountMember: {
                AccountMemberId: 2000,
              },
            },
          },
        },
        serviceTransactionData: { isForCloseClaim: false },
        AllProviders: mockAllProvidersList,
        PaymentTypes: {
          Value: mockPaymentTypesList,
        },
        AdjustmentTypes: {
          Value: mockAdjustmentTypeList,
        },
      };
      createController();
      var result = ctrl.adjustmentCallSetup();

      expect(result.length).toBe(2);
    });
    it('adjustmentCallSetup should return call to get services only when isForCloseClaim is true', function () {
      //mock for dataForModal
      dataForModal = {
        PatientAccountDetails: {
          AccountId: 1000,
          AccountMemberId: 2000,
        },
        DefaultSelectedIndex: 2,
        CurrentPatient: {
          Value: {
            FirstName: 'First',
            LastName: 'Last',
            MiddleName: 'Middle',
            PreferredName: 'Preferred',
            Suffix: 'Suffix',
            PrefferedDentist: 3000,
            PreferredHygienist: 4000,
            PersonAccount: {
              AccountId: 1000,
              PersonAccountMember: {
                AccountMemberId: 2000,
              },
            },
          },
        },
        serviceTransactionData: { isForCloseClaim: true },
        AllProviders: mockAllProvidersList,
        PaymentTypes: {
          Value: mockPaymentTypesList,
        },
        AdjustmentTypes: {
          Value: mockAdjustmentTypeList,
        },
      };
      createController();
      var result = ctrl.adjustmentCallSetup();

      expect(result.length).toBe(1);
    });
  });

  //processAdjustmentData
  describe('processAdjustmentData function ->', function () {
    it('should set isLoading to false when adjustmentCallSetup exists', function () {
      scope.isLoading = true;
      ctrl.adjustmentCallSetup = () => {};
      spyOn(
        ctrl,
        'mergeServiceTransactionsAndDebitTransaction'
      ).and.returnValue(q.resolve());

      ctrl.processAdjustmentData();
      scope.$apply();
      timeout.flush(100);

      expect(scope.isLoading).toBeFalsy();
    });

    it('should not set isLoading when adjustmentCallSetup does not exists', function () {
      scope.isLoading = true;
      ctrl.adjustmentCallSetup = null;

      ctrl.processAdjustmentData();
      scope.$apply();
      timeout.flush(100);

      expect(scope.isLoading).toEqual(true);
    });
  });

  //fetchAdjustmentDependenciesW
  describe('fetchAdjustmentDependencies function ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'processAdjustmentData');
    });

    it('should not fetch data for adjustment process when isLoading is already set to true', function () {
      scope.isLoading = true;

      ctrl.fetchAdjustmentDependencies();
      scope.$apply();
      expect(scope.isLoading).toBe(true);
    });

    it('should not fetch all required data for adjustment process when patientInfo and patientInfoAccount does not exists', function () {
      ctrl.patientInfo = null;
      ctrl.patientInfoAccount = null;
      scope.isLoading = false;

      ctrl.fetchAdjustmentDependencies();
      scope.$apply();
      expect(scope.isLoading).toBe(false);
    });

    it('should fetch all required data for adjustment process when patientInfo and patientInfoAccount exists', function () {
      ctrl.patientInfo = {};
      ctrl.patientInfoAccount = {};
      scope.isLoading = false;

      ctrl.fetchAdjustmentDependencies();
      scope.$apply();
      expect(scope.isLoading).toBe(true);
      expect(modalFactory.LoadingModalWithoutTemplate).toHaveBeenCalled();
    });
  });

  //skipAdjustment
  describe('skipAdjustment function ->', function () {
    it('skipAdjustment is called when currentUnappliedTransactionIndex is zero', function () {
      scope.currentUnappliedTransactionIndex = 0;
      spyOn(ctrl, 'proceedToNextAdjustment');
      scope.skipAdjustment();
      expect(ctrl.proceedToNextAdjustment).toHaveBeenCalled();
    });
  });

  //proceedToNextAdjustment
  describe('proceedToNextAdjustment function ->', function () {
    it('Should allow user to apply or process next unapplied transaction while more than one unapplied transactions and skipDataFetch is true', function () {
      scope.UnappliedTransactionsList = mockTransactionsList;
      scope.currentUnappliedTransactionIndex = 1;
      scope.unappliedTransactionsCount = 2;
      spyOn(ctrl, 'mergeServiceTransactionsAndDebitTransaction');

      ctrl.proceedToNextAdjustment(true);
      scope.$apply();
      expect(scope.dataForCreditTransaction.HasUnappliedAmountAdjusted).toBe(
        false
      );
      expect(ctrl.currentUnappliedTransaction.Amount).toEqual(10.0);
      expect(ctrl.currentUnappliedTransaction.UnassignedAmount).toEqual(10);
      expect(ctrl.currentUnappliedTransaction.ProviderUserId).toEqual(
        '43189973-d808-4fd1-a8cc-fabf84c9f18f'
      );
    });

    it('Should allow user to apply or process next unapplied transaction while more than one unapplied transactions and skipDataFetch is false', function () {
      scope.UnappliedTransactionsList = mockTransactionsList;
      scope.currentUnappliedTransactionIndex = 1;
      scope.unappliedTransactionsCount = 2;
      spyOn(ctrl, 'fetchAdjustmentDependencies').and.returnValue(q.resolve());

      ctrl.proceedToNextAdjustment(false);
      scope.$apply();
      expect(scope.dataForCreditTransaction.HasUnappliedAmountAdjusted).toBe(
        false
      );
      expect(ctrl.currentUnappliedTransaction.Amount).toEqual(20.11);
      expect(ctrl.currentUnappliedTransaction.UnassignedAmount).toEqual(9);
      expect(ctrl.currentUnappliedTransaction.ProviderUserId).toEqual(
        '43189973-d808-4fd1-a8cc-fabf84c9f18f'
      );
    });
  });

  //getAllAccountMembersSuccess
  describe('getAllAccountMembersSuccess function ->', function () {
    beforeEach(inject(function () {
      localize = {
        getLocalizedString: jasmine
          .createSpy('localize.getLocalizedString')
          .and.returnValue('All Account Members'),
      };
      createController();
    }));
    it('should handle success callback for get all account-member service', function () {
      var successResponse = {
        Value: [
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'John',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
        ],
      };
      ctrl.getAllAccountMembersSuccess(successResponse);
      expect(toastrFactory.error).not.toHaveBeenCalled();
    });
    it('should set showAccountMembersDropdown to true if more than one account member and the length of accountMembersOptionsTemp should be (length+1) since All member item is to be added if the members are more then one', function () {
      var res = {
        Value: [
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'John',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'Babs',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
        ],
      };
      //listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(item);
      ctrl.getAccountMembersSuccess(res);
      expect(scope.showAccountMembersDropdown).toBe(true);
      expect(scope.accountMembersOptionsTemp[0].name).toBe(
        'All Account Members(2)'
      );
      expect(scope.accountMembersOptionsTemp.length).toBe(3);
    });
    it('should show error message if service returns blank data', function () {
      var successResponse = {};
      ctrl.getAllAccountMembersSuccess(successResponse);
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('length of accountMembersOptionsTemp should be one when only one member is added, to make sure All member is not added in that case', function () {
      var successResponse = {
        Value: [
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'John',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
        ],
      };
      ctrl.patientAccountInfo.AccountId = {};
      ctrl.getAllAccountMembersSuccess(successResponse);
      expect(
        patientServices.Account.getAllAccountMembersByAccountId
      ).toHaveBeenCalled();
    });
  });
  //getAllAccountMembersFailure
  describe('getAllAccountMembersFailure function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));
    it('should handle failure callback for get all account-members service', function () {
      ctrl.getAllAccountMembersFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('accountMemberOptionClicked function', function () {
    beforeEach(inject(function () {
      createController();
      scope.accountMembersOptions = [
        { personId: 0, patientDetailedName: 'All Account Members' },
        { personId: 1, patientDetailedName: 'View2' },
        { personId: 3, patientDetailedName: 'View3' },
      ];
      scope.dataForCreditTransaction = { UnassignedAmount: 0.0 };
      scope.dataForCreditTransaction.CreditTransactionDto = {
        Amount: 0.0,
        AssignedAdjustmentTypeId: 1,
        PaymentTypeId: null,
        ClaimId: null,
      };
    }));

    it('should set account view to default options when passed option is not valid', function () {
      scope.accountMemberOptionClicked(null);
      //timeout.flush(100);
      ctrl.processServiceTransactionData();
      ctrl.setSelectedAccountMember(scope.serviceAndDebitTransactionDtos, true);
      expect(scope.selectedAccountMemberOption).toEqual(
        scope.accountMembersOptions[0].patientDetailedName
      );
    });

    it('should set account view to passed option when passed option is valid', function () {
      scope.accountMemberOptionClicked(scope.accountMembersOptions[1]);
      //timeout.flush(100);
      ctrl.processServiceTransactionData();
      ctrl.setSelectedAccountMember(
        scope.serviceAndDebitTransactionDtos,
        false
      );
      expect(scope.selectedAccountMemberOption).toEqual(
        scope.accountMembersOptions[1].patientDetailedName
      );
      expect(scope.dataForCreditTransaction.UnassignedAmount).toEqual(0.0);
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto.Amount
      ).toEqual(0.0);
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
          .AssignedAdjustmentTypeId
      ).toEqual(1);
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId
      ).toBeNull();
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto.ClaimId
      ).toBeNull();
    });
    it('should set account view to passed option when passed option is valid', function () {
      scope.accountMemberOptionClicked(scope.accountMembersOptions[2]);
      ctrl.processServiceTransactionData();
      ctrl.setSelectedAccountMember(
        scope.serviceAndDebitTransactionDtos,
        false
      );
      expect(scope.selectedAccountMemberOption).toEqual(
        scope.accountMembersOptions[2].patientDetailedName
      );
    });
  });

  //setAccountMemberOptionData
  it('setAccountMemberOptionData should set default account member option data, if the patient id 0 is present in accountMembersOptions', function () {
    createController();
    scope.accountMembersOptions = [
      { personId: 0, patientDetailedName: 'Name0' },
      { personId: 1, patientDetailedName: 'Name1' },
    ];
    scope.defaultAccountMemberOptionIndex = undefined;
    scope.selectedAccountMemberOption = undefined;
    scope.currentPatientId = undefined;

    ctrl.setAccountMemberOptionData();

    expect(scope.defaultAccountMemberOptionIndex).toBe(0);
    expect(scope.selectedAccountMemberOption).toBe('Name0');
    expect(scope.currentPatientId).toBe(0);
  });

  it('setAccountMemberOptionData should set accountMembersOptionsTemp data, if it is not null', function () {
    createController();
    scope.accountMembersOptionsTemp = [
      { personId: 0, patientDetailedName: 'Name0' },
      { personId: 1, patientDetailedName: 'Name1' },
    ];
    scope.accountMembersOptions = [
      { personId: 2, patientDetailedName: 'Name2' },
      { personId: 3, patientDetailedName: 'Name3' },
    ];
    ctrl.setAccountMemberOptionData();
    expect(scope.accountMembersOptions).toBe(scope.accountMembersOptionsTemp);
    expect(scope.currentPatientId).toBe(0);
  });
  it('setAccountMemberOptionData should set accountMembersOptions data, if accountMembersOptionsTemp is null', function () {
    createController();
    scope.accountMembersOptionsTemp = null;
    scope.accountMembersOptions = [
      { personId: 2, patientDetailedName: 'Name2' },
      { personId: 3, patientDetailedName: 'Name3' },
    ];
    ctrl.setAccountMemberOptionData();
    expect(scope.accountMembersOptions).toBe(scope.accountMembersOptions);
    expect(scope.currentPatientId).toBe(2);
  });

  it('setAccountMemberOptionData should set defaultAccountMemberOptionIndex, if defaultSelectedAccountMemberId is not null', function () {
    createController();
    ctrl.defaultSelectedAccountMemberId = 1;
    scope.accountMembersOptions = [
      { personId: 2, patientDetailedName: 'Name2' },
      { personId: 3, patientDetailedName: 'Name3' },
    ];
    listHelper.findIndexByFieldValue = jasmine
      .createSpy('listHelper.findIndexByFieldValue')
      .and.returnValue(1);
    ctrl.setAccountMemberOptionData();
    expect(scope.defaultAccountMemberOptionIndex).toEqual(1);
  });

  it('setAccountMemberOptionData should set defaultAccountMemberOptionIndex, if currentPatientId is not null', function () {
    createController();
    scope.currentPatientId = 1;
    scope.accountMembersOptions = [
      { personId: 2, patientDetailedName: 'Name2' },
      { personId: 3, patientDetailedName: 'Name3' },
    ];
    listHelper.findIndexByFieldValue = jasmine
      .createSpy('listHelper.findIndexByFieldValue')
      .and.returnValue(1);
    ctrl.setAccountMemberOptionData();
    expect(scope.defaultAccountMemberOptionIndex).toEqual(1);
  });

  it('setAccountMemberOptionData should set defaultAccountMemberOptionIndex to 0, if personIndex is not positive', function () {
    createController();
    scope.currentPatientId = 1;
    scope.accountMembersOptions = [
      { personId: 2, patientDetailedName: 'Name2' },
      { personId: 3, patientDetailedName: 'Name3' },
    ];
    listHelper.findIndexByFieldValue = jasmine
      .createSpy('listHelper.findIndexByFieldValue')
      .and.returnValue(-1);
    ctrl.setAccountMemberOptionData();
    expect(scope.defaultAccountMemberOptionIndex).toEqual(0);
  });

  describe('setCreditTransactionData function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));
    it('setCreditTransactionData should set credit transaction data if existing adjustment data is null', function () {
      scope.existingAdjustmentData = null;
      ctrl.setCreditTransactionData();
      expect(scope.dataForCreditTransaction).not.toBeNull();
    });

    it('setCreditTransactionData  should set data if existing adjustment data is not null', function () {
      ctrl.setCreditTransactionData();
      expect(scope.dataForCreditTransaction).not.toBeNull();
      expect(scope.dataForCreditTransaction.IsEditOperation).toBe(true);
      scope.dataForCreditTransaction.CreditTransactionDto = {};
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto
      ).not.toBeNull();
    });

    it('setCreditTransactionData should call setDefaultNegativeAdjType() if closing claim', function () {
      spyOn(ctrl, 'setDefaultNegativeAdjType');
      scope.isForCloseClaim = true;
      ctrl.setCreditTransactionData();
      expect(ctrl.setDefaultNegativeAdjType).toHaveBeenCalled();
    });
  });

  describe('setProviderUserId function ->', function () {
    it('setProviderUserId  should set data on account level', function () {
      var newMockTransactionsList = [
        {
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          LocationId: 14601,
          AccountId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
          AdjustmentTypeId: null,
          Amount: -20.11,
          ClaimId: null,
          DateEntered: '2015-10-05T11:45:20.614Z',
          Description: '1234',
          PaymentTypePromptValue: null,
          EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
          Note: null,
          PaymentTypeId: '2f9dc9c9-8294-4395-93d1-49a904d2d070',
          TransactionTypeId: 2,
          CreditTransactionDetails: [
            {
              CreditTransactionDetailId: '46ee5116-ad4f-41c8-b8ff-01d6843cce5d',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -5.05,
              AppliedToServiceTransationId:
                '7f323705-a62c-4129-8681-3756119e6e4b',
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: '6a9fb40e-649b-4022-9e26-fbabcf61aa55',
              ProviderUserId: 'cf0e2663-80f5-43ad-89d4-4416a6111521',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:41.6659051Z',
            },
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -9,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: 'cf0e2663-80f5-43ad-89d4-4416a6111521',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            {
              CreditTransactionDetailId: 'ad8829b1-74c8-41d6-929b-89c924f36cea',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -6.06,
              AppliedToServiceTransationId:
                'cd0326d1-aebf-4ee5-9b7a-b63efa01054a',
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: '6a9fb40e-649b-4022-9e26-fbabcf61aa55',
              ProviderUserId: 'cf0e2663-80f5-43ad-89d4-4416a6111521',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.2187017Z',
            },
          ],
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T11:45:43.290382+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.290382Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T11:45:39.8280813Z',
          UnassignedAmount: -9,
        },
      ];

      ctrl.currentUnappliedTransaction = newMockTransactionsList[0];
      dataForModal.unappliedCreditTransactionDetailId =
        '58808515-0b63-4d91-b4ff-e05824d67f89';
      ctrl.setProviderUserId();
      expect(ctrl.currentUnappliedTransaction.ProviderUserId).toEqual(
        'cf0e2663-80f5-43ad-89d4-4416a6111521'
      );
    });

    it('setProviderUserId  should set provideruserid when provider userid is same for all credi transaction details', function () {
      var newMockTransactionsList = [
        {
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          LocationId: 14601,
          AccountId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
          AdjustmentTypeId: null,
          Amount: -20.11,
          ClaimId: null,
          DateEntered: '2015-10-05T11:45:20.614Z',
          Description: '1234',
          PaymentTypePromptValue: null,
          EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
          Note: null,
          PaymentTypeId: '2f9dc9c9-8294-4395-93d1-49a904d2d070',
          TransactionTypeId: 2,
          CreditTransactionDetails: [
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -9,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: 'cf0e2663-80f5-43ad-89d4-4416a6111521',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            {
              CreditTransactionDetailId: 'ad8829b1-74c8-41d6-929b-89c924f36cea',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -6.06,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: 'cf0e2663-80f5-43ad-89d4-4416a6111521',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.2187017Z',
            },
          ],
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T11:45:43.290382+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.290382Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T11:45:39.8280813Z',
          UnassignedAmount: -9,
        },
      ];

      ctrl.currentUnappliedTransaction = newMockTransactionsList[0];

      ctrl.setProviderUserId();
      expect(ctrl.currentUnappliedTransaction.ProviderUserId).toEqual(
        'cf0e2663-80f5-43ad-89d4-4416a6111521'
      );
    });

    it('setProviderUserId  should not set provider userid when provider userid is different for all credit transaction details', function () {
      var newMockTransactionsList = [
        {
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          LocationId: 14601,
          AccountId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
          AdjustmentTypeId: null,
          Amount: -20.11,
          ClaimId: null,
          DateEntered: '2015-10-05T11:45:20.614Z',
          Description: '1234',
          PaymentTypePromptValue: null,
          EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
          Note: null,
          PaymentTypeId: '2f9dc9c9-8294-4395-93d1-49a904d2d070',
          TransactionTypeId: 2,
          CreditTransactionDetails: [
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -9,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            {
              CreditTransactionDetailId: 'ad8829b1-74c8-41d6-929b-89c924f36cea',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -6.06,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: 'cf0e2663-80f5-43ad-89d4-4416a6111521',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.2187017Z',
            },
          ],
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T11:45:43.290382+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.290382Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T11:45:39.8280813Z',
          UnassignedAmount: -9,
        },
      ];

      ctrl.currentUnappliedTransaction = newMockTransactionsList[0];

      ctrl.setProviderUserId();
      expect(ctrl.currentUnappliedTransaction.ProviderUserId).toEqual('');
    });
  });

  describe('applyTransactionFailure function ->', function () {
    it('applying payment should be shown when selectedAdjustmentTypeIndex is 2', function () {
      var errorObj = {};
      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          ObjectState: 'Add',
        },
        {
          ObjectState: 'Add',
        },
      ];
      scope.selectedAdjustmentTypeIndex = 2;
      ctrl.applyTransactionFailure(errorObj);
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(ctrl.failureMessageString).toBe('applying payment');
    });

    it('applying adjustment should be shown when selectedAdjustmentTypeIndex is not equal to 2', function () {
      var errorObj = {};
      scope.dataForCreditTransaction.CreditTransactionDto = {};
      scope.dataForCreditTransaction.CreditTransactionDto.CreditTransactionDetails = [
        {
          ObjectState: 'Add',
        },
        {
          ObjectState: 'Add',
        },
      ];
      scope.selectedAdjustmentTypeIndex = 1;
      ctrl.applyTransactionFailure(errorObj);
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(ctrl.failureMessageString).toBe('applying adjustment');
    });
  });

  describe('createNewCreditTransactionDetailRecord function ->', function () {
    it('serviceTransactions Datatag should equal creditTransactionDetail DebitTransactionDataTag when TransactionTypeId is 5', function () {
      var serviceTransactionDetail = {
        AccountMemberId: '111',
        AdjustmentAmount: 10,
        ProviderUserId: '123',
        EncounterId: '12',
        TransactionTypeId: 5,
        DataTag: 'abc',
      };
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          CreditTransactionId: 77,
        },
      };
      var creditTransacitonDetail = ctrl.createNewCreditTransactionDetailRecord(
        serviceTransactionDetail
      );
      expect(creditTransacitonDetail.DebitTransactionDataTag).toEqual('abc');
    });

    it('serviceTransactions Datatag should equal creditTransactionDetail DebitTransactionDataTag when TransactionTypeId is not equal to 5', function () {
      var serviceTransactionDetail = {
        AccountMemberId: '111',
        AdjustmentAmount: 10,
        ProviderUserId: '123',
        EncounterId: '12',
        TransactionTypeId: 1,
        DataTag: 'abc',
      };
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          CreditTransactionId: 77,
        },
      };
      var creditTransacitonDetail = ctrl.createNewCreditTransactionDetailRecord(
        serviceTransactionDetail
      );
      expect(creditTransacitonDetail.ServiceTransactionDataTag).toEqual('abc');
    });
  });

  describe('ctrl.setDefaultNegativeAdjType ->', function () {
    it('businessCenterServices.BenefitPlan.get should be called', function () {
      ctrl.setDefaultNegativeAdjType();
      expect(businessCenterServices.BenefitPlan.get).toHaveBeenCalled();
    });
  });

  describe('ctrl.getBenefitPlanSuccess ->', function () {
    it('scope.dataForCreditTransaction.CreditTransactionDto.AdjustmentTypeId should be 1', function () {
      var response = { Value: { AdjustmentTypeId: null } };
      scope.dataForCreditTransaction.CreditTransactionDto = {
        AdjustmentTypeId: '1',
      };
      ctrl.getBenefitPlanSuccess(response);
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto.AdjustmentTypeId
      ).toBe('1');
    });

    it('scope.dataForCreditTransaction.CreditTransactionDto.AdjustmentTypeId should be 2', function () {
      var response = { Value: { AdjustmentTypeId: '2' } };
      scope.dataForCreditTransaction.CreditTransactionDto = {
        AdjustmentTypeId: '1',
      };
      ctrl.getBenefitPlanSuccess(response);
      expect(
        scope.dataForCreditTransaction.CreditTransactionDto.AdjustmentTypeId
      ).toBe('2');
    });
  });

  describe('ctrl.getBenefitPlanFailure ->', function () {
    it('toastrFactory.error should be called', function () {
      ctrl.getBenefitPlanFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('scope.showAdjType ->', function () {
    it('should return true for all', function () {
      scope.isForCloseClaim = false;
      var index0 = scope.showAdjType(0);
      var index1 = scope.showAdjType(1);
      var index3 = scope.showAdjType(3);

      expect(index0).toBe(true);
      expect(index1).toBe(true);
      expect(index3).toBe(true);
    });
    it('should return false for index 0 and 3 - true for index 1', function () {
      scope.isForCloseClaim = true;
      var index0 = scope.showAdjType(0);
      var index1 = scope.showAdjType(1);
      var index3 = scope.showAdjType(3);

      expect(index0).toBe(false);
      expect(index1).toBe(true);
      expect(index3).toBe(false);
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

  // open edge tests

  // CurrencyTypes
  // 1    Cash
  // 2    Check
  // 3    CreditCard
  // 4    DebitCard
  // 5    Other

  // selectedAdjustmentTypeIndex
  // 0   PositiveAdjustment
  // 1   NegativeAdjustment
  // 2   Payment

  describe('scope.startPaymentProviderTransaction method when PositiveAdjustment and CurrencyType is debit or credit (DebitTransaction)->', function () {
    var userLocation;
    beforeEach(function () {
      spyOn(ctrl, 'createDebitReturn');
      spyOn(ctrl, 'createCreditReturn');
      spyOn(ctrl, 'getCardTransactionOverlay');
      scope.dataForDebitTransaction = {
        DebitTransactionDto: { IsPaymentGateway: true, CurrencyType: '1' },
        ErrorFlags: { hasError: false },
      };
   
      userLocation = {
        IsPaymentGatewayEnabled: true,
      };
    });

    // credit return on positive adjustment
    it(
      'should call ctrl.createCreditReturn if validateAdjustment returns true and CurrencyType is 1 and' + 'paymentProviderSupportsIndependentRefunds is true' +
        'scope.selectedAdjustmentTypeIndex is 0 (positive adjustment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
        scope.dataForDebitTransaction.paymentProviderSupportsIndependentRefunds= true;
        scope.selectedAdjustmentTypeIndex = 0;
        scope.dataForDebitTransaction.DebitTransactionDto.CurrencyType = '1';
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createCreditReturn).toHaveBeenCalled();
      }
    );

    it(
      'should not call ctrl.createCreditReturn if validateAdjustment returns false and CurrencyType is 1 and' +
        'scope.selectedAdjustmentTypeIndex is 0 (positive adjustment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        spyOn(ctrl, 'validateAdjustment').and.returnValue(false);
        scope.selectedAdjustmentTypeIndex = 0;
        scope.dataForDebitTransaction.DebitTransactionDto.CurrencyType = '1';
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createCreditReturn).not.toHaveBeenCalled();
        expect(scope.dataForDebitTransaction.ErrorFlags.hasError).toBe(true);
      }
    );
    it(
      'should not call ctrl.createCreditReturn if validateAdjustment returns true and CurrencyType is 1 and' +'paymentProviderSupportsIndependentRefunds is false' +
        'scope.selectedAdjustmentTypeIndex is 0 (positive adjustment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
        scope.selectedAdjustmentTypeIndex = 0;
        scope.dataForDebitTransaction.paymentProviderSupportsIndependentRefunds =false;
        scope.dataForDebitTransaction.DebitTransactionDto.CurrencyType = '1';
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createCreditReturn).not.toHaveBeenCalled();

      }
    );

    // debit return on positive adjustment
    it(
      'should call ctrl.createDebitReturn if validateAdjustment returns true and CurrencyType is 2 and'+'paymentProviderSupportsIndependentRefunds is true' +
        'scope.selectedAdjustmentTypeIndex is 0 (positive adjustment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        scope.dataForDebitTransaction.paymentProviderSupportsIndependentRefunds =true;
        spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
        scope.selectedAdjustmentTypeIndex = 0;
        scope.dataForDebitTransaction.DebitTransactionDto.CurrencyType = '2';
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createDebitReturn).toHaveBeenCalled();
      }
    );
      // debit return on positive adjustment
      it(
        'should not call ctrl.createDebitReturn if validateAdjustment returns true and CurrencyType is 2 and'+'paymentProviderSupportsIndependentRefunds is false' +
          'scope.selectedAdjustmentTypeIndex is 0 (positive adjustment) and userLocation.IsPaymentGatewayEnabled',
        function () {
          spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
          scope.selectedAdjustmentTypeIndex = 0;
          scope.dataForDebitTransaction.DebitTransactionDto.CurrencyType = '2';
          scope.dataForDebitTransaction.paymentProviderSupportsIndependentRefunds =false;
          scope.startPaymentProviderTransaction(userLocation);
          expect(ctrl.createDebitReturn).not.toHaveBeenCalled();
        }
      )

    it(
      'should not call ctrl.createCreditReturn if validateAdjustment returns false and CurrencyType is 2 and' +
        'scope.selectedAdjustmentTypeIndex is 0(positive adjustment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        spyOn(ctrl, 'validateAdjustment').and.returnValue(false);
        scope.selectedAdjustmentTypeIndex = 0;
        scope.dataForDebitTransaction.DebitTransactionDto.CurrencyType = '2';
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createDebitReturn).not.toHaveBeenCalled();
        expect(scope.dataForDebitTransaction.ErrorFlags.hasError).toBe(true);
      }
    );
  });

  describe('scope.startPaymentProviderTransaction method when NegativeAdjustment  and CurrencyType is 3 (CreditCard) OR 4 (DebitCard) ->', function () {
    var userLocation;
    beforeEach(function () {
      spyOn(ctrl, 'createCredit');
      spyOn(ctrl, 'createDebit');
      spyOn(ctrl, 'getCardTransactionOverlay');
      scope.dataForCreditTransaction = {
        CreditTransactionDto: { CurrencyType: '3', PaymentTypeId: '1234' },
        ErrorFlags: { hasError: false },
        PaymentTypes: [
          { PaymentTypeId: '1234', CurrencyTypeId: 3 },
          { PaymentTypeId: '1235', CurrencyTypeId: 4 },
          { PaymentTypeId: '1236', CurrencyTypeId: 5 },
        ],
      };
      userLocation = {
        IsPaymentGatewayEnabled: true,
        PaymentProvider: scope.PaymentProviders.OpenEdge
      };
      scope.CurrencyTypes = { Cash: 1, Check: 2, CreditCard: 3, DebitCard: 4, Other:5 };
    });

    // credit on negative adjustment
    it(
      'should call ctrl.createCredit if validateAdjustment returns true and CurrencyType is 3 (CreditCard) and' +
        'scope.selectedAdjustmentTypeIndex is 1 (negative adjustment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.CreditCard;
        scope.selectedAdjustmentTypeIndex = 1;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createCredit).toHaveBeenCalled();
      }
    );

    it(
      'should not call ctrl.createCredit if validateAdjustment returns false and CurrencyType is 3 (CreditCard)and' +
        'scope.selectedAdjustmentTypeIndex is 1 (negative adjustment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        spyOn(ctrl, 'validateAdjustment').and.returnValue(false);
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.CreditCard;
        scope.selectedAdjustmentTypeIndex = 1;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createCredit).not.toHaveBeenCalled();
      }
    );

    // debit on negative adjustment
    it(
      'should call ctrl.createDebit if validateAdjustment returns true and CurrencyType is 4 (DebitCard) and' +
        'scope.selectedAdjustmentTypeIndex is 1 (negative adjustment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId =
          '1235';
        spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
        scope.selectedAdjustmentTypeIndex = 1;
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.DebitCard;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createDebit).toHaveBeenCalled();
      }
    );

    it(
      'should not call ctrl.createDebit if validateAdjustment returns false and CurrencyType is 4 (DebitCard) and' +
        'scope.selectedAdjustmentTypeIndex 1 (negative adjustment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId =
          '1235';
        spyOn(ctrl, 'validateAdjustment').and.returnValue(false);
        scope.selectedAdjustmentTypeIndex = 1;
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.DebitCard;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createDebit).not.toHaveBeenCalled();
      }
    );
  });

  describe('scope.startPaymentProviderTransaction method when Payment and CurrencyType is 3 (CreditCard) OR 4 (DebitCard)  and Payment Provider isOpen Edge ->', function () {
    var userLocation;
    beforeEach(function () {
      spyOn(ctrl, 'createCredit');
      spyOn(ctrl, 'createDebit');
      spyOn(ctrl, 'getCardTransactionOverlay');
      scope.dataForCreditTransaction = {
        CreditTransactionDto: { CurrencyType: '3', PaymentTypeId: '1234' },
        ErrorFlags: { hasError: false },
        PaymentTypes: [
          { PaymentTypeId: '1234', CurrencyTypeId: 3 },
          { PaymentTypeId: '1235', CurrencyTypeId: 4 },
          { PaymentTypeId: '1236', CurrencyTypeId: 5 },
        ],
      };
      userLocation = {
        IsPaymentGatewayEnabled: true,
        PaymentProvider: scope.PaymentProviders.OpenEdge
      };
      scope.CurrencyTypes = { Cash: 1, Check: 2, CreditCard: 3, DebitCard: 4, Other:5 };
    });

    // credit on negative adjustment
    it(
      'should call ctrl.createCredit if validateAdjustment returns true and CurrencyType is 3 (CreditCard) and' +
        'scope.selectedAdjustmentTypeIndex is 2 (Payment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.CreditCard;
        scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId =
        '1234';
        scope.selectedAdjustmentTypeIndex = 2;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createCredit).toHaveBeenCalled();
      }
    );

    it(
      'should not call ctrl.createCredit if validateAdjustment returns false and CurrencyType is 3 (CreditCard) and' +
        'scope.selectedAdjustmentTypeIndex is 2 (Payment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        
        spyOn(ctrl, 'validateAdjustment').and.returnValue(false);
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.CreditCard;
        scope.selectedAdjustmentTypeIndex = 2;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createCredit).not.toHaveBeenCalled();
      }
    );

    // debit on payment
    it(
      'should call ctrl.createDebit if validateAdjustment returns true and CurrencyType is 4 (DebitCard) and' +
        'scope.selectedAdjustmentTypeIndex is 2 (Payment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId =
          '1235';
        spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
        scope.selectedAdjustmentTypeIndex = 2;
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.DebitCard;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createDebit).toHaveBeenCalled();
      }
    );

    it(
      'should not call ctrl.createDebit if validateAdjustment returns false and CurrencyType is 4 (DebitCard)and' +
        'scope.selectedAdjustmentTypeIndex is 2 (Payment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId =
          '1235';
        spyOn(ctrl, 'validateAdjustment').and.returnValue(false);
        scope.selectedAdjustmentTypeIndex = 2;
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.DebitCard;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createDebit).not.toHaveBeenCalled();
      }
    );
  });
  describe('scope.startPaymentProviderTransaction method when Payment and CurrencyType is 3 (CreditCard) OR 4 (DebitCard)  and Payment Provider is Transaction UI ->', function () {
    var userLocation;
    beforeEach(function () {
      spyOn(ctrl, 'createCredit');
      spyOn(ctrl, 'createDebit');
      spyOn(ctrl, 'createCreditOrDebitForPaymentProvider');
      
      spyOn(ctrl, 'getCardTransactionOverlay');
      scope.CurrencyTypes = { Cash: 1, Check: 2, CreditCard: 3, DebitCard: 4 , Other:5};
      scope.dataForCreditTransaction = {
        CreditTransactionDto: { CurrencyType: scope.CurrencyTypes.CreditCard, PaymentTypeId: '1234' },
        ErrorFlags: { hasError: false },
        PaymentTypes: [
          { PaymentTypeId: '1234', CurrencyTypeId: scope.CurrencyTypes.CreditCard },
          { PaymentTypeId: '1235', CurrencyTypeId: scope.CurrencyTypes.DebitCard },
          { PaymentTypeId: '1236', CurrencyTypeId: scope.CurrencyTypes.Other },
        ],
        showPaymentProvider:true
      };
      userLocation = {
        IsPaymentGatewayEnabled: true,
        PaymentProvider: scope.PaymentProviders.TransactionUI
      };
     
    });

    // credit on negative adjustment
    it(
      'should call ctrl.createCreditOrDebitForPaymentProvider if validateAdjustment returns true and CurrencyType is 3 (CreditCard) and' +
        'scope.selectedAdjustmentTypeIndex is 2 (Payment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.CreditCard;
        scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId =
        '1234';
        scope.selectedAdjustmentTypeIndex = 2;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createCreditOrDebitForPaymentProvider).toHaveBeenCalled();
        expect(ctrl.createCreditOrDebitForPaymentProvider).toHaveBeenCalledWith(true);
       
      }
    );

    it(
      'should not call ctrl.createCredit if validateAdjustment returns false and CurrencyType is 3 (CreditCard) and' +
        'scope.selectedAdjustmentTypeIndex is 2 (Payment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        
        spyOn(ctrl, 'validateAdjustment').and.returnValue(false);
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.CreditCard;
        scope.selectedAdjustmentTypeIndex = 2;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createCreditOrDebitForPaymentProvider).not.toHaveBeenCalled();
      }
    );

    // debit on payment
    it(
      'should call ctrl.createCreditOrDebitForPaymentProvider if validateAdjustment returns true and CurrencyType is 4 (DebitCard) and' +
        'scope.selectedAdjustmentTypeIndex is 2 (Payment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId =
          '1235';
        spyOn(ctrl, 'validateAdjustment').and.returnValue(true);
        scope.selectedAdjustmentTypeIndex = 2;
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.DebitCard;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createCreditOrDebitForPaymentProvider).toHaveBeenCalled();
        expect(ctrl.createCreditOrDebitForPaymentProvider).toHaveBeenCalledWith(false);
      }
    );

    it(
      'should not call ctrl.createCreditOrDebitForPaymentProvider if validateAdjustment returns false and CurrencyType is 4 (DebitCard)and' +
        'scope.selectedAdjustmentTypeIndex is 2 (Payment) and userLocation.IsPaymentGatewayEnabled',
      function () {
        scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId =
          '1235';
        spyOn(ctrl, 'validateAdjustment').and.returnValue(false);
        scope.selectedAdjustmentTypeIndex = 2;
        scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = scope.CurrencyTypes.DebitCard;
        scope.startPaymentProviderTransaction(userLocation);
        expect(ctrl.createCreditOrDebitForPaymentProvider).not.toHaveBeenCalled();
      }
    );
  });

  describe('scope.startPaymentProviderTransaction method when Payment and CurrencyType is not CreditCard or DebitCard ->', function () {
    beforeEach(function () {
      scope.dataForCreditTransaction = {
        CreditTransactionDto: {
          IsPaymentGateway: true,
          CurrencyType: '5',
          PaymentTypeId: '1236',
        },
        ErrorFlags: { hasError: false },
        PaymentTypes: [
          { PaymentTypeId: '1234', CurrencyTypeId: 3 },
          { PaymentTypeId: '1235', CurrencyTypeId: 4 },
          { PaymentTypeId: '1236', CurrencyTypeId: 5 },
        ],
      };
    });
    // Unable to test that continueAdjustment is called because it is an anonymous function
    // I would recommend this be refactored for testability but that is outside the scope of a bug fix
    // and not part of the open edge issue
  });

  describe('scope.applyAdjustment ->', function () {
    var userLocation;
    beforeEach(function () {
      scope.dataForCreditTransaction = {
        CreditTransactionDto: { PaymentTypeId: 10 },
      };
      userLocation = {
        IsPaymentGatewayEnabled: true,
      };
      spyOn(ctrl, 'applyAdjustment');
      ctrl.getUserLocation = jasmine
        .createSpy()
        .and.returnValue({ then: x => x(userLocation) });
    });

    it('should call ctrl.applyAdjustment if has valid userLocation and payment type', function (done) {
      scope.applyAdjustment();
      expect(ctrl.applyAdjustment).toHaveBeenCalledWith(userLocation);
      done();
    });
  });



  describe('window:beforeunload', function() {
    beforeEach(function () {
      window = { 
        addEventListener: jasmine.createSpy('addEventListener'), 
        removeEventListener: jasmine.createSpy('removeEventListener') 
      };
      spyOn(localStorage, 'removeItem');
    });
    it('should call preventDefault when showPayPageModal is true', function() {
      // Arrange
      scope.showPayPageModal = true;
      const event = jasmine.createSpyObj('event', ['preventDefault']);
  
      // Act
      scope.preventRefreshPage(event);
  
      // Assert
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should not call preventDefault when showPayPageModal is false', function() {
      // Arrange
      scope.showPayPageModal = false;
      const event = jasmine.createSpyObj('event', ['preventDefault']);
  
      // Act
      scope.preventRefreshPage(event);
  
      // Assert
      expect(event.preventDefault).not.toHaveBeenCalled();
    });


  });
  describe('createCreditOrDebitForPaymentProvider', function(){
    beforeEach(function () {
      scope.CurrencyTypes = { Cash: 1, Check: 2, CreditCard: 3, DebitCard: 4 , Other:5};
      scope.dataForCreditTransaction = {
        CreditTransactionDto: { CurrencyType: scope.CurrencyTypes.CreditCard, PaymentTypeId: '1234',AccountId: 123, Amount: 100},
        ErrorFlags: { hasError: false },
        PaymentTypes: [
          { PaymentTypeId: '1234', CurrencyTypeId: scope.CurrencyTypes.CreditCard },
          { PaymentTypeId: '1235', CurrencyTypeId: scope.CurrencyTypes.DebitCard },
          { PaymentTypeId: '1236', CurrencyTypeId: scope.CurrencyTypes.Other },
        ],
      };
      ctrl.userLocation = { LocationId: 456 , 
                            IsPaymentGatewayEnabled: true,
                            PaymentProvider:scope.PaymentProviders.TransactionUI };
      scope.dataForCreditTransaction.selectedCardReader= '123'; 
    });

    it('should call createCreditOrDebitForPaymentProvider with correct parameters', function () {
      // Act
    
       scope.selectedAdjustmentTypeIndex = 2;
      scope.dataForCreditTransaction.CreditTransactionDto.CurrencyType = 3;
      scope.dataForCreditTransaction.CreditTransactionDto.PaymentTypeId =
      '1234';
      ctrl.createCreditOrDebitForPaymentProvider(true);
      

      expect(paymentGatewayService.createPaymentProviderCreditOrDebitPayment).toHaveBeenCalled();
  
     // Assert
      expect(paymentGatewayService.createPaymentProviderCreditOrDebitPayment).toHaveBeenCalledWith(
        scope.dataForCreditTransaction.CreditTransactionDto.AccountId,
        scope.dataForCreditTransaction.CreditTransactionDto.Amount,
        1,
        false,
        scope.GatewayAccountType.None,
        scope.GatewayTransactionType.CreditCard,
        scope.ChargeType.Sale,
        scope.PaymentCategory.AccountPayment
      );
    });

    it('should call payPageRequest with correct parameters on success', function () {

      // Arrange
      ctrl.createCreditOrDebitForPaymentProvider(true);
      // Ac
      // Assert
      expect(patientServices.CreditTransactions.payPageRequest).toHaveBeenCalledWith({
        LocationId: 456,
        PaymentGatewayTransactionId: 4713,
        Amount: scope.dataForCreditTransaction.CreditTransactionDto.Amount,
        PartnerDeviceId: '123',
        RedirectUrl: location.origin +'/v1.0/index.html?v=1.0.0.1#/paypage-redirect-callback',
      });
  
      expect(scope.payPageUrl.$$unwrapTrustedValue()).toEqual($sce.trustAsResourceUrl('https://web.test.paygateway.com/paypage/v1/sales/123').$$unwrapTrustedValue());
      expect(scope.showPayPageModal).toBe(true);
      expect(sessionStorage.getItem('isPaypageModalOpen')).toBe('true');
    });
 
  })

  describe('paypageRedirectCallback->' , function(){



    it('should create a paypageRedirectEvent subscription and invoke callback on event', function() {
      const mockEvent = new Event('paypageRedirectCallback'); // Create a proper Event object
      spyOn(mockEvent, 'type').and.returnValue('paypageRedirectCallback');
  
      const callbackSpy = jasmine.createSpy('callback');
      
      const subscription = scope.paypageRedirectEvent(callbackSpy);
      window.dispatchEvent(new Event('paypageRedirectCallback'));
      
      expect(callbackSpy).toHaveBeenCalledWith(mockEvent);

      subscription.unsubscribe();
      window.dispatchEvent(new Event('paypageRedirectCallback'));

      expect(callbackSpy.calls.count()).toBe(1); // Callback shouldn't be called again after unsubscribe
    });

    it('should initialize paypageRedirectEvent and call paymentGatewayService', function() {
      scope.showPayPageModal = true; 
      scope.transactionInformation = {PaymentGatewayTransactionId:4356};
      const mockEvent = new Event('paypageRedirectCallback'); // Create a proper Event object
      spyOn(mockEvent, 'type').and.returnValue('paypageRedirectCallback');
  
  
      scope.init();
      window.dispatchEvent(new Event('paypageRedirectCallback'));
  
      expect(scope.clearPaypageModal).toHaveBeenCalled();
      expect(paymentGatewayService.completeCreditTransaction).toHaveBeenCalledWith(
          scope.transactionInformation,
          1,
          jasmine.any(Function),
          jasmine.any(Function)
      );
     });


  })

  describe('isDisableApplyButton function', function () {
    it('should return true when selectedAdjustmentTypeIndex is 1(negative adjustment) and required fields are missing', function () {
        scope.selectedAdjustmentTypeIndex = 1;
        scope.dataForCreditTransaction = {
            CreditTransactionDto: {
                $$DateEntered: null,
                AdjustmentTypeId: null,
                Amount: null
            }
        };

        expect(scope.isDisableApplyButton()).toBe(true);
    });

    it('should return false when selectedAdjustmentTypeIndex is 1 (negative adjustment)and all required fields are present', function () {
        scope.selectedAdjustmentTypeIndex = 1;
        scope.dataForCreditTransaction = {
            CreditTransactionDto: {
                $$DateEntered: '2024-12-27',
                AdjustmentTypeId: 1,
                Amount: 100
            }
        };

        expect(scope.isDisableApplyButton()).toBe(false);
    });

    it('should return true when selectedAdjustmentTypeIndex is 2(apply payment) and required fields are missing', function () {
        scope.selectedAdjustmentTypeIndex = 2;
        scope.dataForCreditTransaction = {
            CreditTransactionDto: {
                $$DateEntered: null,
                PaymentTypeId: null,
                Amount: null
            },
            cardReaders: [],
            selectedCardReader: null,
            PaymentTypes: []
        };

        expect(scope.isDisableApplyButton()).toBe(true);
    });


    it('should return true when required fields for selectedAdjustmentTypeIndex is 0 (positive adjustment) are missing', function () {
        scope.selectedAdjustmentTypeIndex = 0;
        scope.dataForDebitTransaction = {
            DebitTransactionDto: {
                $$DateEntered: null,
                AdjustmentTypeId: null,
                Amount: null
            },

        };
        ctrl.userLocation = {
            IsPaymentGatewayEnabled: true,
            PaymentProvider: scope.PaymentProviders.OpenEdge
        };
   

        expect(scope.isDisableApplyButton()).toBe(true);
    });

    it('should return false when all conditions are met for selectedAdjustmentTypeIndex is 0 (positive adjustment) ', function () {
        scope.selectedAdjustmentTypeIndex = 0;
        scope.dataForDebitTransaction = {
            DebitTransactionDto: {
                $$DateEntered: '2024-12-27',
                AdjustmentTypeId: 1,
                Amount: 100,
                IsPaymentGateway: false
            },
        };
 
        expect(scope.isDisableApplyButton()).toBe(false);
    });

 
  });

 describe('patient-adj-modal-open boradcast', function () {

     it("should broadcast 'patient-adj-modal-open' with true on init", function() {
      spyOn(rootScope, "$broadcast"); 
      scope.init();// Simulate controller init

      expect(rootScope.$broadcast).toHaveBeenCalledWith("patient-adj-modal-open", true);
     });

     it("should broadcast 'patient-adj-modal-open' with false on $destroy", function() {
      spyOn(rootScope, "$broadcast").and.callThrough(); 
      scope.$destroy(); // Simulate controller destruction

      expect(rootScope.$broadcast.calls.allArgs()).toContain(["patient-adj-modal-open", false]);
     });
  });

  });


