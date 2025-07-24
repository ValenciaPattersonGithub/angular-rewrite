describe('financialServices tests ->', function () {
  // inject the service
  var financialService;

  //#region mocks

  var patientServices, toastrFactory, listHelper;

  var newEstimatedInsuranceObjectMock = {
    EstimatedInsuranceId: null,
    AccountMemberId: null,
    ServiceTransactionId: null,
    ServiceCodeId: null,
    Fee: null,
    EstInsurance: 0,
    IsUserOverRidden: false,
    DeductibleUsed: 0,
    CalculationDescription: '',
    ObjectState: null,
    FailedMessage: '',
  };

  var mockSaveStates = {
    None: 'None',
    Add: 'Add',
    Update: 'Update',
    Delete: 'Delete',
    Failed: 'Failed',
  };

  var mockServiceTransactions = [
    {
      DateEntered: '06/06/2015',
      InsuranceEstimates: [{ EstimatedAmount: 10.0 }],
      ValidDate: true,
      AffectedAreaId: 0,
      Tooth: 'a',
      Surface: 'b',
      ProviderUserId: 'c',
      Fee: 1,
      Selected: false,
    },
    {
      DateEntered: '06/05/2015',
      ValidDate: true,
      AffectedAreaId: 0,
      Tooth: 'a',
      Surface: 'b',
      ProviderUserId: 'c',
      Fee: 2,
      Selected: false,
    },
  ];

  var mockAccountBalances = [
    {
      Balance30: 300,
      Balance60: 600,
      Balance90: 900,
      Balance120: 0,
      BalanceCurrent: 100,
      BalanceInsurance: 0,
      EstimatedInsurance30: 30,
      EstimatedInsurance60: 60,
      EstimatedInsurance90: 90,
      EstimatedInsurance120: 0,
      EstimatedInsuranceCurrent: 10,
      AdjustedEstimate30: 50,
      AdjustedEstimate60: 50,
      AdjustedEstimate90: 50,
      AdjustedEstimateCurrent: 50,
      PersonId: '1',
    },
    {
      Balance30: 0,
      Balance60: 0,
      Balance90: 0,
      Balance120: 0,
      BalanceCurrent: 60,
      BalanceInsurance: 0,
      EstimatedInsurance30: 0,
      EstimatedInsurance60: 0,
      EstimatedInsurance90: 0,
      EstimatedInsurance120: 0,
      EstimatedInsuranceCurrent: 40,
      AdjustedEstimate30: 50,
      AdjustedEstimate60: 50,
      AdjustedEstimate90: 50,
      AdjustedEstimateCurrent: 50,
      PersonId: '2',
    },
  ];

  var mockServiceTransactionDtos = [
    {
      AccountMemberId: '123',
      Amount: 123,
      AppointmentId: '123',
      RelatedRecordId: '123',
      DateCompleted: new Date(),
      DateEntered: new Date(),
      Description: ' serviceTransaction.Description',
      Discount: 0,
      EncounterId: null,
      EnteredByUserId: '1125',
      Fee: 140,
      PriorFee: 0,
      LocationId: 1258,
      Note: 'serviceTransaction.Note',
      ProviderUserId: '3358',
      RejectedReason: 'serviceTransaction.RejectedReason',
      ServiceCodeId: '22358',
      ServiceTransactionId: '11258',
      ServiceTransactionStatusId: 11225,
      Surface: 'Surface',
      SurfaceSummaryInfo: 'SurfaceSummaryInfo',
      Roots: '',
      RootSummaryInfo: '',
      Tax: 0,
      Tooth: 'Tooth',
      TransactionTypeId: '123',
      ObjectState: 'None',
      FailedMessage: 'FailedMessage',
      Balance: 20,
      AgingDate: new Date(),
      ProposedAtLocationId: '123',
      InsuranceEstimates: [
        {
          EstimatedInsuranceId: '123',
          AccountMemberId: '123',
          EncounterId: '123',
          ServiceTransactionId: '123',
          ServiceCodeId: '123',
          PatientBenefitPlanId: '123',
          Fee: 100,
          EstInsurance: 82.4,
          IsUserOverRidden: false,
          FamilyDeductibleUsed: 0,
          IndividualDeductibleUsed: 0,
          CalculationDescription: 'InsuranceEstimate.Description',
          CalcWithoutClaim: false,
          PaidAmount: 0,
          ObjectState: null,
          FailedMessage: null,
          AdjEst: 0,
          AdjPaid: 0,
          AreBenefitsApplied: false,
          IsMostRecentOverride: false,
          AllowedAmountOverride: null,
          AllowedAmount: null,
          DataTag: '123',
          UserModified: '123',
          DateModified: '123',
          AllowedAmountDisplay: null,
        },
      ],
      TotalEstInsurance: 100,
      TotalInsurancePaidAmount: 20,
      TotalAdjEstimate: 20,
      TotalAdjPaidAmount: 20,
      TotalUnpaidBalance: 120,
      CreatedDate: new Date(),
      IsDeleted: false,
      IsBalanceAlreadyUpdated: false,
      IsForClosingClaim: false,
      PredeterminationHasResponse: false,
      IsDiscounted: false,
      ProviderOnClaimsId: '1234',
      IsOnInformedConsent: false,
      InsuranceOrder: 1,
      MasterDiscountTypeId: '1234',
      OldServiceTransactionId: '1234',
      AgingCategoryId: '1234',
      BypassSnapshotQueue: false,
      OnClaimBeingClosed: false,
      ProposedProviderId: '12345',
      DataTag: '12358',
      DateModified: new Date(),
      UserModified: '12347',
      $toothAreaData: '123',
    },
  ];

  //#endregion

  beforeEach(
    module('Soar.Common', function ($provide) {
      patientServices = {
        ServiceTransactions: {
          calculateInsuranceForTransactions: jasmine
            .createSpy()
            .and.returnValue({}),
        },
        PatientBenefitPlan: {
          get: jasmine.createSpy().and.returnValue({}),
        },
      };

      $provide.value('PatientServices', patientServices);

      $provide.value('SaveStates', mockSaveStates);

      listHelper = {
        findItemByFieldValue: jasmine.createSpy(),
      };

      $provide.value('ListHelper', listHelper);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function ($injector) {
    financialService = $injector.get('FinancialService');
  }));

  describe('CalculateServiceTransactionAmount ->', function () {
    it('should return zero if null is passed to the function', function () {
      var result = financialService.CalculateServiceTransactionAmount(null);

      expect(result).toEqual(0);
    });

    it("should calculate the service transactio's amount to be the fee + tax - discount", function () {
      var serviceTransaction = {
        Amount: 100,
        Fee: 200,
        Discount: 50,
        Tax: 75,
        Balance: 33,
      };

      var result =
        financialService.CalculateServiceTransactionAmount(serviceTransaction);

      expect(result).toEqual(
        serviceTransaction.Fee +
          serviceTransaction.Tax -
          serviceTransaction.Discount
      );
    });
  });

  describe('CalculateServiceTransactionBalance ->', function () {
    it('should return zero if null is passed to the function', function () {
      var result = financialService.CalculateServiceTransactionBalance(null);

      expect(result).toEqual(0);
    });

    it("should calculate the service transactio's amount to be the fee + tax - discount - estimated insurance", function () {
      var serviceTransaction = {
        Amount: 100,
        Fee: 200,
        Discount: 50,
        Tax: 75,
        Balance: 33,
        TotalEstInsurance: 225,
        InsuranceEstimates: [
          {
            EstInsurance: 225,
            AdjEst: 0,
          },
        ],
      };

      var result =
        financialService.CalculateServiceTransactionBalance(serviceTransaction);

      expect(result).toEqual(
        serviceTransaction.Fee +
          serviceTransaction.Tax -
          serviceTransaction.Discount -
          serviceTransaction.InsuranceEstimates[0].EstInsurance
      );
    });
  });

  describe('CanSubmitToInsurance ->', function () {
    var serviceTransactions, transaction, serviceCodes, code;

    beforeEach(function () {
      code = {
        ServiceCodeId: 'some code id',
        SubmitOnInsurance: true,
      };

      transaction = {
        ServiceCodeId: code.ServiceCodeId,
      };

      serviceTransactions = [transaction];
      serviceCodes = [code];

      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(code);
    });

    it('should return false when the list of service transactions is null', function () {
      var result = financialService.CanSubmitToInsurance(null, serviceCodes);

      expect(result).toEqual(false);
    });

    it('should return false when the list of service transactions is empty', function () {
      var result = financialService.CanSubmitToInsurance([], serviceCodes);

      expect(result).toEqual(false);
    });

    it('should return false when the list of service codes is null', function () {
      var result = financialService.CanSubmitToInsurance(
        serviceTransactions,
        null
      );

      expect(result).toEqual(false);
    });

    it('should return false when the list of service codes is empty', function () {
      var result = financialService.CanSubmitToInsurance(
        serviceTransactions,
        []
      );

      expect(result).toEqual(false);
    });

    it("should return false when the service transaction's code is not found in the service code list", function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(null);

      var result = financialService.CanSubmitToInsurance(
        serviceTransactions,
        serviceCodes
      );

      expect(result).toEqual(false);
    });

    it('should return true if at least one service transaction has a service code that has SubmitOnInsurance set to true.', function () {
      var result = financialService.CanSubmitToInsurance(
        serviceTransactions,
        serviceCodes
      );

      expect(result).toEqual(true);
    });
  });

  describe('CanSubmitClaimsOnInsurance ->', function () {
    var encounters, patientBenefitPlans, benefitPlans;

    var submittableEncounter,
      submittableEstimate,
      submittablePatientPlan,
      submittablePlan;

    var unsubmittableEncounter,
      unsubmittableEstimate,
      unsubmittablePatientPlan,
      unsubmittablePlan;

    beforeEach(function () {
      submittablePlan = {
        BenefitId: 'S_BP',
        SubmitClaims: true,
      };

      unsubmittablePlan = {
        BenefitId: 'U_BP',
        SubmitClaims: false,
      };

      benefitPlans = [submittablePlan, unsubmittablePlan];

      submittablePatientPlan = {
        PatientBenefitPlanId: 'S_PBP',
        BenefitPlanId: submittablePlan.BenefitId,
      };

      unsubmittablePatientPlan = {
        PatientBenefitPlanId: 'U_PBP',
        BenefitPlanId: unsubmittablePlan.BenefitId,
      };

      patientBenefitPlans = [submittablePatientPlan, unsubmittablePatientPlan];

      submittableEstimate = {
        PatientBenefitPlanId: submittablePatientPlan.PatientBenefitPlanId,
      };

      unsubmittableEstimate = {
        PatientBenefitPlanId: unsubmittablePatientPlan.PatientBenefitPlanId,
      };

      submittableEncounter = {
        ServiceTransactionDtos: [{ InsuranceEstimate: submittableEstimate }],
      };

      unsubmittableEncounter = {
        ServiceTransactionDtos: [{ InsuranceEstimate: unsubmittableEstimate }],
      };

      encounters = [submittableEncounter, unsubmittableEncounter];

      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.callFake(function (list, idField, id) {
          if (id == submittablePlan.BenefitId) {
            return submittablePlan;
          } else if (id == unsubmittablePlan.BenefitId) {
            return unsubmittablePlan;
          } else if (id == submittablePatientPlan.PatientBenefitPlanId) {
            return submittablePatientPlan;
          } else if (id == unsubmittablePatientPlan.PatientBenefitPlanId) {
            return unsubmittablePatientPlan;
          } else {
            return null;
          }
        });
    });

    it('should return true if at least one estimate is tied to a submittable plan', function () {
      var result = financialService.CanSubmitClaimsOnInsurance(
        encounters,
        patientBenefitPlans,
        benefitPlans
      );

      expect(result).toEqual(true);
    });
  });

  describe('ClearOverriddenEstiamtes ->', function () {
    var serviceTransactions,
      transaction1,
      transaction2,
      transaction3,
      insuranceEstimate1,
      insuranceEstimate2;

    beforeEach(function () {
      insuranceEstimate1 = {
        IndividualDeductibleUsed: 20,
        EstInsurance: 100,
        CalculationDescription: 'I overrode it. Sue me!',
        SubmitOnClaim: true,
        IsUserOverRidden: true,
      };

      insuranceEstimate2 = {
        IndividualDeductibleUsed: 20,
        EstInsurance: 100,
        CalculationDescription: 'Math is power!',
        IsUserOverRidden: false,
        SubmitOnClaim: false,
      };

      transaction1 = {
        InsuranceEstimate: insuranceEstimate1,
      };

      transaction2 = {
        InsuranceEstimate: insuranceEstimate2,
      };

      transaction3 = {
        InsuranceEstimate: null,
      };

      serviceTransactions = [transaction1, transaction2, transaction3];

      financialService.ClearOverriddenEstiamtes(serviceTransactions);
    });

    it("should set the InsuranceEstiamte's IsUserOverRidden property to false", function () {
      expect(transaction1.InsuranceEstimate.IsUserOverRidden).toEqual(false);
      expect(transaction2.InsuranceEstimate.IsUserOverRidden).toEqual(false);
    });

    it("should set the InsuranceEstiamte's EstInsurance and DeductibleUsed properties to 0", function () {
      expect(transaction1.InsuranceEstimate.EstInsurance).toEqual(0);
      expect(transaction2.InsuranceEstimate.EstInsurance).toEqual(100);
      expect(transaction1.InsuranceEstimate.IndividualDeductibleUsed).toEqual(
        0
      );
      expect(transaction2.InsuranceEstimate.IndividualDeductibleUsed).toEqual(
        20
      );
    });

    it("should clear the InsuranceEstiamte's CalculationDescription property", function () {
      expect(transaction1.InsuranceEstimate.CalculationDescription).toEqual('');
      expect(transaction2.InsuranceEstimate.CalculationDescription).toEqual(
        'Math is power!'
      );
    });
  });

  describe('CreateInsuranceEstimateObject ->', function () {
    it('should return an InsuranceEstimate object based on serviceTransaction ', function () {
      var serviceTransaction = mockServiceTransactions[0];
      var returnedValue =
        financialService.CreateInsuranceEstimateObject(serviceTransaction);

      expect(returnedValue[0].ServiceCodeId).toEqual(
        serviceTransaction.ServiceCodeId
      );
      expect(returnedValue[0].ServiceTransactionId).toEqual(
        serviceTransaction.ServiceTransactionId
      );
      expect(returnedValue[0].AccountMemberId).toEqual(
        serviceTransaction.AccountMemberId
      );
      expect(returnedValue[0].Fee).toEqual(serviceTransaction.Fee);
    });
  });

  describe('CreateOrCloneInsuranceEstimateObject ->', function () {
    it('should return InsuranceEstimate if not null', function () {
      var serviceTransaction = mockServiceTransactions[0];
      expect(
        financialService.CreateOrCloneInsuranceEstimateObject(
          serviceTransaction
        )
      ).toEqual(mockServiceTransactions[0].InsuranceEstimates);
    });

    it('should return new InsuranceEstimate object if null', function () {
      var serviceTransaction = mockServiceTransactions[1];
      var newInsuranceEstimate =
        financialService.CreateInsuranceEstimateObject(null);
      expect(
        financialService.CreateOrCloneInsuranceEstimateObject(
          serviceTransaction
        ).EstimatedInsuranceId
      ).toEqual(newInsuranceEstimate.EstimatedInsuranceId);
    });
  });

  describe('RecalculateInsurance ->', function () {
    it('should call patientServices.ServiceTransactions.calculateInsuranceForTransactions', function () {
      var serviceTransactions = angular.copy(mockServiceTransactions);
      angular.forEach(serviceTransactions, function (serviceTransaction) {
        serviceTransaction.saveStates = mockSaveStates.None;
      });
      financialService.RecalculateInsurance(serviceTransactions);
      expect(
        patientServices.ServiceTransactions.calculateInsuranceForTransactions
      ).toHaveBeenCalled();
    });
  });

  describe('calculateAccountAndInsuranceBalances ->', function () {
    it('should calculate account and insurance balances when PatientId IS NOT supplied', function () {
      var accountBalances = angular.copy(mockAccountBalances);
      var balances =
        financialService.calculateAccountAndInsuranceBalances(accountBalances);

      expect(balances.TotalBalance).toEqual(2590);
      expect(balances.TotalInsurance).toEqual(230);
      expect(balances.TotalPatientPortion).toEqual(2190 - 230);

      expect(balances.MoreThan30Balance).toEqual(300);
      expect(balances.MoreThan60Balance).toEqual(600);
      expect(balances.MoreThan90Balance).toEqual(900);
      expect(balances.CurrentBalance).toEqual(160);

      expect(balances.EstInsMoreThan30Balance).toEqual(30);
      expect(balances.EstInsMoreThan60Balance).toEqual(60);
      expect(balances.EstInsMoreThan90Balance).toEqual(90);
      expect(balances.EstInsCurrentBalance).toEqual(50);

      expect(balances.SelectedMemberBalance).toEqual(0);
      expect(balances.SelectedMemberInsurance).toEqual(0);
      expect(balances.SelectedMemberPatientPortion).toEqual(0);

      expect(balances.SelectedMemberAdjustedEstimate).toEqual(0);
      expect(balances.TotalAdjustedEstimate).toEqual(400);
    });

    it('should calculate account and insurance balances when PatientId IS supplied', function () {
      var accountBalances = angular.copy(mockAccountBalances);
      angular.forEach(accountBalances, function (item) {
        // TODO REMOVE THIS FOREACH this is just to get the variables into the list.  We need DB fields for these two
        item.SelectedAdjustedEstimate = 100;
        item.TotalAdjustedEstimate = 200;
      });
      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(accountBalances[0]);

      var balances = financialService.calculateAccountAndInsuranceBalances(
        accountBalances,
        '1'
      );

      expect(balances.TotalBalance).toEqual(2590);
      expect(balances.TotalInsurance).toEqual(230);
      expect(balances.TotalPatientPortion).toEqual(2190 - 230);

      expect(balances.MoreThan30Balance).toEqual(300);
      expect(balances.MoreThan60Balance).toEqual(600);
      expect(balances.MoreThan90Balance).toEqual(900);
      expect(balances.CurrentBalance).toEqual(160);

      expect(balances.EstInsMoreThan30Balance).toEqual(30);
      expect(balances.EstInsMoreThan60Balance).toEqual(60);
      expect(balances.EstInsMoreThan90Balance).toEqual(90);
      expect(balances.EstInsCurrentBalance).toEqual(50);

      expect(balances.SelectedMemberBalance).toEqual(2290);
      expect(balances.SelectedMemberInsurance).toEqual(190);
      expect(balances.SelectedMemberPatientPortion).toEqual(2090 - 190);

      expect(balances.SelectedMemberAdjustedEstimate).toEqual(200);
      expect(balances.TotalAdjustedEstimate).toEqual(400);
    });

    it('should return zero vaules for selectedMember when PatientId is zero', function () {
      var accountBalances = angular.copy(mockAccountBalances);

      var balances = financialService.calculateAccountAndInsuranceBalances(
        accountBalances,
        '0'
      );

      expect(balances.SelectedMemberBalance).toEqual(0);
      expect(balances.SelectedMemberInsurance).toEqual(0);
      expect(balances.SelectedMemberPatientPortion).toEqual(0);
    });
  });

  describe('CalculateAccountAgingGraphData ->', function () {
    it('should calculate account and insurance balances when PatientId and modifier ARE NOT supplied', function () {
      var accountBalances = angular.copy(mockAccountBalances);

      var graphData =
        financialService.CalculateAccountAgingGraphData(accountBalances);

      expect(graphData.moreThanThirtyBalance).toEqual(430);
      expect(graphData.moreThanSixtyBalance).toEqual(760);
      expect(graphData.moreThanNintyBalance).toEqual(1090);
      expect(graphData.currentBalance).toEqual(310);
    });

    it('should calculate account and insurance balances when PatientId IS Supplied and modifier IS NOT supplied', function () {
      var accountBalances = angular.copy(mockAccountBalances);

      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(accountBalances[0]);

      var graphData = financialService.CalculateAccountAgingGraphData(
        accountBalances,
        '1'
      );

      expect(graphData.moreThanThirtyBalance).toEqual(380);
      expect(graphData.moreThanSixtyBalance).toEqual(710);
      expect(graphData.moreThanNintyBalance).toEqual(1040);
      expect(graphData.currentBalance).toEqual(160);
    });

    it('should calculate account and insurance balances when PatientId IS Supplied and modifier IS supplied', function () {
      var accountBalances = angular.copy(mockAccountBalances);

      listHelper.findItemByFieldValue = jasmine
        .createSpy()
        .and.returnValue(accountBalances[0]);

      var graphData = financialService.CalculateAccountAgingGraphData(
        accountBalances,
        '1',
        'patient'
      );

      expect(graphData.moreThanThirtyBalance).toEqual(300);
      expect(graphData.moreThanSixtyBalance).toEqual(600);
      expect(graphData.moreThanNintyBalance).toEqual(900);
      expect(graphData.currentBalance).toEqual(100);

      graphData = {};

      graphData = financialService.CalculateAccountAgingGraphData(
        accountBalances,
        '1',
        'insurance'
      );

      expect(graphData.moreThanThirtyBalance).toEqual(80);
      expect(graphData.moreThanSixtyBalance).toEqual(110);
      expect(graphData.moreThanNintyBalance).toEqual(140);
      expect(graphData.currentBalance).toEqual(60);
    });

    it('should calculate account and insurance balances when PatientId IS NOT Supplied and modifier IS supplied', function () {
      var accountBalances = angular.copy(mockAccountBalances);

      var graphData = financialService.CalculateAccountAgingGraphData(
        accountBalances,
        '',
        'patient'
      );

      expect(graphData.moreThanThirtyBalance).toEqual(300);
      expect(graphData.moreThanSixtyBalance).toEqual(600);
      expect(graphData.moreThanNintyBalance).toEqual(900);
      expect(graphData.currentBalance).toEqual(160);

      graphData = {};

      graphData = financialService.CalculateAccountAgingGraphData(
        accountBalances,
        '',
        'insurance'
      );

      expect(graphData.moreThanThirtyBalance).toEqual(130);
      expect(graphData.moreThanSixtyBalance).toEqual(160);
      expect(graphData.moreThanNintyBalance).toEqual(190);
      expect(graphData.currentBalance).toEqual(150);
    });
  });

  describe('CheckForPatientBenefitPlan ->', function () {
    it('should return false if patientId is empty', function () {
      var response = financialService.CheckForPatientBenefitPlan();

      expect(response).toBeFalsy();
    });

    it('should call patientServices.PatientBenefitPlan.get', function () {
      financialService.CheckForPatientBenefitPlan('1');
      expect(patientServices.PatientBenefitPlan.get).toHaveBeenCalled();
    });
  });

  describe('mapToServiceTransactionEstimateDto', () => {
    it('should map IServiceTransactionDto list without dynamic properties', function () {
      var mappedServices = financialService.mapToServiceTransactionEstimateDto(
        mockServiceTransactionDtos
      );
      expect(mappedServices[0].AccountMemberId).toEqual(
        mockServiceTransactionDtos[0].AccountMemberId
      );
      expect(mappedServices[0].Amount).toEqual(
        mockServiceTransactionDtos[0].Amount
      );
      expect(mappedServices[0].Discount).toEqual(
        mockServiceTransactionDtos[0].Discount
      );
      expect(mappedServices[0]['$toothAreaData']).toBe(undefined);
      expect(
        mappedServices[0].InsuranceEstimates[0]['AllowedAmountDisplay']
      ).toBe(undefined);
      expect(
        mappedServices[0].InsuranceEstimates[0].EstimatedInsuranceId
      ).toEqual(
        mockServiceTransactionDtos[0].InsuranceEstimates[0].EstimatedInsuranceId
      );
    });
  });
});
