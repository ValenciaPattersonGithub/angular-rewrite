describe('patientResponsibleParty directive ->', function () {
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
    scope.responsiblePerson = {};

    scope.defaultFocus = true;
    scope.disableParty = true;
    scope.isValid = true;
    scope.showError = true;
    scope.ageCheck = true;
  }));

  beforeEach(function () {
    element = angular.element(
      '<patient-responsible-party patient="patient" responsiblePerson="responsiblePerson" ' +
        'defaultFocus="defaultFocus" disableParty="disableParty" isValid="isValid" showError="showError" ' +
        'ageCheck="ageCheck"></patient-responsible-party>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
  });
});
