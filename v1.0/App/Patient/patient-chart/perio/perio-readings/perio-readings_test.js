describe('PerioReadingsController ->', function () {
  var toastrFactory, scope, ctrl;
  var modalInstance;
  var patientPerioExamFactory;
  var timeout;

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
        setFocusedIndex: jasmine.createSpy(),
        observeFocusedIndex: jasmine.createSpy().and.returnValue(5),
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
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    timeout = $injector.get('$timeout');
    var exam = angular.copy(mockPerioExam);
    // directive scope
    scope.exam = exam.ExamDetails;
    scope.queue = loadingQueueMock;
    scope.quadrant = 'UL';
    scope.examTitle = 'Pocket Depth';

    ctrl = $controller('PerioReadingsController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      personId: 'b6dbd840-f15f-42c8-98bf-ed079e89c67e',
    });
  }));

  //#endregion

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
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
      expect(patientPerioExamFactory.setActiveExamType).toHaveBeenCalled();
    });
  });

  describe('inputClicked function ->', function () {
    describe('when examStarted is false ->', function () {
      beforeEach(function () {
        scope.examStarted = false;
      });

      it('should not set patientPerioExamFactory.FocusedIndex', function () {
        patientPerioExamFactory.FocusedIndex = 20;
        scope.inputClicked();
        expect(patientPerioExamFactory.FocusedIndex).toBe(20);
      });
    });

    describe('when examStarted is true ->', function () {
      var toothPocketIndex;
      var indexOfSpy;
      beforeEach(function () {
        scope.examStarted = true;
        scope.updateBleedingSuppuration = jasmine.createSpy();
        toothPocketIndex = 'toothPocketIndex';
        indexOfSpy = jasmine.createSpy().and.returnValue(toothPocketIndex);
        patientPerioExamFactory.ActiveExamPath = {
          ToothPockets: { indexOf: indexOfSpy },
        };
        patientPerioExamFactory.setFocusedIndex = jasmine
          .createSpy()
          .and.callFake(function (val) {
            patientPerioExamFactory.FocusedIndex = val;
          });
      });

      //it('should set patientPerioExamFactory.FocusedIndex', function () {
      //    var index = 'index';
      //    var toothNumber = 'toothNumber';
      //    patientPerioExamFactory.FocusedIndex = 20;
      //    scope.inputClicked('', '', index, toothNumber);
      //    timeout.flush(1);
      //    expect(patientPerioExamFactory.FocusedIndex).toBe(toothPocketIndex);
      //    expect(indexOfSpy).toHaveBeenCalledWith(`${toothNumber},${index}`);
      //});

      it('should call patientPerioExamFactory.setActiveExamType with correct parameters', function () {
        patientPerioExamFactory.ExamTypes = [
          { Type: 'type1' },
          { Type: 'type2' },
        ];
        scope.inputClicked('type1', '');
        expect(patientPerioExamFactory.setActiveExamType).toHaveBeenCalledWith({
          Type: 'type1',
        });
      });

      //it('should call updateBleedingSuppuration when examType is BleedingPocket', function () {
      //    var index = 'index';
      //    var toothId = 'toothId';

      //    patientPerioExamFactory.ActiveExamPath.ToothPockets.indexOf = jasmine.createSpy('patientPerioExamFactory.ActiveExamPath.ToothPockets.indexOf').and.returnValue(2);
      //    scope.inputClicked('BleedingPocket', toothId, index);
      //    expect(scope.updateBleedingSuppuration).toHaveBeenCalledWith(toothId, index);
      //});

      //it('should call updateBleedingSuppuration when examType is SuppurationPocket', function () {
      //    var index = 'index';
      //    var toothId = 'toothId';
      //    patientPerioExamFactory.ActiveExamPath.ToothPockets.indexOf = jasmine.createSpy('patientPerioExamFactory.ActiveExamPath.ToothPockets.indexOf').and.returnValue(2);
      //    scope.inputClicked('SuppurationPocket', toothId, index);
      //    expect(scope.updateBleedingSuppuration).toHaveBeenCalledWith(toothId, index);
      //});

      it('should not call updateBleedingSuppuration when examType is null', function () {
        var index = 'index';
        var toothId = 'toothId';
        scope.inputClicked(null, toothId, index);
        expect(scope.updateBleedingSuppuration).not.toHaveBeenCalled();
      });

      it('should not call updateBleedingSuppuration when examType is other', function () {
        var index = 'index';
        var toothId = 'toothId';
        scope.inputClicked('other', toothId, index);
        expect(scope.updateBleedingSuppuration).not.toHaveBeenCalled();
      });

      it('should not call updateBleedingSuppuration when invalid tooth selection', function () {
        patientPerioExamFactory.ActiveExamPath.ToothPockets.indexOf = jasmine
          .createSpy(
            'patientPerioExamFactory.ActiveExamPath.ToothPockets.indexOf'
          )
          .and.returnValue(-1);
        scope.inputClicked('BleedingPocket', '3', 1);
        expect(scope.updateBleedingSuppuration).not.toHaveBeenCalled();
      });

      //it('should call updateBleedingSuppuration when valid tooth selection', function () {
      //    patientPerioExamFactory.ActiveExamPath = {ToothPockets:['1,0','1,1','1,2','2,0','2,1','2,2','4,0','4,1','4,2','5,0','5,1','5,2','6,0','6,1','6,2','7,0','7,1','7,2','8,0','8,1','8,2','9,2','9,1','9,0','10,2','10,1','10,0']};
      //    patientPerioExamFactory.ActiveExamPath.ToothPockets.indexOf = jasmine.createSpy('patientPerioExamFactory.ActiveExamPath.ToothPockets.indexOf').and.returnValue(2);
      //    scope.inputClicked('BleedingPocket','2', 1);
      //    expect(scope.updateBleedingSuppuration).toHaveBeenCalled();
      //});
    });
  });

  describe('updateBleedingSuppuration function ->', function () {
    it('Bleeding should be true and Suppuration should be false if nothing was selected', function () {
      var toothId = 2;
      var index = 0;
      var toothReadings = scope.exam[1];
      toothReadings.BleedingPocket[index] = false;
      toothReadings.SuppurationPocket[index] = false;
      scope.updateBleedingSuppuration(toothId, index);
      expect(toothReadings.BleedingPocket[index]).toBeTruthy();
      expect(toothReadings.SuppurationPocket[index]).toBeFalsy();
    });

    it('Bleeding should be false and Suppuration should be true if bleeding was active', function () {
      var toothId = 2;
      var index = 0;
      var toothReadings = scope.exam[1];
      toothReadings.BleedingPocket[index] = true;
      toothReadings.SuppurationPocket[index] = false;
      scope.updateBleedingSuppuration(toothId, index);
      expect(toothReadings.BleedingPocket[index]).toBeFalsy();
      expect(toothReadings.SuppurationPocket[index]).toBeTruthy();
    });

    it('Bleeding should be true and Suppuration should be true if Suppuration was active', function () {
      var toothId = 2;
      var index = 0;
      var toothReadings = scope.exam[1];
      toothReadings.BleedingPocket[index] = false;
      toothReadings.SuppurationPocket[index] = true;
      scope.updateBleedingSuppuration(toothId, index);
      expect(toothReadings.BleedingPocket[index]).toBeTruthy();
      expect(toothReadings.SuppurationPocket[index]).toBeTruthy();
    });

    it('Bleeding should be false and Suppuration should be false if both were active', function () {
      var toothId = 2;
      var index = 0;
      var toothReadings = scope.exam[1];
      toothReadings.BleedingPocket[index] = true;
      toothReadings.SuppurationPocket[index] = true;
      scope.updateBleedingSuppuration(toothId, index);
      expect(toothReadings.BleedingPocket[index]).toBeFalsy();
      expect(toothReadings.SuppurationPocket[index]).toBeFalsy();
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
