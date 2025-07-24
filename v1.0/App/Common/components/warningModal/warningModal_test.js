describe('WarningModal ->', function () {
  var rootScope, scope, controller, mInstance, item;

  beforeEach(module('common.controllers'));

  beforeEach(inject(function ($rootScope, $controller) {
    mInstance = {
      close: function () {},
      dismiss: function () {},
    };
    rootScope = $rootScope;
    scope = rootScope.$new();
    item = null;
    controller = $controller('WarningModalController', {
      $scope: scope,
      $uibModalInstance: mInstance,
      item,
    });
  }));

  describe('confirmDiscard function -> ', function () {
    it('should call close', function () {
      spyOn(mInstance, 'close');
      scope.confirmDiscard();

      expect(mInstance.close).toHaveBeenCalled();
    });
  });

  describe('cancelDiscard function -> ', function () {
    it('should call close', function () {
      spyOn(mInstance, 'close');
      scope.cancelDiscard();

      expect(mInstance.close).toHaveBeenCalled();
    });
  });
});
