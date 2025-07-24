describe('patientHeader directive ->', function () {
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

    scope.patientData = 1;
    scope.phones = 1;
    scope.activeUrl = true;
  }));

  beforeEach(function () {
    element = angular.element(
      '<patient-header patient-data="patient.Data" phones="phones" active-url="activeTemplate"></patient-header>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
  });
});
