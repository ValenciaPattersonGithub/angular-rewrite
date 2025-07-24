describe('errorResponseModal ->', function () {
  var rootScope, scope, controller, mInstance;

  beforeEach(module('common.controllers'));

  beforeEach(inject(function ($rootScope, $controller) {
    mInstance = {
      close: function () {},
      dismiss: function () {},
    };
    rootScope = $rootScope;
    scope = rootScope.$new();
    controller = $controller('ErrorResponseModalController', {
      $scope: scope,
      $uibModalInstance: mInstance,
      item: {},
    });
  }));

  describe('close function -> ', function () {
    it('should call close', function () {
      spyOn(mInstance, 'dismiss');
      scope.close();

      expect(mInstance.dismiss).toHaveBeenCalled();
    });
  });
});
