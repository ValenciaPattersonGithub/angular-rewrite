describe('treatmentPlansLanding directive ->', function () {
  var scope,
    ctrl,
    treatmentPlansFactory,
    patientServices,
    toastrFactory,
    scheduleServices;

  // #region mocks

  var mockTxPlan = {
    TreatmentPlanHeader: {},
    TreatmentPlanServices: [],
  };

  var mockUsers = {
    Value: [
      { UserId: 1, UserCode: 'USERONE' },
      { UserId: 2, UserCode: 'USERTWO' },
    ],
  };

  var mockProposedServices = {
    Value: [{ ProviderUserId: 1 }, { ProviderUserId: 2 }],
  };

  var mockTreatmentPlanServices = {
    Value: [
      { TreatmentPlanServiceHeader: {}, ServiceTransaction: { Fee: 50 } },
      { TreatmentPlanServiceHeader: {}, ServiceTransaction: { Fee: 200 } },
    ],
  };

  // #endregion mocks

  // #region setup

  beforeEach(
    module('Soar.Patient', function ($provide) {
      // PatientServices provider
      patientServices = {
        TreatmentPlans: {
          addServices: jasmine.createSpy(),
          get: jasmine.createSpy().and.returnValue([mockTxPlan]),
          getAllHeaders: jasmine
            .createSpy()
            .and.returnValue([mockTxPlan.TreatmentPlanHeader]),
          save: jasmine.createSpy(),
        },
      };
      $provide.value('PatientServices', patientServices);
      // UsersFactory provider
      $provide.value('UsersFactory', {
        Users: function () {
          return {
            then: function (callback) {
              return callback(mockUsers);
            },
          };
        },
      });
      // toastr
      toastrFactory = {
        error: jasmine.createSpy('toastrFactory.error'),
        success: jasmine.createSpy('toastrFactory.success'),
      };

      scheduleServices = {
        Lists: {
          Appointments: {
            GetAllWithDetails: jasmine
              .createSpy()
              .and.returnValue({ $promise: { then: function () {} } }),
          },
        },
      };
      $provide.value('ScheduleServices', scheduleServices);
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    // scopes
    scope = $rootScope.$new();
    scope.$parent = $rootScope.$new();
    scope.$parent.$parent = $rootScope.$new();
    scope.$parent.$parent.$parent = $rootScope.$new();
    // getting TreatmentPlansFactory
    treatmentPlansFactory = {
      SetNewTreatmentPlan: jasmine.createSpy(
        'treatmentPlansFactory.SetNewTreatmentPlan'
      ),
      GetAllHeaders: jasmine.createSpy('treatmentPlansFactory.GetAllHeaders'),
      BuildTreatmentPlanServiceDto: jasmine
        .createSpy('treatmentPlansFactory.buildTreatmentPlanServiceDto')
        .and.returnValue(mockTreatmentPlanServices.Value[1]),
      GetTotalFees: jasmine.createSpy('treatmentPlansFactory.GetTotalFees'),
      GetDaysAgo: jasmine.createSpy('treatmentPlansFactory.GetDaysAgo'),
      PatientPortion: jasmine.createSpy('treatmentPlansFactory.PatientPortion'),
      SetActiveTreatmentPlan: jasmine.createSpy(
        'treatmentPlansFactory.SetActiveTreatmentPlan'
      ),
      SetDataChanged: jasmine.createSpy('treatmentPlansFactory.SetDataChanged'),
      CollapseAll: jasmine.createSpy('treatmentPlansFactory.CollapseAll'),
      BuildTreatmentPlanDto: jasmine.createSpy(
        'treatmentPlansFactory.BuildTreatmentPlanDto'
      ),
      Create: jasmine.createSpy('treatmentPlansFactory.Create'),
      SetPatientAppointments: jasmine.createSpy(),
    };
    // instantiating the controller object
    ctrl = $controller('TreatmentPlansLandingController', {
      $scope: scope,
      TreatmentPlansFactory: treatmentPlansFactory,
      toastrFactory: toastrFactory,
    });
    // default scope properties
    scope.viewSettings = { activeExpand: 0, expandView: false };
  }));

  //#endregion

  //#region tests

  describe('watch treatmentPlansFactory.ActiveTreatmentPlan', function () {
    it('should set viewSettings to not display treatment plan if ActiveTreatmentPlan is null', function () {
      treatmentPlansFactory.ActiveTreatmentPlan = null;
      scope.$apply();
      expect(scope.viewSettings.expandView).toBe(false);
      expect(scope.viewSettings.activeExpand).toBe(0);
    });
  });

  describe('watch treatmentPlansFactory.NewTreatmentPlan', function () {
    it('should set viewSettings to display treatment plan if NewTreatmentPlan is not null', function () {
      treatmentPlansFactory.ActiveTreatmentPlan = null;
      var tp = {
        TreatmentPlanHeader: { TreatmentPlanId: null },
        TreatmentPlanServices: [],
      };
      treatmentPlansFactory.NewTreatmentPlan = tp;
      scope.$apply();
      expect(scope.viewSettings.expandView).toBe(true);
      expect(scope.viewSettings.activeExpand).toBe(2);
    });
  });

  describe('clearIfDefault -> ', function () {
    it('should clear TreatmentPlanName if default', function () {
      scope.newTreatmentPlan = angular.copy(mockTxPlan);
      scope.newTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName =
        'Treatment Plan';
      scope.clearIfDefault();
      expect(scope.newTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName).toBe(
        ''
      );
    });

    it('should not clear TreatmentPlanName if not default', function () {
      scope.newTreatmentPlan = angular.copy(mockTxPlan);
      scope.newTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName =
        'Something Else';
      scope.clearIfDefault();
      expect(scope.newTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName).toBe(
        'Something Else'
      );
    });
  });

  describe('watch NewPlannedService -> ', function () {
    beforeEach(inject(function () {
      treatmentPlansFactory.ActiveTreatmentPlan = angular.copy(mockTxPlan);
      treatmentPlansFactory.NewPlannedService = angular.copy(
        mockProposedServices.Value[1]
      );
      scope.existingTreatmentPlans = [
        {
          TreatmentPlanHeader: {
            TreatmentPlanId: 2,
            TreatmentPlanName: 'TreatmentPlanName1',
          },
        },
        {
          TreatmentPlanHeader: {
            TreatmentPlanId: 22,
            TreatmentPlanName: 'TreatmentPlanName2',
          },
        },
      ];
    }));
  });

  describe('createTreatmentPlan -> ', function () {
    it('should set all appropriate object states to prep for a new treatment plan', function () {
      scope.hasTreatmentPlanCreateAccess = true;

      scope.createTreatmentPlan();
      expect(treatmentPlansFactory.SetDataChanged).toHaveBeenCalledWith(true);
      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalledWith(
        null
      );
      expect(treatmentPlansFactory.CollapseAll).toHaveBeenCalled;
      expect(treatmentPlansFactory.SetNewTreatmentPlan).toHaveBeenCalled;
      expect(scope.formIsValid).toBe(true);
      expect(scope.viewSettings.expandView).toBe(true);
      expect(scope.viewSettings.activeExpand).toBe(2);
      expect(scope.viewSettings.txPlanActiveId).toBe(null);
    });
  });

  describe('addServiceSuccess -> ', function () {
    beforeEach(inject(function () {
      ctrl.activeTreatmentPlan = angular.copy(mockTxPlan);
      var today = new Date();
      ctrl.activeTreatmentPlan.TreatmentPlanHeader.CreatedDate = today;
      treatmentPlansFactory.RefreshTreatmentPlanServices = jasmine.createSpy();
    }));

    it('should update TreatmentPlanServices', function () {
      ctrl.treatmentPlanServiceDtosTemp = [
        {
          ServiceTransaction: {},
        },
      ];
      ctrl.addServiceSuccess(mockTreatmentPlanServices);
      expect(treatmentPlansFactory.SetActiveTreatmentPlan).toHaveBeenCalled();
    });

    it('should do calculations', function () {
      ctrl.treatmentPlanServiceDtosTemp = [
        {
          ServiceTransaction: {},
        },
      ];
      ctrl.addServiceSuccess(mockTreatmentPlanServices);
      expect(treatmentPlansFactory.GetDaysAgo).toHaveBeenCalled();
      expect(treatmentPlansFactory.GetTotalFees).toHaveBeenCalled();
    });

    it('should show toastr success and set flag', function () {
      ctrl.treatmentPlanServiceDtosTemp = [
        {
          ServiceTransaction: {},
        },
      ];
      ctrl.addServiceSuccess(mockTreatmentPlanServices);
      expect(treatmentPlansFactory.AddingService).toBe(false);
      expect(toastrFactory.success).toHaveBeenCalled();
    });

    it('should not call treatmentPlansFactory.RefreshTreatmentPlanServices when there are no services', function () {
      ctrl.addServiceSuccess({ Value: [] });
      expect(
        treatmentPlansFactory.RefreshTreatmentPlanServices
      ).not.toHaveBeenCalled();
    });

    it('should call treatmentPlansFactory.RefreshTreatmentPlanServices with added services', function () {
      ctrl.treatmentPlanServiceDtosTemp = [
        {
          ServiceTransaction: {},
        },
      ];
      var service = {};
      ctrl.addServiceSuccess({ Value: [{ ServiceTransaction: service }] });
      expect(
        treatmentPlansFactory.RefreshTreatmentPlanServices
      ).toHaveBeenCalledWith([service]);
    });
  });

  describe('addServiceFailure -> ', function () {
    it('should show toastr error and set flag', function () {
      ctrl.addServiceFailure();
      expect(treatmentPlansFactory.AddingService).toBe(false);
    });
  });

  describe('ctrl.getNextPriorityNumber method ->', function () {
    beforeEach(function () {
      ctrl.activeTreatmentPlan = _.cloneDeep(mockTxPlan);
      ctrl.activeTreatmentPlan.TreatmentPlanServices = [
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: 1234,
            PersonId: 2,
            Priority: 1,
            TreatmentPlanId: 123,
          },
          ServiceTransaction: {},
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: 1235,
            PersonId: 2,
            Priority: 2,
            TreatmentPlanId: 123,
          },
          ServiceTransaction: {},
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: 1236,
            PersonId: 2,
            Priority: 3,
            TreatmentPlanId: 123,
          },
          ServiceTransaction: {},
        },
      ];
    });

    it('should calculate the nextPriority number for the TreatmentPlanServices on the activeTreatmentPlan', function () {
      var maxPriorityOnPlan =
        ctrl.activeTreatmentPlan.TreatmentPlanServices.length;
      var nextPriorityNumber = ctrl.getNextPriorityNumber();
      expect(nextPriorityNumber).toBe(maxPriorityOnPlan + 1);
    });

    it('should calculate the nextPriority number to be 1 if no TreatmentPlanServices on the activeTreatmentPlan', function () {
      ctrl.activeTreatmentPlan.TreatmentPlanServices = [];
      var nextPriorityNumber = ctrl.getNextPriorityNumber();
      expect(nextPriorityNumber).toBe(1);
    });
  });

  describe('addServiceToTreatmentPlan -> ', function () {
    beforeEach(function () {
      scope.hasTreatmentPlanAddServiceAccess = true;
      ctrl.activeTreatmentPlan = _.cloneDeep(mockTxPlan);
      scope.personId = '1234';
      spyOn(ctrl, 'addServiceSuccess').and.callFake(function () {});

      ctrl.activeTreatmentPlan.TreatmentPlanServices = [
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: 1234,
            PersonId: 2,
            Priority: 1,
            TreatmentPlanId: 123,
          },
          ServiceTransaction: {},
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: 1235,
            PersonId: 2,
            Priority: 2,
            TreatmentPlanId: 123,
          },
          ServiceTransaction: {},
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: 1236,
            PersonId: 2,
            Priority: 3,
            TreatmentPlanId: 123,
          },
          ServiceTransaction: {},
        },
      ];
      scope.hasTreatmentPlanAddServiceAccess = true;
    });

    it('should call ctrl.getNextPriorityNumber', function () {
      spyOn(ctrl, 'getNextPriorityNumber');
      ctrl.addServicesToTreatmentPlan([{}]);
      expect(ctrl.getNextPriorityNumber).toHaveBeenCalled();
    });

    it('should set services added to treatment plan based on value returned from ctrl.getNextPriorityNumber', function () {
      spyOn(ctrl, 'getNextPriorityNumber').and.returnValue(3);
      ctrl.addServicesToTreatmentPlan([
        { ServiceTransactionId: 123 },
        { ServiceTransactionId: 223 },
        { ServiceTransactionId: 323 },
      ]);
      expect(
        ctrl.treatmentPlanServiceDtosTemp[2].TreatmentPlanServiceHeader.Priority
      ).toBe(5);
    });

    it('should call the api, etc.', function () {
      scope.hasTreatmentPlanAddServiceAccess = true;
      ctrl.activeTreatmentPlan = angular.copy(mockTxPlan);
      ctrl.addServicesToTreatmentPlan([{}]);
      expect(
        treatmentPlansFactory.BuildTreatmentPlanServiceDto
      ).toHaveBeenCalled();
      expect(patientServices.TreatmentPlans.addServices).toHaveBeenCalled();
    });
  });

  describe('expandPlan -> ', function () {
    it('should set scope.viewSettings properties', function () {
      scope.viewSettings.expandView = false;
      scope.viewSettings.activeExpand = 0;
      scope.expandPlan();
      expect(scope.viewSettings.expandView).toBe(true);
      expect(scope.viewSettings.activeExpand).toBe(2);
    });
  });

  describe('listener soar:tx-plan-services-changed -> ', function () {
    it('should call GetAllHeaders', function () {
      scope.$broadcast('soar:tx-plan-services-changed', [], true);
      expect(treatmentPlansFactory.GetAllHeaders).toHaveBeenCalled();
    });
  });

  describe('appointmentRetrievalSuccess method -> ', function () {
    var result = { Value: [] };
    beforeEach(function () {
      result.Value = [
        { Location: {}, Appointment: { AppointmentId: 1 } },
        { Location: {}, Appointment: { AppointmentId: 12 } },
        { Location: {}, Appointment: { AppointmentId: 13 } },
      ];
    });

    it('should load appointments to factory', function () {
      ctrl.appointmentRetrievalSuccess(result);
      expect(treatmentPlansFactory.SetPatientAppointments).toHaveBeenCalledWith(
        [{ AppointmentId: 1 }, { AppointmentId: 12 }, { AppointmentId: 13 }]
      );
    });
  });
});
