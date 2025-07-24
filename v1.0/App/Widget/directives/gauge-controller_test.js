describe('gauge-controller', function () {
  var ctrl, scope, element, timeout, q, compile, compileProvider, deferred;

  beforeEach(module('Soar.Dashboard'));
  beforeEach(module('Soar.Widget'));

  //add compiler module to compile
  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $q, $timeout, $compile) {
    q = $q;
    timeout = $timeout;
    compile = $compile;
    deferred = q.defer();
    scope = $rootScope.$new();
    element = angular.element(
      '<div id="gauge-{{$id}}"  ng-style="getChartStyle()"/>'
    );
    element.appendTo(document.body);
    compile(element)(scope);
    scope.element = element.isolateScope() || element.scope();
    scope.$digest();

    scope.data = [
      {
        Category: 'Value',
        Color: '#30AFCD',
        Count: 0,
        Label: null,
        SeriesName: null,
        Value: 180,
      },
      {
        Category: 'Goal',
        Color: '#AEB5BA',
        Count: 0,
        Label: null,
        SeriesName: null,
        Value: 0,
      },
      { Category: '$180.00', SeriesName: '_hole_', label: '100%' },
    ];

    ctrl = $controller('GaugeController', {
      $scope: scope,
      $element: element,
      $timeout: timeout,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(element).not.toBeNull();
      expect(timeout).not.toBeNull();
    });
  });

  // Need to implement
  describe('ctrl.initChart ->', function () {
    it('ctrl.initChart should be called', function () {
      ctrl.initChart();
      var width = scope.element.width();
      expect(width).not.toEqual(0);
      expect(ctrl.dataSource).not.toBeNull();
    });
  });
});
