import { of } from 'rsjs';

describe('dental-benefit-crud-controller tests -> ', function () {
    var scope,
        routeParams,
        ctrl,
        q,
        timeout,
        benefitPlanBeingEdited,
        businessCenterServices,
        modalFactory,
        listHelper,
        tabLauncher,
        referenceDataService,
        patientServices,
        paymentTypesService,
        adjustmentTypesService,
        modalFactoryDeferred,
        anchorScroll,
        refServiceCodes,
        locationMock,
        mockTeamMemberIdentifierService,
        mockLocationIdentifierService,
        featureFlagService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  // Create spies for services
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {

      mockTeamMemberIdentifierService = {
        get: jasmine.createSpy().and.callFake(function () {
          return { then: jasmine.createSpy() };
        }),
      };
    
      mockLocationIdentifierService = {
        get: jasmine.createSpy().and.callFake(function () {
          return { then: jasmine.createSpy() };
        }),
      };
    
      paymentTypesService = {
        getAllPaymentTypesMinimal: function () {
          return {
            then: (res, error) => {
              res({ Value: [] }),
                error({})
            }
          }
        }
      };

      adjustmentTypesService = {
        GetAllAdjustmentTypesWithOutCheckTransactions: jasmine
          .createSpy()
          .and.returnValue({
            then: function () {},            
          }),
      };

      //mock for location
      locationMock = {
        path: jasmine.createSpy('$location.path').and.callFake(function () {  
        }),
      };

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('FeatureFlagService', featureFlagService);

      timeout = jasmine.createSpy();
      $provide.value('$timeout', timeout);

      benefitPlanBeingEdited = {};
      $provide.value('BenefitPlan', benefitPlanBeingEdited);

      businessCenterServices = {
        BenefitPlan: {
          get: jasmine.createSpy('get').and.returnValue({
            $promise: {
              then: function () { },
            },
          }),
          update: jasmine.createSpy('update'),
          save: jasmine.createSpy('save'),
          findDuplicates: jasmine.createSpy(),
          hasUnsubmittedClaims: jasmine.createSpy(),
        },
        Carrier: {
          getActive: jasmine.createSpy(),
          get: jasmine.createSpy().and.returnValue({
            $promise: {
              then: function () { },
            },
          }),
        },
      };
      $provide.value('BusinessCenterServices', businessCenterServices);

      modalFactory = {
        Modal: jasmine
          .createSpy('modalFactory.Modal')
          .and.callFake(function () {
            modalFactoryDeferred = q.defer();
            modalFactoryDeferred.resolve(1);
            return {
              result: modalFactoryDeferred.promise,
              then: function () { },
            };
          }),
      };
      $provide.value('ModalFactory', modalFactory);

      listHelper = {
        findItemByFieldValue: jasmine.createSpy().and.returnValue({}),
        findIndexByFieldValue: jasmine.createSpy().and.returnValue(0),
      };
      $provide.value('ListHelper', listHelper);

      tabLauncher = {
        launchNewTab: jasmine.createSpy(),
      };
      $provide.value('tabLauncher', tabLauncher);

      referenceDataService = {
        get: jasmine.createSpy(),
        entityNames: {
          serviceTypes: 'serviceTypes',
          serviceCodes: 'serviceCodes',
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      patientServices = {
        PatientBenefitPlan: {
          getDependentsForBenefitPlan: jasmine.createSpy(),
        },
      };
      $provide.value('PatientServices', patientServices);

      anchorScroll = jasmine.createSpy();
      $provide.value('$anchorScroll', anchorScroll);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $q, $controller) {
    scope = $rootScope.$new();
    routeParams = {};
    q = $q;
    refServiceCodes = [];
    ctrl = $controller('BenefitPlanCrudController', {
      $scope: scope,
      $routeParams: routeParams,
      $timeout: timeout,
      $location: locationMock,
      TeamMemberIdentifierService: mockTeamMemberIdentifierService,
      LocationIdentifierService: mockLocationIdentifierService,
      toastrFactory: _toastr_,
      NewPaymentTypesService: paymentTypesService,
      NewAdjustmentTypesService: adjustmentTypesService,
      $anchorScroll: anchorScroll,
      serviceCodes: refServiceCodes
    });
  }));

  it('should initialize the controller', function () {
    expect(ctrl).not.toBeNull();
    expect(scope.calculationMethods[0]).toBe('Traditional');
    expect(scope.calculationMethods[1]).toBe('Do Not Estimate');
    expect(scope.calculationMethodDescriptions[0]).toBe(
      'Traditional coordination of benefits allows the beneficiary to receive up to 100% of expenses from a combination of the primary and secondary plans'
    );
    expect(scope.calculationMethodDescriptions[1]).toBe('');
    expect(scope.calculationMethodsOptions[0]).toBe(1);
    expect(scope.calculationMethodsOptions[1]).toBe(4);
  });

  describe('benefitPlan.ClaimMethod watcher ->', function () {
    beforeEach(inject(function () {
      scope.benefitPlan = {
        ClaimMethod: '1',
        SubmitClaims: undefined,
      };
      scope.$apply();
      spyOn(ctrl, 'toggleTrackClaims');
    }));

    it('should set benefitPlan.SubmitClaims to false and call ctrl.toggleTrackClaims when new value is null', function () {
      scope.benefitPlan.ClaimMethod = null;
      scope.$apply();

      expect(scope.benefitPlan.SubmitClaims).toEqual(false);
      expect(ctrl.toggleTrackClaims).toHaveBeenCalled();
    });

    it('should set benefitPlan.SubmitClaims to true and call ctrl.toggleTrackClaims when new value is not null', function () {
      scope.benefitPlan.ClaimMethod = '2';
      scope.$apply();

      expect(scope.benefitPlan.SubmitClaims).toEqual(true);
      expect(ctrl.toggleTrackClaims).toHaveBeenCalled();
    });
  });

  describe('save function ->', function () {
    beforeEach(inject(function () {
      scope.selectedCarrier = true;
    }));

    it('should call businessCenterServices.BenefitPlan.update if editing a benefit plan', function () {
      scope.editing = true;
      ctrl.validate = jasmine.createSpy('validate').and.returnValue(true);
      var benefitPlan = { ZipCode: null };
      scope.save(benefitPlan);

      expect(businessCenterServices.BenefitPlan.update).toHaveBeenCalled();
    });

    it('should call businessCenterServices.BenefitPlan.save if not editing a benefit plan', function () {
      scope.editing = false;
      ctrl.validate = jasmine.createSpy('validate').and.returnValue(true);
      var benefitPlan = { ZipCode: null };
      scope.save(benefitPlan);

      expect(businessCenterServices.BenefitPlan.save).toHaveBeenCalled();
    });

    it('should call businessCenterServices.BenefitPlan.hasUnsubmittedClaims', function () {
      scope.editing = true;
      ctrl.validate = jasmine.createSpy('validate').and.returnValue(true);
      ctrl.originalBenefitPlan.CarrierId =
        '00000000-0000-0000-0000-000000000000';
      var benefitPlan = {
        CarrierId: '11111111-1111-1111-1111-111111111111',
        ZipCode: null,
      };
      scope.save(benefitPlan);

      expect(
        businessCenterServices.BenefitPlan.hasUnsubmittedClaims
      ).toHaveBeenCalled();
    });

    it('should change tax calculation to "1" if set to "2" without a fee schedule', function () {
      ctrl.validate = jasmine.createSpy('validate').and.returnValue(true);
      var benefitPlan = {
        FeeScheduleId: '',
        TaxCalculation: 2,
      };
      scope.save(benefitPlan);

      expect(scope.benefitPlan.TaxCalculation).toBe(1);
    });

    it('should set disableSaveButton to true if validate returns true', function () {
      ctrl.validate = jasmine.createSpy('validate').and.returnValue(true);
      var benefitPlan = {
        FeeScheduleId: '',
        TaxCalculation: 2,
      };
      scope.save(benefitPlan);
      expect(scope.disableSaveButton).toBe(true);
    });

    it('should set disableSaveButton to false if validate returns false', function () {
      ctrl.validate = jasmine.createSpy('validate').and.returnValue(false);
      var benefitPlan = {
        FeeScheduleId: '',
        TaxCalculation: 2,
      };
      scope.save(benefitPlan);
      expect(scope.disableSaveButton).toBe(false);
    });
  });

  describe('copyPlan ->', function () {
    it('should call tab launcher', function () {
      var benefitPlan = {
        BenefitId: '00000000-0000-0000-0000-000000000000',
      };
      scope.copyPlan(benefitPlan);

      expect(tabLauncher.launchNewTab).toHaveBeenCalled();
    });
  });

  describe('findDuplicates ->', function () {
    var benefitPlan;

    beforeEach(function () {
      benefitPlan = {
        Name: 'Some Benefit Plan',
        planGroupNumber: 'Some Group Number',
        BenefitId: 'Some Benefit Plan Id',
      };

      ctrl.clearDuplicates = jasmine.createSpy();
    });

    it('should clear the existing list of duplicates', function () {
      ctrl.findDuplicates(benefitPlan);

      expect(ctrl.clearDuplicates).toHaveBeenCalled();
    });

    it('should send a request to find the list of duplicates', function () {
      var params = {
        name: benefitPlan.Name,
        planGroupNumber: benefitPlan.PlanGroupNumber,
        excludeId: benefitPlan.BenefitId,
      };

      ctrl.findDuplicates(benefitPlan);

      expect(
        businessCenterServices.BenefitPlan.findDuplicates
      ).toHaveBeenCalledWith(
        params,
        ctrl.findDuplicatesSuccess,
        ctrl.findDuplicatesFailed
      );
    });

    it('should NOT send a request if the benefitPlan null', function () {
      benefitPlan = null;

      ctrl.findDuplicates(benefitPlan);

      expect(
        businessCenterServices.BenefitPlan.findDuplicates
      ).not.toHaveBeenCalled();
    });

    it('should NOT send a request if the benefitPlan does not have a Name or PayerId specified', function () {
      benefitPlan.Name = '';
      benefitPlan.PlanGroupNumber = '';

      ctrl.findDuplicates(benefitPlan);

      expect(
        businessCenterServices.BenefitPlan.findDuplicates
      ).not.toHaveBeenCalled();
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

  describe('initialize function ->', function () {
    it('should call businessCenterServices.BenefitPlan.get', function () {
      routeParams.guid = '1';
      scope.initialize();
      expect(businessCenterServices.BenefitPlan.get).toHaveBeenCalled();
    });

    it('should call businessCenterServices.BenefitPlan.get when isCopy is true', function () {
      routeParams.guid = '1';
      routeParams.isCopy = true;
      scope.initialize();
      expect(businessCenterServices.BenefitPlan.get).toHaveBeenCalled();
    });

    it('should call businessCenterServices.BenefitPlan.get when isCopy is false', function () {
      routeParams.guid = '1';
      scope.initialize();
      expect(businessCenterServices.BenefitPlan.get).toHaveBeenCalled();
    });

    it('should call paymentTypesService.getAllPaymentTypesMinimal', function () {
      spyOn(paymentTypesService, 'getAllPaymentTypesMinimal').and.returnValue(Promise.resolve({ Value: [] }));
      scope.initialize();
      expect(paymentTypesService.getAllPaymentTypesMinimal).toHaveBeenCalled();
    });

    it('should call adjustmentTypesService.GetAllAdjustmentTypesWithOutCheckTransactions with active=true', function () {
      scope.initialize();
      expect(
        adjustmentTypesService.GetAllAdjustmentTypesWithOutCheckTransactions
      ).toHaveBeenCalledWith({ active: true });
    });

    it('should set $scope.copying == true and $scope.editing == false', function () {
      routeParams.isCopy = true;
      routeParams.guid = '00000000-0000-0000-0000-000000000000';
      scope.initialize();
      expect(scope.copying).toBe(true);
      expect(scope.editing).toBe(false);
    });

    it('should set $scope.copying == false and $scope.editing == true', function () {
      routeParams.isCopy = false;
      routeParams.guid = '00000000-0000-0000-0000-000000000000';
      scope.initialize();
      expect(scope.copying).toBe(null);
      expect(scope.editing).toBe(true);
    });
  });

  describe('toggleTrackClaims function ->', function () {
    it('should set benefitPlan.TrackClaims to true when in create mode and benefitPlan.ClaimMethod exists', function () {
      scope.editing = false;
      scope.benefitPlan = {
        TrackClaims: undefined,
        ClaimMethod: '1',
      };

      ctrl.toggleTrackClaims();

      expect(scope.benefitPlan.TrackClaims).toEqual(true);
    });

    it('should set benefitPlan.TrackClaims to null when in create mode and benefitPlan.ClaimMethod does not exists', function () {
      scope.editing = false;
      scope.benefitPlan = {
        TrackClaims: undefined,
        ClaimMethod: null,
      };

      ctrl.toggleTrackClaims();

      expect(scope.benefitPlan.TrackClaims).toBeNull();
    });

    it('should set benefitPlan.TrackClaims to originalBenefitPlan.TrackClaims when in edit mode, benefitPlan.ClaimMethod and originalBenefitPlan.TrackClaims exists, and benefitPlan.TrackClaims is null', function () {
      scope.editing = true;
      scope.benefitPlan = {
        TrackClaims: null,
        ClaimMethod: '1',
      };
      ctrl.originalBenefitPlan = { TrackClaims: false };

      ctrl.toggleTrackClaims();

      expect(scope.benefitPlan.TrackClaims).toEqual(
        ctrl.originalBenefitPlan.TrackClaims
      );
    });

    it('should set benefitPlan.TrackClaims to true when in edit mode, benefitPlan.ClaimMethod exists, and benefitPlan.TrackClaims and originalBenefitPlan.TrackClaims are null', function () {
      scope.editing = true;
      scope.benefitPlan = {
        TrackClaims: null,
        ClaimMethod: '1',
      };
      ctrl.originalBenefitPlan = { TrackClaims: null };

      ctrl.toggleTrackClaims();

      expect(scope.benefitPlan.TrackClaims).toEqual(true);
    });

    it('should set benefitPlan.TrackClaims to null when in edit mode and benefitPlan.ClaimMethod does not exists', function () {
      scope.editing = true;
      scope.benefitPlan = {
        TrackClaims: undefined,
        ClaimMethod: null,
      };
      ctrl.originalBenefitPlan = { TrackClaims: false };

      ctrl.toggleTrackClaims();

      expect(scope.benefitPlan.TrackClaims).toBeNull();
    });
  });

  describe('ctrl.getInsurancePaymentTypesSuccess function ->', function () {
    it('should set $scope.insurancePaymentTypes = response.Value;    ', function () {
      var response = {
        Value: 'mock',
      };
      ctrl.getInsurancePaymentTypesSuccess(response);
      expect(scope.insurancePaymentTypes).toBe('mock');
    });
  });

  describe('ctrl.getInsurancePaymentTypesFailure ->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.getInsurancePaymentTypesFailure();
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('ctrl.getAllAdjustmentTypesFailure ->', function () {
    it('should call toastrFactory.error', function () {
      ctrl.getAllAdjustmentTypesFailure();
      expect(_toastr_.error).toHaveBeenCalled();
    });
  });

  describe('ctrl.getAllAdjustmentTypesSuccess ->', function () {
    it('scope.negativeAdjustmentTypes.length should be 1', function () {
      var response = {
        Value: [
          {
            IsPositive: true,
          },
          {
            IsPositive: false,
          },
        ],
      };

      ctrl.getAllAdjustmentTypesSuccess(response);
      expect(scope.negativeAdjustmentTypes.length).toBe(1);
    });
  });

  describe('scope.addServiceCodeException ->', function () {
    it('should call modalFactory for serviceCodeExceptionModal', function () {
      scope.addServiceCodeException();
      expect(modalFactory.Modal).toHaveBeenCalled();
    });
  });

  describe('ctrl.removeServiceCodeException ->', function () {
    it('should make scope.benefitPlan.ServiceCodeExceptions.length one fewer', function () {
      scope.availableCodes = [];
      scope.benefitPlan = {
        ServiceCodeExceptions: [
          {
            ServiceCodeId: 1,
            SubmitOnInsurance: true,
            IsSwiftPickCode: false,
            CdtCodeId: 2,
            CompleteDescription: 'Description',
            Description: 'Something Else',
          },
          {
            ServiceCodeId: 2,
            SubmitOnInsurance: true,
            IsSwiftPickCode: false,
            CdtCodeId: 3,
            CompleteDescription: 'Description',
            Description: 'Something Else',
          },
        ],
      };
      var exception = {
        ServiceCodeId: 1,
        SubmitOnInsurance: true,
        IsSwiftPickCode: false,
        CdtCodeId: 2,
        CompleteDescription: 'Description',
        Description: 'Something Else',
      };
      expect(scope.availableCodes.length).toEqual(0);
      expect(scope.benefitPlan.ServiceCodeExceptions.length).toEqual(2);
      scope.removeServiceCodeException(exception);
      expect(scope.availableCodes.length).toEqual(0);
      expect(scope.benefitPlan.ServiceCodeExceptions.length).toEqual(1);
    });
  });

  describe('scope.checkTax ->', function () {
    it('should set the benefit plan tax properties to 1 when FeeScheduleId is empty', function () {
      scope.benefitPlan.FeeScheduleId = '';
      scope.checkTax();

      expect(scope.benefitPlan.TaxAssignment).toBe(1);
      expect(scope.benefitPlan.TaxCalculation).toBe(1);
    });

    it('should not reset the benefit plan tax properties to their original value when FeeScheduleId is not empty', function () {
      scope.benefitPlan.FeeScheduleId = 'aewkr8-o3a8er-hoiiae-w8e8w';
      scope.benefitPlan.TaxAssignment = 2;
      scope.benefitPlan.TaxCalculation = 3;
      scope.checkTax();
      expect(scope.benefitPlan.TaxAssignment).toBe(2);
      expect(scope.benefitPlan.TaxCalculation).toBe(3);
    });
  });

  describe('scope.doesNotHaveFeeSchedules ->', function () {
    it('sets scope.noFeeSchedules to true when editing, and there is no real fee schedule attached', function () {
      scope.selectedCarrier = {
        FeeScheduleList: [
          {
            FeeScheduleId: '00000000-0000-0000-0000-000000000000',
          },
        ],
      };

      scope.doesNotHaveFeeSchedules();

      expect(scope.noFeeSchedules).toBe(true);
    });

    it('sets scope.noFeeSchedules to true when adding a new plan', function () {
      scope.selectedCarrier = {
        FeeScheduleList: [
          {
            FeeScheduleId: '00000000-0000-0000-0000-000000000000',
          },
        ],
      };

      scope.doesNotHaveFeeSchedules();

      expect(scope.noFeeSchedules).toBe(true);
    });

    it('sets scope.noFeeSchedules to true when adding a new plan and the selected carrier is undefined', function () {
      scope.noFeeSchedules = false;
      scope.selectedCarrier = undefined;

      scope.doesNotHaveFeeSchedules();

      expect(scope.noFeeSchedules).toBe(true);
    });

    it('sets scope.noFeeSchedules to true when editing and the selected carrier is undefined', function () {
      scope.noFeeSchedules = false;
      scope.selectedCarrier = undefined;

      scope.doesNotHaveFeeSchedules();

      expect(scope.noFeeSchedules).toBe(true);
    });

    it('sets scope.noFeeSchedules to false when editing and there is one real fee schedule attached', function () {
      scope.noFeeSchedules = true;
      scope.selectedCarrier = {
        FeeScheduleList: [
          {
            FeeScheduleId: '00000000-1111-2222-3333-000000000000',
          },
        ],
      };
      scope.doesNotHaveFeeSchedules();

      expect(scope.noFeeSchedules).toBe(false);
    });

    it('sets scope.noFeeSchedules to false when adding a new plan and there is one real fee schedule attached', function () {
      scope.noFeeSchedules = true;
      scope.selectedCarrier = {
        FeeScheduleList: [
          {
            FeeScheduleId: '00000000-1111-2222-3333-000000000000',
          },
        ],
      };
      scope.doesNotHaveFeeSchedules();

      expect(scope.noFeeSchedules).toBe(false);
    });

    it('sets scope.noFeeSchedules to false when editing and there are more than one real fee schedule attached', function () {
      scope.noFeeSchedules = true;
      scope.selectedCarrier = {
        FeeScheduleList: [
          {
            FeeScheduleId: '00000000-1111-2222-3333-000000000000',
          },
          {
            FeeScheduleId: '00000000-2222-2222-3333-000000000000',
          },
        ],
      };
      scope.doesNotHaveFeeSchedules();

      expect(scope.noFeeSchedules).toBe(false);
    });

    it('sets scope.noFeeSchedules to false when adding a new plan and there are more than one real fee schedule attached', function () {
      scope.noFeeSchedules = true;
      scope.selectedCarrier = {
        FeeScheduleList: [
          {
            FeeScheduleId: '00000000-1111-2222-3333-000000000000',
          },
          {
            FeeScheduleId: '00000000-2222-2222-3333-000000000000',
          },
        ],
      };
      scope.doesNotHaveFeeSchedules();

      expect(scope.noFeeSchedules).toBe(false);
    });
  });

  describe('checkForDependents ->', function () {
    beforeEach(function () {
      spyOn(scope, 'save');
    });
    it('should set disableSaveButton to true', function () {      
      var benefitPlan = {
        FeeScheduleId: '',
        TaxCalculation: 2,
      };
      scope.checkForDependents(benefitPlan);
      expect(scope.disableSaveButton).toBe(true);
    });
  });
});
