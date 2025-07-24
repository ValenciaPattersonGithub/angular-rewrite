describe('patient-insurance-info-controller tests -> ', function () {
  var modalInstance,
    timeout,
    businessCenterServices,
    patientServices,
    tabLauncher;
  var patientBenefitPlansFactory,
    patSharedServices,
    benefitPlansFactory,
    ctrl,
    scope,
    q,
    locationServices,
    featureFlagService,
    fuseFlag  ;
    var rootScope, localize, shareData, $httpParamSerializer;

  // mock localize
  var groupNumber = ' (Plan/Group Number: 7)';
  localize = {
    getLocalizedString: jasmine.createSpy().and.returnValue(groupNumber),
  };

  var listOfPlans = [
    { BenefitPlanId: 111, Name: 'BenefitPlan 111', CarrierId: 11 },
    { BenefitPlanId: 112, Name: 'BenefitPlan 112', CarrierId: 12 },
    { BenefitPlanId: 113, Name: 'BenefitPlan 113', CarrierId: 13 },
    { BenefitPlanId: 114, Name: 'BenefitPlan 114', CarrierId: 14 },
  ];

  var listOfPatientPlans = [
    {
      BenefitPlanId: 111,
      Priority: 1,
      $patientBenefitPlan: { Priority: 1 },
    },
    { BenefitPlanId: 112, Priority: 2, $patientBenefitPlan: { Priority: 2 } },
    { BenefitPlanId: 113, Priority: 3, $patientBenefitPlan: { Priority: 3 } },
    { BenefitPlanId: 114, Priority: 4, $patientBenefitPlan: { Priority: 4 } },
  ];

  var patient = { PatientId: 'ab73aac99833344' };

  var mockModalFactory = {
    CancelModal: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy(),
    }),
    Modal: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy(),
    }),
    };

  var mockClaimsService = {
    getClaimEntityByClaimId: jasmine.createSpy(
      'ClaimsService.getClaimEntityByClaimId'
    ),
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.filters'));
  beforeEach(
    module('Soar.Schedule', function ($provide) {
      $provide.value('ModalDataFactory', {});
    })
  );

  // Create spies for services
  beforeEach(
    module('Soar.Patient', function ($provide) {
      let mockAddPatientBenefitPlansModalService = {};
      $provide.value(
        'AddPatientBenefitPlansModalService',
        mockAddPatientBenefitPlansModalService
      );
      timeout = jasmine.createSpy();
      $provide.value('$timeout', timeout);

      locationServices = jasmine.createSpy();
      $provide.value('LocationServices', locationServices);

      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('ModalInstance', modalInstance);

      patientServices = {
        Patients: {
          get: jasmine.createSpy(),
        },
        PatientBenefitPlan: {
          get: jasmine.createSpy(),
        },
      };
      $provide.value('PatientServices', patientServices);

      businessCenterServices = {
        BenefitPlan: {
          get: jasmine.createSpy(),
        },
        Carrier: {
          get: jasmine.createSpy(),
        },
      };
      $provide.value('BusinessCenterServices', businessCenterServices);

      tabLauncher = {
        launchNewTab: jasmine.createSpy(),
      };
      $provide.value('tabLauncher', tabLauncher);

      $provide.value('ModalFactory', mockModalFactory);

      patientBenefitPlansFactory = {
        ResetPriority: jasmine.createSpy().and.returnValue({}),
        ReorderPriority: jasmine.createSpy().and.returnValue({}),
        SetPriorityLabels: jasmine.createSpy().and.returnValue({}),
        PatientBenefitPlansForAccount: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        PatientBenefitPlans: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        Update: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientBenefitPlansFactory', patientBenefitPlansFactory);

      benefitPlansFactory = {
        //BenefitPlans: jasmine.createSpy().and.returnValue({
        //    then: jasmine.createSpy()
        //}),
        BenefitPlans: jasmine
          .createSpy('benefitPlansFactory.BenefitPlans')
          .and.callFake(function () {
            var factoryDeferred = q.defer();
            factoryDeferred.resolve(1);
            return {
              result: factoryDeferred.promise,
              then: function () {},
            };
          }),
        Carriers: jasmine
          .createSpy('benefitPlansFactory.Carriers')
          .and.callFake(function () {
            var factoryDeferred = q.defer();
            factoryDeferred.resolve(1);
            return {
              result: factoryDeferred.promise,
              then: function () {},
            };
          }),
        //Carriers: jasmine.createSpy().and.returnValue({
        //    then: jasmine.createSpy()
        //}),
        FindBenefitPlan: jasmine.createSpy().and.returnValue({}),
        FindCarrier: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('BenefitPlansFactory', benefitPlansFactory);

      patSharedServices = {
        Format: {
          PatientName: jasmine.createSpy('Patient'),
        },
      };
      $provide.value('PatSharedServices', patSharedServices);
    })
  );

  // Create controller and scope
    beforeEach(inject(function ($rootScope, $controller, $q, _$httpParamSerializer_) {
    scope = $rootScope.$new();
    q = $q;
    rootScope = $rootScope;
    shareData = {};
    ctrl = $controller('PatientInsuranceInfoController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      $timeout: timeout,
      toastrFactory: _toastr_,
      localize: localize,
      ModalFactory: mockModalFactory,
      ClaimsService: mockClaimsService,
      ShareData: shareData,
      $httpParamSerializer = _$httpParamSerializer_,
      FeatureFlagService: featureFlagService,
      FuseFlag: fuseFlag
    });

    spyOn($httpParamSerializer, 'serialize').and.callFake(function (params) {
        return 'mockedParam=value';
    });

    scope.patientFromHeader = patient;
    scope.patient = patient;
    scope.filterObject = {
      members: ['ab73aac99833344'],
      dateRange: {
        start: null,
        end: null,
      },
      teethNumbers: [],
      transactionTypes: null,
      providers: null,
      locations: null,
      IncludePaidTransactions: true,
      IncludeUnpaidTransactions: true,
      IncludeUnappliedTransactions: true,
      IncludeAppliedTransactions: true,
    };
  }));

  describe('ctrl.getPatient function ->', function () {
    it('should call patientServices.Patients.get', function () {
      ctrl.getPatient(1);

      expect(patientServices.Patients.get).toHaveBeenCalled();
    });
  });

  describe('ctrl.getPatientBenefitPlans function ->', function () {
    it('should call patientBenefitPlansFactory.PatientBenefitPlansForAccount if not individual account', function () {
      scope.IsIndividualAccount = false;
      scope.benefitPlans = [];
      scope.$parent = rootScope.$new();
      scope.$parent.patient = { Data: { PersonAccount: { AccountId: 2 } } };

      ctrl.getPatientBenefitPlans(1);
      expect(scope.tileSort).toBe('SubTitle');
      expect(
        patientBenefitPlansFactory.PatientBenefitPlansForAccount
      ).toHaveBeenCalledWith(2);
    });
    it('should call patientBenefitPlansFactory.PatientBenefitPlans if individual account', function () {
      scope.IsIndividualAccount = true;
      scope.benefitPlans = [];

      ctrl.getPatientBenefitPlans(1);
      expect(scope.tileSort).toBe('Priority');
      expect(
        patientBenefitPlansFactory.PatientBenefitPlans
      ).toHaveBeenCalledWith(1, true);
    });
  });

  describe('ctrl.applyAccountMemberFilter ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'doneDelay');
    });
    it('should set option variables to false when subset is selected', function () {
      scope.accountMembersOptionsTemp = [
        { PersonId: 2, AccountMemberId: 200 },
        { PersonId: 3, AccountMemberId: 300 },
        { PersonId: 4, AccountMemberId: 400 },
      ];
      scope.filterObject.members = ['2', '3'];
      ctrl.applyAccountMemberFilter();
      expect(scope.showAddDocuments).toBe(false);
      expect(scope.showEligibility).toBe(false);
      expect(scope.IsIndividualAccount).toBe(false);
      expect(scope.insuranceInfoTiles).toEqual([]);
      expect(ctrl.doneDelay).toHaveBeenCalled();
    });
    it('should set option variables to true when one acct member is selected', function () {
      scope.accountMembersOptionsTemp = [
        { PersonId: 2, AccountMemberId: 200 },
        { PersonId: 3, AccountMemberId: 300 },
        { PersonId: 4, AccountMemberId: 400 },
      ];
      scope.filterObject.members = ['2'];
      ctrl.applyAccountMemberFilter();
      expect(scope.showAddDocuments).toBe(true);
      expect(scope.showEligibility).toBe(true);
      expect(scope.IsIndividualAccount).toBe(true);
      expect(scope.insuranceInfoTiles).toEqual([]);
      expect(ctrl.doneDelay).toHaveBeenCalled();
    });
    it('should set option variables to false when all is selected', function () {
      scope.accountMembersOptionsTemp = [
        { PersonId: 2, AccountMemberId: 200 },
        { PersonId: 3, AccountMemberId: 300 },
        { PersonId: 4, AccountMemberId: 400 },
      ];
      scope.filterObject.members = '0';
      ctrl.applyAccountMemberFilter();
      expect(scope.showAddDocuments).toBe(false);
      expect(scope.showEligibility).toBe(false);
      expect(scope.IsIndividualAccount).toBe(false);
      expect(scope.insuranceInfoTiles).toEqual([]);
      expect(ctrl.doneDelay).toHaveBeenCalled();
    });
    it('should set option variables to true when all is selected when only one acct member', function () {
      scope.accountMembersOptionsTemp = [{ PersonId: 2, AccountMemberId: 200 }];
      scope.filterObject.members = '0';
      ctrl.applyAccountMemberFilter();
      expect(scope.showAddDocuments).toBe(true);
      expect(scope.showEligibility).toBe(true);
      expect(scope.IsIndividualAccount).toBe(true);
      expect(scope.insuranceInfoTiles).toEqual([]);
      expect(ctrl.doneDelay).toHaveBeenCalled();
    });
  });

  describe('ctrl.doneDelay function ->', function () {
    beforeEach(function () {
      scope.benefitPlans = [];
      ctrl.getPatient = jasmine.createSpy('getPatient').and.callThrough();
      ctrl.getPatientBenefitPlans = jasmine.createSpy('getPatientBenefitPlans');
      shareData.currentPatientId = 'ab73aac99833344';
      spyOn(ctrl, 'resetAllowSetPriority');
    });

    it('should call getPatient function with selected patient id if individual account selected', function () {
      scope.IsIndividualAccount = true;
      scope.filterObject.members = ['1'];
      ctrl.doneDelay();
      expect(ctrl.getPatient).toHaveBeenCalledWith('1');
      expect(ctrl.getPatientBenefitPlans).toHaveBeenCalledWith('1');
      expect(ctrl.resetAllowSetPriority).toHaveBeenCalled();
    });

    it('should call getPatient function with currentPatientId if all accounts selected', function () {
      scope.IsIndividualAccount = true;
      scope.filterObject.members = '0';
      ctrl.doneDelay();
      expect(ctrl.getPatient).toHaveBeenCalledWith('ab73aac99833344');
      expect(ctrl.getPatientBenefitPlans).toHaveBeenCalledWith(
        'ab73aac99833344'
      );
      expect(ctrl.resetAllowSetPriority).toHaveBeenCalled();
    });

    it('should call getPatientBenefitPlans if not individual account member', function () {
      scope.IsIndividualAccount = false;
      scope.benefitPlans = angular.copy(listOfPlans);
      ctrl.doneDelay();
      expect(ctrl.getPatient).not.toHaveBeenCalled();
      expect(ctrl.getPatientBenefitPlans).toHaveBeenCalled();
      expect(ctrl.resetAllowSetPriority).toHaveBeenCalled();
    });

    it('should not call getPatientBenefitPlans if account member filter is undefined', function () {
      scope.filterObject.members = undefined;
      ctrl.doneDelay();
      expect(ctrl.getPatientBenefitPlans).not.toHaveBeenCalled();
      expect(ctrl.resetAllowSetPriority).toHaveBeenCalled();
    });
  });

  describe('loadPatientBenefitPlanToTiles function ->', function () {
    it('should call add a benefit plan to insuranceInfoTiles if BenefitPlanId not in list', function () {
      scope.insuranceInfoTiles = angular.copy(listOfPatientPlans);
      expect(scope.insuranceInfoTiles.length).toBe(4);
      var infoTile = {
        BenefitPlanId: 115,
        Priority: 5,
        $patientBenefitPlan: { Priority: 5 },
      };
      ctrl.loadPatientBenefitPlanToTiles(infoTile);
      expect(scope.insuranceInfoTiles.length).toBe(5);
    });

    it('should replace infoTile in insuranceInfoTiles if BenefitPlanId is already in list', function () {
      scope.insuranceInfoTiles = angular.copy(listOfPatientPlans);
      expect(scope.insuranceInfoTiles.length).toBe(4);
      var infoTile = {
        BenefitPlanId: 112,
        Priority: 2,
        $patientBenefitPlan: { Priority: 2 },
      };
      ctrl.loadPatientBenefitPlanToTiles(infoTile);
      expect(scope.insuranceInfoTiles.length).toBe(4);
    });
  });

  describe('watch insuranceInfoTiles -> ', function () {
    it('should call patientBenefitPlansFactory.SetPriorityLabels if insuranceInfoTiles change', function () {
      scope.insuranceInfoTiles = [];
      scope.$digest();
      scope.insuranceInfoTiles = angular.copy(listOfPatientPlans);
      scope.$digest();
      expect(patientBenefitPlansFactory.SetPriorityLabels).toHaveBeenCalledWith(
        scope.insuranceInfoTiles
      );
    });
  });

  describe('resetPriority function ->', function () {
    it('should call patientBenefitPlansFactory.ResetPriority', function () {
      scope.insuranceInfoTiles = [];
      var e = { oldIndex: 1, newIndex: 2 };
      ctrl.resetPriority(e);
      expect(patientBenefitPlansFactory.ResetPriority).toHaveBeenCalledWith(
        scope.insuranceInfoTiles,
        e.oldIndex,
        e.newIndex
      );
    });

    it('should call patientBenefitPlansFactory.SetPriorityLabels', function () {
      scope.insuranceInfoTiles = [];
      var e = { oldIndex: 1, newIndex: 2 };
      ctrl.resetPriority(e);
      expect(patientBenefitPlansFactory.SetPriorityLabels).toHaveBeenCalledWith(
        scope.insuranceInfoTiles
      );
    });
  });

  describe('resetPriority function ->', function () {
    it('should call patientBenefitPlansFactory.ResetPriority', function () {
      scope.insuranceInfoTiles = [];
      var e = { oldIndex: 1, newIndex: 2 };
      ctrl.resetPriority(e);
      expect(patientBenefitPlansFactory.ResetPriority).toHaveBeenCalledWith(
        scope.insuranceInfoTiles,
        e.oldIndex,
        e.newIndex
      );
    });

    it('should call patientBenefitPlansFactory.SetPriorityLabels', function () {
      scope.insuranceInfoTiles = [];
      var e = { oldIndex: 1, newIndex: 2 };
      ctrl.resetPriority(e);
      expect(patientBenefitPlansFactory.SetPriorityLabels).toHaveBeenCalledWith(
        scope.insuranceInfoTiles
      );
    });
  });

  describe('ctrl.calcNextAvailablePriority ->', function () {
    it('should calculate next available priority based on max benefit plans priority', function () {
      scope.insuranceInfoTiles = [{ $patientBenefitPlan: { Priority: 0 } }];
      var returnedValue = ctrl.calcNextAvailablePriority();
      expect(returnedValue).toBe(1);

      scope.insuranceInfoTiles = [
        { $patientBenefitPlan: { Priority: 0 } },
        { $patientBenefitPlan: { Priority: 1 } },
      ];
      returnedValue = ctrl.calcNextAvailablePriority();
      expect(returnedValue).toBe(2);
    });
  });

  /*
        // create merged Priority labels for 'All' Account Members
        ctrl.createMergedPriorityLabels = function (patientBenefitPlans, infoTile) {
            var label0 = '';
            var label1 = '';
            var label2 = '';
            var label3 = '';
            var label4 = '';
            var label5 = '';
    
            patientBenefitPlans = $filter('orderBy')(patientBenefitPlans, 'PatientBenefitPlanDto.Priority');
            var localizedFor = localize.getLocalizedString(' for: ')
    
            infoTile.MergedPriorityLabel = '';
            angular.forEach(patientBenefitPlans, function (plan) {
                if (plan.$benefitPlan.BenefitId === infoTile.$patientBenefitPlan.BenefitPlanId) {
    
                    var policyHolderName = $filter('getPatientNameAsPerBestPractice')(plan.PatientLiteDto);
    
                    switch (plan.PatientBenefitPlanDto.Priority) {
                        case 0:
                            if (label0.indexOf(policyHolderName) === -1) {
                                label0 += (label0 === '') ? plan.PatientBenefitPlanDto.PriorityLabel +localizedFor +policyHolderName + ', ': policyHolderName + ', ';
                            }
                            break;
                        case 1:
                            if (label1.indexOf(policyHolderName) === -1) {
                                label1 += (label1 === '') ? plan.PatientBenefitPlanDto.PriorityLabel + localizedFor + policyHolderName + ', ' : policyHolderName + ', ';
                            }
                            break;
                        case 2:
                            if (label2.indexOf(policyHolderName) === -1) {
                                label2 += (label2 === '') ? plan.PatientBenefitPlanDto.PriorityLabel + localizedFor + policyHolderName + ', ' : policyHolderName + ', ';
                            }
                            break;
                        case 3:
                            if (label3.indexOf(policyHolderName) === -1) {
                                label3 += (label3 === '') ? plan.PatientBenefitPlanDto.PriorityLabel + localizedFor + policyHolderName + ', ' : policyHolderName + ', ';
                            }   break;
                        case 4:
                            if (label4.indexOf(policyHolderName) === -1) {
                                label4 += (label4 === '') ? plan.PatientBenefitPlanDto.PriorityLabel + localizedFor + policyHolderName + ', ' : policyHolderName + ', ';
                            }   break;
                        case 5:
                            if (label5.indexOf(policyHolderName) === -1) {
                                label5 += (label5 === '') ? plan.PatientBenefitPlanDto.PriorityLabel + localizedFor + policyHolderName + ', ' : policyHolderName + ', ';
                            }   break;
                    }
                }
    
            })
            infoTile.MergedPriorityLabel = label0 +label1 +label2 +label3 +label4 +label5;
            // remove trailing comma        
            if (infoTile.MergedPriorityLabel.slice(-2) == ", ") {
                infoTile.MergedPriorityLabel = infoTile.MergedPriorityLabel.slice(0, -2)+"";
            }
        }*/
  describe('ctrl.createMergedPriorityLabels ->', function () {
    it('should create merged priority label based on patient benefit plan', function () {
      //var patientBenefitPlans = angular.copy(listOfPatientPlans)
      //scope.IsIndividualAccount = true;
      //var nextPriority=0
      //var nextId = 111
      //angular.forEach(patientBenefitPlans, function (patientBenefitPlan) {
      //    patientBenefitPlan.$benefitPlan = {}
      //    patientBenefitPlan.PatientBenefitPlanDto = {}
      //    patientBenefitPlan.PatientBenefitPlanDto.Priority = nextPriority
      //    nextPriority+=1
      //    patientBenefitPlan.$benefitPlan.BenefitId = nextId
      //    nextId += 1
      //    patientBenefitPlan.PatientLiteDto = { FirstName: 'Bob', LastName: 'Jones' }
      //    beforeEach(inject(function ($filter) {
      //        filter = $filter('getPatientNameAsPerBestPractice');
      //    }));
      //    spyOn(filter, 'getPatientNameAsPerBestPractice').and.returnedValue('Bob Jones')
      //    //var policyHolderName = $filter('getPatientNameAsPerBestPractice') (plan.PatientLiteDto);
      //})
      //scope.insuranceInfoTiles = [{ $patientBenefitPlan: { BenefitPlanId: 111, Priority: 0 } }, { $patientBenefitPlan: { BenefitPlanId: 112, Priority: 1 } }]
      //debugger
      //returnedValue = ctrl.createMergedPriorityLabels(patientBenefitPlans, scope.insuranceInfoTiles[0])
      //expect(returnedValue).toBe(2)
    });
  });

  /*
    if (newPatientBenefitPlan.PolicyHolderBenefitPlanDto && newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto) {
            carrierName = newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.CarrierName ? newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.CarrierName: '';
            benefitPlanName = newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Name ? newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Name : '';
            renewalMonth = listHelper.findItemByFieldValue($scope.months, 'Value', newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.RenewalMonth);
            planGroupNumber = newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.PlanGroupNumber ? newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.PlanGroupNumber : "";
        }*/

  describe('ctrl.getSubTitle ->', function () {
    it('should create subtitle based on patient benefit plan', function () {
      var patientBenefitPlan = {
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: {
            CarrierName: 'Best Carrier',
            Name: 'Best Benefit Plan',
            PlanGroupNumber: '7',
          },
        },
      };
      var subtitle = ctrl.getSubTitle(patientBenefitPlan);
      expect(subtitle).toEqual(
        'Best Carrier - Best Benefit Plan (Plan/Group Number: 7)'
      );
    });

    it('should create subtitle with no GroupNumber if none in patient benefit plan', function () {
      var patientBenefitPlan = {
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: {
            CarrierName: 'Best Carrier',
            Name: 'Best Benefit Plan',
            PlanGroupNumber: null,
          },
        },
      };
      var subtitle = ctrl.getSubTitle(patientBenefitPlan);
      expect(subtitle).toEqual('Best Carrier - Best Benefit Plan');
    });

    it('should create subtitle with No Carrier Assigned and Benefit Plan Name if no Carrier Name', function () {
      var patientBenefitPlan = {
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: {
            CarrierName: null,
            Name: 'Best Benefit Plan',
            PlanGroupNumber: null,
          },
        },
      };
      var subtitle = ctrl.getSubTitle(patientBenefitPlan);
      expect(subtitle).toEqual('No Carrier Assigned - Best Benefit Plan');
    });
  });

  describe('scope.allowSetPriority ->', function () {
    it('should set canChangePriority to true if it was false and reset label ', function () {
      scope.resetPriorityLabel = 'Re-Prioritize Benefit Plans';
      scope.canChangePriority = false;
      spyOn(ctrl, 'getDependentsSuccess').and.returnValue(function () {});
      scope.allowSetPriority();
      expect(ctrl.getDependentsSuccess).toHaveBeenCalled();
    });

    it('should set canChangePriority to false if it was true and reset label ', function () {
      scope.resetPriorityLabel = 'Done with Re-Prioritize Benefit Plans';
      scope.canChangePriority = true;
      scope.allowSetPriority();
      expect(scope.canChangePriority).toBe(false);
      expect(scope.resetPriorityLabel).toEqual('Re-Prioritize Benefit Plans');
    });
  });

  describe('ctrl.resetAllowSetPriority ->', function () {
    it('should reset the resetPriorityLevel Button text and set canChangePriority to false ', function () {
      scope.canChangePriority = true;
      ctrl.resetAllowSetPriority();
      expect(scope.canChangePriority).toBe(false);
      expect(scope.resetPriorityLabel).toEqual('Re-Prioritize Benefit Plans');
    });
  });

  describe('ctrl.createInfoTile ->', function () {
    it('should set IndividualAnnualMaxRemaining correctly', function () {
      scope.IsIndividualAccount = true;
      let patientBenefitPlan = {
        AdditionalBenefits: 200,
        IndividualMaxUsed: 400,
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: {
            AnnualBenefitMaxPerIndividual: 1000,
            },         
          },
          PolicyHolderDetails: {
              DateOfBirth: null
          }
      };

      let result = ctrl.createInfoTile(patientBenefitPlan);

      expect(result.IndividualAnnualMaxRemaining).toEqual(800);
    });
  });
});
