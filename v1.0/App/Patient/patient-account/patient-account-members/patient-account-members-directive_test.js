describe('patientAccountMembers directive ->', function () {
  //local variables
  var compile, scope, compileProvider, element;

  //load module
  beforeEach(module('Soar.Patient'));

  //add compiler module to compile patient account member directive
  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  //inject required dependencies
  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope.$new();
    scope.accountMembers = [];
  }));

  //scope will be defined
  it('scope should be defined after compiling patient account member’s directive', function () {
    element = angular.element(
      '<patient-account-members account-id="1" patient-id="2"></patient-account-members>'
    );
    compile(element)(scope);

    //scope should not be null
    expect(scope.patientId).not.toBeNull();
    expect(scope.accountId).not.toBeNull();
  });
});
