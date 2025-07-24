// top level test suite
describe('PatientAlertFlagController ->', function () {
  var scope, ctrl, toastrFactory;
  var _patientServices_, mockStaticData, personFactory, patientAlertsFactory;
  var patientMedicalHistoryAlertsFactory;

  //#region mocks

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
      MasterAlertId: null,
      Description: 'Alert5',
      SymbolId: 1,
      ExpirationDate: new Date('January 1, 2016'),
    },
    {
      PatientAlertId: 11,
      PatientId: 1,
      MasterAlertId: null,
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

      personFactory = {
        getPatientAlerts: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        PatientAlerts: null,
        PatientMedicalHistoryAlerts: null,
        SetPatientAlerts: jasmine.createSpy(),
        SetMedicalHistoryAlerts: jasmine.createSpy(),
      };
      $provide.value('PersonFactory', personFactory);

      patientAlertsFactory = {
        PatientAlerts: { Alerts: null },
        Alerts: null,
      };
      $provide.value('PatientAlertsFactory', patientAlertsFactory);

      mockStaticData = {
        AlertIcons: jasmine.createSpy().and.returnValue(mockSymbolsList),
      };
      $provide.value('StaticData', mockStaticData);

      _patientServices_ = {
        Alerts: {
          get: jasmine
            .createSpy()
            .and.returnValue({ Value: mockPatientAlertsList }),
        },
      };
      $provide.value('PatientServices', _patientServices_);

      patientMedicalHistoryAlertsFactory = {
        access: jasmine.createSpy().and.returnValue({}),
        PatientMedicalHistoryAlerts: jasmine.createSpy().and.returnValue({}),
        IconClass: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value(
        'PatientMedicalHistoryAlertsFactory',
        patientMedicalHistoryAlertsFactory
      );
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $q) {
    patientMedicalHistoryAlertsFactory = {
      PatientMedicalHistoryAlerts: jasmine
        .createSpy(
          'patientMedicalHistoryAlertsFactory.PatientMedicalHistoryAlerts'
        )
        .and.callFake(function () {
          var deferred = $q.defer();
          deferred.resolve(1);
          return {
            result: deferred.promise,
            then: function () {},
          };
        }),
    };
  }));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    scope.patient = { PatientId: 1 };
    ctrl = $controller('PatientAlertFlagController', {
      $scope: scope,
      PatientMedicalHistoryAlertsFactory: patientMedicalHistoryAlertsFactory,
    });

    // the config passed to the panel directive
    scope.alerts = angular.copy(mockPatientAlertsList);

    $rootScope.$apply();
  }));

  describe('when user is authorized - >', function () {
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services and factories ', function () {
      expect(_patientServices_.Alerts).not.toBeNull();
      expect(mockStaticData).not.toBeNull();
    });

    it('should set default values', function () {
      expect(scope.masterAlerts).toEqual([]);
      expect(scope.customAlerts).toEqual([]);

      expect(ctrl.symbolList).toEqual(mockSymbolsList);
    });

    describe('ctrl.loadMedicalHistoryAlerts function ->', function () {
      beforeEach(function () {
        scope.patient.MedicalHistoryAlerts = [{}, {}];
        spyOn(ctrl, 'getMedicalHistoryAlerts');
      });

      it('should load scope.patientMedicalHistoryAlerts from patient.MedicalHistoryAlerts if available', function () {
        ctrl.loadMedicalHistoryAlerts();
        expect(scope.patientMedicalHistoryAlerts).toEqual(
          scope.patient.MedicalHistoryAlerts
        );
      });

      it('should load scope.patientMedicalHistoryAlerts from ctrl.getMedicalHistoryAlerts if patient.MedicalHistoryAlerts not available', function () {
        scope.patient = {};
        ctrl.loadMedicalHistoryAlerts();
        expect(ctrl.getMedicalHistoryAlerts).toHaveBeenCalled();
      });
    });

    describe('getClass function ->', function () {
      it('should get a class by symbolid', function () {
        var symbolClass = scope.getClass(mockSymbolsList[0].SymbolId);
        expect(mockSymbolsList.getClassById).toHaveBeenCalled();
        expect(symbolClass).toBe('fa ' + mockSymbolsList[0].Class);
      });
    });

    //#region medical history alerts

    describe('ctrl.getMedicalHistoryAlerts ->', function () {
      beforeEach(function () {});
      it('should call PatientMedicalHistoryAlerts  ', function () {
        personFactory.PatientMedicalHistoryAlerts = null;
        scope.patient = { PatientId: '11' };
        ctrl.hasMedicalAlertsViewAccess = true;
        ctrl.getMedicalHistoryAlerts();
        expect(
          patientMedicalHistoryAlertsFactory.PatientMedicalHistoryAlerts
        ).toHaveBeenCalledWith(scope.patient.PatientId);
      });
    });

    describe('soar:medical-history-form-created emit ->', function () {
      it('it should trigger getMedicalHistoryAlerts ', function () {
        scope.patient.PatientId = '11';
        var medicalHistoryForm = {};
        spyOn(ctrl, 'getMedicalHistoryAlerts');
        scope.$broadcast(
          'soar:medical-history-form-created',
          medicalHistoryForm
        );
        expect(ctrl.getMedicalHistoryAlerts).toHaveBeenCalled();
      });
    });

    //#endregion
  });
});
