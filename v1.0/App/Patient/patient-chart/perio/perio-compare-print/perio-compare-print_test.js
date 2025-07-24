describe('PerioComparePrintController tests ->', function () {
  var ctrl, scope, personFactory, patientPerioExamFactory, routeParams, filter;

  // perio-compare-print expects stored value
  var mockExams = [{}, {}, {}, {}, {}, {}, {}, {}];
  var mockStorageItem = { ExamType: 'DepthPocket', Exams: mockExams };

  beforeEach(module('Soar.Common'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      // mock patientPerioExamFactory
      patientPerioExamFactory = {
        access: jasmine.createSpy().and.returnValue({ View: true }),
        convertNullsToZero: jasmine.createSpy(),
      };
      $provide.value('PatientPerioExamFactory', patientPerioExamFactory);

      // mock personFactory
      personFactory = {
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PersonFactory', personFactory);

      localStorage.getItem = jasmine
        .createSpy()
        .and.returnValue(JSON.stringify(mockStorageItem));
      localStorage.removeItem = jasmine.createSpy().and.returnValue();
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $routeParams, $filter) {
    routeParams = $routeParams;
    scope = $rootScope.$new();
    filter = $filter;
    routeParams = {};
    routeParams.patientId = 'b6dbd840-f15f-42c8-98bf-ed079e89c67e';

    scope = $rootScope.$new();
    ctrl = $controller('PerioComparePrintController', {
      $scope: scope,
      $routeParams: routeParams,
      $filter: filter,
      PatientPerioExamFactory: patientPerioExamFactory,
      PersonFactory: personFactory,
    });
    ctrl.$onInit();
  }));

  describe('positionLabels function -> ', function () {
    it('should set labelPos and quadrantGap to relevant lists for 8 exams', function () {
      scope.exams = [{}, {}, {}, {}, {}, {}, {}, {}];
      ctrl.positionLabels();
      expect(scope.labelPos).toEqual([1, 3, 5, 7]);
      expect(scope.quadrantGap).toEqual([1, 3, 5]);
    });

    it('should set labelPos and quadrantGap to relevant lists for 12 exams', function () {
      scope.exams = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
      ctrl.positionLabels();
      expect(scope.labelPos).toEqual([1, 4, 7, 10]);
      expect(scope.quadrantGap).toEqual([2, 5, 8]);
    });

    it('should set labelPos and quadrantGap to relevant lists for 16 exams', function () {
      scope.exams = [
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
      ];
      ctrl.positionLabels();
      expect(scope.labelPos).toEqual([2, 6, 10, 14]);
      expect(scope.quadrantGap).toEqual([3, 7, 11]);
    });

    it('should set labelPos and quadrantGap to relevant lists for 20 exams', function () {
      scope.exams = [
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
      ];
      ctrl.positionLabels();
      expect(scope.labelPos).toEqual([2, 7, 12, 17]);
      expect(scope.quadrantGap).toEqual([4, 9, 14]);
    });

    it('should set labelPos and quadrantGap to relevant lists for 24 exams', function () {
      scope.exams = [
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
      ];
      ctrl.positionLabels();
      expect(scope.labelPos).toEqual([3, 9, 15, 21]);
      expect(scope.quadrantGap).toEqual([5, 11, 17]);
    });
  });

  describe('loadComparisonFromStorage function -> ', function () {
    it('should call localStorage.getItem', function () {
      ctrl.loadComparisonFromStorage();
      expect(localStorage.getItem).toHaveBeenCalledWith(
        'perio_compare_b6dbd840-f15f-42c8-98bf-ed079e89c67e'
      );
    });

    it('should load exams from local storage', function () {
      ctrl.loadComparisonFromStorage();
      expect(scope.exams).toEqual(mockExams);
    });

    it('should load selectedExamType from local storage', function () {
      ctrl.loadComparisonFromStorage();
      expect(scope.selectedExamType).toEqual('DepthPocket');
    });

    it('should remove item from local storage', function () {
      ctrl.loadComparisonFromStorage();
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        'perio_compare_b6dbd840-f15f-42c8-98bf-ed079e89c67e'
      );
    });
  });

  describe('getPatient function -> ', function () {
    it('should call personFactory.getById', function () {
      ctrl.getPatient();
      expect(personFactory.getById).toHaveBeenCalledWith(
        'b6dbd840-f15f-42c8-98bf-ed079e89c67e'
      );
    });
  });
});
