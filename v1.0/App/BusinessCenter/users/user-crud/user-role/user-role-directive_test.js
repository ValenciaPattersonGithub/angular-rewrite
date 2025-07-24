describe('userRole directive ->', function () {
  //local variables
  var compile, scope, compileProvider, element;

  //load module
  beforeEach(module('kendo.directives'));
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.directives'));

  //add compiler module to compile clinical controls directive
  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  //inject required dependencies
  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope.$new();
    scope.formName = {};
    scope.user = [];
    scope.validForm = [];
    scope.roleId = [];
    scope.updatedRoleId = [];
  }));
});
