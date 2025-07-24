describe('panel-controller tests ->', function () {
  var scope;
  var ctrl, patientValidationFactory;
  var mockData = {
    Anything: 'Literally Anything',
  };

  beforeEach(module('common.factories'));
  beforeEach(module('common.controllers'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      //#region mocks for factories
      patientValidationFactory = {
        ObservePatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        GetPatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        CheckPatientLocation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        SetPatientProfileData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      let userSettingsDataService = {
        isNewNavigationEnabled: function () {
          return false;
        },
      };

      $provide.value('userSettingsDataService', userSettingsDataService);
    })
  );

  describe('when editData is not set', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller('PanelCtrl', { $scope: scope });
    }));

    it('should exist.', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set some default properties.', function () {
      expect(scope.data.additionalData).toBeNull();
      expect(scope.flags).toEqual({
        autoSave: false,
        editing: false,
        valid: false,
        cancelling: false,
      });
      expect(scope.functions).toEqual({
        save: null,
        afterSuccess: null,
        afterError: null,
        cancel: null,
      });
      expect(scope.saveData).toBeUndefined();
      expect(scope.originalData).toBeUndefined();
      expect(scope.watchSaveData).not.toBeNull();
      expect(scope.clearWatch).not.toBeNull();
    });

    describe('should set specified properties', function () {
      beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        scope.additionalData = angular.copy(mockData);
        scope.autoSave = true;
        scope.editing = true;
        scope.valid = true;
        scope.cancelling = true;
        ctrl = $controller('PanelCtrl', { $scope: scope });
      }));

      it('should set specified properties.', function () {
        scope.$apply();
        expect(scope.flags).toEqual({
          autoSave: true,
          editing: true,
          valid: true,
          cancelling: true,
        });
      });
    });

    describe('and when saveData changes', function () {
      beforeEach(function () {
        spyOn(scope, 'watchSaveData');

        scope.saveData = angular.copy(mockData);

        scope.$apply();
        scope.$digest();
      });

      it('should call watchSaveData.', function () {
        expect(scope.watchSaveData).toHaveBeenCalled();
      });
    });
  });

  describe('when editData is set', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();

      scope.editData = angular.copy(mockData);

      ctrl = $controller('PanelCtrl', { $scope: scope });
    }));

    it('should set some default properties.', function () {
      expect(scope.data.additionalData).toBeNull();
      expect(scope.flags).toEqual({
        autoSave: false,
        editing: false,
        valid: false,
        cancelling: false,
      });
      expect(scope.functions).toEqual({
        save: null,
        afterSuccess: null,
        afterError: null,
        cancel: null,
      });
      expect(scope.data.saveData).toEqual(scope.editData);
      expect(scope.data.originalData).toEqual(scope.editData);
      expect(scope.watchSaveData).toBeNull();
      expect(scope.clearWatch).toBeNull();
    });
  });

  describe('watchSaveData ->', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();
      scope.template = '';
      ctrl = $controller('PanelCtrl', { $scope: scope });
    }));

    beforeEach(function () {
      spyOn(scope, 'clearWatch');
    });

    it('when new value is defined and the old value is not defined, should call clearWatch.', function () {
      scope.watchSaveData(angular.copy(mockData));

      expect(scope.clearWatch).toHaveBeenCalled();
    });

    it('when template check is matched, should not call clearWatch.', function () {
      scope.template = 'patient-account-discounts.html';
      scope.watchSaveData(angular.copy(mockData));

      expect(scope.clearWatch).not.toHaveBeenCalled();
    });

    it('when template check is matched, new value has properties, should call clearWatch.', function () {
      scope.template = 'patient-account-discounts.html';
      var data = angular.copy(mockData);
      data.MasterDiscountTypeId = 'masterDiscountId';
      data.PatientDiscountTypeId = 'patientDiscountId';
      scope.watchSaveData(data);

      expect(scope.clearWatch).toHaveBeenCalled();
    });

    it('when new value is defined and the old value is null, should NOT call clearWatch.', function () {
      scope.watchSaveData(angular.copy(mockData), null);

      expect(scope.clearWatch).not.toHaveBeenCalled();
    });

    it('when new value is defined and the old value is set, should NOT call clearWatch.', function () {
      scope.watchSaveData(angular.copy(mockData), '1');

      expect(scope.clearWatch).not.toHaveBeenCalled();
    });
  });

  describe('activateEdit ->', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();

      scope.editData = angular.copy(mockData);

      ctrl = $controller('PanelCtrl', { $scope: scope });
    }));

    it('should set some properties.', function () {
      scope.activateEdit();

      expect(scope.flags.editing).toEqual(true);
      expect(scope.valid).toEqual(false);
    });
  });

  describe('cancelPanelEdit ->', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();

      scope.editData = angular.copy(mockData);

      ctrl = $controller('PanelCtrl', { $scope: scope });
    }));

    describe('when saveData equals originalData ->', function () {
      it('should set editing to false and not change cancelling', function () {
        scope.flags.editing = true;
        scope.flags.cancelling = false;

        scope.cancelPanelEdit();

        expect(scope.flags.editing).toEqual(false);
        expect(scope.flags.cancelling).toEqual(false);
      });
    });

    describe('when saveData does not equal originalData ->', function () {
      it('should set cancelling to true and not change editing', function () {
        scope.flags.editing = true;
        scope.flags.cancelling = false;

        scope.data.saveData = {
          DifferentProperty: "I'm a different object entirely",
        };

        scope.cancelPanelEdit();

        expect(scope.flags.editing).toEqual(true);
        expect(scope.flags.cancelling).toEqual(true);
      });
    });

    describe('when change confirm required is true ->', function () {
      it('should set cancelling and editing to false', function () {
        scope.flags.editing = true;
        scope.flags.cancelling = true;
        scope.changeConfirmRequired = true;

        scope.cancelPanelEdit();

        expect(scope.flags.editing).toEqual(false);
        expect(scope.flags.cancelling).toEqual(false);
      });
    });
  });

  describe('declineCancel ->', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();

      ctrl = $controller('PanelCtrl', { $scope: scope });
    }));

    it('should set cancelling to false.', function () {
      scope.flags.cancelling = true;

      scope.declineCancel();

      expect(scope.flags.cancelling).toEqual(false);
    });
  });

  describe('confirmCancel ->', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();
      scope.data = angular.copy(mockData);
      scope.data.saveData = angular.copy(mockData);
      scope.data.originalData = angular.copy(mockData);
      ctrl = $controller('PanelCtrl', { $scope: scope });
    }));

    it('should set cancelling and editing to false when changeConfirmRequired is false.', function () {
      scope.flags.cancelling = true;
      scope.flags.editing = true;
      scope.changeConfirmRequired = false;

      scope.confirmCancel();

      expect(scope.flags.cancelling).toEqual(false);
      expect(scope.flags.editing).toEqual(false);
    });
  });

  describe('savePanelEdit ->', function () {
    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();

      scope.editData = angular.copy(mockData);

      ctrl = $controller('PanelCtrl', { $scope: scope });

      spyOn(scope.functions, 'save');

      scope.functions.save = jasmine.createSpy();
    }));

    it('should call functions.save with saveData, saveSuccessful, and saveFailed as paramters.', function () {
      scope.savePanelEdit();

      expect(scope.functions.save).toHaveBeenCalledWith(
        scope.data.saveData,
        scope.saveSuccessful,
        scope.saveFailed
      );
    });
  });

  describe('saveSuccessful ->', function () {
    var mockResult;

    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();

      scope.editData = angular.copy(mockData);

      ctrl = $controller('PanelCtrl', { $scope: scope });

      mockResult = {
        Value: {
          Anything: 'Anything has changed.',
        },
      };
    }));

    describe('when functions.afterSuccess is defined,', function () {
      beforeEach(function () {
        spyOn(scope.functions, 'afterSuccess');

        scope.functions.afterSuccess = jasmine.createSpy();

        scope.saveSuccessful(angular.copy(mockResult));
      });

      it('should call functions.afterSuccess with the result object.', function () {
        expect(scope.functions.afterSuccess).toHaveBeenCalledWith(
          angular.copy(mockResult)
        );
      });

      it('should set the saveData and originalData objects to the Value property of the result object.', function () {
        expect(scope.data.saveData).toEqual(mockResult.Value);
        expect(scope.data.originalData).toEqual(mockResult.Value);
      });

      it('should NOT set the saveData and orginalData to the same instance.', function () {
        expect(scope.data.saveData).not.toBe(scope.data.originalData);
      });

      it('should set some properties.', function () {
        expect(scope.flags.editing).toEqual(false);
      });
    });

    // These tests are the same as the ones above; however, this ensures that no exception has occurred preventing completion.
    describe('when functions.afterSuccess is NOT defined', function () {
      beforeEach(function () {
        scope.saveSuccessful(angular.copy(mockResult));
      });

      it('should set the saveData and originalData objects to the Value property of the result object.', function () {
        // I am comparing these against a copy of the object so that they instance comparisons would fail.
        expect(scope.data.saveData).toEqual(angular.copy(mockResult.Value));
        expect(scope.data.originalData).toEqual(angular.copy(mockResult.Value));
      });

      it('should NOT set the saveData and orginalData to the same instance.', function () {
        // This ensures that the objects are not set to the same instance. I am deliberately doing and instance comparison.
        expect(scope.data.saveData).not.toBe(scope.data.originalData);
      });

      it('should set some properties.', function () {
        expect(scope.flags.editing).toEqual(false);
      });
    });
  });

  describe('saveFailed ->', function () {
    var mockError = {
      Message: 'I just wanted to say the word superfluous.',
    };

    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();

      scope.editData = angular.copy(mockData);

      ctrl = $controller('PanelCtrl', { $scope: scope });
    }));

    describe('when functions.saveFailed is defined,', function () {
      beforeEach(function () {
        spyOn(scope.functions, 'afterError');

        scope.functions.afterError = jasmine.createSpy();

        scope.saveFailed(angular.copy(mockError));
      });

      it('should call functions.afterError with the error object.', function () {
        expect(scope.functions.afterError).toHaveBeenCalledWith(
          angular.copy(mockError)
        );
      });
    });

    describe('when defaultExpanded is changed,', function () {
      beforeEach(function () {
        scope.openEditPersonalModal = jasmine.createSpy();
      });

      it('should call openEditPersonalModal function when defaultExpanded is set true on scope', function () {
        scope.defaultExpanded = false;
        scope.$apply();
        scope.defaultExpanded = true;
        scope.$apply();

        expect(scope.openEditPersonalModal).toHaveBeenCalled();
      });
    });

    // Test activateEdit function is called or not called when defaultExpanded is set to true or false respectively
    describe('setDefaultExpanded ->', function () {
      it('should call activateEdit function when defaultExpanded is true', function () {
        scope.defaultExpanded = true;
        spyOn(scope, 'activateEdit');
        ctrl.setDefaultExpanded();
        expect(scope.activateEdit).toHaveBeenCalled();
      });

      it('should not call activateEdit function when defaultExpanded is undefined', function () {
        scope.defaultExpanded = false;
        spyOn(scope, 'activateEdit');
        ctrl.setDefaultExpanded();
        expect(scope.activateEdit).not.toHaveBeenCalled();
      });
    });
  });
});
