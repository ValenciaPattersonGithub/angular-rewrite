describe('patient-filters -> ', function () {
  var filter;

  // access module where filter is located
  beforeEach(module('Soar.Patient'));

  describe('totalEncounterEstimateAmountFilter -> ', function () {
    //#region mock encounters
    var mockEncounterList = [
      {
        ServiceTransactionDtos: [
          {
            id: 1,
            ObjectState: 'None',
            InsuranceEstimates: [{ EstimatedAmount: 10.0 }],
          },
          {
            id: 2,
            ObjectState: 'None',
            InsuranceEstimates: [{ EstimatedAmount: 10.0 }],
          },
          {
            id: 3,
            ObjectState: 'None',
            InsuranceEstimates: [{ EstimatedAmount: 10.0 }],
          },
        ],
      },
      {
        ServiceTransactionDtos: [
          {
            id: 11,
            ObjectState: 'None',
            InsuranceEstimates: [{ EstimatedAmount: 10.0 }],
          },
          {
            id: 22,
            ObjectState: 'None',
            InsuranceEstimates: [{ EstimatedAmount: 10.0 }],
          },
          {
            id: 33,
            ObjectState: 'None',
            InsuranceEstimates: [{ EstimatedAmount: 50.0 }],
          },
        ],
      },
      {
        ServiceTransactionDtos: [
          {
            id: 21,
            ObjectState: 'None',
            InsuranceEstimates: [{ EstimatedAmount: 30.0 }],
          },
          {
            id: 22,
            ObjectState: 'None',
            InsuranceEstimates: [{ EstimatedAmount: 10.0 }],
          },
          {
            id: 23,
            ObjectState: 'None',
            InsuranceEstimates: [{ EstimatedAmount: 10.0 }],
          },
        ],
      },
    ];

    //#endregion

    // inject $filter
    beforeEach(inject(function ($filter) {
      filter = $filter('totalEncounterEstimateAmountFilter');
    }));

    it('should calculate total charge for prop for list of encounters', function () {
      var values = angular.copy(mockEncounterList);
      var prop = 'EstimatedAmount';
      expect(filter(values, prop)).toBe(150);
    });

    it('should return as 0 when no prop amount', function () {
      var values = [
        {
          ServiceTransactionDtos: [
            { id: 1, ObjectState: 'None', InsuranceEstimates: [] },
            { id: 2, ObjectState: 'None', InsuranceEstimates: [] },
            { id: 3, ObjectState: 'None', InsuranceEstimates: [] },
          ],
        },
      ];
      expect(filter(values, null)).toBe(0);
    });

    it('should set prop to EstimatedInsurance if no prop parameter', function () {
      var values = [
        {
          ServiceTransactionDtos: [
            { id: 1, ObjectState: 'None', InsuranceEstimates: [] },
            { id: 2, ObjectState: 'None', InsuranceEstimates: [] },
            { id: 3, ObjectState: 'None', InsuranceEstimates: [] },
          ],
        },
      ];
      expect(filter(values, null)).toBe(0);
    });
  });

  describe('getUnassignedCreditTransactionDetailAmountFilter ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('getUnassignedCreditTransactionDetailAmountFilter');
    }));

    var creditTransactionDetails = [
      {
        CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
        AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
        Amount: -9,
        AppliedToServiceTransationId: null,
        CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
        DateEntered: '2015-10-05T11:45:20.614Z',
        EncounterId: null,
        ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
        AppliedToDebitTransactionId: null,
        IsDeleted: false,
        DataTag:
          '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2015-10-05T11:45:40.6944316Z',
      },
      {
        CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
        AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
        Amount: -9,
        AppliedToServiceTransationId: 'abc',
        CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
        DateEntered: '2015-10-05T11:45:20.614Z',
        EncounterId: null,
        ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
        AppliedToDebitTransactionId: null,
        IsDeleted: false,
        DataTag:
          '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2015-10-05T11:45:40.6944316Z',
      },
      {
        CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
        AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ac0',
        Amount: -9,
        AppliedToServiceTransationId: null,
        CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
        DateEntered: '2015-10-05T11:45:20.614Z',
        EncounterId: null,
        ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
        AppliedToDebitTransactionId: null,
        IsDeleted: false,
        DataTag:
          '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2015-10-05T11:45:40.6944316Z',
      },
    ];
    it('should add up all unassigned amounts from a credit transactions for an account member', function () {
      var accountMemberId = 'b323812f-ab5c-4e04-9ddf-9203484e7ab9';
      expect(filter(creditTransactionDetails, accountMemberId)).toBe(-9);
    });
    it('should return zero nothing is unassigned', function () {
      var accountMemberId = 'b323812f-ab5c-4e04-9ddf-9203484e7ab9';
      var creditTransactionDetailsNew = [
        {
          CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: -9,
          AppliedToServiceTransationId: 'abcd',
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          DateEntered: '2015-10-05T11:45:20.614Z',
          EncounterId: null,
          ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
          AppliedToDebitTransactionId: null,
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T11:45:40.6944316Z',
        },
        {
          CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: -9,
          AppliedToServiceTransationId: 'abc',
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          DateEntered: '2015-10-05T11:45:20.614Z',
          EncounterId: null,
          ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
          AppliedToDebitTransactionId: null,
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T11:45:40.6944316Z',
        },
        {
          CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ac0',
          Amount: -9,
          AppliedToServiceTransationId: 'abcd',
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          DateEntered: '2015-10-05T11:45:20.614Z',
          EncounterId: null,
          ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
          AppliedToDebitTransactionId: null,
          IsDeleted: false,
          DataTag:
            '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2015-10-05T11:45:40.6944316Z',
        },
      ];
      expect(filter(creditTransactionDetailsNew, accountMemberId)).toBe(0);
    });
    it('should add up all unassigned amounts from a credit transactions, when account member id is null', function () {
      var accountMemberId = null;
      expect(filter(creditTransactionDetails, accountMemberId)).toBe(-18);
    });
  });

  describe('getTotalUnappliedAmountFromCreditTransactionsFilter ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('getTotalUnappliedAmountFromCreditTransactionsFilter');
    }));

    var creditTransaction = [
      {
        CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
        LocationId: 14601,
        AccountId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
        AdjustmentTypeId: null,
        Amount: -20.11,
        ClaimId: null,
        DateEntered: '2015-10-05T11:45:20.614Z',
        Description: '1234 - prompt',
        PaymentTypePromptValue: null,
        EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
        Note: null,
        PaymentTypeId: '2f9dc9c9-8294-4395-93d1-49a904d2d070',
        TransactionTypeId: 2,
        CreditTransactionDetails: [
          {
            CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
            AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
            Amount: -10,
            AppliedToServiceTransationId: null,
            CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
            DateEntered: '2015-10-05T11:45:20.614Z',
            EncounterId: null,
            ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
            AppliedToDebitTransactionId: null,
            IsDeleted: false,
            DataTag:
              '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2015-10-05T11:45:40.6944316Z',
          },
          {
            CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
            AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
            Amount: -20,
            AppliedToServiceTransationId: null,
            CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
            DateEntered: '2015-10-05T11:45:20.614Z',
            EncounterId: null,
            ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
            AppliedToDebitTransactionId: null,
            IsDeleted: false,
            DataTag:
              '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2015-10-05T11:45:40.6944316Z',
          },
          {
            CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
            AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
            Amount: -30,
            AppliedToServiceTransationId: null,
            CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
            DateEntered: '2015-10-05T11:45:20.614Z',
            EncounterId: null,
            ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
            AppliedToDebitTransactionId: null,
            IsDeleted: false,
            DataTag:
              '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2015-10-05T11:45:40.6944316Z',
          },
          {
            CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
            AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ac0',
            Amount: -10,
            AppliedToServiceTransationId: null,
            CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
            DateEntered: '2015-10-05T11:45:20.614Z',
            EncounterId: null,
            ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
            AppliedToDebitTransactionId: null,
            IsDeleted: false,
            DataTag:
              '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2015-10-05T11:45:40.6944316Z',
          },
          {
            CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
            AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7abS',
            Amount: -10,
            AppliedToServiceTransationId: 'abc',
            CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
            DateEntered: '2015-10-05T11:45:20.614Z',
            EncounterId: null,
            ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
            AppliedToDebitTransactionId: null,
            IsDeleted: false,
            DataTag:
              '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2015-10-05T11:45:40.6944316Z',
          },
        ],
        UnassignedAmount: -9,
        Prompt: 'prompt',
        IsDeleted: false,
        DataTag: 'abc',
      },
    ];
    it('should add up all unassigned amounts from a credit transactions for an account member', function () {
      var accountMemberId = 'b323812f-ab5c-4e04-9ddf-9203484e7ab9';
      expect(filter(creditTransaction, accountMemberId)).toBe(60);
    });

    it('should add up all unassigned amounts from a credit transactions, when no account member id is passed.', function () {
      var accountMemberId = 'b323812f-ab5c-4e04-9ddf-9203484e7ab9';
      expect(filter(creditTransaction, null)).toBe(70);
    });
  });

  describe('getTotalUnappliedAmountFromCreditTransactionsForSelectedMembersFilter ->', function () {
    var creditTransactions;
    var accountMemberIds;
    beforeEach(inject(function ($filter) {
      filter = $filter(
        'getTotalUnappliedAmountFromCreditTransactionsForSelectedMembersFilter'
      );

      accountMemberIds = [
        '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
        '8d7f8889-e72d-4d9c-9125-efd33a87cc84',
      ];

      creditTransactions = [
        {
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          LocationId: 14601,
          AccountId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
          AdjustmentTypeId: null,
          Amount: -20.11,
          ClaimId: null,
          DateEntered: '2015-10-05T11:45:20.614Z',
          Description: '1234 - prompt',
          PaymentTypePromptValue: null,
          EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
          Note: null,
          PaymentTypeId: '2f9dc9c9-8294-4395-93d1-49a904d2d070',
          TransactionTypeId: 2,
          CreditTransactionDetails: [
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
              AccountMemberId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
              Amount: -10,
              AppliedToServiceTransationId: 'Service1',
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
              AccountMemberId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
              Amount: -10,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: 'DebitTransaction1',
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
              AccountMemberId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
              Amount: -10,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f19',
              AccountMemberId: '8d7f8889-e72d-4d9c-9125-efd33a87cc84',
              Amount: -20,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            ,
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f19',
              AccountMemberId: '8d7f8889-e72d-4d9c-9879-efd33a87cc84',
              Amount: -15,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
          ],
          UnassignedAmount: -9,
          Prompt: 'prompt',
          IsDeleted: false,
          DataTag: 'abc',
        },
      ];
    }));

    it('should add up all unapplied credit transactions for selected account member list.', function () {
      expect(filter(creditTransactions, accountMemberIds)).toBe(30);
    });

    it('should add up all unapplied credit transactions.', function () {
      expect(filter(creditTransactions, null)).toBe(45);
    });
  });

  describe('getUnassignedCreditTransactionsFilter ->', function () {
    var creditTransactions;
    var accountMemberId;
    beforeEach(inject(function ($filter) {
      filter = $filter('getUnassignedCreditTransactionsFilter');
      accountMemberId = '8d7f8889-e72d-4d9c-9125-efd33a87cc83';
      creditTransactions = [
        {
          CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
          LocationId: 14601,
          AccountId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
          AdjustmentTypeId: null,
          Amount: -20.11,
          ClaimId: null,
          DateEntered: '2015-10-05T11:45:20.614Z',
          Description: '1234 - prompt',
          PaymentTypePromptValue: null,
          EnteredByUserId: 'cb8cb621-8e1f-4564-9c41-9ffcbc583416',
          Note: null,
          PaymentTypeId: '2f9dc9c9-8294-4395-93d1-49a904d2d070',
          TransactionTypeId: 2,
          CreditTransactionDetails: [
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
              AccountMemberId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
              Amount: -10,
              AppliedToServiceTransationId: 'Service1',
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
              AccountMemberId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
              Amount: -10,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: '00000000-0000-0000-0000-000000000000',
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: 'DebitTransaction1',
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f89',
              AccountMemberId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
              Amount: -10,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f19',
              AccountMemberId: '8d7f8889-e72d-4d9c-9125-efd33a87cc83',
              Amount: -20,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
            {
              CreditTransactionDetailId: '58808515-0b63-4d91-b4ff-e05824d67f19',
              AccountMemberId: '8d7f8889-e72d-4d9c-9879-efd33a87cc84',
              Amount: -15,
              AppliedToServiceTransationId: null,
              CreditTransactionId: '34aa0bcf-9b0a-40b3-89ef-b61882e87cbb',
              DateEntered: '2015-10-05T11:45:20.614Z',
              EncounterId: null,
              ProviderUserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
              AppliedToDebitTransactionId: null,
              IsDeleted: false,
              DataTag:
                '{"Timestamp":"2015-10-05T11:45:43.3175449+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A45%3A43.3175449Z\'\\""}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2015-10-05T11:45:40.6944316Z',
            },
          ],
          UnassignedAmount: -9,
          Prompt: 'prompt',
          IsDeleted: false,
          DataTag: 'abc',
        },
      ];
    }));

    it('should add up all unapplied credit transactions for selected account member.', function () {
      var resultCreditTrans = filter(creditTransactions, accountMemberId);
      expect(resultCreditTrans).not.toBeNull();
      expect(resultCreditTrans.length).toEqual(1);
      expect(resultCreditTrans[0].CreditTransactionDetails.length).toEqual(2);
    });
    it('should add up all unapplied credit transactions.', function () {
      var resultCreditTrans = filter(creditTransactions, null);
      expect(resultCreditTrans).not.toBeNull();
      expect(resultCreditTrans.length).toEqual(1);
      expect(resultCreditTrans[0].CreditTransactionDetails.length).toEqual(3);
    });
  });

  describe('unique ->', function () {
    var collection = [
      { Id: '1001', Value: 'Value_1001' },
      { Id: '1001_1', Value: 'Value_1001' },
      { Id: '1002', Value: 'Value_1002' },
      { Id: '1003', Value: 'Value_1003' },
    ];

    var keyName = 'Id';
    beforeEach(inject(function ($filter) {
      filter = $filter('unique');
    }));

    it('Scenario 1 - when no duplicating value in collection, should return unique value from collection.', function () {
      var collection = [
        { Id: '1001', Value: 'Value_1001' },
        { Id: '1001_1', Value: 'Value_1001' },
        { Id: '1002', Value: 'Value_1002' },
        { Id: '1003', Value: 'Value_1003' },
      ];
      expect(filter(collection, keyName).length).toEqual(4);
    });

    it('Scenario 2 - when duplicating values are there in collection, should return unique value from collection.', function () {
      var collection = [
        { Id: '1001', Value: 'Value_1001' },
        { Id: '1001', Value: 'Value_1001' },
        { Id: '1001', Value: 'Value_1002' },
        { Id: '1003', Value: 'Value_1003' },
      ];
      expect(filter(collection, keyName).length).toEqual(2);
    });
  });
  describe('sumofCreditDetailAdjEst ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('sumofCreditDetailAdjEst');
    }));
    it('should retun sum of amounts of objects passed in', function () {
      var collection = [
        { Amount: 50 },
        { Amount: 50 },
        { Amount: 50 },
        { Amount: 100 },
      ];
      expect(filter(collection)).toEqual('250.00');
    });
  });

  describe('getProvidersInPreferredOrderFilter ->', function () {
    var providers;
    beforeEach(inject(function ($filter) {
      filter = $filter('getProvidersInPreferredOrderFilter');
      providers = [
        {
          Name: 'Name',
          FullName: 'FullName',
          UserId: 'UserId',
          IsActive: true,
          ProviderTypeId: 1,
          FirstName: 'FirstName',
          LastName: 'LastName',
          ProfessionalDesignation: 'ProfessionalDesignation',
          UserCode: 'UserCode',
          ProviderOnClaimsRelationship: 'ProviderOnClaimsRelationship',
          ProviderOnClaimsId: 'ProviderOnClaimsId',
          Locations: [{ LocationId: '1234' }],
        },
      ];
    }));

    it('should copy correct properties', function () {
      var name =
        providers[0].FirstName +
        ' ' +
        providers[0].LastName +
        ', ' +
        providers[0].ProfessionalDesignation;
      var fullName = providers[0].FirstName + ' ' + providers[0].LastName;
      var resultProviders = filter(providers, {}, '1234');
      expect(resultProviders).not.toBeNull();
      expect(resultProviders.length).toEqual(1);
      expect(resultProviders[0].Name).toEqual(name);
      expect(resultProviders[0].FullName).toEqual(fullName);
      expect(resultProviders[0].ProviderId).toEqual(providers[0].UserId);
      expect(resultProviders[0].IsActive).toEqual(providers[0].IsActive);
      expect(resultProviders[0].FirstName).toEqual(providers[0].FirstName);
      expect(resultProviders[0].LastName).toEqual(providers[0].LastName);
      expect(resultProviders[0].ProfessionalDesignation).toEqual(
        providers[0].ProfessionalDesignation
      );
      expect(resultProviders[0].UserCode).toEqual(providers[0].UserCode);
    });
  });

  describe('getProvidersInPreferredOrderFilterMultiLocations ->', function () {
    var providers;
    beforeEach(inject(function ($filter) {
      filter = $filter('getProvidersInPreferredOrderFilterMultiLocations');
      providers = [
        {
          Name: 'Name',
          FullName: 'FullName',
          UserId: 'UserId',
          IsActive: true,
          ProviderTypeId: 1,
          FirstName: 'FirstName',
          LastName: 'LastName',
          ProfessionalDesignation: 'ProfessionalDesignation',
          UserCode: 'UserCode',
          ProviderOnClaimsRelationship: 'ProviderOnClaimsRelationship',
          ProviderOnClaimsId: 'ProviderOnClaimsId',
          Locations: [{ LocationId: '1234' }],
        },
        {
          Name: 'Name2',
          FullName: 'FullName2',
          UserId: 'UserId2',
          IsActive: true,
          ProviderTypeId: 1,
          FirstName: 'FirstName',
          LastName: 'LastName',
          ProfessionalDesignation: 'ProfessionalDesignation',
          UserCode: 'UserCode',
          ProviderOnClaimsRelationship: 'ProviderOnClaimsRelationship',
          ProviderOnClaimsId: 'ProviderOnClaimsId',
          Locations: [{ LocationId: '777' }, { LocationId: '888' }],
        },
      ];
    }));

    it('should copy correct properties', function () {
      var name =
        providers[0].FirstName +
        ' ' +
        providers[0].LastName +
        ', ' +
        providers[0].ProfessionalDesignation;
      var fullName = providers[0].FirstName + ' ' + providers[0].LastName;
      var resultProviders = filter(providers, {}, ['1234', '888']);
      expect(resultProviders).not.toBeNull();
      expect(resultProviders.length).toEqual(2);

      expect(resultProviders[0]).toEqual({
        Name: name,
        FullName: fullName,
        ProviderId: providers[0].UserId,
        IsActive: providers[0].IsActive,
        FirstName: providers[0].FirstName,
        LastName: providers[0].LastName,
        ProfessionalDesignation: providers[0].ProfessionalDesignation,
        UserCode: providers[0].UserCode,
        IsPreferred: false,
        UserLocationSetup: [{ LocationId: '1234' }],
      });

      name =
        providers[1].FirstName +
        ' ' +
        providers[1].LastName +
        ', ' +
        providers[1].ProfessionalDesignation;
      fullName = providers[1].FirstName + ' ' + providers[1].LastName;

      expect(resultProviders[1]).toEqual({
        Name: name,
        FullName: fullName,
        ProviderId: providers[1].UserId,
        IsActive: providers[1].IsActive,
        FirstName: providers[1].FirstName,
        LastName: providers[1].LastName,
        ProfessionalDesignation: providers[0].ProfessionalDesignation,
        UserCode: providers[1].UserCode,
        IsPreferred: false,
        UserLocationSetup: [{ LocationId: '888' }],
      });

      //expect(resultProviders[0].Name).toEqual(name);
      //expect(resultProviders[0].FullName).toEqual(fullName);
      //expect(resultProviders[0].ProviderId).toEqual(providers[0].UserId);
      //expect(resultProviders[0].IsActive).toEqual(providers[0].IsActive);
      //expect(resultProviders[0].FirstName).toEqual(providers[0].FirstName);
      //expect(resultProviders[0].LastName).toEqual(providers[0].LastName);
      //expect(resultProviders[0].ProfessionalDesignation).toEqual(providers[0].ProfessionalDesignation);
      //expect(resultProviders[0].UserCode).toEqual(providers[0].UserCode);
    });
  });

  describe('anySelected ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('anySelected');
    }));
    it('should return true if all selected', function () {
      var res = filter([{ selected: true }, { selected: true }]);
      expect(res).toBe(true);
    });
    it('should return true if any selected', function () {
      var res = filter([{ selected: true }, { selected: false }]);
      expect(res).toBe(true);
    });
    it('should return false if none selected', function () {
      var res = filter([{ selected: false }, { selected: false }]);
      expect(res).toBe(false);
    });
    it('should return false if empty list', function () {
      var res = filter([]);
      expect(res).toBe(false);
    });
  });

  describe('serviceSelected ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('serviceSelected');
    }));
    it('should return true if all selected', function () {
      var res = filter([
        { ServiceManuallySelected: true },
        { ServiceManuallySelected: true },
      ]);
      expect(res).toBe(true);
    });
    it('should return true if any selected', function () {
      var res = filter([
        { ServiceManuallySelected: true },
        { ServiceManuallySelected: false },
      ]);
      expect(res).toBe(true);
    });
    it('should return false if none selected', function () {
      var res = filter([
        { ServiceManuallySelected: false },
        { ServiceManuallySelected: false },
      ]);
      expect(res).toBe(false);
    });
    it('should return false if empty list', function () {
      var res = filter([]);
      expect(res).toBe(false);
    });
  });
});
