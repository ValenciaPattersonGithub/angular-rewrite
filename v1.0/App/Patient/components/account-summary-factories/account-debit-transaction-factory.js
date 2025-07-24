'use strict';

angular.module('Soar.Patient').factory('AccountDebitTransactionFactory', [
  '$q',
  '$filter',
  'toastrFactory',
  'localize',
  'patSecurityService',
  'PatientServices',
  'ModalFactory',
  'NewAdjustmentTypesService',
  'referenceDataService',
  'TimeZoneFactory',
  /**
   *
   * @param {angular.IQService} $q
   * @param {angular.IFilterService} $filter
   * @param {*} toastrFactory
   * @param {*} localize
   * @param {*} patSecurityService
   * @param {*} patientServices
   * @param {*} modalFactory
   * @param {*} adjustmentTypesService
   * @param {{ getData: (name: string) => angular.IPromise<any>; entityNames: Record<string, string>; }} referenceDataService
   * @param {*} timeZoneFactory
   * @returns
   */
  function (
    $q,
    $filter,
    toastrFactory,
    localize,
    patSecurityService,
    patientServices,
    modalFactory,
    adjustmentTypesService,
    referenceDataService,
    timeZoneFactory
  ) {
    var factory = this;
    var soarAuthDbtTrViewKey = 'soar-acct-dbttrx-view';
    var soarAuthDbtTrEditKey = 'soar-acct-dbttrx-edit';
    var soarAuthDbtTrDeleteKey = 'soar-acct-dbttrx-delete';

    factory.viewOrEditDebit = function (
      debitTransactionId,
      personId,
      isEdit,
      successCallback
    ) {
      if (
        isEdit &&
        !patSecurityService.IsAuthorizedByAbbreviation(soarAuthDbtTrEditKey)
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthDbtTrEditKey),
          'Not Authorized'
        );
        return;
      } else if (
        !patSecurityService.IsAuthorizedByAbbreviation(soarAuthDbtTrViewKey)
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthDbtTrViewKey),
          'Not Authorized'
        );
        return;
      }
      var promises = [
        patientServices.DebitTransaction.getDebitTransactionById({
          debitTransactionId: debitTransactionId,
        }).$promise,
        adjustmentTypesService.get({ active: false }),
        patientServices.Patients.get({ Id: personId }).$promise,
        referenceDataService.getData(referenceDataService.entityNames.users),
        referenceDataService.getData(
          referenceDataService.entityNames.locations
        ),
      ];

      $q.all(promises).then(function (results) {
        var debitTransaction = results[0].Value;
        var adjustmentTypes = results[1].Value;
        var patient = results[2].Value;

        var allProviders = results[3];
        var enteredByUser = _.find(allProviders, {
          UserId: debitTransaction.EnteredByUserId,
        });
        var allLocations = results[4];
        var ofcLocation = _.find(allLocations, {
          LocationId: debitTransaction.LocationId,
        });
        var locationTimezone = ofcLocation ? ofcLocation.Timezone : '';

        debitTransaction.EnteredByName = '';
        if (!_.isNull(enteredByUser)) {
          debitTransaction.EnteredByName =
            enteredByUser.FirstName +
            ' ' +
            enteredByUser.LastName +
            (enteredByUser.ProfessionalDesignation
              ? ', ' + enteredByUser.ProfessionalDesignation
              : '');
        }

        debitTransaction.LocationNameLine1 = ofcLocation
          ? ofcLocation.NameLine1
          : null;
        debitTransaction.PatientDetailedName = $filter(
          'getPatientNameAsPerBestPractice'
        )(patient);
        debitTransaction.TitleDate = timeZoneFactory
          .ConvertDateToMomentTZ(debitTransaction.DateEntered, locationTimezone)
          .format('MM/DD/YYYY');
        if (!debitTransaction.DateEntered.toLowerCase().endsWith('z')) {
          debitTransaction.DateEntered += 'Z';
        }
        debitTransaction.isPaymentApplied =
          debitTransaction.Amount !== debitTransaction.Balance;
        modalFactory
          .Modal({
            templateUrl:
              'App/Patient/components/transaction-crud/transaction-crud.html',
            keyboard: false,
            windowClass: 'modal-60',
            backdrop: 'static',
            controller: 'TransactionCrudController',
            amfa: soarAuthDbtTrViewKey,
            resolve: {
              DataForModal: function () {
                return {
                  AdjustmentTypes: adjustmentTypes,
                  EditMode: isEdit,
                  Patient: patient,
                  Providers: allProviders,
                  Transaction: debitTransaction,
                };
              },
            },
          })
          .result.then(function () {
            toastrFactory.success(
              localize.getLocalizedString('{0} updated successfully', [
                'Positive Adjustment',
              ]),
              localize.getLocalizedString('Success')
            );
            successCallback();
          });
      });
    };

    //delete
    factory.deleteDebit = function (
      debitTransactionId,
      transactionTypeId,
      successCallback
    ) {
      if (
        !patSecurityService.IsAuthorizedByAbbreviation(soarAuthDbtTrDeleteKey)
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthDbtTrDeleteKey),
          'Not Authorized'
        );
        return;
      }

      patientServices.AccountSummary.getTransactionHistoryDebitDeleteInfo({
        debitTransactionId: debitTransactionId,
      }).$promise.then(function (res) {
        var debitType, deleteThis, message;
        var debitDescription = res.Value.DebitDescription;
        var isVendorPaymentRefund =
          debitDescription.toLowerCase().indexOf(
            'vendor payment refund'
          ) !== -1
            ? true
            : false;
        var header = localize.getLocalizedString('Delete') + ' ';
        if (transactionTypeId !== 6) {
          header += localize.getLocalizedString('Positive Adjustment');
          debitType = localize.getLocalizedString('positive adjustment');
          deleteThis = debitDescription + ' ' + debitType;
        } else {
          debitType = localize.getLocalizedString('Finance Charge');
          header += debitType;
          deleteThis = debitType;
        }

        message = localize.getLocalizedString(
          'Are you sure you want to delete this {0}?',
          [deleteThis]
        );

        if (res.Value.IsPaymentApplied) {
          message =
            localize.getLocalizedString(
              'This {0} has a payment or negative adjustment applied to it. Deleting it will result in an unapplied amount.',
              [debitType]
            ) +
            '\r\n\r\n' +
            message;
        }

        if (isVendorPaymentRefund) {
          message += '\r\n\r\n';
          message += localize.getLocalizedString(
            "This account payment refund originated from a third party. Deleting this payment refund in Fuse will not reverse the refund that was issued by the vendor to the patient."
          )
        }

        modalFactory
          .ConfirmModal(
            header,
            message,
            localize.getLocalizedString('Yes'),
            localize.getLocalizedString('No')
          )
          .then(function () {
            patientServices.DebitTransaction.markDeleted({
              debitTransactionId: debitTransactionId,
            }).$promise.then(
              function () {
                toastrFactory.success(
                  localize.getLocalizedString('{0} deleted successfully', [
                    debitType,
                  ]),
                  localize.getLocalizedString('Success')
                );
                successCallback();
              },
              function () {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'An error occurred while deleting the {0}',
                    [debitType]
                  ),
                  localize.getLocalizedString('Server Error')
                );
              }
            );
          });
      });
    };

    return {
      deleteDebit: factory.deleteDebit,
      viewOrEditDebit: factory.viewOrEditDebit,
    };
  },
]);
