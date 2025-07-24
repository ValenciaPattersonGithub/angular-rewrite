describe('PatientWatchCrudController ->', function () {
  var routeParams,
    toastrFactory,
    $uibModal,
    timeout,
    scope,
    $httpBackend,
    ctrl,
    element,
    compile;
  var patientServices,
    modalInstance,
    modalFactory,
    modalFactoryDeferred,
    q,
    listHelper;

  //#region mocks
  var personIdMock = 'b3eb6f7f-7b4a-4be5-b8ac-d24cccdd42b9';
  var providersMockResponse = {
    Value: [
      {
        UserId: 10,
        FirstName: 'Sean',
        LastName: 'Connery',
        IsActive: false,
        ProviderTypeId: 1,
      },
      {
        UserId: 11,
        FirstName: 'Ilya',
        LastName: 'Kuryakin',
        IsActive: true,
        ProviderTypeId: 2,
      },
      {
        UserId: 12,
        FirstName: 'Sean',
        LastName: 'Connery',
        IsActive: true,
        ProviderTypeId: 4,
      },
    ],
  };

  var providersMock = providersMockResponse.Value;

  var mockTooth = '77';

  var newPatientWatchMock = {
    PatientId: personIdMock,
    WatchId: null,
    ProviderId: null,
    Date: new Date(),
    ToothNumber: mockTooth,
    Surface: null,
    Root: null,
    Notes: null,
  };

  var newPatientWatchIdMock = '123456789eee';

  var createdPatientWatchMock = {
    WatchId: newPatientWatchIdMock,
    PatientId: personIdMock,
    ProviderId: providersMock[0],
    Date: new Date(),
    ToothNumber: mockTooth,
    Surface: null,
    Root: null,
    Notes: null,
  };

  var patientWatchesMock = [
    {
      RecordId: '123456789fff',
      PatientId: personIdMock,
      ProviderId: providersMock[0],
      Date: new Date(),
      Tooth: '15',
      Surface: null,
      Root: null,
      Notes: null,
    },
    {
      RecordId: '123456789ggg',
      PatientId: personIdMock,
      ProviderId: providersMock[1],
      Date: new Date(),
      Tooth: '16',
      Surface: null,
      Root: null,
      Notes: null,
    },
  ];

  var patientWatchesMockResponse = {
    Value: patientWatchesMock,
  };

  var createdPatientWatchMockResponse = {
    Value: createdPatientWatchMock,
  };

  //#endregion

  //#region spies for services...

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  // create spies for services

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServices = {
        PatientWatch: {
          get: jasmine.createSpy().and.returnValue(patientWatchesMockResponse),
          save: jasmine
            .createSpy()
            .and.returnValue(createdPatientWatchMockResponse),
        },
      };
      $provide.value('PatientServices', patientServices);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      //listHelper service
      listHelper = {
        findItemByFieldValueIgnoreCase: jasmine
          .createSpy('listHelper.findItemByFieldValueIgnoreCase')
          .and.returnValue(patientWatchesMock[0]),
      };
    })
  );

  //#endregion

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
      close: jasmine
        .createSpy('modalInstance.close')
        .and.returnValue(createdPatientWatchMock),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    //mock for modalFactory
    modalFactory = {
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

    scope.chartLedgerServices = [];

    ctrl = $controller('PatientWatchCrudController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
      personId: personIdMock,
      tooth: mockTooth,
      providers: providersMock,
      patientWatches: patientWatchesMock,
      patientWatchId: null,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      PatientServices: patientServices,
      viewOnly: true,
      ListHelper: listHelper,
    });
  }));

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set patientWatch to new object if injected patientWatchId is null', function () {
      scope.patientWatchId = null;
      var newPatientWatch = angular.copy(newPatientWatchMock);
      scope.$digest();
      expect(scope.patientWatch.WatchId).toEqual(newPatientWatch.WatchId);
    });

    it('should set scope properties', function () {
      expect(scope.editMode).toBe(false);
      expect(scope.savingForm).toBe(false);
      expect(scope.canCloseModal).toBe(true);
      expect(scope.maxDate).toEqual(
        moment(new Date(2115, 12, 31, 23, 59, 59, 999))
      );
      expect(scope.formIsValid).toBe(false);
      expect(scope.hasErrors).toBe(false);
      expect(scope.personId).toEqual(personIdMock);
      expect(scope.selectedTooth).toEqual(mockTooth);
      expect(scope.patientWatchId).toEqual(null);
      expect(scope.viewOnly).toBe(true);
      expect(scope.patientWatches).toEqual(patientWatchesMock);
      expect(scope.editableDate).toBe(false);
    });
  });

  describe('providers $filter -> ', function () {
    it('should filter providers to providers with provider type of 1 or 2', function () {
      expect(providersMock.length).toBe(3);
      expect(providersMock[0].ProviderTypeId).toEqual(1);
      expect(providersMock[1].ProviderTypeId).toEqual(2);
      expect(providersMock[2].ProviderTypeId).toEqual(4);
      expect(scope.providers.length).toBe(2);
    });
  });

  describe('setSelectedTooth -> ', function () {
    it('should set selectedTooth to tooth if injected tooth is not null', function () {
      scope.setSelectedTooth();
      expect(scope.selectedTooth).toEqual(mockTooth);
    });
  });

  describe('patientWatchToothId -> ', function () {
    it('should set patientWatchTooth to newpatientWatchTooth if injected patientWatchToothId is null', function () {
      scope.patientWatchToothId = null;
      expect(scope.patientWatch.WatchId).toBe(null);
    });
  });

  describe('savePatientWatchTooth -> ', function () {
    it('should validate form', function () {
      spyOn(ctrl, 'validateForm');
      scope.savePatientWatch();
      expect(ctrl.validateForm).toHaveBeenCalled();
    });

    it('should call service if formIsValid', function () {
      spyOn(ctrl, 'validateForm').and.callFake(function () {});
      scope.formIsValid = true;
      scope.savePatientWatch();
      expect(scope.savingForm).toBe(true);
      expect(patientServices.PatientWatch.save).toHaveBeenCalled();
    });
  });

  describe('savePatientWatchSuccess -> ', function () {
    it('should set patientWatchTooth to res', function () {
      ctrl.savePatientWatchSuccess(createdPatientWatchMock);
      expect(scope.patientWatch).toEqual(createdPatientWatchMock.Value);
      expect(scope.savingForm).toBe(false);
      expect(scope.canCloseModal).toBe(true);
      expect(toastrFactory.success).toHaveBeenCalled();
    });

    it('should call toastrFactory and display success', function () {
      ctrl.savePatientWatchSuccess(createdPatientWatchMock);
      expect(scope.patientWatch).toEqual(createdPatientWatchMock.Value);
      expect(toastrFactory.success).toHaveBeenCalled();
    });

    it('should call close modal', function () {
      spyOn(scope, 'closeModal');
      ctrl.savePatientWatchSuccess(createdPatientWatchMock);
      expect(scope.closeModal).toHaveBeenCalled();
    });
  });

  describe('createPatientWatchFailed -> ', function () {
    it('should call toastrFactory error', function () {
      ctrl.savePatientWatchFailed();
      expect(scope.savingForm).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('validateForm -> ', function () {
    it('should set formIsValid to false if patientWatch.ToothNumber is null', function () {
      scope.patientWatch = angular.copy(newPatientWatchMock);
      scope.patientWatch.ToothNumber = null;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);

      scope.patientWatch.ProviderId = providersMock[0];
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set formIsValid to true if patientWatch.ToothNumber is not watched', function () {
      scope.patientWatch = angular.copy(createdPatientWatchMock);
      scope.duplicateWatch = false;
      scope.patientWatch.ToothNumber = '8';
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(true);
    });

    it('should set formIsValid to false if patientWatch.ToothNumber is already watched', function () {
      scope.duplicateWatch = false;
      scope.patientWatches = angular.copy(patientWatchesMock);
      scope.patientWatch.ToothNumber = scope.patientWatches[0].Tooth;
      ctrl.CheckTooth();
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });
  });

  describe('watch patientWatch -> ', function () {
    it('should call validateForm', function () {
      spyOn(ctrl, 'CheckTooth');
      scope.patientWatch = angular.copy(newPatientWatchMock);
      scope.$apply();
      scope.patientWatch.ToothNumber = '8';
      scope.$apply();
      expect(ctrl.CheckTooth).toHaveBeenCalled();
    });

    it('should call validateForm', function () {
      spyOn(ctrl, 'validateForm');
      scope.patientWatch = angular.copy(newPatientWatchMock);
      scope.$apply();
      scope.patientWatch.ToothNumber = '8';
      scope.$apply();
      expect(ctrl.validateForm).toHaveBeenCalled();
    });

    it('should set canCloseModal to false if canCloseModal is true', function () {
      scope.canCloseModal = true;
      scope.patientWatchTooth = angular.copy(newPatientWatchMock);
      scope.$apply();
      expect(scope.canCloseModal).toBe(true);
      // modify the object
      scope.patientWatch.ToothNumber = '8';
      scope.$apply();
      expect(scope.canCloseModal).toBe(false);
    });
  });

  describe('closeModal ->', function () {
    it('should call modalInstance.close with patientWatchTooth', function () {
      scope.closeModal();
      expect(modalInstance.close).toHaveBeenCalledWith(scope.patientWatch);
    });
  });

  describe('closeAddPatientWatchTooth ->', function () {
    it('should call modalInstance.close with patientWatchTooth', function () {
      scope.closeModal();
      expect(modalInstance.close).toHaveBeenCalledWith(scope.patientWatch);
    });
  });

  describe('showCancelModal function ->', function () {
    it('should open modal object with CancelModal parameters', function () {
      scope.showCancelModal();
      expect(modalInstance.close).not.toHaveBeenCalled();
    });
  });

  describe('confirmCancel function ->', function () {
    it('should call modalInstance close', function () {
      scope.confirmCancel();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });

  describe('cancelChanges function ->', function () {
    it('should call modalInstance close if canCloseModal is true', function () {
      scope.canCloseModal = true;
      scope.cancelChanges();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should call modalInstance close if viewOnly is true', function () {
      scope.viewOnly = true;
      scope.cancelChanges();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should call modalFactory.CancelModal if canCloseModal is false', function () {
      scope.canCloseModal = false;
      ctrl.originalWatch = angular.copy(createdPatientWatchMock);
      scope.patientWatch = angular.copy(createdPatientWatchMock);
      scope.viewOnly = false;
      scope.cancelChanges();
      expect(modalInstance.close).not.toHaveBeenCalled();
    });
  });

  describe('isEditMode function ->', function () {
    it('should set editMode to true if patientWatchId is not null', function () {
      scope.patientWatchId = 'anything';
      scope.isEditMode();
      expect(scope.editMode).toBe(true);
    });

    it('should set editMode to false if patientWatchId is null', function () {
      scope.patientWatchId = null;
      scope.isEditMode();
      expect(scope.editMode).toBe(false);
    });
  });

  describe('getPatientWatch function ->', function () {
    it('should call service', function () {
      ctrl.getPatientWatch();
      expect(patientServices.PatientWatch.get).toHaveBeenCalled();
    });
  });

  describe('patientWatchGetSuccess function ->', function () {
    it('should set patientWatch to res', function () {
      ctrl.savePatientWatchSuccess(createdPatientWatchMockResponse);
      expect(scope.patientWatch).toEqual(createdPatientWatchMock);
    });
  });

  describe('patientWatchGetFailure -> ', function () {
    it('should call toastrFactory error', function () {
      ctrl.patientWatchGetFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('CheckTooth function -> ', function () {
    it('should set duplicateWatch to true if tooth already is watched', function () {
      scope.patientWatch.ToothNumber = '15';
      ctrl.CheckTooth();
      expect(scope.duplicateWatch).toBe(true);
    });

    it('should set duplicateWatch to false if toothNumber is null', function () {
      scope.patientWatch.ToothNumber = null;
      ctrl.CheckTooth();
      expect(scope.duplicateWatch).toBe(false);
    });
  });
});
