describe('patientAppointmentTile directive ->', function () {
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
    scope.patientAppointment = {};
    scope.tileIndex = {};
    scope.showDate = {};
    scope.isDisabled = {};
  }));

  beforeEach(function () {
    element = angular.element(
      '<patient-appointment-tile patientAppointment="patientAppointment" tileIndex="tileIndex" isDisabled="isDisabled" showDate="showDate"></patient-appointment-tile>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
    expect(scope.patientAppointment).not.toBeNull();
    expect(scope.tileIndex).not.toBeNull();
    expect(scope.showDate).not.toBeNull();
    expect(scope.isDisabled).not.toBeNull();
  });
});
