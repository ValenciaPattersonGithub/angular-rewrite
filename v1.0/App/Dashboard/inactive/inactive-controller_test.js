describe('inactiveController', function () {
  var ctrl, scope, patSecurityService, q, deferred;

  beforeEach(module('Soar.Dashboard'));
  beforeEach(inject(function ($rootScope, $controller, $q) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();

    //mock for patSecurityService

    patSecurityService = {
      logout: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    //mock controller
    ctrl = $controller('InactiveController', {
      $scope: scope,
      patSecurityService: patSecurityService,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(patSecurityService).not.toBeNull();
    });
  });

  describe('returnToLogin function ->', function () {
    it('should call patSecurityService.logout', function () {
      scope.returnToLogin();
      expect(patSecurityService.logout).toHaveBeenCalled();
    });
  });
});
