describe('perioChart directive ->', function () {
  var scope, ctrl, toothExam, staticData, patientPerioExamFactory, alertLevels;

  toothExam = {
    ExamId: null,
    ToothId: 0,
    ToothNumber: 1,
    PatientId: null,
    BleedingPocket: [null, null, null, null, null, null],
    DepthPocket: [2, 2, 2, 2, 2, 2],
    AttachmentLvl: [],
    FurcationGradeRoot: [null, null, null],
    GingivalMarginPocket: [2, 2, 2, 2, 2, 2],
    MgjPocket: [null, null, null, null, null, null],
    Mobility: null,
    SuppurationPocket: [null, null, null, null, null, null],
  };

  alertLevels = {
    DepthPocket: 4,
    GingivalMarginPocket: 4,
    AttachmentLevel: 4,
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      staticData = {
        TeethDefinitions: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('StaticData', staticData);
      patientPerioExamFactory = {
        AlertLevels: alertLevels,
        ActiveQuadrant: 'UL',
      };
      $provide.value('PatientPerioExamFactory', patientPerioExamFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('PerioChartController', {
      $scope: scope,
    });
    scope.arch = 'upper';
    scope.activeDataPoints = ['PD', 'GM', 'MGJ'];
    ctrl.$onInit();
    scope.rawExam = [];
    for (var i = 0; i < 32; i++) {
      var newExam = angular.copy(toothExam);
      newExam.ToothId = i + 1;
      scope.rawExam.push(newExam);
    }
    scope.$apply();
  }));

  describe('getDynamicIndex -> ', function () {
    var ped;

    beforeEach(function () {
      ped = {};
    });

    it('should return correct index based on $$MouthSide', function () {
      ped.$$MouthSide = 'Left';
      expect(ctrl.getDynamicIndex(42, ped)).toBe(42);
      expect(ctrl.getDynamicIndex(0, ped)).toBe(2);
      expect(ctrl.getDynamicIndex(2, ped)).toBe(0);
      ped.$$MouthSide = 'Right';
      expect(ctrl.getDynamicIndex(3, ped)).toBe(5);
      expect(ctrl.getDynamicIndex(5, ped)).toBe(3);
    });
  });

  describe('transformExamObjects -> ', function () {
    beforeEach(function () {
      ctrl.updateChart1 = true;
      ctrl.updateChart2 = false;
      scope.arch = 'Upper';
      ctrl.updateUpperArch = true;
    });

    it('should create chart1Data if upper arch', function () {
      ctrl.transformExamObjects();
      expect(ctrl.chart1Data.length).toBe(48);
    });

    it('should create chart2Data if lower arch', function () {
      ctrl.updateChart1 = false;
      ctrl.updateChart2 = true;
      scope.arch = 'Lower';
      ctrl.updateLowerArch = true;
      ctrl.transformExamObjects();
      expect(ctrl.chart2Data.length).toBe(48);
    });

    it('should set ToothId correctly', function () {
      var data1 = angular.copy(toothExam);
      data1.ToothId = null;
      var data2 = angular.copy(toothExam);
      data2.ToothId = 'toothId';
      data2.ToothState = '';
      var data3 = angular.copy(toothExam);
      data3.ToothId = 'toothId';
      data3.ToothState = 'MissingPrimary';
      ctrl.rawExamForArch = [data1, data2, data3];
      scope.arch = 'Upper';
      ctrl.transformExamObjects();
      expect(ctrl.chart1Data[0].ToothId).toBe('');
      expect(ctrl.chart1Data[3].ToothId).toBe('toothId');
      expect(ctrl.chart1Data[6].ToothId).toBe('');
    });

    it('should compute $$AttachmentLevel by adding GM and PD', function () {
      ctrl.transformExamObjects();
      expect(ctrl.chart1Data[0].$$AttachmentLevel).toBe(4);
    });

    it('should set $$DepthPocketColor based on alert level', function () {
      ctrl.transformExamObjects();
      expect(ctrl.chart1Data[0].$$DepthPocketColor).toBe(
        scope.pocketDepthColor
      );
      ctrl.rawExamForArch = [];
      for (var i = 0; i < 1; i++) {
        toothExam.DepthPocket[0] = 9;
        ctrl.rawExamForArch.push(toothExam);
      }
      scope.$apply();
      ctrl.transformExamObjects();
      expect(ctrl.chart1Data[0].$$DepthPocketColor).toBe(scope.alertLevelColor);
    });

    it('should set $$GingivalMarginPocket based on alert level', function () {
      ctrl.transformExamObjects();
      expect(ctrl.chart1Data[0].$$GingivalMarginColor).toBe(
        scope.gingivalMarginColor
      );
      ctrl.rawExamForArch = [];
      for (var i = 0; i < 1; i++) {
        toothExam.GingivalMarginPocket[0] = 9;
        ctrl.rawExamForArch.push(toothExam);
      }
      scope.$apply();
      ctrl.transformExamObjects();
      expect(ctrl.chart1Data[0].$$GingivalMarginColor).toBe(
        scope.alertLevelColor
      );
    });

    it('should set $$Indentifier for use by default paths', function () {
      ctrl.transformExamObjects();
      expect(ctrl.chart1Data[0].$$Indentifier).toBe('tooth_id_1_pocket_1');
    });
  });
});
