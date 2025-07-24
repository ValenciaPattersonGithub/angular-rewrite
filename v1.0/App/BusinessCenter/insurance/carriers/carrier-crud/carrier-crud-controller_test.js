describe('carrer-crud-controller tests -> ', function () {
  var modalInstance, timeout, carrierBeingEdited, insuranceServices;
  var scope, ctrl, httpBackend;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  var mockModalFactory = {
    CancelModal: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy(),
    }),
    Modal: jasmine.createSpy().and.returnValue({
      result: {
        then: function (fn) {
          fn();
        },
      },
    }),
  };

  // Create spies for services
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      timeout = jasmine.createSpy();
      $provide.value('$timeout', timeout);

      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('ModaliInstance', modalInstance);

      carrierBeingEdited = {};
      $provide.value('Carrier', carrierBeingEdited);

      insuranceServices = {
        Carrier: {
          get: jasmine.createSpy(),
          update: jasmine.createSpy().and.returnValue({
            $promise: {
              finally: function () {
                return {};
              },
            },
          }),
          save: jasmine.createSpy().and.returnValue({
            $promise: {
              finally: function () {
                return {};
              },
            },
          }),
          findDuplicates: jasmine.createSpy(),
        },
        FeeSchedule: {
          get: jasmine.createSpy(),
        },
        BenefitPlan: {
          get: jasmine.createSpy(),
        },
      };
      $provide.value('BusinessCenterServices', insuranceServices);

      $provide.value('ModalFactory', mockModalFactory);
    })
  );

  // Create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $httpBackend,
    $injector
  ) {
    scope = $rootScope.$new();

    httpBackend = $injector.get('$httpBackend');

    ctrl = $controller('CarrierCrudController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      $timeout: timeout,
      toastrFactory: _toastr_,
    });
  }));

  it('should initialize the controller', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('save function ->', function () {
    it('should call insuranceServices.Carrier.update if editing a carrier', function () {
      scope.editing = true;
      ctrl.validate = jasmine.createSpy('validate').and.returnValue(true);
      var carrier = { ZipCode: null };
      scope.save(carrier);

      expect(insuranceServices.Carrier.update).toHaveBeenCalled();
    });

    it('should not call insuranceServices.Carrier.update if editing a carrier and isSaving is true', function () {
      scope.editing = true;
      scope.isSaving = true;
      ctrl.validate = jasmine.createSpy('validate').and.returnValue(true);
      var carrier = { ZipCode: null };
      scope.save(carrier);

      expect(insuranceServices.Carrier.update).toHaveBeenCalledTimes(0);
    });

    it('should call insuranceServices.Carrier.save if not editing a carrier', function () {
      scope.editing = false;
      ctrl.validate = jasmine.createSpy('validate').and.returnValue(true);
      var carrier = { ZipCode: null };
      scope.save(carrier);

      expect(insuranceServices.Carrier.save).toHaveBeenCalled();
    });
  });

  describe('findDuplicates ->', function () {
    var carrier;

    beforeEach(function () {
      carrier = {
        Name: 'Some Carrier',
        PayerId: 'Some Payer Id',
        CarrierId: 'Some Carrier Id',
      };

      ctrl.clearDuplicates = jasmine.createSpy();
    });

    it('should clear the existing list of duplicates', function () {
      ctrl.findDuplicates(carrier);

      expect(ctrl.clearDuplicates).toHaveBeenCalled();
    });

    it('should send a request to find the list of duplicates', function () {
      var params = {
        name: carrier.Name,
        payerId: carrier.PayerId,
        excludeId: carrier.CarrierId,
      };

      ctrl.findDuplicates(carrier);

      expect(insuranceServices.Carrier.findDuplicates).toHaveBeenCalledWith(
        params,
        ctrl.findDuplicatesSuccess,
        ctrl.findDuplicatesFailed
      );
    });

    it('should NOT send a request if the carrier null', function () {
      carrier = null;

      ctrl.findDuplicates(carrier);

      expect(insuranceServices.Carrier.findDuplicates).not.toHaveBeenCalled();
    });

    it('should NOT send a request if the carrier does not have a Name or PayerId specified', function () {
      carrier.Name = '';
      carrier.PayerId = '';

      ctrl.findDuplicates(carrier);

      expect(insuranceServices.Carrier.findDuplicates).not.toHaveBeenCalled();
    });
  });

  describe('findDuplicatesSuccess ->', function () {
    var result;

    beforeEach(function () {
      result = {
        Value: 'duplicate list',
      };

      ctrl.findDuplicatesSuccess(result);
    });

    it('should turn off the checkForDuplicates flag', function () {
      expect(scope.checkingForDuplicates).toEqual(false);
    });

    it('should populate the list of duplicates with the results', function () {
      expect(scope.duplicates).toEqual(result.Value);
    });
  });

  describe('findDuplicatesFailed ->', function () {
    beforeEach(function () {
      ctrl.findDuplicatesFailed();
    });

    it('should turn off the checkForDuplicates flag', function () {
      expect(scope.checkingForDuplicates).toEqual(false);
    });

    it('should show an error message', function () {
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('getCarrierById function ->', function () {
    it('should call insuranceServices.Carrier.get', function () {
      ctrl.getCarrierById('1');

      expect(insuranceServices.Carrier.get).toHaveBeenCalled();
    });
  });

  describe('getAvailableFeeSchedules function ->', function () {
    it('should call insuranceServices.FeeSchedule.get', function () {
      ctrl.getAvailableFeeSchedules();

      expect(insuranceServices.FeeSchedule.get).toHaveBeenCalled();
    });
  });

  describe('addFeeSchedule function ->', function () {
    it('should have one more fee schedule in carrier.FeeScheduleList', function () {
      scope.selectedItem = 0;
      scope.selectedIndex = 0;
      scope.carrier = {
        FeeScheduleList: [{ FeeScheduleId: 4 }],
      };
      scope.availFeeSchedules = [
        { FeeScheduleId: 1 },
        { FeeScheduleId: 2 },
        { FeeScheduleId: 3 },
      ];

      scope.addFeeSchedule();

      expect(scope.carrier.FeeScheduleList.length).toEqual(2);
    });
  });

  describe('getAllBenefitPlans function ->', function () {
    it('should call insuranceServices.BenefitPlan.get', function () {
      ctrl.getAllBenefitPlans();

      expect(insuranceServices.BenefitPlan.get).toHaveBeenCalled();
    });
  });

  describe('removeAllFeeSchedule function  ->', function () {
    it('should should remove all fee schedulle in FeeScheduleList', function () {
      scope.benefitPlans = [];

      scope.carrier = {
        FeeScheduleList: [
          { FeeScheduleId: 3 },
          { FeeScheduleId: 4 }
        ],
      };
      scope.availFeeSchedules = [
        { FeeScheduleId: 1 },
        { FeeScheduleId: 2 }
      ];

      scope.removeAllFeeSchedule();

      expect(scope.carrier.FeeScheduleList.length).toEqual(0);
    });
  });

  describe('removeFeeSchedule function ->', function () {
    it('should have one less fee schedule in carrier.FeeScheduleList', function () {
      scope.benefitPlans = [];
      var fs = { FeeScheduleId: 4 };
      scope.fs = fs;
      scope.carrier = {
        FeeScheduleList: [{ FeeScheduleId: 4 }],
      };
      scope.removedIndex = 0;
      scope.availFeeSchedules = [
        { FeeScheduleId: 1 },
        { FeeScheduleId: 2 },
        { FeeScheduleId: 3 },
      ];

      scope.removeFeeSchedule(fs);

      expect(scope.carrier.FeeScheduleList.length).toEqual(0);
    });

    it('should call the modal and not remove the fee schedule', function () {
      spyOn(ctrl, 'moveFeeScheduleFromAttachedToAvailable');
      scope.benefitPlans = [{ FeeScheduleId: 4, CarrierId: 1 }];
      var fs = { FeeScheduleId: 4 };
      scope.fs = fs;
      scope.carrier = {
        FeeScheduleList: [{ FeeScheduleId: 4 }],
        CarrierId: 1,
      };
      scope.removedIndex = 0;
      scope.availFeeSchedules = [
        { FeeScheduleId: 1 },
        { FeeScheduleId: 2 },
        { FeeScheduleId: 3 },
      ];
      scope.removeFeeSchedule(fs);

      expect(scope.carrier.FeeScheduleList.length).toEqual(1);
      expect(scope.affectedBenefitPlans.length).toEqual(1);
      expect(mockModalFactory.Modal).toHaveBeenCalled();
      expect(ctrl.moveFeeScheduleFromAttachedToAvailable).toHaveBeenCalledWith(
        fs
      );
    });
  });

  describe('scope.initialize function ->', function () {
    it('should set ClaimFilingIndicatorCode to default value of CI', function () {
      scope.paymentSourceOptions = [
        { name: 'Automobile Medical', value: 'AM' },
        { name: 'Blue Cross/Blue Shield', value: 'BL' },
        { name: 'Champus', value: 'CH' },
        { name: 'Commercial Insurance Co.', value: 'CI' },
      ];

      scope.initialize();

      expect(scope.carrier.ClaimFilingIndicatorCode).toBe('CI');
    });

    it('should not change ClaimFilingIndicatorCode to default value', function () {
      scope.initialize();
      scope.carrier.ClaimFilingIndicatorCode = 'AM';

      expect(scope.carrier.ClaimFilingIndicatorCode).toBe('AM');
    });
  });

  describe('focus watch -> ', function () {
    beforeEach(function () {
      spyOn(scope, 'checkForDuplicates');
      spyOn(ctrl, 'setPayerId');
    });

    it('should call scope.checkForDuplicates when focus is false', function () {
      httpBackend
        .when('GET', 'http://localhost:6666/insurance/claimpayer')
        .respond(200, { status: 'success' });
      scope.focus = true;
      scope.$apply();
      scope.focus = false;
      scope.$apply();
      expect(scope.checkForDuplicates).toHaveBeenCalled();
    });

    it('should not call scope.checkForDuplicates when focus is true', function () {
      httpBackend
        .when('GET', 'http://localhost:6666/insurance/claimpayer')
        .respond(200, { status: 'success' });
      scope.focus = false;
      scope.$apply();
      scope.focus = true;
      scope.$apply();
      expect(scope.checkForDuplicates).not.toHaveBeenCalled();
    });

    it('should call setPayerId when focus is false', function () {
      httpBackend
        .when('GET', 'http://localhost:6666/insurance/claimpayer')
        .respond(200, { status: 'success' });
      scope.isEditing = false;
      scope.focus = true;
      scope.$apply();
      scope.focus = false;
      scope.$apply();
      expect(ctrl.setPayerId).toHaveBeenCalled();
    });
  });

  describe('setPayerId method -> ', function () {
    beforeEach(function () {
      scope.CHCList = [
        { Name: 'CarrierName1' },
        { Name: 'CarrierName2' },
        { Name: 'CarrierName3' },
        { Name: 'CarrierName4' },
      ];
      scope.carrier = { Name: 'Carrier Name', PayerId: null };
    });

    it('should not set PayerId if scope.editing is true', function () {
      scope.editing = true;
      scope.carrier.PayerId = null;
      ctrl.setPayerId();
      expect(scope.carrier.PayerId).toBe(null);
    });

    it('should set PayerId to 06126 if editing is false and carrier.Name is not in scope.CHCList', function () {
      scope.editing = false;
      scope.carrier.PayerId = null;
      scope.carrier.Name = 'CarrierName11';
      ctrl.setPayerId();
      expect(scope.carrier.PayerId).toEqual('06126');
    });

    it('should not set PayerId to 06126 if editing is false and carrier.Name is in scope.CHCList', function () {
      scope.editing = false;
      scope.carrier.Name = 'CarrierName1';
      scope.carrier.PayerId = null;
      ctrl.setPayerId();
      expect(scope.carrier.PayerId).toEqual(null);
    });
  });
});
