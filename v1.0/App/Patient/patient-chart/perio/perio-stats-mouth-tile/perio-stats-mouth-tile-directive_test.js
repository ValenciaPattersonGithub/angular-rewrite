describe('perioStatsMouthTile directive ->', function () {
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
    scope.perioStatsMouth = {};
    scope.tileIndex = {};
    scope.showDate = {};
    scope.goToPerioTab = {};
  }));

  beforeEach(function () {
    element = angular.element(
      '<perio-stats-mouth-tile perioStatsMouth="perioStatsMouth" tileIndex="tileIndex" showDate="showDate" goToPerioTab="goToPerioTab"></perio-stats-mouth-tile>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
    expect(scope.perioStatsMouth).not.toBeNull();
    expect(scope.tileIndex).not.toBeNull();
    expect(scope.showDate).not.toBeNull();
    expect(scope.goToPerioTab).not.toBeNull();
  });
});
