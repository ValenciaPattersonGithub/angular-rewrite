import { of } from 'rsjs';

describe('account-service-transaction-factory->', function () {
  var accountServiceTransactionFactory;
  var $q;
  var patientValidationFactoryMock;
  /** @type {{ Modal: jasmine.Spy; }} */
  var modalFactoryMock;
  var toastrFactoryMock;
  var patSecurityServiceMock;
  var patientServicesMock;
  var modalOptionsSpy;
  var closeClaimServiceMock;
  var referenceDataServiceMock;
  var featureFlagServiceMock;

  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(module('Soar.Patient'));

  beforeEach(
    module(function ($provide) {
      patSecurityServiceMock = {
        IsAuthorizedByAbbreviation: jasmine
          .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
          .and.returnValue(true),
        logout: jasmine.createSpy('patSecurityService.logout'),
        generateMessage: jasmine.createSpy(
          'patSecurityService.generateMessage'
        ),
      };
      $provide.value('patSecurityService', patSecurityServiceMock);

      featureFlagServiceMock = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagServiceMock);

      toastrFactoryMock = {
        error: jasmine.createSpy('toastrFactory.error'),
        success: jasmine.createSpy('toastrFactory.success'),
      };
      $provide.value('toastrFactory', toastrFactoryMock);

      patientValidationFactoryMock = {
        userLocationAuthorization: jasmine
          .createSpy('patientValidationFactory.userLocationAuthorization')
          .and.returnValue({
            authorization: {
              UserIsAuthorizedToAtLeastOnePatientLocation: true,
            },
          }),
        LaunchUserLocationErrorModal: jasmine.createSpy(
          'patientValidationFactory.LaunchUserLocationErrorModal'
        ),
      };
      $provide.value('PatientValidationFactory', patientValidationFactoryMock);

      modalFactoryMock = {
        Modal: jasmine
          .createSpy('mockModalFactory.Modal')
          .and.callFake(function (options) {
            modalOptionsSpy = options;
            return {
              result: {
                then: callback => callback(),
              },
            };
          }),
        ConfirmModal: jasmine
          .createSpy('modalFactory.ConfirmModal')
          .and.returnValue({
            then: callback => callback(),
          }),
        ServiceTransactionCrudCloseClaimModal: jasmine
          .createSpy('modalFactory.ServiceTransactionCrudCloseClaimModal')
          .and.returnValue({
            then: callback => callback({ recreate: true }),
          }),
      };
      $provide.value('ModalFactory', modalFactoryMock);

      closeClaimServiceMock = {
        update: jasmine.createSpy('CloseClaimService.update').and.returnValue({
          $promise: {
            then: callback => callback(),
          },
        }),
      };
      $provide.value('CloseClaimService', closeClaimServiceMock);

      patientServicesMock = {
        Claim: {
          getClaimsByServiceTransaction: jasmine
            .createSpy('patientServices.Claim.getClaimsByServiceTransaction')
            .and.returnValue({
              $promise: {
                Value: [],
              },
            }),
          getServiceTransactionsByClaimId: jasmine
            .createSpy('patientServices.Claim.getServiceTransactionsByClaimId')
            .and.returnValue({
              $promise: {
                then: fn =>
                  fn({
                    Value: [
                      {
                        ServiceTransaction: {
                          ServiceTransactionId: 1,
                          ServiceCodeId: 12,
                        },
                      },
                    ],
                  }),
              },
            }),
          recreateMultipleClaims: jasmine
            .createSpy('patientServices.Claim.recreateMultipleClaims')
            .and.returnValue({
              $promise: {
                then: callback => callback(),
              },
            }),
        },
        ServiceTransactions: {
          getAppliedTransactionInformation: jasmine
            .createSpy(
              'patientServices.ServiceTransactions.getAppliedTransactionInformation'
            )
            .and.returnValue({
              $promise: {
                Value: {},
              },
            }),
          markDeleted: jasmine
            .createSpy('patientServices.ServiceTransactions.markDeleted')
            .and.returnValue({
              $promise: {
                then: fn => fn(),
              },
            }),
        },
        Patients: {
          get: jasmine
            .createSpy('patientServices.Patients.get')
            .and.returnValue({
              $promise: {
                Value: {},
              },
            }),
        },
        Encounter: {
          getAllEncountersByEncounterId: jasmine
            .createSpy(
              'patientServices.Encounter.getAllEncountersByEncounterId'
            )
            .and.returnValue({
              $promise: {
                Value: {
                  ServiceTransactionDtos: [
                    {
                      ServiceTransactionId: 2,
                      ServiceTransactionStatusId: 4,
                      EnteredByUserId: 3,
                      LocationId: 5,
                      DateEntered: '',
                    },
                  ],
                },
              },
            }),
        },
      };
      $provide.value('PatientServices', patientServicesMock);

      referenceDataServiceMock = {
        getData: jasmine
          .createSpy('referenceDataService.getData')
          .and.callFake(entity => {
            if (entity === 'users') {
              return [{ ServiceCodeId: 12, Code: 'D0120' }];
            } else if (entity === 'serviceTypes') {
              return [{ ServiceCodeId: 12, Code: 'D0120' }];
            } else if (entity === 'locations') {
              return [{ LocationId: 5, Timezone: 'Central Standard Time' }];
            } else if (entity === 'serviceCodes') {
              return [{ ServiceCodeId: 12, Code: 'fakeCode' }];
            }
            return [];
          }),
        entityNames: {
          locations: 'locations',
          serviceTypes: 'serviceTypes',
          users: 'users',
          serviceCodes: 'serviceCodes',
        },
      };
      $provide.value('referenceDataService', referenceDataServiceMock);
    })
  );

  var $rootScope;
  beforeEach(inject(function (
    _$rootScope_,
    _$q_,
    _AccountServiceTransactionFactory_
  ) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    spyOn($q, 'all').and.callThrough();
    accountServiceTransactionFactory = _AccountServiceTransactionFactory_;
  }));

  describe('factory initialization', function () {
    it('should have defined methods', function () {
      expect(
        accountServiceTransactionFactory.viewOrEditServiceTransaction
      ).toBeDefined();
      expect(
        accountServiceTransactionFactory.deleteServiceTransaction
      ).toBeDefined();
    });
  });

  describe('factory.viewOrEditServiceTransaction - edit -> ', function () {
    it('should throw error when not authorized', function () {
      var callback = jasmine.createSpy('successCallback');
      patSecurityServiceMock.IsAuthorizedByAbbreviation.and.returnValue(false);
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        1,
        2,
        5,
        4,
        true,
        callback
      );
      $rootScope.$apply();
      expect($q.all).not.toHaveBeenCalled();
      expect(toastrFactoryMock.error).toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should throw error when not authorized at location', function () {
      patientValidationFactoryMock.userLocationAuthorization.and.returnValue({
        authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: false },
      });
      var callback = jasmine.createSpy('successCallback');
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        1,
        2,
        5,
        4,
        true,
        callback
      );
      $rootScope.$apply();
      expect($q.all).toHaveBeenCalled();
      expect(
        patientValidationFactoryMock.LaunchUserLocationErrorModal
      ).toHaveBeenCalled();
      expect(modalFactoryMock.Modal).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should throw error when service has an insurance payment', function () {
      patientServicesMock.ServiceTransactions.getAppliedTransactionInformation.and.returnValue(
        {
          $promise: {
            Value: { HasInsurancePayment: true },
          },
        }
      );
      var callback = jasmine.createSpy('successCallback');
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        1,
        2,
        5,
        4,
        true,
        callback
      );
      $rootScope.$apply();
      expect($q.all).toHaveBeenCalled();
      expect(modalFactoryMock.ConfirmModal).toHaveBeenCalledWith(
        'Invalid Action',
        'This transaction has an insurance payment applied to it and cannot be {0} until the insurance payment has been deleted.',
        'OK'
      );
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call modalFactory.Modal when authorized', function () {
      var claims = [{ Status: 3, PatientBenefitPlanPriority: 3, Type: 1 }];
      var callback = jasmine.createSpy('successCallback');
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        1,
        2,
        5,
        4,
        true,
        callback,
        claims
      );
      $rootScope.$apply();
      expect(modalFactoryMock.Modal).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(
        modalOptionsSpy.resolve.DataForModal().Transaction.$$claimPriority
      ).toEqual(3);
    });
    it('should format DateEntered for UTC when DateEntered is not formatted for UTC', function () {
      var callback = jasmine.createSpy('successCallback');
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        1,
        2,
        5,
        4,
        true,
        callback
      );
      $rootScope.$apply();
      expect(modalFactoryMock.Modal).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(
        modalOptionsSpy.resolve.DataForModal().Transaction.DateEntered
      ).toEqual('Z');
    });
    it('should not format DateEntered for UTC when DateEntered is formatted for UTC', function () {
      patientServicesMock.Encounter.getAllEncountersByEncounterId.and.returnValue(
        {
          $promise: {
            Value: {
              ServiceTransactionDtos: [
                {
                  ServiceTransactionId: 2,
                  ServiceTransactionStatusId: 4,
                  EnteredByUserId: 3,
                  LocationId: 5,
                  DateEntered: '2019-07-18T20:46:30Z',
                },
              ],
            },
          },
        }
      );
      var callback = jasmine.createSpy('successCallback');
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        1,
        2,
        5,
        4,
        true,
        callback
      );
      $rootScope.$apply();
      expect(modalFactoryMock.Modal).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(
        modalOptionsSpy.resolve.DataForModal().Transaction.DateEntered
      ).toEqual('2019-07-18T20:46:30Z');
    });
  });

  describe('factory.viewOrEditServiceTransaction - view -> ', function () {
    it('should throw error when not authorized', function () {
      var callback = jasmine.createSpy('successCallback');
      patSecurityServiceMock.IsAuthorizedByAbbreviation.and.returnValue(false);
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        1,
        2,
        5,
        4,
        false,
        callback
      );
      $rootScope.$apply();
      expect($q.all).not.toHaveBeenCalled();
      expect(toastrFactoryMock.error).toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not throw error when not authorized at location', function () {
      patientValidationFactoryMock.userLocationAuthorization.and.returnValue({
        authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: false },
      });
      var callback = jasmine.createSpy('successCallback');
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        1,
        2,
        5,
        4,
        false,
        callback
      );
      $rootScope.$apply();
      expect($q.all).toHaveBeenCalled();
      expect(
        patientValidationFactoryMock.LaunchUserLocationErrorModal
      ).not.toHaveBeenCalled();
      expect(modalFactoryMock.Modal).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it('should not throw error when service has an insurance payment', function () {
      patientServicesMock.ServiceTransactions.getAppliedTransactionInformation.and.returnValue(
        {
          $promise: {
            Value: { HasInsurancePayment: true },
          },
        }
      );
      var callback = jasmine.createSpy('successCallback');
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        1,
        2,
        5,
        4,
        false,
        callback
      );
      $rootScope.$apply();
      expect($q.all).toHaveBeenCalled();
      expect(modalFactoryMock.ConfirmModal).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it('should call modalFactory.Modal when authorized', function () {
      var claims = [{ Status: 3, PatientBenefitPlanPriority: 3, Type: 1 }];
      var callback = jasmine.createSpy('successCallback');
      accountServiceTransactionFactory.viewOrEditServiceTransaction(
        1,
        2,
        5,
        4,
        false,
        callback,
        claims
      );
      $rootScope.$apply();
      expect(modalFactoryMock.Modal).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(
        modalOptionsSpy.resolve.DataForModal().Transaction.$$claimPriority
      ).toEqual(3);
    });
  });

  describe('factory.deleteServiceTransaction - delete ->', function () {
    var success;
    beforeEach(function () {
      success = jasmine.createSpy('success');
    });

    it('should throw toastr when not authorized', function () {
      patSecurityServiceMock.IsAuthorizedByAbbreviation.and.returnValue(false);
      accountServiceTransactionFactory.deleteServiceTransaction(
        1,
        2,
        3,
        success
      );
      $rootScope.$apply();
      expect(success).not.toHaveBeenCalled();
      expect(toastrFactoryMock.error).toHaveBeenCalled();
    });
    it('should throw toastr when delete fails', function () {
      patientServicesMock.ServiceTransactions.markDeleted.and.returnValue({
        $promise: {
          then: (_success, failure) => failure(),
        },
      });
      accountServiceTransactionFactory.deleteServiceTransaction(
        1,
        2,
        3,
        success
      );
      $rootScope.$apply();
      expect(success).not.toHaveBeenCalled();
      expect(toastrFactoryMock.error).toHaveBeenCalled();
    });
    it('should launch location error modal when location not authorized', function () {
      patientValidationFactoryMock.userLocationAuthorization.and.returnValue({
        authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: false },
      });
      accountServiceTransactionFactory.deleteServiceTransaction(
        1,
        2,
        3,
        success
      );
      $rootScope.$apply();
      expect(
        patientValidationFactoryMock.LaunchUserLocationErrorModal
      ).toHaveBeenCalled();
      expect(success).not.toHaveBeenCalled();
    });
    it('should throw confirm message when associated with insurance payment', function () {
      patientServicesMock.ServiceTransactions.getAppliedTransactionInformation.and.returnValue(
        {
          $promise: {
            Value: { HasInsurancePayment: true },
          },
        }
      );
      accountServiceTransactionFactory.deleteServiceTransaction(
        1,
        2,
        3,
        success
      );
      $rootScope.$apply();
      expect(modalFactoryMock.ConfirmModal).toHaveBeenCalledWith(
        'Invalid Action',
        'This transaction has an insurance payment applied to it and cannot be {0} until the insurance payment has been deleted.',
        'OK'
      );
      expect(success).not.toHaveBeenCalled();
    });
    it('should show confirm message', function () {
      accountServiceTransactionFactory.deleteServiceTransaction(
        1,
        2,
        3,
        success
      );
      $rootScope.$apply();
      expect(modalFactoryMock.ConfirmModal).toHaveBeenCalledWith(
        'Delete {0}',
        "Are you sure you want to delete this service code from {0}'s account?",
        'Yes',
        'No'
      );
      expect(toastrFactoryMock.success).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
    });
    it('should include fee schedule message when fee schedules exist', function () {
      patientServicesMock.ServiceTransactions.getAppliedTransactionInformation.and.returnValue(
        {
          $promise: {
            Value: { HasFeeScheduleAdjustment: true },
          },
        }
      );
      accountServiceTransactionFactory.deleteServiceTransaction(
        1,
        2,
        3,
        success
      );
      $rootScope.$apply();
      expect(modalFactoryMock.ConfirmModal).toHaveBeenCalledWith(
        'Delete {0}',
        "Deleting this service transaction will delete the corresponding fee schedule adjustment.\nAre you sure you want to delete this service code from {0}'s account?",
        'Yes',
        'No'
      );
      expect(toastrFactoryMock.success).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
    });
    it('should include fee schedule and other payment message when fee schedules and other payments exist', function () {
      patientServicesMock.ServiceTransactions.getAppliedTransactionInformation.and.returnValue(
        {
          $promise: {
            Value: {
              HasFeeScheduleAdjustment: true,
              HasNonWriteoffNonInsurancePaymentCredit: true,
            },
          },
        }
      );
      accountServiceTransactionFactory.deleteServiceTransaction(
        1,
        2,
        3,
        success
      );
      $rootScope.$apply();
      expect(modalFactoryMock.ConfirmModal).toHaveBeenCalledWith(
        'Delete {0}',
        "Deleting this service transaction will delete the corresponding fee schedule adjustment.\nThis transaction has a payment or negative adjustment applied to it, deleting it will result in an unapplied amount on {0}'s account. Continue?",
        'Yes',
        'No'
      );
      expect(toastrFactoryMock.success).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
    });
    it('should close claims and reopen when requested', function () {
      patientServicesMock.Claim.getClaimsByServiceTransaction.and.returnValue({
        $promise: {
          Value: [{ Status: 3, ClaimId: 4, Type: 1 }],
        },
      });
      accountServiceTransactionFactory.deleteServiceTransaction(
        1,
        2,
        3,
        success
      );
      $rootScope.$apply();
      expect(closeClaimServiceMock.update).toHaveBeenCalled();
      expect(
        patientServicesMock.Claim.recreateMultipleClaims
      ).toHaveBeenCalled();
      expect(toastrFactoryMock.success.calls.count()).toEqual(3); // close claim, update service, recreate claim
      expect(success).toHaveBeenCalled();
    });
    it('should include fee schedule and other payment message when fee schedules and other payments exist and open claim', function () {
      patientServicesMock.Claim.getClaimsByServiceTransaction.and.returnValue({
        $promise: {
          Value: [{ Status: 3, ClaimId: 4, Type: 1 }],
        },
      });
      patientServicesMock.ServiceTransactions.getAppliedTransactionInformation.and.returnValue(
        {
          $promise: {
            Value: {
              HasFeeScheduleAdjustment: true,
              HasNonWriteoffNonInsurancePaymentCredit: true,
            },
          },
        }
      );
      accountServiceTransactionFactory.deleteServiceTransaction(
        1,
        2,
        3,
        success
      );
      $rootScope.$apply();
      expect(closeClaimServiceMock.update).toHaveBeenCalled();
      expect(
        patientServicesMock.Claim.recreateMultipleClaims
      ).toHaveBeenCalled();
      expect(toastrFactoryMock.success.calls.count()).toEqual(3); // close claim, update service, recreate claim
      expect(success).toHaveBeenCalled();
    });
    it('should pass claim with original DataTag, and checkDataTag = true when closing claim from account summary', function () {
      var datatag = 1;
      var claimId = 4;
      patientServicesMock.Claim.getClaimsByServiceTransaction.and.returnValue({
        $promise: {
          Value: [{ Status: 3, ClaimId: claimId, Type: 1, DataTag: datatag }],
        },
      });
      var openClaim = {
        ClaimId: claimId,
        Status: 3,
        Type: 1,
        DataTag: datatag,
      };
      var claimToClose = {
        ClaimId: claimId,
        NoInsurancePayment: false,
        IsEdited: true,
        UpdateServiceTransactions: true,
        Note: undefined,
        DataTag: datatag,
      };
      accountServiceTransactionFactory.deleteServiceTransaction(
        1,
        2,
        3,
        success,
        { openClaim }
      );
      $rootScope.$apply();
      expect(closeClaimServiceMock.update).toHaveBeenCalledWith(
        { checkDataTag: true },
        claimToClose
      );
      expect(success).toHaveBeenCalled();
    });
    it('should pass claim with current DataTag, and checkDataTag = true when closing claim from transaction history', function () {
      var datatag = 1;
      var claimId = 4;
      patientServicesMock.Claim.getClaimsByServiceTransaction.and.returnValue({
        $promise: {
          Value: [{ Status: 3, ClaimId: claimId, Type: 1, DataTag: datatag }],
        },
      });
      var claimToClose = {
        ClaimId: claimId,
        NoInsurancePayment: false,
        IsEdited: true,
        UpdateServiceTransactions: true,
        Note: undefined,
        DataTag: datatag,
      };
      accountServiceTransactionFactory.deleteServiceTransaction(
        1,
        2,
        3,
        success
      );
      $rootScope.$apply();
      expect(closeClaimServiceMock.update).toHaveBeenCalledWith(
        { checkDataTag: true },
        claimToClose
      );
      expect(success).toHaveBeenCalled();
    });
  });
});
