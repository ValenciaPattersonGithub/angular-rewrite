import { of } from 'rsjs';

describe('ServiceSelectorRefactorController -> ', function () {
  var ctrl,
    rootScope,
    scope,
    listHelper,
    toastrFactory,
    timeout,
    referenceDataService,
    patientValidationFactory,
    personFactory,
    featureFlagService;
  var patientMock = {
    PatientId: '0619cb3e-9c91-498a-9211-889ec7fc67a2',
    Profile: {},
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  // Create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      //mock for listHelper service
      listHelper = {
        findItemByFieldValue: jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(1),
      };

      //mock for toaster functionality
      toastrFactory = {
        success: jasmine.createSpy(),
        error: jasmine.createSpy(),
      };
      var serviceTypesData = [
        {
          ServiceTypeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947',
          IsSystemType: true,
          Description: 'Adjunctive General Services',
          IsAssociatedWithServiceCode: false,
        },
        {
          ServiceTypeId: 'cc08eb08-425d-43af-9d9d-ce976a208489',
          IsSystemType: true,
          Description: 'Diagnostic',
          IsAssociatedWithServiceCode: true,
        },
        {
          ServiceTypeId: '46206c7f-e4df-4158-86d9-c442c1fa63b4',
          IsSystemType: true,
          Description: 'Endodontics',
          IsAssociatedWithServiceCode: false,
        },
        {
          ServiceTypeId: '3493fe28-4e23-4ef7-8ca2-9a5edcce883a',
          IsSystemType: true,
          Description: 'Implant Services',
          IsAssociatedWithServiceCode: false,
        },
      ];

      referenceDataService = {
        get: jasmine.createSpy().and.returnValue(serviceTypesData),
        entityNames: {
          serviceTypes: 'serviceTypes',
        },
      };

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);

      patientValidationFactory = {
        GetPatientData: jasmine.createSpy().and.returnValue({
          PatientId: '00000000-0000-0000-0000-000000000000',
        }),
        SetPatientData: jasmine.createSpy().and.callFake(function () {}),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      personFactory = {
        Overview: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({
            Value: patientMock,
          }),
        }),
      };
      $provide.value('PersonFactory', personFactory);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    scope.serviceFilter = 'appointment';
    scope.flyout = true;
    scope.loaded = jasmine.createSpy();
    ctrl = $controller('ServiceSelectorRefactorController', {
      $scope: scope,
      $rootScope: rootScope,
      ListHelper: listHelper,
      toastrFactory: toastrFactory,
      referenceDataService: referenceDataService,
    });
    timeout = $injector.get('$timeout');
    spyOn(timeout, 'cancel');
  }));

  it('should initialize controller', function () {
    expect(ctrl).not.toBeNull();
  });
  describe('initializeServiceCodes function -> ', function () {
    it('should call serviceCodeGetAllSuccess', function () {
      ctrl.initializeServiceCodes();
      expect(referenceDataService.get).toHaveBeenCalledWith(
        referenceDataService.entityNames.serviceCodes
      );
    });
  });

  describe('on openNewServicesFlyout ->', function () {
    var sender = 'txplan';

    beforeEach(function () {
      spyOn(scope, 'showFilters');
      spyOn(ctrl, 'loadData');
      sender = 'txplan';
    });

    it('should call loadData', function () {
      ctrl.firstLoad = true;
      scope.$emit('openNewServicesFlyout', sender);
      expect(ctrl.loadData).toHaveBeenCalledWith(sender);
    });
  });

  describe('loadData method ->', function () {
    beforeEach(function () {
      spyOn(scope, 'showFilters');
      scope.clearCheckedRows = jasmine.createSpy();
      ctrl.initializeServiceTypes = jasmine.createSpy();
      ctrl.initializeServiceCodes = jasmine.createSpy();
      scope.loadingCheck = { loading: null };
    });

    it('should call showFilters if not first load and serviceFilter matches sender', function () {
      ctrl.firstLoad = false;
      scope.serviceFilter = 'txplan';
      ctrl.loadData('txplan');
      expect(scope.showFilters).toHaveBeenCalled();
    });

    it('should not call showFilters if not first load and serviceFilter does not match sender', function () {
      ctrl.firstLoad = false;
      scope.serviceFilter = 'appointment';
      ctrl.loadData('txplan');
      expect(scope.showFilters).not.toHaveBeenCalled();
    });

    it('should call showFilters if not first load sender is null', function () {
      ctrl.firstLoad = false;
      scope.serviceFilter = 'txplan';
      ctrl.loadData(null);
      expect(scope.showFilters).toHaveBeenCalled();
    });

    it('should not call showFilters if firstLoad', function () {
      ctrl.firstLoad = true;
      scope.serviceFilter = 'txplan';
      ctrl.loadData('txplan');
      expect(scope.showFilters).not.toHaveBeenCalled();
      expect(ctrl.firstLoad).toBe(false);
      expect(scope.loadingCheck.loading).toBe(true);
      expect(scope.clearCheckedRows).toHaveBeenCalled();
      expect(ctrl.initializeServiceCodes).toHaveBeenCalled();
      expect(ctrl.initializeServiceTypes).toHaveBeenCalled();
    });
  });

  describe('loadPatient method -> ', function () {
    beforeEach(function () {
      scope.patient = {
        PatientId: '00000000-0000-0000-0000-000000000000',
      };
      ctrl.loadPatient = jasmine.createSpy();
    });

    it('should call loadPatient', function () {
      ctrl.$onInit();

      expect(patientValidationFactory.GetPatientData).toHaveBeenCalled();
      expect(ctrl.loadPatient).toHaveBeenCalled();
    });

    it('should call patientValidationFactory SetPatient if patientInfo is empty', function () {
      ctrl.patientInfo = {};
      ctrl.$onInit();

      personFactory.Overview(patientMock.PatientId).then(function (res) {
        expect(ctrl.patientInfo.Profile).not.toBeNull();
        expect(ctrl.patientInfo.PatientId).toBe(patientMock.PatientId);
        expect(patientValidationFactory.SetPatientData).toHaveBeenCalledWith(
          res.Value
        );
      });
    });

    it('should not call patientValidationFactory SetPatient if patientInfo is not empty', function () {
      ctrl.patientInfo = { PatientId: '00000000-0000-0000-0000-000000000000' };
      ctrl.$onInit();

      expect(personFactory.Overview).not.toHaveBeenCalled();
      expect(patientValidationFactory.SetPatientData).not.toHaveBeenCalled();
    });
  });
});
