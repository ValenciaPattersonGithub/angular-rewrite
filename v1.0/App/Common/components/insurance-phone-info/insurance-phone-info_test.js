describe('insurance-phone-info controller ->', function () {
  var scope, ctrl;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.directives'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    ctrl = $controller('InsurancePhoneInfoController', {
      $scope: scope,
    });
  }));

  it('should initialize the controller', function () {
    expect(ctrl).toBeDefined();
  });
});
