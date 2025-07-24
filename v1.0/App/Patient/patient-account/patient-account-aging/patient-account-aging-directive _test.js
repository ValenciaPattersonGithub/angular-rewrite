describe('patientAccountAging directive ->', function () {
  var compile, scope, compileProvider, element;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope.$new();
    scope.graphData = {
      moreThanThirtyBalance: 50,
      moreThanSixtyBalance: 20,
      moreThanNintyBalance: 40,
      currentBalance: 100,
    };
    scope.totalBalance = 210;
  }));

  beforeEach(function () {
    element = angular.element(
      '<patient-account-aging data="totalBalance" graph-data="graphData"></patient-account-aging>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
  });
});
