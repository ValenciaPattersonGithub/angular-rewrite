describe('soar-widget-controller', function () {
  var ctrl, scope, widgetInitStatus, compile, q, deferred;

  beforeEach(module('Soar.Widget'));

  beforeEach(inject(function ($rootScope, $compile, $controller, $q) {
    compile = $compile;
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();

    scope.data = {
      Template: 1,
      Loading: true,
    };

    widgetInitStatus = {
      ToLoad: 0,
      Loading: 1,
      Loaded: 2,
    };

    //mock controller
    ctrl = $controller('SoarWidgetController', {
      $scope: scope,
      widgetInitStatus: widgetInitStatus,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should scope to be defined', function () {
      expect(scope).toBeDefined();
    });

    it('should have injected services ', function () {
      expect(widgetInitStatus).not.toBeNull();
    });
  });

  describe('WidgetLoadingStarted', function () {
    it('status should be set to loading', function () {
      scope.$emit('WidgetLoadingStarted');
      expect(scope.loading).toBe(true);
      expect(scope.loadingFailed).toBe(false);
      expect(scope.errorMessage).toEqual('');
    });
  });

  describe('WidgetLoadingDone', function () {
    it('status should be set to loaded', function () {
      scope.$emit('WidgetLoadingDone');
      expect(scope.loading).toBe(false);
      expect(scope.loadingFailed).toBe(false);
      expect(scope.errorMessage).toEqual('');
    });
  });

  describe('WidgetLoadingError', function () {
    it('status should be set to loaded with error', function () {
      scope.$emit('WidgetLoadingError', 'Failed to load data.');
      expect(scope.loading).toBe(false);
      expect(scope.loadingFailed).toBe(true);
      expect(scope.errorMessage).not.toBeNull();
    });
  });
});
