describe('closeClaimConfirmWithRecreate-controller tests -> ', function () {
  var unittestscope,
    ctrl,
    modalInstance,
    modalFactory,
    toastrFactory,
    closeClaimObject,
    patientServiceMock,
    usersFactoryMock;
  var modalFactoryDeferred, closeClaimService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      usersFactoryMock = {
        Users: jasmine
          .createSpy('usersFactoryMock.Users')
          .and.returnValue({ then: function () {} }),
      };
      patientServiceMock = {
        Claim: {
          getEstimatedInsuranceForClaim: jasmine.createSpy(),
        },
      };

      $provide.value('PatientServices', patientServiceMock);
    })
  );

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      var scheduleServices = {
        Dtos: {
          Appointment: {
            Operations: {
              Update: jasmine.createSpy('AppointmentUpdate'),
              Delete: jasmine.createSpy('AppointmentDelete'),
            },
          },
        },
        SoftDelete: {
          Appointment: jasmine.createSpy(),
        },
      };

      $provide.value('ScheduleServices', scheduleServices);

      var mockModalDataFactory = {};

      $provide.value('ModalDataFactory', mockModalDataFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    var q = $injector.get('$q');

    unittestscope = $rootScope.$new();
    // mock for modalFactory
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
        var deferred = q.defer();
        deferred.resolve('some value in return');
        return { result: deferred.promise };
      }),
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };
    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    closeClaimService = {
      update: jasmine.createSpy(),
    };

    closeClaimObject = { claimInfo: {} };

    ctrl = $controller('CloseClaimConfirmWithRecreateController', {
      $scope: unittestscope,
      closeClaimService: closeClaimService,
      closeClaimObject: closeClaimObject,
      $uibModalInstance: modalInstance,
      ModalFactory: modalFactory,
      toastrFactory: toastrFactory,
      UsersFactory: usersFactoryMock,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected closeclaims service', function () {
      expect(closeClaimService).not.toBeNull();
    });
  });

  describe('closeClaim function ->', function () {
    describe('closeclaim function -> ', function () {
      it('should call closeclaimservice.update', function () {
        if (unittestscope.closeClaim()) {
          expect(closeClaimService.update).toHaveBeenCalled();
          expect(toastrFactory.success).toHaveBeenCalled();
        }
      });

      it('should not call closeclaimservice.update', function () {
        closeClaimObject.multipleEdits = true;
        if (unittestscope.closeClaim()) {
          expect(closeClaimService.update).not.toHaveBeenCalled();
        }
      });
    });
  });
});
