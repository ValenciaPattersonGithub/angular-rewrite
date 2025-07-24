describe('patientPendingEncounter directive ->', function () {
  var compile, scope, compileProvider, element;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope.$new();
    scope.patient = 1;
  }));

  beforeEach(function () {
    element = angular.element(
      '<patient-pending-encounter patient = "patient"></patient-pending-encounter>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
    expect(scope.patient).not.toBe(null);
  });
});
