// top level test suite
describe('PatientAlertsSensitivitiesController ->', function () {
  var scope,
    ctrl,
    location,
    compile,
    localize,
    toastrFactory,
    timeout,
    element,
    $httpBackend;
  var _patientServices_, _masterAlertService_, mockStaticData;
  var routeParams, filter;

  //#region mocks
  var mockPatientAlert = {
    PatientAlertId: null,
    PatientId: null,
    MasterAlertId: null,
    Description: null,
    SymbolId: null,
    ExpirationDate: null,
  };

  var mockMasterAlertsList = [
    { MasterAlertId: 1, Description: 'AlertOne', SymbolId: 1 },
    { MasterAlertId: 2, Description: 'AlertTwo', SymbolId: 2 },
    { MasterAlertId: 3, Description: 'Alert3', SymbolId: 3 },
    { MasterAlertId: 4, Description: 'Alert4', SymbolId: 4 },
    { MasterAlertId: 5, Description: 'Alert5', SymbolId: 5 },
    { MasterAlertId: 6, Description: 'Alert6', SymbolId: 6 },
  ];

  var mockPatientAlertsList = [
    {
      PatientAlertId: 1,
      PatientId: 1,
      MasterAlertId: 2,
      Description: 'AlertTwo',
      SymbolId: 2,
      ExpirationDate: new Date('June 10, 2015'),
    },
    {
      PatientAlertId: 2,
      PatientId: 1,
      MasterAlertId: 3,
      Description: 'Alert3',
      SymbolId: 2,
      ExpirationDate: new Date('July 10, 2015'),
    },
    {
      PatientAlertId: 3,
      PatientId: 1,
      MasterAlertId: 4,
      Description: 'Alert4',
      SymbolId: 2,
      ExpirationDate: new Date('Aug 10, 2015'),
    },
    {
      PatientAlertId: 10,
      PatientId: 1,
      MasterAlertId: 5,
      Description: 'Alert5',
      SymbolId: 1,
      ExpirationDate: new Date('January 1, 2016'),
    },
    {
      PatientAlertId: 11,
      PatientId: 1,
      MasterAlertId: 6,
      Description: 'Alert6',
      SymbolId: 2,
      ExpirationDate: null,
    },
  ];

  var mockSymbolsList = [
    { SymbolId: 1, Class: 'fa-frowny-o' },
    { SymbolId: 2, Class: 'fa-smiley-o' },
    { SymbolId: 3, Class: 'fa-eyey' },
  ];

  mockSymbolsList.getClassById = jasmine
    .createSpy()
    .and.returnValue(mockSymbolsList[0].Class);

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('soar.templates'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      mockStaticData = {
        AlertIcons: jasmine.createSpy().and.returnValue(mockSymbolsList),
      };
      $provide.value('StaticData', mockStaticData);

      _masterAlertService_ = {
        get: jasmine
          .createSpy()
          .and.returnValue({ Value: mockMasterAlertsList }),
      };
      $provide.value('MasterAlertService', _masterAlertService_);

      _patientServices_ = {
        Alerts: {
          get: jasmine
            .createSpy()
            .and.returnValue({ Value: mockPatientAlertsList }),
          create: jasmine.createSpy().and.returnValue(''),
          update: jasmine.createSpy().and.returnValue(''),
          delete: jasmine.createSpy().and.returnValue(''),
        },
      };
      $provide.value('PatientServices', _patientServices_);

      $provide.value('PatientAlertsFactory', {});
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $injector,
    $controller,
    $location,
    $routeParams,
    $compile,
    $templateCache
  ) {
    location = $location;
    scope = $rootScope.$new();
    routeParams = $routeParams;
    ctrl = $controller('PatientAlertsSensitivitiesController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
    });
    compile = $compile;
    localize = $injector.get('localize');
    // allows location.path declared to find templateUrl
    $templateCache.put(
      'App/Common/components/dateSelector/dateSelector.html',
      ''
    );

    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .whenGET(
        'App/Patient/patient-crud/patient-alerts/patient-alerts-dropdown.html'
      )
      .respond(200, '');
    // the config passed to the panel directive
    scope.alerts = angular.copy(mockPatientAlertsList);

    $rootScope.$apply();
  }));

  describe('when user is authorized - >', function () {
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services and factories ', function () {
      expect(_masterAlertService_).not.toBeNull();
      expect(_patientServices_.Alerts).not.toBeNull();
      expect(mockStaticData).not.toBeNull();
    });

    it('should set default values', function () {
      expect(scope.masterAlerts).toEqual([]);
      expect(scope.selectedId).toBe(null);
      expect(scope.alertSaving).toBe(false);
      expect(scope.minDate).toEqual(
        moment().add(1, 'days').startOf('day').toDate()
      );
      expect(scope.maxDate).toEqual(
        moment().add(100, 'years').startOf('day').toDate()
      );
      expect(scope.symbolList).toEqual(mockSymbolsList);
    });

    describe('getClass function ->', function () {
      it('should get a class by symbolid', function () {
        var symbolClass = scope.getClass(mockSymbolsList[0].SymbolId);
        expect(mockSymbolsList.getClassById).toHaveBeenCalled();
        expect(symbolClass).toBe(mockSymbolsList[0].Class);
      });
    });

    describe('getMasterAlerts function ->', function () {
      it('successful getMasterAlerts should call service', function () {
        ctrl.getMasterAlerts();
        expect(_masterAlertService_.get).toHaveBeenCalled();
      });

      it('masterAlertGetSuccess should populate masterAlerts', function () {
        ctrl.masterAlertGetSuccess({ Value: mockMasterAlertsList });
        expect(scope.masterAlerts).toEqual(mockMasterAlertsList);
      });

      it('masterAlertGetFailure should set masterAlerts to empty array', function () {
        ctrl.masterAlertGetFailure();
        expect(scope.masterAlerts).toEqual([]);
      });

      it('masterAlertGetFailure should call toastr error', function () {
        ctrl.masterAlertGetFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('$watch selectedId -> ', function () {
      it('should reset hasMasterAlertError to false if user selects default in dropdown', function () {
        scope.hasMasterAlertError = true;
        scope.selectedId = -1;
        scope.$apply();
        expect(scope.hasMasterAlertError).toEqual(false);
      });

      it('should call processMasterAlertSelection if the user has selected a masterAlert from the dropdown', function () {
        scope.masterAlerts = angular.copy(mockMasterAlertsList);
        spyOn(ctrl, 'processMasterAlertSelection');
        scope.selectedId = 3;
        scope.$apply();
        expect(ctrl.processMasterAlertSelection).toHaveBeenCalled();
        scope.masterAlerts = [];
      });
    });

    describe('processMasterAlertSelection function ->', function () {
      it('should set hasMasterAlertError to true if MasterAlertId is already in $scope.alerts', function () {
        ctrl.processMasterAlertSelection(mockMasterAlertsList[5]);
        expect(scope.hasMasterAlertError).toBe(true);
      });

      it('should call addMasterAlertToAccount if the user has selected a masterAlert from the dropdown', function () {
        spyOn(ctrl, 'addMasterAlertToAccount');
        ctrl.processMasterAlertSelection(mockMasterAlertsList[0]);
        expect(scope.hasMasterAlertError).toBe(false);
        expect(ctrl.addMasterAlertToAccount).toHaveBeenCalledWith(
          mockMasterAlertsList[0]
        );
      });
    });

    describe('addMasterAlertToAccount function ->', function () {
      it('call patientAlertService create', function () {
        routeParams.patientId = 1;
        ctrl.addMasterAlertToAccount(mockMasterAlertsList[1]);
        expect(_patientServices_.Alerts.create).toHaveBeenCalled();
      });
    });

    describe('masterAlertCreateSuccess function ->', function () {
      it('should add alert to scope.alerts ', function () {
        expect(scope.alerts.length).toBe(5);
        var newPatientAlert = {
          PatientAlertId: 20,
          PatientId: 2,
          MasterAlertId: 2,
          Description: 'Alert5',
          SymbolId: 2,
          ExpirationDate: new Date('June 10, 2015'),
        };
        ctrl.masterAlertCreateSuccess({ Value: newPatientAlert });
        expect(scope.alerts.length).toBe(6);
      });

      it('should call toastrFactory success', function () {
        ctrl.masterAlertCreateSuccess({ Value: mockPatientAlertsList[4] });
        expect(scope.hasMasterAlertError).toBe(false);
        expect(toastrFactory.success).toHaveBeenCalled();
      });
    });

    describe('masterAlertCreateFailure function ->', function () {
      it('should call toastrFactory failure', function () {
        ctrl.masterAlertCreateFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('createCustomAlert function ->', function () {
      it('invalid custom alert form', function () {
        routeParams.patientId = 2;
        var newCustomAlert = {
          PatientAlertId: 20,
          PatientId: 2,
          MasterAlertId: 2,
          Description: null,
          SymbolId: 2,
          ExpirationDate: new Date('June 10, 2015'),
        };
        scope.createCustomAlert(newCustomAlert);
        expect(scope.alertSaving).toBe(false);
        expect(scope.customFormIsValid).toBe(false);
      });

      it('call patientAlertService create', function () {
        routeParams.patientId = 2;
        var newCustomAlert = {
          PatientAlertId: 20,
          PatientId: 2,
          MasterAlertId: 2,
          Description: 'Alert5',
          SymbolId: 2,
          ExpirationDate: new Date('June 10, 2015'),
        };
        scope.validExpDate = true;
        scope.createCustomAlert(newCustomAlert);
        expect(_patientServices_.Alerts.create).toHaveBeenCalled();
      });
    });

    describe('customAlertCreateSuccess function ->', function () {
      it('should add alert to scope.alerts ', function () {
        expect(scope.alerts.length).toBe(5);
        var newPatientAlert = {
          PatientAlertId: 20,
          PatientId: 2,
          MasterAlertId: 2,
          Description: 'Alert5',
          SymbolId: 2,
          ExpirationDate: new Date('June 10, 2015'),
        };
        ctrl.customAlertCreateSuccess({ Value: newPatientAlert });
        expect(scope.alerts.length).toBe(6);
      });

      it('should call toastrFactory success', function () {
        ctrl.customAlertCreateSuccess({ Value: mockPatientAlertsList[3] });
        expect(scope.alertSaving).toBe(false);
        expect(toastrFactory.success).toHaveBeenCalled();
      });
    });

    describe('customAlertCreateFailure function ->', function () {
      it('should call toastrFactory failure', function () {
        ctrl.customAlertCreateFailure();
        expect(scope.alertSaving).toBe(false);
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('cancelCustomAlertCreation function ->', function () {
      it('discard button should reset tempAlert and clear error flags', function () {
        scope.cancelCustomAlertCreation();
        expect(scope.tempAlert).toEqual({
          PatientAlertId: null,
          MasterAlertId: null,
          Description: '',
          ExpirationDate: null,
          SymbolId: '',
        });
        expect(scope.hasMasterAlertError).toBe(false);
        expect(scope.customFormIsValid).toBe(true);
      });
    });

    describe('deleteAlert function ->', function () {
      it('call patientAlertService delete', function () {
        scope.deleteAlert(2);
        expect(_patientServices_.Alerts.delete).toHaveBeenCalled();
      });
    });

    describe('deleteAlertFailure function ->', function () {
      it('should call toastrFactory failure', function () {
        ctrl.deleteAlertFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });
  });
});
