describe('Controller: CustomFormPostSaveController', function () {
  var controller, scope, modalInstance;
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

    controller = $controller('CustomFormPostSaveController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      formId: '00000000-0000-0000-0000-000000000000',
      isSave: true,
    });
  }));

  //controller
  it('should check if controller exists', function () {
    expect(controller).not.toBeNull();
  });

  it('should check if modalInstance.close have been called with "No, I will publish later" option', function () {
    scope.doNotPublish();
    expect(modalInstance.close).toHaveBeenCalledWith({
      formId: '00000000-0000-0000-0000-000000000000',
      doPublish: false,
    });
  });

  it('should check if modalInstance.close have been called with "Publish now" option', function () {
    scope.doPublish();
    expect(modalInstance.close).toHaveBeenCalledWith({
      formId: '00000000-0000-0000-0000-000000000000',
      doPublish: true,
    });
  });
});
