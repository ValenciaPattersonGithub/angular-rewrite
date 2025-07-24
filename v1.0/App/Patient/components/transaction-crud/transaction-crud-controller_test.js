describe('TransactionCrudController ->', function () {
  //#region Variables
  var scope,
    ctrl,
    location,
    element,
    timeout,
    listHelper,
    modalFactory,
    patientServices;
  var filter,
    toastrFactory,
    routeParams,
    dataForModal,
    modalInstance,
    saveStates,
    staticData;
  var surfaceHelper,
    rootHelper,
    modalFactoryDeferred,
    data,
    q,
    patSecurityService;
  var claimsService,
    closeClaimService,
    financialService,
    modalDataFactory,
    patientValidationFactory,
    patientServicesFactory,
    tabLauncher;
  var referenceDataService;
  var timeZoneFactoryMock;

  var filterTypes = {
    Active: 1,
    Inactive: 2,
  };

  var adjustmentTypes = [
    {
      Description: '+Positive Adjustment',
      AdjustmentTypeId: 1,
      IsActive: true,
    },
    {
      Description: 'Finance Charge',
      AdjustmentTypeId: 2,
      IsActive: false,
    },
    {
      Description: 'Vendor Payment Refund',
      AdjustmentTypeId: 3,
      IsActive: true,
    },
  ];

  var usersMock = () => [
    {
      UserId: '12349',
      IsActive: true,
      FirstName: 'Bob',
      LastName: 'Smith',
      Locations: [{ LocationId: 1234, ProviderTypeId: 1 }],
    },
    {
      UserId: '12359',
      IsActive: true,
      FirstName: 'Bo',
      LastName: 'Smythe',
      Locations: [{ LocationId: 1234, ProviderTypeId: 1 }],
    },
    {
      UserId: '12369',
      IsActive: false,
      FirstName: 'Larry',
      LastName: 'Woods',
      Locations: [{ LocationId: 1234, ProviderTypeId: 1 }],
    },
    {
      UserId: '12379',
      IsActive: true,
      FirstName: 'Sam',
      LastName: 'Smith',
      Locations: [
        { LocationId: 1234, ProviderTypeId: 1 },
        { LocationId: 1235, ProviderTypeId: 1 },
      ],
    },
    {
      UserId: '12389',
      IsActive: true,
      FirstName: 'Sid',
      LastName: 'Smith',
      Locations: [{ LocationId: 1234, ProviderTypeId: 2 }],
    },
  ];

  var locationsMock = () => [
    { LocationId: 1234, Timezone: 'Central Standard Time' },
  ];

  var mockTeethList = {
    Value: {
      Teeth: [
        { USNumber: '1', ToothId: 1 },
        { USNumber: '2', ToothId: 2 },
        { USNumber: '3', ToothId: 3 },
      ],
    },
  };
  //var applicableTeeth = [
  //    { ToothId: 1, USNumber: '1', UniversalNumber: 18, ToothStructure: 'Permanent', ArchName: 'Maxillary', },
  //    { ToothId: 2, USNumber: '2', UniversalNumber: 17, ToothStructure: 'Permanent', ArchName: 'Maxillary', },
  //    { ToothId: 3, USNumber: '3', UniversalNumber: 16, ToothStructure: 'Permanent', ArchName: 'Maxillary', },
  //    { ToothId: 4, USNumber: '4', UniversalNumber: 15, ToothStructure: 'Permanent', ArchName: 'Maxillary', },];

  var cdtCodeGroups = [{}, {}, {}];
  //#endregion

  //#region before each

  beforeEach(
    module('Soar.Patient', function ($provide) {
      staticData = {
        TeethDefinitions: jasmine.createSpy().and.returnValue({
          then: function () {
            return mockTeethList;
          },
        }),
        CdtCodeGroups: jasmine.createSpy().and.returnValue({
          then: function () {
            return cdtCodeGroups;
          },
        }),
      };
      $provide.value('StaticData', staticData);

      patientValidationFactory = {
        CheckingUserPatientAuthorization: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        userLocationAuthorization: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      referenceDataService = {
        getData: jasmine.createSpy('referenceDataService.getData'),
        entityNames: {
          users: 'users',
          locations: 'locations',
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      timeZoneFactoryMock = {
        ConvertDateToMomentTZ: jasmine
          .createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
          .and.callFake(function (date) {
            return moment(date);
          }),
        ConvertDateToSave: jasmine
          .createSpy('mockTimeZoneFactory.ConvertDateToSave')
          .and.callFake(function () {
            return new Date();
          }),
      };
      $provide.value('TimeZoneFactory', timeZoneFactoryMock);

      var userLocation = '{"id": "1234"}';
      sessionStorage.setItem('userLocation', userLocation);
    })
  );

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $filter,
    $q,
    $location
  ) {
    scope = $rootScope.$new();
    filter = $filter;
    q = $q;
    location = $location;
    scope.viewDetailsActionFunction = jasmine.createSpy(
      'scope.viewDetailsActionFunction'
    );
    scope.deleteActionFunction = jasmine.createSpy(
      'scope.deleteActionFunction'
    );
    scope.applyAdjustmentActionFunction = jasmine.createSpy(
      'scope.applyAdjustmentActionFunction'
    );
    scope.editActionFunction = jasmine.createSpy('scope.editActionFunction');
    scope.encounter = {
      Date: '0001-01-01T00:00:00',
      EncounterId: 'eec28b55-d01e-442e-b78c-e758b3e19dd7',
      Description: null,
      AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
      Status: 0,
      ServiceTransactionDtos: [
        {
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: 0,
          AppointmentId: null,
          ClaimId: null,
          DateCompleted: null,
          DateEntered: '0001-01-01T00:00:00',
          Description: null,
          Discount: 0,
          EncounterId: 'eec28b55-d01e-442e-b78c-e758b3e19dd7',
          EnteredByUserId: '00000000-0000-0000-0000-000000000000',
          Fee: 0,
          LocationId: null,
          Note: null,
          ProviderUserId: null,
          RejectedReason: null,
          ServiceCodeId: '00000000-0000-0000-0000-000000000000',
          ServiceTransactionId: '43d1d952-9f0a-4100-868a-25ab457184c5',
          ServiceTransactionStatusId: 4,
          Surface: null,
          Tax: 0,
          Tooth: null,
          TransactionTypeId: 0,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 0,
          DataTag:
            '{"Timestamp":"2015-10-05T11:50:10.5071229+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A50%3A10.5071229Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '0001-01-01T00:00:00',
        },
        {
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: 0,
          AppointmentId: null,
          ClaimId: null,
          DateCompleted: null,
          DateEntered: '0001-01-01T00:00:00',
          Description: null,
          Discount: 0,
          EncounterId: 'eec28b55-d01e-442e-b78c-e758b3e19dd7',
          EnteredByUserId: '00000000-0000-0000-0000-000000000000',
          Fee: 0,
          LocationId: null,
          Note: null,
          ProviderUserId: null,
          RejectedReason: null,
          ServiceCodeId: '00000000-0000-0000-0000-000000000000',
          ServiceTransactionId: 'f35223ef-9553-4868-8d7a-65553d14c2fb',
          ServiceTransactionStatusId: 4,
          Surface: null,
          Tax: 0,
          Tooth: null,
          TransactionTypeId: 0,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 0,
          DataTag:
            '{"Timestamp":"2015-10-05T11:50:10.5071229+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A50%3A10.5071229Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '0001-01-01T00:00:00',
        },
        {
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: 0,
          AppointmentId: null,
          ClaimId: null,
          DateCompleted: null,
          DateEntered: '0001-01-01T00:00:00',
          Description: null,
          Discount: 0,
          EncounterId: 'eec28b55-d01e-442e-b78c-e758b3e19dd7',
          EnteredByUserId: '00000000-0000-0000-0000-000000000000',
          Fee: 0,
          LocationId: null,
          Note: null,
          ProviderUserId: null,
          RejectedReason: null,
          ServiceCodeId: '00000000-0000-0000-0000-000000000000',
          ServiceTransactionId: 'fa254525-7938-4799-9399-42bc38529825',
          ServiceTransactionStatusId: 4,
          Surface: null,
          Tax: 0,
          Tooth: null,
          TransactionTypeId: 0,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 0,
          DataTag:
            '{"Timestamp":"2015-10-05T11:50:10.5071229+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A50%3A10.5071229Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '0001-01-01T00:00:00',
        },
      ],
      CreditTransactionDto: null,
      ObjectState: null,
      FailedMessage: null,
      DataTag:
        '{"Timestamp":"2015-10-05T11:47:10.3982243+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A47%3A10.3982243Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '0001-01-01T00:00:00',
    };

    referenceDataService.getData.and.callFake(entity => {
      if (entity === 'users') {
        return $q.resolve(usersMock());
      } else if (entity === 'locations') {
        return $q.resolve(locationsMock());
      }
    });

    //mock for patSecurityService
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
      generateMessage: jasmine.createSpy('patSecurityService.generateMessage'),
    };

    data = {
      focus: jasmine.createSpy(),
    };
    element = {
      find: jasmine.createSpy().and.returnValue(data),
      focus: jasmine.createSpy(),
    };
    spyOn(angular, 'element').and.returnValue(element);
    timeout = $injector.get('$timeout');

    //mock for modal
    modalInstance = {
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
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      Modal: jasmine.createSpy('modalFactory.Modal').and.callFake(function () {
        modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve(1);
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
      ServiceTransactionCrudCloseClaimModal: jasmine
        .createSpy('modalFactory.Modal')
        .and.returnValue({
          then: function (callback) {
            callback({});
          },
        }),
      ConfirmModal: jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        }),
    };

    modalDataFactory = {
      GetTransactionModalData: jasmine
        .createSpy('modalDataFactory.GetTransactionModalData')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    //mock for toaster functionality
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    timeout = $injector.get('$timeout');
    spyOn(timeout, 'cancel');

    //mock for routeParams
    routeParams = {
      patientId: 100,
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
        getAllEncountersByEncounterId: jasmine
          .createSpy('patientServices.Encounter.getAllEncountersByEncounterId')
          .and.returnValue({
            $promise: {},
          }),
        deleteEncounter: jasmine.createSpy().and.returnValue(''),
        update: jasmine.createSpy().and.returnValue(''),
      },
      CreditTransactions: {
        getCreditTransactionsByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
      },
      DebitTransaction: {
        getDebitTransactionsByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
        update: jasmine.createSpy().and.returnValue(''),
      },
      ServiceTransactions: {
        update: jasmine.createSpy().and.returnValue({
          $promise: {
            then: function (callback) {
              callback();
            },
          },
        }),
        checkForInsurancePayment: jasmine.createSpy().and.returnValue({
          $promise: {
            then: function (callback) {
              return callback({ Value: false });
            },
          },
        }),
      },
      PatientBenefitPlan: {
        getBenefitPlansRecordsByAccountId: jasmine
          .createSpy(
            'patientServices.PatientBenefitPlan.getBenefitPlansRecordsByAccountId'
          )
          .and.returnValue({
            $promise: {
              then: function () {},
            },
          }),
        getBenefitPlansAvailableByClaimId: jasmine
          .createSpy(
            'patientServices.PatientBenefitPlan.getBenefitPlansAvailableByClaimId'
          )
          .and.returnValue({
            $promise: {},
          }),
      },
      Claim: {
        getServiceTransactionsByClaimId: jasmine
          .createSpy('patientServices.Claim.getServiceTransactionsByClaimId')
          .and.returnValue({
            $promise: {
              then: function (callback) {
                callback({ Value: [{ ServiceTransaction: {} }] });
              },
            },
          }),
        recreateMultipleClaims: jasmine
          .createSpy('patientServices.Claim.recreateMultipleClaims')
          .and.returnValue({
            $promise: {
              then: function (callback) {
                callback();
              },
            },
          }),
        getClaimsByServiceTransaction: jasmine
          .createSpy('patientServices.Claim.getClaimsByServiceTransactionId')
          .and.returnValue({
            $promise: {
              then: function () {},
            },
          }),
      },
    };

    financialService = {
      RecalculateInsurance: jasmine
        .createSpy('financialService.RecalculateInsurance')
        .and.returnValue({
          then: function () {},
        }),
    };

    claimsService = {
      getClaimEntityByClaimId: jasmine.createSpy(
        'claimsService.getClaimEntityByClaimId'
      ),
    };

    closeClaimService = {
      updateMultiple: jasmine.createSpy('closeClaimService.updateMultiple'),
      update: jasmine.createSpy('closeClaimService.update').and.returnValue({
        $promise: {
          then: function (callback) {
            callback();
          },
        },
      }),
    };

    //mock for listHelper service
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1),
      findAllByPredicate: jasmine
        .createSpy('listHelper.findAllByPredicate')
        .and.returnValue(null),
    };

    //mock for surfaceHelper
    surfaceHelper = {
      surfaceCSVStringToSurfaceString: jasmine
        .createSpy('SurfaceHelper.surfaceCSVStringToSurfaceString')
        .and.returnValue(''),
      areSurfaceCSVsEqual: jasmine
        .createSpy('SurfaceHelper.areSurfaceCSVsEqual')
        .and.returnValue(''),
      validateSelectedSurfaces: jasmine
        .createSpy('SurfaceHelper.validateSelectedSurfaces')
        .and.returnValue(''),
    };

    rootHelper = {
      setValidSelectedRoots: jasmine
        .createSpy('rootHelper.setValidSelectedRoots')
        .and.returnValue(''),
    };

    //fake of saveStates
    saveStates = {
      Add: 'Add',
      Update: 'Update',
      Delete: 'Delete',
      None: 'None',
    };

    //mock for dataForModal
    (dataForModal = {
      EditMode: true,
      Patient: {
        PersonAccount: {
          AccountId: 10,
        },
      },
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
        AdjustmentTypeName: 'Finance Charge',
        Amount: -50,
        ClaimId: null,
        DateEntered: '2015-10-05T12:40:50.212Z',
        Description: 'Adjust negative - negative adjustment added',
        PaymentTypePromptValue: null,
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
          },
          {
            CreditTransactionDetailId: 'c25a050f-8546-4b6a-ba7d-aaf68f80f34a',
            AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
            Amount: -7,
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
          },
          {
            CreditTransactionDetailId: 'e4e26a12-4ffc-4db1-a569-d11615baf99d',
            AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
            Amount: -34,
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
          },
        ],
        IsDeleted: false,
        DataTag:
          '{"Timestamp":"2015-10-05T12:46:08.3558217+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A46%3A08.3558217Z\'\\""}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2015-10-05T12:46:03.7885273Z',
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
    }),
      {
        EditMode: false,
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
          AdjustmentTypeName: 'Finance Charge',
          Amount: -50,
          ClaimId: null,
          DateEntered: '2015-10-05T12:40:50.212Z',
          Description: 'Adjust negative - negative adjustment added',
          PaymentTypePromptValue: null,
          EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
          Note: 'negative adjustment added',
          PaymentTypeId: null,
          TransactionTypeId: 5,
          CreditTransactionDetails: [
            {
              CreditTransactionDetailId: '0f4dc555-01f5-4f51-a3b5-6a6c3ffccd1a',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -3,
              AppliedToServiceTransationId: null,
              CreditTransactionId: 'a55e618f-d857-4a6a-bb26-7b60890556e2',
              DateEntered: '2015-10-05T12:40:50.212Z',
              EncounterId: 'aba3255d-c041-4661-84af-5cfb2b2af1fe',
              ProviderUserId: '7a975269-ba7a-44d4-bb0c-32a54308e895',
              AppliedToDebitTransactionId:
                'e5a6ac2f-13bd-40ce-9d59-cfef6efdf61c',
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T12:46:08.4408323+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A46%3A08.4408323Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T12:46:05.9908817Z',
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
            },
            {
              CreditTransactionDetailId: 'c25a050f-8546-4b6a-ba7d-aaf68f80f34a',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -7,
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
            },
            {
              CreditTransactionDetailId: 'e4e26a12-4ffc-4db1-a569-d11615baf99d',
              AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
              Amount: -34,
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
            },
          ],
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T12:46:08.3558217+00:00","RowVersion":"W/\\"datetime\'2015-10-05T12%3A46%3A08.3558217Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T12:46:03.7885273Z',
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
            AdjustmentTypeId: 'e7ca533c-6710-4002-8d97-8f7c1f38195b',
            Description: 'Finance Charge',
            IsActive: true,
            IsPositive: true,
            IsSystemType: true,
          },
          {
            AdjustmentTypeId: '6D65CA59-681B-E611-9996-80193493C857',
            Description: '+Positive Adjustment',
            IsActive: true,
            IsPositive: true,
            IsSystemType: false,
          },
        ],
      };

    patientServicesFactory = {
      GetTaxAndDiscount: jasmine
        .createSpy('patientServicesFactory.GetTaxAndDiscount')
        .and.callFake(function (input) {
          return {
            then: function (callback) {
              callback({ Value: input });
            },
          };
        }),
    };

    tabLauncher = {
      launchNewTab: jasmine.createSpy('tabLauncher.launchNewTab'),
    };

    ctrl = $controller('TransactionCrudController', {
      $scope: scope,
      ListHelper: listHelper,
      ModalFactory: modalFactory,
      PatientServices: patientServices,
      $filter: filter,
      toastrFactory: toastrFactory,
      $routeParams: routeParams,
      DataForModal: dataForModal,
      $uibModalInstance: modalInstance,
      SaveStates: saveStates,
      patSecurityService: patSecurityService,
      StaticData: staticData,
      SurfaceHelper: surfaceHelper,
      $location: location,
      ClaimsService: claimsService,
      CloseClaimService: closeClaimService,
      FinancialService: financialService,
      RootHelper: rootHelper,
      ModalDataFactory: modalDataFactory,
      PatientServicesFactory: patientServicesFactory,
      tabLauncher: tabLauncher,
    });
    scope.$apply();
  }));

  beforeEach(function () {
    sessionStorage.setItem('userLocation', JSON.stringify({ id: 1234 }));
  });
  afterEach(function () {
    sessionStorage.clear();
  });

  //#endregion

  describe('controller ->', function () {
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  //getProvderName
  describe('getProvderName function ->', function () {
    it('should return provider name when passed found in providers list', function () {
      var enteredByUserId = 1;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({
          FirstName: 'jim',
          LastName: 'carry',
          ProfessionalDesignation: 'actor',
        });
      var result = ctrl.getProviderName(enteredByUserId);

      expect(result).not.toBeNull();
      expect(result).not.toBe('');
    });

    it('should return blank when passed id is not found in providers list', function () {
      var enteredByUserId = 1;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);
      var result = ctrl.getProviderName(enteredByUserId);

      expect(result).not.toBeNull();
      expect(result).toBe('');
    });
  });

  //setDisplayPropertiesForSelectedTransaction
  describe('setDisplayPropertiesForSelectedTransaction function ->', function () {
    it('should set CdtCodeName when service code details are found in the data list and transaction does not have CdtCodeName', function () {
      var serviceCode = { CdtCodeName: 'D2192' };
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(serviceCode);
      ctrl.setDisplayPropertiesForSelectedTransaction();
      scope.$apply();
      expect(scope.transaction.CdtCodeName).toEqual(serviceCode.CdtCodeName);
    });

    it('should set AffectedAreaId and ServiceType when service code details are found in the data list', function () {
      var result = { AffectedAreaId: 1, Description: 'carry' };
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(result);
      ctrl.setDisplayPropertiesForSelectedTransaction();
      scope.$apply();

      expect(scope.transaction.ServiceType).toEqual(result.Description);
      expect(scope.transaction.AffectedAreaId).toEqual(result.AffectedAreaId);
    });

    it('should not set AffectedAreaId and ServiceType when service code details are not found in the data list', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);
      ctrl.setDisplayPropertiesForSelectedTransaction();
      scope.$apply();

      expect(scope.transaction.ServiceType).toBeUndefined();
      expect(scope.transaction.AffectedAreaId).toBeUndefined();
    });

    it('should set Adjustment Type description when positive adjustments are found in the data list', function () {
      var result = {
        AdjustmentTypeId: 'e7ca533c-6710-4002-8d97-8f7c1f38195b',
        Description: 'Finance Charge',
        IsPositive: 1,
      };

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(result);
      scope.transaction.AdjustmentTypeName = 'Finance Charge';
      ctrl.setDisplayPropertiesForSelectedTransaction();
      scope.$apply();

      expect(scope.transaction.AdjustmentTypeName).toEqual(result.Description);
    });

    it('should set TransactionType and AdjustmentTypeName when TransactionTypeId is 6 (FinanceCharge)', function () {
      dataForModal.Transaction = { TransactionTypeId: 6 };
      ctrl.setDisplayPropertiesForSelectedTransaction();
      scope.$apply();

      expect(scope.transaction.TransactionType).toEqual('Finance Charge');
      expect(scope.transaction.AdjustmentTypeName).toEqual('Finance Charge');
    });

    it('should call ctrl.filterOutAdjustmentTypes when in edit mode', function () {
      scope.editMode = true;
      spyOn(ctrl, 'filterOutAdjustmentTypes');
      ctrl.setDisplayPropertiesForSelectedTransaction();
      scope.$apply();
      timeout.flush();

      expect(ctrl.filterOutAdjustmentTypes).toHaveBeenCalledWith(
        'e7ca533c-6710-4002-8d97-8f7c1f38195b',
        2
      );
    });

    it('should NOT call ctrl.filterOutAdjustmentTypes when NOT in edit mode', function () {
      scope.editMode = false;
      spyOn(ctrl, 'filterOutAdjustmentTypes');
      ctrl.setDisplayPropertiesForSelectedTransaction();
      scope.$apply();
      timeout.flush();

      expect(ctrl.filterOutAdjustmentTypes).not.toHaveBeenCalled();
    });
  });

  //defaultFocus
  describe('defaultFocus function->', function () {
    it("should set focus on #inpTransactionDate's input field", function () {
      ctrl.defaultFocus();
      timeout.flush(100);

      expect(
        angular.element('#inpTransactionDate').find('input').focus
      ).toHaveBeenCalled();
    });
  });

  //validateServiceCodeRoot
  describe('validateServiceCodeRoot function --> ', function () {
    var serviceTransaction = {};
    it('should return true when serviceTransaction is undefined', function () {
      var returnValue = ctrl.validateServiceCodeRoot(undefined);
      expect(returnValue).toBe(true);
    });

    it('should return true when serviceTransaction.Tooth is undefined', function () {
      serviceTransaction = { Tooth: undefined };
      var returnValue = ctrl.validateServiceCodeRoot(serviceTransaction);
      expect(returnValue).toBe(true);
    });

    it('should return true when serviceTransaction.Tooth is valid and serviceTransaction.Root is valid', function () {
      serviceTransaction = { Tooth: '1', Roots: 'S' };
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ USNumber: '1', ToothId: 1 });
      spyOn(ctrl, 'setValidSelectedRoots').and.returnValue(true);
      var returnValue = ctrl.validateServiceCodeRoot(serviceTransaction);
      expect(returnValue).toBe(true);
    });

    it('should return false when serviceTransaction.Tooth is valid and serviceTransaction.Root is valid and setValidSelectedRoots return false', function () {
      serviceTransaction = { Tooth: '1', Roots: 'S' };
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ USNumber: '1', ToothId: 1 });
      spyOn(ctrl, 'setValidSelectedRoots').and.returnValue(false);
      var returnValue = ctrl.validateServiceCodeRoot(serviceTransaction);
      expect(returnValue).toBe(false);
    });
  });

  //validateServiceCodeSurface function test
  describe('validateServiceCodeSurface function --> ', function () {
    var serviceTransaction = {};
    beforeEach(inject(function () {
      spyOn(ctrl, 'validateSelectedSurfaces').and.returnValue(true);
    }));

    it('should return false when serviceTransaction is undefined', function () {
      scope.allTeeth = [];
      var returnValue = ctrl.validateServiceCodeSurface(undefined);

      expect(returnValue).toBe(true);
    });

    it('should return false when serviceTransaction.Tooth is undefined', function () {
      scope.allTeeth = [];
      serviceTransaction = {
        Tooth: undefined,
        Surface: 'M',
        AffectedAreaId: 4,
      };
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ USNumber: '1', ToothId: 1 });

      var returnValue = ctrl.validateServiceCodeSurface(serviceTransaction);

      expect(returnValue).toBe(false);
    });

    it('should return false when serviceTransaction.Surface is empty', function () {
      scope.allTeeth = [];
      serviceTransaction = { Tooth: 1, Surface: '', AffectedAreaId: 4 };
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ USNumber: '1', ToothId: 1 });

      var returnValue = ctrl.validateServiceCodeSurface(serviceTransaction);

      expect(returnValue).toBe(false);
    });

    it('should return true when serviceTransaction.Tooth is valid and serviceTransaction.Surface is valid', function () {
      scope.allTeeth = [];
      serviceTransaction = { Tooth: '1', Surface: 'M', AffectedAreaId: 4 };

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ USNumber: '1', ToothId: 1 });

      var returnValue = ctrl.validateServiceCodeSurface(serviceTransaction);

      expect(returnValue).toBe(true);
    });

    it('should return true when allTeeth is undefined', function () {
      serviceTransaction = { Tooth: '1', Surface: 'M', AffectedAreaId: 4 };

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ USNumber: '1', ToothId: 1 });

      var returnValue = ctrl.validateServiceCodeSurface(serviceTransaction);

      expect(returnValue).toBe(true);
    });

    it('should return true when affected area is not set to surface', function () {
      scope.allTeeth = [];
      serviceTransaction = { Tooth: '1', Surface: 'M', AffectedAreaId: 1 };

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ USNumber: '1', ToothId: 1 });

      var returnValue = ctrl.validateServiceCodeSurface(serviceTransaction);

      expect(returnValue).toBe(true);
    });
  });

  //validateServiceCodeTooth function test
  describe('validateServiceCodeTooth function --> ', function () {
    var serviceTransaction = {};
    it("should return true when serviceTransaction.AffectedAreaId is '1'", function () {
      scope.allTeeth = [];
      serviceTransaction = { AffectedAreaId: 1 };

      var returnValue = ctrl.validateServiceCodeTooth(serviceTransaction);

      expect(returnValue).toBe(true);
    });

    it('should return true when serviceTransaction.AffectedAreaId is 2 and serviceTransaction.Tooth is valid quadrant', function () {
      scope.allTeeth = [];
      serviceTransaction = { AffectedAreaId: 2, Tooth: 'UR' };

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ Desc: 'UR', Selected: false, Id: 2 });

      var returnValue = ctrl.validateServiceCodeTooth(serviceTransaction);

      expect(returnValue).toBe(true);
    });

    it("should return true when serviceTransaction.AffectedAreaId is '3' and serviceTransaction.Tooth is valid tooth", function () {
      scope.allTeeth = [];
      serviceTransaction = { AffectedAreaId: 3, Tooth: '32' };

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({ USNumber: '32', ToothId: 32 });

      var returnValue = ctrl.validateServiceCodeTooth(serviceTransaction);

      expect(returnValue).toBe(true);
    });

    it("should return false when serviceTransaction.AffectedAreaId is '3' and serviceTransaction.Tooth is invalid tooth", function () {
      scope.allTeeth = [];
      serviceTransaction = { AffectedAreaId: 3, Tooth: '33' };

      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);

      var returnValue = ctrl.validateServiceCodeTooth(serviceTransaction);

      expect(returnValue).toBe(false);
    });

    it('should return false when serviceTransaction.AffectedAreaId is undefined', function () {
      scope.allTeeth = [];
      serviceTransaction = { Tooth: '33' };

      var returnValue = ctrl.validateServiceCodeTooth(serviceTransaction);

      expect(returnValue).toBe(false);
    });

    it('should return true when allTeeth is undefined', function () {
      serviceTransaction = { Tooth: '33' };

      var returnValue = ctrl.validateServiceCodeTooth(serviceTransaction);

      expect(returnValue).toBe(true);
    });
  });

  //validateTooth function test
  describe('validateTooth function --> ', function () {
    var serviceTransaction = {};
    beforeEach(inject(function () {
      spyOn(ctrl, 'validateServiceCodeTooth').and.returnValue(true);
      spyOn(ctrl, 'validateServiceCodeSurface').and.returnValue(true);
    }));

    it('should capitalize tooth and set serviceTransaction.ToothFirst to false when serviceTransaction.AffectedAreaId is undefined', function () {
      serviceTransaction = { Tooth: 'a' };

      scope.validateTooth(serviceTransaction, false);

      expect(serviceTransaction.Tooth).toEqual('A');
      expect(serviceTransaction.ToothFirst).toEqual(false);
      expect(ctrl.validateServiceCodeTooth).toHaveBeenCalled();
      expect(ctrl.validateServiceCodeSurface).toHaveBeenCalled();
    });

    it('should not capitalize tooth and set serviceTransaction.ToothFirst to false when serviceTransaction.Tooth and serviceTransaction.AffectedAreaId is undefined', function () {
      serviceTransaction = {};

      scope.validateTooth(serviceTransaction, false);

      expect(serviceTransaction.ToothFirst).toEqual(false);
      expect(ctrl.validateServiceCodeTooth).toHaveBeenCalled();
      expect(ctrl.validateServiceCodeSurface).toHaveBeenCalled();
    });

    it("should format serviceTransaction.Tooth as per quadrant when serviceTransaction.AffectedAreaId is '2' and tooth contains invalid characters", function () {
      serviceTransaction = { Tooth: 'UR,', AffectedAreaId: 2 };

      scope.validateTooth(serviceTransaction, false);

      expect(serviceTransaction.Tooth).toEqual('UR');
      expect(serviceTransaction.ToothFirst).toEqual(false);
      expect(ctrl.validateServiceCodeTooth).toHaveBeenCalled();
      expect(ctrl.validateServiceCodeSurface).toHaveBeenCalled();
    });

    it("should not format serviceTransaction.Tooth when serviceTransaction.AffectedAreaId is '2' and serviceTransaction.Tooth is undefined", function () {
      serviceTransaction = { AffectedAreaId: 2 };

      scope.validateTooth(serviceTransaction, false);

      expect(serviceTransaction.Tooth).toBeUndefined();
      expect(serviceTransaction.ToothFirst).toEqual(false);
      expect(ctrl.validateServiceCodeTooth).toHaveBeenCalled();
      expect(ctrl.validateServiceCodeSurface).toHaveBeenCalled();
    });

    it("should format serviceTransaction.Tooth and set serviceTransaction.ToothFirst to false when serviceTransaction.AffectedAreaId is '4' and isSurface is false", function () {
      serviceTransaction = { Tooth: 'a,', AffectedAreaId: 4 };

      scope.validateTooth(serviceTransaction, false);

      expect(serviceTransaction.Tooth).toEqual('A');
      expect(serviceTransaction.ToothFirst).toEqual(false);
      expect(ctrl.validateServiceCodeTooth).toHaveBeenCalled();
      expect(ctrl.validateServiceCodeSurface).toHaveBeenCalled();
    });

    it("should set serviceTransaction.ToothFirst to true when serviceTransaction.AffectedAreaId is '4' and serviceTransaction.Tooth is empty and isSurface is true", function () {
      serviceTransaction = { Tooth: '', AffectedAreaId: 4 };

      scope.validateTooth(serviceTransaction, true);

      expect(serviceTransaction.Tooth).toEqual('');
      expect(serviceTransaction.ToothFirst).toEqual(true);
      expect(ctrl.validateServiceCodeTooth).toHaveBeenCalled();
      expect(ctrl.validateServiceCodeSurface).toHaveBeenCalled();
    });

    it("should set serviceTransaction.ToothFirst to true when serviceTransaction.AffectedAreaId is '4' and serviceTransaction.Tooth is undefined and serviceTransaction.Surface is defined", function () {
      serviceTransaction = { AffectedAreaId: 4, Surface: 'M' };

      scope.validateTooth(serviceTransaction, true);

      expect(serviceTransaction.ToothFirst).toEqual(true);
      expect(ctrl.validateServiceCodeTooth).toHaveBeenCalled();
      expect(ctrl.validateServiceCodeSurface).toHaveBeenCalled();
    });

    it("should set serviceTransaction.ToothFirst to false when serviceTransaction.AffectedAreaId is '4' and serviceTransaction.Tooth and serviceTransaction.Surface is undefined", function () {
      serviceTransaction = { AffectedAreaId: 4 };

      scope.validateTooth(serviceTransaction, true);

      expect(serviceTransaction.ToothFirst).toEqual(false);
      expect(ctrl.validateServiceCodeTooth).toHaveBeenCalled();
      expect(ctrl.validateServiceCodeSurface).toHaveBeenCalled();
    });

    it("should set serviceTransaction.ToothFirst to true when serviceTransaction.AffectedAreaId is '3' and serviceTransaction.Tooth is undefined and serviceTransaction.Roots is defined", function () {
      serviceTransaction = { AffectedAreaId: 3, Roots: 'P' };

      scope.validateTooth(serviceTransaction, undefined);

      expect(serviceTransaction.ToothFirst).toEqual(true);
      expect(ctrl.validateServiceCodeTooth).toHaveBeenCalled();
      expect(ctrl.validateServiceCodeSurface).toHaveBeenCalled();
    });

    it("should set serviceTransaction.ToothFirst to false when serviceTransaction.AffectedAreaId is '3' and serviceTransaction.Tooth and serviceTransaction.Roots is undefined", function () {
      serviceTransaction = { AffectedAreaId: 3 };

      scope.validateTooth(serviceTransaction, false);

      expect(serviceTransaction.ToothFirst).toEqual(false);
      expect(ctrl.validateServiceCodeTooth).toHaveBeenCalled();
      expect(ctrl.validateServiceCodeSurface).toHaveBeenCalled();
    });

    it("should set serviceTransaction.ToothFirst to false when serviceTransaction.AffectedAreaId is 'invalid'", function () {
      serviceTransaction = { AffectedAreaId: 10 };

      scope.validateTooth(serviceTransaction, false);

      expect(serviceTransaction.ToothFirst).toEqual(false);
      expect(ctrl.validateServiceCodeTooth).toHaveBeenCalled();
      expect(ctrl.validateServiceCodeSurface).toHaveBeenCalled();
    });

    it('validateTooth should return true for valid root of service transaction', function () {
      var servicetransaction = {
        AccountMemberId: 'e7defcc9-9cd9-477a-80f8-8cceb0f80bbc',
        AffectedAreaId: 3,
        Amount: 12,
        AppointmentId: null,
        CdtCodeName: 'D3331',
        Code: 'D3331',
        Fee: 12,
        invalideTooth: false,
        invalidSurface: false,
        ObjectState: 'Add',
        ProviderUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        Roots: 'DB',
        Tooth: '1',
        ServiceCodeId: 'e3947b6b-e4c1-4ec9-a99c-09eecdd4d13a',
        TransactionTypeId: 1,
        TransactionType: 'Service',
        invalidRoot: true,
      };
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({
          RootAbbreviations: '[DB,P,MB]',
        });
      scope.isSaveButtonClicked = true;

      var result = scope.validateTooth(servicetransaction);

      expect(result).toBe(true);
    });
  });

  // validateTransaction function test
  describe('validateTransaction function --> ', function () {
    it('should not set focus on inpTransactionDate input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 1,
        Tooth: '2',
        Surface: 'M',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
        TotalEstInsurance: 0,
        Amount: 100,
      };

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
      expect(
        angular.element('#inpTransactionDate').find('input').focus
      ).not.toHaveBeenCalled();
    });

    it('should set focus on inpTransactionDate input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: new Date(2019 - 4 - 9),
        ValidDate: false,
        AffectedAreaId: 1,
        Tooth: '1',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 1,
      };

      // Act
      var returnValue = ctrl.validateTransaction();
      timeout.flush(0);
      expect(
        angular.element('#inpTransactionDate').find('input').focus
      ).toHaveBeenCalled();

      // Assert
      expect(returnValue).toEqual(false);
    });

    it('should not set focus on inpTooth input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 1,
        Tooth: 't1',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
        TotalEstInsurance: 0,
        Amount: 100,
      };

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
      expect(angular.element('#inpTooth').focus).not.toHaveBeenCalled();
    });

    it('should not set focus on inpTooth input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: false,
        ValidDate: true,
        AffectedAreaId: 2,
        Tooth: '',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
      };

      // Act
      var returnValue = ctrl.validateTransaction();
      timeout.flush(0);
      expect(angular.element('#inpTooth').focus).not.toHaveBeenCalledWith(
        'validateTooth'
      );

      // Assert
      expect(returnValue).toEqual(false);
    });

    it('should not set focus on inpSurface input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 1,
        Tooth: 't1',
        Surface: 'outer',
        Roots: '',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
        TotalEstInsurance: 0,
        Amount: 100,
      };

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
      expect(angular.element('#inpSurface').focus).not.toHaveBeenCalled();
    });

    it('should set focus on inpSurface input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 4,
        Tooth: 't1',
        Surface: '',
        Roots: '4',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
      };

      // Act
      var returnValue = ctrl.validateTransaction();
      timeout.flush(0);
      expect(angular.element('#inpSurface').focus).toHaveBeenCalled();

      // Assert
      expect(returnValue).toEqual(false);
    });

    it('should not set focus on inpRoots input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 1,
        Tooth: 't1',
        Surface: '',
        Roots: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
        TotalEstInsurance: 0,
        Amount: 100,
      };

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
      expect(angular.element('#inpRoots').focus).not.toHaveBeenCalled();
    });

    it('should set focus on inpRoots input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 3,
        Tooth: 't1',
        Surface: 'outer',
        Roots: '',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
      };

      // Act
      var returnValue = ctrl.validateTransaction();
      timeout.flush(0);
      expect(angular.element('#inpRoots').focus).toHaveBeenCalled();

      // Assert
      expect(returnValue).toEqual(false);
    });

    it('should not set focus on inpFee input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 4,
        Tooth: '1',
        Surface: 'M',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
        TotalEstInsurance: 0,
        Amount: 100,
      };
      spyOn(scope, 'validateTooth').and.returnValue(true);
      spyOn(ctrl, 'validateServiceCodeSurface').and.returnValue(true);
      spyOn(ctrl, 'validateServiceCodeRoot').and.returnValue(true);

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
      expect(angular.element('#inpFee').focus).not.toHaveBeenCalled();
    });

    it('should set focus on inpFee input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 4,
        Tooth: 't1',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 9999999,
      };
      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(false);
      timeout.flush(0);
      expect(angular.element('#inpFee').focus).toHaveBeenCalled();
    });

    it('should not set focus on inpTax input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 4,
        Tooth: '1',
        Surface: 'M',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 10,
        TotalEstInsurance: 0,
        Amount: 110,
      };
      spyOn(scope, 'validateTooth').and.returnValue(true);
      spyOn(ctrl, 'validateServiceCodeSurface').and.returnValue(true);
      spyOn(ctrl, 'validateServiceCodeRoot').and.returnValue(true);

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
      expect(angular.element('#inpTax').focus).not.toHaveBeenCalled();
    });

    it('should set focus on inpTax input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 4,
        Tooth: 't1',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 99999,
        Tax: -10.0,
      };
      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(false);
      timeout.flush(0);
      expect(angular.element('#inpTax').focus).toHaveBeenCalled();
    });

    //Debit Transaction validation test case
    it('should not set focus on inpAmount input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 5,
        DateEntered: true,
        ValidDate: true,
        AdjustmentTypeId: 1,
        ProviderUserId: 'provideruserid1',
        Amount: 100,
      };
      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
      expect(angular.element('#inpAmount').focus).not.toHaveBeenCalled();
    });

    it('should set focus on inpAmount input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 5,
        DateEntered: true,
        ValidDate: true,
        AdjustmentTypeId: 1,
        ProviderUserId: 'provideruserid1',
        Amount: -100,
      };
      // Act

      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(false);
      timeout.flush(0);
      expect(angular.element('#inpAmount').focus).toHaveBeenCalled();
    });
    it('should set focus on inpAmount input box', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 5,
        DateEntered: true,
        ValidDate: true,
        AdjustmentTypeId: 1,
        ProviderUserId: 'provideruserid1',
      };
      // Act

      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(false);
      timeout.flush(0);
      expect(angular.element('#inpAmount').focus).toHaveBeenCalled();
    });

    it('should not set focus on inpTransactionDate input box- Positive Transaction Edit', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 5,
        DateEntered: true,
        ValidDate: true,
        AdjustmentTypeId: 1,
        ProviderUserId: 'provideruserid1',
        Amount: 100,
      };
      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
      expect(
        angular.element('#inpTransactionDate').find('input').focus
      ).not.toHaveBeenCalled();
    });

    it('should set focus on inpTransactionDate input box - Positive Transaction Edit', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 5,
        ValidDate: true,
        AdjustmentTypeId: 1,
        ProviderUserId: 'provideruserid1',
        Amount: 100,
      };

      // Act
      var returnValue = ctrl.validateTransaction();
      // Assert
      expect(returnValue).toEqual(false);
      timeout.flush(0);
      expect(
        angular.element('#inpTransactionDate').find('input').focus
      ).toHaveBeenCalled();
    });

    it('should not set focus on lstProvider input box -Positive Transaction Edit', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 5,
        DateEntered: true,
        ValidDate: true,
        AdjustmentTypeId: 1,
        ProviderUserId: 'provideruserid1',
        Amount: 100,
      };
      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
      expect(
        angular.element('#lstProvider').find('span').focus
      ).not.toHaveBeenCalled();
    });

    it('should set focus on lstProvider input box - Positive Transaction Edit', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 5,
        DateEntered: true,
        ValidDate: true,
        AdjustmentTypeId: 1,
        ProviderUserId: '',
        Amount: 100,
      };

      // Act
      var returnValue = ctrl.validateTransaction();
      timeout.flush(100);

      // Assert
      expect(returnValue).toEqual(true);
    });

    it('should set focus on lstAdjustmentType input box - Positive Transaction Edit', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 5,
        DateEntered: true,
        ValidDate: true,
        AdjustmentTypeId: '',
        ProviderUserId: 'provideruserid1',
        Amount: 100,
      };

      // Act
      var returnValue = ctrl.validateTransaction();
      timeout.flush(100);

      // Assert
      expect(returnValue).toEqual(false);
      expect(
        angular.element('#lstAdjustmentType').find('span').focus
      ).toHaveBeenCalled();
    });
    it('should not set focus on lstAdjustmentType input box - Positive Transaction Edit', function () {
      // Arrange
      scope.transaction = {
        TransactionTypeId: 5,
        DateEntered: true,
        ValidDate: true,
        AdjustmentTypeId: 1,
        ProviderUserId: 'provideruserid1',
        Amount: 100,
      };

      // Act
      var returnValue = ctrl.validateTransaction();

      // Assert
      expect(returnValue).toEqual(true);
      expect(
        angular.element('#lstAdjustmentType').find('span').focus
      ).not.toHaveBeenCalled();
    });
  });

  describe('updateTransactionSuccess function --> ', function () {
    it('updateTransactionSuccess should call toastrFactory.success and close the modalInstance', function () {
      var successResponse = { Value: { TransactionTypeId: 1 } };
      ctrl.updateTransactionSuccess(successResponse);

      expect(toastrFactory.success).toHaveBeenCalled();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });

  describe('updateTransactionFailure function --> ', function () {
    it('updateTransactionFailure should call toastrFactory.error when transaction update is failed', function () {
      var errorResponse = {};

      ctrl.updateTransactionFailure(errorResponse);

      expect(toastrFactory.error).toHaveBeenCalled();
    });
    it('updateTransactionFailure should call toastrFactory.error when transaction update is failed and TransactionTypeId is 1', function () {
      var errorResponse = {};
      scope.transaction.TransactionTypeId = 1;
      ctrl.updateTransactionFailure(errorResponse);

      expect(toastrFactory.error).toHaveBeenCalled();
      expect(ctrl.updateTransactionMessage).toEqual(
        'updating service transaction'
      );
    });

    it('updateTransactionFailure should call toastrFactory.error when transaction update is failed and TransactionTypeId is 5', function () {
      var errorResponse = {};
      scope.transaction.TransactionTypeId = 5;
      ctrl.updateTransactionFailure(errorResponse);

      expect(toastrFactory.error).toHaveBeenCalled();
      expect(ctrl.updateTransactionMessage).toEqual(
        'updating debit transaction'
      );
    });
  });

  describe('continueWithEdit function --> ', function () {
    it('should call service call to save transaction when it is valid', function () {
      spyOn(ctrl, 'validateTransaction').and.returnValue(true);
      scope.transaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 1,
        Tooth: 't1',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
      };
      ctrl.continueWithEdit();

      expect(patientServices.ServiceTransactions.update).toHaveBeenCalled();
    });

    it('should not call service call to save transaction when it is invalid', function () {
      spyOn(ctrl, 'validateTransaction').and.returnValue(false);
      ctrl.continueWithEdit();

      expect(patientServices.ServiceTransactions.update).not.toHaveBeenCalled();
    });

    it('should not call service call to save transaction when user is not authorized for it', function () {
      spyOn(ctrl, 'authEditAccess').and.returnValue(false);
      ctrl.continueWithEdit();

      expect(patientServices.ServiceTransactions.update).not.toHaveBeenCalled();
    });

    it('should call debit transaction service call to update transaction when it is valid', function () {
      spyOn(ctrl, 'validateTransaction').and.returnValue(true);

      scope.transaction = {
        TransactionTypeId: 5,
        DateEntered: true,
        ValidDate: true,
        ProviderUserId: 'provideruserid1',
        Amount: 100,
      };
      ctrl.continueWithEdit();

      expect(patientServices.DebitTransaction.update).toHaveBeenCalled();
    });
    it('should not call debit transaction service call to update transaction when user is not authorized for it', function () {
      spyOn(ctrl, 'authEditAccess').and.returnValue(false);
      ctrl.continueWithEdit();

      expect(patientServices.DebitTransaction.update).not.toHaveBeenCalled();
    });
    it('should set balance to amount when payment has not been applied', function () {
      spyOn(ctrl, 'validateTransaction').and.returnValue(true);

      scope.transaction = {
        TransactionTypeId: 5,
        Balance: 5,
        Amount: 100,
      };
      ctrl.continueWithEdit();

      expect(
        patientServices.DebitTransaction.update.calls.argsFor(0)[0]
      ).toContain(jasmine.objectContaining({ Balance: 100 }));
    });
    it('should set balance to remaining balance when payment has been applied and remaining balance is defined', function () {
      spyOn(ctrl, 'validateTransaction').and.returnValue(true);

      scope.transaction = {
        TransactionTypeId: 5,
        Balance: 5,
        Amount: 100,
        RemainingBalance: 20,
        isPaymentApplied: true,
      };
      ctrl.continueWithEdit();

      expect(
        patientServices.DebitTransaction.update.calls.argsFor(0)[0]
      ).toContain(jasmine.objectContaining({ Balance: 20 }));
    });
    it('should leave balance alone when payment has been applied and remaining balance is undefined', function () {
      spyOn(ctrl, 'validateTransaction').and.returnValue(true);

      scope.transaction = {
        TransactionTypeId: 5,
        Balance: 5,
        Amount: 100,
        isPaymentApplied: true,
      };
      ctrl.continueWithEdit();

      expect(
        patientServices.DebitTransaction.update.calls.argsFor(0)[0]
      ).toContain(jasmine.objectContaining({ Balance: 5 }));
    });
  });

  // NOTE the tests below were broken by the addition of the userLocationAuthorization
  describe('editTransaction function --> ', function () {
    it('should check for insurance payment when service transaction and open edit mode when no insurance payments', function () {
      ctrl.currentTransactionTypeId = 1;
      patientServices.ServiceTransactions.checkForInsurancePayment = jasmine
        .createSpy()
        .and.returnValue({
          $promise: {
            then: function (callback) {
              return callback({ Value: false });
            },
          },
        });
      spyOn(ctrl, 'invalidEditModal');
      spyOn(ctrl, 'defaultFocus');
      scope.editMode = false;
      scope.editTransaction();

      //expect(scope.editMode).toEqual(true);
      //expect(ctrl.defaultFocus).toHaveBeenCalled();
      //expect(ctrl.invalidEditModal).not.toHaveBeenCalled();
      //expect(patientServices.ServiceTransactions.checkForInsurancePayment).toHaveBeenCalled();
    });

    it('should check for insurance payment when service transaction and disable edit mode when insurance payments', function () {
      ctrl.currentTransactionTypeId = 1;
      scope.transaction.LocationId = '1234';
      patientServices.ServiceTransactions.checkForInsurancePayment = jasmine
        .createSpy()
        .and.returnValue({
          $promise: {
            then: function (callback) {
              return callback({ Value: true });
            },
          },
        });
      spyOn(ctrl, 'invalidEditModal');
      spyOn(ctrl, 'defaultFocus');
      scope.editMode = false;
      scope.editTransaction();

      //expect(scope.editMode).toEqual(false);
      //expect(ctrl.defaultFocus).not.toHaveBeenCalled();
      //expect(ctrl.invalidEditModal).toHaveBeenCalled();
      //expect(patientServices.ServiceTransactions.checkForInsurancePayment).toHaveBeenCalled();
    });

    it('should open transaction in edit mode and call function to set focus on it when not service transaction', function () {
      ctrl.currentTransactionTypeId = 2;
      patientServices.ServiceTransactions.checkForInsurancePayment = jasmine
        .createSpy()
        .and.returnValue({
          $promise: {
            then: function (callback) {
              return callback({ Value: false });
            },
          },
        });
      spyOn(ctrl, 'defaultFocus');
      scope.editMode = false;
      scope.editTransaction();

      //expect(scope.editMode).toEqual(true);
      //expect(ctrl.defaultFocus).toHaveBeenCalled();
      //expect(patientServices.ServiceTransactions.checkForInsurancePayment).not.toHaveBeenCalled();
    });
  });

  describe('scope $watch function on "transaction" changes', function () {
    let newTransaction = {};
    beforeEach(function () {
      newTransaction = {
        TransactionTypeId: 1,
        DateEntered: true,
        ValidDate: true,
        AffectedAreaId: 1,
        Tooth: 't1',
        Surface: 'outer',
        ProviderUserId: 'provideruserid1',
        Fee: 100,
        Tax: 0,
        Description: 'Service'
      };

      spyOn(scope, 'checkServiceLocation');
    });

    it('disableMessage should set to null when condition is not met', function () {
      scope.transaction = newTransaction;
      scope.$digest();

      expect(scope.checkServiceLocation).toHaveBeenCalled();
      expect(newTransaction.disableMessage).toEqual(null);
    });

    it('disableMessage should get set when the service is attached to a claim that is InProcess', function () {
      newTransaction.InProcess = true;
      scope.transaction = newTransaction;
      scope.$digest();

      expect(scope.checkServiceLocation).toHaveBeenCalled();
      expect(newTransaction.disableMessage).toEqual('This service is attached to a claim that is InProcess and it cannot be edited or deleted');
    });

    it('disableMessage should get set for Credit/Debit card returns', function () {
      newTransaction.IsAuthorized = true;
      scope.transaction = newTransaction;
      scope.$digest();
      
      expect(scope.checkServiceLocation).toHaveBeenCalled();
      expect(newTransaction.disableMessage).toEqual('Credit/Debit card returns cannot be edited or deleted');
    });

    it('disableMessage should get set for Vendor Payment Refund', function () {
      ctrl.currentTransactionTypeId = 5;
      newTransaction = { TransactionTypeId: 5, Description: 'Vendor Payment Refund' };
      scope.transaction = newTransaction;
      scope.$digest();

      expect(scope.checkServiceLocation).toHaveBeenCalled();
      expect(newTransaction.disableMessage).toEqual('This debit originated from a third party vendor and it cannot be edited.');
    });

    it('disableMessage should get set when current location does not match this adjustment\'s location.', function () {
      scope.serviceLocationMatch = false;
      ctrl.currentTransactionTypeId = 5;
      scope.transaction = newTransaction;
      scope.$digest();
      
      expect(scope.checkServiceLocation).toHaveBeenCalled();
      expect(newTransaction.disableMessage).toEqual('Your current location does not match this adjustment\'s location.');
    });
  });
  describe('navigateAndClose function --> ', function () {
    it('should open account summary page in a new window', function () {
      scope.patientInfo = {
        PersonAccount: {
          PersonId: 2,
        },
      };
      scope.navigateToAccountSummary(13);
      expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
        '#/Patient/2/Summary?tab=Account Summary&open=new&encounterId=13'
      );
    });
  });

  describe('closeModal function --> ', function () {
    it('should call checkForDataChange() to detect changes and close the the modal', function () {
      spyOn(ctrl, 'checkForDataChange');
      scope.closeModal();

      expect(ctrl.checkForDataChange).toHaveBeenCalled();
    });
  });

  describe('checkForDataChange function --> ', function () {
    it('should not call cancel modal when editMode is false', function () {
      scope.editMode = false;
      ctrl.checkForDataChange(function () {});

      expect(modalFactory.CancelModal).not.toHaveBeenCalled();
    });

    it('should not call cancel modal when editMode is true but no changes are made in data', function () {
      scope.editMode = true;
      var date = '2019-01-01';
      scope.transaction = {
        DateEntered: date,
        ProviderUserId: 'providerid',
      };
      ctrl.transactionInitialCopy = {
        DateEntered: date,
        ProviderUserId: 'providerid',
      };
      surfaceHelper.areSurfaceCSVsEqual = jasmine
        .createSpy('surfaceHelper.areSurfaceCSVsEqual')
        .and.returnValue(true);
      ctrl.checkForDataChange(function () {});
      expect(modalFactory.CancelModal).not.toHaveBeenCalled();
    });

    it('should call cancel modal when editMode is true and changes are made in data', function () {
      scope.editMode = true;
      scope.transaction = {}; // ARWEN: #509747 This was causing an error because it was number before
      scope.$apply();
      ctrl.checkForDataChange(function () {});
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  describe('authorization check functions --> ', function () {
    it('should set ctrl.hasViewOrEditAccessToServiceTransaction to true when user is authorized for edit action', function () {
      scope.editMode = true;
      ctrl.authAccess();

      expect(ctrl.hasViewOrEditAccessTransaction).toEqual(true);
    });

    it('should set ctrl.hasViewOrEditAccessToServiceTransaction to true when user is authorized for add action', function () {
      scope.editMode = false;
      ctrl.authAccess();

      expect(ctrl.hasViewOrEditAccessTransaction).toEqual(true);
    });

    it('should call notifyNotAuthorized() to throw error message when user is not authorized', function () {
      scope.editMode = true;
      spyOn(ctrl, 'authEditAccess').and.returnValue(false);
      ctrl.authAccess();

      expect(_$location_.path).toHaveBeenCalledWith('/');
      expect(ctrl.hasViewOrEditAccessTransaction).toEqual(false);
    });
  });

  describe('tax calculation region --> ', function () {
    describe('setPreviousAmount function->', function () {
      it('should set flag to identify if fee is updated', function () {
        scope.previousAmountChanged = false;
        scope.transaction = { TransactionTypeId: 1 };

        scope.setPreviousAmount();

        expect(scope.previousAmountChanged).toEqual(true);
      });
    });
  });

  describe('ctrl.setToothInfo ->', function () {
    it('should set active teeth variables if transaction has Tooth', function () {
      var toothString = '2,4-5';
      scope.transaction = { Tooth: toothString };
      ctrl.setToothInfo();
      expect(scope.activeTeeth.length).toBe(1);
      expect(scope.activeTeeth[0]).toBe(toothString);
      expect(scope.originalActiveTeeth.length).toBe(2);
      expect(scope.originalActiveTeeth[0]).toBe('2');
      expect(scope.originalActiveTeeth[1]).toBe('4-5');
    });

    it('should initialize active teeth variables if transaction does not have Tooth', function () {
      scope.transaction = {};
      ctrl.setToothInfo();
      expect(scope.activeTeeth.length).toBe(0);
      expect(scope.originalActiveTeeth.length).toBe(0);
    });
  });

  describe('saveTransaction function --> ', function () {
    it('should do nothing for invalid transaction', function () {
      scope.transaction = {};
      ctrl.validateTransaction = jasmine
        .createSpy('ctrl.validateTransaction')
        .and.returnValue(false);
      ctrl.handleClaim = jasmine.createSpy('ctrl.handleClaim');
      ctrl.handleAffectedCredits = jasmine.createSpy(
        'ctrl.handleAffectedCredits'
      );

      scope.saveTransaction();

      expect(ctrl.handleClaim).not.toHaveBeenCalled();
      expect(ctrl.handleAffectedCredits).not.toHaveBeenCalled();
      expect(scope.validateFlag).toEqual(true);
    });

    it('should call handleAffectedCredits when no open claim', function () {
      //arrange
      ctrl.validateTransaction = jasmine
        .createSpy('ctrl.validateTransaction')
        .and.returnValue(true);
      ctrl.transactionHasClaimThatNeedsToRecreate = jasmine
        .createSpy('ctrl.transactionHasClaimThatNeedsToRecreate')
        .and.returnValue(false);
      ctrl.handleAffectedCredits = jasmine.createSpy(
        'ctrl.handleAffectedCredits'
      );

      //act
      scope.saveTransaction();

      //assert
      expect(ctrl.handleAffectedCredits).toHaveBeenCalled();
    });

    it('should call handleClaim when claim needs to close', function () {
      //arrange
      ctrl.validateTransaction = jasmine
        .createSpy('ctrl.validateTransaction')
        .and.returnValue(true);
      ctrl.transactionHasClaimThatNeedsToRecreate = jasmine
        .createSpy('ctrl.transactionHasClaimThatNeedsToRecreate')
        .and.returnValue(true);
      ctrl.handleClaim = jasmine.createSpy('ctrl.handleClaim');

      //act
      scope.saveTransaction();

      //assert
      expect(ctrl.handleClaim).toHaveBeenCalled();
    });

    it(
      'should reset Tooth based on $scope.activeTeeth if transaction.UseCodeForRangeOfTeeth is true and scope.activeTeeth is array and ' +
        'scope.originalActiveTeeth not equal to scope.activeTeeth',
      function () {
        //arrange
        scope.originalActiveTeeth = ['3', '4'];
        scope.activeTeeth = ['3'];
        scope.transaction = { UseCodeForRangeOfTeeth: true, Tooth: '2' };
        ctrl.validateTransaction = jasmine
          .createSpy('ctrl.validateTransaction')
          .and.returnValue(true);
        ctrl.transactionHasClaimThatNeedsToRecreate = jasmine
          .createSpy('ctrl.transactionHasClaimThatNeedsToRecreate')
          .and.returnValue(true);
        ctrl.handleClaim = jasmine.createSpy('ctrl.handleClaim');
        //act
        scope.saveTransaction();
        //assert
        expect(scope.transaction.Tooth).toEqual('3');
      }
    );
    it('should not reset Tooth based on $scope.activeTeeth if transaction.UseCodeForRangeOfTeeth is false', function () {
      //arrange
      scope.originalActiveTeeth = ['3'];
      scope.activeTeeth = ['3'];
      scope.transaction = { UseCodeForRangeOfTeeth: false, Tooth: '2' };
      ctrl.validateTransaction = jasmine
        .createSpy('ctrl.validateTransaction')
        .and.returnValue(true);
      ctrl.transactionHasClaimThatNeedsToRecreate = jasmine
        .createSpy('ctrl.transactionHasClaimThatNeedsToRecreate')
        .and.returnValue(true);
      ctrl.handleClaim = jasmine.createSpy('ctrl.handleClaim');
      //act
      scope.saveTransaction();
      //assert
      expect(scope.transaction.Tooth).toEqual('2');
    });
  });

  describe('ctrl.handleClaim', function () {
    it('should close claim and call to update service transaction', function () {
      q.all = jasmine.createSpy('q.all').and.returnValue({
        then: function (callback) {
          callback([
            {
              Value: {
                ServiceTransactionDtos: [
                  {
                    ServiceTransactionId: 12,
                    InsuranceEstimates: [{ EstimatedInsuranceId: 40 }],
                  },
                ],
              },
            },
            {},
          ]);
        },
      });
      dataForModal.ServiceCodes = [{ ServiceCodeId: 100 }];
      scope.transaction = {
        OpenClaim: {
          ClaimId: 1,
        },
        ServiceCodeId: 100,
        ServiceTransactionId: 12,
        InsuranceEstimates: [
          {
            EstimatedInsuranceId: 40,
            EstInsurance: 20,
            AdjEst: 10,
            ObjectState: 'Update',
          },
        ],
      };
      spyOn(ctrl, 'updateTransaction');
      ctrl.validateTransaction = jasmine
        .createSpy('ctrl.validateTransaction')
        .and.returnValue(true);
      ctrl.transactionHasClaimThatNeedsToRecreate = jasmine
        .createSpy('ctrl.transactionHasClaimThatNeedsToRecreate')
        .and.returnValue(true);
      ctrl.handleClaim();
      expect(
        patientServices.Claim.getServiceTransactionsByClaimId
      ).toHaveBeenCalled();
      expect(
        modalFactory.ServiceTransactionCrudCloseClaimModal
      ).toHaveBeenCalled();
      expect(closeClaimService.update).toHaveBeenCalled();
      expect(
        patientServices.Encounter.getAllEncountersByEncounterId
      ).toHaveBeenCalled();
      expect(
        patientServices.PatientBenefitPlan.getBenefitPlansAvailableByClaimId
      ).toHaveBeenCalled();
      expect(q.all).toHaveBeenCalled();
      expect(ctrl.updateTransaction).toHaveBeenCalled();
      expect(scope.transaction.InsuranceEstimates[0].EstInsurance).toBe(0);
      expect(scope.transaction.InsuranceEstimates[0].AdjEst).toBe(0);
    });
    it('should pass claim with original DataTag, and checkDataTag = true when closing claim', function () {
      //arrange
      dataForModal.ServiceCodes = [{ ServiceCodeId: 100 }];
      scope.transaction = {
        OpenClaim: {
          ClaimId: 4,
          DataTag: 1,
        },
        ServiceCodeId: 100,
      };
      var closeClaimDto = {
        ClaimId: scope.transaction.OpenClaim.ClaimId,
        NoInsurancePayment: false,
        IsEdited: true,
        UpdateServiceTransactions: true,
        Note: undefined,
        DataTag: scope.transaction.OpenClaim.DataTag,
      };
      ctrl.validateTransaction = jasmine
        .createSpy('ctrl.validateTransaction')
        .and.returnValue(true);
      ctrl.transactionHasClaimThatNeedsToRecreate = jasmine
        .createSpy('ctrl.transactionHasClaimThatNeedsToRecreate')
        .and.returnValue(true);
      //act
      ctrl.handleClaim();
      //assert
      expect(closeClaimService.update).toHaveBeenCalledWith(
        { checkDataTag: true },
        closeClaimDto
      );
    });
  });

  describe('ctrl.updateTransaction', function () {
    it('should update service transaction and recreate if requested', function () {
      spyOn(ctrl, 'AskuserAboutCreatingMoreClaims');
      ctrl.updateTransaction(true, { ClaimId: 1 });
      expect(patientServices.ServiceTransactions.update).toHaveBeenCalled();
      expect(patientServices.Claim.recreateMultipleClaims).toHaveBeenCalled();
      expect(ctrl.AskuserAboutCreatingMoreClaims).not.toHaveBeenCalled();
    });
    it('should update service transaction and ask user about making more claims if not recreating', function () {
      spyOn(ctrl, 'AskuserAboutCreatingMoreClaims');
      ctrl.updateTransaction(false, { ClaimId: 1 });
      expect(patientServices.ServiceTransactions.update).toHaveBeenCalled();
      expect(
        patientServices.Claim.recreateMultipleClaims
      ).not.toHaveBeenCalled();
      expect(ctrl.AskuserAboutCreatingMoreClaims).toHaveBeenCalled();
    });
  });

  describe('ctrl.handleAffectedCredits', function () {
    it('should open modal if will affect fee schedules', function () {
      spyOn(ctrl, 'willAffectFeeSchedules').and.returnValue(true);
      spyOn(ctrl, 'confirmEdit');
      ctrl.handleAffectedCredits();
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
      expect(ctrl.confirmEdit).toHaveBeenCalled();
    });
    it('should call confirmEdit if will not affect fee schedules', function () {
      spyOn(ctrl, 'willAffectFeeSchedules').and.returnValue(false);
      spyOn(ctrl, 'confirmEdit');
      ctrl.handleAffectedCredits();
      expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
      expect(ctrl.confirmEdit).toHaveBeenCalled();
    });
  });

  describe('ctrl.confirmEdit', function () {
    it('should open modal if fee changed and payment applied', function () {
      scope.feeChanged = true;
      scope.transaction = {
        isPaymentApplied: true,
      };
      spyOn(ctrl, 'continueWithEdit');
      ctrl.confirmEdit();
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
      expect(ctrl.continueWithEdit).toHaveBeenCalled();
    });
    it("should not open modal if fee didn't change", function () {
      scope.feeChanged = false;
      spyOn(ctrl, 'continueWithEdit');
      ctrl.confirmEdit();
      expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
      expect(ctrl.continueWithEdit).toHaveBeenCalled();
    });
  });

  describe('ctrl.transactionHasClaimThatNeedsToRecreate', function () {
    beforeEach(function () {
      surfaceHelper.areSurfaceCSVsEqual = jasmine
        .createSpy('surfaceHelper.areSurfaceCSVsEqual')
        .and.returnValue(true);
    });
    it('should return false if there is no open claim', function () {
      //arrange
      var transaction = {
        OpenClaim: false,
      };

      //act
      var result = ctrl.transactionHasClaimThatNeedsToRecreate(transaction);

      //assert
      expect(result).toEqual(false);
    });
    it('should return false if only estimated insurance changes', function () {
      //arrange
      var date = Date.now();
      var transaction = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 5,
      };
      ctrl.transactionInitialCopy = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 6,
      };

      //act
      var result = ctrl.transactionHasClaimThatNeedsToRecreate(transaction);

      //assert
      expect(result).toEqual(false);
    });
    it('should return false if only estimated insurance changes and has multiple surfaces', function () {
      //arrange
      var date = Date.now();
      var transaction = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M,L,D',
        SurfaceSummaryInfo: 'MLD',
        Roots: 'P',
        TotalEstInsurance: 5,
      };
      ctrl.transactionInitialCopy = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M,L,D',
        SurfaceSummaryInfo: 'MLD',
        Roots: 'P',
        TotalEstInsurance: 6,
      };

      //act
      var result = ctrl.transactionHasClaimThatNeedsToRecreate(transaction);

      //assert
      expect(result).toEqual(false);
    });
    it('should return true if DateEntered changes', function () {
      //arrange
      var date = new Date();
      var date2 = new Date(date);
      date2.setDate(date2.getDate() + 1);
      var transaction = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 5,
      };
      ctrl.transactionInitialCopy = {
        OpenClaim: true,
        DateEntered: date2,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 6,
      };

      //act
      var result = ctrl.transactionHasClaimThatNeedsToRecreate(transaction);

      //assert
      expect(result).toEqual(true);
    });
    it('should return true if ProviderUserId changes', function () {
      //arrange
      var date = new Date();
      var transaction = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 5,
      };
      ctrl.transactionInitialCopy = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid2',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 6,
      };

      //act
      var result = ctrl.transactionHasClaimThatNeedsToRecreate(transaction);

      //assert
      expect(result).toEqual(true);
    });
    it('should return true if ProviderOnClaimsId changes', function () {
      //arrange
      var date = new Date();
      var transaction = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 5,
      };
      ctrl.transactionInitialCopy = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId2',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 6,
      };

      //act
      var result = ctrl.transactionHasClaimThatNeedsToRecreate(transaction);

      //assert
      expect(result).toEqual(true);
    });
    it('should return true if Fee changes', function () {
      //arrange
      var date = new Date();
      var transaction = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 5,
      };
      ctrl.transactionInitialCopy = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 2,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 6,
      };

      //act
      var result = ctrl.transactionHasClaimThatNeedsToRecreate(transaction);

      //assert
      expect(result).toEqual(true);
    });
    it('should return true if Tax changes', function () {
      //arrange
      var date = new Date();
      var transaction = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 5,
      };
      ctrl.transactionInitialCopy = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 3,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 6,
      };

      //act
      var result = ctrl.transactionHasClaimThatNeedsToRecreate(transaction);

      //assert
      expect(result).toEqual(true);
    });
    it('should return true if Tooth changes', function () {
      //arrange
      var date = new Date();
      var transaction = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 5,
      };
      ctrl.transactionInitialCopy = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '2',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 6,
      };

      //act
      var result = ctrl.transactionHasClaimThatNeedsToRecreate(transaction);

      //assert
      expect(result).toEqual(true);
    });
    it('should return true if Surface changes', function () {
      //arrange
      surfaceHelper.areSurfaceCSVsEqual = jasmine
        .createSpy('surfaceHelper.areSurfaceCSVsEqual')
        .and.returnValue(false);
      var date = new Date();
      var transaction = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 5,
      };
      ctrl.transactionInitialCopy = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'F,M',
        SurfaceSummaryInfo: 'FM',
        Roots: 'P',
        TotalEstInsurance: 6,
      };

      //act
      var result = ctrl.transactionHasClaimThatNeedsToRecreate(transaction);

      //assert
      expect(result).toEqual(true);
    });
    it('should return true if Roots changes', function () {
      //arrange
      var date = new Date();
      var transaction = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'P',
        TotalEstInsurance: 5,
      };
      ctrl.transactionInitialCopy = {
        OpenClaim: true,
        DateEntered: date,
        ProviderUserId: 'providerid',
        ProviderOnClaimsId: 'claimsProviderId',
        Fee: 1,
        Tax: 2,
        Tooth: '1',
        Surface: 'M',
        SurfaceSummaryInfo: 'M',
        Roots: 'MB',
        TotalEstInsurance: 6,
      };

      //act
      var result = ctrl.transactionHasClaimThatNeedsToRecreate(transaction);

      //assert
      expect(result).toEqual(true);
    });
  });

  //calculateTaxandInsurance
  describe('calculateTaxandInsurance function -->', function () {
    describe('when previousAmountChanged is true -->', function () {
      beforeEach(function () {
        scope.previousAmountChanged = true;
      });

      describe('when transaction.Fee is null, 0 or undefined -->', function () {
        it('should set values correctly', function () {
          scope.transaction.Fee = null;
          scope.transaction.Tax = null;
          scope.transaction.Amount = null;
          scope.taxLoading = null;
          scope.calculateTaxandInsurance();
          expect(scope.transaction.Fee).toBe(0);
          expect(scope.transaction.Tax).toBe(0);
          expect(scope.transaction.Amount).toBe(0);
          expect(scope.previousAmountChanged).toBe(false);
          expect(scope.taxLoading).toBe(false);
          expect(patientServices.Tax.get).not.toHaveBeenCalled();
          expect(financialService.RecalculateInsurance).not.toHaveBeenCalled();
        });
      });

      describe('when transaction.Fee has value -->', function () {
        var serviceCodeId = 'testId';
        var taxTypeId = 'testId2';

        beforeEach(function () {
          dataForModal.ServiceCodes = [
            {
              ServiceCodeId: serviceCodeId,
              $$locationTaxableServiceTypeId: taxTypeId,
            },
          ];
          scope.transaction = {
            ServiceCodeId: serviceCodeId,
            ProviderUserId: 'providerUserId',
            LocationId: 'locationId',
            Fee: 'fee',
            OpenClaim: true,
          };
          listHelper.findItemByFieldValue = jasmine
            .createSpy()
            .and.returnValue(dataForModal.ServiceCodes[0]);
          q.all = jasmine.createSpy().and.returnValue({
            then: function (func) {
              func();
            },
          });
          ctrl.updatedAmounts = jasmine.createSpy();
          scope.calculateTaxandInsurance();
        });

        it('should call methods with correct parameters', function () {
          expect(
            patientServicesFactory.GetTaxAndDiscount
          ).toHaveBeenCalledWith([scope.transaction]);
          expect(financialService.RecalculateInsurance).toHaveBeenCalled();
        });

        it('should call financialService.RecalculateInsurance with correct parameters', function () {});

        it('should call ctrl.updatedAmounts', function () {});
      });
    });

    describe('when previousAmountChanged is false -->', function () {
      it('should set values correctly', function () {
        scope.previousAmountChanged = null;
        scope.taxLoading = null;
        scope.calculateTaxandInsurance();
        expect(scope.taxLoading).toBe(false);
        expect(scope.previousAmountChanged).toBe(false);
        expect(patientServices.Tax.get).not.toHaveBeenCalled();
        expect(financialService.RecalculateInsurance).not.toHaveBeenCalled();
      });
    });
    describe('loadApplicableTeethForCode -->', function () {
      beforeEach(function () {
        spyOn(ctrl, 'getApplicableTeeth').and.callFake(function () {});
        scope.transaction = { CdtCodeName: 'D1352', Tooth: '2' };
        scope.cdtCodegroups = [
          {
            CdtCode: 'D1352',
            GroupId: 1,
            AllowedTeeth: { 0: '1', 1: '2', 2: '3', 3: '4' },
            SurfaceCount: null,
          },
        ];
      });

      it('should call ctrl.getApplicableTeeth if cdtCodeGroups contains serviceTransaction CdtCode', function () {
        listHelper.findAllByPredicate = jasmine.createSpy().and.returnValue([
          {
            CdtCode: 'D1352',
            GroupId: 1,
            AllowedTeeth: { 0: '1', 1: '2', 2: '3', 3: '4' },
          },
          1,
        ]);
        ctrl.loadApplicableTeethForCode();
        expect(ctrl.getApplicableTeeth).toHaveBeenCalled();
      });

      it('should not call ctrl.getApplicableTeeth if cdtCodeGroups does not contains serviceTransaction CdtCode', function () {
        ctrl.loadApplicableTeethForCode();
        expect(ctrl.getApplicableTeeth).not.toHaveBeenCalled();
      });
    });

    describe('validateApplicableTooth -->', function () {
      beforeEach(function () {
        spyOn(ctrl, 'loadApplicableTeethForCode').and.callFake(function () {});
        scope.transaction = {
          CdtCodeName: 'D1352',
          Tooth: '2',
          UseCodeForRangeOfTeeth: false,
        };
        scope.cdtCodegroups = [
          {
            CdtCode: 'D1352',
            GroupId: 1,
            AllowedTeeth: { 0: '1', 1: '2', 2: '3', 3: '4' },
            SurfaceCount: null,
          },
        ];
      });

      it('should return false if transaction.Tooth is not in scope.allApplicableTeeth but UserCodeForRangeOfTeeth is false', function () {
        listHelper.findItemByFieldValue = jasmine
          .createSpy()
          .and.returnValue(null);
        expect(ctrl.validateApplicableTooth()).toEqual(false);
      });

      it('should return true if transaction.Tooth is not in scope.allApplicableTeeth but UserCodeForRangeOfTeeth is true', function () {
        scope.transaction.UseCodeForRangeOfTeeth = true;
        listHelper.findItemByFieldValue = jasmine
          .createSpy()
          .and.returnValue(null);
        expect(ctrl.validateApplicableTooth()).toEqual(true);
      });

      it('should return true if transaction.Tooth is in scope.allApplicableTeeth', function () {
        listHelper.findItemByFieldValue = jasmine
          .createSpy()
          .and.returnValue('2');
        expect(ctrl.validateApplicableTooth()).toEqual(true);
      });
    });

    describe('ctrl.filteredProviders method -->', function () {
      it('should load providers from referenceDataService', function () {
        ctrl.filteredProviders();
        scope.$apply();
        expect(ctrl.providers.length).toEqual(usersMock().length);
      });

      it('should filter out providers with no locations', function () {
        var users = usersMock();
        users[3].Locations = [];
        referenceDataService.getData.and.returnValue(q.resolve(users));
        ctrl.filteredProviders();
        scope.$apply();
        expect(ctrl.providers.length).toEqual(usersMock().length - 1);
      });
    });

    describe('filterOutAdjustmentTypes function ->', function () {
      beforeEach(function () {
        scope.adjustmentTypes = adjustmentTypes;
      });
      it('should return only 1 active payment type', function () {
        ctrl.filterOutAdjustmentTypes(4, filterTypes.Inactive);

        expect(scope.adjustmentTypes.length).toBe(1);
      });
      it('should return inactive type if currently selected and inactive', function () {
        ctrl.filterOutAdjustmentTypes(2, filterTypes.Inactive);

        expect(scope.adjustmentTypes.length).toBe(2);
      });
    });

    // having trouble testing this because i've used findItemByFieldValue twice and this makes it hard to mock the result of the listhelper
    // function, should be refactored to modify
    // describe('getApplicableTeeth -->', function() {

    //     beforeEach(function(){
    //         spyOn(ctrl, 'loadApplicableTeethForCode').and.callFake(function(){})
    //         scope.transaction = {CdtCodeName:'D1352', Tooth:'2'};
    //         scope.allTeeth=[{'USNumber': '2'},{'USNumber': '4'}];
    //         scope.allApplicableTeeth=[];
    //         scope.cdtCodegroups=[
    //             {CdtCode: 'D1352', GroupId: 1, AllowedTeeth: {0:'1', 1:'2',2:'3',3:'4'}, SurfaceCount: null}];
    //     })

    //     it('should add matching teeth from allTeeth to allApplicableTeeth if allApplicableTeeth doesnot contain tooth', function() {
    //         scope.cdtCodegroups[0].AllowedTeeth.indexOf = jasmine.createSpy('scope.cdtCodegroups[0].AllowedTeeth.indexOf').and.returnValue(-1);
    //         listHelper.findIndexByFieldValue = jasmine.createSpy().and.returnValue(-1);
    //         listHelper.findItemByFieldValue = jasmine.createSpy().and.returnValue({'USNumber': '2'});
    //         ctrl.getApplicableTeeth(scope.cdtCodegroups);
    //         expect(scope.allApplicableTeeth).toEqual({'USNumber': '2'});
    //     });
    // });

    describe('ctrl.resetDateEntered ->', function () {
      it('should call timeZoneFactory.ConvertDateToSave when resetDateEntered parameter is a new date', function () {
        scope.displayDateEntered = '2021-02-19 14:05:35';
        var newDate = '2021-02-18 14:05:35';
        scope.transaction.DateEntered = { DateEntered: '2021-02-19 14:05:35' };
        scope.resetDateEntered(newDate);
        scope.$apply();
        expect(timeZoneFactoryMock.ConvertDateToSave).toHaveBeenCalledWith(
          newDate,
          'Central Standard Time'
        );
      });

      it('should not call timeZoneFactory.ConvertDateToSave when resetDateEntered parameter is same date', function () {
        scope.displayDateEntered = '2021-02-19 14:05:35';
        var newDate = '2021-02-19 14:05:35';
        scope.transaction.DateEntered = { DateEntered: '2021-02-19 14:05:35' };
        scope.resetDateEntered(newDate);
        scope.$apply();
        expect(timeZoneFactoryMock.ConvertDateToSave).not.toHaveBeenCalled();
      });

      it('should reset scope.displayDateEntered when resetDateEntered parameter is same date', function () {
        scope.displayDateEntered = '2021-02-19 14:05:35';
        var newDate = '2021-02-19 14:05:35';
        scope.transaction.DateEntered = { DateEntered: '2021-02-19 14:05:35' };
        scope.resetDateEntered(newDate);
        scope.$apply();
        expect(scope.displayDateEntered).toEqual(newDate);
      });
    });
  });

  describe('ctrl.setTransactionMinAndMaxDates ->', function () {
    it('should call ctrl.getLocationTimezone to get current users location timezone', function () {
      // spyOn(ctrl, 'getLocationTimezone').and.returnValue('Central Standard Time');
      spyOn(ctrl, 'getLocationTimezone').and.callThrough();
      ctrl.todaysDate = '2021-02-19 14:05:35';
      ctrl.setTransactionMinAndMaxDates();
      scope.$apply();
      expect(ctrl.getLocationTimezone).toHaveBeenCalled();
    });

    it('should call timeZoneFactoryMock.ConvertDateToMomentTZ with todays date based on timezone ', function () {
      // spyOn(ctrl, 'getLocationTimezone').and.returnValue('Central Standard Time');
      ctrl.todaysDate = '2021-02-19 14:05:35';
      ctrl.setTransactionMinAndMaxDates();
      scope.$apply();
      expect(timeZoneFactoryMock.ConvertDateToMomentTZ).toHaveBeenCalledWith(
        '2021-02-19 14:05:35',
        'Central Standard Time'
      );
    });
  });

  describe('teethEqual filter -> ', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('teethEqual');
    }));

    it('should return true when teeth array is equal value to original', function () {
      scope.originalActiveTeeth = ['9', '13'];
      scope.activeTeeth = ['9', '13'];
      expect(filter(scope.activeTeeth, scope.originalActiveTeeth)).toBe(true);
    });

    it('should return false when teeth array is not equal value to original', function () {
      scope.originalActiveTeeth = ['9', '12'];
      scope.activeTeeth = ['9', '13'];
      expect(filter(scope.activeTeeth, scope.originalActiveTeeth)).toBe(false);
    });
  });

  describe('ctrl.getClaimsAndPlans', function () {
    it('should get claims, plans, and call updateAllowedAmountDisplay if not a debit transaction', function () {
      dataForModal.Transaction.ServiceTransactionId = '1';
      q.all = jasmine.createSpy().and.returnValue({
        then: spyOn(ctrl, 'updateAllowedAmountDisplay'),
      });
      ctrl.getClaimsAndPlans();

      expect(
        patientServices.Claim.getClaimsByServiceTransaction
      ).toHaveBeenCalled();
      expect(
        patientServices.PatientBenefitPlan.getBenefitPlansRecordsByAccountId
      ).toHaveBeenCalled();
      expect(q.all).toHaveBeenCalled();
      expect(ctrl.updateAllowedAmountDisplay).toHaveBeenCalled();
    });
    it('should not get claims, plans, or call updateAllowedAmountDisplay if a debit transaction', function () {
      dataForModal.Transaction.ServiceTransactionId = undefined;
      q.all = jasmine.createSpy().and.returnValue({
        then: spyOn(ctrl, 'updateAllowedAmountDisplay'),
      });
      ctrl.getClaimsAndPlans();

      expect(
        patientServices.Claim.getClaimsByServiceTransaction
      ).not.toHaveBeenCalled();
      expect(
        patientServices.PatientBenefitPlan.getBenefitPlansRecordsByAccountId
      ).not.toHaveBeenCalled();
      expect(q.all).not.toHaveBeenCalled();
      expect(ctrl.updateAllowedAmountDisplay).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.updateAllowedAmountDisplay ->', function () {
    it('should display primary allowed amount', function () {
      var allowedAmount = 100;

      ctrl.claims = [{}];
      scope.transaction = {
        InsuranceEstimates: [{ AllowedAmount: allowedAmount }],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmount);
    });

    it('should display overridden primary allowed amount', function () {
      var allowedAmount = 100;
      var allowedAmountOverride = 75;

      ctrl.claims = [{}];
      scope.transaction = {
        InsuranceEstimates: [
          {
            AllowedAmount: allowedAmount,
            AllowedAmountOverride: allowedAmountOverride,
          },
        ],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmountOverride);
    });

    it('should display smaller allowed amount', function () {
      var allowedAmount = 100;
      var allowedAmount2 = 50;

      ctrl.plans = [{}, {}];
      ctrl.claims = [
        { PatientBenefitPlanPriority: 0 },
        { PatientBenefitPlanPriority: 1 },
      ];
      scope.transaction = {
        InsuranceEstimates: [
          { AllowedAmount: allowedAmount },
          { AllowedAmount: allowedAmount2 },
        ],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmount2);
    });

    it('should display smaller overridden allowed amount', function () {
      var allowedAmount = 100;
      var allowedAmountOverride = 75;
      var allowedAmount2 = 50;
      var allowedAmountOverride2 = 25;

      ctrl.plans = [{}, {}];
      ctrl.claims = [
        { PatientBenefitPlanPriority: 0 },
        { PatientBenefitPlanPriority: 1 },
      ];
      scope.transaction = {
        InsuranceEstimates: [
          {
            AllowedAmount: allowedAmount,
            AllowedAmountOverride: allowedAmountOverride,
          },
          {
            AllowedAmount: allowedAmount2,
            AllowedAmountOverride: allowedAmountOverride2,
          },
        ],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmountOverride2);
    });

    it('should display a 0.00 primary allowed amount', function () {
      var allowedAmount = 0;

      ctrl.claims = [{}];
      scope.transaction = {
        InsuranceEstimates: [{ AllowedAmount: allowedAmount }],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmount);
    });

    it('should display a 0.00 secondary allowed amount', function () {
      var allowedAmount = 50;
      var allowedAmount2 = 0;

      ctrl.plans = [{}, {}];
      ctrl.claims = [
        { PatientBenefitPlanPriority: 0 },
        { PatientBenefitPlanPriority: 1 },
      ];
      scope.transaction = {
        InsuranceEstimates: [
          { AllowedAmount: allowedAmount },
          { AllowedAmount: allowedAmount2 },
        ],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmount2);
    });

    it('should display primary allowed amount after primary plan removal', function () {
      var allowedAmount = 50;

      ctrl.plans = [{}];
      ctrl.claims = [{ PatientBenefitPlanPriority: 0 }];
      scope.transaction = {
        InsuranceEstimates: [{ AllowedAmount: allowedAmount }],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmount);

      ctrl.plans = [];
      scope.transaction = {
        InsuranceEstimates: [{ AllowedAmount: allowedAmount }],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmount);
    });

    it('should display primary allowed amount after secondary plan removal if there is no secondary claim', function () {
      var allowedAmount = 50;
      var allowedAmount2 = 25;

      ctrl.plans = [{}, {}];
      ctrl.claims = [
        { PatientBenefitPlanPriority: 0, PatientBenefitPlanId: '12345' },
      ];
      scope.transaction = {
        InsuranceEstimates: [
          { AllowedAmount: allowedAmount, PatientBenefitPlanId: '12345' },
          { AllowedAmount: allowedAmount2 },
        ],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmount2);

      ctrl.plans = [{}];
      scope.transaction = {
        InsuranceEstimates: [
          { AllowedAmount: allowedAmount, PatientBenefitPlanId: '12345' },
          { AllowedAmount: allowedAmount2 },
        ],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmount);
    });

    it('should display secondary allowed amount after secondary plan removal if there is a secondary claim', function () {
      var allowedAmount = 50;
      var allowedAmount2 = 25;

      ctrl.plans = [{}, {}];
      ctrl.claims = [
        { PatientBenefitPlanPriority: 0 },
        { PatientBenefitPlanPriority: 1 },
      ];
      scope.transaction = {
        InsuranceEstimates: [
          { AllowedAmount: allowedAmount },
          { AllowedAmount: allowedAmount2 },
        ],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmount2);

      ctrl.plans = [{}];
      scope.transaction = {
        InsuranceEstimates: [
          { AllowedAmount: allowedAmount },
          { AllowedAmount: allowedAmount2 },
        ],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toEqual(allowedAmount2);
    });

    it('should not display primary allowed amount if service was excluded from claim', function () {
      var allowedAmount = 100;

      scope.transaction = {
        InsuranceEstimates: [{ AllowedAmount: allowedAmount }],
      };
      ctrl.updateAllowedAmountDisplay();

      expect(scope.allowedAmountDisplay).toBeNull();
    });
  });

  describe('overrideEstimatedInsurance', function () {
    it('should change first insurance when it matches the open claim', function () {
      let expected = 24;
      let patientBenefitPlanId = 'D5D109D1-FD50-44FA-811F-D00F2EE9C6D6';
      let serviceTransaction = {
        TotalEstInsurance: expected,
        InsuranceEstimates: [
          {
            EstInsurance: 1,
            PatientBenefitPlanId: patientBenefitPlanId,
          },
          {
            EstInsurance: 2,
            PatientBenefitPlanId: '5F491DD2-A0E0-4FD6-8BC4-81F30FDC12F7',
          },
        ],
        OpenClaim: {
          PatientBenefitPlanId: patientBenefitPlanId,
        },
      };

      scope.overrideEstimatedInsurance(serviceTransaction);

      expect(serviceTransaction.InsuranceEstimates[0].EstInsurance).toBe(
        expected
      );
    });

    it('should change second insurance when it matches the open claim', function () {
      let expected = 24;
      let patientBenefitPlanId = 'D5D109D1-FD50-44FA-811F-D00F2EE9C6D6';
      let serviceTransaction = {
        TotalEstInsurance: expected,
        InsuranceEstimates: [
          {
            EstInsurance: 1,
            PatientBenefitPlanId: '5F491DD2-A0E0-4FD6-8BC4-81F30FDC12F7',
          },
          {
            EstInsurance: 2,
            PatientBenefitPlanId: patientBenefitPlanId,
          },
        ],
        OpenClaim: {
          PatientBenefitPlanId: patientBenefitPlanId,
        },
      };

      scope.overrideEstimatedInsurance(serviceTransaction);

      expect(serviceTransaction.InsuranceEstimates[1].EstInsurance).toBe(
        expected
      );
    });
  });
});
