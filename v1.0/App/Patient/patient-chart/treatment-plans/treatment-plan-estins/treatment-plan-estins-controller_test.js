describe('TreatmentPlanEstinsController ->', function () {
  var ctrl, scope;
  var referenceDataService;
  var treatmentPlanHeaderMock, treatmentPlanMock, treatmentPlanServiceMock;

  //#region mocks

  var tph = {
    TreatmentPlanId: null,
    PersonId: undefined,
    StatusId: '1',
    TreatmentPlanName: 'Treatment Plan',
    TreatmentPlanDescription: null,
    RejectedReason: null,
    DaysAgo: 0,
  };
  var tp = { TreatmentPlanHeader: Object(tph), TreatmentPlanServices: [] };
  var tps = {
    TreatmentPlanServiceHeader: Object({
      TreatmentPlanServiceId: null,
      PersonId: 2,
      Priority: null,
      TreatmentPlanId: null,
      TreatmentPlanGroupNumber: 1,
      EstimatedInsurance: null,
      PatientPortion: null,
      ServiceTransactionId: 33,
    }),
    ServiceTransaction: Object({ ServiceTransactionId: 33 }),
  };

  var treatmentPlanServicesMock = [
    {
      TreatmentPlanServiceHeader: {
        TreatmentPlanServiceId: 1234,
        PersonId: 2,
        Priority: null,
        TreatmentPlanId: 123,
      },
      ServiceTransaction: {},
    },
    {
      TreatmentPlanServiceHeader: {
        TreatmentPlanServiceId: 1235,
        PersonId: 2,
        Priority: null,
        TreatmentPlanId: 123,
      },
      ServiceTransaction: {},
    },
    {
      TreatmentPlanServiceHeader: {
        TreatmentPlanServiceId: 1236,
        PersonId: 2,
        Priority: null,
        TreatmentPlanId: 123,
      },
      ServiceTransaction: {},
    },
  ];
  //#endregion

  //#region before each

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Schedule'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: { serviceCodes: 'serviceCodes' },
      };
      $provide.value('referenceDataService', referenceDataService);
    })
  );

  var $q;

  beforeEach(inject(function ($controller, $timeout, $rootScope, _$q_) {
    $q = _$q_;
    scope = $rootScope.$new();
    scope.$on = jasmine.createSpy();
    treatmentPlanHeaderMock = tph;
    treatmentPlanMock = tp;
    treatmentPlanServiceMock = tps;
    //ctrl = $controller.get('TreatmentPlanEstinsController');

    scope.serviceTransaction = {
      ServiceTransaction: { ServiceCodeId: 1 },
    };
    scope.$watch = jasmine.createSpy();

    referenceDataService.getData.and.returnValue(
      $q.resolve([{ ServiceCodeId: 1, CdtCodeId: 1, SubmitOnInsurance: true }])
    );

    ctrl = $controller('TreatmentPlanEstinsController', {
      $scope: scope,
      $timeout: $timeout,
    });
  }));

  //#endregion

  //#region properties

  //#endregion

  //#region utility

  describe('oninit -> ', function () {
    it('should call setTooltipText', function () {
      scope.setTooltipText = jasmine.createSpy();

      ctrl.$onInit();
      scope.$apply();
      expect(scope.setTooltipText).toHaveBeenCalled();
    });
  });

  describe('setTooltipText -> ', function () {
    beforeEach(function () {
      scope.patientBenefitPlans = [{ Test: 'testPlan' }];
      scope.disabledEdit = false;
      scope.tooltipText = '';
    });

    //No benefit plan
    it('should set tooltipText when patient has no benefit plan', function () {
      scope.patientBenefitPlans = null;

      scope.setTooltipText();

      expect(scope.tooltipText).toBe(
        'This patient does not have a benefit plan.'
      );
    });

    //Pending
    it('should set tooltipText when service is in Pending status', function () {
      scope.serviceTransaction.ServiceTransaction.ServiceTransactionStatusId = 5;

      scope.setTooltipText();

      expect(scope.tooltipText).toBe(
        'Pending services estimated insurance must be edited on the encounter page.'
      );
    });

    //Completed
    it('should set tooltipText when service is in Completed status', function () {
      scope.serviceTransaction.ServiceTransaction.ServiceTransactionStatusId = 4;

      scope.setTooltipText();

      expect(scope.tooltipText).toBe('This service has been completed.');
    });

    //NotValidForInsurance
    it('should set tooltipText when service is not valid for insurance', function () {
      scope.serviceTransaction.ServiceTransaction.ServiceTransactionStatusId = 3;
      scope.isValidForInsurance = false;

      scope.setTooltipText();

      expect(scope.tooltipText).toBe(
        'The service must have a CDT Code assigned and/or be marked to submit to insurance.'
      );
    });
  });

  describe('copyServiceTransaction -> ', function () {
    beforeEach(function () {
      scope.hasPatientBenefitPlan = true;
      scope.disabledEdit = false;
      scope.tooltipText = '';
    });

    //No benefit plan
    it('should return copy of passed in serviceTransaction', function () {
      scope.hasPatientBenefitPlan = false;

      var returnValue = scope.copyServiceTransaction({
        ServiceTransaction: {
          TotalEstInsurance: 10,
          TotalAdjEstimate: 15,
          InsuranceEstimates: [
            {
              EstInsurance: 'estInsurance',
              InputEstInsurance: 'inputEstInsurance',
              AdjEst: 'adjEst',
            },
          ],
        },
      });

      expect(returnValue).toEqual({
        TotalEstInsurance: 10,
        TotalAdjEstimate: 15,
        InsuranceEstimates: [
          {
            EstInsurance: 'estInsurance',
            InputEstInsurance: 'estInsurance',
            AdjEst: 'adjEst',
            sourceEstimate: {
              EstInsurance: 'estInsurance',
              InputEstInsurance: 'inputEstInsurance',
              AdjEst: 'adjEst',
            },
            LatestEstInsurance: 'estInsurance',
            InputAdjEst: 'adjEst',
            validInsAmount: true,
            priority: 0,
          },
        ],
        InputTotalEstInsurance: 10,
        InputTotalAdjEstimate: 15,
      });
    });
  });

  describe('toggle -> ', function () {
    beforeEach(function () {
      scope.disableEdit = false;
      scope.closeAll = { closeAllEstIns: false };
    });

    //No benefit plan
    it('should set toggled and closeAllEstIns', function () {
      scope.isToggled = false;

      scope.toggle();

      expect(scope.isToggled).toEqual(true);
      expect(scope.closeAll.closeAllEstIns).toEqual(true);
    });

    it('should not set toggled and closeAllEstIns when disableEditFunctions is true', function () {
      scope.isToggled = false;
      scope.disableEditFunctions = true;

      scope.toggle();

      expect(scope.isToggled).toEqual(false);
      expect(scope.closeAll.closeAllEstIns).toEqual(false);
    });
  });

  describe('update -> ', function () {
    beforeEach(function () {
      scope.disableEdit = false;
      scope.closeAll = { closeAllEstIns: true };
      scope.isOpen = true;

      scope.serviceTransaction = {
        TreatmentPlanServiceHeader: {
          InsuranceEstimates: [{ PatientBenefitPlanId: 1 }],
        },
        ServiceTransaction: {
          Amount: 150,
          TotalEstInsurance: 10,
          TotalAdjEstimate: 15,
          InsuranceEstimates: [
            { EstInsurance: 10, AdjEst: 15, PatientBenefitPlanId: 1 },
            { EstInsurance: 25, AdjEst: 26, PatientBenefitPlanId: 2 },
          ],
        },
      };
      scope.inputData = {
        InputTotalEstInsurance: 100,
        InsuranceEstimates: [
          { InputEstInsurance: 20 },
          { InputEstInsurance: 30 },
        ],
      };
    });

    //No benefit plan
    it('should set toggled and closeAllEstIns', function () {
      scope.isToggled = false;
      scope.recalculate = jasmine.createSpy();

      scope.update();

      expect(scope.recalculate).toHaveBeenCalledWith({
        Amount: 150,
        TotalEstInsurance: 100,
        TotalAdjEstimate: 15,
        InsuranceEstimates: [
          {
            EstInsurance: 20,
            AdjEst: 15,
            PatientBenefitPlanId: 1,
            IsUserOverRidden: true,
            IsMostRecentOverride: true,
          },
          {
            EstInsurance: 30,
            AdjEst: 26,
            PatientBenefitPlanId: 2,
            IsUserOverRidden: true,
          },
        ],
        Balance: 35,
      });
      expect(scope.closeAll.closeAllEstIns).toEqual(false);
      expect(scope.isOpen).toEqual(false);
    });
  });

  describe('verifyMaxAmount -> ', function () {
    beforeEach(function () {
      scope.disableEdit = false;
      scope.closeAll = { closeAllEstIns: true };
      scope.isOpen = true;

      scope.inputData = {
        Amount: 150,
        Fee: 150,
        Tax: 5,
        Discount: 10,
        TotalEstInsurance: 10,
        TotalAdjEstimate: 15,
        InsuranceEstimates: [
          { EstInsurance: 10, AdjEst: 15, PatientBenefitPlanId: 1 },
          { EstInsurance: 25, AdjEst: 26, PatientBenefitPlanId: 2 },
        ],
      };
      //scope.inputData = { InputTotalEstInsurance: 100, InsuranceEstimates: [{ InputEstInsurance: 20 }, { InputEstInsurance: 30 }] };
    });

    //No benefit plan
    it('should set validInsAmount to false when estimate is greater than charge or fee schedule', function () {
      var estimate = {
        InputEstInsurance: 1150,
        LatestEstInsurance: 15,
        validInsAmount: true,
      };

      scope.verifyMaxAmount('ins', estimate);

      expect(estimate.validInsAmount).toBe(false);
    });

    it('should set validInsAmount to true when estimate is less than charge and fee schedule', function () {
      var estimate = {
        InputEstInsurance: 10,
        LatestEstInsurance: 15,
        validInsAmount: false,
      };

      scope.verifyMaxAmount('ins', estimate);

      expect(estimate.validInsAmount).toBe(true);
    });

      it('should set validInsAmount correctly based on 2 decimal places', function () {
          scope.inputData = {
              Amount: 244.53,
              Fee: 271.70,
              Tax: 0,
              Discount: 27.17,
              TotalEstInsurance: 10,
              TotalAdjEstimate: 15,
              InsuranceEstimates: [
                  { EstInsurance: 10, AdjEst: 224.54, PatientBenefitPlanId: 1 }                  
              ],
          };
          var estimate = {
              InputEstInsurance: 19.99,
              LatestEstInsurance: 10,
              validInsAmount: false,
          };

          scope.verifyMaxAmount('ins', estimate);

          expect(estimate.validInsAmount).toBe(true);
      });
  });
});
