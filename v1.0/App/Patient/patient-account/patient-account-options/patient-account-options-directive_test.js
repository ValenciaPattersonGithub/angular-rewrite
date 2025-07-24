describe('patientAccountOptions directive ->', function () {
  var compile, scope, exceptionHandler, compileProvider;

  var element;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  beforeEach(inject(function ($compile, $rootScope, $exceptionHandler) {
    compile = $compile;
    exceptionHandler = $exceptionHandler;
    scope = $rootScope.$new();
    scope.patient = {};
  }));

  beforeEach(function () {
    element = angular.element(
      '<patient-account-options patient=patient></patient-account-options>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
  });
});
