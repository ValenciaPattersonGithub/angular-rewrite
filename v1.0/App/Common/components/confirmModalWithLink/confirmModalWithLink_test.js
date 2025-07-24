describe('confirmModal ->', function () {
  var rootScope, scope, controller, mInstance;

  beforeEach(module('common.controllers'));

  beforeEach(inject(function ($rootScope, $controller) {
    mInstance = {
      close: function () {},
      dismiss: function () {},
    };
    rootScope = $rootScope;
    scope = rootScope.$new();
    controller = $controller('ConfirmModalWithLinkController', {
      $scope: scope,
      $uibModalInstance: mInstance,
      item: {},
    });
  }));

  describe('confirm function -> ', function () {
    it('should call close', function () {
      spyOn(mInstance, 'close');
      scope.confirm();

      expect(mInstance.close).toHaveBeenCalled();
    });
  });

  describe('close function -> ', function () {
    it('should call dismiss', function () {
      spyOn(mInstance, 'dismiss');
      scope.close();

      expect(mInstance.dismiss).toHaveBeenCalled();
    });
  });
});
