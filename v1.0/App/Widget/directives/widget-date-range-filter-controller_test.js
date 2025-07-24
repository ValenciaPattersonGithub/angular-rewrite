describe('widget-data-range-filter', function () {
  var ctrl, scope, q, deferred;

  beforeEach(module('Soar.Dashboard'));
  beforeEach(module('Soar.Widget'));
  beforeEach(inject(function ($rootScope, $controller, $q) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();

    ctrl = $controller('WidgetDateRangeFilterController', {
      $scope: scope,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(ctrl.update).toBe(true);
      expect(scope.showModal).toBeNull();
      expect(ctrl.previousDateFilter).toBeNull();
      expect(scope.fromDateIsValid).toBeNull();
      expect(scope.toDateIsValid).toBeNull();
    });
  });
});
