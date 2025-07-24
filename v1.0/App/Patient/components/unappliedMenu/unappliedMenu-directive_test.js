describe('unappliedMenu directive ->', function () {
  var compile, scope, compileProvider, element;

  beforeEach(module('Soar.Patient'));

  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope.$new();

    scope.data = 1;
    scope.selectedPatientId = 1;
    scope.accountMembers = true;
  }));

  beforeEach(function () {
    element = angular.element(
      '<unapplied-menu id="unappliedMenu{{$index}}" unapplied-data-model="transactionHistoryService.unappliedDataModel" refresh-data="refreshTransactionHistoryPageData"></unapplied-menu>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
  });
});
