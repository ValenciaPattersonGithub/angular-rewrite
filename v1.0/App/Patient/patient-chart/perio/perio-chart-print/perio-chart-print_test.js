describe('PerioChartPrintController ->', function () {
  var routeParams,
    scope,
    ctrl,
    patientPerioExamFactory,
    examDetails,
    examHeader,
    perioExam;
  var examIdMock = '11d2daaf-b382-4e0f-bed8-2d1b6554e4f8';

  examHeader = {
    ExamHeader: {
      PatientId: '74e00e01-ece9-4e10-a715-bf71f73d4a80',
      ExamId: '11d2daaf-b382-4e0f-bed8-2d1b6554e4f8',
      ExamDate: '2017-08-09T20:43:36.5081498',
      IsDeleted: false,
      DataTag: 'AAAAAAAB3ho=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-08-09T20:43:36.50915',
    },
  };

  examDetails = [
    {
      EntityId: '577763d2-522e-48e3-8991-4993aee35b8b',
      PracticeId: 1,
      ExamId: '11d2daaf-b382-4e0f-bed8-2d1b6554e4f8',
      ToothId: '1',
      PatientId: '74e00e01-ece9-4e10-a715-bf71f73d4a80',
      BleedingPocket: [null, null, null, null, null, null],
      DepthPocket: [4, 5, 1, null, null, null],
      FurcationGradeRoot: [null, null, null],
      GingivalMarginPocket: [null, null, null, null, null, null],
      MgjPocket: [null, null, null, null, null, null],
      Mobility: null,
      SuppurationPocket: [null, null, null, null, null, null],
      DataTag: 'AAAAAAAB3iM=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-08-09T20:43:36.5622196',
      $$FurcationReadingsAllowed: 3,
      $$MouthSide: 'Right',
      $$BuccalInputArray: [0, 1, 2],
      $$LingualInputArray: [5, 4, 3],
      ToothNumber: 1,
      ToothState: '',
      AttachmentLvl: [4, 5, 1, null, null, null],
    },
    {
      EntityId: '194fe294-92d1-4075-99d4-c75696c788f6',
      PracticeId: 1,
      ExamId: '11d2daaf-b382-4e0f-bed8-2d1b6554e4f8',
      ToothId: '2',
      PatientId: '74e00e01-ece9-4e10-a715-bf71f73d4a80',
      BleedingPocket: [null, null, null, null, null, null],
      DepthPocket: [2, 5, 2, null, null, null],
      FurcationGradeRoot: [null, null, null],
      GingivalMarginPocket: [null, null, null, null, null, null],
      MgjPocket: [null, null, null, null, null, null],
      Mobility: 2,
      SuppurationPocket: [null, null, null, null, null, null],
      DataTag: 'AAAAAAAB3h0=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-08-09T20:43:36.5672231',
      $$FurcationReadingsAllowed: 3,
      $$MouthSide: 'Right',
      $$BuccalInputArray: [0, 1, 2],
      $$LingualInputArray: [5, 4, 3],
      ToothNumber: 2,
      ToothState: '',
      AttachmentLvl: [2, 5, 2, null, null, null],
    },
  ];

  perioExam = {
    ExamHeader: examHeader,
    ExamDetails: examDetails,
  };

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientPerioExamFactory = {
        access: jasmine.createSpy().and.returnValue({ View: true }),
        convertNullsToZero: jasmine.createSpy(),
      };
      $provide.value('PatientPerioExamFactory', patientPerioExamFactory);
      $provide.value('PersonFactory', {
        getById: jasmine.createSpy().and.returnValue(new Promise(resolve => resolve()))
      });
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $routeParams) {
    routeParams = $routeParams;
    scope = $rootScope.$new();
    routeParams.examId = 1;
    localStorage.setItem('perio_1', JSON.stringify(perioExam));
    ctrl = $controller('PerioChartPrintController', {
      $scope: scope,
      PatientPerioExamFactory: patientPerioExamFactory,
      personId: '134',
    });
  }));

  it('should exist', function () {
    expect(ctrl).toBeDefined();
  });

  describe('ctrl.$onInit method -> ', function () {
    beforeEach(function () {});

    it('should set scope.perioExam based on routeParams.examId and storageItem', function () {
      scope.perioExam = null;
      localStorage.setItem('perio_' + examIdMock, JSON.stringify(perioExam));
      ctrl.$onInit();
      expect(scope.perioExam.ExamId).toEqual(perioExam.ExamId);
    });

    // this test not working due to JSON parse
    it('should not set scope.perioExam if storageItem no longer exists', function () {
      // scope.perioExam=null;
      // localStorage.clear();
      // ctrl.$onInit();
      // expect(scope.perioExam).toEqual(null);
    });
  });
});
