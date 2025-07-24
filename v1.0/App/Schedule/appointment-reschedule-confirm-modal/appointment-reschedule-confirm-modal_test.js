describe('appointment-reschedule-confirm-modal ->', function () {
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
    controller = $controller('AppointmentRescheduleConfirmModalController', {
      $scope: scope,
      $uibModalInstance: mInstance,
      appointment: { Status: 2 },
    });
  }));

  describe('confirmReschedule function -> ', function () {
    it('should call close when unconfirmed selected', function () {
      spyOn(mInstance, 'close');
      scope.confirmReschedule();

      expect(mInstance.close).toHaveBeenCalled();
      expect(scope.checkBoxAction).toBeTruthy();
      expect(scope.appointment.Status).toBe(0);
    });
  });

  describe('cancelReschedule function -> ', function () {
    it('should call close', function () {
      spyOn(mInstance, 'dismiss');
      scope.cancelReschedule();

      expect(mInstance.dismiss).toHaveBeenCalled();
    });
  });
});
