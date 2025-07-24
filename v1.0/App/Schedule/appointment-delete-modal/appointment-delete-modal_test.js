describe('deleteModal ->', function () {
  var rootScope, scope, controller, mInstance;

  beforeEach(module('common.controllers'));
  beforeEach(module('Soar.Schedule'));

  beforeEach(inject(function ($rootScope, $controller) {
    mInstance = {
      close: function () {},
      dismiss: function () {},
    };
    rootScope = $rootScope;
    scope = rootScope.$new();
    controller = $controller('AppointmentDeleteModalController', {
      $scope: scope,
      $uibModalInstance: mInstance,
      item: {},
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
      spyOn(mInstance, 'dismiss');
      scope.cancelDiscard();

      expect(mInstance.dismiss).toHaveBeenCalled();
    });
  });
});
