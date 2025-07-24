describe('receivable-menu directive ->', function () {
  var compile, scope, compileProvider, element;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope.$new();

    scope.receivable = {};
  }));

  beforeEach(function () {
    element = angular.element(
      '<receivable-menu receivable="row"></receivable-menu>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
    expect(scope.receivable).not.toBeNull();
  });
});
