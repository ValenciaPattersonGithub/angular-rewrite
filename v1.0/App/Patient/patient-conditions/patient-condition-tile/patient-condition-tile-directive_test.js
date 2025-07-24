describe('patientConditionTile directive ->', function () {
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
    scope.patientCondition = {};
    scope.tileIndex = {};
    scope.showDate = {};
  }));

  beforeEach(function () {
    element = angular.element(
      '<patient-condition-tile patientCondition="patientCondition" tileIndex="tileIndex" showDate="showDate"></patient-condition-tile>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
    expect(scope.patientCondition).not.toBeNull();
    expect(scope.tileIndex).not.toBeNull();
    expect(scope.showDate).not.toBeNull();
  });
});
