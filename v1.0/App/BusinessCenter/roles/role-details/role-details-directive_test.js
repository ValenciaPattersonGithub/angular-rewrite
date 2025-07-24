describe('roleDetails directive ->', function () {
  //local variables
  var compile, scope, compileProvider, element;

  //load module
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  //add compiler module to compile role-details directive
  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  //inject required dependencies
  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope.$new();
    scope.roleId = 1;
  }));

  //scope will be defined
  it('scope should be defined after compiling roleDetails directive', function () {
    element = angular.element('<role-details role-id="roleId"></role-details>');
    compile(element)(scope);

    //scope should not be null
    expect(scope.roleId).not.toBeNull();
  });
});
