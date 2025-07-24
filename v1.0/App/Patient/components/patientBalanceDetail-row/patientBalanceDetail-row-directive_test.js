describe('balanceDetailRow directive ->', function () {
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
      '<balance-detail-row data="dataForBalanceDetailRow" selected-patient-id="$parent.currentPatientId" account-members="$parent.accountMembersOptions" reset-data="showDataForAll" get-latest-details="doRefresh"></balance-detail-row>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
  });
});
