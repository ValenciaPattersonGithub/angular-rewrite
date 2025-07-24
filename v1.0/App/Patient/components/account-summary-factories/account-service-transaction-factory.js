'use strict';

angular.module('Soar.Patient').factory('AccountServiceTransactionFactory', [
  '$q',
  '$filter',
  'toastrFactory',
  'localize',
  'referenceDataService',
  'patSecurityService',
  'PatientServices',
  'PatientValidationFactory',
  'TimeZoneFactory',
  'ModalFactory',
  'CloseClaimService',
  'ServiceTypesService',
  'FeatureFlagService',
  'FuseFlag',
  /**
   *
   * @param {angular.IQService} $q
   * @param {angular.IFilterService} $filter
   * @param {*} toastrFactory
   * @param {*} localize
   * @param {{ getData: (entity: string) => angular.IPromise<any>; }} referenceDataService
   * @param {*} patSecurityService
   * @param {*} patientServices
   * @param {*} patientValidationFactory
   * @param {*} timeZoneFactory
   * @param {*} modalFactory
   * @param {*} closeClaimService
   * @param {{ getAll: () => angular.IPromise<any>; }} serviceTypesService
   * @param {*} featureFlagService
   * @param {*} fuseFlag
   * @returns
   */
  function (
    $q,
    $filter,
    toastrFactory,
    localize,
    referenceDataService,
    patSecurityService,
    patientServices,
    patientValidationFactory,
    timeZoneFactory,
    modalFactory,
    closeClaimService,
    serviceTypesService,
    featureFlagService,
    fuseFlag,
  ) {
    var factory = this;
    var soarAuthSvcTrViewKey = 'soar-acct-actsrv-view';
    var soarAuthSvcTrEditKey = 'soar-acct-actsrv-edit';
    var soarAuthSvcTrDeleteKey = 'soar-acct-actsrv-delete';
    var soarAuthClaimViewKey = 'soar-ins-iclaim-view';

    //view or edit
    factory.viewOrEditServiceTransaction = function (
      encounterId,
      serviceTransactionId,
      locationId,
      personId,
      isEdit,
      successCallback,
      claims
    ) {
      //can't view if not authorized to view services
      if (
        !isEdit &&
        !patSecurityService.IsAuthorizedByAbbreviation(soarAuthSvcTrViewKey)
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthSvcTrViewKey),
          'Not Authorized'
        );
        return;
      }

      //can't edit if not authorized to edit services
      if (
        isEdit &&
        !patSecurityService.IsAuthorizedByAbbreviation(soarAuthSvcTrEditKey)
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthSvcTrEditKey),
          'Not Authorized'
        );
        return;
      }

      //gather data for pre-checks and to collect data required by transaction-crud modal
      var promises = [
        patientServices.Encounter.getAllEncountersByEncounterId({
          encounterId: encounterId,
        }).$promise,
        patientServices.Claim.getClaimsByServiceTransaction({
          serviceTransactionId: serviceTransactionId,
          claimType: 1,
        }).$promise,
        patientValidationFactory.userLocationAuthorization(locationId),
        patientServices.ServiceTransactions.getAppliedTransactionInformation({
          serviceTransactionId: serviceTransactionId,
        }).$promise,
        patientServices.Patients.get({ Id: personId }).$promise,
        referenceDataService.getData(
          referenceDataService.entityNames.serviceCodes
        ),
        referenceDataService.getData(referenceDataService.entityNames.users),
        new Promise((resolve) => {
          serviceTypesService.getAll().then(serviceTypes => {
            resolve(serviceTypes);
          });
        }),
        referenceDataService.getData(
          referenceDataService.entityNames.locations
        ),
      ];
      $q.all(promises).then(function (results) {
        var encounter = results[0].Value;
        var serviceTransaction = _.find(encounter.ServiceTransactionDtos, {
          ServiceTransactionId: serviceTransactionId,
        });
        var originalClaim = _.find(claims, function (claim) {
          return claim.Status !== 7 && claim.Status !== 8 && claim.Type == 1;
        });
        var openClaim = originalClaim
          ? originalClaim
          : _.find(results[1].Value, function (claim) {
              return (
                claim.Status !== 7 && claim.Status !== 8 && claim.Type == 1
              );
            });
        var locationAuthorization = results[2];
        var userHasServiceLocationAccess =
          locationAuthorization.authorization
            .UserIsAuthorizedToAtLeastOnePatientLocation;
        var appliedInformation = results[3].Value;
        var patient = results[4].Value;
        var providers = results[6];
        var serviceTypes = results[7];
        var locations = results[8];

        //can't edit if not authorized at the service's location
        if (isEdit && !userHasServiceLocationAccess) {
          patientValidationFactory.LaunchUserLocationErrorModal(
            locationAuthorization,
            'edit'
          );
          return;
        }
        //can't edit if service has an insurance payment applied to it
        if (isEdit && appliedInformation.HasInsurancePayment) {
          var title = localize.getLocalizedString('Invalid Action');
          var message = localize.getLocalizedString(
            'This transaction has an insurance payment applied to it and cannot be {0} until the insurance payment has been deleted.',
            ['edited']
          );
          var button1Text = localize.getLocalizedString('OK');
          modalFactory.ConfirmModal(title, message, button1Text);
          return;
        }

        prepServiceTransaction(
          encounter,
          serviceTransaction,
          openClaim,
          providers,
          patient,
          appliedInformation,
          locations
        );
        modalFactory
          .Modal({
            templateUrl:
              'App/Patient/components/transaction-crud/transaction-crud.html',
            keyboard: false,
            windowClass: 'modal-60',
            backdrop: 'static',
            controller: 'TransactionCrudController',
            amfa: soarAuthSvcTrViewKey,
            resolve: {
              DataForModal: function () {
                return {
                  AdjustmentTypes: [],
                  EditMode: isEdit,
                  Patient: patient,
                  Providers: providers,
                  ServiceCodes: results[5],
                  ServiceTypes: serviceTypes,
                  Transaction: serviceTransaction,
                };
              },
            },
          })
          .result.then(successCallback);
      });
    };

    //for view or edit - could be handled by transaction-crud if it was ever refactored
    var prepServiceTransaction = function (
      encounter,
      serviceTransaction,
      openClaim,
      providers,
      patient,
      appliedInformation,
      locations
    ) {
      var ofcLocation = _.find(locations, {
        LocationId: serviceTransaction.LocationId,
      });
      var locationTimezone = ofcLocation ? ofcLocation.Timezone : '';
      serviceTransaction.LocationNameLine1 = ofcLocation
        ? ofcLocation.NameLine1
        : null;
      serviceTransaction.TitleDate = timeZoneFactory
        .ConvertDateToMomentTZ(serviceTransaction.DateEntered, locationTimezone)
        .format('MM/DD/YYYY');
      serviceTransaction.RelatedEncounterDate = timeZoneFactory
        .ConvertDateToMomentTZ(
          _.min(_.map(encounter.ServiceTransactionDtos, 'DateEntered')),
          locationTimezone
        )
        .format('MM/DD/YYYY');
      if (!serviceTransaction.DateEntered.toLowerCase().endsWith('z')) {
        serviceTransaction.DateEntered += 'Z';
      }
      serviceTransaction.OpenClaim = openClaim;
      serviceTransaction.$$claimPriority = openClaim
        ? openClaim.PatientBenefitPlanPriority
        : null;
      serviceTransaction.InProcess = openClaim
        ? openClaim.Status === 4 || openClaim.Status === 9
        : false;
      serviceTransaction.TransactionType = localize.getLocalizedString(
        'Service'
      );
      var userEntered = _.find(providers, {
        UserId: serviceTransaction.EnteredByUserId,
      });
      serviceTransaction.EnteredByName = userEntered
        ? userEntered.FirstName +
          ' ' +
          userEntered.LastName +
          (userEntered.ProfessionalDesignation
            ? ', ' + userEntered.ProfessionalDesignation
            : '')
        : null;
      serviceTransaction.PatientDetailedName = $filter(
        'getPatientNameAsPerBestPractice'
      )(patient);
      serviceTransaction.AlreadyPaidAmount =
        appliedInformation.AlreadyPaidAmount;
      serviceTransaction.hasCheckoutFeeScheduleWriteOff =
        appliedInformation.HasFeeScheduleAdjustmentFromCheckout;
      serviceTransaction.hasFeeScheduleWriteOff =
        appliedInformation.HasFeeScheduleAdjustment;
      serviceTransaction.HasNonWriteoffNonInsurancePaymentCredit =
        appliedInformation.HasNonWriteoffNonInsurancePaymentCredit;
    };

    //delete
    factory.deleteServiceTransaction = function (
      serviceTransactionId,
      locationId,
      personId,
      successCallback,
      claims
    ) {
      //can't delete if not authorized to delete services
      if (
        !patSecurityService.IsAuthorizedByAbbreviation(soarAuthSvcTrDeleteKey)
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthSvcTrDeleteKey),
          'Not Authorized'
        );
        return;
      }
      var promises = [
        patientServices.Claim.getClaimsByServiceTransaction({
          serviceTransactionId: serviceTransactionId,
          claimType: 1,
        }).$promise,
        patientValidationFactory.userLocationAuthorization(locationId),
        patientServices.ServiceTransactions.getAppliedTransactionInformation({
          serviceTransactionId: serviceTransactionId,
        }).$promise,
        patientServices.Patients.get({ Id: personId }).$promise,
        referenceDataService.getData(
          referenceDataService.entityNames.serviceCodes
        ),
      ];
      $q.all(promises).then(function (results) {
        var originalOpenClaim = _.find(claims, function (claim) {
          return claim.Status !== 7 && claim.Status !== 8 && claim.Type == 1;
        }); //used when calling from account summary
        var currentOpenClaim = _.find(results[0].Value, function (claim) {
          return claim.Status !== 7 && claim.Status !== 8 && claim.Type == 1;
        });
        var claimServicesPromise = currentOpenClaim
          ? patientServices.Claim.getServiceTransactionsByClaimId({
              claimId: currentOpenClaim.ClaimId,
              includeServiceData: true,
            }).$promise
          : null;
        var locationAuthorization = results[1];
        var userHasServiceLocationAccess =
          locationAuthorization.authorization
            .UserIsAuthorizedToAtLeastOnePatientLocation;
        var appliedInformation = results[2].Value;
        var patient = results[3].Value;

        //can't delete if not authorized at the service's location
        if (!userHasServiceLocationAccess) {
          patientValidationFactory.LaunchUserLocationErrorModal(
            locationAuthorization,
            'delete'
          );
          return;
        }

        //can't delete if service has an insurance payment applied to it
        if (appliedInformation.HasInsurancePayment) {
          modalFactory.ConfirmModal(
            localize.getLocalizedString('Invalid Action'),
            localize.getLocalizedString(
              'This transaction has an insurance payment applied to it and cannot be {0} until the insurance payment has been deleted.',
              ['deleted']
            ),
            localize.getLocalizedString('OK')
          );
          return;
        }

        //can't close claim if not authorized to close claims
        if (
          currentOpenClaim &&
          !patSecurityService.IsAuthorizedByAbbreviation(soarAuthClaimViewKey)
        ) {
          toastrFactory.error(
            patSecurityService.generateMessage(soarAuthClaimViewKey),
            'Not Authorized'
          );
          return;
        }

        if (currentOpenClaim) {
          var codes = results[4];
          claimServicesPromise.then(function (res) {
            var claimDetail = _.find(res.Value, function (claimDetail) {
              return (
                claimDetail.ServiceTransaction.ServiceTransactionId ===
                serviceTransactionId
              );
            });
            var code = _.find(codes, {
              ServiceCodeId: claimDetail.ServiceTransaction.ServiceCodeId,
            });
            modalFactory
              .ServiceTransactionCrudCloseClaimModal({
                isEdit: false,
                serviceCode: code.Code,
                planPriority: currentOpenClaim.PatientBenefitPlanPriority,
                willAffectFeeScheduleWriteOff:
                  appliedInformation.HasFeeScheduleAdjustment,
                willAffectOtherPayment:
                  appliedInformation.HasNonWriteoffNonInsurancePaymentCredit,
                otherClaimServices: _.chain(res.Value)
                  .map('ServiceTransaction')
                  .reject({ ServiceTransactionId: serviceTransactionId })
                  .value(),
              })
              .then(function (res) {
                var closeClaimDto = {
                  ClaimId: currentOpenClaim.ClaimId,
                  NoInsurancePayment: false,
                  IsEdited: true,
                  UpdateServiceTransactions: true,
                  Note: res.note,
                  DataTag: originalOpenClaim
                    ? originalOpenClaim.DataTag
                    : currentOpenClaim.DataTag,
                };
                closeClaimService
                  .update({ checkDataTag: true }, closeClaimDto)
                  .$promise.then(
                    function () {
                      toastrFactory.success(
                        localize.getLocalizedString(
                          '{0} closed successfully.',
                          ['Claim']
                        ),
                        'Success'
                      );
                      performDeleteAndRecreate(
                        serviceTransactionId,
                        personId,
                        successCallback,
                        currentOpenClaim.ClaimId,
                        res.recreate
                      );
                    },
                    function (error) {
                      if (!(error && error.status === 409)) {
                        toastrFactory.error(
                          localize.getLocalizedString(
                            'Failed to close {0}. Please try again.',
                            ['Claim']
                          ),
                          'Error'
                        );
                      }
                    }
                  );
              });
          });
        } else {
          var message = '';
          if (appliedInformation.HasFeeScheduleAdjustment) {
            message += localize.getLocalizedString(
              'Deleting this service transaction will delete the corresponding fee schedule adjustment.\n'
            );
          }
          message += appliedInformation.HasNonWriteoffNonInsurancePaymentCredit
            ? localize.getLocalizedString(
                "This transaction has a payment or negative adjustment applied to it, deleting it will result in an unapplied amount on {0}'s account. Continue?",
                [$filter('getPatientNameAsPerBestPractice')(patient)]
              )
            : localize.getLocalizedString(
                "Are you sure you want to delete this service code from {0}'s account?",
                [$filter('getPatientNameAsPerBestPractice')(patient)]
              );
          modalFactory
            .ConfirmModal(
              localize.getLocalizedString('Delete {0}', [
                'Service Transaction',
              ]),
              message,
              localize.getLocalizedString('Yes'),
              localize.getLocalizedString('No')
            )
            .then(function () {
              performDeleteAndRecreate(
                serviceTransactionId,
                personId,
                successCallback
              );
            });
        }
      });
    };

    var performDeleteAndRecreate = function (
      serviceTransactionId,
      personId,
      successCallback,
      claimId,
      recreate
    ) {
      patientServices.ServiceTransactions.markDeleted({
        personId: personId,
        serviceTransactionId: serviceTransactionId,
      }).$promise.then(
        function () {
          toastrFactory.success(
            localize.getLocalizedString('{0} deleted successfully', [
              'Service',
            ]),
            localize.getLocalizedString('Success')
          );
          if (claimId && recreate) {
            patientServices.Claim.recreateMultipleClaims([
              claimId,
            ]).$promise.then(
              function () {
                toastrFactory.success(
                  { Text: '{0} re-created successfully.', Params: ['Claims'] },
                  'Success'
                );
                successCallback();
              },
              function () {
                toastrFactory.error(
                  { Text: 'Failed to re-create {0}.', Params: ['Claims'] },
                  'Error'
                );
              }
            );
          } else {
            successCallback();
          }
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'An error has occurred while deleting the {0}',
              ['service']
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    };

    return {
      viewOrEditServiceTransaction: factory.viewOrEditServiceTransaction,
      deleteServiceTransaction: factory.deleteServiceTransaction,
    };
  },
]);
