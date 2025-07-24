describe('paymentField directive ->', function () {
  var compile, scope, compileProvider, element;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.directives'));
  beforeEach(module('Soar.Patient'));

  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope.$new();

    scope.paymentTypes = 1;
    scope.payment = 1;
    scope.hasError = 1;
  }));

  beforeEach(function () {
    element = angular.element(
      '<payment-field payment-types="paymentTypes" payment="payment" has-error="hasError"></payment-field>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
  });
});
