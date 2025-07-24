describe('PerioLandingController ->', function () {
  var routeParams,
    toastrFactory,
    $uibModal,
    timeout,
    scope,
    $httpBackend,
    ctrl,
    element,
    compile,
    listHelper,
    staticData,
    toothSelector,
    examState;
  var modalInstance, modalFactory, modalFactoryDeferred, q;
  var patientPerioExamFactory, patientPerioService;

  //#region mocks
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

  var mockMouthStatus =
    '3;4;5;6;D;E;9,Missing;10;11;12;13;14;15;17;18,Implant;19;20;21,Missing;22;23,Implant;O;25;26;27;28;29;30;31;32';

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

  //#endregion

  //#region factories and services mocks

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
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
      };
      $provide.value('PatientPerioExamFactory', patientPerioExamFactory);

      // mock toastrFactory
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      patientPerioService = {
        setLoadPreviousOption: jasmine
          .createSpy()
          .and.callFake(function (value) {
            return value;
          }),
      };
      $provide.value('patientPerioService', patientPerioService);
      $provide.value('ExamState', {
        EditMode: 'EditMode',
        Start: 'Start',
        Loading: 'Loading',
      });
    })
  );

  //#endregion

  // #region controller mock

  // create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $route,
    $routeParams,
    $compile,
    $timeout,
    $location,
    $uibModal,
    $q
  ) {
    q = $q;
    timeout = $timeout;
    compile = $compile;
    routeParams = $routeParams;
    $uibModal = $uibModal;
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

    ctrl = $controller('PerioLandingController', {
      $scope: scope,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      personId: 'b6dbd840-f15f-42c8-98bf-ed079e89c67e',
    });

    scope.perioGraphActive = {};
  }));

  //#endregion

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('initExam method -> ', function () {
    it('should call scope.startExam', function () {
      spyOn(scope, 'startExam');
      scope.initExam();
      timeout.flush(3001);
      expect(scope.startExam).toHaveBeenCalled();
    });

    it('should set state', function () {
      scope.initExam();
      expect(scope.examStarted).toBe(true);
      expect(patientPerioExamFactory.setExamState).toHaveBeenCalledWith(
        examStateMock.Loading
      );
    });
  });

  describe('startExam method -> ', function () {
    it('should set state to EditMode if viewOrEditMode is true', function () {
      scope.startExam(true);
      expect(patientPerioExamFactory.setExamState).toHaveBeenCalledWith(
        examStateMock.EditMode
      );
    });

    it('should set state to Start if viewOrEditMode is false', function () {
      scope.startExam(false);
      expect(patientPerioService.setLoadPreviousOption).toHaveBeenCalledWith(
        false
      );
      expect(patientPerioExamFactory.setExamState).toHaveBeenCalledWith(
        examStateMock.Start
      );
    });

    it('should call patientPerioService.setLoadPreviousOption with true when loadPrevious is true', function () {
      scope.startExam(false, true);
      expect(patientPerioService.setLoadPreviousOption).toHaveBeenCalledWith(
        true
      );
    });
  });

  describe('examOptionClicked method -> ', function () {
    it('should call initExam with false, false when option matches first item in perioOptionList', function () {
      scope.perioOptionList = ['1', '2'];
      scope.initExam = jasmine.createSpy();
      scope.examOptionClicked('1');
      expect(scope.initExam).toHaveBeenCalledWith(false, false);
    });

    it('should call initExam with false, true when option matches second item in perioOptionList', function () {
      scope.perioOptionList = ['1', '2'];
      scope.initExam = jasmine.createSpy();
      scope.examOptionClicked('1');
      expect(scope.initExam).toHaveBeenCalledWith(false, false);
    });
  });

  describe('setViewOrEditMode method -> ', function () {
    it('should set state to EditMode if currentExamId is not null ', function () {
      scope.currentExamId = 'abc';
      ctrl.setViewOrEditMode();
      expect(scope.viewOrEditMode).toBe(true);
      expect(scope.initializingExam).toBe(true);
    });

    it('should set state New Exam if if currentExamId is null', function () {
      scope.currentExamId = null;
      ctrl.setViewOrEditMode();
      expect(scope.viewOrEditMode).toBe(false);
    });
  });
});
