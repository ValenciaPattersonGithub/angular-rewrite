import { of } from 'rsjs';

describe('PerioController ->', function () {
  var toastrFactory,
    scope,
    ctrl,
    routeParams,
    location,
    localize,
    filter,
    perioService;
  var modalInstance, modalFactoryDeferred, q, timeout;
  var patientPerioExamFactory,
    modalFactory,
    listHelper,
    patientOdontogramFactory,
    soarAnimation,
    patSecurityService,
    staticData,
    toothSelectionService;
  var patientPerioService;
  var patientServices;
  var referenceDataService;
  var featureFlagService;

  // region for mocks
  var examStateMock =
    ('ExamState',
    {
      EditMode: 'EditMode',
      None: 'None',
      Cancel: 'Cancel',
      Continue: 'Continue',
      Start: 'Start',
      Save: 'Save',
      SaveComplete: 'SaveComplete',
      Initializing: 'Initializing',
      Loading: 'Loading',
      ViewMode: 'ViewMode',
    });

  var details = [
    {
      $RootCount: undefined,
      AttachmentLvl: [null, null, null, null, null, null],
      BleedingPocket: [null, null, null, null, null, null],
      DepthPocket: [null, null, null, null, null, null],
      ExamId: null,
      FurcationGradeRoot: [null, null, null],
      GingivalMarginPocket: [null, null, null, null, null, null],
      MgjPocket: [null, null, null, null, null, null],
      Mobility: null,
      PatientId: 'b6dbd840-f15f-42c8-98bf-ed079e89c67e',
      SuppurationPocket: [null, null, null, null, null, null],
      ToothId: null,
      ToothNumber: 1,
      ToothState: 'Missing',
    },
    {
      $RootCount: undefined,
      AttachmentLvl: [null, null, null, null, null, null],
      BleedingPocket: [null, null, null, null, null, null],
      DepthPocket: [null, null, null, null, null, null],
      ExamId: null,
      FurcationGradeRoot: [null, null, null],
      GingivalMarginPocket: [null, null, null, null, null, null],
      MgjPocket: [null, null, null, null, null, null],
      Mobility: null,
      PatientId: 'b6dbd840-f15f-42c8-98bf-ed079e89c67e',
      SuppurationPocket: [null, null, null, null, null, null],
      ToothId: 2,
      ToothNumber: 2,
      ToothState: 'Missing',
    },
    {
      $RootCount: undefined,
      AttachmentLvl: [null, null, null, null, null, null],
      BleedingPocket: [null, null, null, null, null, null],
      DepthPocket: [null, null, null, null, null, null],
      ExamId: null,
      FurcationGradeRoot: [null, null, null],
      GingivalMarginPocket: [null, null, null, null, null, null],
      MgjPocket: [null, null, null, null, null, null],
      Mobility: null,
      PatientId: 'b6dbd840-f15f-42c8-98bf-ed079e89c67e',
      SuppurationPocket: [null, null, null, null, null, null],
      ToothId: 3,
      ToothNumber: 3,
      ToothState: '',
    },
    {
      $RootCount: undefined,
      AttachmentLvl: [null, null, null, null, null, null],
      BleedingPocket: [null, null, null, null, null, null],
      DepthPocket: [null, null, null, null, null, null],
      ExamId: null,
      FurcationGradeRoot: [null, null, null],
      GingivalMarginPocket: [null, null, null, null, null, null],
      MgjPocket: [null, null, null, null, null, null],
      Mobility: null,
      PatientId: 'b6dbd840-f15f-42c8-98bf-ed079e89c67e',
      SuppurationPocket: [null, null, null, null, null, null],
      ToothId: 4,
      ToothNumber: 4,
      ToothState: 'Implant',
    },
  ];

  var mockPerioExam = {
    ExamDetails: details,
    ExamHeader: {
      PatientId: 'b6dbd840-f15f-42c8-98bf-ed079e89c67e',
      ExamId: null,
    },
  };

  //#region mocks for factories

  beforeEach(
    module('Soar.Patient', function ($provide) {
      perioService = {
        get: jasmine.createSpy().and.callFake(function () {
          var deferred = q.defer();
          deferred.$promise = deferred.promise;
          deferred.resolve({});
          return deferred;
        }),
      };
      $provide.value('PerioService', perioService);

      // mock patientPerioExamFactory
      patientPerioExamFactory = {
        ExamState: 'SaveComplete',
        DataChanged: true,
        access: jasmine.createSpy().and.returnValue({ View: true }),
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        get: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        merge: jasmine.createSpy().and.returnValue({}),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        validateExam: jasmine.createSpy().and.returnValue({}),
        deleteExam: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        setExamState: jasmine.createSpy("setExamState").and.returnValue({}),
        setSelectedExamId: jasmine.createSpy().and.returnValue({}),
        setActiveQuadrant: jasmine.createSpy().and.returnValue({}),
        setActiveExam: jasmine.createSpy().and.returnValue({}),

        setDataChanged: jasmine.createSpy().and.returnValue({}),
        //DataChanged: jasmine.createSpy().and.returnValue({}),
        getNewExam: jasmine.createSpy().and.returnValue(mockPerioExam),
        observeExams: jasmine.createSpy().and.returnValue({}),
        SetActivePerioExam: jasmine.createSpy().and.returnValue({}),
        ActivePerioExam: jasmine.createSpy().and.returnValue({}),
        AcceptableKeyCodes: jasmine.createSpy().and.returnValue({}),
        ValueByKeyCode: jasmine.createSpy().and.returnValue({}),
        ValueByInputValue: jasmine.createSpy().and.returnValue({}),
        getNextValidTooth: jasmine.createSpy().and.returnValue({}),
        ActiveArch: jasmine.createSpy().and.returnValue({}),
        ActiveSide: jasmine.createSpy().and.returnValue({}),
        NextExamType: jasmine.createSpy().and.returnValue({}),
        setActiveExamParameters: jasmine.createSpy().and.returnValue({}),
        ConvertToBoolean: jasmine.createSpy().and.returnValue({}),
        ToggleExam: false,
        setToggleExam: jasmine.createSpy().and.returnValue({}),
        setActiveTooth: jasmine.createSpy().and.returnValue({}),
        // yes these are duplicates to ActiveQuadrant, but that is used to drive other behavior
        ActivePerioQuadrant: null,
        setActivePerioQuadrant: jasmine.createSpy().and.returnValue({}),
        setActiveToothIndex: jasmine.createSpy().and.returnValue({}),
        setActivePerioFocus: jasmine.createSpy().and.returnValue({}),
        ArrowAdvanceToNextValidTooth: jasmine.createSpy().and.returnValue('2'),
        ExamTypes: [{}],
        FocusedIndex: 0,
        ActiveExamPath: {
          ToothPockets: [],
        },
        setFocusedIndex: jasmine.createSpy(),
        observeFocusedIndex: jasmine.createSpy().and.returnValue(5),
      };

      patientPerioService = {
        setLoadPreviousOption: jasmine
          .createSpy()
          .and.callFake(function (value) {
            return value;
          }),
        loadPreviousExamReading: true,
      };

      patientServices = {
        ClinicalOverviews: {
          getAll: jasmine
            .createSpy("patientServices.ClinicalOverviews.getAll")
            .and.callFake((_list) => {
              var deferred = q.defer();
              deferred.$promise = deferred.promise;
              deferred.resolve({
                Value: [],
              });
              return deferred.promise;
            }),
        }
      };

      referenceDataService = {
        getData: jasmine
          .createSpy("referenceDataService.getData")
          .and.callFake((_getConditions) => {
            var deferred = q.defer();
            deferred.resolve([]);
            return deferred.promise;
          }),
      };

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);

      modalFactory = {
        Modal: jasmine
          .createSpy('modalFactory.Modal')
          .and.callFake(function () {
            modalFactoryDeferred = q.defer();
            modalFactoryDeferred.resolve(1);
            return {
              result: modalFactoryDeferred.promise,
              then: function () {},
            };
          }),
      };

      listHelper = {
        findItemByFieldValue: jasmine.createSpy().and.returnValue({}),
        findIndexByFieldValue: jasmine.createSpy().and.returnValue(0),
      };

      patientOdontogramFactory = {
        access: jasmine.createSpy().and.returnValue({ View: true }),
        getMouthStatus: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        getChartedTeeth: jasmine.createSpy().and.returnValue({}),
      };

      // mock toastrFactory
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();

      //mock for soarAnimation factory
      soarAnimation = {
        soarFlashBG: jasmine.createSpy(),
      };

      //mock for patSecurityService
      patSecurityService = {
        generateMessage: jasmine.createSpy().and.returnValue(''),
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
      };

      //mock for staticData
      staticData = {
        TeethDefinitions: jasmine.createSpy().and.callFake(function () {
          var deferrred = q.defer();
          var result = { Value: { Teeth: [] } };
          deferrred.resolve(result);
          return deferrred.promise;
        }),
      };

      //mock for toothSelectionService
      toothSelectionService = {
        selection: { teeth: ['S'] },
      };
    })
  );

  // #region mock controller

  beforeEach(inject(function ($rootScope, $filter, $location, $routeParams) {
    scope = $rootScope.$new();
    filter = $filter;
    location = $location;
    routeParams = $routeParams;

    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };
  }));

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    timeout = $injector.get('$timeout');

    ctrl = $controller('PatientPerioController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      examState: examStateMock,
      $routeParams: routeParams,
      $filter: filter,
      $location: location,
      $timeout: timeout,
      localize: localize,
      PatientOdontogramFactory: patientOdontogramFactory,
      toothSelectionService: toothSelectionService,
      staticData: staticData,
      patSecurityService: patSecurityService,
      soarAnimation: soarAnimation,
      toastrFactory: toastrFactory,
      listHelper: listHelper,
      modalFactory: modalFactory,
      PatientPerioExamFactory: patientPerioExamFactory,
      patientPerioService: patientPerioService,
      patientServices: patientServices,
      referenceDataService: referenceDataService,
      // personId: '134',
    });

    scope.toothExam = angular.copy(mockPerioExam.ExamDetails[0]);

    scope.keypadModel = {
      examType: '',
      onInputChange: Date.now(),
      value: false,
      numericInputLimit: 20,
      pocketInputRestricted: false,
      incrementationLimit: false,
    };
  }));

  //#endregion
  describe('ctrl.finishExam method ->', function () {
    it('should call patientPerioExamFactory.DataChanged', function () {
      patientPerioExamFactory.DataChanged = true;
      spyOn(scope, 'saveExam');
      ctrl.finishExam();
      expect(patientPerioExamFactory.DataChanged).toEqual(true);
      expect(scope.saveExam).toHaveBeenCalled();
      expect(scope.savingExam).toBe(false);
    });

    it('should not call patientPerioExamFactory.DataChanged', function () {
      patientPerioExamFactory.DataChanged = false;
      spyOn(scope, 'saveExam');
      ctrl.finishExam();
      //expect(patientPerioExamFactory.setDataChanged).toEqual(false);
      expect(scope.savingExam).toBe(false);
    });

    it('should navigate away if both are equal', function () {
      spyOn(ctrl, 'initProperties').and.callFake(function () {});
      spyOn(ctrl, 'preLoadExam').and.callFake(function () {});
      spyOn(scope, 'saveExam');
      ctrl.finishExam();
      expect(scope.savingExam).toBe(false);
    });
    it('should not navigate away if those are not same ', function () {
      patientPerioExamFactory.setExamState = 'EditMode';
      expect(patientPerioExamFactory.setExamState).toBe(examStateMock.EditMode);
    });
  });

  //describe('ctrl.getNewExam method ->', function () {
  //    beforeEach(function () {
  //        scope.perioExamHeaders = ['test'];
  //        scope.$parent = {
  //            $parent: {
  //                $parent: {
  //                    $parent: { dataHasChanged: 'test' }
  //                }
  //            }
  //        };

  //    });

  //    it('should call patientPerioExamFactory.getNewExam when exam is passed in', function () {
  //        scope.getUsersPerioExamSettings = jasmine.createSpy();
  //        //ctrl.getNewExam = jasmine.createSpy();
  //        ctrl.initProperties = jasmine.createSpy();
  //        //patientPerioExamFactory = {
  //        //    getNewExam: jasmine.createSpy(),
  //        //    SetActivePerioExam: jasmine.createSpy().and.returnValue('0')
  //        //};
  //        scope.personId = '1';
  //        scope.chartedTeeth = '2';

  //        ctrl.getNewExam('test');
  //        expect(patientPerioExamFactory.getNewExam).toHaveBeenCalled();
  //    });

  //});
});
