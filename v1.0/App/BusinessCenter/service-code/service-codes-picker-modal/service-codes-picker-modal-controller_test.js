describe('Controller: ServiceCodesPickerModalController', function () {
  var ctrl, scope, modalInstance;
  var actualOptions, deferred, q, controller;

  function createController() {
    ctrl = controller('ServiceCodesPickerModalController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
    });
  }

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $q, $controller) {
    scope = $rootScope.$new();
    q = $q;
    controller = $controller;

    //mock for modal
    modalInstance = {
      open: jasmine
        .createSpy('modalInstance.open')
        .and.callFake(function (options) {
          actualOptions = options;
          deferred = q.defer();
          deferred.resolve('some value in return');
          return { result: deferred.promise };
        }),
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    createController();
  }));

  //controller
  it('ServiceCodesPickerModalController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('close function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));

    it('should dismiss the modalInstance', function () {
      scope.close();
      expect(modalInstance.dismiss).toHaveBeenCalled();
    });
  });

  describe('onSelect function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));

    it('should close the modalInstance', function () {
      var selectedServiceCodes = 1;
      scope.onSelect(selectedServiceCodes);
      expect(modalInstance.close).toHaveBeenCalledWith(selectedServiceCodes);
    });
  });
});
