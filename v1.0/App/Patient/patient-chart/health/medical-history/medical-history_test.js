import { of } from "rxjs";

describe('MedicalHistoryController ->', function () {
  var routeParams,
    toastrFactory,
    $uibModal,
    timeout,
    scope,
    $httpBackend,
    ctrl,
    element,
    compile;
  var patientServices;
  var modalInstance, modalFactory, modalFactoryDeferred, q;
  var medicalHistoryFactory;

  var mockMedicalHistoryResponse = {
    Value: {},
  };
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
  var patientInfo = { PatientId: '123456' };

  //#region init tests

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      var mockModalFactory = {
        CancelModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };

      medicalHistoryFactory = {
        create: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(mockMedicalHistoryFormNew),
        }),
        update: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
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

      const featureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
      featureFlagService.getOnce$.and.returnValue(of(false));
      $provide.value('FeatureFlagService', featureFlagService);
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
    timeout = $timeout;
    compile = $compile;
    routeParams = $routeParams;

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
    scope.patientInfo = patientInfo;

    ctrl = $controller('MedicalHistoryController', {
      $scope: scope,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      MedicalHistoryFactory: medicalHistoryFactory,
    });

    scope.onSave = jasmine.createSpy('onSave');
    scope.onCancel = jasmine.createSpy('onCancel');
  }));

  //#endregion

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('getNewMedicalHistoryForm', function () {
    it('should get new medical history form', function () {
      scope.getNewMedicalHistoryForm();
      expect(medicalHistoryFactory.create).toHaveBeenCalled();
      expect(scope.loadingNewMedicalHistoryForm).toBe(true);
    });
  });

  describe('getMedicalHistoryForm', function () {
    it('should call medicalHistoryFactory.getById with patient id', function () {
      scope.getMedicalHistoryForm();
      expect(medicalHistoryFactory.getById).toHaveBeenCalledWith(
        patientInfo.PatientId
      );
      expect(scope.loadingMedicalHistoryForm).toBe(true);
    });
  });

  describe('updateMedicalHistory', function () {
    it('should expand view for updating a new form if canUpdateForm is true', function () {
      scope.loadingMedicalHistoryForm = false;
      scope.canUpdateForm = true;
      scope.viewSettings = { expandView: false, activeExpand: 0 };

      scope.updateMedicalHistory();

      expect(scope.viewSettings.expandView).toBe(true);
      expect(scope.viewSettings.activeExpand).toBe(5);

      expect(medicalHistoryFactory.SetUpdatingForm).toHaveBeenCalledWith(true);
      expect(medicalHistoryFactory.SetViewingForm).toHaveBeenCalledWith(false);
    });

    it('should do nothing if canUpdateForm is false', function () {
      scope.loadingMedicalHistoryForm = false;
      scope.canUpdateForm = false;
      scope.viewSettings = { expandView: false, activeExpand: 0 };

      scope.updateMedicalHistory();

      expect(scope.viewSettings.expandView).toBe(false);
      expect(scope.viewSettings.activeExpand).toBe(0);
      expect(scope.loadingMedicalHistoryForm).toBe(false);
      expect(medicalHistoryFactory.SetUpdatingForm).not.toHaveBeenCalled();
      expect(medicalHistoryFactory.SetViewingForm).not.toHaveBeenCalled();
    });
  });

  describe('viewMedicalHistory', function () {
    it('should expand view for updating a new form if canViewForm is true', function () {
      scope.loadingMedicalHistoryForm = false;
      scope.canViewForm = true;
      scope.viewSettings = { expandView: false, activeExpand: 0 };

      scope.viewMedicalHistory();

      expect(scope.viewSettings.expandView).toBe(true);
      expect(scope.viewSettings.activeExpand).toBe(5);
      expect(scope.loadingMedicalHistoryForm).toBe(true);

      expect(medicalHistoryFactory.SetUpdatingForm).toHaveBeenCalledWith(false);
      expect(medicalHistoryFactory.SetViewingForm).toHaveBeenCalledWith(true);
    });

    it('should do nothing if canViewForm is false', function () {
      scope.loadingMedicalHistoryForm = false;
      scope.canViewForm = false;
      scope.viewSettings = { expandView: false, activeExpand: 0 };

      scope.viewMedicalHistory();

      expect(scope.viewSettings.expandView).toBe(false);
      expect(scope.viewSettings.activeExpand).toBe(0);
      expect(scope.loadingMedicalHistoryForm).toBe(false);
      expect(medicalHistoryFactory.SetUpdatingForm).not.toHaveBeenCalled();
      expect(medicalHistoryFactory.SetViewingForm).not.toHaveBeenCalled();
    });
  });

  describe('disableForm', function () {
    it('should expand form if called with true', function () {
      scope.expandForm = false;
      scope.disableForm(true);
      expect(scope.expandForm).toBe(true);
    });
  });

  describe('watch medicalHistoryFactory.ViewingForm -> ', function () {
    beforeEach(inject(function () {
      medicalHistoryFactory.ViewingForm = false;
      scope.$apply();
    }));

    it('should call disableForm when changes', function () {
      spyOn(scope, 'disableForm');
      medicalHistoryFactory.ViewingForm = true;
      scope.$apply();
      expect(scope.disableForm).toHaveBeenCalledWith(true);
    });
  });

  describe('watch medicalHistoryFactory.UpdatingForm -> ', function () {
    beforeEach(inject(function () {
      medicalHistoryFactory.UpdatingForm = false;
      scope.$apply();
    }));

    it('should call disableForm when changes', function () {
      spyOn(scope, 'disableForm');
      medicalHistoryFactory.UpdatingForm = true;
      scope.$apply();
      expect(scope.disableForm).toHaveBeenCalledWith(true);
    });
  });
});
