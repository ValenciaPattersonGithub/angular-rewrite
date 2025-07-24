describe('creditTransaction directive ->', function () {
  //local variables
  var compile, scope, compileProvider, element;

  //load module
  beforeEach(module('Soar.Patient'));

  //add compiler module to compile credit transaction directive
  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  //inject required dependencies
  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope.$new();
    scope.serviceAndDebitTransactionDtos = [];
  }));

  //scope will be defined
  it('scope should be defined after compiling credit transaction directive', function () {
    element = angular.element(
      '<credit-transaction data="[]"></credit-transaction>'
    );
    compile(element)(scope);

    //scope should not be null
    expect(scope.creditTransactionDto).not.toBeNull();
    expect(scope.AssignmentType).not.toBeNull();
  });
});
