describe('Controller: CustomFormDiscardController', function () {
  var scope, controller, modalInstance;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    controller = $controller('CustomFormDiscardController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
    });
  }));

  it('should check if controller exists', function () {
    expect(controller).not.toBeNull();
  });

  it('should check if modalInstance.close have been called', function () {
    scope.discardForm();
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('should check if modalInstance.dismiss have been called with "Cancel" option', function () {
    scope.cancelDiscard();
    expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
  });
});
