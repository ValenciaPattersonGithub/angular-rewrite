describe('PerioCompareEditExamsController tests ->', function () {
  var ctrl, scope;

  beforeEach(module('Soar.Common'));
  beforeEach(module('Soar.Patient', function ($provide) {
    $provide.value('ExamState', {
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
  }));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('PerioCompareEditExamsController', {
      $scope: scope,
      $uibModalInstance: {},
    });
    ctrl.$onInit();
  }));

  describe('assignColumn function -> ', function () {
    it('should assign to column 1', function () {
      var header = {};
      ctrl.assignColumn(2, 6, header);
      expect(header.$$Column).toBe(1);
    });

    it('should assign to column 2', function () {
      var header = {};
      ctrl.assignColumn(7, 6, header);
      expect(header.$$Column).toBe(2);
    });

    it('should assign to column 3', function () {
      var header = {};
      ctrl.assignColumn(16, 6, header);
      expect(header.$$Column).toBe(3);
    });

    it('should assign to column 4', function () {
      var header = {};
      ctrl.assignColumn(23, 6, header);
      expect(header.$$Column).toBe(4);
    });
  });

  describe('processResponse function -> ', function () {
    it('should create perioExamHeaders', function () {
      var date = new Date('03/03/2017');
      var res = { Value: [{ ExamDate: date, IsDeleted: false }] };
      ctrl.processResponse(res);
      expect(scope.perioExamHeaders).toEqual(res.Value);
    });

    it('should sort newest first', function () {
      var recentDate = new Date('03/03/2017');
      var oldDate = new Date('03/03/2013');
      var res = {
        Value: [
          { ExamDate: oldDate, IsDeleted: false },
          { ExamDate: recentDate, IsDeleted: false },
        ],
      };
      ctrl.processResponse(res);
      expect(scope.perioExamHeaders).not.toEqual(res.Value);
    });

    it('should not include deleted in perioExamHeaders', function () {
      var date = new Date();
      var res = {
        Value: [
          { ExamDate: date, IsDeleted: false },
          { ExamDate: date, IsDeleted: true },
        ],
      };
      ctrl.processResponse(res);
      expect(scope.perioExamHeaders.length).toEqual(1);
    });

    it('should assign title', function () {
      var date = new Date('03/03/2017');
      var res = { Value: [{ ExamDate: date, IsDeleted: false }] };
      ctrl.processResponse(res);
      expect(scope.perioExamHeaders[0].$$Title).toEqual('03/03/2017');
    });
  });

  describe('checkBoxChanged function -> ', function () {
    it('should add selected items to $scope.selectedExamIds', function () {
      scope.perioExamHeaders = [
        { $$Selected: true, ExamId: 1 },
        { $$Selected: true, ExamId: 2 },
      ];
      scope.checkBoxChanged();
      expect(scope.selectedExamIds).toEqual([1, 2]);
    });

    it('should set $scope.checkboxesDisabled to true if six have been selected', function () {
      scope.perioExamHeaders = [
        { $$Selected: true, ExamId: 1 },
        { $$Selected: true, ExamId: 2 },
        { $$Selected: true, ExamId: 3 },
        { $$Selected: true, ExamId: 4 },
        { $$Selected: true, ExamId: 5 },
        { $$Selected: true, ExamId: 6 },
      ];
      scope.checkBoxChanged();
      expect(scope.checkboxesDisabled).toBe(true);
    });
  });
});
