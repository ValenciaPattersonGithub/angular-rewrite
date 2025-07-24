describe('ImportChartButtonLayoutController tests ->', function () {
  var ctrl, scope;
  var uibModalInstance, usersList, userServices;

  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller) {
    uibModalInstance = {};
    usersList = 'usersList';
    userServices = {};

    scope = $rootScope.$new();
    ctrl = $controller('ImportChartButtonLayoutController', {
      $scope: scope,
      $uibModalInstance: uibModalInstance,
      usersList: usersList,
      UserServices: userServices,
    });
  }));

  it('should exist', function () {
    expect(ctrl).toBeDefined();
    expect(ctrl).not.toBeNull();
  });

  describe('ctrl.$onInit function ->', function () {
    beforeEach(function () {
      scope.users = 'oldUsers';
      scope.disableSave = true;
    });

    it('should set values', function () {
      ctrl.$onInit();

      expect(scope.users).toBe(usersList);
      expect(scope.disableSave).toBe(false);
    });
  });

  describe('scope.close function ->', function () {
    beforeEach(function () {
      uibModalInstance.dismiss = jasmine.createSpy();
    });

    it('should set values', function () {
      scope.close();

      expect(uibModalInstance.dismiss).toHaveBeenCalled();
    });
  });

  describe('scope.save function ->', function () {
    beforeEach(function () {
      scope.disableSave = false;
      userServices.ChartButtonLayout = {
        importFavoritesFromUser: jasmine.createSpy(),
      };
    });

    it('should set disableSave and call import when selectedUserId is set', function () {
      scope.selectedUserId = 'selectedUserId';

      scope.save();

      expect(scope.disableSave).toBe(true);
      expect(
        userServices.ChartButtonLayout.importFavoritesFromUser
      ).toHaveBeenCalledWith(
        { userId: scope.selectedUserId },
        ctrl.importSuccess,
        ctrl.importFailure
      );
    });
  });

  describe('ctrl.importSuccess function ->', function () {
    beforeEach(function () {
      ctrl.importFailure = jasmine.createSpy();
      uibModalInstance.close = jasmine.createSpy();
    });

    it('should call ctrl.importFailure when res is not defined', function () {
      ctrl.importSuccess();

      expect(ctrl.importFailure).toHaveBeenCalled();
      expect(uibModalInstance.close).not.toHaveBeenCalled();
    });

    it('should call ctrl.importFailure when res.Value is not defined', function () {
      ctrl.importSuccess({});

      expect(ctrl.importFailure).toHaveBeenCalled();
      expect(uibModalInstance.close).not.toHaveBeenCalled();
    });

    it('should call $uibModalInstance.close when res.Value is defined', function () {
      var value = 'value';
      ctrl.importSuccess({ Value: value });

      expect(ctrl.importFailure).not.toHaveBeenCalled();
      expect(uibModalInstance.close).toHaveBeenCalledWith(value);
    });
  });

  describe('ctrl.importFailure function ->', function () {
    beforeEach(function () {
      scope.disableSave = true;
    });

    it('should set disableSave and call toastrFactory', function () {
      ctrl.importFailure();

      expect(scope.disableSave).toBe(false);
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });
});
