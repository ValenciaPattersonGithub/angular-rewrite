describe('account-summary-factory-controller->', function () {
  var accountSummaryFactory,
    patientServices,
    referenceDataService,
    toastrFactory,
    mockPaymentGatewayFactory,
    adjustmentTypesService,
    mockTimeZoneFactory,
    mockLocation,
    mockDeleteInsurancePaymentFactory,
    q,
    modalFactory,
    mockLocalize,
    mockPatSecurityService,
    mockPaymentGatewayService,
    creditTransaction,
    locationServicesMock,
    sce;
  var items = [
    { ObjectType: 'ServiceTransaction' },
    { ObjectType: 'CreditTransaction' },
    { ObjectType: 'DebitTransaction' },
    { ObjectType: 'PersonAccountNote' },
  ];
  var mockCreditTransaction = { Amount: 175, Description: 'Cash' };

  var currentLocation = { id: 1, name: "Chris's Location" };

  var detail = {};

  var res = [];

  var modalData = {};

  var refreshGrid = function () {};

  var paymentTypes = [
    { PaymentTypeId: 1, CurrencyTypeId: 3 },
    { PaymentTypeId: 2, CurrencyTypeId: 3, Description: 'Master Card' },
    { PaymentTypeId: 3, CurrencyTypeId: 4, Description: 'Debit Card' },
  ];

  var providers = [
    {
      UserId: 1,
      ProfessionalDesignation: 'Doctor',
      FirstName: 'Chris',
      LastName: 'Archer',
    },
    {
      UserId: 2,
      ProfessionalDesignation: 'Doctor',
      FirstName: 'Kyle',
      LastName: 'Deak',
    },
  ];
  var staticData;
  const mockPaymentDevices=[{DeviceFriendlyName:"citi" ,PartnerDeviceId:"citi"},{DeviceFriendlyName:"US bank" ,PartnerDeviceId:"Us bank"}];

  beforeEach(
    module('Soar.Common', function ($provide) {
      sessionStorage.setItem('userLocation', JSON.stringify(currentLocation));

      referenceDataService = {
        getData: jasmine.createSpy('referenceDataService.get').and.returnValue([
          { LocationId: 1, Timezone: 'Central Standard Time' },
          { LocationId: 2, Timezone: 'Central Standard Time' },
        ]),
        entityNames: {
          locations: 'locations',
        },
      };
      $provide.value('referenceDataService', referenceDataService);
     
      locationServicesMock = {
        getPaymentDevicesByLocationAsync: jasmine.createSpy().and.returnValue({
          $promise: { then: function (callback) {
              callback({ Value: mockPaymentDevices });
            },
          }
        })
      };
      $provide.value('LocationServices', locationServicesMock);

      mockLocalize = {
        getLocalizedString: jasmine
          .createSpy('localize.getLocalizedString')
          .and.callFake(function (text, params) {
            if (params) {
              for (var i = 0; i < params.length; i++) {
                text = text.replace('{' + i + '}', params[i]);
              }
            }
            return text;
          }),
      };
      $provide.value('localize', mockLocalize);
    })
  );

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServices = {
        AccountSummary: {
          getTransactionHistory: jasmine
            .createSpy('patientServices.AccountSummary.getTransactionHistory')
            .and.returnValue({
              $promise: {
                then: function (callback) {
                  callback({
                    Value: [
                      {
                        ObjectType: 'ServiceTransaction',
                        LocationId: 1,
                        TransactionTypeId: 1,
                      },
                      {
                        ObjectType: 'ServiceTransaction',
                        LocationId: 2,
                        TransactionTypeId: 1,
                      },
                    ],
                  });
                },
              },
            }),
          getAccountSummaryMain: jasmine
            .createSpy('patientServices.AccountSummary.getAccountSummaryMain')
            .and.returnValue({
              $promise: {},
            }),
          getAccountSummaryPending: jasmine
            .createSpy(
              'patientServices.AccountSummary.getAccountSummaryPending'
            )
            .and.returnValue({
              $promise: {
                then: function (callback) {
                  callback({
                    Value: {
                      Rows: [
                        {
                          ObjectType: 'ServiceTransaction',
                          EncounterServiceLocationIds: [1],
                        },
                        {
                          ObjectType: 'ServiceTransaction',
                          EncounterServiceLocationIds: [1, 2],
                        },
                      ],
                    },
                  });
                },
              },
            }),
          getAccountSummaryRowDetail: jasmine
            .createSpy(
              'patientServices.AccountSummary.getAccountSummaryRowDetail'
            )
            .and.returnValue({
              $promise: {
                then: function (callback) {
                  callback({
                    Value: {
                      Rows: items,
                      PatientBalance: 10,
                      InsuranceBalance: 20,
                    },
                  });
                },
              },
            }),
        },
        CreditTransactions: {
          markAccountPaymentAsDeleted: jasmine.createSpy(
            'mockPatientServices.CreditTransactions.markAccountPaymentAsDeleted'
          ),
          markNegativeAdjustmentAsDeleted: jasmine.createSpy(
            'mockPatientServices.CreditTransactions.markNegativeAdjustmentAsDeleted'
          ),
          getCreditTransactionByIdForAccount: jasmine
            .createSpy(
              'mockPatientServices.CreditTransactions.getCreditTransactionByIdForAccount'
            )
            .and.returnValue({
              $promise: {
                then: function (callback) {
                  callback({ Value: mockCreditTransaction });
                },
              },
            }),
          getTransactionHistoryPaymentInformation: jasmine.createSpy(
            'mockPatientServices.CreditTransactions.getTransactionHistoryPaymentDeleteInfo'
          ),
          getTransactionHistoryPaymentDetails: jasmine
            .createSpy(
              'mockPatientServices.CreditTransactions.getTransactionHistoryPaymentDetails'
            )
            .and.returnValue({
              $promise: {
                then: function (callback) {
                  callback({
                    Value: {
                      IsAppliedAcrossEncounters: true,
                    },
                  });
                },
              },
            }),


            payPageReturnRequest: jasmine.createSpy().and.callFake(() => {
              return {
                  $promise: {
                      then: (res, error) => {
                          res({ Value: { PaymentGatewayTransactionId: 4713,PaypageUrl: 'https://web.test.paygateway.com/paypage/v1/returns/123'} });
                      },
              },
          };
         }),

        },
        
        
      };
      $provide.value('PatientServices', patientServices);

      mockPaymentGatewayService = {
        patientAccountDebitCardReturn: jasmine.createSpy(
          'mockPaymentGatewayService.patientAccountDebitCardReturn'
        ),

        patientAccountPaymentProviderDebitCardReturn: jasmine.createSpy('patientAccountPaymentProviderDebitCardReturn').and.callFake(() => {
          return {
            $promise: {
            then: (res, error) => {
                res( { Value: { PaymentGatewayTransactionId: 4713} });
                error({});
            }
            },
        };
        }),
      };
      $provide.value('PaymentGatewayService', mockPaymentGatewayService);

      adjustmentTypesService = {
        get: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy().and.returnValue({
              Value: [{ AdjustmentTypeId: 1 }],
            }),
        }),
      };
      $provide.value('NewAdjustmentTypesService', adjustmentTypesService);

      staticData  = {
        PaymentProviders: jasmine.createSpy('staticData.PaymentProviders').and.returnValue({ OpenEdge: 0, TransactionsUI: 1 }),
      };
      $provide.value('StaticData', staticData);
      var mockCheckVoid = {
        Value: false,
      };
      var mockPaymentGatewayTransactionDetails={
        Value:{ PaymentGatewayTransactionId: 500,GatewayTransactionType:2 }
      }

      mockPaymentGatewayFactory = {
        mockCheckVoid: mockCheckVoid,
        checkVoidInsurance: jasmine
          .createSpy('mockPaymentGatewayFactory.checkVoidInsurance')
          .and.returnValue({
            get: jasmine.createSpy().and.returnValue({
              $promise: {
                then: function (callback) {
                  callback(mockCheckVoid);
                },
              },
            }),
          }),
        checkVoid: jasmine
          .createSpy('mockPaymentGatewayFactory.checkVoid')
          .and.returnValue({
            get: jasmine.createSpy().and.returnValue({
              $promise: {
                then: function (callback) {
                  callback(mockCheckVoid);
                },
              },
            }),
          }),
          getPaymentGatewayTransactionByCreditTransactionId: jasmine
          .createSpy('mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId')
          .and.returnValue({
            get: jasmine.createSpy().and.returnValue({
              $promise: {
                then: function (callback) {
                  callback( mockPaymentGatewayTransactionDetails);
                },
              },
            }),
          }),
      };
      $provide.value('PaymentGatewayFactory', mockPaymentGatewayFactory);

      toastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error'),
      };
      $provide.value('toastrFactory', toastrFactory);

      modalFactory = {
        Modal: jasmine
          .createSpy('modalFactory.Modal')
          .and.callFake(function (dataForModal) {
            modalData = dataForModal;
            return {
              result: {
                then: function (successCallback) {
                  successCallback();
                },
              },
            };
          }),
        ConfirmModal: jasmine
          .createSpy('modalFactory.ConfirmModal')
          .and.returnValue({
            then: function (successCallback) {
              successCallback();
            },
          }),
        PaymentVoidConfirmModal: jasmine
          .createSpy('modalFactory.PaymentVoidConfirmModal')
          .and.returnValue({
            then: function (successCallback) {
              successCallback();
            },
          }),
        LoadingModal: jasmine
          .createSpy('mockModalFactory.LoadingModal')
          .and.returnValue({
            then: function (callback) {
              callback();
            },
          }),
          CardReaderModal: jasmine
          .createSpy('modalFactory.CardReaderModal')
          .and.returnValue({
            then: function (successCallback) {
              successCallback('citi');
            },
          }),
          PayPageModal: jasmine
          .createSpy('modalFactory.PayPageModal')
          .and.returnValue({
            then: function (successCallback) {
              successCallback('citi');
            },
          }),
          
      };
      $provide.value('ModalFactory', modalFactory);

      mockDeleteInsurancePaymentFactory = {
        deleteInsurancePayment: jasmine
          .createSpy('mockDeleteInsurancePaymentFactory.deleteInsurancePayment')
          .and.returnValue({
            then: function () {},
          }),
      };
      $provide.value(
        'DeleteInsurancePaymentFactory',
        mockDeleteInsurancePaymentFactory
      );

      mockLocation = {
        url: jasmine.createSpy('$location.url'),
        path: jasmine.createSpy('$location.path'),
        search: jasmine.createSpy('$location.search').and.returnValue({}),
      };
      $provide.value('$location', mockLocation);

      mockTimeZoneFactory = {
        ConvertDateToMomentTZ: jasmine
          .createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
          .and.callFake(function (date) {
            return moment(date);
          }),
        ConvertDateTZString: jasmine
          .createSpy('mockTimeZoneFactory.ConvertDateTZString')
          .and.callFake(function (date) {
            return date;
          }),
      };
      $provide.value('TimeZoneFactory', mockTimeZoneFactory);
    })
  );

  /** @type {angular.IRootScopeService} */
  var $rootScope;
  beforeEach(inject(function ($injector,) {
    q = $injector.get('$q');
    sce =$injector.get('$sce');
 
    $rootScope = $injector.get('$rootScope');

    accountSummaryFactory = $injector.get('AccountSummaryFactory');
    mockPatSecurityService = $injector.get('patSecurityService');
    mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
      .createSpy('mockPatSecurityService.IsAuthorizedByAbbreviation')
      .and.returnValue(true);

    patientServices.CreditTransactions.getTransactionHistoryPaymentInformation.and.returnValue(
      { $promise: q.resolve({ Value: { BulkCreditTransactionId: 1 } }) }
    );
  }));

  describe('initial values -> ', function () {
    it('factory should exist and have methods available', function () {
      expect(accountSummaryFactory).not.toBe(undefined);
      expect(accountSummaryFactory.getTransactionHistory).not.toBe(undefined);
      expect(accountSummaryFactory.getAccountSummaryMain).not.toBe(undefined);
      expect(accountSummaryFactory.getPendingEncounters).not.toBe(undefined);
      expect(accountSummaryFactory.getEncounterDetails).not.toBe(undefined);
    });
  });

  describe('getAccountSummaryMain -> ', function () {
    it('should call patient services account summary getaccountsummarymain', function () {
      accountSummaryFactory.getAccountSummaryMain();
      expect(
        patientServices.AccountSummary.getAccountSummaryMain
      ).toHaveBeenCalled();
    });
  });

  describe('getAccountSummaryPending -> ', function () {
    it('should call patient services account summary getaccountsummarypending', function () {
      accountSummaryFactory.getPendingEncounters();
      expect(
        patientServices.AccountSummary.getAccountSummaryPending
      ).toHaveBeenCalled();
      expect(toastrFactory.error).not.toHaveBeenCalled();
    });

    it('should return an empty array if there is no value in the result', function () {
      items = [
        { ObjectType: 'ServiceTransaction' },
        { ObjectType: 'CreditTransaction' },
      ];
      patientServices.AccountSummary.getAccountSummaryPending = jasmine
        .createSpy('patientServices.AccountSummary.getAccountSummaryPending')
        .and.returnValue({
          $promise: {
            then: function (callback) {
              callback({
                Value: undefined,
              });
            },
          },
        });
      var result = accountSummaryFactory.getPendingEncounters();
      $rootScope.$apply();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getEncounterDetails -> ', function () {
    it('should call patient services account summary getAccountSummaryRowDetail and set up values', function () {
      var row = {};
      accountSummaryFactory.getEncounterDetails(row);
      $rootScope.$apply();
      expect(
        patientServices.AccountSummary.getAccountSummaryRowDetail
      ).toHaveBeenCalled();
      expect(row.retrieved).toBe(true);
      expect(row.PatientBalance).toEqual(10);
      expect(row.InsuranceBalance).toEqual(20);
      expect(row.serviceTransactions[0]).toEqual(items[0]);
      expect(row.creditTransactions[0]).toEqual(items[1]);
      expect(row.debitTransactions[0]).toEqual(items[2]);
      expect(row.AccountMemberHasPlan).toEqual(false);
      expect(row.OpenClaims).toEqual(false);
      expect(row.AnyServiceCanSubmit).toEqual(false);
    });

    it('should set isVendorPayment to true if CreditTransaction.Description is Vendor Payment', function () {
      var row = {};
      items = [
        { ObjectType: 'CreditTransaction', Description: 'Check' },
        { ObjectType: 'ServiceTransaction', Description: 'Amal1s' },
        { ObjectType: 'CreditTransaction', Description: 'Vendor Payment' },
      ];
      patientServices.getAccountSummaryRowDetail = jasmine
        .createSpy('patientServices.AccountSummary.getAccountSummaryRowDetail')
        .and.returnValue({
          $promise: {
            then: function (callback) {
              callback({
                Value: {
                  Rows: items,
                  PatientBalance: 10,
                  InsuranceBalance: 20,
                },
              });
            },
          },
        });
      accountSummaryFactory.getEncounterDetails(row);
      $rootScope.$apply();
      row.Items.forEach(item => {
        if (item.Description.toLowerCase().indexOf('vendor payment') !== -1) {
          expect(item.isVendorPayment).toBe(true);
        } else {
          expect(item.isVendorPayment).toBe(undefined);
        }
      });
    });

    it('should set isVendorPaymentRefund to true if DebitTransaction.Description is Vendor Payment Refund', function () {
      var row = {};
      items = [
        { ObjectType: 'CreditTransaction', Description: 'Check' },
        { ObjectType: 'ServiceTransaction', Description: 'Amal1s' },
        { ObjectType: 'DebitTransaction', Description: 'Vendor Payment Refund' },
      ];
      patientServices.getAccountSummaryRowDetail = jasmine
        .createSpy('patientServices.AccountSummary.getAccountSummaryRowDetail')
        .and.returnValue({
          $promise: {
            then: function (callback) {
              callback({
                Value: {
                  Rows: items,
                  PatientBalance: 10,
                  InsuranceBalance: 20,
                },
              });
            },
          },
        });
      accountSummaryFactory.getEncounterDetails(row);
      $rootScope.$apply();
      row.Items.forEach(item => {
        if (item.Description.toLowerCase().indexOf('vendor payment refund') !== -1) {
          expect(item.isVendorPaymentRefund).toBe(true);
        } else {
          expect(item.isVendorPaymentRefund).toBe(undefined);
        }
      });
    });
  });

  describe('ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal -> ', function () {
    beforeEach(function () {
      res = [
        {
          Value: {
            CreditTransactionDetails: [
              {
                AccountMemberId: 99,
                LocationId: 1,
              },
            ],
          },
        },
        [],
        [],
        {
          Value: {
            Encounters: [
              {
                EncounterId: 99,
                LocationId: 1,
              },
            ],
            RelatedDebitTransactions: [
              {
                DebitTransactionId: 1,
                Amount: 5.0,
              },
            ],
          },
        },
      ];
      q.all = jasmine.createSpy().and.returnValue({
        then: function (callback) {
          callback(res);
        },
      });
      detail = {
        TransactionTypeId: 3,
        LocationId: 1,
        Date: '2019-03-29',
        AccountMemberId: 99,
        $$patientInfo: {
          PersonAccount: {
            AccountId: '234234-23432-23423-234',
            PersonAccountMember: {
              AccountMemberId: 99,
            },
          },
        },
        Encounters: [
          {
            EncounterId: 99,
            LocationId: 1,
          },
        ],
      };
    });
    it('should call modal factory modal', function () {
      spyOn(accountSummaryFactory, 'prepCreditTransaction');
      accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal(
        detail,
        [],
        [{ accountMemberId: 99, patientDetailedName: 'Test Noob' }],
        refreshGrid
      );
      expect(modalFactory.Modal).toHaveBeenCalled();
    });

    it('should call use the getTransactionHistoryPaymentDetails service when coming from transaction history', function () {
      detail.$$route = 'TransactionHx';
      spyOn(accountSummaryFactory, 'prepCreditTransaction');
      accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal(
        detail,
        [],
        [{ accountMemberId: 99, patientDetailedName: 'Test Noob' }],
        refreshGrid
      );

      expect(
        patientServices.CreditTransactions.getTransactionHistoryPaymentDetails
      ).toHaveBeenCalled();
      expect(
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount
      ).not.toHaveBeenCalled();
      expect(modalFactory.Modal).toHaveBeenCalled();
    });

    it('should call use the getCreditTransactionByIdForAccount service when coming from account summary', function () {
      detail.$$route = 'AccountSummary';
      spyOn(accountSummaryFactory, 'prepCreditTransaction');
      accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal(
        detail,
        [],
        [{ accountMemberId: 99, patientDetailedName: 'Test Noob' }],
        refreshGrid
      );
      expect(
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount
      ).toHaveBeenCalled();
      expect(
        patientServices.CreditTransactions.getTransactionHistoryPaymentDetails
      ).not.toHaveBeenCalled();
      expect(modalFactory.Modal).toHaveBeenCalled();
    });

    it('should make 2 patient service calls transactionTypeId is 2', function () {
      // Account Payment
      detail.TransactionTypeId = 2;
      accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal(
        detail,
        providers,
        [{ accountMemberId: 99, patientDetailedName: 'Test Noob' }],
        refreshGrid
      );

      expect(
        patientServices.CreditTransactions.getTransactionHistoryPaymentDetails
      ).toHaveBeenCalled();
      expect(
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount
      ).toHaveBeenCalled();
      expect(modalFactory.Modal).toHaveBeenCalled();
    });
    it('should make 3 patient service calls transactionTypeId is 4', function () {
      // When its a negative adjustment, the adjustment types service should be called
      detail.TransactionTypeId = 4;
      accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal(
        detail,
        providers,
        [{ accountMemberId: 99, patientDetailedName: 'Test Noob' }],
        refreshGrid
      );

      expect(
        patientServices.CreditTransactions.getTransactionHistoryPaymentDetails
      ).toHaveBeenCalled();
      expect(adjustmentTypesService.get).toHaveBeenCalledWith({
        active: false,
      });
      expect(
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount
      ).toHaveBeenCalled();
      expect(modalFactory.Modal).toHaveBeenCalled();
    });
    it('should make 1 patient service calls transactionTypeId is 3', function () {
      // Only the getTransactionHistoryPaymentDetails call gets made for ins payments
      detail.TransactionTypeId = 3;
      detail.$$route = 'TransactionHx';
      accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal(
        detail,
        providers,
        [{ accountMemberId: 99, patientDetailedName: 'Test Noob' }],
        refreshGrid
      );

      expect(
        patientServices.CreditTransactions.getTransactionHistoryPaymentDetails
      ).toHaveBeenCalled();
      expect(
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount
      ).not.toHaveBeenCalled();
      expect(adjustmentTypesService.get).not.toHaveBeenCalled();
      expect(modalFactory.Modal).toHaveBeenCalled();
    });
    it('should call modal with adjustmentTypes set', function () {
      detail.TransactionTypeId = 4;
      detail.$$editMode = true;
      detail.AccountMemberId = 99;
      res[4] = adjustmentTypesService.get().then();
      accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal(
        detail,
        providers,
        [{ accountMemberId: 99, patientDetailedName: 'Test Noob' }],
        refreshGrid
      );

      expect(
        patientServices.CreditTransactions.getTransactionHistoryPaymentDetails
      ).toHaveBeenCalled();
      expect(
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount
      ).toHaveBeenCalled();
      expect(adjustmentTypesService.get).toHaveBeenCalled();
      expect(modalData.resolve.DataForModal().EditMode).toBe(true);
      expect(
        modalData.resolve.DataForModal().AdjustmentTypes[0].AdjustmentTypeId
      ).toBe(1);
    });
    it('should set UnassignedTransactions correctly when the modal is called', function () {
      detail.TransactionTypeId = 2;
      detail.$$editMode = false;
      detail.AccountMemberId = 99;
      res[3].Value.Encounters[0].EncounterId = null;
      res[3].Value.Encounters[0].AppliedTransactionId = null;
      accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal(
        detail,
        providers,
        [{ accountMemberId: 99, patientDetailedName: 'Test Noob' }],
        refreshGrid
      );

      expect(
        patientServices.CreditTransactions.getTransactionHistoryPaymentDetails
      ).toHaveBeenCalled();
      expect(
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount
      ).toHaveBeenCalled();
      expect(modalData.resolve.DataForModal().EditMode).toBe(false);
      expect(
        modalData.resolve.DataForModal().CreditTransaction
          .UnassignedTransactions.length
      ).toBe(1);
    });
    it('should format DateEntered for UTC when DateEntered is not formatted for UTC', function () {
      spyOn(accountSummaryFactory, 'prepCreditTransaction');
      accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal(
        detail,
        [],
        [{ accountMemberId: 99, patientDetailedName: 'Test Noob' }],
        refreshGrid
      );
      expect(modalFactory.Modal).toHaveBeenCalled();
      expect(
        modalData.resolve.DataForModal().CreditTransaction.DateEntered
      ).toEqual('2019-03-29Z');
    });
    it('should not format DateEntered for UTC when DateEntered is formatted for UTC', function () {
      detail.Date = '2019-03-29Z';
      spyOn(accountSummaryFactory, 'prepCreditTransaction');
      accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal(
        detail,
        [],
        [{ accountMemberId: 99, patientDetailedName: 'Test Noob' }],
        refreshGrid
      );
      expect(modalFactory.Modal).toHaveBeenCalled();
      expect(
        modalData.resolve.DataForModal().CreditTransaction.DateEntered
      ).toEqual('2019-03-29Z');
    });
  });

  describe('deleteInsurancePayment -> ', function () {
    it('should notify not authorized when not authorized', function () {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('')
        .and.returnValue(false);
      accountSummaryFactory.deleteInsurancePayment(detail);
      $rootScope.$apply();
      expect(
        mockPatSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(mockLocation.path).toHaveBeenCalled();
    });
    it('should call confirm modal with message when cc integration is disabled', function () {
      var detail = {
        Claims: [{ ClaimId: 999 }],
        IsAuthorized: true,
        PaymentTypeId: 1,
        LocationId: 1,
        BulkCreditTransactionId: 1,
        $$paymentType: { CurrencyTypeId: accountSummaryFactory.CurrencyType.CreditCard, Description: 'Insurance Payment' },
      };
      accountSummaryFactory.deleteInsurancePayment(detail, 'Some Person');
      $rootScope.$apply();
      expect(
        patientServices.CreditTransactions
          .getTransactionHistoryPaymentInformation
      ).toHaveBeenCalled();
      expect(mockPaymentGatewayFactory.checkVoidInsurance).toHaveBeenCalled();
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Insurance Payment',
        'This payment was made using the Credit Card integration.  The Credit Card integration has since been disabled.  Deleting this payment will NOT return funds to the card.  Do you wish to continue?',
        null,
        'Ok',
        'Cancel'
      );
      expect(mockLocation.path).toHaveBeenCalled();
    });
    it('should call confirm modal with message when openEdge payment is voided', function () {
      mockPaymentGatewayFactory.mockCheckVoid.Value = true;
      var detail = {
        Claims: [{ ClaimId: 999 }],
        IsAuthorized: true,
        PaymentTypeId: 1,
        LocationId: 1,
        $$paymentType: { CurrencyTypeId: 1, Description: 'Insurance Payment' },
      };
      accountSummaryFactory.deleteInsurancePayment(detail, 'Some Person');
      $rootScope.$apply();
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Insurance Payment',
        'This payment has already been voided outside of Fuse. This action will only delete the payment from the Fuse ledger as the payment has already been returned to the card.',
        "Are you sure you want to remove this Insurance Payment payment from Some Person's balance?",
        'Yes',
        'No'
      );
      expect(mockLocation.path).toHaveBeenCalled();
    });
    it('should call confirm modal with message when no cc integration', function () {
      var detail = {
        Claims: [{ ClaimId: 999 }],
        Amount: 200,
        IsAuthorized: true,
        PaymentTypeId: 1,
        LocationId: 1,
        $$paymentType: { CurrencyTypeId: 1, Description: 'Insurance Payment' },
      };
      accountSummaryFactory.deleteInsurancePayment(detail, 'Some Person');
      $rootScope.$apply();
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Insurance Payment',
        null,
        'Are you sure you want to remove this Insurance Payment? The amount of $200 will be refunded to the insurance company.',
        'Yes',
        'No'
      );
      expect(mockLocation.path).toHaveBeenCalled();
    });
    it('should call confirm modal with message when no claim', function () {
      var detail = {
        Claims: [],
        IsAuthorized: false,
        PaymentTypeId: 1,
        LocationId: 1,
        $$paymentType: { CurrencyTypeId: 1, Description: 'Insurance Payment' },
      };
      accountSummaryFactory.deleteInsurancePayment(detail, 'Some Person');
      $rootScope.$apply();
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Delete Insurance Payment',
        "This is a converted insurance payment. Deleting the payment will not apply the amount back to the patient's annual maximum. Are you sure you want to remove this Insurance Payment?",
        'Yes',
        'No'
      );
      expect(
        mockDeleteInsurancePaymentFactory.deleteInsurancePayment
      ).toHaveBeenCalled();
    });
    it('should call confirm modal with are you sure message when not authorized', function () {
      var detail = {
        Claims: [{ ClaimId: 999 }],
        IsAuthorized: false,
        PaymentTypeId: 1,
        LocationId: 1,
        $$paymentType: { CurrencyTypeId: 1, Description: 'Insurance Payment' },
      };
      accountSummaryFactory.deleteInsurancePayment(detail, 'Some Person');
      $rootScope.$apply();
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Insurance Payment',
        null,
        'Are you sure you want to delete this Insurance Payment?',
        'Yes',
        'No'
      );
      expect(mockLocation.path).toHaveBeenCalled();
    });
  });

  describe('deleteAcctPaymentOrNegAdjustment function -> ', function () {
    beforeEach(function () {
      q.all = jasmine.createSpy().and.returnValue({
        then: function (callback) {
          callback(modalFactory.PaymentVoidConfirmModal);
        },
      });
    });
    it('should call confirm modal with message when cc and cc integration disabled', async function () {
      var mockPaymentGatewayTransactionDetails={
        Value:null
      }
      mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId =jasmine
      .createSpy('mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId')
      .and.returnValue({
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            then: function (callback) {
              callback( mockPaymentGatewayTransactionDetails);
            },
          },
        })
      });
      await accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          PatientName: 'John Doe',
          $$ispaymentGatewayEnabled: false,
          Description: 'Cash',
          Claims: [],
          ObjectId: 1,
          IsAuthorized: true,
          PaymentTypeId: 1,
          Amount: 200,
          TransactionTypeId: 2,
        },
        paymentTypes
      );
      expect(mockPaymentGatewayFactory.checkVoid).not.toHaveBeenCalled();
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Account Payment',
        'This payment was made using the Credit Card integration.  The Credit Card integration has since been disabled.  Deleting this payment will NOT return funds to the card.  Do you wish to continue?',
        null,
        'Ok',
        'Cancel'
      );
      expect(modalFactory.LoadingModal).toHaveBeenCalled();
    });
    it('should call confirm modal with message when cc and cc integration enabled and creditTransaction.Amount equals amount returned from call to getCreditTransactionByIdForAccount', async function () {
      mockCreditTransaction = { Amount: 200 };
      var mockPaymentGatewayTransactionDetails={
        Value:null
      }
      mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId =jasmine
      .createSpy('mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId')
      .and.returnValue({
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            then: function (callback) {
              callback( mockPaymentGatewayTransactionDetails);
            },
          },
        })
      });
      await accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          PatientName: 'John Doe',
          Description: 'Check',
          Claims: [],
          IsAuthorized: true,
          $$ispaymentGatewayEnabled: true,
          PaymentTypeId: 2,
          Amount: 200,
          ObjectId: 1,
          TransactionTypeId: 2,
          IsPaymentGatewayEnabled: true,
        },
        paymentTypes
      );
      expect(mockPaymentGatewayFactory.checkVoid).toHaveBeenCalled();
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Account Payment',
        null,
        'The total payment amount of $200.00 will be refunded to the card holder.  Are you sure you want to delete this credit card payment?',
        'Yes',
        'No'
      );
      expect(modalFactory.LoadingModal).toHaveBeenCalled();
    });
    it('should call confirm modal with message when cc and cc integration enabled if result from call to getCreditTransactionByIdForAccount shows Amount to be different than creditTransaction.Amount', async function () {
     var mockPaymentGatewayTransactionDetails={
        Value:null
      }
      mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId =jasmine
      .createSpy('mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId')
      .and.returnValue({
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            then: function (callback) {
              callback( mockPaymentGatewayTransactionDetails);
            },
          },
        })
      });

      await accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          IsAuthorized: true,
          $$ispaymentGatewayEnabled: true,
          Description: 'Cash',
          PaymentTypeId: 2,
          Amount: 89.0,
          ObjectId: 1234,
          TransactionTypeId: 2,
          IsPaymentGatewayEnabled: true,
        },
        paymentTypes
      );
      expect(mockPaymentGatewayFactory.checkVoid).toHaveBeenCalled();
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Account Payment',
        null,
        'This payment is distributed to multiple transactions.  The total payment amount of $200.00 will be refunded to the card holder.  Are you sure you want to delete this credit card payment?',
        'Yes',
        'No'
      );
      expect(modalFactory.LoadingModal).toHaveBeenCalled();
    });
    it('should call confirm modal with message when dbc and cc integration enabled', async function () {
      var paymentTypes = [{ PaymentTypeId: 1, CurrencyTypeId: accountSummaryFactory.CurrencyType.DebitCard }];
      var mockPaymentGatewayTransactionDetails={
        Value:null
      }
      mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId =jasmine
      .createSpy('mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId')
      .and.returnValue({
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            then: function (callback) {
              callback( mockPaymentGatewayTransactionDetails);
            },
          },
        })
      });
     await accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          PatientName: 'John Doe',
          Description: 'Check',
          Claims: [],
          $$ispaymentGatewayEnabled: true,
          IsAuthorized: true,
          PaymentTypeId: 1,
          Amount: 200,
          ObjectId: 1,
          TransactionTypeId: 2,
        },
        paymentTypes,
        function(){}
      );
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Account Payment',
        null,
        'Are you sure you want to delete this Check Account Payment? This transaction was tied to a debit card payment. A credit or debit card must be used to complete the refund.',
        'Yes',
        'No'
      );
      expect(
        mockPaymentGatewayService.patientAccountDebitCardReturn
      ).toHaveBeenCalled();
    });

    it('should call confirm modal with message and call patientAccountPaymentProviderDebitCardReturn when cc integration enabled and Payment Provider not OE', function (done) {
      var paymentTypes = [{ PaymentTypeId: 1, CurrencyTypeId: accountSummaryFactory.CurrencyType.DebitCard }];
       accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          PatientName: 'John Doe',
          Description: 'Debit Card Payment card ending in 9130 Transaction ID: 3860',
          Claims: [],
          $$ispaymentGatewayEnabled: true,
          IsAuthorized: true,
          PaymentTypeId: 1,
          Amount: -200,
          ObjectId: 1,
          $$accountId:345,
          TransactionTypeId: 2,
          
        },
        paymentTypes,
        function(){}
      );



      setTimeout(() => {
        expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalled();
        expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
          'Delete Account Payment',
          null,
          'Are you sure you want to delete this Debit Card Payment card ending in 9130 Transaction ID: 3860 Account Payment? This transaction was tied to a debit card payment. A credit or debit card must be used to complete the refund.',
          'Yes',
          'No'
        );
        expect(mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId).toHaveBeenCalled();
        expect(mockPaymentGatewayService.patientAccountPaymentProviderDebitCardReturn).toHaveBeenCalled(); // ✅ Should now pass
        expect(patientServices.CreditTransactions.payPageReturnRequest).toHaveBeenCalled();
        done(); // ✅ Mark async test as complete
      }, 0);

 
    });

    it('should call getPaymentGatewayTransactionByCreditTransactionId when deleting a debit card account payment that has Payment Integration enabled', async function () {
      var paymentTypes = [{ PaymentTypeId: 1, CurrencyTypeId: accountSummaryFactory.CurrencyType.DebitCard }];
       accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          PatientName: 'John Doe',
          Description: 'Debit Card Payment card ending in 9130 Transaction ID: 3860',
          Claims: [],
          IsAuthorized: true,
          PaymentTypeId: 1,
          Amount: -200,
          ObjectId: 1,
          $$accountId:345,
          TransactionTypeId: 2,
          
        },
        paymentTypes,
        function(){}
      );

      expect(mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId).toHaveBeenCalled();  
 
    });
    
    it('should call getPaymentGatewayTransactionByCreditTransactionId when deleting a credit card account payment that has Payment Integration enabled', async function () {
      var paymentTypes = [{ PaymentTypeId: 2, CurrencyTypeId: accountSummaryFactory.CurrencyType.CreditCard }];
       accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          PatientName: 'John Doe',
          Description: 'Credit Card Payment card ending in 9130 Transaction ID: 3860',
          Claims: [],
          IsAuthorized: true,
          PaymentTypeId: 2,
          Amount: 200,
          ObjectId: 1,
          $$accountId:345,
          TransactionTypeId: 2,
          
        },
        paymentTypes,
        function(){}
      );

      expect(mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId).toHaveBeenCalled();  
 
    });

    it('should not call getPaymentGatewayTransactionByCreditTransactionId when deleting a debit card account payment that does not have Payment Integration enabled', async function () {
      var paymentTypes = [{ PaymentTypeId: 1, CurrencyTypeId: accountSummaryFactory.CurrencyType.DebitCard }];
       accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          PatientName: 'John Doe',
          Description: 'Debit Card Payment card ending in 9130 Transaction ID: 3860',
          Claims: [],
          IsAuthorized: false,
          PaymentTypeId: 1,
          Amount: -200,
          ObjectId: 1,
          $$accountId:345,
          TransactionTypeId: 2,
          
        },
        paymentTypes,
        function(){}
      );

      expect(mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId).not.toHaveBeenCalled();  
 
    });

    it('should not call getPaymentGatewayTransactionByCreditTransactionId when deleting a credit card account payment that does not have Payment Integration enabled ', async function () {
      var paymentTypes = [{ PaymentTypeId: 2, CurrencyTypeId: accountSummaryFactory.CurrencyType.CreditCard}];
       accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          PatientName: 'John Doe',
          Description: 'Credit Card Payment card ending in 9130 Transaction ID: 3860',
          Claims: [],
          IsAuthorized: false,
          PaymentTypeId: 2,
          Amount: 200,
          ObjectId: 1,
          $$accountId:345,
          TransactionTypeId: 2,
          
        },
        paymentTypes,
        function(){}
      );

      expect(mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId).not.toHaveBeenCalled();  
 
    });

    it('should not call getPaymentGatewayTransactionByCreditTransactionId when deleting cash(other than credit/Debit card) account payment', async function () {
      var paymentTypes = [{ PaymentTypeId: 2, CurrencyTypeId: accountSummaryFactory.CurrencyType.Cash}];
       accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          PatientName: 'John Doe',
          Description: 'Cash',
          Claims: [],
          IsAuthorized: false,
          PaymentTypeId: 2,
          Amount: 200,
          ObjectId: 1,
          $$accountId:345,
          TransactionTypeId: 2,
          
        },
        paymentTypes,
        function(){}
      );

      expect(mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId).not.toHaveBeenCalled();  
 
    });

    it('should not call getPaymentGatewayTransactionByCreditTransactionId when deleting Neg Adj payment', async function () {
      var paymentTypes = [{ PaymentTypeId: 2, CurrencyTypeId: accountSummaryFactory.CurrencyType.Cash}];
       accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          PatientName: 'John Doe',
          Description: 'Negative Adjustment',
          Claims: [],
          IsAuthorized: false,
          Amount: -20,
          ObjectId: 1,
          $$accountId:345,
          TransactionTypeId: 4,
          
        },
        paymentTypes,
        function(){}
      );

      expect(mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId).not.toHaveBeenCalled();  
 
    });

    it('should call confirm modal with message when no cc', async function () {
      patientServices.CreditTransactions.getTransactionHistoryPaymentDetails = jasmine
        .createSpy()
        .and.returnValue({
          $promise: {
            then: function (callback) {
              callback({
                Value: {
                  IsAppliedAcrossEncounters: false,
                },
              });
            },
          },
        });
      await accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          PatientName: 'John Doe',
          Description: 'Cash',
          Claims: [],
          $$ispaymentGatewayEnabled: true,
          IsAuthorized: false,
          PaymentTypeId: 1,
          Amount: 200,
          ObjectId: 1,
          TransactionTypeId: 2,
        },
        paymentTypes
      );

      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Account Payment',
        null,
        'Are you sure you want to delete this Cash Account Payment?',
        'Yes',
        'No'
      );
      expect(modalFactory.LoadingModal).toHaveBeenCalled();
    });

    it('should call confirm modal with Vendor Payment appended message if Description is Vendor Payment and IsAppliedAcrossEncounters is true',async function () {
      mockCreditTransaction = {
        IsAppliedAcrossEncounters: true,
        PatientName: 'John Doe',
        Description: 'Vendor Payment',
        Claims: [],
        $$ispaymentGatewayEnabled: true,
        IsAuthorized: false,
        TransactionTypeId: 2,
      };
     await accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        mockCreditTransaction,
        paymentTypes
      );
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Account Payment',
        null,
        'This Account Payment is distributed to multiple transactions. If you continue, it will be deleted from all transactions.' +
          "\r\nThis account payment originated from a third party vendor. Deleting this payment in Fuse will not apply it back to the patient's card.",
        'Continue',
        'Cancel'
      );
    });

    it('should call confirm modal with Vendor Payment appended message if Description is Vendor Payment and IsAppliedAcrossEncounters is false', async function () {
      mockCreditTransaction = {
        IsAppliedAcrossEncounters: false,
        PatientName: 'John Doe',
        Description: 'Vendor Payment',
        Claims: [],
        $$ispaymentGatewayEnabled: true,
        IsAuthorized: false,
        TransactionTypeId: 2,
      };

      patientServices.CreditTransactions.getTransactionHistoryPaymentDetails = jasmine
        .createSpy()
        .and.returnValue({
          $promise: {
            then: function (callback) {
              callback({
                Value: {
                  IsAppliedAcrossEncounters: false,
                },
              });
            },
          },
        });

      await accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        mockCreditTransaction,
        paymentTypes
      );
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Account Payment',
        null,
        'Are you sure you want to delete this Vendor Payment Account Payment?' +
          "\r\nThis account payment originated from a third party vendor. Deleting this payment in Fuse will not apply it back to the patient's card.",
        'Yes',
        'No'
      );
    });

    it('should call confirm modal with message/ok/cancel IsAppliedAcrossEncounters', async function () {
      await accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          IsAppliedAcrossEncounters: true,
          PatientName: 'John Doe',
          Description: 'Cash',
          Claims: [],
          $$ispaymentGatewayEnabled: true,
          IsAuthorized: false,
          PaymentTypeId: 1,
          Amount: 200,
          ObjectId: 1,
          TransactionTypeId: 2,
        },
        paymentTypes
      );
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Account Payment',
        null,
        'This Account Payment is distributed to multiple transactions. If you continue, it will be deleted from all transactions.',
        'Continue',
        'Cancel'
      );
      expect(modalFactory.LoadingModal).toHaveBeenCalled();
    });

    it('should confirm debit card refund delete for payment that was already removed outside of fuse', async () => {
      mockPaymentGatewayFactory.checkVoid.and.returnValue({
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            then: function (callback) {
              callback({ Value: true });
            },
          },
        }),
      });
      await accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          IsAppliedAcrossEncounters: true,
          PatientName: 'John Doe',
          Description: 'Debit Card',
          Claims: [],
          $$ispaymentGatewayEnabled: true,
          IsAuthorized: true,
          PaymentTypeId: 3,
          Amount: 200,
          ObjectId: 1,
          TransactionTypeId: 2,
        },
        paymentTypes
      );
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Account Payment',
        'This payment has already been voided outside of Fuse. This action will only delete the payment from the Fuse ledger as the payment has already been returned to the card.',
        'Are you sure you want to delete this Debit Card Account Payment?',
        'Yes',
        'No'
      );
    });

    it('should confirm debit card refund for payment that was NOT deleted outside of fuse', async () => {
      mockPaymentGatewayFactory.checkVoid.and.returnValue({
        get: jasmine.createSpy().and.returnValue({
          $promise: {
            then: function (callback) {
              callback({ Value: false });
            },
          },
        }),
      });
      await accountSummaryFactory.deleteAcctPaymentOrNegAdjustment(
        {
          IsAppliedAcrossEncounters: true,
          PatientName: 'John Doe',
          Description: 'Debit Card',
          Claims: [],
          $$ispaymentGatewayEnabled: true,
          IsAuthorized: true,
          PaymentTypeId: 3,
          Amount: 200,
          ObjectId: 1,
          TransactionTypeId: 2,
        },
        paymentTypes
      );
      expect(modalFactory.PaymentVoidConfirmModal).toHaveBeenCalledWith(
        'Delete Account Payment',
        null,
        'Are you sure you want to delete this Debit Card Account Payment? This transaction was tied to a debit card payment. A credit or debit card must be used to complete the refund.',
        'Yes',
        'No'
      );
    });
  });

  describe('finishDeleteAcctPaymentOrNegAdjustment function -> ', function () {
    it('should return service object', function () {
      var res = accountSummaryFactory.finishDeleteAcctPaymentOrNegAdjustment(
        { $$accountId: 98, TransactionTypeId: 2, ObjectId: 1, DataTag: null },
        10000
      )();
      expect(res[0].Call).toEqual(
        patientServices.CreditTransactions.markAccountPaymentAsDeleted
      );
      expect(res[0].Params).toEqual({
        CreditTransactionId: 1,
        AccountId: 98,
        DataTag: null,
        DeletedCreditTransactionDetailDtos: [],
        PaymentGatewayTransactionRefundId: 10000,
      });
    });
  });

  describe('factory.setUnassignedTransactions function -> ', function () {
    beforeEach(function () {
      creditTransaction = {
        TransactionTypeId: 2,
        CreditTransactionDetails: [
          {
            EncounterId: null,
            AppliedTransactionId: null,
            ProviderUserId: 1,
            TransactionTypeId: 2,
          },
        ],
      };
    });
    it('should return unapplied transaction object with the correct provider assigned (provider 1)', function () {
      var result = accountSummaryFactory.setUnassignedTransactions(
        creditTransaction.CreditTransactionDetails,
        providers
      );

      expect(result[0].UnassignedText).toBe('Unapplied');
      expect(result[0].ProviderDisplayName).toBe('Chris Archer, Doctor');
    });
    it('should return unapplied transaction object with the correct provider assigned (provider 2)', function () {
      creditTransaction.CreditTransactionDetails[0].ProviderUserId = 2;
      var result = accountSummaryFactory.setUnassignedTransactions(
        creditTransaction.CreditTransactionDetails,
        providers
      );

      expect(result[0].UnassignedText).toBe('Unapplied');
      expect(result[0].ProviderDisplayName).toBe('Kyle Deak, Doctor');
    });
    it('should return unapplied transaction object with NO provider assigned', function () {
      // No provider - unassigned
      creditTransaction.CreditTransactionDetails[0].ProviderUserId = null;
      var result = accountSummaryFactory.setUnassignedTransactions(
        creditTransaction.CreditTransactionDetails,
        providers
      );

      expect(result[0].UnassignedText).toBe('Unapplied');
      expect(result[0].ProviderDisplayName).toBe(null);
      expect(result.length).toBe(1);
    });
    it('should NOT return unapplied transactions when 3rd param is false and either AppliedToDebitTransactionId or AppliedToServiceTransationId is not null,', function () {
      // No provider - unassigned
      creditTransaction.CreditTransactionDetails[0].ProviderUserId = null;
      var result = accountSummaryFactory.setUnassignedTransactions(
        creditTransaction.RelatedDebitTransactions,
        providers,
        false
      );

      expect(result[0]).toBe(undefined);
      expect(result.length).toBe(0);
    });
  });

  describe('getTransactionHistory function -> ', function () {
    it('should call patientServices.AccountSummary.getTransactionHistory', function () {
      accountSummaryFactory.getTransactionHistory();

      expect(
        patientServices.AccountSummary.getTransactionHistory
      ).toHaveBeenCalled();
    });
  });

  describe('getPaymentGatewayTransactionData',function(){
    it('should return transaction details when successful', async function () {
      var mockCreditTransaction = { ObjectId: 123 };
      var mockResponse = { Value: { PaymentGatewayTransactionId: 500,GatewayTransactionType:accountSummaryFactory.GatewayTransactionType.DebitCard }};

 
      // Call the function
      var result = await  accountSummaryFactory.getPaymentGatewayTransactionData(mockCreditTransaction);

      
      expect(mockPaymentGatewayFactory.getPaymentGatewayTransactionByCreditTransactionId).toHaveBeenCalled();
      // Assert the returned value
      expect(result).toEqual(mockResponse.Value);

   });
  })

  describe('accountPaymentProviderDebitCardReturn',function(){
    it('should return paymentGatewayTransactionId ', async function () {

      var mockCreditTransaction = { $$ispaymentGatewayEnabled: true, IsAuthorized: true, ObjectId: 123,$$accountId:345,Amount:456 };
      var mockResponse = { Value: {  PaymentGatewayTransactionId: 4713 }};

      // Call the function
      var result = await  accountSummaryFactory.accountPaymentProviderDebitCardReturn(mockCreditTransaction);
      
      expect(mockPaymentGatewayService.patientAccountPaymentProviderDebitCardReturn).toHaveBeenCalled();
     expect(result).toEqual(mockResponse.Value);

   });
  })


  describe('getPayPageUrl',function(){
   it('should call PaymentGatewayService createPaymentProviderCreditOrDebitPayment when selected location have GPI is enabled and credit card is selected', async() => {
    const transactionToBeRefunded={ LocationId:1,GatewayTransactionType: accountSummaryFactory.GatewayTransactionType.DebitCard,PaymentProvider:accountSummaryFactory.PaymentProviders.TransactionsUI}
    const oldPaymentGatewayTransactionId =234;
    const paymentGatewayTransactionId = 456;

    var paymentIntentDto  = {
      LocationId: transactionToBeRefunded.LocationId,
      PaymentGatewayPaymentTransactionId: oldPaymentGatewayTransactionId,
      PaymentGatewayRefundTransactionId: paymentGatewayTransactionId,
      RedirectUrl:location.origin + '/v1.0/index.html?v=1.0.0.1#/paypage-redirect-callback'
  }
    const mockSanitizedUrl = 'https://web.test.paygateway.com/paypage/v1/returns/123';
    var result = await  accountSummaryFactory.getPayPageUrl(transactionToBeRefunded.LocationId,oldPaymentGatewayTransactionId,paymentGatewayTransactionId);
    
    expect(patientServices.CreditTransactions.payPageReturnRequest).toHaveBeenCalled();
    expect(patientServices.CreditTransactions.payPageReturnRequest).toHaveBeenCalledWith(paymentIntentDto);
    expect(result.$$unwrapTrustedValue()).toEqual(sce.trustAsResourceUrl(mockSanitizedUrl).$$unwrapTrustedValue())
    });

  })

});
