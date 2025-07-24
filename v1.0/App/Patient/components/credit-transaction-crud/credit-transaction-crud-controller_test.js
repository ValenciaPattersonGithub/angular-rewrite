describe('Controller: CreditTransactionCrudController', function () {
  var ctrl,
    scope,
    listHelper,
    modalFactory,
    patientServices,
    filter,
    toastrFactory,
    dataForModal,
    uibModalInstance,
    saveStates,
    patSecurityService,
    location,
    tabLauncher,
    claimsService,
    businessCenterServices;
  var timeZoneFactoryMock, referenceDataServiceMock, q;

  //#region before each
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

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

  beforeEach(inject(function ($rootScope, $controller, $filter, $q) {
    scope = $rootScope.$new();
    filter = $filter;
    q = $q;

    scope.transaction = { PromptTitle: null };

    referenceDataServiceMock.getData.and.callFake(function () {
      return q.resolve([
        { LocationId: 1234, Timezone: 'Central Standard Time' },
        { LocationId: 1235, Timezone: 'Mountain Standard Time' },
      ]);
    });

    //mock for patSecurityService
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
      generateMessage: jasmine.createSpy('patSecurityService.generateMessage'),
    };

    //mock for listHelper service
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1),
    };

    //fake of saveStates
    saveStates = {
      Add: 'Add',
      Update: 'Update',
      Delete: 'Delete',
      None: 'None',
    };

    //mock for dataForModal
    dataForModal = {
      EditMode: true,
      PaymentTypes: [
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
      ],
      Providers: [
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
      ],
      Transaction: {
        CreditTransactionId: 'a55e618f-d857-4a6a-bb26-7b60890556e2',
        LocationId: 14601,
        AccountId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
        AdjustmentTypeId: 'e7ca533c-6710-4002-8d97-8f7c1f38195b',
        Amount: -50,
        ClaimId: null,
        DateEntered: '2015-10-05T12:40:50.212Z',
        Description: 'Adjust negative - negative adjustment added',
        EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
        Note: 'negative adjustment added',
        PaymentTypeId: null,
        TransactionTypeId: 4,
        CreditTransactionDetails: [
          {
            CreditTransactionDetailId: '0f4dc555-01f5-4f51-a3b5-6a6c3ffccd1a',
            AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
            Amount: -3,
            AppliedToServiceTransationId:
              'e5a6ac2f-13bd-40ce-9d59-cfef6efdf61c',
            CreditTransactionId: 'a55e618f-d857-4a6a-bb26-7b60890556e2',
            DateEntered: '2015-10-05T12:40:50.212Z',
            EncounterId: 'aba3255d-c041-4661-84af-5cfb2b2af1fe',
            ProviderUserId: '7a975269-ba7a-44d4-bb0c-32a54308e895',
            AppliedToDebitTransactionId: null,
            IsDeleted: false,
            DataTag:
              '{"Timestamp":"2015-10-05T12:46:08.4408323+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A46%3A08.4408323Z\'\\""}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2015-10-05T12:46:05.9908817Z',
            ObjectState: null,
          },
          {
            CreditTransactionDetailId: '3d89317d-475e-4c16-b9b8-bb1fe7cc3e98',
            AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
            Amount: -6,
            AppliedToServiceTransationId:
              '29246a27-51bb-4c89-a576-3e59147077aa',
            CreditTransactionId: 'a55e618f-d857-4a6a-bb26-7b60890556e2',
            DateEntered: '2015-10-05T12:40:50.212Z',
            EncounterId: '241e1c9c-4eec-4bd7-8a5f-f88d205ab045',
            ProviderUserId: '21a19441-dc4c-4351-af34-d312f6dcebef',
            AppliedToDebitTransactionId: null,
            IsDeleted: false,
            DataTag:
              '{"Timestamp":"2015-10-05T12:46:08.4408323+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A46%3A08.4408323Z\'\\""}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2015-10-05T12:46:04.210404Z',
            ObjectState: 'not null',
          },
          {
            CreditTransactionDetailId: 'c25a050f-8546-4b6a-ba7d-aaf68f80f34a',
            AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
            Amount: 7,
            AppliedToServiceTransationId:
              'cbfa6103-4cf9-42a1-9fd5-58d95e3da743',
            CreditTransactionId: 'a55e618f-d857-4a6a-bb26-7b60890556e2',
            DateEntered: '2015-10-05T12:40:50.212Z',
            EncounterId: 'aba3255d-c041-4661-84af-5cfb2b2af1fe',
            ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
            AppliedToDebitTransactionId: null,
            IsDeleted: false,
            DataTag:
              '{"Timestamp":"2015-10-05T12:46:08.4408323+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A46%3A08.4408323Z\'\\""}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2015-10-05T12:46:05.6153926Z',
            ObjectState: null,
          },
          {
            CreditTransactionDetailId: 'e4e26a12-4ffc-4db1-a569-d11615baf99d',
            AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
            Amount: 34,
            AppliedToServiceTransationId:
              'fea06849-3045-49c1-8f24-3edd8791e4ce',
            CreditTransactionId: 'a55e618f-d857-4a6a-bb26-7b60890556e2',
            DateEntered: '2015-10-05T12:40:50.212Z',
            EncounterId: '241e1c9c-4eec-4bd7-8a5f-f88d205ab045',
            ProviderUserId: '268cf2bf-f4ad-4380-9987-0e21d86a1fa7',
            AppliedToDebitTransactionId: null,
            IsDeleted: false,
            DataTag:
              '{"Timestamp":"2015-10-05T12:46:08.4408323+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A46%3A08.4408323Z\'\\""}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2015-10-05T12:46:06.4447301Z',
            ObjectState: 'not null',
          },
        ],
        IsDeleted: false,
        DataTag:
          '{"Timestamp":"2015-10-05T12:46:08.3558217+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A46%3A08.3558217Z\'\\""}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2015-10-05T12:46:03.7885273Z',
        PromptTitle: '',
        PaymentTypePromptValue: '',
      },
      ServiceCodes: [
        {
          ServiceCodeId: '00000000-0000-0000-0000-000000000011',
          Code: 'CODEA',
          ServiceTypeId: '00000000-0000-0000-0000-000000000001',
        },
        {
          ServiceCodeId: '00000000-0000-0000-0000-000000000012',
          Code: 'CODEB',
          ServiceTypeId: '00000000-0000-0000-0000-000000000002',
        },
        {
          ServiceCodeId: '00000000-0000-0000-0000-000000000013',
          Code: 'CODEA',
          ServiceTypeId: '00000000-0000-0000-0000-000000000003',
        },
      ],
      ServiceTypes: [
        {
          ServiceTypeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947',
          IsSystemType: true,
          Description: 'Adjunctive General Services',
          IsAssociatedWithServiceCode: false,
        },
        {
          ServiceTypeId: 'c44c441e-d3c5-47ff-83b3-617e7c59804c',
          IsSystemType: false,
          Description: 'custom servicetype',
          IsAssociatedWithServiceCode: false,
        },
        {
          ServiceTypeId: '9f8e66fa-350b-4970-8dfa-873a69e7f10f',
          IsSystemType: false,
          Description: 'custom servicetype2',
          IsAssociatedWithServiceCode: false,
        },
        {
          ServiceTypeId: 'cc08eb08-425d-43af-9d9d-ce976a208489',
          IsSystemType: true,
          Description: 'Diagnostic',
          IsAssociatedWithServiceCode: false,
        },
      ],
      AdjustmentTypes: [
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
      ],
    };

    //mock for toaster functionality
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    //mock for patientServices
    patientServices = {
      Patients: {
        get: jasmine.createSpy().and.returnValue(''),
      },
      Tax: {
        get: jasmine.createSpy().and.returnValue(''),
      },
      Account: {
        getByPersonId: jasmine.createSpy().and.returnValue(''),
        getAccountMembersDetailByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
      },
      Encounter: {
        getEncounterServiceTransactionLinkByPersonId: jasmine
          .createSpy()
          .and.returnValue(''),
        deleteEncounter: jasmine.createSpy().and.returnValue(''),
        update: jasmine.createSpy().and.returnValue(''),
      },
      CreditTransactions: {
        getCreditTransactionsByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
        update: jasmine.createSpy().and.returnValue(''),
      },
      DebitTransaction: {
        getDebitTransactionsByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
      },
      ServiceTransactions: {
        update: jasmine.createSpy().and.returnValue(''),
      },
    };

    //mock for modal
    uibModalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    //mock of ModalFactory
    modalFactory = {
      CancelModal: jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.callFake(function () {
          var modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    //mock of tabLauncher
    tabLauncher = {
      launchNewTab: jasmine.createSpy(),
    };

    //mock of claimsService
    claimsService = {
      getClaimEntityByClaimId: jasmine.createSpy().and.callFake(function () {
        var claimsServiceDeferred = q.defer();
        claimsServiceDeferred.resolve({
          Value: { BenefitPlanId: '00000000-0000-0000-0000-000000000000' },
        });
        return { $promise: claimsServiceDeferred.promise };
      }),
    };

    //mock of businessCenterServices
    businessCenterServices = {
      BenefitPlan: {
        getById: jasmine.createSpy('benefitPlan.get').and.callFake(function () {
          var benefitPlanServiceDeferred = q.defer();
          benefitPlanServiceDeferred.resolve({
            Value: [
              {
                CarrierId: '00000000-0000-0000-0000-000000000000',
                BenefitId: '00000000-0000-0000-0000-000000000000',
              },
            ],
          });
          return { $promise: benefitPlanServiceDeferred.promise };
        }),
      },
      Carrier: {
        get: jasmine.createSpy('carrier.get').and.callFake(function () {
          var carrierServiceDeferred = q.defer();
          carrierServiceDeferred.resolve({ Value: { Name: 'Carrier Name' } });
          return { $promise: carrierServiceDeferred.promise };
        }),
      },
    };

    ctrl = $controller('CreditTransactionCrudController', {
      $scope: scope,
      ListHelper: listHelper,
      ModalFactory: modalFactory,
      PatientServices: patientServices,
      $filter: filter,
      toastrFactory: toastrFactory,
      DataForModal: dataForModal,
      $uibModalInstance: uibModalInstance,
      SaveStates: saveStates,
      patSecurityService: patSecurityService,
      Location: location,
      tabLauncher: tabLauncher,
      ClaimsService: claimsService,
      BusinessCenterServices: businessCenterServices,
    });
  }));

  //#endregion

  describe('controller ->', function () {
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  //authViewAccess
  describe('authViewAccess function->', function () {
    it('should call IsAuthorizedByAbbreviation with argument soarAuthViewKey if TransactionType is not 4', function () {
      scope.TransactionType = 3;
      var result = ctrl.authViewAccess();
      expect(result).toEqual(true);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(scope.soarAuthViewKey);
    });
    it('should call IsAuthorizedByAbbreviation with argument soartAuthCdtEditKey if TransactionType is 4', function () {
      scope.TransactionType = 4;
      var result = ctrl.authViewAccess();
      expect(result).toEqual(true);
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith(scope.soartAuthCdtEditKey);
    });
  });

  //authAccess
  describe('authAccess function ->', function () {
    it('should call authEditAccess if editMode is true', function () {
      scope.editMode = true;
      ctrl.authEditAccess = jasmine.createSpy('ctrl.authEditAccess');
      ctrl.authAccess();
      expect(ctrl.authEditAccess).toHaveBeenCalled();
    });

    it('should call notifyNotAuthorized with soarAuthEditKey if editMode is true, authEditAccess returns false and TransactionType is 2', function () {
      scope.editMode = true;
      scope.TransactionType = 2;
      ctrl.authEditAccess = jasmine
        .createSpy('ctrl.authEditAccess')
        .and.returnValue(false);
      ctrl.notifyNotAuthorized = jasmine.createSpy('ctrl.notifyNotAuthorized');
      ctrl.authAccess();
      expect(ctrl.authEditAccess).toHaveBeenCalled();
      expect(ctrl.notifyNotAuthorized).toHaveBeenCalledWith(
        scope.soarAuthEditKey
      );
    });

    it('should call authViewAccess if editMode is false', function () {
      scope.editMode = false;
      ctrl.authViewAccess = jasmine.createSpy('ctrl.authViewAccess');
      ctrl.authAccess();
      expect(ctrl.authViewAccess).toHaveBeenCalled();
    });

    it('should call notifyNotAuthorized with soarAuthViewKey if editMode is false, authViewAccess returns false and TransactionType is 2', function () {
      scope.editMode = false;
      scope.TransactionType = 2;
      ctrl.authViewAccess = jasmine
        .createSpy('ctrl.authViewAccess')
        .and.returnValue(false);
      ctrl.notifyNotAuthorized = jasmine.createSpy('ctrl.notifyNotAuthorized');
      ctrl.authAccess();
      expect(ctrl.authViewAccess).toHaveBeenCalled();
      expect(ctrl.notifyNotAuthorized).toHaveBeenCalledWith(
        scope.soarAuthViewKey
      );
    });
  });

  //paymentTypeOnChange
  describe('paymentTypeOnChange function ->', function () {
    it('should set PromptTitle as empty if item is null', function () {
      var paymentTypeId = 1;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);

      scope.paymentTypeOnChange(paymentTypeId);

      expect(scope.transaction.PaymentTypePromptValue).toBeNull();
      expect(scope.transaction.PromptTitle).toBe('');
    });

    it('should set PromptTitle as prompt if item is not null and Prompt has value', function () {
      var paymentTypeId = 1;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ Prompt: 'prompt' });

      scope.paymentTypeOnChange(paymentTypeId);

      expect(scope.transaction.PaymentTypePromptValue).toBeNull();
      expect(scope.transaction.PromptTitle).toBe('prompt');
    });

    it('should set PromptTitle as empty if item is not null and Prompt is null', function () {
      var paymentTypeId = 1;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ Prompt: null });

      scope.paymentTypeOnChange(paymentTypeId);

      expect(scope.transaction.PaymentTypePromptValue).toBeNull();
      expect(scope.transaction.PromptTitle).toBe('');
    });
  });

  //setDisplayPropertiesForSelectedTransaction
  describe('setDisplayPropertiesForSelectedTransaction function ->', function () {
    it('should not update AffectedAreaId if serviceCode is null', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);

      ctrl.setDisplayPropertiesForSelectedTransaction();
      scope.$apply();
      expect(scope.transaction.AffectedAreaId).toBeUndefined();
    });

    it('should update AffectedAreaId and ServiceType if serviceCode and serviceType are not null', function () {
      scope.transaction.AffectedAreaId = 0;
      scope.transaction.ServiceType = 0;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({
          ServiceTypeId: 1,
          Description: 'description',
          AffectedAreaId: 1,
        });

      ctrl.setDisplayPropertiesForSelectedTransaction();
      scope.$apply();
      expect(scope.transaction.AffectedAreaId).toBe(1);
      expect(scope.transaction.ServiceType).toBe('description');
    });

    it('should not update AffectedAreaId if serviceCode is null, PromptTitle and PaymentTypePromptValue have some values', function () {
      dataForModal.Transaction.PromptTitle = 'prompt title';
      dataForModal.Transaction.PaymentTypePromptValue = 'payment type prompt';
      ctrl.setDisplayPropertiesForSelectedTransaction();
      scope.$apply();
      expect(scope.transaction.AffectedAreaId).toBeUndefined();
    });

    it('should call ctrl.getLocationTimezone current locations timezone', function () {
      spyOn(ctrl, 'getLocationTimezone').and.callThrough();
      // returnValue('Central Standard Time');
      dataForModal.Transaction = { DateEntered: '2021-02-19 14:05:35' };
      ctrl.setDisplayPropertiesForSelectedTransaction();
      scope.$apply();
      expect(ctrl.getLocationTimezone).toHaveBeenCalled();
    });

  });

  // validateTransaction
  describe('validateTransaction function -> ', function () {
    beforeEach(inject(function () {}));

    it('should return true if date and AdjustmentType are valid', function () {
      // Arrange
      scope.transaction = {
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 1,
        Tooth: 't1',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
        PaymentTypeId: 1,
        AdjustmentTypeId: 1,
      };

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
    });
    it('should return true if date and PaymentType are valid', function () {
      // Arrange
      scope.transaction = {
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 1,
        Tooth: 't1',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
        PaymentTypeId: 1,
        AdjustmentTypeId: 1,
        TransactionTypeId: 2,
      };

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
    });

    it('should return false if DateEntered is invalid', function () {
      // Arrange
      scope.transaction = {
        DateEntered: false,
        ValidDate: false,
        AffectedAreaId: 1,
        Tooth: 't1',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
      };

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(false);
    });

    it('should return false if PaymentType is invalid', function () {
      // Arrange
      scope.transaction = {
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 1,
        Tooth: 't1',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
        PaymentTypeId: '',
        TransactionTypeId: 2,
      };

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(false);
    });
    it('should return false if AdjustmentType is invalid', function () {
      // Arrange
      scope.transaction = {
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 1,
        Tooth: 't1',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
        PaymentTypeId: 1,
        AdjustmentTypeId: '',
      };

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(false);
    });
  });

  //saveTransaction
  describe('saveTransaction  function ->', function () {
    it('should call notifyNotAuthorized if authEditAccess returns false', function () {
      spyOn(ctrl, 'authEditAccess').and.returnValue(false);
      scope.saveTransaction();

      expect(_$location_.path).toHaveBeenCalledWith('/');
      expect(toastrFactory.error).toHaveBeenCalled();
    });
    it('should call notifyNotAuthorized if authEditAccess returns false and TransactionTypeId is 2', function () {
      spyOn(ctrl, 'authEditAccess').and.returnValue(false);
      scope.transaction.TransactionTypeId = 2;
      scope.saveTransaction();

      expect(_$location_.path).toHaveBeenCalledWith('/');
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should set validateFlag to true if validateTransaction returns false', function () {
      scope.validateFlag = false;
      spyOn(ctrl, 'authEditAccess').and.returnValue(true);
      spyOn(ctrl, 'validateTransaction').and.returnValue(false);

      scope.saveTransaction();

      expect(scope.validateFlag).toEqual(true);
    });

    it('should set validateFlag to true if alreadySaving is true', function () {
      scope.validateFlag = false;
      scope.alreadySaving = true;
      spyOn(ctrl, 'authEditAccess').and.returnValue(true);
      spyOn(ctrl, 'validateTransaction').and.returnValue(true);

      scope.saveTransaction();

      expect(scope.validateFlag).toEqual(true);
    });
    it('should call update if DateEntered are equal', function () {
      dataForModal.CreditTransaction = dataForModal.Transaction;
      scope.transaction = angular.copy(dataForModal.Transaction);
      scope.transaction.CreditTransactionDetails = [
        scope.transaction.CreditTransactionDetails[0],
      ];
      scope.transaction.DateEntered = '2015-11-05T12:40:50.212Z';

      spyOn(ctrl, 'authEditAccess').and.returnValue(true);
      spyOn(ctrl, 'validateTransaction').and.returnValue(true);

      scope.saveTransaction();
      expect(patientServices.CreditTransactions.update).toHaveBeenCalled();
    });

    it('should call update if DateEntered are not equal and TransactionTypeId is not 2', function () {
      dataForModal.CreditTransaction = dataForModal.Transaction;
      dataForModal.CreditTransaction.Amount = 50;
      scope.transaction = angular.copy(dataForModal.Transaction);
      scope.transaction.CreditTransactionDetails = [
        scope.transaction.CreditTransactionDetails[0],
      ];

      spyOn(ctrl, 'authEditAccess').and.returnValue(true);
      spyOn(ctrl, 'validateTransaction').and.returnValue(true);

      scope.saveTransaction();
      expect(patientServices.CreditTransactions.update).toHaveBeenCalled();
    });

    it('should call update if DateEntered are not equal and TransactionTypeId is 2', function () {
      dataForModal.CreditTransaction = dataForModal.Transaction;
      dataForModal.CreditTransaction.Amount = 50;
      scope.transaction = angular.copy(dataForModal.Transaction);
      scope.transaction.CreditTransactionDetails = [
        scope.transaction.CreditTransactionDetails[0],
      ];

      spyOn(ctrl, 'authEditAccess').and.returnValue(true);
      spyOn(ctrl, 'validateTransaction').and.returnValue(true);
      dataForModal.CreditTransaction.TransactionTypeId = 2;

      scope.saveTransaction();
      expect(patientServices.CreditTransactions.update).toHaveBeenCalled();
    });
  });

  //openEncounterTab
  describe('openEncounterTab function ->', function () {
    it('should call launchNewTab method', function () {
      var encounterId = 1;
      scope.hasRoleDetailsAccess = true;
      scope.patientInfo = {
        PersonAccount: {
          PersonId: 1,
        },
      };
      scope.openEncounterTab(encounterId);
      expect(tabLauncher.launchNewTab).toHaveBeenCalled();
    });
  });

  //navigateToAccountSummary
  describe('navigateToAccountSummary function ->', function () {
    it('navigate to account summary, should navigate to account summary page', function () {
      var IdToExpand = 4;
      spyOn(ctrl, 'navigateAndClose');
      spyOn(ctrl, 'checkForDataChange');
      scope.navigateToAccountSummary(IdToExpand, IdToExpand);
      expect(ctrl.checkForDataChange).toHaveBeenCalled();
    });
  });
  //navigateAndClose
  describe('navigateAndClose function ->', function () {
    it('navigateAndClose, should dismiss and close the modal instance', function () {
      ctrl.navigateAndClose();
      expect(uibModalInstance.dismiss).toHaveBeenCalled();
    });
  });

  //closeModal
  describe('closeModal function ->', function () {
    it('closeModal, should close the modal instance', function () {
      spyOn(ctrl, 'checkForDataChange');
      scope.closeModal();
      expect(ctrl.checkForDataChange).toHaveBeenCalled();
    });
  });

  //checkForDataChange
  describe('checkForDataChange function ->', function () {
    it('checkForDataChange, should cancel model instance', function () {
      scope.editMode = true;
      scope.transaction = {};
      scope.transaction.TransactionTypeId = 2;
      scope.transaction.Amount = 20;
      ctrl.transactionInitialCopy = {};
      ctrl.transactionInitialCopy.TransactionTypeId = 2;
      ctrl.transactionInitialCopy.Amount = 25;
      ctrl.checkForDataChange();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  //applyTransactionSuccess
  describe('applyTransactionSuccess function ->', function () {
    it('should call uibModalInstance and set alreadyUpdatingEncounter to false', function () {
      scope.transaction.alreadyUpdatingEncounter = true;

      ctrl.applyTransactionSuccess();
      expect(toastrFactory.success).toHaveBeenCalledWith(
        '{0} updated successfully',
        'Success'
      );
      expect(ctrl.successMessage).toEqual('Negative Adjustment');
      expect(uibModalInstance.close).toHaveBeenCalled();
      expect(scope.transaction.alreadyUpdatingEncounter).toEqual(false);
    });

    it('should call uibModalInstance and set alreadyUpdatingEncounter to false if TransactionTypeId is 2', function () {
      scope.transaction.alreadyUpdatingEncounter = true;
      scope.transaction.TransactionTypeId = 2;
      ctrl.applyTransactionSuccess();
      expect(toastrFactory.success).toHaveBeenCalledWith(
        '{0} updated successfully',
        'Success'
      );
      expect(ctrl.successMessage).toEqual('Payment');
      expect(uibModalInstance.close).toHaveBeenCalled();
      expect(scope.transaction.alreadyUpdatingEncounter).toEqual(false);
    });
  });

  //applyTransactionFailure
  describe('applyTransactionFailure function ->', function () {
    it('should call error and set alreadyUpdatingEncounter to false', function () {
      scope.transaction.alreadyUpdatingEncounter = true;
      ctrl.messageString = '';
      ctrl.applyTransactionFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(scope.transaction.alreadyUpdatingEncounter).toEqual(false);
      expect(ctrl.messageString).toEqual('updating negative adjustment');
    });

    it('should call error and set alreadyUpdatingEncounter to false if TransactionTypeId is 2', function () {
      scope.transaction.alreadyUpdatingEncounter = true;
      scope.transaction.TransactionTypeId = 2;
      ctrl.messageString = '';
      ctrl.applyTransactionFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(scope.transaction.alreadyUpdatingEncounter).toEqual(false);
      expect(ctrl.messageString).toEqual('updating payment');
    });
  });

  //editTransaction
  describe('editTransaction function ->', function () {
    it('should toggle editMode value and call defaultFocus', function () {
      scope.editMode = true;
      spyOn(ctrl, 'defaultFocus');
      scope.editTransaction();
      expect(ctrl.defaultFocus).toHaveBeenCalled();
      expect(scope.editMode).toEqual(false);
    });
  });

  //closeModal
  describe('closeModal function ->', function () {
    it('should call checkForDataChange', function () {
      spyOn(ctrl, 'checkForDataChange');
      scope.closeModal();
      expect(ctrl.checkForDataChange).toHaveBeenCalled();
    });
  });

  //checkForDataChange
  describe('checkForDataChange function ->', function () {
    it('should call uibModalInstance.dismiss if editMode is false', function () {
      scope.editMode = false;
      ctrl.checkForDataChange(uibModalInstance.dismiss);
      expect(uibModalInstance.dismiss).toHaveBeenCalled();
    });

    it('should call uibModalInstance.dismiss if scope.transaction and ctrl.transactionInitialCopy are equal', function () {
      scope.editMode = true;
      ctrl.transactionInitialCopy = angular.copy(scope.transaction);
      ctrl.checkForDataChange(uibModalInstance.dismiss);
      expect(uibModalInstance.dismiss).toHaveBeenCalled();
    });

    it('should call CancelModal then uibModalInstance.dismiss if scope.transaction and ctrl.transactionInitialCopy are not equal', function () {
      scope.editMode = true;
      ctrl.transactionInitialCopy = null;
      ctrl.checkForDataChange(uibModalInstance.dismiss);
      //expect(uibModalInstance.dismiss).toHaveBeenCalled();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  //getCarrierDisplay
  describe('setTransactionDescription function ->', function () {
    it('should return correct description when transaction type is 5', function () {
      var result = scope.setTransactionDescription(5);

      expect(result).toBe('Positive (+) Adjustment');
    });
    it('should return correct description when transaction type is 6', function () {
      var result = scope.setTransactionDescription(6);

      expect(result).toBe('Finance Charge');
    });
    it('should return undefined when transaction type is 3', function () {
      var result = scope.setTransactionDescription(3);

      expect(result).toBe(undefined);
    });
    it('should return undefined when transaction type is 4', function () {
      var result = scope.setTransactionDescription(4);

      expect(result).toBe(undefined);
    });
  });

  describe('ctrl.addInactiveAdjustmentTypeToDropDown ->', function () {
    it('should find and add inactive adjustment type to list if transaction has inactive type', function () {
      dataForModal.Transaction.AdjustmentTypeId = 1;
      dataForModal.Transaction.TransactionTypeId = 4;
      scope.adjustmentTypes = [
        { AdjustmentTypeId: 2, Description: 'Beta' },
        { AdjustmentTypeId: 3, Description: 'Zeta' },
      ];
      ctrl.allAdjustmentTypes = angular.copy(scope.adjustmentTypes);
      ctrl.allAdjustmentTypes.push({
        AdjustmentTypeId: 1,
        Description: 'Iota',
      });
      ctrl.addInactiveAdjustmentTypeToDropDown();
      expect(scope.adjustmentTypes.length).toBe(3);
      expect(ctrl.allAdjustmentTypes.length).toBe(3);
      expect(scope.adjustmentTypes[0].Description).toBe('Beta');
      expect(scope.adjustmentTypes[1].Description).toBe('Iota');
      expect(scope.adjustmentTypes[2].Description).toBe('Zeta');
    });
    it('should not add inactive adjustment type to list if transaction has active type', function () {
      dataForModal.Transaction.AdjustmentTypeId = 2;
      dataForModal.Transaction.TransactionTypeId = 4;
      scope.adjustmentTypes = [
        { AdjustmentTypeId: 2, Description: 'Beta' },
        { AdjustmentTypeId: 3, Description: 'Zeta' },
      ];
      ctrl.allAdjustmentTypes = angular.copy(scope.adjustmentTypes);
      ctrl.allAdjustmentTypes.push({
        AdjustmentTypeId: 1,
        Description: 'Iota',
      });
      ctrl.addInactiveAdjustmentTypeToDropDown();
      expect(scope.adjustmentTypes.length).toBe(2);
      expect(ctrl.allAdjustmentTypes.length).toBe(3);
      expect(scope.adjustmentTypes[0].Description).toBe('Beta');
      expect(scope.adjustmentTypes[1].Description).toBe('Zeta');
    });
    it('should not add inactive adjustment type to list if transaction is not a negative adjustment', function () {
      dataForModal.Transaction.AdjustmentTypeId = 1;
      dataForModal.Transaction.TransactionTypeId = 2;
      scope.adjustmentTypes = [
        { AdjustmentTypeId: 2, Description: 'Beta' },
        { AdjustmentTypeId: 3, Description: 'Zeta' },
      ];
      ctrl.allAdjustmentTypes = angular.copy(scope.adjustmentTypes);
      ctrl.allAdjustmentTypes.push({
        AdjustmentTypeId: 1,
        Description: 'Iota',
      });
      ctrl.addInactiveAdjustmentTypeToDropDown();
      expect(scope.adjustmentTypes.length).toBe(2);
      expect(ctrl.allAdjustmentTypes.length).toBe(3);
      expect(scope.adjustmentTypes[0].Description).toBe('Beta');
      expect(scope.adjustmentTypes[1].Description).toBe('Zeta');
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
      ctrl.getLocationTimezone().then(function (timezone) {
        expect(timezone).toEqual('Central Standard Time');
        done();
      });
      scope.$apply();
    });
  });

  describe('ctrl.setTransactionMinAndMaxDates ->', function () {
    it('should call ctrl.getLocationTimezone to get current users location timezone', function () {
      spyOn(ctrl, 'getLocationTimezone').and.callThrough();
      // returnValue('Central Standard Time');
      ctrl.now = '2021-02-19 14:05:35';
      ctrl.setTransactionMinAndMaxDates();
      scope.$apply();
      expect(ctrl.getLocationTimezone).toHaveBeenCalled();
    });

    it('should call timeZoneFactoryMock.ConvertDateToMomentTZ with todays date based on timezone ', function () {
      spyOn(ctrl, 'getLocationTimezone').and.callThrough();
      // returnValue('Central Standard Time');
      ctrl.now = '2021-02-19 14:05:35';
      ctrl.setTransactionMinAndMaxDates();
      scope.$apply();
      expect(timeZoneFactoryMock.ConvertDateToMomentTZ).toHaveBeenCalledWith(
        '2021-02-19 14:05:35',
        'Central Standard Time'
      );
    });
  });

  describe('ctrl.loadPaymentTypes ->', function () {
    var dataForModal = { PaymentTypes: [] };
    beforeEach(function () {
      dataForModal.PaymentTypes = [
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
      scope.paymentTypes = ctrl.loadPaymentTypes(dataForModal.PaymentTypes);
      var vendorPaymentType = scope.paymentTypes.find(
        paymentType => paymentType.Description === 'Vendor Payment'
      );
      expect(vendorPaymentType).toBe(undefined);
    });

    it('should sort paymentTypes list ', function () {
      scope.paymentTypes = ctrl.loadPaymentTypes(dataForModal.PaymentTypes);
      expect(scope.paymentTypes[0].Description).toBe('PaymentType1');
      expect(scope.paymentTypes[1].Description).toBe('PaymentType2');
      expect(scope.paymentTypes[2].Description).toBe('PaymentType4');
    });

    it('should filter list to remove PaymentCategory 2 payment types ', function () {
      scope.paymentTypes = ctrl.loadPaymentTypes(dataForModal.PaymentTypes);
      var insurancePaymentType = scope.paymentTypes.find(
        paymentType => paymentType.PaymentTypeCategory === 2
      );
      expect(insurancePaymentType).toBe(undefined);
    });

    it('should return empty list if paymentTypes is null or undefined ', function () {
      dataForModal = {};
      scope.paymentTypes = ctrl.loadPaymentTypes(dataForModal.PaymentTypes);
      expect(scope.paymentTypes).toEqual([]);
    });
  });

  describe('ctrl.getPaymentType ->', function () {
    it('should get payment type description ', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ Description: 'Vendor Payment' });
      var description = ctrl.getPaymentType('5678');
      expect(description).toBe('Vendor Payment');
    });

    it('should not get payment type description ', function () {
      var description = ctrl.getPaymentType('5678');
      expect(description).toBe('');
    });
  });
});
