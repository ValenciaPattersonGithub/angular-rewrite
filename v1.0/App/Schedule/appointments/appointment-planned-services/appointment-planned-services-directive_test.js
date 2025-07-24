describe('appointmentPlannedServices directive ->', function () {
  var compile, scope, exceptionHandler, compileProvider;

  var element;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Schedule'));

  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  beforeEach(inject(function ($compile, $rootScope, $exceptionHandler) {
    compile = $compile;
    exceptionHandler = $exceptionHandler;
    scope = $rootScope.$new();
    scope.plannedServices = [];
  }));

  beforeEach(function () {
    element = angular.element(
      '<appointment-planned-services plannedServices="plannedServices"></appointment-planned-services>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
    expect(scope.plannedServices).not.toBeNull();
  });
});
