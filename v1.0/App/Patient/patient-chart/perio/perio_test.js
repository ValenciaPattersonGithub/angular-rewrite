import { of } from 'rsjs';

describe('PatientPerioController ->', function () {
  var toastrFactory, timeout, scope, ctrl, toothSelector;
  var modalInstance, modalFactory, modalFactoryDeferred, q;
  var patientPerioExamFactory, patientOdontogramFactory;
  var patientPerioService;
  var trueOrFalse = true;
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
      $$FurcationReadingsAllowed: undefined,
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
      $$FurcationReadingsAllowed: undefined,
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
      $$FurcationReadingsAllowed: undefined,
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
      $$FurcationReadingsAllowed: undefined,
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

  var patientServices;
  var referenceDataService;
  var featureFlagService;



  //#endregion

  //#region factories and services mocks

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientPerioService = {
        setLoadPreviousOption: jasmine
          .createSpy()
          .and.callFake(function (value) {
            return value;
          }),
        loadPreviousExamReading: true,
      };

      // mock patientPerioExamFactory
      patientPerioExamFactory = {
        access: jasmine.createSpy().and.returnValue({ View: true }),
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        get: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        merge: jasmine.createSpy().and.returnValue({}),
        process: jasmine.createSpy().and.returnValue({}),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        validateExam: jasmine.createSpy().and.returnValue(trueOrFalse),
        deleteExam: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        setExamState: jasmine.createSpy().and.returnValue({}),
        setSelectedExamId: jasmine.createSpy().and.returnValue({}),
        setActiveQuadrant: jasmine.createSpy().and.returnValue({}),
        setActiveExam: jasmine.createSpy().and.returnValue({}),
        setActiveTooth: jasmine.createSpy().and.returnValue({}),
        setDataChanged: jasmine.createSpy().and.returnValue({}),
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
        // yes these are duplicates to ActiveQuadrant, but that is used to drive other behavior
        ActivePerioQuadrant: null,
        setActivePerioQuadrant: jasmine.createSpy().and.returnValue({}),
        setActiveToothIndex: jasmine.createSpy().and.returnValue({}),
        setActivePerioFocus: jasmine.createSpy().and.returnValue({}),
        ExamTypes: [{}],
      };
      $provide.value('PatientPerioExamFactory', patientPerioExamFactory);

      // mock patientPerioExamFactory
      patientOdontogramFactory = {
        access: jasmine.createSpy().and.returnValue({ View: true }),
        getMouthStatus: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        getChartedTeeth: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('PatientOdontogramFactory', patientOdontogramFactory);

      toothSelector = {
        toothData: {
          1: {
            isPrimary: false,
            permanentNumber: 1,
            primaryLetter: '',
            quadrant: 'ur',
            arch: 'u',
            watchIds: null,
            watchTeeth: null,
          },
        },
        selection: { teeth: [{ position: -1 }] },
        selectTooth: jasmine.createSpy(),
        selectToothGroup: jasmine.createSpy(),
        getToothId: jasmine.createSpy().and.returnValue('test'),
      };
      $provide.value('ToothSelectionService', toothSelector);

      // mock toastrFactory
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      patientServices = {
        ClinicalOverviews: {
          getAll: jasmine
            .createSpy("patientServices.ClinicalOverviews.getAll")
            .and.returnValue({
              $promise: new Promise((resolve, reject) => {
                resolve({ Value: [] })
              }),
            }),
        }
      };
      $provide.value('PatientServices', patientServices)

      referenceDataService = {
        entityNames: {
          conditions: 'conditions',
        },
        getData: jasmine
          .createSpy("referenceDataService.getData")
          .and.returnValue(new Promise((resolve, reject) => {
            resolve([])
          })),
      };
      $provide.value('referenceDataService', referenceDataService)

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);
    })
  );

  //#endregion

  // #region controller mock

  // create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $timeout,
    $uibModal,
    $q
  ) {
    q = $q;
    timeout = $timeout;
    spyOn($uibModal, 'open').and.callThrough();

    modalInstance = {
      close: jasmine.createSpy('modalInstance.close').and.returnValue({}),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    //mock for modalFactory
    modalFactory = {
      ConfirmLockModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      DeleteModal: jasmine
        .createSpy('modalFactory.DeleteModal')
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
    };

    scope = $rootScope.$new();
    scope.$parent = $rootScope.$new();
    scope.$parent.$parent = $rootScope.$new();
    scope.$parent.$parent.$parent = $rootScope.$new();
    scope.$parent.$parent.$parent.$parent = $rootScope.$new();

    scope.getUsersPerioExamSettings = jasmine.createSpy();

    ctrl = $controller('PatientPerioController', {
      $scope: scope,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      personId: 'b6dbd840-f15f-42c8-98bf-ed079e89c67e',
      patientPerioService: patientPerioService,
    });
  }));

  //#endregion

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('backupExam method -> ', function () {
    it('should set originalExam equal perioExam', function () {
      scope.activePerioExam = angular.copy(mockPerioExam);
      ctrl.backupExam();
      expect(ctrl.originalExam).toEqual(scope.activePerioExam);
    });
  });

  describe('initNewExam method -> ', function () {
    it('should call CancelModal if data has changed', function () {
      patientPerioExamFactory.DataChanged = true;
      ctrl.initNewExam();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });

    it('should call confirmResetNote if data has not changed', function () {
      spyOn(ctrl, 'startExam');
      patientPerioExamFactory.DataChanged = false;
      ctrl.initNewExam();
      expect(ctrl.startExam).toHaveBeenCalled();
    });
  });

  describe('getNewExam method -> ', function () {
    it('should set perioExam to a copy of the newExamTemplate', function () {
      spyOn(ctrl, 'getNewExam');
      ctrl.newExamTemplate = angular.copy(mockPerioExam);
      var template = angular.copy(mockPerioExam);
      ctrl.getNewExam();
      expect(ctrl.newExamTemplate).toEqual(template);
    });
  });

  describe('startExam method -> ', function () {
    it('should call getNewExam', function () {
      spyOn(ctrl, 'getNewExam');
      ctrl.startExam();
      timeout.flush();
      expect(ctrl.getNewExam).toHaveBeenCalled();
    });

    it('should call patientPerioExamFactory.getById', function () {
      patientPerioExamFactory.getById = jasmine
        .createSpy()
        .and.returnValue({ then: jasmine.createSpy() });
      scope.perioExamHeaders = ['test'];
      ctrl.startExam();
      timeout.flush();
      expect(patientPerioExamFactory.getById).toHaveBeenCalled();
    });

    it('should set examState to Start', function () {
      ctrl.startExam();
      expect(patientPerioExamFactory.setExamState).toHaveBeenCalledWith(
        examStateMock.Start
      );
    });
  });

  describe('saveExam method -> ', function () {
    it('should call patientPerioExamFactory.validateExam', function () {
      scope.saveExam();
      expect(patientPerioExamFactory.validateExam).toHaveBeenCalled();
    });

    it('should call patientPerioExamFactory.save if valid', function () {
      scope.saveExam();
      expect(patientPerioExamFactory.save).toHaveBeenCalled();
    });
  });

  describe('cancel method -> ', function () {
    it('should call CancelModal if data has changed', function () {
      patientPerioExamFactory.DataChanged = true;
      scope.cancel();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });

    it('should call confirmCancel if data has not changed', function () {
      spyOn(ctrl, 'confirmCancel');
      patientPerioExamFactory.DataChanged = false;
      scope.cancel();
      expect(ctrl.confirmCancel).toHaveBeenCalled();
    });
  });

  describe('continueExam method -> ', function () {
    it('should set examState to Continue', function () {
      ctrl.continueExam();
      expect(patientPerioExamFactory.setExamState).toHaveBeenCalledWith(
        examStateMock.Continue
      );
    });
  });

  describe('confirmCancel method -> ', function () {
    it('should set examState to Continue', function () {
      ctrl.confirmCancel();
    });
  });

  describe('calcAttachmentLvl method -> ', function () {
    it('should set AttachmentLvl to null if no reading for GingivalMarginPocket or DepthPocket', function () {
      scope.perioExam = angular.copy(mockPerioExam);
      // reset some of the detail from null
      scope.perioExam.ExamDetails[0].DepthPocket = [1, 3, 5, 9, 7, 2];
      scope.perioExam.ExamDetails[0].GingivalMarginPocket = [3, 5, 6, 4, 7, 9];
      scope.perioExam.ExamDetails[1].DepthPocket = [2, 1, 5, 6, 4, 3];
      scope.perioExam.ExamDetails[1].GingivalMarginPocket = [
        2,
        5,
        2,
        -1,
        null,
        6,
      ];
      scope.perioExam.ExamDetails[2].DepthPocket = [1, null, 3, 5, -5, 2];
      scope.perioExam.ExamDetails[2].GingivalMarginPocket = [
        3,
        null,
        4,
        4,
        4,
        -4,
      ];

      ctrl.calcAttachmentLvl();

      expect(scope.perioExam.ExamDetails[2].AttachmentLvl[1]).toBeNull();
    });

    it('should calculate AttachmentLvl if reading for GingivalMarginPocket or DepthPocket', function () {
      scope.activePerioExam = angular.copy(mockPerioExam);
      // reset some of the detail from null
      scope.activePerioExam.ExamDetails[0].DepthPocket = [1, 3, 5, 9, 7, 2];
      scope.activePerioExam.ExamDetails[0].GingivalMarginPocket = [
        3, 5, 6, 4, 7, 9,
      ];
      scope.activePerioExam.ExamDetails[1].DepthPocket = [2, 1, 5, 6, 4, 3];
      scope.activePerioExam.ExamDetails[1].GingivalMarginPocket = [
        2,
        5,
        -9,
        -1,
        null,
        6,
      ];
      scope.activePerioExam.ExamDetails[2].DepthPocket = [1, null, 3, 5, -5, 2];
      scope.activePerioExam.ExamDetails[2].GingivalMarginPocket = [
        3,
        null,
        4,
        4,
        4,
        -4,
      ];

      ctrl.calcAttachmentLvl();

      expect(scope.activePerioExam.ExamDetails[1].AttachmentLvl).toEqual([
        4, 6, -4, 5, 4, 9,
      ]);
    });
  });

  describe('loadExamTemplate method -> ', function () {
    it('should call patientOdontogramFactory.getChartedTeeth', function () {
      ctrl.loadExamTemplate();
      expect(patientOdontogramFactory.getChartedTeeth).toHaveBeenCalled();
    });

    it('should load new exam template', async function () {
      await ctrl.loadExamTemplate();
      expect(ctrl.newExamTemplate).toEqual(mockPerioExam);
    });

    it('should set exam state', async function () {
      await ctrl.loadExamTemplate();
      expect(patientPerioExamFactory.setExamState).toHaveBeenCalledWith(
        examStateMock.None
      );
    });
  });

  describe('initLoadExam method -> ', function () {
    it('should call CancelModal if data has changed', function () {
      patientPerioExamFactory.DataChanged = true;
      ctrl.initLoadExam();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });

    it('should call preLoadExam if data has not changed', function () {
      spyOn(ctrl, 'preLoadExam');
      patientPerioExamFactory.DataChanged = false;
      ctrl.initLoadExam();
      expect(ctrl.preLoadExam).toHaveBeenCalled();
    });
  });

  describe('preLoadExam method -> ', function () {
    it('should set state', function () {
      ctrl.preLoadExam();
      expect(scope.loadingExam).toBe(true);
      expect(patientPerioExamFactory.setExamState).toHaveBeenCalledWith(
        examStateMock.Loading
      );
    });

    it('should call loadExam', function () {
      spyOn(ctrl, 'loadExam');
      ctrl.preLoadExam();
      timeout.flush(3001);
      expect(ctrl.loadExam).toHaveBeenCalled();
    });
  });

  describe('loadExam method -> ', function () {
    var value = 'value';
    beforeEach(function () {
      patientPerioExamFactory.getById = jasmine.createSpy().and.returnValue({
        then: function (cb) {
          cb({ Value: value });
        },
      });
    });

    it('should call patientPerioExamFactory.getById', function () {
      ctrl.loadExam();
      expect(patientPerioExamFactory.getById).toHaveBeenCalled();
    });

    it('should call patientPerioExamFactory.SetActivePerioExam with null', function () {
      patientPerioExamFactory.SetActivePerioExam.calls.reset();
      ctrl.loadExam();
      expect(patientPerioExamFactory.SetActivePerioExam).toHaveBeenCalledWith(
        null
      );
    });

    it('should call patientPerioExamFactory.process with correct parameter', function () {
      ctrl.loadExam();
      expect(patientPerioExamFactory.process).toHaveBeenCalledWith(value);
    });

    it('should set values and call methods with process results', function () {
      var processResult = { Data: 'data' };
      patientPerioExamFactory.process = jasmine
        .createSpy()
        .and.returnValue(processResult);
      patientPerioExamFactory.setDataChanged.calls.reset();
      patientPerioExamFactory.setExamState.calls.reset();
      scope.activePerioExam = null;
      ctrl.calcAttachmentLvl = jasmine.createSpy();
      ctrl.backupExam = jasmine.createSpy();

      ctrl.loadExam();

      expect(patientPerioExamFactory.SetActivePerioExam).toHaveBeenCalledWith(
        processResult
      );
      expect(scope.perioExam).toBe(processResult);
      expect(scope.activePerioExam).toBe(
        patientPerioExamFactory.ActivePerioExam
      );
      expect(scope.loadingExam).toBe(false);
      expect(scope.viewOnly).toBe(true);
      expect(ctrl.calcAttachmentLvl).toHaveBeenCalled();
      expect(ctrl.backupExam).toHaveBeenCalled();
      expect(patientPerioExamFactory.setDataChanged).toHaveBeenCalledWith(
        false
      );
      expect(patientPerioExamFactory.setExamState).toHaveBeenCalledWith(
        examStateMock.ViewMode
      );
    });
  });

  describe('loadMouthStatus method -> ', function () {
    it('should call patientOdontogramFactory.getMouthStatus', function () {
      ctrl.loadMouthStatus();
      expect(patientOdontogramFactory.getMouthStatus).toHaveBeenCalled();
    });
  });
});
