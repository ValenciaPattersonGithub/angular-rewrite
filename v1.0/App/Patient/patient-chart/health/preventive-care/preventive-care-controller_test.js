import { of} from 'rxjs';

describe('PreventiveCareDirectiveController tests ->', function () {
  var ctrl,
    mockPatientOverridesResponse,
    mockServicesDueResponse,
    modalFactory,
    modalInstance,
    patientPreventiveCareFactory,
    preventiveCareService,
    scope,
    toastrFactory,
    locationService,
    timezoneFactory;
  
  var userSettingsDataService,
    appointmentViewDataLoadingService,
    appointmentViewVisibleService;
  
  mockServicesDueResponse = {
    ExtendedStatusCode: null,
    Value: [
      {
        PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
        PreventiveServiceTypeId: 'f08f35ff-19ab-4fa7-a022-6ac8afa0937f',
        PreventiveServiceTypeDescription: 'Prophy/Perio Maint.',
        DateServiceDue: '5/15/2016',
        DateServiceLastPerformed: '11/15/2015',
        IsTrumpService: false,
        Frequency: 6,
        AppointmentId: null,
        AppointmentStartTime: null,
      },
      {
        PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
        PreventiveServiceTypeId: '9a3d8820-59e8-49bf-ac94-e5afb672cdcb',
        PreventiveServiceTypeDescription: 'Exam',
        DateServiceDue: null,
        DateServiceLastPerformed: null,
        IsTrumpService: true,
        Frequency: 6,
      },
      {
        PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
        PreventiveServiceTypeId: '810966e5-efda-450c-8f85-b98364faa10e',
        PreventiveServiceTypeDescription: 'FMX/Pano',
        DateServiceDue: '8/14/2016',
        DateServiceLastPerformed: '2/14/2016',
        IsTrumpService: false,
        Frequency: 6,
      },
      {
        PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
        PreventiveServiceTypeId: '6254b8d1-e2d6-4403-b4b4-e69b37d27a92',
        PreventiveServiceTypeDescription: 'Bitewings',
        DateServiceDue: '6/12/2016',
        DateServiceLastPerformed: '12/12/2015',
        IsTrumpService: false,
        Frequency: 6,
      },
      {
        PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
        PreventiveServiceTypeId: '3b8a664f-227a-49af-bb27-53dfef5f7fc1',
        PreventiveServiceTypeDescription: 'Fluoride',
        DateServiceDue: '4/14/2016',
        DateServiceLastPerformed: '10/14/2015',
        IsTrumpService: false,
        Frequency: 6,
      },
    ],
    Count: null,
    InvalidProperties: null,
  };

  mockPatientOverridesResponse = {
    ExtendedStatusCode: null,
    Value: [
      {
        PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
        PreventiveServiceTypeId: '9a3d8820-59e8-49bf-ac94-e5afb672cdcb',
        PreventiveServiceTypeDescription: 'Exam',
        PatientFrequency: 5,
        IsOverride: true,
        DataTag: null,
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '0001-01-01T00:00:00',
        IsPatientTrumpService: false,
        IsPracticeTrumpService: false,
      },
      {
        PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
        PreventiveServiceTypeId: 'f08f35ff-19ab-4fa7-a022-6ac8afa0937f',
        PreventiveServiceTypeDescription: 'Prophy/Perio Maint.',
        PatientFrequency: 2,
        IsOverride: true,
        DataTag: 'new value',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2016-05-03T16:53:04.6010511Z',
        IsPatientTrumpService: false,
        IsPracticeTrumpService: true,
      },
      {
        PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
        PreventiveServiceTypeId: '6254b8d1-e2d6-4403-b4b4-e69b37d27a92',
        PreventiveServiceTypeDescription: 'Bitewings',
        PatientFrequency: 0,
        IsOverride: false,
        DataTag: null,
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '0001-01-01T00:00:00',
        IsPatientTrumpService: false,
        IsPracticeTrumpService: false,
      },
      {
        PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
        PreventiveServiceTypeId: '810966e5-efda-450c-8f85-b98364faa10e',
        PreventiveServiceTypeDescription: 'FMX/Pano',
        PatientFrequency: 0,
        IsOverride: false,
        DataTag: null,
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '0001-01-01T00:00:00',
        IsPatientTrumpService: false,
        IsPracticeTrumpService: false,
      },
      {
        PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
        PreventiveServiceTypeId: '3b8a664f-227a-49af-bb27-53dfef5f7fc1',
        PreventiveServiceTypeDescription: 'Fluoride',
        PatientFrequency: 0,
        IsOverride: false,
        DataTag: null,
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '0001-01-01T00:00:00',
        IsPatientTrumpService: false,
        IsPracticeTrumpService: false,
      },
    ],
    Count: null,
    InvalidProperties: null,
  };

  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(
      module('Soar.Patient', function ($provide) {
        toastrFactory = jasmine.createSpyObj('toastrFactory', ['error', 'success']);
        $provide.value('toastrFactory', toastrFactory);

        userSettingsDataService = jasmine.createSpyObj('userSettingsDataService', ['isNewAppointmentAreaEnabled']);
        userSettingsDataService.isNewAppointmentAreaEnabled.and.returnValue(false);
        $provide.value('userSettingsDataService', userSettingsDataService);

        appointmentViewVisibleService = jasmine.createSpyObj('appointmentViewVisibleService', ['changeAppointmentViewVisible']);
        $provide.value('AppointmentViewVisibleService', appointmentViewVisibleService);

        locationService = jasmine.createSpyObj('locationService', ['getCurrentLocation']);
        let currentLocation = {timezone: 'Central Time'};
        locationService.getCurrentLocation.and.returnValue(currentLocation);
        $provide.value('locationService', locationService);

        appointmentViewDataLoadingService = jasmine.createSpyObj('appointmentViewDataLoadingService', ['getViewData']);
        appointmentViewDataLoadingService.getViewData.and.returnValue({
          then: function (resolve, reject) { resolve({}); } 
        });
        $provide.value('AppointmentViewDataLoadingService', appointmentViewDataLoadingService);

        let featureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
        featureFlagService.getOnce$.and.returnValue(of(false));
        $provide.value('FeatureFlagService', featureFlagService);

        let scheduleMFENavigator = jasmine.createSpyObj('schedulingMFENavigator', ['navigateToAppointmentModal']);
        $provide.value('schedulingMFENavigator', scheduleMFENavigator);
      })
  );


  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $q,
    $location
  ) {
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close').and.returnValue({}),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    modalFactory = {
      WarningModal: jasmine
        .createSpy('modalFactory.WarningModal')
        .and.callFake(function () {
          var modalFactoryDeferred = $q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    timezoneFactory = {
      ConvertDateTZ: jasmine.createSpy().and.returnValue(t => t),
    };

    scope = $rootScope.$new();
    preventiveCareService = {
      accessForServiceType: jasmine.createSpy().and.returnValue({}),
      accessForServiceCode: jasmine.createSpy().and.returnValue({}),
    };
    patientPreventiveCareFactory = $injector.get(
      'PatientPreventiveCareFactory'
    );
    ctrl = $controller('PreventiveCareDirectiveController', {
      $scope: scope,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      PreventiveCareService: preventiveCareService,
      PatientPreventiveCareFactory: patientPreventiveCareFactory,
      TimeZoneFactory: timezoneFactory,
      $location: location,
    });
  }));

  describe('processServicesDue -> ', function () {
    beforeEach(function () {
      timezoneFactory.ConvertDateTZ = jasmine
        .createSpy()
        .and.callFake(d =>
          d && d.length > 0 ? moment(new Date(d)).toDate() : null
        );
    });

    it('should call patientPreventiveCareFactory.SetCustomPropertiesForServicesDue', function () {
      spyOn(patientPreventiveCareFactory, 'SetCustomPropertiesForServicesDue');
      var servicesDue = angular.copy(mockServicesDueResponse.Value);
      ctrl.processServicesDue(servicesDue);
      expect(
        patientPreventiveCareFactory.SetCustomPropertiesForServicesDue
      ).toHaveBeenCalled();
    });

    it('should set trumpService', function () {
      var servicesDue = angular.copy(mockServicesDueResponse.Value);
      servicesDue[1].AppointmentStartTime = '2019-03-04T18:00:00';
      ctrl.processServicesDue(servicesDue);
      expect(scope.trumpService).toBe(servicesDue[1]);
      expect(scope.trumpService.AppointmentStartTime).toBe('2019-03-04');
    });

    it('should set trumpService AppointmentId and AppointmentStartTime to empty strings if they are falsy', function () {
      var servicesDue = angular.copy(mockServicesDueResponse.Value);
      ctrl.processServicesDue(servicesDue);
      expect(scope.trumpService.AppointmentId).toBe('');
      expect(scope.trumpService.AppointmentStartTime).toBe('');
    });
  });

  describe('processOverridesResponse -> ', function () {
    it('should update DataTag', function () {
      scope.patientInfo = {};
      scope.patientInfo.PatientId = 1;
      scope.patientPrevCareOverrides = angular.copy(
        mockPatientOverridesResponse.Value
      );
      scope.patientPrevCareOverrides[1].DataTag = 'old value';
      expect(scope.patientPrevCareOverrides[1].DataTag).toBe('old value');
      ctrl.processOverridesResponse(mockPatientOverridesResponse, false);
      expect(scope.patientPrevCareOverrides[1].DataTag).toBe('new value');
    });

    it('should update backup', function () {
      scope.patientInfo = {};
      scope.patientInfo.PatientId = 1;
      ctrl.patientPrevCareOverridesBackup = angular.copy(
        mockPatientOverridesResponse.Value
      );
      ctrl.patientPrevCareOverridesBackup[1].DataTag = 'old value';
      expect(ctrl.patientPrevCareOverridesBackup[1].DataTag).toBe('old value');
      ctrl.patientPrevCareOverridesBackup[1].PatientFrequency = 4;
      expect(ctrl.patientPrevCareOverridesBackup[1].PatientFrequency).toBe(4);
      ctrl.processOverridesResponse(mockPatientOverridesResponse, false);
      expect(ctrl.patientPrevCareOverridesBackup[1].DataTag).toBe('new value');
      expect(ctrl.patientPrevCareOverridesBackup[1].PatientFrequency).toBe(2);
    });

    it('should set IsPatientTrumpService to true for practice default when no IsPatientTrumpService is true', function () {
      scope.patientPrevCareOverrides = angular.copy(
        mockPatientOverridesResponse.Value
      );
      expect(scope.patientPrevCareOverrides[1].IsPatientTrumpService).toBe(
        false
      );
      ctrl.processOverridesResponse(mockPatientOverridesResponse, true);
      expect(scope.patientPrevCareOverrides[1].IsPatientTrumpService).toBe(
        true
      );
    });
  });

  describe('$scope.showAppointmentModal ->', function () {
    let trumpService, currentLocation;

    beforeEach(function () {
      trumpService = {
        AppointmentId: '12345',
        AppointmentStartTime: '2023-04-15T09:00:00Z',
        PersonId: '67890',
        Location: {
          Timezone: 'Eastern Time'
        }
      };
      currentLocation = {
        timezone: 'Central Time'
      };
    });

    it('should correctly copy properties from trumpService to appointmentCopy', function () {
      scope.showAppointmentModal(trumpService);
      expect(appointmentViewDataLoadingService.getViewData).toHaveBeenCalledWith(jasmine.objectContaining({
        AppointmentId: '12345',
        StartTime: '2023-04-15T09:00:00Z',
        PersonId: '67890'
      }), false);
    });

    it('should copy Location and Timezone if they exist on trumpService', function () {
      scope.showAppointmentModal(trumpService);
      expect(appointmentViewDataLoadingService.getViewData).toHaveBeenCalledWith(jasmine.objectContaining({
        Location: { Timezone: 'Eastern Time' }
      }), false);
    });

    it('should use currentLocation timezone if Location is missing on trumpService', function () {
      delete trumpService.Location;
      scope.showAppointmentModal(trumpService);
      expect(appointmentViewDataLoadingService.getViewData).toHaveBeenCalledWith(jasmine.objectContaining({
        Location: { Timezone: 'Central Time' }
      }), false);
    });

    it('should display an error if no Location or timezone information is available', function () {
      delete trumpService.Location;
      locationService.getCurrentLocation.and.returnValue({});
      scope.showAppointmentModal(trumpService);
      scope.$apply(); 
      expect(toastrFactory.error).toHaveBeenCalledWith('Location information is missing', 'Error');
    });

    it('should call changeAppointmentViewVisible on successful getViewData', function () {
      scope.showAppointmentModal(trumpService);
      scope.$apply();
      expect(appointmentViewVisibleService.changeAppointmentViewVisible).toHaveBeenCalledWith(true, false);
    });

    it('should display an error if getViewData is rejected', function () {
      appointmentViewDataLoadingService.getViewData.and.returnValue({
        then: function (resolve, reject) { reject('Error'); }
      });
      scope.showAppointmentModal(trumpService);
      scope.$apply();
      expect(toastrFactory.error).toHaveBeenCalledWith('Ran into a problem loading the appointment', 'Error');
    });
  });

  describe('resetToPracticeDefault -> ', function () {
    it('should reset properties', function () {
      var exam = {
        PracticeFrequency: 1,
      };
      scope.resetToPracticeDefault(exam);
      expect(exam.PatientFrequency).toBe(1);
      expect(exam.IsOverride).toBe(false);
    });
  });

  describe('hasChanges -> ', function () {
    it('should return false if there are no changes', function () {
      scope.patientInfo = {};
      scope.patientInfo.PatientId = 1;
      scope.patientPrevCareOverrides = angular.copy(
        mockPatientOverridesResponse.Value
      );
      ctrl.patientPrevCareOverridesBackup = angular.copy(
        mockPatientOverridesResponse.Value
      );
      expect(scope.hasChanges()).toBe(false);
    });

    it('should return true if there are changes', function () {
      scope.patientInfo = {};
      scope.patientInfo.PatientId = 1;
      scope.patientPrevCareOverrides = angular.copy(
        mockPatientOverridesResponse.Value
      );
      scope.patientPrevCareOverrides[3].PatientFrequency = 32;
      ctrl.patientPrevCareOverridesBackup = angular.copy(
        mockPatientOverridesResponse.Value
      );
      expect(scope.hasChanges()).toBe(true);
    });
  });

  describe('patientPrevCareOverridesSource -> ', function () {
    it('should set Frequency to zero if value is null', function () {
      scope.patientPrevCareOverridesSource = angular.copy(
        mockPatientOverridesResponse.Value
      );
      scope.patientPrevCareOverridesSource[3].PatientFrequency = null;
      scope.$apply();
      expect(scope.patientPrevCareOverridesSource[3].PatientFrequency).toBe(
        null
      );
    });

    it('should set $$HasErrors to true if value is over 120', function () {
      scope.patientPrevCareOverridesSource = angular.copy(
        mockPatientOverridesResponse.Value
      );
      scope.patientPrevCareOverridesSource[1].PatientFrequency = 120;
      scope.$apply();
      expect(scope.patientPrevCareOverridesSource[1].$$HasErrors).toBe(false);
      scope.patientPrevCareOverridesSource[1].PatientFrequency = 121;
      scope.$apply();
      expect(scope.patientPrevCareOverridesSource[1].$$HasErrors).toBe(true);
      expect(scope.hasErrors).toBe(true);
    });

    it('should set properties', function () {
      scope.patientPrevCareOverridesSource = angular.copy(
        mockPatientOverridesResponse.Value
      );
      scope.patientPrevCareOverridesSource[2].PatientFrequency = 14;
      scope.patientPrevCareOverridesSource[2].PatientFrequency = 10;
      scope.$apply();
      expect(scope.patientPrevCareOverridesSource[2].PatientFrequency).toBe(10);
      expect(scope.patientPrevCareOverridesSource[2].IsOverride).toBe(true);
    });
  });

  describe('saveFunction -> ', function () {
    it('should call ctrl.updatePatientPrevCareOverrides', function () {
      spyOn(ctrl, 'updatePatientPrevCareOverrides');
      scope.saveFunction();
      expect(ctrl.updatePatientPrevCareOverrides).toHaveBeenCalled();
    });
  });

  describe('reLoadPatientPrevCareOverrides -> ', function () {
    it('should set patientPrevCareOverrides properties based on grid ', function () {
      scope.patientPrevCareOverridesSource = angular.copy(
        mockPatientOverridesResponse.Value
      );
      scope.patientPrevCareOverrides = angular.copy(
        mockPatientOverridesResponse.Value
      );
      scope.patientPrevCareOverridesSource[0].PatientFrequency = 12;
      scope.patientPrevCareOverridesSource[0].IsPatientTrumpService = true;
      scope.patientPrevCareOverrides[0].PatientFrequency = 6;
      scope.patientPrevCareOverrides[0].IsPatientTrumpService = false;

      expect(scope.patientPrevCareOverrides[0].PatientFrequency).toEqual(6);

      ctrl.reLoadPatientPrevCareOverrides();
      expect(scope.patientPrevCareOverrides[0].PatientFrequency).toEqual(12);
      expect(scope.patientPrevCareOverrides[0].IsPatientTrumpService).toEqual(
        true
      );
    });
  });
});


