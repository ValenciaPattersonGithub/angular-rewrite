describe('MedicalHistoryCrudController ->', function () {
  var toastrFactory, $uibModal, scope, ctrl, element, compile;
  var modalInstance, modalFactory, modalFactoryDeferred, q;
  var medicalHistoryFactory;

  var mockMedicalHistoryFormCurrent = {
    FormId: '222',
    FormSections: [
      { FormSectionItems: [{ FormBankItemDemographic: { FirstName: '' } }] },
    ],
  };
  var mockMedicalHistoryFormNew = {
    FormId: null,
    FormSections: [
      { FormSectionItems: [{ FormBankItemDemographic: { FirstName: '' } }] },
    ],
  };
  var mockPatientInfo = { PatientId: 1123 };

  //#region init tests

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      medicalHistoryFactory = {
        create: jasmine.createSpy().and.returnValue({}),
        getSummariesByPatientId: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        update: jasmine.createSpy().and.returnValue({}),
        loadMedicalHistoryForm: jasmine.createSpy().and.returnValue({}),
        SetUpdatingForm: jasmine.createSpy().and.returnValue({}),
        SetViewingForm: jasmine.createSpy().and.returnValue({}),
        SetLoadingForm: jasmine.createSpy().and.returnValue({}),
        SetNewMedicalHistoryForm: jasmine.createSpy().and.returnValue({}),
        SetActiveMedicalHistoryForm: jasmine.createSpy().and.returnValue({}),
        SetDataChanged: jasmine.createSpy().and.returnValue({}),
        SetYesNoToNo: jasmine.createSpy().and.returnValue({}),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        access: jasmine.createSpy().and.returnValue({ View: true }),
      };
      $provide.value('MedicalHistoryFactory', medicalHistoryFactory);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  // create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $route,
    $routeParams,
    $compile,
    $timeout,
    $location,
    _$uibModal_,
    $q
  ) {
    q = $q;
    compile = $compile;

    $uibModal = _$uibModal_;
    spyOn($uibModal, 'open').and.callThrough();

    modalInstance = {
      close: jasmine.createSpy('modalInstance.close').and.returnValue({}),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    //mock for modalFactory
    modalFactory = {
      ConfirmLockModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
      DeleteModal: jasmine
        .createSpy('modalFactory.DeleteModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
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
    };
    scope = $rootScope.$new();

    ctrl = $controller('MedicalHistoryCrudController', {
      $scope: scope,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      MedicalHistoryFactory: medicalHistoryFactory,
    });

    scope.onSave = jasmine.createSpy('onSave');
    scope.onCancel = jasmine.createSpy('onCancel');
    scope.patientInfo = mockPatientInfo;
    scope.viewSettings = {};
  }));

  var loadHtml = function () {
    element = angular.element(
      '<div ng-form="frmMedicalHistory" >' +
        '<div ng-class="{error:hasErrors && !frmPersonalInfoMock.inpFirstName.$valid}">' +
        '   <input id="inpFirstName" class="form-input required valid" set-focus ng-model="person.Profile.FirstName" name="inpFirstName" maxlength="64" required alpha-only />' +
        '</div></div>'
    );

    // use compile to render the html
    compile(element)(scope);
    scope = element.isolateScope() || element.scope();
    scope.$digest();
  };

  //#endregion

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });
  });
  describe('setViewOrUpdate', function () {
    it('should set inputIsDisabled to true if ViewingForm is true', function () {
      medicalHistoryFactory.ViewingForm = true;
      ctrl.setViewOrUpdate();
      expect(scope.inputIsDisabled).toBe(true);
    });

    it('should set inputIsDisabled to false if UpdatingForm is true', function () {
      medicalHistoryFactory.UpdatingForm = true;
      ctrl.setViewOrUpdate();
      expect(scope.inputIsDisabled).toBe(false);
    });
  });

  describe('setFormViewState', function () {
    it('should get current medical history form if ViewingForm is true', function () {
      medicalHistoryFactory.ViewingForm = true;
      medicalHistoryFactory.NewMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormNew
      );
      medicalHistoryFactory.ActiveMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormCurrent
      );
      ctrl.setFormViewState();
      expect(scope.medicalHistoryForm.FormId).toEqual(
        mockMedicalHistoryFormCurrent.FormId
      );
    });

    it('should get new medical history form if UpdatingForm is true if there is not an active medical history form', function () {
      medicalHistoryFactory.UpdatingForm = true;
      medicalHistoryFactory.NewMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormNew
      );
      medicalHistoryFactory.ActiveMedicalHistoryForm = null;
      ctrl.setFormViewState();
      expect(scope.medicalHistoryForm.FormId).toEqual(
        mockMedicalHistoryFormNew.FormId
      );
    });

    it('should get the active medical history form if UpdatingForm is true and if there is an active medical history form', function () {
      medicalHistoryFactory.UpdatingForm = true;
      medicalHistoryFactory.NewMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormNew
      );
      medicalHistoryFactory.ActiveMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormCurrent
      );
      ctrl.setFormViewState();
      expect(scope.medicalHistoryForm.FormId).toEqual(
        mockMedicalHistoryFormCurrent.FormId
      );
    });

    it('should call ctrl.setAllocationId if UpdatingForm is true and if there is an active medical history form', function () {
      medicalHistoryFactory.UpdatingForm = true;
      medicalHistoryFactory.NewMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormNew
      );
      medicalHistoryFactory.ActiveMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormCurrent
      );
      ctrl.setFormViewState();
      expect(scope.medicalHistoryForm.FileAllocationId).toBe(null);
    });
  });

  describe('close', function () {
    it('should call confirmCancel if dataHasChanged equals true and user is UpdatingForm', function () {
      spyOn(ctrl, 'confirmCancel');
      scope.dataHasChanged = true;
      medicalHistoryFactory.UpdatingForm = true;
      scope.close();
      expect(ctrl.confirmCancel).toHaveBeenCalled();
    });

    it('should call closeForm if dataHasChanged equals false', function () {
      spyOn(ctrl, 'closeForm');
      scope.dataHasChanged = false;
      scope.close();
      expect(ctrl.closeForm).toHaveBeenCalled();
    });
  });

  describe('watch medicalHistoryFactory.DataChanged -> ', function () {
    beforeEach(inject(function () {
      medicalHistoryFactory.DataChanged = false;
      medicalHistoryFactory.ActiveMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormCurrent
      );
      scope.$apply();
    }));

    it('should fire emit when changes', function () {
      spyOn(scope, '$emit');
      medicalHistoryFactory.DataChanged = true;
      scope.$apply();
      expect(scope.$emit).toHaveBeenCalledWith('medical-history-changed', true);

      medicalHistoryFactory.DataChanged = false;
      scope.$apply();
      expect(scope.$emit).toHaveBeenCalledWith(
        'medical-history-changed',
        false
      );
    });
  });

  describe('validateForm', function () {
    it('should return hasErrors equals true based on valid equals false state of form', function () {
      medicalHistoryFactory.NewMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormNew
      );
      medicalHistoryFactory.ActiveMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormCurrent
      );
      scope.hasErrors = false;
      loadHtml();
      scope.frmMedicalHistory.$valid = false;
      scope.validateForm();
      expect(scope.hasErrors).toBe(true);
    });

    it('should return hasErrors equals false based on $valid equals true state of form', function () {
      medicalHistoryFactory.NewMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormNew
      );
      medicalHistoryFactory.ActiveMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormCurrent
      );
      scope.hasErrors = false;
      loadHtml();
      scope.frmMedicalHistory.$valid = true;
      scope.validateForm();
      expect(scope.hasErrors).toBe(false);
    });
  });

  describe('saveMedicalHistory', function () {
    it('should call validateForm and do nothing if form has errors', function () {
      medicalHistoryFactory.NewMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormNew
      );
      medicalHistoryFactory.ActiveMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormCurrent
      );
      loadHtml();
      scope.frmMedicalHistory.$valid = false;
      scope.saveMedicalHistory();
      expect(scope.hasErrors).toBe(true);
      expect(medicalHistoryFactory.update).not.toHaveBeenCalled();
    });

    it('should call medicalHistoryFactory.updateForm if hasErrors equals false', function () {
      medicalHistoryFactory.NewMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormNew
      );
      medicalHistoryFactory.ActiveMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormCurrent
      );
      loadHtml();
      scope.frmMedicalHistory.$valid = true;
      scope.saveMedicalHistory();
      expect(scope.hasErrors).toBe(false);
      //expect(medicalHistoryFactory.update).toHaveBeenCalled();
    });
  });

  describe('watch medicalHistoryForm -> ', function () {
    it('should set dataHasChanged when medicalHistory changes', function () {
      medicalHistoryFactory.NewMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormNew
      );
      medicalHistoryFactory.ActiveMedicalHistoryForm = angular.copy(
        mockMedicalHistoryFormCurrent
      );
      medicalHistoryFactory.DataChanged = false;
      scope.dataHasChanged = false;
      scope.medicalHistoryForm = angular.copy(mockMedicalHistoryFormNew);
      scope.medicalHistoryForm.FormSections[0].FormSectionItems[0].FormBankItemDemographic.FirstName =
        'Jack';
      scope.$apply();
      scope.medicalHistoryForm.FormSections[0].FormSectionItems[0].FormBankItemDemographic.FirstName =
        'Bob';
      scope.$apply();
      expect(medicalHistoryFactory.SetDataChanged).toHaveBeenCalled();
      expect(scope.disableSave).not.toEqual(scope.dataHasChanged);
    });
  });

  describe('noToAll -> ', function () {
    it('should disable the noToAll button', function () {
      scope.disableNoToAll = false;
      scope.noToAll();
      expect(scope.disableNoToAll).toBe(true);
    });

    it('should call SetYesNoToNo', function () {
      scope.noToAll();
      expect(medicalHistoryFactory.SetYesNoToNo).toHaveBeenCalled();
    });
  });
});
