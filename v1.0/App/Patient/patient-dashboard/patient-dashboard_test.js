import { of } from 'rxjs';

describe('patient-dashboard -> ', function () {
  var scope,
    routeParams,
    ctrl,
    localize,
    location,
    patientServices,
    toastrFactory,
    referenceDataService,
    fileUploadFactory;
  var userServices,
    shareData,
    usersFactory,
    patientValidationFactory,
    imagingService,
    appointmentViewLoadingService,
    appointmentViewVisibleService,
    practiceSettingsService,
    patientCommunicationCenterService;
  // #region mocks
  var _patientDemographicsService_;
  var imagingProviderFactory;

  var personFactory, patSharedServices;
  beforeEach(
    module('Soar.Patient', function ($provide) {
      personFactory = {
        getPatientAlerts: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        PatientAlerts: null,
        PatientMedicalHistoryAlerts: null,
        SetPatientAlerts: jasmine.createSpy(),
        SetMedicalHistoryAlerts: jasmine.createSpy(),
        ActiveHipaaAuthorizationSummaries: null,
        SetActiveHipaaAuthorizationSummaries: jasmine.createSpy(),
        ActivePatient: null,
        SetActivePatient: jasmine.createSpy(),
        AccountOverview: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('PersonFactory', personFactory);

      imagingService = {};
      imagingProviderFactory = {
        resolve: jasmine.createSpy().and.returnValue(imagingService),
      };
      $provide.value('imagingProviderFactory', imagingProviderFactory);

      patSharedServices = {
        Format: {
          PatientName: jasmine.createSpy(),
        },
      };
      $provide.value('PatSharedServices', patSharedServices);

      practiceSettingsService = {
        get: jasmine.createSpy().and.returnValue(of({
          DefaultTimeIncrement: 15
        }))
      }
      
      $provide.value(
        'PracticeSettingsService',
        practiceSettingsService,
      );
    })
  );

  var currentPatient = {};
  var phones = {};
  var mockPatient = {
    Value: {
      PatientId: '1',
      PatientCode: 'PENOP1',
      FirstName: 'Opus',
      LastName: 'Penguin',
      DateOfBirth: '06/01/1981',
      Sex: 'Male',
      IsPatient: true,
      PreferredName: 'Opus',
      AddressLine1: '123 Main Street',
      AddressLine2: 'Apt 5',
      City: 'Bloom County',
      State: 'WA',
      ZipCode: '98683',
      EmailAddress: 'opus@penguin.com',
      EmailAddress2: 'opus2@penguin.com',
      PrimaryPhoneNumber: '1234567890',
      SecondaryPhoneNumber: '0987654321',
      PersonAccount: '1',
    },
  };

  var mockStateList = [
    {
      StateName: 'Alabama',
      StateId: 'AL',
    },
    {
      StateName: 'Alaska',
      StateId: 'AK',
    },
    {
      StateName: 'Arizona',
      StateId: 'AZ',
    },
    {
      StateName: 'Arkansas',
      StateId: 'AR',
    },
  ];

  mockStateList.getStateName = jasmine
    .createSpy()
    .and.returnValue(mockStateList[1].StateName);

  var mockStaticData = {
    States: jasmine.createSpy().and.returnValue(mockStateList),
  };

  var mockPhonesResponse = {
    Value: [
      {
        ContactId: '1',
        PhoneNumber: '1111111111',
        ObjectState: 'Successful',
        Type: 'Home',
        invalidPhoneNumber: false,
        invalidType: false,
      },
      {
        ContactId: '2',
        PhoneNumber: '2222222222',
        ObjectState: 'Successful',
        Type: 'Home',
        invalidPhoneNumber: false,
        invalidType: false,
      },
      {
        ContactId: '3',
        PhoneNumber: '3333333333',
        ObjectState: 'Successful',
        Type: 'Home',
        invalidPhoneNumber: false,
        invalidType: false,
      },
    ],
  };

  var mockPerson = {
    Value: {
      Profile: mockPatient.Value,
      Phones: mockPhonesResponse.Value,
    },
    $promise: {
      then: function () {},
    },
  };

  var modalInstance = {
    close: jasmine.createSpy('modalInstance.close').and.returnValue({}),
    dismiss: jasmine.createSpy('modalInstance.dismiss'),
    result: {
      then: jasmine.createSpy('modalInstance.result.then'),
    },
  };

  userServices = { Users: { get: jasmine.createSpy() } };

  // mock for boundObjectFactory
  var mockBoundObjectFactory = {
    Create: jasmine.createSpy().and.returnValue({
      AfterDeleteSuccess: null,
      AfterSaveError: null,
      AfterSaveSuccess: null,
      Data: {},
      Deleting: false,
      IdField: 'ServiceCodeId',
      Loading: true,
      Name: 'ServiceCode',
      Saving: false,
      Valid: true,
      Load: jasmine.any(Function),
      Save: jasmine.createSpy().and.returnValue(''),
      Validate: jasmine.createSpy().and.returnValue(''),
      CheckDuplicate: jasmine.createSpy().and.returnValue(''),
    }),
  };

  // #endregion Mock values

  // #region before each
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  // #region before each

  // #region PatientDashboardController Unit Tests
  describe('PatientDashboardController when user is authorized -> ', function () {
    // Create spies for services
    beforeEach(
      module('Soar.Patient', function ($provide) {
        toastrFactory = {};
        toastrFactory.error = jasmine.createSpy();
        toastrFactory.success = jasmine.createSpy();
        $provide.value('toastrFactory', toastrFactory);

        $provide.value('UserServices', userServices);

        patientValidationFactory = {
          SetPatientData: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy(),
          }),
        };
        $provide.value('PatientValidationFactory', patientValidationFactory);

        imagingService = {};
        imagingProviderFactory = {
          resolve: jasmine.createSpy().and.returnValue(imagingService),
        };
        $provide.value('imagingProviderFactory', imagingProviderFactory);

        shareData = {};
        $provide.value('ShareData', shareData);

        patientServices = {
          Referrals: {
            GetReferredPatients: jasmine.createSpy(),
          },
          Account: {
            getAllAccountMembersByAccountId: jasmine.createSpy(),
            getAccountMembersDetailByAccountId: jasmine.createSpy(),
          },
          HipaaAuthorization: {
            getSummariesByPatientId: jasmine
              .createSpy()
              .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
          },
        };
        $provide.value('PatientServices', patientServices);

        referenceDataService = {
          getData: jasmine.createSpy(),
          entityNames: {
            locations: 'locations',
          },
        };

        $provide.value('referenceDataService', referenceDataService);

        fileUploadFactory = {
          CreatePatientDirectory: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy().and.returnValue(),
          }),
        };
        $provide.value('FileUploadFactory', fileUploadFactory);

        appointmentViewVisibleService = {
          registerObserver: jasmine.createSpy(),
          clearObserver: jasmine.createSpy(),
          setAppointmentViewVisible: jasmine.createSpy(),
          setSecondaryAppointmentViewVisible: jasmine.createSpy(),
        };
        $provide.value(
          'AppointmentViewVisibleService',
          appointmentViewVisibleService
        );

        appointmentViewLoadingService = {};
        $provide.value(
          'AppointmentViewLoadingService',
          appointmentViewLoadingService
        );

        patientCommunicationCenterService = {};

        $provide.value(
          'PatientCommunicationCenterService',
          patientCommunicationCenterService
        );

        $provide.value('serviceCodes', []);
      })
    );

    //#region Mock service
    beforeEach(
      module('Soar.Patient', function ($provide) {
        _patientDemographicsService_ = {
          get: jasmine.createSpy().and.returnValue(mockPatient),
          update: jasmine.createSpy(),
        };
        $provide.value(
          'PatientDemographicsService',
          _patientDemographicsService_
        );
      })
    );
    //#endregion Mock service

    beforeEach(inject(function (
      $route,
      $rootScope,
      $location,
      $routeParams,
      $injector,
      $controller,
      $q
    ) {
      localize = $injector.get('localize');
      location = $location;

      referenceDataService.getData.and.callFake(function () {
        return $q.resolve([]);
      });

      //mock for usersFactory
      usersFactory = {
        Users: jasmine
          .createSpy('usersFactory.Users')
          .and.callFake(function () {
            var deferred = $q.defer();
            deferred.resolve(1);
            return {
              result: deferred.promise,
              then: function () {},
            };
          }),
      };

      var patientBenefitPlansFactory = {
        Users: jasmine
          .createSpy('patientBenefitPlansFactory.BenefitPlans')
          .and.callFake(function () {
            var deferred = $q.defer();
            deferred.resolve(1);
            return {
              result: deferred.promise,
              then: function () {},
            };
          }),
        PatientBenefitPlansForAccount: jasmine
          .createSpy('mockPatient.patientId')
          .and.callFake(function () {
            var deferred = $q.defer();
            deferred.resolve(1);
            return {
              result: deferred.promise,
              then: function () {},
            };
          }),
      };

      currentPatient = mockPatient;
      phones = mockPhonesResponse;
      routeParams = $routeParams;
      routeParams.patientId = 1;
      scope = $rootScope.$new();
      scope.person = mockPerson.Value;
      ctrl = $controller('PatientDashboardController', {
        $scope: scope,
        patSecurityService: _authPatSecurityService_,
        UsersFactory: usersFactory,
        StaticData: mockStaticData,
        $uibModalInstance: modalInstance,        
        PatientServices: patientServices,
        BoundObjectFactory: mockBoundObjectFactory,
        PatientBenefitPlansFactory: patientBenefitPlansFactory,
      });
    }));

    describe('intitial setup -> ', function () {
      it('check if controller exists', function () {
        expect(ctrl).not.toBeNull();
      });

      it('should have injected PatientDemographicsService ', function () {
        expect(_patientDemographicsService_).not.toBeNull();
      });

      it('should set scope properties', function () {
        expect(scope.validPhones).toBe(true);
        expect(scope.patient.Data).toEqual(currentPatient.Value);
        expect(scope.patient.Data.Phones).toEqual(phones.Value);
        expect(scope.phones).toEqual(phones.Value);
        expect(scope.personalInfo.Profile).toEqual(mockPerson.Value.Profile);
        expect(scope.personalInfo).toEqual(mockPerson.Value);
        expect(scope.personalInfo.Updated).toBe(false);
        expect(scope.originalPersonalInfo).toEqual(mockPerson.Value);
        expect(scope.dataHasChanged).toBe(false);
        expect(scope.referredPatients).toEqual([]);
        expect(scope.activeTemplate).toEqual('');
        expect(scope.editMode).toBe(true);
        expect(scope.hasErrors).toBe(false);
        expect(scope.primaryNoteCollapsed).toBe(true);
        expect(scope.secondaryNoteCollapsed).toBe(true);
        expect(scope.duplicatePatients).toEqual([]);
        expect(scope.duplicatePatients).toEqual([]);
      });
    });

    describe('patient.Data.Phones $watch -> ', function () {
      it('should load phones property', function () {
        scope.patient.Data.Phones = angular.copy(mockPhonesResponse.Value);
        scope.$apply();
        expect(scope.phones).toEqual(scope.patient.Data.Phones);
      });
    });

    describe('patient.Data.ResponsiblePersonId $watch -> ', function () {
      beforeEach(function () {
        scope.patient.Data = mockPerson.Value;
        scope.patient.Data.ResponsiblePersonId = null;
        scope.patient.Data.ResponsiblePersonType = 0;
        spyOn(ctrl, 'setResponsiblePartyPanel');
      });
      it('should set defaultExpandedPanel to PI_RP if patient.Data.ResponsiblePersonId is null && patient.Data.ResponsiblePersonType=0', function () {
        scope.$apply();
        expect(ctrl.setResponsiblePartyPanel).toHaveBeenCalled();
      });
    });

    describe('openPersonalInfoPanel function -> ', function () {
      it('should set defaultFocusOnRespParty to true', function () {
        scope.openPersonalInfoPanel();
        expect(scope.defaultFocusOnRespParty).toBe(true);
      });

      it('should set defaultExpandedPanel to PI_RP', function () {
        scope.openPersonalInfoPanel();
        expect(scope.defaultExpandedPanel).toEqual('PI_RP');
        expect(scope.patient.Data.defaultExpandedPanel).toEqual('PI_RP');
      });
    });

    describe('addColumnsToPhones function -> ', function () {
      it('should add invalid properties to phones and set false', function () {
        scope.personalInfo.Phones = mockPhonesResponse.Value;
        var personPhones = angular.copy(scope.personalInfo.Phones);
        ctrl.addColumnsToPhones(personPhones);
        angular.forEach(personPhones, function (phone) {
          expect(phone.invalidPhoneNumber).toBe(false);
          expect(phone.invalidPhoneNumber).toBe(false);
        });
      });
    });

    describe('copyPreferencesFromPatient function -> ', function () {
      it('should set preferences', function () {
        var patient = angular.copy(mockPerson.Value);
        ctrl.copyPreferencesFromPatient(patient);
        expect(scope.preferences.PreferredLocation).toEqual(
          patient.PreferredLocation
        );
        expect(scope.preferences.PreferredDentist).toEqual(
          patient.PreferredDentist
        );
        expect(scope.preferences.PreferredHygienist).toEqual(
          patient.PreferredHygienist
        );
        expect(scope.originalPreferences).toEqual(scope.preferences);
      });
    });

    describe('when on personal-info-changed is triggered -> ', function () {
      it('should set dataHasChanged', function () {
        scope.dataHasChanged = false;
        scope.$broadcast('personal-info-changed', true);
        expect(scope.dataHasChanged).toBe(true);

        scope.$broadcast('personal-info-changed', false);
        expect(scope.dataHasChanged).toBe(false);
      });
    });

    describe('when on preferences-changed is triggered -> ', function () {
      it('should set originalPreferences to preferences', function () {
        var patient = angular.copy(mockPerson.Value);
        ctrl.copyPreferencesFromPatient(patient);
        var mockPreferences = scope.preferences;
        scope.$broadcast('preferences-changed', mockPreferences);
        expect(scope.originalPreferences).toEqual(mockPreferences);
      });
    });

    describe('getAllProviders function -> ', function () {
      it('should call referenceDataService.getData', function () {
        ctrl.getAllProviders();
        expect(referenceDataService.getData).toHaveBeenCalledWith(
          referenceDataService.entityNames.users
        );
      });
    });

    describe('edit patient button click ->', function () {
      it('should redirect to patient edit page', function () {
        scope.EditPatient('1');
        expect(location.path).toHaveBeenCalledWith('Patient/Edit/1');
      });
    });

    describe('isCollapsed $watch -> ', function () {
      it('should set moreLess property', function () {
        scope.moreLess = 'less';
        scope.isCollapsed = true;
        scope.$apply();
        expect(localize.getLocalizedString).toHaveBeenCalledWith('more');

        scope.isCollapsed = false;
        scope.$apply();
        expect(localize.getLocalizedString).toHaveBeenCalledWith('less');
      });
    });

    describe('defaultExpandedPanel $watch -> ', function () {
      it('should set $scope.patient.Data.defaultExpandedPanel property', function () {
        scope.openPersonalInfoPanel();
        expect(scope.defaultExpandedPanel).toEqual('PI_RP');
        scope.$apply();
        expect(scope.patient.Data.defaultExpandedPanel).toEqual('PI_RP');

        scope.defaultExpandedPanel = '';
        scope.$apply();
        expect(scope.patient.Data.defaultExpandedPanel).toEqual('');
      });
    });

    describe('ctrl.mergePatientData method ->', function () {
      beforeEach(function () {
        scope.patient.Data = { FirstName: 'James', LastName: 'Madison' };
        scope.personalInfo = {
          Profile: {
            FirstName: 'James',
            MiddleName: 'Dolly',
            LastName: 'Madison',
          },
          PatientLocations: [{ LocationId: '22' }, { LocationId: '222' }],
        };
      });

      it('should merge all properties to patient.Data', function () {
        expect(scope.patient.Data.PatientLocations).not.toEqual(
          scope.personalInfo.PatientLocations
        );
        ctrl.mergePatientData();
        expect(scope.patient.Data.FirstName).toEqual('James');
        expect(scope.patient.Data.LastName).toEqual('Madison');
        expect(scope.patient.Data.PatientLocations).toEqual(
          scope.personalInfo.PatientLocations
        );
      });

      it('should preserve properties not in one of the two objects', function () {
        expect(scope.patient.Data.Profile).not.toBeDefined();
        ctrl.mergePatientData();
        expect(scope.patient.Data.Profile.MiddleName).toEqual('Dolly');
      });
    });

    describe('setResponsiblePartyPanel method->', function () {
      beforeEach(function () {
        ctrl.hasMedicalAlertsViewAccess = true;
      });
      it('should set defaultExpandedPanel to empty string if patient.Data.ResponsiblePersonId is not null or patient.Data.ResponsiblePersonType is not 0', function () {
        scope.patient.Data = mockPerson.Value;
        scope.patient.Data.ResponsiblePersonId = '11';
        scope.patient.Data.ResponsiblePersonType = 2;
        ctrl.setResponsiblePartyPanel();
        expect(scope.patient.Data.defaultExpandedPanel).toBe('');

        scope.patient.Data = mockPerson.Value;
        scope.patient.Data.ResponsiblePersonId = null;
        scope.patient.Data.ResponsiblePersonType = 2;
        ctrl.setResponsiblePartyPanel();
        expect(scope.patient.Data.defaultExpandedPanel).toBe('');
      });

      it('should set defaultExpandedPanel to PI_RP if patient.Data.ResponsiblePersonId is null and patient.Data.ResponsiblePersonType is 0', function () {
        scope.patient.Data = mockPerson.Value;
        scope.patient.Data.ResponsiblePersonId = null;
        scope.patient.Data.ResponsiblePersonType = 0;
        ctrl.setResponsiblePartyPanel();
        expect(scope.patient.Data.defaultExpandedPanel).toBe('PI_RP');
      });

      it('should set call patientValidationFactory.SetPatientData with scope.patient.Data', function () {
        scope.patient.Data = mockPerson.Value;
        scope.patient.Data.ResponsiblePersonId = null;
        scope.patient.Data.ResponsiblePersonType = 0;
        ctrl.setResponsiblePartyPanel();
        expect(patientValidationFactory.SetPatientData).toHaveBeenCalledWith(
          scope.patient.Data
        );
      });
    });

    describe('ctrl.loadAccountInfo method -> ', function () {
      beforeEach(function () {
        scope.patient = { Data: { PersonAccount: { AccountId: '1234' } } };
      });

      it('should load scope.accountOverview from personFactory.ActiveAccountOverview if available', function () {
        scope.canViewAccount = true;
        personFactory.ActiveAccountOverview = {};
        ctrl.loadAccountInfo();
        expect(personFactory.AccountOverview).not.toHaveBeenCalledWith(
          scope.accountOverview
        );
      });

      it('should load scope.accountOverview from personFactory.AccountOverview if personFactory.ActiveAccountOverview not available', function () {
        scope.canViewAccount = true;
        personFactory.ActiveAccountOverview = null;
        ctrl.loadAccountInfo();
        expect(personFactory.AccountOverview).toHaveBeenCalledWith(
          scope.patient.Data.PersonAccount.AccountId
        );
      });
    });

    describe('scope.getHipaaDocuments method -> ', function () {
      beforeEach(function () {
        scope.patient.Data.PatientId = '1234';
      });

      it('should load scope.accountOverview from personFactory.ActiveAccountOverview if available', function () {
        personFactory.ActiveHipaaAuthorizationSummaries = [{}, {}];
        scope.getHipaaDocuments();
        expect(
          patientServices.HipaaAuthorization.getSummariesByPatientId
        ).not.toHaveBeenCalledWith(scope.patient.Data.PatientId);
      });

      it('should load scope.accountOverview from personFactory.AccountOverview if personFactory.ActiveAccountOverview not available', function () {
        personFactory.ActiveHipaaAuthorizationSummaries = null;
        scope.getHipaaDocuments();
        expect(
          patientServices.HipaaAuthorization.getSummariesByPatientId
        ).toHaveBeenCalledWith({ patientId: scope.patient.Data.PatientId });
      });
    });

    describe('ctrl.setResponsibleParty method -> ', function () {
      beforeEach(function () {
        scope.patient.Data.PatientId = '1234';
        scope.accountOverview = {
          AccountMembersAccountInfo: [
            { PersonId: '1234', ResponsiblePersonId: '1234' },
            { PersonId: '1235', ResponsiblePersonId: '1234' },
          ],
          AccountMembersProfileInfo: [
            { PatientId: '1234', FirstName: 'Bob ', LastName: 'Smith' },
            { PatientId: '1235', FirstName: 'Jane ', LastName: 'Smith' },
          ],
        };
        patSharedServices.Format.PatientName = jasmine
          .createSpy()
          .and.returnValue('Bob Smith');
      });

      it(
        'should set scope.patient.Data.ResponsiblePersonName to Self if ' +
          'accountMemberInfo.ResponsiblePersonId equals accountMemberInfo.PersonId',
        function () {
          ctrl.setResponsibleParty();
          expect(scope.patient.Data.ResponsiblePersonName).toEqual('Self');
        }
      );

      it(
        'should set scope.patient.Data.ResponsiblePersonName to the responsible partys name if ' +
          'accountMemberInfo.ResponsiblePersonId does not equal accountMemberInfo.PersonId',
        function () {
          scope.accountOverview.AccountMembersAccountInfo[0].ResponsiblePersonId =
            '1235';
          ctrl.setResponsibleParty();
          expect(scope.patient.Data.ResponsiblePersonName).toEqual('Bob Smith');
        }
      );
    });
  });
});
