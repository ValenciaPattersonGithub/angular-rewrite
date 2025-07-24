describe('PatientServiceTileController ->', function () {
  var scope, ctrl, routeParams;
  var usersFactory,
    patientServices,
    patientOdontogramFactory,
    locationService,
    modalFactory,
    patCacheFactory,
    rootScope;
  var patientAppointmentsFactory, toastrFactory, soarAnimation;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientAppointmentsFactory = {};

      patientOdontogramFactory = {};

      usersFactory = {};

      var appointmentService = {};
      $provide.value('AppointmentService', appointmentService);

      patCacheFactory = {
        ClearCache: jasmine.createSpy().and.callFake(function () {}),
        GetCache: jasmine.createSpy().and.callFake(function () {
          return {};
        }),
      };
      $provide.value('PatCacheFactory', patCacheFactory);

      patientServices = {
        ServiceTransactions: {},
        Claim: {
          getClaimsByServiceTransaction: jasmine
            .createSpy()
            .and.returnValue({}),
        },
        Predetermination: {
          Close: jasmine.createSpy().and.returnValue({}),
        },
      };
      $provide.value('PatientServices', patientServices);

      locationService = {
        getCurrentLocation: jasmine.createSpy().and.returnValue({ id: 1 }),
        getActiveLocations: jasmine
          .createSpy()
          .and.returnValue([{ id: 1 }, { id: 2 }]),
      };
      $provide.value('locationService', locationService);

      soarAnimation = {
        soarVPos: jasmine.createSpy().and.returnValue('soarVPos'),
      };
      $provide.value('soarAnimation', soarAnimation);

      modalFactory = {
        CancelModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        DeleteModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        LoadingModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        Modal: jasmine.createSpy().and.returnValue({
          result: { then: jasmine.createSpy() },
        }),
        ConfirmModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.callFake(function () {}),
        }),
      };
      $provide.value('ModalFactory', modalFactory);

      toastrFactory = {
        success: jasmine.createSpy(),
        error: jasmine.createSpy(),
      };

      $provide.value('toastrFactory', toastrFactory);
      $provide.value('PatientServicesFactory', {});
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    scope.patientInfo = { IsActive: true };
    routeParams = { patientId: '1234' };
    ctrl = $controller('PatientServiceTileController', {
      $scope: scope,
      $routeParams: routeParams,
      UsersFactory: usersFactory,
      PatientAppointmentsFactory: patientAppointmentsFactory,
      PatientOdontogramFactory: patientOdontogramFactory,
      modalFactory: modalFactory,
      PatCacheFactory: patCacheFactory,
      $rootScope: rootScope,
    });
  }));

  describe('$onInit method ->', function () {
    it('should call referenceDataService.get', function () {
      scope.patientService = { ServiceCodeId: '22', PatientId: '1234' };
      ctrl.$onInit();
    });

    it('should call ctrl.setAffectedArea', function () {
      spyOn(ctrl, 'setAffectedArea');
      scope.patientService = { ServiceCodeId: '22', LocationId: 1 };
      ctrl.$onInit();
      expect(ctrl.setAffectedArea).toHaveBeenCalled();
    });

    it('should call setCurrentLocation', function () {
      spyOn(scope, 'setCurrentLocation');
      scope.patientService = { ServiceCodeId: '22', LocationId: 1 };
      ctrl.$onInit();
      expect(scope.setCurrentLocation).toHaveBeenCalled();
    });
  });

  describe('setAllowEdit method ->', function () {
    it('should call referenceDataService.get', function () {
      scope.patientService = { ServiceCodeId: '22', PatientId: '1234' };
      ctrl.$onInit();
    });

    it('should call ctrl.setAffectedArea', function () {
      spyOn(ctrl, 'setAffectedArea');
      scope.patientService = { ServiceCodeId: '22', LocationId: 1 };
      ctrl.$onInit();
      expect(ctrl.setAffectedArea).toHaveBeenCalled();
    });

    it('should call setCurrentLocation', function () {
      spyOn(scope, 'setCurrentLocation');
      scope.patientService = { ServiceCodeId: '22', LocationId: 1 };
      ctrl.$onInit();
      expect(scope.setCurrentLocation).toHaveBeenCalled();
    });
  });

  describe('setAllowEdit function -> ', function () {
    beforeEach(function () {
      scope.patientInfo.IsActive = true;
      ctrl.currentLocation = { id: 1 };
      scope.patientService = {
        ServiceCodeId: '22',
        LocationId: 1,
        PatientId: '1234',
      };
      scope.personId = '1234';
    });

    it('should set canEditService to false if patient is not active', function () {
      scope.patientInfo.IsActive = false;
      scope.setAllowEdit();
      expect(scope.canEditService).toBe(false);
      expect(scope.editToolTip).toBe(
        'Cannot edit service transaction for an inactive patient.'
      );
    });

    it('should set canEditService to false if user does not have amfa access', function () {
      scope.hasEditAmfa = false;
      scope.setAllowEdit();
      expect(scope.canEditService).toBe(false);
      expect(scope.editToolTip).toBe(
        'User is not authorized to access this area.'
      );
    });

    it('should set canEditService to false if service is on a duplicate patient', function () {
      scope.patientService = {
        ServiceCodeId: '22',
        LocationId: 1,
        PatientId: '1235',
      };
      scope.setAllowEdit();
      expect(scope.canEditService).toBe(false);

      expect(scope.editToolTip).toBe(
        'Cannot edit a service for a duplicate patient.'
      );
    });
  });

  describe('ctrl.setAllowDelete function -> ', function () {
    beforeEach(function () {
      scope.personId = '1234';
      scope.patientInfo.IsActive = true;
      scope.currentLocation = { id: 1 };
    });

    it('should set canDeleteService to true if status is not 4 or 5 and currentLocation equals serviceTransaction.LocationId', function () {
      scope.patientService = {
        ServiceCodeId: '22',
        LocationId: 1,
        PatientId: '1234',
      };
      scope.setAllowDelete();
      expect(scope.canDeleteService).toBe(true);
      expect(scope.deleteToolTip).toBe('');
    });

    it('should set cls.AllowDelete to false if serviceTransaction.PatientId is not the same as scope.personId (duplicatePatient)', function () {
      scope.patientService = {
        ServiceCodeId: '22',
        LocationId: 1,
        PatientId: '1235',
        ServiceTransactionStatusId: 3,
      };
      scope.setAllowDelete();
      expect(scope.canDeleteService).toBe(false);
      expect(scope.deleteToolTip).toBe(
        'Cannot delete a service for a duplicate patient.'
      );
    });

    it('should set cls.AllowDelete to false if serviceTransaction.StatusId equals 4 (Completed)', function () {
      scope.patientService = {
        ServiceCodeId: '22',
        LocationId: 1,
        PatientId: '1234',
        ServiceTransactionStatusId: 4,
      };
      scope.setAllowDelete();
      expect(scope.canDeleteService).toBe(false);
      expect(scope.deleteToolTip).toBe(
        'Cannot delete a service transaction with a {0} status.'
      );
    });

    it('should set cls.AllowDelete to false if serviceTransaction.StatusId equals 5 (Pending)', function () {
      scope.patientService = {
        ServiceCodeId: '22',
        LocationId: 1,
        PatientId: '1234',
        ServiceTransactionStatusId: 5,
      };
      scope.setAllowDelete();
      expect(scope.canDeleteService).toBe(false);
      expect(scope.deleteToolTip).toBe(
        'Cannot delete a service transaction with a {0} status.'
      );
    });

    it('should set cls.AllowDelete to false if serviceTransaction.LocationId not equal currentLocation.id', function () {
      scope.patientService = {
        ServiceCodeId: '22',
        LocationId: 2,
        PatientId: '1234',
        ServiceTransactionStatusId: 3,
      };
      scope.setAllowDelete();
      expect(scope.canDeleteService).toBe(false);
      expect(scope.deleteToolTip).toBe(
        'Service transaction location must be the same as the active location.'
      );
    });
  });

  describe('scope.setCurrentLocation method -> ', function () {
    beforeEach(function () {
      spyOn(scope, 'setAllowDelete');
      spyOn(scope, 'setAllowEdit');
    });

    it('should set ctrl.currentLocation', function () {
      scope.setCurrentLocation();
      expect(scope.currentLocation).toEqual(
        locationService.getCurrentLocation()
      );
    });

    it('should call ctrl.setAllowDelete and ctrl.setAllowEdit', function () {
      scope.setCurrentLocation();
      expect(scope.setAllowDelete).toHaveBeenCalled();
      expect(scope.setAllowEdit).toHaveBeenCalled();
    });
  });

  describe('editService method ->', function () {
    it('should set serviceEdited to service parameter if user has permissions', function () {
      spyOn(ctrl, 'initializeToothControls');
      scope.patientService = { ServiceCodeId: '22', PatientId: '1234' };
      scope.canEditService = true;
      scope.editService(scope.patientService);
      expect(scope.serviceEdited).toEqual(scope.patientService);
    });

    it('should call initializeToothControls if user has permissions', function () {
      spyOn(ctrl, 'initializeToothControls');
      scope.patientService = { ServiceCodeId: '22', PatientId: '1234' };
      scope.canEditService = true;
      scope.editService();
      expect(ctrl.initializeToothControls).toHaveBeenCalled();
    });

    it('should not call initializeToothControls if user does not have permissions', function () {
      spyOn(ctrl, 'initializeToothControls');
      scope.patientService = {};
      scope.canEditService = false;
      scope.editService();
      expect(ctrl.initializeToothControls).not.toHaveBeenCalled();
    });

    it('should not call initializeToothControls if service is deleted', function () {
      spyOn(ctrl, 'initializeToothControls');
      scope.patientService = { IsDeleted: true };
      scope.canEditService = true;
      scope.editService();
      expect(ctrl.initializeToothControls).not.toHaveBeenCalled();
    });
  });

  describe('deleteServiceTransaction function -> ', function () {
    beforeEach(function () {
      scope.canEditService = true;
    });

    it('should call getClaimsByServiceTransaction and set claimsPromise', function () {
      scope.patientService = {
        ServiceTransactionId: 123,
        ServiceCodeId: '22',
        PatientId: '1234',
        ServiceTransactionStatusId: 5,
        Description: 'description',
      };
      var getClaimsResult = 'test';
      patientServices.Claim.getClaimsByServiceTransaction = jasmine
        .createSpy()
        .and.returnValue(getClaimsResult);

      scope.deleteServiceTransaction();

      expect(
        patientServices.Claim.getClaimsByServiceTransaction
      ).toHaveBeenCalledWith(
        jasmine.objectContaining({
          serviceTransactionId: scope.patientService.ServiceTransactionId,
          ClaimType: 2,
        })
      );
      expect(ctrl.claimsPromise).toBe(getClaimsResult);
    });

    it('should call modalFactory.DeleteModal when status is not 6', function () {
      scope.patientService = {
        ServiceCodeId: '22',
        PatientId: '1234',
        ServiceTransactionStatusId: 5,
        Description: 'description',
      };

      scope.deleteServiceTransaction();

      expect(modalFactory.DeleteModal).toHaveBeenCalledWith(
        'Planned Service',
        scope.patientService.Description,
        true,
        jasmine.stringMatching('This service will be')
      );
    });

    it('should call modalFactory.DeleteModal when status is 6', function () {
      scope.patientService = {
        ServiceCodeId: '22',
        PatientId: '1234',
        ServiceTransactionStatusId: 6,
        Description: 'description',
      };

      scope.deleteServiceTransaction();

      expect(modalFactory.DeleteModal).toHaveBeenCalledWith(
        'Planned Service',
        scope.patientService.Description,
        true,
        ''
      );
    });
  });

  describe('scope.confirmDeletion function ->', function () {
    beforeEach(function () {
      var result = [{ Status: 4 }, { Status: 4 }];
      ctrl.claimsPromise = {
        $promise: { then: success => success(result) },
      };

      scope.checkForPredeterminationInProcess = jasmine.createSpy();
      ctrl.closePredeterminations = Promise.resolve([
        { Status: 4 },
        { Status: 4 },
      ]);

      ctrl.closePredeterminations = jasmine
        .createSpy()
        .and.returnValue({ then: success => success(result) });
    });

    it('should call checkForPredeterminationInProcess', function () {
      scope.patientInfo.PatientId = '1234';
      scope.patientService = {
        ServiceTransactionId: '5555',
        PatientId: '1234',
      };
      patientServices.ServiceTransactions.deleteFromLedger =
        jasmine.createSpy();

      scope.confirmDeletion();

      expect(scope.checkForPredeterminationInProcess).toHaveBeenCalledWith([
        { Status: 4 },
        { Status: 4 },
      ]);
    });

    it('should call deleteService when not predInProcess', function () {
      scope.deleteService = jasmine.createSpy();
      scope.predInProcess = false;
      ctrl.hasPred = true;

      scope.patientInfo.PatientId = '1234';
      scope.patientService = {
        ServiceTransactionId: '5555',
        PatientId: '1234',
      };
      patientServices.ServiceTransactions.deleteFromLedger =
        jasmine.createSpy();

      scope.confirmDeletion();

      expect(scope.checkForPredeterminationInProcess).toHaveBeenCalled();
      expect(scope.deleteService).toHaveBeenCalled();
    });

    it('should call deleteService when not predInProcess and not hasPred', function () {
      scope.deleteService = jasmine.createSpy();
      scope.predInProcess = false;
      ctrl.hasPred = false;

      scope.patientInfo.PatientId = '1234';
      scope.patientService = {
        ServiceTransactionId: '5555',
        PatientId: '1234',
      };
      patientServices.ServiceTransactions.deleteFromLedger =
        jasmine.createSpy();

      scope.confirmDeletion();

      expect(scope.deleteService).toHaveBeenCalled();
    });

    it('should call predInProcessAlert when predInProcess', function () {
      ctrl.predInProcessAlert = jasmine.createSpy();
      scope.predInProcess = true;

      scope.patientInfo.PatientId = '1234';
      scope.patientService = {
        ServiceTransactionId: '5555',
        PatientId: '1234',
      };
      patientServices.ServiceTransactions.deleteFromLedger =
        jasmine.createSpy();

      scope.confirmDeletion();

      expect(ctrl.predInProcessAlert).toHaveBeenCalled();
    });
  });

  describe('scope.deleteService function ->', function () {
    it('should call patientServices.ServiceTransaction.deleteFromLedger', function () {
      scope.patientInfo.PatientId = '1234';
      scope.patientService = {
        ServiceTransactionId: '5555',
        PatientId: '1234',
      };
      patientServices.ServiceTransactions.deleteFromLedger =
        jasmine.createSpy();

      scope.deleteService();

      expect(
        patientServices.ServiceTransactions.deleteFromLedger
      ).toHaveBeenCalledWith(
        jasmine.objectContaining({
          Id: scope.patientInfo.PatientId,
          servicetransactionid: scope.patientService.ServiceTransactionId,
        }),
        scope.serviceTransactionDeleteSuccess,
        scope.serviceTransactionDeleteFailed
      );
    });
  });

  describe('serviceTransactionDeleteSuccess function -> ', function () {
    beforeEach(function () {
      rootScope = {
        $broadcast: jasmine.createSpy(),
      };
    });

    it('should clear the cacheFactory for treatment plans', function () {
      scope.patientService = {
        ServiceCodeId: '22',
        PatientId: '1234',
        ServiceTransactionStatusId: 5,
        Description: 'description',
      };
      scope.serviceTransactionDeleteSuccess();
      expect(patCacheFactory.GetCache).toHaveBeenCalledWith(
        'PatientTreatmentPlans'
      );
      expect(patCacheFactory.ClearCache).toHaveBeenCalledWith({});
    });

    it('should call toastrFactory success', function () {
      scope.patientService = {
        ServiceCodeId: '22',
        PatientId: '1234',
        ServiceTransactionStatusId: 6,
        Description: 'description',
      };
      scope.serviceTransactionDeleteSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
    });
  });

  describe('serviceTransactionDeleteFailed function -> ', function () {
    it('should call toastrFactory error', function () {
      scope.serviceTransactionDeleteFailed();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('toggleEllipsesMenu function -> ', function () {
    it('should set showEllipsesMenu to opposite value', function () {
      scope.showEllipsesMenu = true;
      scope.toggleEllipsesMenu({ currentTarget: 'test' });
      expect(scope.showEllipsesMenu).toBe(false);

      scope.showEllipsesMenu = false;
      scope.toggleEllipsesMenu({ currentTarget: 'test' });
      expect(scope.showEllipsesMenu).toBe(true);
    });

    it('should call soarAnimation.soarVPos', function () {
      var event = { currentTarget: 'test' };
      scope.showEllipsesMenu = false;
      scope.orientTop = 'test';
      scope.toggleEllipsesMenu({ currentTarget: 'test' });
      expect(soarAnimation.soarVPos).toHaveBeenCalledWith('test');
      expect(scope.orientTop).toBe('soarVPos');
    });
  });

  describe('predInProcessAlert function -> ', function () {
    it('should call modalFactory.ConfirmModal', function () {
      scope.predInProcessAlert();
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Confirm',
        'This service is on an in-process predetermination and cannot be deleted',
        'Ok'
      );
    });
  });

  describe('checkForPredeterminationInProcess function -> ', function () {
    it('should set predInProcess when parameter has a status of 4', function () {
      var pred = { Value: [{ Status: 4 }, { Status: 3 }] };
      scope.checkForPredeterminationInProcess(pred);
      expect(scope.predInProcess).toEqual({ Status: 4 });
    });

    it('should set predInProcess when parameter does not have a status of 4', function () {
      scope.predInProcess = true;
      var pred = { Value: [{ Status: 3 }, { Status: 3 }] };
      scope.checkForPredeterminationInProcess(pred);
      expect(scope.predInProcess).toEqual(undefined);
    });
  });

  describe('ctrl.setAffectedArea method ->', function () {
    it('should ', function () {
      scope.patientService = {
        AffectedAreaId: 4,
        SurfaceSummaryInfo: 'MO',
        RootSummaryInfo: 'R',
        Tooth: '8',
      };
      ctrl.setAffectedArea();
      expect(scope.affectedArea).toEqual('MO');
    });

    it('should ', function () {
      scope.patientService = {
        AffectedAreaId: 3,
        SurfaceSummaryInfo: 'MO',
        RootSummaryInfo: 'R',
        Tooth: '8',
      };
      ctrl.setAffectedArea();
      expect(scope.affectedArea).toEqual('R');
    });

    it('should ', function () {
      scope.patientService = {
        AffectedAreaId: 2,
        SurfaceSummaryInfo: 'MO',
        RootSummaryInfo: 'R',
        Tooth: '8',
      };
      ctrl.setAffectedArea();
      expect(scope.affectedArea).toEqual('8');
    });

    it('should ', function () {
      scope.patientService = {
        AffectedAreaId: 1,
        SurfaceSummaryInfo: 'MO',
        RootSummaryInfo: 'R',
        Tooth: '8',
      };
      ctrl.setAffectedArea();
      expect(scope.affectedArea).toEqual(undefined);
    });
  });
});
