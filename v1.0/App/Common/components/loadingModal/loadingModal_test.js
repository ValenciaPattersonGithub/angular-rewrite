describe('loadingModal ->', function () {
  var rootScope, scope, mInstance, timeout, mockedService;

  beforeEach(module('common.controllers'));

  beforeEach(
    module('common.services', function ($provide) {
      mockedService = {
        get: jasmine.createSpy().and.returnValue({ then: function () {} }),
      };

      $provide.value('MockedService', mockedService);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $timeout) {
    timeout = $timeout;

    mInstance = {
      close: function () {},
      dismiss: function () {},
    };

    rootScope = $rootScope;
    scope = rootScope.$new();
    scope.init = function () {
      return [
        {
          Call: mockedService.get,
          Params: {},
          OnSuccess: function () {},
          OnError: function () {},
        },
      ];
    };

    $controller('LoadingModalController', {
      $scope: scope,
      $uibModalInstance: mInstance,
    });
  }));

  describe('timeout on load -> ', function () {
    it('should call services', function () {
      timeout.flush();

      expect(scope.services[0].Call).toHaveBeenCalled();
      expect(scope.services[0].isLoading).toBe(true);
    });
  });

  describe('getIsLoading function -> ', function () {
    it('should not call close when isLoading', function () {
      spyOn(mInstance, 'close');
      scope.services[0].isLoading = true;
      scope.getIsLoading();

      expect(mInstance.close).not.toHaveBeenCalled();
    });

    it('should call close when not isLoading', function () {
      spyOn(mInstance, 'close');
      scope.services[0].isLoading = false;
      scope.getIsLoading();

      expect(mInstance.close).toHaveBeenCalled();
    });
  });
});
