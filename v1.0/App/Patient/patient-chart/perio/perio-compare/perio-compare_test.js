describe('PerioCompareController tests ->', function () {
  var ctrl, scope, modalFactory, q, location;

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

  beforeEach(inject(function ($rootScope, $controller, $q) {
    location = {
      url: jasmine.createSpy().and.returnValue(''),
    };
    q = $q;
    modalFactory = {
      Modal: jasmine.createSpy().and.callFake(function () {
        var modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve(1);
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
    };
    scope = $rootScope.$new();
    ctrl = $controller('PerioCompareController', {
      $scope: scope,
      ModalFactory: modalFactory,
      $location: location,
    });
    ctrl.$onInit();
  }));

  describe('positionLabels function -> ', function () {
    it('should set labelPos and quadrantGap to relevant lists for 4 exams', function () {
      scope.exams = [{}, {}, {}, {}];
      ctrl.positionLabels();
      expect(scope.labelPos).toEqual([0, 1, 2, 3]);
      expect(scope.quadrantGap).toEqual([0, 1, 2]);
    });

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

  describe('select function -> ', function () {
    it('should set selectedExamType to item paased', function () {
      expect(scope.selectedExamType).toBe('Pocket Depth');
      scope.select(scope.readings[2]);
      expect(scope.selectedExamType).toBe('M-G Junction');
    });

    it('should set item passed to Selected: true and others to false', function () {
      scope.select(scope.readings[1]);
      expect(scope.readings[0].Selected).toBe(false);
      expect(scope.readings[1].Selected).toBe(true);
      expect(scope.readings[2].Selected).toBe(false);
    });
  });
});
