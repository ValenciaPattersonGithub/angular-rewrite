describe('toothQuadrant directive ->', function () {
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
    scope.selectedTeeth = {};
    scope.activeTooth = {};
    scope.multiselectEnabled = true;
    scope.quadrantSelectionOnly = true;
    scope.showTeethDetail = false;
  }));

  beforeEach(function () {
    var htmlString =
      '<tooth-quadrant selected-teeth="selectedTeeth" quadrant-selection-only="quadrantSelectionOnly" multiselect-enabled="multiselectEnabled" active-tooth="activeTooth"></tooth-quadrant>';
    element = angular.element(htmlString);

    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
  });
});
