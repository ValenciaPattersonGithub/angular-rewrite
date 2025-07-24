describe('adjustmentTypeCrud directive ->', function () {
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

    scope.editMode = true;
    scope.typeId = 1;
    scope.types = [];
  }));

  beforeEach(function () {
    element = angular.element(
      '<adjustment-type-crud type-id="adjustmentTypeId" types="adjustmentTypes" edit-mode="editMode"></adjustment-type-crud>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
  });
});
