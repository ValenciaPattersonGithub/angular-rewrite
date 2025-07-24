describe('debitTransaction directive ->', function () {
  //local variables
  var compile, scope, compileProvider, element;

  //load module
  beforeEach(module('Soar.Patient'));

  //add compiler module to compile debit transaction directive
  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  //inject required dependencies
  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope.$new();
    scope.dataForDirective = [];
  }));

  beforeEach(function () {
    //compiling debit transaction directive
    element = angular.element(
      '<debit-transaction data="dataForDirective"></debit-transaction>'
    );
    compile(element)(scope);
  });

  //scope will be defined
  it('scope should be defined after compiling debit transaction directive', function () {
    //scope should not be null
    expect(scope).not.toBeNull();
    expect(scope).not.toBeUndefined();
  });
});
