describe('soar-widget directive ->', function () {
  var el, scope, controller, element, compileProvider, compile;

  beforeEach(module('Soar.Dashboard'));
  beforeEach(module('Soar.Widget'));

  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope;
    el = angular.element('<soar-widget></soar-widget>');
    scope.data = [];
    scope.hideWidget = false;
    $compile(el)(scope);
    controller = el.controller();
  }));

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
    expect(scope.hideWidget).toBe(false);
  });
});
