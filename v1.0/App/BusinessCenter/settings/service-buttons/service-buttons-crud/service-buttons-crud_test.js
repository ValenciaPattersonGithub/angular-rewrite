describe('ServiceButtonsCrudController ->', function () {
  var scope,
    modalInstance,
    modalFactory,
    serviceButtons,
    listHelper,
    serviceButton;
  var deferred, q;
  var ctrl, toastrFactory, localize;
  var modalFactoryDeferred, serviceButtonsServiceMock;

  serviceButton = { ServiceButtonId: 1, Description: 'Description one' };
  serviceButtons = [
    { ServiceButtonId: 1, Description: 'Description one' },
    { ServiceButtonId: 2, Description: 'Description two' },
  ];

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $q) {
    scope = $rootScope.$new();
    q = $q;

    //mock for modalFactory
    modalFactory = {
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      Modal: jasmine.createSpy('modalFactory.Modal').and.callFake(function () {
        modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve(1);
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
    };

    //mock for modal
    modalInstance = {
      open: jasmine.createSpy('modalInstance.open').and.callFake(function () {
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

    //mock for listHelper service
    listHelper = {
      findItemByFieldValueIgnoreCase: jasmine
        .createSpy('listHelper.findItemByFieldValueIgnoreCase')
        .and.returnValue(1),
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    // mock localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    // serviceButton service mock
    serviceButtonsServiceMock = {
      update: jasmine.createSpy().and.returnValue(''),
      save: jasmine.createSpy().and.returnValue(''),
    };

    ctrl = $controller('ServiceButtonsCrudController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      ModalFactory: modalFactory,
      ServiceButtons: serviceButtons,
      ListHelper: listHelper,
      ServiceButton: serviceButton,
      ServiceButtonsService: serviceButtonsServiceMock,
      toastrFactory: toastrFactory,
      localize: localize,
    });
    scope.frmServiceButtonCrud = {
      inpDescription: { $error: { required: false, duplicate: false } },
    };
    scope.requiredFieldError = true;
  }));

  //controller object should exists
  it('should exist', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  //toastrFactory
  it('should check that toastrFactory is not null', function () {
    expect(toastrFactory).not.toBe(null);
  });

  it('should check that toastrFactory is not undefined', function () {
    expect(toastrFactory).not.toBeUndefined();
  });

  describe('validateForm function -> ', function () {
    it('should set $scope.formIsValid to false if there is an error', function () {
      scope.frmServiceButtonCrud.inpDescription.$error.required = true;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
      scope.frmServiceButtonCrud.inpDescription.$error.required = false;
      scope.frmServiceButtonCrud.inpDescription.$error.duplicate = true;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set $scope.formIsValid to true if there is are no errors', function () {
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(true);
    });
  });

  describe('frmServiceButtonCrud.inpDescription.$error.required watch -> ', function () {
    it('should set $scope.requiredFieldError flag to true if there is an error', function () {
      scope.frmServiceButtonCrud.inpDescription.$error.required = true;
      scope.$apply();
      expect(scope.requiredFieldError).toBe(true);
    });

    it('should set $scope.requiredFieldError flag to false if there is no error', function () {
      scope.frmServiceButtonCrud.inpDescription.$error.required = false;
      scope.$apply();
      expect(scope.requiredFieldError).toBe(false);
    });
  });

  describe('serviceButton.Description watch -> ', function () {
    beforeEach(function () {
      scope.serviceButton = {
        ServiceButtonId: 1,
        Description: 'Description one',
      };
    });

    it('should set $scope.frmServiceButtonCrud.inpDescription.$error.duplicate to true if we find a duplicate', function () {
      scope.serviceButton.Description = 'Description one';
      scope.$apply();
      expect(scope.frmServiceButtonCrud.inpDescription.$error.duplicate).toBe(
        true
      );
    });
  });

  describe('serviceButton.Description watch -> ', function () {
    beforeEach(function () {
      scope.serviceButton = {
        ServiceButtonId: 1,
        Description: 'Description one',
      };
      ctrl.originalServiceButton = angular.copy(scope.serviceButton);
    });

    it('should set $scope.frmServiceButtonCrud.inpDescription.$error.duplicate to true if we find a duplicate', function () {
      expect(scope.serviceButton.ServiceButtonId).toEqual(
        ctrl.originalServiceButton.ServiceButtonId
      );
      expect(scope.frmServiceButtonCrud.inpDescription.$error.duplicate).toBe(
        false
      );
    });
  });

  describe('serviceButton.Description watch -> ', function () {
    beforeEach(function () {
      scope.serviceButton = null;
    });

    it('should set $scope.frmServiceButtonCrud.inpDescription.$error.duplicate to false if we dont find a duplicate', function () {
      scope.$apply();
      expect(scope.frmServiceButtonCrud.inpDescription.$error.duplicate).toBe(
        false
      );
    });
  });

  describe('save function -> ', function () {
    it('should validate form', function () {
      spyOn(ctrl, 'validateForm');
      scope.save();
      expect(ctrl.validateForm).toHaveBeenCalled();
    });

    it('should not call either api if form is invalid', function () {
      scope.frmServiceButtonCrud.inpDescription.$error.required = true;
      scope.frmServiceButtonCrud.inpDescription.$error.duplicate = true;
      scope.save();
      expect(scope.formIsValid).toBe(false);
      expect(serviceButtonsServiceMock.update).not.toHaveBeenCalled();
      expect(serviceButtonsServiceMock.save).not.toHaveBeenCalled();
    });

    it('should call update if we are in edit mode and form is valid', function () {
      scope.frmServiceButtonCrud.inpDescription.$error.required = false;
      scope.frmServiceButtonCrud.inpDescription.$error.duplicate = false;
      scope.save();
      expect(scope.formIsValid).toBe(true);
      expect(serviceButtonsServiceMock.update).toHaveBeenCalled();
    });

    it('should call save if we are not in edit mode and form is valid', function () {
      scope.editMode = false;
      scope.frmServiceButtonCrud.inpDescription.$error.required = false;
      scope.frmServiceButtonCrud.inpDescription.$error.duplicate = false;
      scope.save();
      expect(scope.formIsValid).toBe(true);
      expect(serviceButtonsServiceMock.save).toHaveBeenCalled();
    });
  });

  describe('serviceButtonAddUpdateSuccess & serviceButtonsSaveSuccess function -> ', function () {
    it('should call ctrl.serviceButtonAddUpdateSuccess', function () {
      spyOn(ctrl, 'serviceButtonAddUpdateSuccess');
      ctrl.serviceButtonsUpdateSuccess();
      expect(ctrl.serviceButtonAddUpdateSuccess).toHaveBeenCalled();
    });

    it('should call ctrl.serviceButtonAddUpdateSuccess', function () {
      spyOn(ctrl, 'serviceButtonAddUpdateSuccess');
      ctrl.serviceButtonsSaveSuccess();
      expect(ctrl.serviceButtonAddUpdateSuccess).toHaveBeenCalled();
    });
  });

  describe('serviceButtonsUpdateFailure & serviceButtonsSaveFailure function -> ', function () {
    it('should call ctrl.serviceButtonAddUpdateFailure', function () {
      spyOn(ctrl, 'serviceButtonAddUpdateFailure');
      ctrl.serviceButtonsUpdateFailure();
      expect(ctrl.serviceButtonAddUpdateFailure).toHaveBeenCalled();
    });

    it('should call ctrl.serviceButtonAddUpdateFailure', function () {
      spyOn(ctrl, 'serviceButtonAddUpdateFailure');
      ctrl.serviceButtonsSaveFailure();
      expect(ctrl.serviceButtonAddUpdateFailure).toHaveBeenCalled();
    });
  });

  describe('serviceButtonAddUpdateSuccess function -> ', function () {
    it('should call toastr success', function () {
      ctrl.serviceButtonAddUpdateSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
    });

    it('should set currently saving flag to false', function () {
      ctrl.serviceButtonAddUpdateSuccess();
      expect(scope.currentlySaving).toBe(false);
    });

    it('should close modal', function () {
      ctrl.serviceButtonAddUpdateSuccess();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });

  describe('conditionAddUpdateFailure function -> ', function () {
    it('should call toastr failure', function () {
      ctrl.serviceButtonAddUpdateFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should set currently saving flag to false', function () {
      ctrl.serviceButtonAddUpdateFailure();
      expect(scope.currentlySaving).toBe(false);
    });
  });

  describe('cancel function -> ', function () {
    beforeEach(function () {
      scope.serviceButton = {
        ServiceButtonId: 1,
        Description: 'Description one',
      };
      ctrl.originalServiceButton = angular.copy(scope.serviceButton);
    });

    it('should close modal if there are no changes', function () {
      scope.cancel();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should call modalInstance close if the serviceButton and originalServiceButton are equal', function () {
      scope.cancel();
      expect(scope.serviceButton).toEqual(ctrl.originalServiceButton);
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should call modalInstance close if the serviceButton and originalServiceButton are not equal', function () {
      ctrl.originalServiceButton.Description = 'Description Two';
      scope.$apply();
      scope.cancel();
      expect(scope.serviceButton).not.toEqual(ctrl.originalServiceButton);
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  describe('confirmCancel function -> ', function () {
    it('should close modal', function () {
      ctrl.confirmCancel();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });
});
