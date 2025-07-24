describe('PerioReadingsPrintController ->', function () {
  var toastrFactory, scope, ctrl;
  var modalInstance;
  var patientPerioExamFactory;

  //#region mocks
  var loadingQueueMock = [
    { load: true },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
    { load: false },
  ];

  var trueOrFalse = true;

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
        setActiveExamParameters: jasmine.createSpy().and.returnValue({}),
        setToggleExam: jasmine.createSpy().and.returnValue({}),
        setActivePerioFocus: jasmine.createSpy().and.returnValue({}),
        setActiveToothIndex: jasmine.createSpy().and.returnValue({}),
        setActiveExamType: jasmine.createSpy().and.returnValue({}),
      };

      $provide.value('PatientPerioExamFactory', patientPerioExamFactory);

      // mock toastrFactory
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
      $provide.value('ExamState', {});
    })
  );

  //#endregion
  //  <perio-readings ng-if="loadingQueue[0].load" queue="loadingQueue" exam="perioExam.ExamDetails" exam-type="DepthPocket" exam-title="'Pocket Depth'"></perio-readings>

  // #region controller mock

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    var exam = angular.copy(mockPerioExam);
    // directive scope
    scope.exam = exam.ExamDetails;
    scope.queue = loadingQueueMock;
    scope.quadrant = 'UL';
    scope.examTitle = 'Pocket Depth';

    ctrl = $controller('PerioReadingsPrintController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      personId: 'b6dbd840-f15f-42c8-98bf-ed079e89c67e',
    });
  }));

  //#endregion

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).toBeDefined();
    });
  });

  describe('getToothRange method -> ', function () {
    it('should return a true if tooth is within range', function () {
      var toothExam = scope.exam[1];
      expect(toothExam.ToothNumber).toBe(2);
      var returnVal = scope.getToothRange(toothExam, 1, 16);
      expect(returnVal(scope.exam[1])).toBe(true);
    });

    it('should return a false if tooth is not within range', function () {
      var toothExam = scope.exam[1];
      expect(toothExam.ToothNumber).toBe(2);
      var returnVal = scope.getToothRange(toothExam, 17, 32);
      expect(returnVal(scope.exam[1])).toBe(false);
    });
  });

  describe('filterExam method -> ', function () {
    it('should set range start and end based on quadrant', function () {
      scope.quadrant = 'UB';
      ctrl.filterExam();
      expect(scope.rangeStart).toBe(0);
      expect(scope.rangeEnd).toBe(16);

      scope.quadrant = 'LL';
      ctrl.filterExam();
      expect(scope.rangeStart).toBe(16);
      expect(scope.rangeEnd).toBe(32);
    });

    it('should set inputArray based on quadrant', function () {
      scope.quadrant = 'UB';
      ctrl.filterExam();
      expect(scope.inputArray).toEqual([0, 1, 2]);

      scope.quadrant = 'LL';
      ctrl.filterExam();
      expect(scope.inputArray).toEqual([0, 1, 2]);
    });
  });

  describe('examToggle method -> ', function () {
    it('should call patientPerioExamFactory.setActiveExam if exam is not AttachmentLvl', function () {
      var exam = 'DepthPocket';
      var quadrant = 'UB';
      scope.examToggle(exam, quadrant);
      expect(patientPerioExamFactory.setActiveExam).toHaveBeenCalledWith(exam);
    });

    it('should call patientPerioExamFactory.setActiveExamParameters with correct parameters when quadrant is UB', function () {
      var exam = 'DepthPocket';
      var quadrant = 'UB';
      scope.examToggle(exam, quadrant);
      expect(
        patientPerioExamFactory.setActiveExamParameters
      ).toHaveBeenCalledWith('upper', 'buccal', exam);
    });

    it('should call patientPerioExamFactory.setActiveExamParameters with correct parameters when quadrant is UL', function () {
      var exam = 'DepthPocket';
      var quadrant = 'UL';
      scope.examToggle(exam, quadrant);
      expect(
        patientPerioExamFactory.setActiveExamParameters
      ).toHaveBeenCalledWith('upper', 'lingual', exam);
    });

    it('should call patientPerioExamFactory.setActiveExamParameters with correct parameters when quadrant is LL', function () {
      var exam = 'DepthPocket';
      var quadrant = 'LL';
      scope.examToggle(exam, quadrant);
      expect(
        patientPerioExamFactory.setActiveExamParameters
      ).toHaveBeenCalledWith('lower', 'lingual', exam);
    });

    it('should call patientPerioExamFactory.setActiveExamParameters with correct parameters when quadrant is LB', function () {
      var exam = 'DepthPocket';
      var quadrant = 'LB';
      scope.examToggle(exam, quadrant);
      expect(
        patientPerioExamFactory.setActiveExamParameters
      ).toHaveBeenCalledWith('lower', 'buccal', exam);
    });
  });

  describe('getBleedingSuppClasses method -> ', function () {
    beforeEach(function () {
      patientPerioExamFactory.ActiveExam = 'SuppurationPocket';
      patientPerioExamFactory.ActiveTooth = 12;
    });

    it('should return activeExam class if exam is active but not the tooth', function () {
      expect(scope.getBleedingSuppClasses(4, 'SuppurationPocket', 1)).toBe(
        'activeExam '
      );
    });

    it('should return activeTooth class if tooth is active', function () {
      expect(scope.getBleedingSuppClasses(12, 'SuppurationPocket', 1)).toBe(
        'activeTooth '
      );
    });

    it('should return missing class if tooth state is MissingPrimary', function () {
      expect(
        scope.getBleedingSuppClasses(
          1,
          'SuppurationPocket',
          1,
          'MissingPrimary'
        )
      ).toBe('activeExam missing ');
    });

    it('should return both class if both BleedingPocket and SuppurationPocket are true', function () {
      var toothExam = scope.exam[1];
      toothExam.BleedingPocket[1] = true;
      toothExam.SuppurationPocket[1] = true;
      expect(scope.getBleedingSuppClasses(2, 'SuppurationPocket', 1)).toBe(
        'activeExam both'
      );
    });

    it('should return bleeding class if only BleedingPocket is true', function () {
      var toothExam = scope.exam[1];
      toothExam.BleedingPocket[1] = true;
      toothExam.SuppurationPocket[1] = false;
      expect(scope.getBleedingSuppClasses(2, 'SuppurationPocket', 1)).toBe(
        'activeExam bleeding'
      );
    });

    it('should return suppuration class if only SuppurationPocket is true', function () {
      var toothExam = scope.exam[1];
      toothExam.BleedingPocket[1] = false;
      toothExam.SuppurationPocket[1] = true;
      expect(scope.getBleedingSuppClasses(2, 'SuppurationPocket', 1)).toBe(
        'activeExam suppuration'
      );
    });
  });
});
