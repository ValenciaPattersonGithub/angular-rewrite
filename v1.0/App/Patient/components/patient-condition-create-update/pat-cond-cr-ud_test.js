describe('PatientConditionCreateUpdateController', function () {
  var ctrl,
    scope,
    staticData,
    listHelper,
    localize,
    toothSelectionService,
    filter,
    toastrFactory,
    q;
  var scheduleServices, rootScope, patSecurityService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  var patientOdontogramFactory,
    usersFactory,
    patientServicesFactory,
    patientConditionsFactory;
  var treatmentPlansFactory;
  var conditionsService, patientServices, patientLogic, userServices;

  beforeEach(
    module('Soar.Patient', function ($provide) {
      //mock for listHelper service
      listHelper = {
        findItemByFieldValue: jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(null),
        findIndexByFieldValue: jasmine
          .createSpy('listHelper.findIndexByFieldValue')
          .and.returnValue(0),
      };

      staticData = {
        TeethDefinitions: jasmine.createSpy().and.callFake(function () {
          var deferrred = q.defer();
          var result = { Value: { Teeth: [] } };
          deferrred.resolve(result);
          return deferrred.promise;
        }),
        ServiceTransactionStatuses: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        ConditionStatus: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };

      //#region mocks for factories
      scheduleServices = {};
      $provide.value('ScheduleServices', scheduleServices);

      patientLogic = {
        GetPatientById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientLogic', patientLogic);

      patientOdontogramFactory = {
        TeethDefinitions: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        setNextSmartCode: jasmine.createSpy(),
      };
      $provide.value('PatientOdontogramFactory', patientOdontogramFactory);

      usersFactory = {};
      $provide.value('UsersFactory', usersFactory);

      patientServicesFactory = {
        access: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('PatientServicesFactory', patientServicesFactory);

      patientConditionsFactory = {};
      $provide.value('PatientConditionsFactory', patientConditionsFactory);

      treatmentPlansFactory = {};
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      //#endregion

      //#region mocks for services

      conditionsService = {};
      $provide.value('ConditionsService', conditionsService);

      patientServices = {
        TreatmentPlans: {
          getHeadersWithServicesSummary: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy(),
          }),
        },
      };
      $provide.value('PatientServices', patientServices);

      userServices = {};
      $provide.value('UserServices', userServices);

      //mock for patSecurityService
      patSecurityService = {
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),
        logout: jasmine.createSpy(),
        IsAuthorizedByAbbreviationAtLocation: jasmine.createSpy(),
      };
      $provide.value('patSecurityService', patSecurityService);
      //#endregion
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    scope = $rootScope.$new();
    filter = $injector.get('$filter');
    q = $q;

    listHelper = {};

    $rootScope.patAuthContext = {
      isAuthorized: true,
      userInfo: {
        userid: '1111111',
      },
    };

    //mock for localize
    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (value) {
          return value;
        }),
    };
    rootScope = $rootScope;

    //mock for toothSelectionService
    toothSelectionService = {
      selection: { teeth: ['S'] },
    };

    //creating controller
    ctrl = $controller('PatientConditionCreateUpdateController', {
      $scope: scope,
      $rootScope: rootScope,
      StaticData: staticData,
      ListHelper: listHelper,
      localize: localize,
      ToothSelectionService: toothSelectionService,
      $filter: filter,
      $attrs: {
        isswiftcode: false,
        isfirstcode: false,
        islastcode: false,
        isedit: true,
        isNewTreatmentPlan: true,
        treatmentPlanId: null,
      },
      patSecurityService: patSecurityService,
      toastrFactory: toastrFactory,
      PatientOdontogramFactory: patientOdontogramFactory,
      UsersFactory: usersFactory,
      PatientServicesFactory: patientServicesFactory,
      PatientConditionsFactory: patientConditionsFactory,
      TreatmentPlansFactory: treatmentPlansFactory,
      ConditionsService: conditionsService,
      PatientServices: patientServices,
      PatientLogic: patientLogic,
      UserServices: userServices,
    });

    ctrl.$onInit();
  }));

  //controller
  it('ProposedServiceCreateUpdateController should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe('validateForm function -> ', function () {
    it('should set formIsValid to false and return if no activeTeeth selected and area is not 1, 2, or 6', function () {
      for (var i = 1; i < 8; i++) {
        switch (i) {
          case 1:
          case 2:
          case 6:
            break;
          default:
            scope.area = i;
            scope.activeTeeth = [];
            scope.validateForm();
            expect(scope.formIsValid).toEqual(false);
            break;
        }
      }
    });

    it('should set formIsValid to false and return if area is 4 and no surfaces are selected', function () {
      scope.area = 4;
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.surfaces = [];
      scope.validateForm();
      expect(scope.formIsValid).toEqual(false);
    });

    it('should set formIsValid to false and return if validDate is false ', function () {
      scope.validDate = false;
      scope.validateForm();
      expect(scope.formIsValid).toEqual(false);
    });

    it('should set formIsValid to false and return if area is 3 (roots) and scope.activeTeeth only has one tooth and no roots have been selected', function () {
      scope.area = 3;
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.activeTeeth = ['2'];
      scope.roots = [
        { RootName: 'Sgl', RootAbbreviation: 'S', selected: false },
        { RootName: 'Bcl', RootAbbreviation: 'B', selected: false },
      ];
      scope.validateForm();
      expect(scope.formIsValid).toEqual(false);
    });

    it('should set formIsValid to true and return if area is 3 (roots) and scope.activeTeeth has multipleTeeth', function () {
      scope.area = 3;
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.activeTeeth = ['2', '3'];
      scope.roots = [
        { RootName: 'Sgl', RootAbbreviation: 'S', selected: true },
        { RootName: 'Bcl', RootAbbreviation: 'B', selected: false },
      ];
      scope.validateForm();
      expect(scope.formIsValid).toEqual(true);
    });
  });

  describe('watch activeTeeth ->', function () {
    it('should set dataHasChanged to true when new value', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.dataHasChanged = false;
      scope.activeTeeth = [];
      scope.$apply();
      scope.activeTeeth = ['2'];
      scope.$apply();
      expect(scope.dataHasChanged).toEqual(true);
    });

    it('should call setToothData when new value', function () {
      spyOn(ctrl, 'setToothData');
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.dataHasChanged = false;
      scope.activeTeeth = [];
      scope.$apply();
      scope.activeTeeth = ['2'];
      scope.$apply();
      expect(ctrl.setToothData).toHaveBeenCalled();
    });

    it('should call validateForm when new value', function () {
      spyOn(scope, 'validateForm');
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.dataHasChanged = false;
      scope.activeTeeth = [];
      expect(scope.validateForm).not.toHaveBeenCalled();
      scope.$apply();
      scope.activeTeeth = ['2'];
      scope.$apply();
      expect(scope.validateForm).toHaveBeenCalled();
    });
  });

  describe('watch activeSurfaces ->', function () {
    it('should set dataHasChanged to true when new value', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.dataHasChanged = false;
      scope.activeSurfaces = [];
      scope.$apply();
      scope.activeSurfaces = ['D'];
      scope.$apply();
      expect(scope.dataHasChanged).toEqual(true);
    });

    it('should call validateForm', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.dataHasChanged = false;
      scope.smartCodeGroupSelected = true;
      scope.editMode = true;
      spyOn(scope, 'validateForm');
      scope.activeSurfaces = [];
      scope.$apply();
      scope.activeSurfaces = ['D'];
      scope.$apply();
      expect(scope.validateForm).toHaveBeenCalled();
    });
  });
  describe('ctrl.getConditionStatuses ->', function () {
    it('should call staticData.ConditionStatus ', function () {
      staticData.ConditionStatus = jasmine.createSpy().and.returnValue({
        then: function (cb) {
          cb({ Value: [] });
        },
      });
      ctrl.getConditionStatuses();
    });
  });

  describe('serviceTransactionConditionStatusIdChanged $watch function ->', function () {
    beforeEach(function () {
      ctrl.serviceTransactionConditionStatusIdChanged = jasmine.createSpy();
    });

    it('should call ctrl.serviceTransactionConditionStatusIdChanged with new value and old value', function () {
      scope.patientCondition = { Status: 2 };
      scope.$apply();
      scope.patientCondition = { Status: 1 };
      scope.$apply();
      expect(
        ctrl.serviceTransactionConditionStatusIdChanged
      ).toHaveBeenCalledWith(1, 2);
    });
  });
});
