describe('perioStatsToothTile directive ->', function () {
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
    scope.perioStatsToothExam = {};
    scope.tileIndex = {};
    scope.showDate = {};
  }));

  beforeEach(function () {
    element = angular.element(
      '<perio-stats-tooth-tile perioStatsToothExam="perioStatsToothExam" tileIndex="tileIndex" showDate="showDate"></perio-stats-tooth-tile>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
    expect(scope.perioStatsToothExam).not.toBeNull();
    expect(scope.tileIndex).not.toBeNull();
    expect(scope.showDate).not.toBeNull();
  });
});
