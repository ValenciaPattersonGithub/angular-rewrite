describe('Controller: CustomFormPublishController', function () {
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

    controller = $controller('CustomFormPublishController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      formId: '00000000-0000-0000-0000-000000000000',
    });
  }));

  it('should check if controller exists', function () {
    expect(controller).not.toBeNull();
  });

  it('should check if modalInstance.close have been called with "Save & Publish" option', function () {
    scope.saveAndPublishForm();
    expect(modalInstance.close).toHaveBeenCalledWith({
      formId: '00000000-0000-0000-0000-000000000000',
      canPublish: true,
    });
  });

  it('should check if modalInstance.close have been called with "Save" option', function () {
    scope.saveForm();
    expect(modalInstance.close).toHaveBeenCalledWith({
      formId: '00000000-0000-0000-0000-000000000000',
      canPublish: false,
    });
  });

  it('should check if modalInstance.dismiss have been called with "Cancel" option', function () {
    scope.closeForm();
    expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
  });
});
