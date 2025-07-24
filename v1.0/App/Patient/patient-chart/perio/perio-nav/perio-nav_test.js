describe('PerioNavController ->', function () {
  var ctrl, scope, toastrFactory;
  var modalInstance;
  var patientPerioExamFactory, patientOdontogramFactory;

  //#region mocks
  var chartedTeethMock =
    '1;2;3;4;5;6;7,Missing;E;9;G;11;12;13;14;15;16;17;18;19;20;21;22;23;24;25;26;27;28;29;30;31;32;53';

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
      ToothId: '',
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
        validateExam: jasmine.createSpy().and.returnValue({}),
        deleteExam: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        setExamState: jasmine.createSpy().and.returnValue({}),
        setSelectedExamId: jasmine.createSpy().and.returnValue({}),
        setActiveQuadrant: jasmine.createSpy().and.returnValue({}),
        setActiveExam: jasmine.createSpy().and.returnValue({}),

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

      // mock toastrFactory
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  //#endregion

  // #region mock controller

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    ctrl = $controller('PerioNavController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      ExamState: examStateMock,
      PatientOdontogramFactory: patientOdontogramFactory,
      personId: '134',
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

  describe('ctrl.loadMouthStatus method ->', function () {
    it('should call patientOdontogramFactory.getMouthStatus', function () {
      scope.authAccess.View = true;
      scope.personId = 'Imaperson';
      ctrl.loadMouthStatus();
      expect(patientOdontogramFactory.getMouthStatus).toHaveBeenCalledWith(
        scope.personId
      );
    });
  });

  describe('activeTooth $watch', function () {
    it('should call filterExam', function () {
      spyOn(scope, 'filterExam');
      scope.activeTooth = '1';
      scope.$apply();
      scope.activeTooth = '2';
      scope.$apply();

      expect(scope.filterExam).toHaveBeenCalled();
    });
  });

  describe('scope.filterExam method ->', function () {
    it('should set toothExam based on activeTooth', function () {
      scope.activePerioExam = angular.copy(mockPerioExam);
      scope.activePerioExam.ExamDetails[3].ToothNumber = '9';
      scope.activePerioExam.ExamDetails[3].ToothId = '9';
      scope.activeTooth = '9';
      scope.activeToothId = 'test';
      scope.filterExam();
      expect(scope.activeToothId).toEqual(
        scope.activePerioExam.ExamDetails[3].ToothId
      );
    });

    it('should set activeToothId based on activeTooth', function () {
      scope.activePerioExam = angular.copy(mockPerioExam);
      scope.activePerioExam.ExamDetails[3].ToothNumber = '9';
      scope.activePerioExam.ExamDetails[3].ToothId = '9';
      scope.activeTooth = '9';
      scope.filterExam();
      expect(scope.toothExam).toEqual(scope.activePerioExam.ExamDetails[3]);
    });
  });

  describe('scope.navToNextValidTooth method ->', function () {
    beforeEach(function () {
      patientPerioExamFactory.ActiveExamPath.ToothPockets = [
        '1,0',
        '1,1',
        '1,2',
        '2,0',
        '2,1',
        '2,2',
      ];
      patientPerioExamFactory.FocusedIndex = -1;
      patientPerioExamFactory.ArrowAdvanceToNextValidTooth =
        jasmine.createSpy();
    });

    it('should call patientPerioExamFactory.getNextValidTooth', function () {
      spyOn(ctrl, 'getToothNumberFromToothId').and.returnValue('1');
      spyOn(scope, 'findPocketIndex').and.returnValue(0);
      scope.activeTooth = '2';
      scope.activePerioExam = mockPerioExam;
      var fwdDirection = true;
      scope.chartedTeeth = angular.copy(chartedTeethMock);
      scope.navToNextValidTooth(fwdDirection);
      expect(
        patientPerioExamFactory.ArrowAdvanceToNextValidTooth
      ).toHaveBeenCalledWith(scope.activePerioExam.ExamDetails, '2', 'forward');
      expect(patientPerioExamFactory.setActiveTooth).toHaveBeenCalledWith('1');
        expect(ctrl.getToothNumberFromToothId).toHaveBeenCalled();
        expect(scope.findPocketIndex).toHaveBeenCalledWith('1');
    });
  });

  describe('scope.examHasFurcationReadings method ->', function () {
    it('should return true if toothExam has $$FurcationReadingsAllowed more than 0', function () {
      scope.activePerioExam = angular.copy(mockPerioExam);
      angular.forEach(scope.activePerioExam.ExamDetails, function (details) {
        details.$$FurcationReadingsAllowed = 2;
      });
      expect(scope.examHasFurcationReadings(2)).toEqual(true);
    });

    it('should return false if toothExam has $$FurcationReadingsAllowed equals 0', function () {
      scope.activePerioExam = angular.copy(mockPerioExam);
      angular.forEach(scope.activePerioExam.ExamDetails, function (details) {
        details.$$FurcationReadingsAllowed = 0;
      });
      expect(scope.examHasFurcationReadings(2)).toEqual(false);
    });

    it('should return false if toothExam does not have toothId', function () {
      scope.activePerioExam = angular.copy(mockPerioExam);
      angular.forEach(scope.activePerioExam.ExamDetails, function (details) {
        details.ToothId = null;
        details.$$FurcationReadingsAllowed = 2;
      });
      expect(scope.examHasFurcationReadings(2)).toEqual(false);
    });
  });

    describe('scope.findPocketIndex method ->', function () {
        beforeEach(function () {
            patientPerioExamFactory.ActiveExamPath.ToothPockets = [
                '1,0', '1,1', '1,2', '1,3', '1,4', '1,5'                
            ];
            patientPerioExamFactory.FocusedIndex = -1;            
        });

        //Tooth 1-8 and 25-32, buccal, lingual, for both PD, GM, and MGJ
        //Tooth 9-24, buccal, lingual, for both PD, GM, and MGJ
        //Tooth 1-8 and 25-32, buccal, lingual, for MOB and FG
        //Tooth 9-24, buccal, lingual, for MOB and FG

        it('tooth 1 and 8, buccal side, should return 0', function () {                                    
            scope.activeExamType = { Abbrev: 'dp' };
            patientPerioExamFactory.FocusedIndex = 1;

            let result = scope.findPocketIndex(1);
            expect(result).toEqual(0);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(1);
            expect(result).toEqual(0);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(1);
            expect(result).toEqual(0);
            
            result = scope.findPocketIndex(8);
            expect(result).toEqual(0);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(8);
            expect(result).toEqual(0);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(8);
            expect(result).toEqual(0);
        });

        it('tooth 9 and 24, buccal side, should return 2', function () {
            scope.activeExamType = { Abbrev: 'dp' };
            patientPerioExamFactory.FocusedIndex = 1;

            let result = scope.findPocketIndex(9);
            expect(result).toEqual(2);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(9);
            expect(result).toEqual(2);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(9);
            expect(result).toEqual(2);

            result = scope.findPocketIndex(24);
            expect(result).toEqual(2);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(24);
            expect(result).toEqual(2);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(24);
            expect(result).toEqual(2);
        });

        it('tooth 1 and 8, lingual side, should return 3', function () {
            scope.activeExamType = { Abbrev: 'dp' };
            patientPerioExamFactory.FocusedIndex = 4;

            let result = scope.findPocketIndex(1);
            expect(result).toEqual(3);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(1);
            expect(result).toEqual(3);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(1);
            expect(result).toEqual(3);

            result = scope.findPocketIndex(8);
            expect(result).toEqual(3);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(8);
            expect(result).toEqual(3);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(8);
            expect(result).toEqual(3);
        });

        it('tooth 9 and 24, lingual side, should return 5', function () {
            scope.activeExamType = { Abbrev: 'dp' };
            patientPerioExamFactory.FocusedIndex = 4;

            let result = scope.findPocketIndex(9);
            expect(result).toEqual(5);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(9);
            expect(result).toEqual(5);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(9);
            expect(result).toEqual(5);

            result = scope.findPocketIndex(24);
            expect(result).toEqual(5);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(24);
            expect(result).toEqual(5);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(24);
            expect(result).toEqual(5);
        });

        it('tooth 25 and 32, buccal side, should return 0', function () {
            scope.activeExamType = { Abbrev: 'dp' };
            patientPerioExamFactory.FocusedIndex = 1;

            let result = scope.findPocketIndex(25);
            expect(result).toEqual(0);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(25);
            expect(result).toEqual(0);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(25);
            expect(result).toEqual(0);

            result = scope.findPocketIndex(32);
            expect(result).toEqual(0);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(32);
            expect(result).toEqual(0);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(32);
            expect(result).toEqual(0);
        });

        it('tooth 25 and 32, lingual side, should return 3', function () {
            scope.activeExamType = { Abbrev: 'dp' };
            patientPerioExamFactory.FocusedIndex = 4;

            let result = scope.findPocketIndex(25);
            expect(result).toEqual(3);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(25);
            expect(result).toEqual(3);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(25);
            expect(result).toEqual(3);

            result = scope.findPocketIndex(32);
            expect(result).toEqual(3);

            scope.activeExamType = { Abbrev: 'gm' };
            result = scope.findPocketIndex(32);
            expect(result).toEqual(3);

            scope.activeExamType = { Abbrev: 'mgj' };
            result = scope.findPocketIndex(32);
            expect(result).toEqual(3);
        });

        it('furcation grade and mobility should return 0', function () {
            scope.activeExamType = { Abbrev: 'fg' };
            patientPerioExamFactory.FocusedIndex = 1;

            let result = scope.findPocketIndex(1);
            expect(result).toEqual(0);

            result = scope.findPocketIndex(8);
            expect(result).toEqual(0);

            result = scope.findPocketIndex(25);
            expect(result).toEqual(0);

            result = scope.findPocketIndex(32);
            expect(result).toEqual(0);

            scope.activeExamType = { Abbrev: 'mob' };
            result = scope.findPocketIndex(1);
            expect(result).toEqual(0);

            result = scope.findPocketIndex(8);
            expect(result).toEqual(0);

            result = scope.findPocketIndex(25);
            expect(result).toEqual(0);

            result = scope.findPocketIndex(32);
            expect(result).toEqual(0);
        });

        
    });
});
