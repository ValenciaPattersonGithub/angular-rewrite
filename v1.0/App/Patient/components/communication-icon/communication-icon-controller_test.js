describe('communication-icon ->', function () {
  var scope,
    rootScope,
    toastrFactory,
    timeout,
    localize,
    uibModal,
    patientServices,
    q,
    deferred,
    ctrl;

  // #region Setup

  beforeEach(
    module('Soar.Patient', function ($provide) {
      timeout = jasmine.createSpy();
      $provide.value('$timeout', timeout);
    })
  );

  beforeEach(inject(function ($rootScope, $filter, $controller, $q) {
    scope = $rootScope.$new();
    rootScope = $rootScope;

    q = $q;
    deferred = q.defer();

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    uibModal = {
      open: jasmine.createSpy(),
    };
    patientServices = {
      Communication: {
        countUnReadCommunication: jasmine
          .createSpy()
          .and.returnValue({ $promise: deferred.promise }),
      },
    };

    ctrl = $controller('CommunicationIconController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      $timeout: timeout,
      localize: localize,
      $uibModal: uibModal,
      PatientServices: patientServices,
    });
  }));

  // #endregion

  // #region Tests

  describe('initial values ->', function () {
    it('CommunicationIconController : should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
      expect(ctrl).not.toBeUndefined();
    });

    it('patientServices.Communication.countUnReadCommunication: should have been called', function () {
      scope.patientId = '54DA8622-8399-4C96-9978-2880963EB0D5';
      scope.communicationTypeId = '6';
      scope.showUnreadCount = true;
      ctrl.getCount();
      expect(
        patientServices.Communication.countUnReadCommunication
      ).toHaveBeenCalled();
    });
  });

  describe('openModal method ->', function () {
    beforeEach(function () {
      spyOn(rootScope, '$broadcast');
    });
    it('should broadcast soar:openCommunicationModal', function () {
      scope.openModal();
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'soar:openCommunicationModal'
      );
    });
  });

  describe('ctrl.getCountSuccess ->', function () {
    it('should set scope.count', function () {
      var result = {
        Value: 2,
      };

      ctrl.getCountSuccess(result);

      expect(scope.count).toEqual(2);
      expect(scope.showCount).toBeTruthy();
      expect(scope.showIcon).toBeTruthy();
    });
    it('should set scope.showIcon to true', function () {
      var result = {
        Value: 2,
      };
      scope.hideOnZeroCount = true;
      ctrl.getCountSuccess(result);
      expect(scope.showIcon).toBeTruthy();
    });
    it('should set scope.showIcon to false', function () {
      var result = {
        Value: 0,
      };
      scope.hideOnZeroCount = true;
      ctrl.getCountSuccess(result);
      expect(scope.showIcon).toBeFalsy();
    });
  });

  describe('$on broadcast function ->', function () {
    it('should handle broadcast of closeCommunicationModal', function () {
      scope.modalInstance = {
        close: jasmine.createSpy(),
      };
      scope.$broadcast('closeCommunicationModal');
      expect(scope.modalInstance.close).toHaveBeenCalled();
    });
    it('should handle broadcast of refreshCommunicationCount', function () {
      ctrl.getCount = jasmine.createSpy();
      scope.$broadcast('refreshCommunicationCount');
      expect(ctrl.getCount).toHaveBeenCalled();
    });
  });

  // #endregion
});
