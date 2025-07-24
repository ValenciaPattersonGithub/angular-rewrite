describe('PerioNavReadingsController ->', function () {
  var toastrFactory, scope, ctrl;
  var modalInstance;
  var patientPerioExamFactory;

  //#region mocks
  var defaultAcceptableKeyCodes = [
    37, 38, 39, 40, 66, 83, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100,
    101, 102, 103, 104, 105,
  ];

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
        SetActivePerioExam: jasmine.createSpy().and.returnValue({}),
        ActivePerioExam: jasmine.createSpy().and.returnValue({}),
        AcceptableKeyCodes: jasmine
          .createSpy()
          .and.returnValue(defaultAcceptableKeyCodes),
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
        getInputArrayForTooth: jasmine.createSpy().and.returnValue({}),
        setFocusedIndex: jasmine.createSpy(),
        observeFocusedIndex: jasmine.createSpy().and.returnValue(5),
        ExamTypes: [
          { Abbrev: 'dp', Active: true, Type: 'DepthPocket' },
          { Abbrev: 'gm', Active: false, Type: 'GingivalMarginPocket' },
          { Abbrev: 'mgj', Active: false, Type: 'MgjPocket' },
          { Abbrev: 'mob', Active: false, Type: 'Mobility' },
          { Abbrev: 'fg', Active: false, Type: 'FurcationGradeRoot' },
        ],
        setActiveExamType: jasmine.createSpy().and.returnValue({}),
        ActiveExamPath: {
          PathId: 1,
          Name: '1-16 B / 16-1 L, 32-17 B / 17-32 L',
          ToothPockets: [
            '1,0',
            '1,1',
            '1,2',
            '2,0',
            '2,1',
            '2,2',
            '3,0',
            '3,1',
            '3,2',
            '4,0',
            '4,1',
            '4,2',
            '5,0',
            '5,1',
            '5,2',
            '6,0',
            '6,1',
            '6,2',
            '7,0',
            '7,1',
            '7,2',
            '8,0',
            '8,1',
            '8,2',
            '9,2',
            '9,1',
            '9,0',
            '10,2',
            '10,1',
            '10,0',
            '11,2',
            '11,1',
            '11,0',
            '12,2',
            '12,1',
            '12,0',
            '13,2',
            '13,1',
            '13,0',
            '14,2',
            '14,1',
            '14,0',
            '15,2',
            '15,1',
            '15,0',
            '16,2',
            '16,1',
            '16,0',
            '16,5',
            '16,4',
            '16,3',
            '15,5',
            '15,4',
            '15,3',
            '14,5',
            '14,4',
            '14,3',
            '13,5',
            '13,4',
            '13,3',
            '12,5',
            '12,4',
            '12,3',
            '11,5',
            '11,4',
            '11,3',
            '10,5',
            '10,4',
            '10,3',
            '9,5',
            '9,4',
            '9,3',
            '8,3',
            '8,4',
            '8,5',
            '7,3',
            '7,4',
            '7,5',
            '6,3',
            '6,4',
            '6,5',
            '5,3',
            '5,4',
            '5,5',
            '4,3',
            '4,4',
            '4,5',
            '3,3',
            '3,4',
            '3,5',
            '2,3',
            '2,4',
            '2,5',
            '1,3',
            '1,4',
            '1,5',
            '32,0',
            '32,1',
            '32,2',
            '31,0',
            '31,1',
            '31,2',
            '30,0',
            '30,1',
            '30,2',
            '29,0',
            '29,1',
            '29,2',
            '28,0',
            '28,1',
            '28,2',
            '27,0',
            '27,1',
            '27,2',
            '26,0',
            '26,1',
            '26,2',
            '25,0',
            '25,1',
            '25,2',
            '24,2',
            '24,1',
            '24,0',
            '23,2',
            '23,1',
            '23,0',
            '22,2',
            '22,1',
            '22,0',
            '21,2',
            '21,1',
            '21,0',
            '20,2',
            '20,1',
            '20,0',
            '19,2',
            '19,1',
            '19,0',
            '18,2',
            '18,1',
            '18,0',
            '17,2',
            '17,1',
            '17,0',
            '17,5',
            '17,4',
            '17,3',
            '18,5',
            '18,4',
            '18,3',
            '19,5',
            '19,4',
            '19,3',
            '20,5',
            '20,4',
            '20,3',
            '21,5',
            '21,4',
            '21,3',
            '22,5',
            '22,4',
            '22,3',
            '23,5',
            '23,4',
            '23,3',
            '24,5',
            '24,4',
            '24,3',
            '25,3',
            '25,4',
            '25,5',
            '26,3',
            '26,4',
            '26,5',
            '27,3',
            '27,4',
            '27,5',
            '28,3',
            '28,4',
            '28,5',
            '29,3',
            '29,4',
            '29,5',
            '30,3',
            '30,4',
            '30,5',
            '31,3',
            '31,4',
            '31,5',
            '32,3',
            '32,4',
            '32,5',
          ],
          Order: 0,
          DataTag: 'AAAAAAAAhNE=',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2017-05-26T13:26:22.6366667',
        },
      };

      $provide.value('PatientPerioExamFactory', patientPerioExamFactory);

      // mock toastrFactory
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  //#endregion

  // #region controller mock

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    ctrl = $controller('PerioNavReadingsController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      ExamState: examStateMock,
      PatientPerioExamFactory: patientPerioExamFactory,
      personId: '134',
    });

    scope.inputArray = [0, 1, 2];

    ctrl.$onInit();

    scope.toothExam = angular.copy(mockPerioExam.ExamDetails[0]);
    scope.examType = 'DepthPocket';
    scope.quadrant = 'UD';
    patientPerioExamFactory.ActiveQuadrant = 'UB';
    patientPerioExamFactory.ActiveExam = 'DepthPocket';

    scope.keypadModel = {
      examType: '',
      onInputChange: Date.now(),
      value: false,
      numericInputLimit: 20,
      pocketInputRestricted: false,
      incrementationLimit: false,
    };
  }));

  describe('advance ->', function () {
    var event = {};

    beforeEach(function () {
      scope.activeExamType = null;
      event.keyCode = null;
      event.target = {};
    });

    it('should set toothExam value to null if negative keyCode was entered and examType is not GingivalMarginPocket', function () {
      event.keyCode = 109;
      scope.toothExam.DepthPocket = [1, null, null, null, null, null];
      expect(scope.toothExam.DepthPocket[0]).toBe(1);
      scope.advance(event, 0, 'DepthPocket', 'dp', null);
      expect(scope.toothExam.DepthPocket[0]).toBe(null);
    });

    it('should set toothExam value to null if negative keyCode was entered and examType is Mobility', function () {
      event.keyCode = 109;
      scope.toothExam.Mobility = 1;
      expect(scope.toothExam.Mobility).toBe(1);
      scope.advance(event, 0, 'Mobility', 'mob', null);
      expect(scope.toothExam.Mobility).toBe(null);
    });

    it('should not set toothExam value to null if negative keyCode was entered and examType is GingivalMarginPocket', function () {
      event.keyCode = 189;
      scope.toothExam.GingivalMarginPocket = [8, null, null, null, null, null];
      expect(scope.toothExam.GingivalMarginPocket[0]).toBe(8);
      scope.advance(event, 0, 'GingivalMarginPocket', 'gm', null);
      expect(scope.toothExam.GingivalMarginPocket[0]).toBe(8);
    });

    it('should set toothExam value to null if an invalid keyCode was entered', function () {
      // gm
      event.keyCode = 75;
      scope.toothExam.GingivalMarginPocket = [
        'k',
        null,
        null,
        null,
        null,
        null,
      ];
      expect(scope.toothExam.GingivalMarginPocket[0]).toBe('k');
      scope.advance(event, 0, 'GingivalMarginPocket', 'gm', null);
      expect(scope.toothExam.GingivalMarginPocket[0]).toBe(null);
      // mob
      scope.toothExam.Mobility = 'k';
      expect(scope.toothExam.Mobility).toBe('k');
      scope.advance(event, 0, 'Mobility', 'mob', null);
      expect(scope.toothExam.Mobility).toBe(null);
    });

    it('should set toothExam value to value from keyCode', function () {
      scope.chartedTeeth = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '28',
        '29',
        '30',
        '31',
        '32',
      ];
      patientPerioExamFactory.ValueByKeyCode.and.returnValue('2');
      event.keyCode = 40;
      // mob
      scope.activeExamType = 'Mobility';
      scope.toothExam.Mobility = 1;
      expect(scope.toothExam.Mobility).toBe(1);
      scope.advance(event, 0, 'Mobility', 'mob', null);
      expect(scope.toothExam.Mobility).toBe('2');
      // dp
      scope.activeExamType = 'DepthPocket';
      scope.toothExam.DepthPocket = [1, null, null, null, null, null];
      expect(scope.toothExam.DepthPocket[0]).toBe(1);
      scope.advance(event, 0, 'DepthPocket', 'dp', null);
      expect(scope.toothExam.DepthPocket[0]).toBe('2');
      // gm
      scope.activeExamType = 'GingivalMarginPocket';
      scope.toothExam.GingivalMarginPocket = [8, null, null, null, null, null];
      expect(scope.toothExam.GingivalMarginPocket[0]).toBe(8);
      scope.advance(event, 0, 'GingivalMarginPocket', 'gm', null);
      expect(scope.toothExam.GingivalMarginPocket[0]).toBe('2');
      // mgj
      scope.activeExamType = 'MgjPocket';
      scope.toothExam.MgjPocket = [null, null, null, 3, null, null];
      expect(scope.toothExam.MgjPocket[3]).toBe(3);
      scope.advance(event, 3, 'MgjPocket', 'mgj', null);
      expect(scope.toothExam.MgjPocket[3]).toBe('2');
      // fg
      scope.activeExamType = 'FurcationGradeRoot';
      scope.toothExam.FurcationGradeRoot = [null, null, 4, null, null, null];
      expect(scope.toothExam.FurcationGradeRoot[2]).toBe(4);
      scope.advance(event, 2, 'FurcationGradeRoot', 'mgj', null);
      expect(scope.toothExam.FurcationGradeRoot[2]).toBe('2');
    });

    it('should set toothExam value to null if zero is enter for dp, gm, or mgj', function () {
      patientPerioExamFactory.ValueByKeyCode.and.returnValue('0');
      event.keyCode = 98;
      // dp
      scope.activeExamType = 'DepthPocket';
      scope.toothExam.DepthPocket = ['0', null, null, null, null, null];
      expect(scope.toothExam.DepthPocket[0]).toBe('0');
      scope.advance(event, 0, 'DepthPocket', 'dp', null);
      expect(scope.toothExam.DepthPocket[0]).toBe('0');
      // gm
      scope.activeExamType = 'GingivalMarginPocket';
      scope.toothExam.GingivalMarginPocket = [
        '0',
        null,
        null,
        null,
        null,
        null,
      ];
      expect(scope.toothExam.GingivalMarginPocket[0]).toBe('0');
      scope.advance(event, 0, 'GingivalMarginPocket', 'gm', null);
      expect(scope.toothExam.GingivalMarginPocket[0]).toBe('0');
      // mgj
      scope.activeExamType = 'MgjPocket';
      scope.toothExam.MgjPocket = [null, null, null, '0', null, null];
      expect(scope.toothExam.MgjPocket[3]).toBe('0');
      scope.advance(event, 3, 'MgjPocket', 'mgj', null);
      expect(scope.toothExam.MgjPocket[3]).toBe('0');
    });

    it('should calculate AttachmentLvl when examType is DepthPocket', function () {
      patientPerioExamFactory.ValueByKeyCode.and.returnValue('5');
      scope.activeExamType = 'DepthPocket';
      scope.toothExam.ToothId = 2;
      event.keyCode = 40;
      scope.advance(event, 0, 'DepthPocket', 'dp', null);
      expect(scope.toothExam.AttachmentLvl).toEqual([
        5,
        null,
        null,
        null,
        null,
        null,
      ]);
    });

    it('should calculate AttachmentLvl when examType is GingivalMarginPocket', function () {
      patientPerioExamFactory.ValueByKeyCode.and.returnValue('3');
      scope.activeExamType = 'GingivalMarginPocket';
      scope.toothExam.DepthPocket = ['2', null, null, null, null, null];
      scope.toothExam.ToothId = 2;
      event.keyCode = 40;
      scope.advance(event, 0, 'GingivalMarginPocket', 'gm', null);
      expect(scope.toothExam.AttachmentLvl).toEqual([
        5,
        null,
        null,
        null,
        null,
        null,
      ]);
    });

    it('should reset FocusedIndex when the path has completed', function () {
      patientPerioExamFactory.FocusedIndex = 191;
      expect(patientPerioExamFactory.FocusedIndex).toBe(191);
      patientPerioExamFactory.ValueByKeyCode.and.returnValue('5');
      scope.activeExamType = 'DepthPocket';
      scope.toothExam.ToothId = 2;
      event.keyCode = 40;
      scope.advance(event, 0, 'DepthPocket', 'dp', null);
      expect(patientPerioExamFactory.setFocusedIndex).toHaveBeenCalledWith(192);
      expect(patientPerioExamFactory.setFocusedIndex).toHaveBeenCalledWith(0);
    });
  });

  describe('inputClicked function ->', function () {
    beforeEach(function () {
      ctrl.updateKeypadModel = jasmine.createSpy();
    });

    it('should set patientPerioExamFactory.FocusedIndex to correct value', function () {
      patientPerioExamFactory.FocusedIndex = 191;
      scope.inputClicked('', '', 5, 20);
      expect(patientPerioExamFactory.setFocusedIndex).toHaveBeenCalledWith(153);
    });

    it('should call patientPerioExamFactory.setActiveExamType with correct parameters', function () {
      scope.inputClicked('Mobility');
      expect(patientPerioExamFactory.setActiveExamType).toHaveBeenCalledWith(
        jasmine.objectContaining({ Type: 'Mobility' })
      );
    });

    it('should call ctrl.updateKeypadModal with correct parameters', function () {
      var toothId = 'toothId';
      var examType = 'examType';
      var index = 'index';
      scope.inputClicked(examType, toothId, index);
      expect(ctrl.updateKeypadModel).toHaveBeenCalledWith(toothId, examType);
    });
  });

  describe('keypadModel.onInput watch->', function () {
    beforeEach(function () {
      ctrl.updateKeypadModel = jasmine.createSpy();
    });

    it('should call advance function with correct values', function () {
      patientPerioExamFactory.FocusedIndex = 10;
      scope.advance = jasmine.createSpy();

      scope.$id = 1;
      scope.keypadModel = {
        onInput: 1,
        id: 1,
        value: 1,
        inputType: 'numericInput',
      };
      scope.keypadModel.onInput = 2;
      scope.$digest();

      expect(scope.advance).toHaveBeenCalledWith(
        {},
        '1',
        scope.examType,
        scope.examTypeAbbrev,
        scope.keypadModel.value
      );
    });
  });
});
